import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchCommonKPIs, fetchKPIChartDataBatch } from "../../../redux/KPI/kpiSlice";
import { addMultiPinAndSave, removeMultiPinAndSave, saveKpiDashboardState } from "../../../redux/KPI/kpiDashboardStateSlice";
import { showTemporaryAlert } from "../../../redux/Alert/alertSlice";
import KPIChartGrid, { CHART_COLORS, formatTimeLocal, getDeltaLineData, roundDisplayValue } from "./KPIChartGrid";
import { isUsecaseAllowed } from "./platformUsecases";
import { QUICK_RANGES, BUCKET_OPTIONS, getEffectiveBucketLabel } from "./KPIExplorerCore";
import useCausecodeWebSocket from "../../../hooks/useCausecodeWebSocket";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue: (b) => ({ ...b, margin: "1px 2px" }),
};

const VIEW_MODES = [
  { label: "Riêng lẻ",   value: "per-kpi",     title: "Mỗi KPI 1 đồ thị (3 cột)" },
  { label: "Gộp chung",  value: "all-in-one",  title: "Gộp tất cả KPI vào 1 đồ thị" },
  { label: "Mỗi hàng",   value: "per-kpi-row", title: "Mỗi KPI 1 hàng (full width)" },
];

// Style cho 1 "card" (chart đang vẽ HOẶC 1 chart đã ghim) khi viewMode = "per-kpi" — luôn cố định ~1/3
// màn hình dù card đó chỉ có 1 KPI, để tile chung với các card khác thành lưới 3 cột (không xếp dọc).
const PER_KPI_TILE_STYLE = {
  flex: "0 0 33.333%",
  maxWidth: "33.333%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "0.5rem",
};

