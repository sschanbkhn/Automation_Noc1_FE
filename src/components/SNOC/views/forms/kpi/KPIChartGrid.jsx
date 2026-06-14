import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { togglePinnedKPIAndSave, setPinnedKPIsAndSave } from "../../../redux/KPI/kpiPinnedSlice";

export function formatTimeLocal(ts, withDate = false) {
  const ict = new Date(+ts + 7 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const HH = pad(ict.getUTCHours());
  const MM = pad(ict.getUTCMinutes());
  if (!withDate) return `${HH}:${MM}`;
  const YY = pad(ict.getUTCFullYear() % 100);
  const mo = pad(ict.getUTCMonth() + 1);
  const DD = pad(ict.getUTCDate());
  const SS = pad(ict.getUTCSeconds());
  return `${YY}/${mo}/${DD} ${HH}:${MM}:${SS}`;
}

export const CHART_COLORS = [
  "#2ca02c", "#1f77b4", "#d62728", "#ff7f0e", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
];

function getDeltaLineData(deviceData) {
  const delta = {};
  Object.entries(deviceData).forEach(([dev, arr]) => {
    let prev = null;
    delta[dev] = arr.map((p) => {
      let d = 0;
      if (prev && p.ts > prev.ts) {
        const diff = p.value - prev.value;
        d = diff >= 0 ? diff : 0;
      }
      prev = p;
      return { ...p, value: d };
    });
  });
  return delta;
}

/**
 * Renders KPI charts standalone.
 * Non-embed: reads kpiChartData from Redux.
 * Embed: reads embeddedData[embedKey] from Redux.
 */
export default function KPIChartGrid({
  selectedKPIs = [],
  selectedPlatform = "",
  chartMode = "absolute",
  viewMode = "per-kpi",
  onRemoveKPI,
  // embed-specific
  embed = false,
  embedKey = null,
}) {
  const dispatch = useDispatch();
  const { kpiChartData = {}, embeddedData = {} } = useSelector((s) => s.kpi || {});
  const pinnedByPlatform = useSelector((s) => s.kpiPinned?.pinnedByPlatform || {});

  const groupedChartDataByKPIAndDevice = useMemo(() => {
    const sourceData = embed && embedKey ? (embeddedData[embedKey] || {}) : kpiChartData;
    const groups = {};
    for (const kpi in sourceData) {
      const rows = Array.isArray(sourceData[kpi]) ? sourceData[kpi] : [];
      const byDeviceMinute = {};
      for (const row of rows) {
        const device = row?.device;
        const ts = Date.parse(row?.timestamp);
        if (!device || !Number.isFinite(ts)) continue;
        const tsMin = Math.floor(ts / 60000) * 60000;
        const val = Number(row?.value);
        if (!Number.isFinite(val)) continue;
        const mm = (byDeviceMinute[device] ||= new Map());
        mm.set(tsMin, { ...row, value: val, ts: tsMin });
      }
      const deviceObj = {};
      for (const [dev, minuteMap] of Object.entries(byDeviceMinute)) {
        deviceObj[dev] = Array.from(minuteMap.values()).sort((a, b) => a.ts - b.ts);
      }
      groups[kpi] = deviceObj;
    }
    return groups;
  }, [embed, embedKey, embeddedData, kpiChartData]);

  // ── Legend per-kpi ─────────────────────────────────────────────
  const [visibleDevices, setVisibleDevices] = useState([]);
  const [showAll, setShowAll] = useState(true);
  useEffect(() => {
    const all = new Set();
    for (const kpi in groupedChartDataByKPIAndDevice)
      for (const dev in groupedChartDataByKPIAndDevice[kpi]) all.add(dev);
    setVisibleDevices(Array.from(all));
    setShowAll(true);
  }, [groupedChartDataByKPIAndDevice]);
  const toggleDeviceVisibility = (device) =>
    setVisibleDevices((prev) =>
      prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]
    );
  const toggleAllDevices = () => {
    if (showAll) {
      setVisibleDevices([]);
    } else {
      const all = new Set();
      for (const kpi in groupedChartDataByKPIAndDevice)
        for (const dev in groupedChartDataByKPIAndDevice[kpi]) all.add(dev);
      setVisibleDevices(Array.from(all));
    }
    setShowAll(!showAll);
  };

  // ── Combined series (all-in-one) ───────────────────────────────
  const selectedKpiValues = useMemo(() => selectedKPIs.map((k) => k.value), [selectedKPIs]);
  const combinedSeries = useMemo(() => {
    const list = [];
    selectedKpiValues.forEach((kpi) => {
      const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
      const displayData = chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;
      for (const [device, arr] of Object.entries(displayData))
        list.push({ key: `${kpi}__${device}`, name: `${device} • ${kpi}`, data: arr, kpi, device });
    });
    return list;
  }, [selectedKpiValues, groupedChartDataByKPIAndDevice, chartMode]);

  const [visibleSeriesKeys, setVisibleSeriesKeys] = useState([]);
  const [showAllCombined, setShowAllCombined] = useState(true);
  useEffect(() => {
    setVisibleSeriesKeys(combinedSeries.map((s) => s.key));
    setShowAllCombined(true);
  }, [combinedSeries]);
  const toggleSeriesVisibility = (key) =>
    setVisibleSeriesKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  const toggleAllSeries = () => {
    if (showAllCombined) setVisibleSeriesKeys([]);
    else setVisibleSeriesKeys(combinedSeries.map((s) => s.key));
    setShowAllCombined(!showAllCombined);
  };

  const pinnedSet = useMemo(
    () => new Set(pinnedByPlatform[selectedPlatform] || []),
    [pinnedByPlatform, selectedPlatform]
  );

  if (selectedKPIs.length === 0) return null;

  // ── EMBED mode ─────────────────────────────────────────────────
  if (embed) {
    const kpi = selectedKPIs[0]?.value;
    if (!kpi) return null;
    const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
    const displayData = chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;
    return (
      <Col md={12}>
        {Object.keys(displayData).length === 0 ? (
          <div className="text-muted" style={{ fontSize: "0.8rem", textAlign: "center", paddingTop: 40 }}>
            Chưa có dữ liệu.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart margin={{ top: 8, right: 12, bottom: 42, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="ts" scale="time" domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) => formatTimeLocal(ts)} angle={-45} textAnchor="end" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={42} />
              <Tooltip labelFormatter={(ts) => `⏱ ${formatTimeLocal(ts, true)} (ICT)`}
                formatter={(value, name) => [value, name]} />
              {Object.entries(displayData).map(([device, data], index) =>
                visibleDevices.includes(device) ? (
                  <Line key={device} type="monotone" data={data} dataKey="value" name={device}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]} dot={{ r: 1 }} strokeWidth={2}
                    isAnimationActive={false} />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Col>
    );
  }

  // ── ALL-IN-ONE ──────────────────────────────────────────────────
  if (viewMode === "all-in-one") {
    return (
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="mb-2 d-flex flex-wrap gap-2">
                {selectedKPIs.map((k) => (
                  <span key={k.value} className="badge text-bg-light">
                    {k.label}{" "}
                    <span role="button"
                      onClick={() => {
                        dispatch(togglePinnedKPIAndSave({ platform: selectedPlatform, kpi: k.value }));
                      }}
                      style={{ marginLeft: 6, cursor: "pointer", opacity: pinnedSet.has(k.value) ? 1 : 0.4 }}
                      title={pinnedSet.has(k.value) ? "Bỏ ghim KPI này" : "Ghim KPI này"}
                    >📌</span>
                    <span role="button" onClick={() => onRemoveKPI?.(k.value)}
                      style={{ marginLeft: 6, cursor: "pointer" }} title="Bỏ KPI này">✕</span>
                  </span>
                ))}
              </div>

              {combinedSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height={660}>
                  <LineChart margin={{ top: 20, right: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="ts" scale="time" domain={["dataMin", "dataMax"]}
                      tickFormatter={(ts) => formatTimeLocal(ts)} angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip labelFormatter={(ts) => `⏱ ${formatTimeLocal(ts, true)} (ICT)`}
                      formatter={(value, name) => [value, name]} />
                    {combinedSeries.map((s, idx) =>
                      visibleSeriesKeys.includes(s.key) ? (
                        <Line key={s.key} type="monotone" data={s.data} dataKey="value" name={s.name}
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]} dot={{ r: 1 }} strokeWidth={2}
                          isAnimationActive={false} />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted">Chưa có dữ liệu để vẽ biểu đồ.</div>
              )}

              <div className="d-flex flex-wrap align-items-center gap-1 mt-3" style={{ fontSize: "12px" }}>
                <Button size="sm" variant="outline-secondary" onClick={toggleAllSeries}
                  title={showAllCombined ? "Ẩn tất cả" : "Hiện tất cả"}
                  style={{ padding: "2px 6px", flexShrink: 0 }}>👁️</Button>
                {combinedSeries.map((s, idx) => {
                  const visible = visibleSeriesKeys.includes(s.key);
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <span key={s.key} onClick={() => toggleSeriesVisibility(s.key)}
                      title={s.name}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        border: `1px solid ${color}`,
                        color: visible ? "#fff" : "#999",
                        background: visible ? color : "transparent",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        transition: "all 0.15s",
                      }}>{s.name}</span>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  // ── PER-KPI-ROW (full width, 1 chart per row) ─────────────────
  if (viewMode === "per-kpi-row") {
    return (
      <Row>
        {selectedKPIs.map((kpiObj) => {
          const kpi = kpiObj.value;
          const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
          const displayData = chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;
          return (
            <Col md={12} key={kpi} className="mb-3">
              <Card className="position-relative">
                <Button variant="light" size="sm" onClick={() => onRemoveKPI?.(kpi)}
                  style={{ position: "absolute", top: 8, right: 8, lineHeight: "1", border: "1px solid #ddd" }}
                  title="Đóng chart & bỏ chọn KPI này">✕</Button>
                <Card.Body>
                  <h6 className="mb-2">KPI: <i>{kpi}</i></h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart margin={{ top: 10, right: 20, bottom: 50, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="ts" scale="time" domain={["dataMin", "dataMax"]}
                        tickFormatter={(ts) => formatTimeLocal(ts)} angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip labelFormatter={(ts) => `⏱ ${formatTimeLocal(ts, true)} (ICT)`}
                        formatter={(value, name) => [value, name]} />
                      {Object.entries(displayData).map(([device, data], index) =>
                        visibleDevices.includes(device) ? (
                          <Line key={device} type="monotone" data={data} dataKey="value" name={device}
                            stroke={CHART_COLORS[index % CHART_COLORS.length]} dot={{ r: 1 }} strokeWidth={2}
                            isAnimationActive={false} />
                        ) : null
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-wrap align-items-center gap-1 mt-2" style={{ fontSize: "11px" }}>
                    <Button size="sm" variant="outline-secondary" onClick={toggleAllDevices}
                      title={showAll ? "Ẩn tất cả" : "Hiện tất cả"}
                      style={{ padding: "2px 6px", flexShrink: 0 }}>👁️</Button>
                    {Object.keys(deviceData).map((device, index) => {
                      const isVisible = visibleDevices.includes(device);
                      const color = CHART_COLORS[index % CHART_COLORS.length];
                      return (
                        <span key={device} onClick={() => toggleDeviceVisibility(device)}
                          title={device}
                          style={{
                            cursor: "pointer", padding: "2px 8px", borderRadius: "12px",
                            border: `1px solid ${color}`,
                            color: isVisible ? "#fff" : "#999",
                            background: isVisible ? color : "transparent",
                            whiteSpace: "nowrap", userSelect: "none", transition: "all 0.15s",
                          }}>{device}</span>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  }

  // ── PER-KPI (default, 3 cột) ───────────────────────────────────
  return (
    <Row>
      {selectedKPIs.map((kpiObj) => {
        const kpi = kpiObj.value;
        const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
        const displayData = chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;
        return (
          <Col md={4} key={kpi} className="mb-4">
            <Card className="position-relative">
              <Button variant="light" size="sm" onClick={() => onRemoveKPI?.(kpi)}
                style={{ position: "absolute", top: 8, right: 8, lineHeight: "1", border: "1px solid #ddd" }}
                title="Đóng chart & bỏ chọn KPI này">✕</Button>
              <Card.Body>
                <h6 className="mb-2">KPI: <i>{kpi}</i></h6>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart margin={{ top: 20, right: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="ts" scale="time" domain={["dataMin", "dataMax"]}
                      tickFormatter={(ts) => formatTimeLocal(ts)} angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip labelFormatter={(ts) => `⏱ ${formatTimeLocal(ts, true)} (ICT)`}
                      formatter={(value, name) => [value, name]} />
                    {Object.entries(displayData).map(([device, data], index) =>
                      visibleDevices.includes(device) ? (
                        <Line key={device} type="monotone" data={data} dataKey="value" name={device}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]} dot={{ r: 1 }} strokeWidth={2}
                          isAnimationActive={false} />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>
                <div className="d-flex flex-wrap align-items-center gap-1 mt-2" style={{ fontSize: "11px" }}>
                  <Button size="sm" variant="outline-secondary" onClick={toggleAllDevices}
                    title={showAll ? "Ẩn tất cả" : "Hiện tất cả"}
                    style={{ padding: "2px 6px", flexShrink: 0 }}>👁️</Button>
                  {Object.keys(deviceData).map((device, index) => {
                    const isVisible = visibleDevices.includes(device);
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    return (
                      <span key={device} onClick={() => toggleDeviceVisibility(device)}
                        title={device}
                        style={{
                          cursor: "pointer",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          border: `1px solid ${color}`,
                          color: isVisible ? "#fff" : "#999",
                          background: isVisible ? color : "transparent",
                          whiteSpace: "nowrap",
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}>{device}</span>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
