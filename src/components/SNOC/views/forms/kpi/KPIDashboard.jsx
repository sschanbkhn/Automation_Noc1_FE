import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import { fetchPlatformGroupSchema } from "../../../redux/Healthcheck/healthcheckSlice";
import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchAvailableKPIs, fetchKPIChartDataBatch } from "../../../redux/KPI/kpiSlice";
import { fetchLatestForPinnedKpis } from "../../../redux/KPI/kpiPinnedSlice";
import {
  fetchKpiDashboardState,
  saveKpiDashboardState,
} from "../../../redux/KPI/kpiDashboardStateSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import useCausecodeWebSocket from "../../../hooks/useCausecodeWebSocket";
import { isUsecaseAllowed } from "./platformUsecases";
import KPIChartGrid from "./KPIChartGrid";
import KPIExplorerCore, {
  QUICK_RANGES,
  BUCKET_OPTIONS,
  getEffectiveBucketLabel,
} from "./KPIExplorerCore";
import MultiPlatformKPITab from "./MultiPlatformKPITab";

const KPI_GROUP = "kpi";
const MULTI_TAB_KEY = "__multi_pgw__";

// ─── PlatformBar ─────────────────────────────────────────────────────────────
function PlatformBar({ filteredTree, openTabs, onOpenTab, onOpenMultiTab }) {
  const groups = Object.entries(filteredTree);
  const isMultiOpen = openTabs.some((t) => t.platform === MULTI_TAB_KEY);
  return (
    <div
      style={{
        overflowX: "auto",
        borderBottom: "1px solid #dee2e6",
        background: "#f8f9fa",
        padding: "8px 16px",
      }}
    >
      {groups.length === 0 ? (
        <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>Không có platform KPI nào.</div>
      ) : (
        groups.map(([group, subsystems]) => (
          <div key={group} className="d-flex align-items-center flex-wrap gap-1 mb-1">
            <span
              style={{
                fontSize: "0.72rem",
                color: "#6c757d",
                fontWeight: 600,
                marginRight: 4,
                whiteSpace: "nowrap",
              }}
            >
              {group}:
            </span>
            {Object.entries(subsystems).flatMap(([sub, platforms]) =>
              platforms.map((platform) => {
                const isOpen = openTabs.some((t) => t.platform === platform);
                return (
                  <Button
                    key={platform}
                    size="sm"
                    variant={isOpen ? "primary" : "outline-secondary"}
                    onClick={() => onOpenTab({ group, subsystem: sub, platform })}
                    style={{ fontSize: "0.75rem", padding: "2px 8px", whiteSpace: "nowrap" }}
                  >
                    {platform}
                  </Button>
                );
              })
            )}
          </div>
        ))
      )}
      <div className="d-flex align-items-center gap-1 mt-1">
        <span style={{ fontSize: "0.72rem", color: "#6c757d", fontWeight: 600, marginRight: 4 }}>
          Multi:
        </span>
        <Button
          size="sm"
          variant={isMultiOpen ? "success" : "outline-success"}
          onClick={onOpenMultiTab}
          style={{ fontSize: "0.75rem", padding: "2px 8px", whiteSpace: "nowrap" }}
        >
          📊 Multi-PGW
        </Button>
      </div>
    </div>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────
function TabBar({ openTabs, activeTab, onActivate, onClose }) {
  return (
    <div
      className="d-flex align-items-stretch"
      style={{
        borderBottom: "2px solid #dee2e6",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{ overflowX: "auto", flex: 1, padding: "0 8px" }}
      >
        {openTabs.map((tab) => {
          const isActive = activeTab === tab.platform;
          return (
            <div
              key={tab.platform}
              className="d-flex align-items-center"
              onClick={() => onActivate(tab.platform)}
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderBottom: isActive ? "2px solid #0d6efd" : "2px solid transparent",
                marginBottom: -2,
                color: isActive ? "#0d6efd" : "#495057",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.82rem",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {tab.isMulti ? "Multi-PGW" : tab.platform}
              <span
                onClick={(e) => { e.stopPropagation(); onClose(tab.platform); }}
                style={{ marginLeft: 6, fontSize: "0.7rem", color: "#adb5bd", cursor: "pointer", lineHeight: 1 }}
              >
                ✕
              </span>
            </div>
          );
        })}
        {openTabs.length === 0 && (
          <span style={{ fontSize: "0.8rem", color: "#adb5bd", padding: "6px 12px" }}>
            Click platform bên trên để mở tab
          </span>
        )}
      </div>
    </div>
  );
}

// ─── KPIDashboard (default export) ───────────────────────────────────────────
export default function KPIDashboard() {
  const dispatch = useDispatch();
  const platformSchema = useSelector((s) => s.pscore.platformSchema || {});
  const pinnedByPlatform = useSelector((s) => s.kpiPinned?.pinnedByPlatform || {});
  const savedDevicesByPlatform = useSelector((s) => s.kpiPinned?.savedDevicesByPlatform || {});
  const userId = useSelector((s) => s.account?.user?.id ?? null);
  const pinnedRef = useRef(pinnedByPlatform);
  useEffect(() => { pinnedRef.current = pinnedByPlatform; }, [pinnedByPlatform]);

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabChartParams, setTabChartParams] = useState({});
  const [showExplorer, setShowExplorer] = useState(false);
  const [quickRange, setQuickRange] = useState("12h");
  const [bucketOverride, setBucketOverride] = useState("raw");

  const { singleState, loaded: dbLoaded } = useSelector((s) => s.kpiDashboardState || {});

  // Load DB state khi có userId
  const initializedForRef = useRef(null);
  useEffect(() => {
    if (!userId || initializedForRef.current === userId) return;
    initializedForRef.current = userId;
    dispatch(fetchKpiDashboardState());
    try {
      localStorage.removeItem("kpidash_tabs");
      localStorage.removeItem("kpidash_active");
      localStorage.removeItem("kpidash_chart_params");
    } catch {}
  }, [userId, dispatch]);

  // Populate state từ DB (chạy 1 lần sau khi loaded)
  const populatedRef = useRef(false);
  useEffect(() => {
    if (!dbLoaded || populatedRef.current) return;
    populatedRef.current = true;

    const tabs   = singleState?.openTabs      || [];
    const params = singleState?.tabChartParams || {};

    // Migration: nếu DB rỗng nhưng localStorage còn dữ liệu cũ
    if (tabs.length === 0) {
      try {
        const legacyTabs   = JSON.parse(localStorage.getItem(`kpidash_tabs_${userId}`)         || "null");
        const legacyActive = localStorage.getItem(`kpidash_active_${userId}`);
        const legacyParams = JSON.parse(localStorage.getItem(`kpidash_chart_params_${userId}`) || "null");
        if (legacyTabs?.length) {
          dispatch(saveKpiDashboardState({
            single_state: { openTabs: legacyTabs, activeTab: legacyActive, tabChartParams: legacyParams || {} },
          }));
          setOpenTabs(legacyTabs);
          setActiveTab(legacyActive || null);
          setTabChartParams(legacyParams || {});
          ["tabs", "active", "chart_params"].forEach((k) =>
            localStorage.removeItem(`kpidash_${k}_${userId}`)
          );
          return;
        }
      } catch {}
    }

    setOpenTabs(tabs);
    setActiveTab(singleState?.activeTab || null);
    setTabChartParams(params);
  }, [dbLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce save lên DB mỗi khi tabs/params thay đổi
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!dbLoaded || !populatedRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      dispatch(saveKpiDashboardState({
        single_state: {
          openTabs,
          activeTab: openTabs.some((t) => t.platform === activeTab) ? activeTab : (openTabs[0]?.platform || null),
          tabChartParams,
        },
      }));
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [openTabs, activeTab, tabChartParams, dbLoaded, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // WS realtime
  const activeParams = tabChartParams[activeTab] || {};
  useCausecodeWebSocket({
    selectedPlatform: activeParams.selectedPlatform || activeTab || "",
    selectedDevices: activeParams.selectedDevices || [],
    selectedKPIs: activeParams.selectedKPIs || [],
  });

  const quickRangeRef = useRef(quickRange);
  const bucketOverrideRef = useRef(bucketOverride);
  useEffect(() => { quickRangeRef.current = quickRange; }, [quickRange]);
  useEffect(() => { bucketOverrideRef.current = bucketOverride; }, [bucketOverride]);

  function buildTimeWindow() {
    const rangeHours = QUICK_RANGES.find((r) => r.value === quickRangeRef.current)?.hours || 72;
    const end = new Date();
    const start = new Date(end.getTime() - rangeHours * 60 * 60 * 1000);
    return { start, end };
  }

  function buildBucketParam() {
    return bucketOverrideRef.current === "auto" ? undefined : bucketOverrideRef.current;
  }

  // Auto-init/restore khi chuyển tab
  useEffect(() => {
    if (!activeTab || activeTab === MULTI_TAB_KEY) return;
    let cancelled = false;

    async function run() {
      const { start, end } = buildTimeWindow();

      const saved = tabChartParams[activeTab];
      if (saved?.selectedKPIs?.length) {
        dispatch(fetchKPIChartDataBatch({
          selectedPlatform: saved.selectedPlatform,
          selectedDevice: saved.selectedDevices?.map((d) => d.value),
          selectedKPIs: saved.selectedKPIs.map((k) => k.value),
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          bucket: buildBucketParam(),
        }));
        return;
      }

      const devices = await dispatch(fetchDevicesByPlatform(activeTab)).unwrap().catch(() => []);
      if (cancelled || !devices.length) return;

      const kpis = await dispatch(fetchAvailableKPIs({
        selectedPlatform: activeTab,
        selectedDevices: devices.map((d) => d.name),
      })).unwrap().then((r) => r?.kpis || []).catch(() => []);
      if (cancelled || !kpis.length) return;

      const pinned = (pinnedRef.current[activeTab] || []).filter((k) => kpis.includes(k));
      if (!pinned.length) return;

      const kpiKeys = pinned.slice(0, 5);

      dispatch(fetchKPIChartDataBatch({
        selectedPlatform: activeTab,
        selectedDevice: devices.map((d) => d.name),
        selectedKPIs: kpiKeys,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        bucket: buildBucketParam(),
      }));

      if (!cancelled) {
        setTabChartParams((prev) => ({
          ...prev,
          [activeTab]: {
            selectedPlatform: activeTab,
            selectedKPIs: kpiKeys.map((k) => ({ label: k, value: k })),
            selectedDevices: devices.map((d) => ({
              label: `${d.name} (${d.ip || "no-ip"})`,
              value: d.name,
            })),
            chartMode: "absolute",
            viewMode: "per-kpi",
          },
        }));
      }
    }

    run();
    return () => { cancelled = true; };
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refetch khi range/bucket thay đổi
  useEffect(() => {
    if (!activeTab || activeTab === MULTI_TAB_KEY || quickRange === "custom") return;
    const saved = tabChartParams[activeTab];
    if (!saved?.selectedKPIs?.length) return;

    const { start, end } = buildTimeWindow();
    dispatch(fetchKPIChartDataBatch({
      selectedPlatform: saved.selectedPlatform,
      selectedDevice: saved.selectedDevices?.map((d) => d.value),
      selectedKPIs: saved.selectedKPIs.map((k) => k.value),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: buildBucketParam(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickRange, bucketOverride]);

  useEffect(() => { setShowExplorer(false); }, [activeTab]);

  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
  }, [dispatch]);

  useEffect(() => {
    if (openTabs.length === 0) return;
    openTabs.forEach(({ platform }) => {
      const devices = savedDevicesByPlatform[platform];
      if (!devices?.length) return;
      dispatch(fetchLatestForPinnedKpis({ platform, devices }));
    });
  }, [openTabs, savedDevicesByPlatform, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTree = useMemo(() => {
    const out = {};
    for (const [group, subsystems] of Object.entries(platformSchema)) {
      for (const [sub, platforms] of Object.entries(subsystems)) {
        if (!Array.isArray(platforms)) continue;
        const kpiPlatforms = platforms.filter((p) => isUsecaseAllowed(p, "kpi"));
        if (kpiPlatforms.length > 0) {
          if (!out[group]) out[group] = {};
          out[group][sub] = kpiPlatforms;
        }
      }
    }
    return out;
  }, [platformSchema]);

  const activeTabData = openTabs.find((t) => t.platform === activeTab) || null;

  const handleOpenTab = ({ group, subsystem, platform }) => {
    if (!openTabs.find((t) => t.platform === platform)) {
      setOpenTabs((prev) => [...prev, { group, subsystem, platform }]);
    }
    setActiveTab(platform);
  };

  const handleOpenMultiTab = () => {
    if (!openTabs.find((t) => t.platform === MULTI_TAB_KEY)) {
      setOpenTabs((prev) => [...prev, { isMulti: true, platform: MULTI_TAB_KEY }]);
    }
    setActiveTab(MULTI_TAB_KEY);
  };

  const handleCloseTab = (platform) => {
    const remaining = openTabs.filter((t) => t.platform !== platform);
    setOpenTabs(remaining);
    if (activeTab === platform) {
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].platform : null);
    }
    setTabChartParams((prev) => { const next = { ...prev }; delete next[platform]; return next; });
  };

  const handleRemoveKPI = (kpiValue) => {
    setTabChartParams((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        selectedKPIs: (prev[activeTab]?.selectedKPIs || []).filter((k) => k.value !== kpiValue),
      },
    }));
  };

  const handleChartModeChange = (mode) => {
    if (!activeTab) return;
    setTabChartParams((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], chartMode: mode },
    }));
  };

  const handleViewModeChange = (mode) => {
    if (!activeTab) return;
    setTabChartParams((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], viewMode: mode },
    }));
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <div className="d-flex flex-column" style={{ height: "calc(100vh - 56px)" }}>
        <PlatformBar filteredTree={filteredTree} openTabs={openTabs} onOpenTab={handleOpenTab} onOpenMultiTab={handleOpenMultiTab} />
        <TabBar
          openTabs={openTabs}
          activeTab={activeTab}
          onActivate={setActiveTab}
          onClose={handleCloseTab}
        />

        <div className="flex-grow-1" style={{ overflowY: "auto", padding: 16 }}>
          {!activeTab ? (
            <div className="text-muted text-center mt-5">
              Click platform bên trên để xem chart KPI đã ghim.
            </div>
          ) : activeTabData?.isMulti ? (
            <MultiPlatformKPITab key={MULTI_TAB_KEY} />
          ) : (
            <>
              <nav>
                <ol className="breadcrumb mb-3" style={{ fontSize: "0.85rem" }}>
                  <li className="breadcrumb-item">{activeTabData?.group}</li>
                  <li className="breadcrumb-item">{activeTabData?.subsystem}</li>
                  <li className="breadcrumb-item active">{activeTab}</li>
                </ol>
              </nav>
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <Button variant="outline-primary" onClick={() => setShowExplorer(true)}>
                  📊 Mở KPI Explorer
                </Button>

                <div style={{ width: 1, height: 26, background: "#dee2e6", flexShrink: 0 }} />

                <div className="d-flex align-items-center gap-1">
                  <small className="text-muted" style={{ whiteSpace: "nowrap" }}>Range:</small>
                  <div className="btn-group btn-group-sm">
                    {QUICK_RANGES.map((r) => (
                      <Button
                        key={r.value}
                        variant={quickRange === r.value ? "primary" : "outline-primary"}
                        onClick={() => setQuickRange(r.value)}
                      >{r.label}</Button>
                    ))}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <small className="text-muted" style={{ whiteSpace: "nowrap" }}>Bucket:</small>
                  <div className="btn-group btn-group-sm">
                    {BUCKET_OPTIONS.map((b) => (
                      <Button
                        key={b.value}
                        variant={bucketOverride === b.value ? "success" : "outline-success"}
                        onClick={() => setBucketOverride(b.value)}
                      >{b.label}</Button>
                    ))}
                  </div>
                  {bucketOverride === "auto" && (
                    <small className="text-muted ms-1" style={{ whiteSpace: "nowrap" }}>
                      → {getEffectiveBucketLabel(QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 72, "auto")}
                    </small>
                  )}
                </div>
              </div>

              {showExplorer && (
                <Modal show onHide={() => setShowExplorer(false)} size="xl">
                  <Modal.Header closeButton>
                    <Modal.Title>KPI Explorer — {activeTab}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{ minHeight: "70vh" }}>
                    <KPIExplorerCore
                      key={activeTab}
                      defaultGroup={activeTabData?.group}
                      defaultSubsystem={activeTabData?.subsystem}
                      defaultPlatform={activeTabData?.platform}
                      pinGroup={KPI_GROUP}
                      hideCharts
                      initialQuickRange={quickRange}
                      initialBucketOverride={bucketOverride}
                      onFetch={(params) => {
                        setTabChartParams((prev) => ({ ...prev, [activeTab]: params }));
                        setShowExplorer(false);
                      }}
                    />
                  </Modal.Body>
                </Modal>
              )}

              {!tabChartParams[activeTab] && (
                <div className="text-muted text-center mt-4" style={{ fontSize: "0.875rem" }}>
                  Chưa có KPI nào được chọn. Mở <strong>KPI Explorer</strong> để chọn và xem biểu đồ.
                </div>
              )}

              {tabChartParams[activeTab] && (
                <div className="mb-4">
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <div className="btn-group" role="group" aria-label="Chart value mode">
                      <Button
                        size="sm"
                        variant={tabChartParams[activeTab]?.chartMode === "absolute" ? "primary" : "outline-primary"}
                        onClick={() => handleChartModeChange("absolute")}
                      >
                        Absolute
                      </Button>
                      <Button
                        size="sm"
                        variant={tabChartParams[activeTab]?.chartMode === "delta" ? "primary" : "outline-primary"}
                        onClick={() => handleChartModeChange("delta")}
                      >
                        Delta
                      </Button>
                    </div>
                    <div className="btn-group" role="group" aria-label="View mode">
                      <Button
                        size="sm"
                        variant={tabChartParams[activeTab]?.viewMode === "per-kpi" ? "success" : "outline-success"}
                        onClick={() => handleViewModeChange("per-kpi")}
                      >
                        Mỗi KPI 1 đồ thị
                      </Button>
                      <Button
                        size="sm"
                        variant={tabChartParams[activeTab]?.viewMode === "all-in-one" ? "success" : "outline-success"}
                        onClick={() => handleViewModeChange("all-in-one")}
                      >
                        1 đồ thị tất cả KPI
                      </Button>
                      <Button
                        size="sm"
                        variant={tabChartParams[activeTab]?.viewMode === "per-kpi-row" ? "success" : "outline-success"}
                        onClick={() => handleViewModeChange("per-kpi-row")}
                      >
                        Mỗi KPI 1 hàng
                      </Button>
                    </div>
                  </div>
                  <KPIChartGrid
                    {...tabChartParams[activeTab]}
                    onRemoveKPI={handleRemoveKPI}
                  />
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