function PinnedMultiChart({ pin, viewMode, chartMode, quickRange, bucketOverride, renderChart = true }) {
  const dispatch = useDispatch();
  const embedKey = useRef(`multi_pin_${pin.id}`);
  const { loadingByKey = {} } = useSelector((s) => s.kpi || {});
  const isLoading = !!loadingByKey[embedKey.current];

  useEffect(() => {
    // Range/Bucket toolbar global áp dụng cho mọi chart (đang vẽ + đã ghim) — chỉ dùng
    // snapshot pin.hours/pin.bucket làm fallback khi chưa có toolbar (không nên xảy ra).
    const hours = QUICK_RANGES.find((r) => r.value === quickRange)?.hours || pin.hours || 24;
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    const effectiveBucket = getEffectiveBucketLabel(hours, bucketOverride || pin.bucket || "auto");
    dispatch(
      fetchKPIChartDataBatch({
        selectedPlatforms: pin.platforms,
        selectedDevice: pin.selectedDevices || [],
        selectedKPIs: pin.selectedKPIs,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        bucket: effectiveBucket === "raw" ? undefined : effectiveBucket,
        embedKey: embedKey.current,
      })
    );
  }, [pin.id, quickRange, bucketOverride]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime WS riêng cho chart đã ghim này — chỉ merge vào embeddedData[embedKey] (global: false)
  useCausecodeWebSocket({
    selectedPlatforms: pin.platforms || [],
    selectedDevices: pin.selectedDevices || [],
    selectedKPIs: pin.selectedKPIs || [],
    global: false,
  });

  const kpiOptions = (pin.selectedKPIs || []).map((k) => ({ label: k, value: k }));
  const isTiled = viewMode === "per-kpi";

  // viewMode "all-in-one": dữ liệu của pin này được gộp vào 1 chart chung ở component cha
  // (AllInOneCombinedChart) — instance này chỉ cần fetch + nhận WS realtime, không tự vẽ.
  if (!renderChart) return null;

  const handleUnpin = () => {
    dispatch(removeMultiPinAndSave(pin.id));
  };

  return (
    <div
      className={isTiled ? undefined : "mb-4"}
      style={
        isTiled
          ? { ...PER_KPI_TILE_STYLE, border: "1px solid #e9ecef", borderRadius: 4 }
          : { borderBottom: "1px solid #dee2e6", paddingBottom: "0.75rem" }
      }
    >
      <div
        className="d-flex align-items-center justify-content-between"
        style={{ marginBottom: 2 }}
      >
        <div
          className="text-truncate"
          style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6c757d" }}
          title={pin.label}
        >
          📌 {pin.label}
        </div>
        <Button
          size="sm"
          variant="outline-danger"
          onClick={handleUnpin}
          title="Bỏ ghim chart này"
          style={{ padding: "0px 6px", lineHeight: 1.4, fontSize: "0.7rem", flexShrink: 0 }}
        >
          ✕ Bỏ ghim
        </Button>
      </div>
      {isLoading ? (
        <div className="text-center py-3 text-muted" style={{ fontSize: "0.85rem" }}>
          <Spinner size="sm" animation="border" className="me-2" />
          Đang tải...
        </div>
      ) : (
        <KPIChartGrid
          selectedKPIs={kpiOptions}
          chartMode={chartMode}
          viewMode={viewMode}
          embedDataKey={embedKey.current}
        />
      )}
    </div>
  );
}

// Gộp KPI của TẤT CẢ chart đang hiển thị (chart "đang vẽ" + mọi chart đã ghim) vào 1 đồ thị
// duy nhất — đọc trực tiếp embeddedData từ store theo từng embedKey, không phụ thuộc vào
// việc KPIChartGrid của từng instance tự vẽ riêng (instance đó bị tắt vẽ qua renderChart=false).
function buildSeriesFromEmbedded(embeddedForKey, kpiValues, sourceLabel, chartMode) {
  const out = [];
  for (const kpi of kpiValues) {
    const rows = embeddedForKey?.[kpi] || [];
    const byDevice = {};
    for (const row of rows) {
      const device = row?.device;
      const ts = Date.parse(row?.timestamp);
      const value = Number(row?.value);
      if (!device || !Number.isFinite(ts) || !Number.isFinite(value)) continue;
      (byDevice[device] ||= []).push({ ts, value });
    }
    for (const dev in byDevice) byDevice[dev].sort((a, b) => a.ts - b.ts);
    const displayData = chartMode === "delta" ? getDeltaLineData(byDevice) : byDevice;
    for (const [device, arr] of Object.entries(displayData)) {
      out.push({
        key: `${sourceLabel}__${kpi}__${device}`,
        name: `${sourceLabel} • ${device} • ${kpi}`,
        data: arr,
      });
    }
  }
  return out;
}

function AllInOneCombinedChart({ tabEmbedKey, hasFetched, selectedKPIs, multiPinned, chartMode }) {
  const { embeddedData = {} } = useSelector((s) => s.kpi || {});

  const sources = useMemo(() => {
    const list = [];
    if (hasFetched && selectedKPIs.length > 0) {
      list.push({ embedKey: tabEmbedKey, label: "Đang vẽ", kpis: selectedKPIs.map((k) => k.value) });
    }
    for (const pin of multiPinned) {
      list.push({ embedKey: `multi_pin_${pin.id}`, label: pin.label, kpis: pin.selectedKPIs || [] });
    }
    return list;
  }, [hasFetched, selectedKPIs, tabEmbedKey, multiPinned]);

  const combinedSeries = useMemo(() => {
    const list = [];
    for (const src of sources) {
      list.push(...buildSeriesFromEmbedded(embeddedData[src.embedKey], src.kpis, src.label, chartMode));
    }
    return list;
  }, [sources, embeddedData, chartMode]);

  const [visibleSeriesKeys, setVisibleSeriesKeys] = useState([]);
  const [showAll, setShowAll] = useState(true);
  useEffect(() => {
    setVisibleSeriesKeys(combinedSeries.map((s) => s.key));
    setShowAll(true);
  }, [combinedSeries]);

  const toggleSeries = (key) =>
    setVisibleSeriesKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleAll = () => {
    setVisibleSeriesKeys(showAll ? [] : combinedSeries.map((s) => s.key));
    setShowAll(!showAll);
  };

  if (combinedSeries.length === 0) {
    return <div className="text-muted text-center py-4">Chưa có dữ liệu để vẽ biểu đồ.</div>;
  }

  return (
    <div className="mb-4">
      <ResponsiveContainer width="100%" height={660}>
        <LineChart margin={{ top: 20, right: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="ts" scale="time" domain={["dataMin", "dataMax"]}
            tickFormatter={(ts) => formatTimeLocal(ts)} angle={-45} textAnchor="end" />
          <YAxis tickFormatter={roundDisplayValue} />
          <Tooltip labelFormatter={(ts) => `⏱ ${formatTimeLocal(ts, true)} (ICT)`}
            formatter={(value, name) => [roundDisplayValue(value), name]} />
          {combinedSeries.map((s, idx) =>
            visibleSeriesKeys.includes(s.key) ? (
              <Line key={s.key} type="monotone" data={s.data} dataKey="value" name={s.name}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]} dot={{ r: 1 }} strokeWidth={2}
                isAnimationActive={false} />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="d-flex flex-wrap align-items-center gap-1 mt-2" style={{ fontSize: "12px" }}>
        <Button size="sm" variant="outline-secondary" onClick={toggleAll}
          title={showAll ? "Ẩn tất cả" : "Hiện tất cả"}
          style={{ padding: "2px 6px", flexShrink: 0 }}>👁️</Button>
        {combinedSeries.map((s, idx) => {
          const visible = visibleSeriesKeys.includes(s.key);
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          return (
            <span key={s.key} onClick={() => toggleSeries(s.key)} title={s.name}
              style={{
                cursor: "pointer", padding: "2px 8px", borderRadius: "12px",
                border: `1px solid ${color}`,
                color: visible ? "#fff" : "#999",
                background: visible ? color : "transparent",
                whiteSpace: "nowrap", userSelect: "none", transition: "all 0.15s",
              }}>{s.name}</span>
          );
        })}
      </div>
    </div>
  );
}

export default function MultiPlatformKPITab() {
  const dispatch = useDispatch();
  // embedKey cố định theo vòng đời component — tách biệt khỏi single-platform tabs
  const tabEmbedKey = useRef(uuidv4());

  const { platformSchema = {} } = useSelector((s) => s.pscore || {});
  const { devicesByPlatform = {} } = useSelector((s) => s.platformDevice || {});
  const { commonKPIs = { kpis: [], loading: false, error: null }, loadingByKey = {} } =
    useSelector((s) => s.kpi || {});

  const isChartLoading = !!loadingByKey[tabEmbedKey.current];
  const { multiPinned = [], multiState, loaded: dbLoaded } = useSelector((s) => s.kpiDashboardState || {});

  // ─── Selections ─────────────────────────────────────────────────────────────
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [requireAll, setRequireAll] = useState(true);

  // ─── Chart controls ──────────────────────────────────────────────────────────
  const [quickRange, setQuickRange] = useState("12h");
  const [bucketOverride, setBucketOverride] = useState("raw");
  const [chartMode, setChartMode] = useState("absolute");
  const [viewMode, setViewMode] = useState("per-kpi");

  // ─── Pin ─────────────────────────────────────────────────────────────────────
  const [pinLabel, setPinLabel] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ─── DB restore / auto-save ──────────────────────────────────────────────────
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!dbLoaded || restoredRef.current) return;
    restoredRef.current = true;
    if (!multiState?.selectedPlatforms?.length) return;

    const { selectedPlatforms: plats, selectedDevices: devs, selectedKPIs: kpis,
            requireAll: ra, quickRange: qr, bucketOverride: bo, chartMode: cm, viewMode: vm } = multiState;

    setSelectedPlatforms(plats || []);
    setSelectedDevices(devs || []);
    setSelectedKPIs(kpis || []);
    if (ra !== undefined) setRequireAll(ra);
    if (qr) setQuickRange(qr);
    if (bo) setBucketOverride(bo);
    if (cm) setChartMode(cm);
    if (vm) setViewMode(vm);

    for (const { value: plat } of (plats || [])) {
      dispatch(fetchDevicesByPlatform(plat));
    }
    if ((plats || []).length >= 2) {
      dispatch(fetchCommonKPIs({ platforms: plats.map((p) => p.value), requireAll: ra ?? true }));
    }
    if ((kpis || []).length > 0) {
      const hours = QUICK_RANGES.find((r) => r.value === (qr || "12h"))?.hours || 12;
      const end = new Date();
      const start = new Date(end.getTime() - hours * 3600 * 1000);
      const effectiveBucket = getEffectiveBucketLabel(hours, bo || "auto");
      dispatch(fetchKPIChartDataBatch({
        selectedPlatforms: plats.map((p) => p.value),
        selectedDevice: (devs || []).map((d) => d.value),
        selectedKPIs: kpis.map((k) => k.value),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        bucket: effectiveBucket === "raw" ? undefined : effectiveBucket,
        embedKey: tabEmbedKey.current,
      }));
      setHasFetched(true);
    }
  }, [dbLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!dbLoaded || !restoredRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      dispatch(saveKpiDashboardState({
        multi_state: { selectedPlatforms, selectedDevices, selectedKPIs,
                       requireAll, quickRange, bucketOverride, chartMode, viewMode },
      }));
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [selectedPlatforms, selectedDevices, selectedKPIs, requireAll, quickRange,
      bucketOverride, chartMode, viewMode, dbLoaded, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-refetch khi range/bucket thay đổi (giống single-platform) ─────────
  useEffect(() => {
    if (!hasFetched || !selectedPlatforms.length || !selectedKPIs.length) return;
    const hours = QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 24;
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    const effectiveBucket = getEffectiveBucketLabel(hours, bucketOverride);
    dispatch(fetchKPIChartDataBatch({
      selectedPlatforms: selectedPlatforms.map((p) => p.value),
      selectedDevice: selectedDevices.map((d) => d.value),
      selectedKPIs: selectedKPIs.map((k) => k.value),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: effectiveBucket === "raw" ? undefined : effectiveBucket,
      embedKey: tabEmbedKey.current,
    }));
  }, [quickRange, bucketOverride]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Realtime WS cho chart đang vẽ — chỉ merge vào embeddedData[tabEmbedKey] (global: false) ─
  useCausecodeWebSocket({
    selectedPlatforms: selectedPlatforms.map((p) => p.value),
    selectedDevices: selectedDevices.map((d) => d.value),
    selectedKPIs: selectedKPIs.map((k) => k.value),
    global: false,
  });

  // ─── Platform options — flatten schema, chỉ lấy platform pgw có usecase kpi ─
  const platformOptions = useMemo(() => {
    const opts = [];
    for (const subsystems of Object.values(platformSchema)) {
      for (const platforms of Object.values(subsystems)) {
        if (!Array.isArray(platforms)) continue;
        for (const p of platforms) {
          if (p.toLowerCase().includes("pgw") && isUsecaseAllowed(p, "kpi")) {
            opts.push({ label: p, value: p });
          }
        }
      }
    }
    return opts;
  }, [platformSchema]);

  // ─── Fetch devices khi platform thay đổi ────────────────────────────────────
  useEffect(() => {
    for (const { value: plat } of selectedPlatforms) {
      if (!devicesByPlatform[plat]) {
        dispatch(fetchDevicesByPlatform(plat));
      }
    }
  }, [selectedPlatforms, devicesByPlatform, dispatch]);

  // ─── Device options — grouped by platform ───────────────────────────────────
  const deviceOptions = useMemo(
    () =>
      selectedPlatforms.map(({ value: plat }) => ({
        label: plat,
        options: (devicesByPlatform[plat] || []).map((d) => ({
          label: `${d.name} (${d.ip || "no-ip"})`,
          value: d.name,
        })),
      })),
    [selectedPlatforms, devicesByPlatform]
  );

  // ─── KPI options ─────────────────────────────────────────────────────────────
  const kpiOptions = useMemo(
    () => commonKPIs.kpis.map((k) => ({ label: k, value: k })),
    [commonKPIs.kpis]
  );

  // ─── Device select-all helpers ───────────────────────────────────────────────
  const allDeviceOptions = useMemo(
    () => deviceOptions.flatMap((group) => group.options),
    [deviceOptions]
  );
  const allSelected = allDeviceOptions.length > 0 && selectedDevices.length === allDeviceOptions.length;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handlePlatformChange = (opts) => {
    setSelectedPlatforms(opts || []);
    setSelectedKPIs([]); // reset KPI khi đổi platform
  };

  const handleFindCommonKPIs = () => {
    if (selectedPlatforms.length < 2) return;
    setSelectedKPIs([]);
    dispatch(
      fetchCommonKPIs({
        platforms: selectedPlatforms.map((p) => p.value),
        requireAll,
      })
    );
  };

  function buildTimeWindow() {
    const hours = QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 24;
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  const handleFetchChart = () => {
    if (!selectedPlatforms.length || !selectedKPIs.length) return;
    const { startDate, endDate } = buildTimeWindow();
    const hours = QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 24;
    const effectiveBucket = getEffectiveBucketLabel(hours, bucketOverride);
    dispatch(
      fetchKPIChartDataBatch({
        selectedPlatforms: selectedPlatforms.map((p) => p.value),
        selectedDevice: selectedDevices.map((d) => d.value),
        selectedKPIs: selectedKPIs.map((k) => k.value),
        startDate,
        endDate,
        bucket: effectiveBucket === "raw" ? undefined : effectiveBucket,
        embedKey: tabEmbedKey.current,
      })
    );
    setHasFetched(true);
    setShowModal(false);
  };

  const handlePin = () => {
    if (!selectedPlatforms.length || !selectedKPIs.length) return;
    const pinConfig = {
      id: uuidv4(),
      label:
        pinLabel.trim() ||
        `${selectedPlatforms.map((p) => p.value).join(" + ")} — ${selectedKPIs.length} KPIs`,
      platforms: selectedPlatforms.map((p) => p.value),
      selectedKPIs: selectedKPIs.map((k) => k.value),
      selectedDevices: selectedDevices.map((d) => d.value),
      bucket: bucketOverride,
      hours: QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 24,
    };
    dispatch(addMultiPinAndSave(pinConfig));
    dispatch(
      showTemporaryAlert({ type: "success", message: "Đã ghim chart.", timeout: 2500 })
    );
    setPinLabel("");
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "12px 16px" }}>

      {/* Compact single-row toolbar */}
      <div
        className="d-flex align-items-center flex-nowrap gap-2 mb-3"
        style={{ overflowX: "auto", paddingBottom: 2 }}
      >
        <Button size="sm" variant="outline-primary" onClick={() => setShowModal(true)} style={{ whiteSpace: "nowrap" }}>
          📊 Multi-PGW Explorer
        </Button>

        <div style={{ width: 1, height: 22, background: "#dee2e6", flexShrink: 0 }} />

        <small className="text-muted" style={{ whiteSpace: "nowrap" }}>Range:</small>
        <div className="btn-group btn-group-sm" style={{ flexShrink: 0 }}>
          {QUICK_RANGES.map((r) => (
            <Button
              key={r.value}
              variant={quickRange === r.value ? "primary" : "outline-primary"}
              onClick={() => setQuickRange(r.value)}
            >{r.label}</Button>
          ))}
        </div>

        <div style={{ width: 1, height: 22, background: "#dee2e6", flexShrink: 0 }} />

        <small className="text-muted" style={{ whiteSpace: "nowrap" }}>Bucket:</small>
        <div className="btn-group btn-group-sm" style={{ flexShrink: 0 }}>
          {BUCKET_OPTIONS.map((b) => (
            <Button
              key={b.value}
              variant={bucketOverride === b.value ? "success" : "outline-success"}
              onClick={() => setBucketOverride(b.value)}
            >{b.label}</Button>
          ))}
        </div>
        {bucketOverride === "auto" && (
          <small className="text-muted" style={{ whiteSpace: "nowrap" }}>
            → {getEffectiveBucketLabel(QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 24, "auto")}
          </small>
        )}

        <div style={{ width: 1, height: 22, background: "#dee2e6", flexShrink: 0 }} />

        <div className="btn-group btn-group-sm" role="group" style={{ flexShrink: 0 }}>
          <Button
            variant={chartMode === "absolute" ? "primary" : "outline-primary"}
            onClick={() => setChartMode("absolute")}
          >Absolute</Button>
          <Button
            variant={chartMode === "delta" ? "primary" : "outline-primary"}
            onClick={() => setChartMode("delta")}
          >Delta</Button>
        </div>
        <div className="btn-group btn-group-sm" role="group" style={{ flexShrink: 0 }}>
          {VIEW_MODES.map((v) => (
            <Button
              key={v.value}
              variant={viewMode === v.value ? "success" : "outline-success"}
              onClick={() => setViewMode(v.value)}
              title={v.title}
            >{v.label}</Button>
          ))}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>Multi-PGW KPI Explorer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Row 1: Platform / Device / Tìm KPI chung */}
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2 }}>
                Platforms (chọn ≥2 PGW)
              </Form.Label>
              <Select
                isMulti
                closeMenuOnSelect={false}
                styles={SELECT_STYLES}
                options={platformOptions}
                value={selectedPlatforms}
                onChange={handlePlatformChange}
                placeholder="Chọn platforms..."
              />
            </Col>

            <Col md={4}>
              <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 2 }}>
                <Form.Label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 0 }}>
                  Devices
                </Form.Label>
                {allDeviceOptions.length > 0 && (
                  <Button
                    size="sm"
                    variant="link"
                    style={{ fontSize: "0.72rem", padding: 0, lineHeight: 1 }}
                    onClick={() => setSelectedDevices(allSelected ? [] : allDeviceOptions)}
                  >
                    {allSelected ? "Bỏ chọn" : "Chọn tất cả"}
                  </Button>
                )}
              </div>
              <Select
                isMulti
                closeMenuOnSelect={false}
                styles={SELECT_STYLES}
                options={deviceOptions}
                value={selectedDevices}
                onChange={(opts) => setSelectedDevices(opts || [])}
                placeholder="Chọn devices..."
                isDisabled={selectedPlatforms.length === 0}
              />
            </Col>

            <Col md={4}>
              <Form.Label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2 }}>
                KPI chung
              </Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={handleFindCommonKPIs}
                  disabled={selectedPlatforms.length < 2 || commonKPIs.loading}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {commonKPIs.loading ? <Spinner size="sm" animation="border" /> : "Tìm KPI chung"}
                </Button>
                <Form.Check
                  type="checkbox"
                  id="require-all-check"
                  label="Giao đủ"
                  checked={requireAll}
                  onChange={(e) => setRequireAll(e.target.checked)}
                  title="Bỏ chọn để tìm KPI xuất hiện ≥2 platforms thay vì tất cả"
                  style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
                />
              </div>
            </Col>
          </Row>

          {/* Row 2: KPI select */}
          <Row className="g-2 align-items-end mt-2">
            <Col>
              <Form.Label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2 }}>
                KPIs{kpiOptions.length > 0 ? ` (${kpiOptions.length} chung)` : ""}
              </Form.Label>
              <Select
                isMulti
                closeMenuOnSelect={false}
                styles={SELECT_STYLES}
                options={kpiOptions}
                value={selectedKPIs}
                onChange={(opts) => setSelectedKPIs(opts || [])}
                placeholder={kpiOptions.length === 0 ? "Bấm 'Tìm KPI chung' trước..." : "Chọn KPI..."}
                isDisabled={kpiOptions.length === 0}
              />
              {commonKPIs.error && (
                <div style={{ fontSize: "0.75rem", color: "#dc3545", marginTop: 2 }}>{commonKPIs.error}</div>
              )}
              {!commonKPIs.loading && !commonKPIs.error && kpiOptions.length === 0 && selectedPlatforms.length >= 2 && (
                <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: 2 }}>
                  Không có KPI chung — thử bỏ chọn "Giao đủ"
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Form.Control
            size="sm"
            placeholder="Tên chart để ghim..."
            value={pinLabel}
            onChange={(e) => setPinLabel(e.target.value)}
            disabled={!hasFetched || selectedKPIs.length === 0}
            style={{ width: 180 }}
          />
          <Button
            size="sm"
            variant="outline-warning"
            onClick={handlePin}
            disabled={!hasFetched || selectedKPIs.length === 0}
            title={!hasFetched ? "Vẽ đồ thị trước khi ghim" : "Ghim chart này"}
          >
            📌 Ghim
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleFetchChart}
            disabled={!selectedPlatforms.length || !selectedKPIs.length || isChartLoading}
          >
            {isChartLoading ? (
              <><Spinner size="sm" animation="border" className="me-1" />Đang tải...</>
            ) : "Vẽ đồ thị"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/*
        Chart đang vẽ + mọi chart đã ghim — gộp chung 1 container.
        Khi viewMode = "per-kpi": tile thành lưới 3 cột (mỗi card cố định ~1/3 màn hình dù chỉ có
        1 KPI) để KHÔNG bị xếp dọc từng card xuống cột đầu tiên. Các viewMode khác giữ nguyên full-width.
      */}
      {(hasFetched || multiPinned.length > 0) && (
        viewMode === "all-in-one" ? (
          <div className="mt-3">
            <AllInOneCombinedChart
              tabEmbedKey={tabEmbedKey.current}
              hasFetched={hasFetched}
              selectedKPIs={selectedKPIs}
              multiPinned={multiPinned}
              chartMode={chartMode}
            />
            {/* Mount ẩn — vẫn fetch + nhận WS realtime cho từng pin, nhưng không tự vẽ riêng
                (dữ liệu đã được AllInOneCombinedChart gộp chung vào 1 đồ thị ở trên). */}
            {multiPinned.map((pin) => (
              <PinnedMultiChart
                key={pin.id}
                pin={pin}
                viewMode={viewMode}
                chartMode={chartMode}
                quickRange={quickRange}
                bucketOverride={bucketOverride}
                renderChart={false}
              />
            ))}
          </div>
        ) : (
          <div
            className="mt-3"
            style={viewMode === "per-kpi" ? { display: "flex", flexWrap: "wrap" } : undefined}
          >
            {hasFetched && (
              <div
                style={
                  viewMode === "per-kpi"
                    ? { ...PER_KPI_TILE_STYLE, border: "1px solid #cfe2ff", borderRadius: 4 }
                    : { marginBottom: "1rem" }
                }
              >
                {viewMode === "per-kpi" && (
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#0d6efd", marginBottom: 2 }}>
                    📊 Đang vẽ
                  </div>
                )}
                <KPIChartGrid
                  selectedKPIs={selectedKPIs}
                  chartMode={chartMode}
                  viewMode={viewMode}
                  embedDataKey={tabEmbedKey.current}
                  onRemoveKPI={(kpi) => setSelectedKPIs((prev) => prev.filter((k) => k.value !== kpi))}
                />
              </div>
            )}

            {multiPinned.map((pin) => (
              <PinnedMultiChart
                key={pin.id}
                pin={pin}
                viewMode={viewMode}
                chartMode={chartMode}
                quickRange={quickRange}
                bucketOverride={bucketOverride}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
}
