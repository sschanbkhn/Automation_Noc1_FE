// kpi/KPIExplorerCore.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, FormControl, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Select from "react-select";

import useCausecodeWebSocket from "../../../hooks/useCausecodeWebSocket";
import KPIChartGrid from "./KPIChartGrid";
import { isUsecaseAllowed } from "./platformUsecases";

// Redux actions/selectors
import { fetchPlatformGroupSchema } from "../../../redux/Healthcheck/healthcheckSlice";
import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  fetchAvailableKPIs,
  fetchKPIChartDataBatch,
  clearEmbeddedData,
} from "../../../redux/KPI/kpiSlice";
import { setPinnedKPIsAndSave } from "../../../redux/KPI/kpiPinnedSlice";
import { addPin } from "../../../redux/KPI/pinnedKpisSlice";
import { showTemporaryAlert } from "../../../redux/Alert/alertSlice";

/** ===== Quick range presets ===== */
export const QUICK_RANGES = [
  { label: "3h",  value: "3h",  hours: 3   },
  { label: "6h",  value: "6h",  hours: 6   },
  { label: "12h", value: "12h", hours: 12  },
  { label: "1d",  value: "1d",  hours: 24  },
  { label: "3d",  value: "3d",  hours: 72  },
  { label: "7d",  value: "7d",  hours: 168 },
];

export const BUCKET_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "Raw",  value: "raw"  },
  { label: "15m",  value: "15m"  },
  { label: "1h",   value: "1h"   },
];

export function getEffectiveBucketLabel(hours, override) {
  if (override !== "auto") return override;
  if (hours < 24) return "raw";
  return "1h";
}

/** ===== Prefix grouping config ===== */
const PREFIX_DEPTH = 2;

/** Tách prefix KPI */
function getKpiPrefix(name = "") {
  if (!name) return "";
  const splitters = ["-", "_", ".", "/", ":"];
  const firstIdx = splitters
    .map((c) => {
      const i = name.indexOf(c);
      return i < 0 ? Infinity : i;
    })
    .reduce((a, b) => Math.min(a, b), Infinity);
  if (firstIdx !== Infinity && firstIdx > 0) {
    return name.slice(0, firstIdx);
  }
  const parts = name.split(/(?=[A-Z])/).filter(Boolean);
  if (parts.length === 0) return name;
  if (parts.length === 1) return parts[0];
  return parts.slice(0, Math.max(1, PREFIX_DEPTH)).join("");
}

const KPIExplorerCore = ({
  defaultGroup,
  defaultSubsystem,
  defaultPlatform,
  embed = false,
  kpiKey,
  scope,
  hideToolbar = false,
  pinGroup = null,
  hideCharts = false,
  onFetch = null,
  initialQuickRange = "12h",
  initialBucketOverride = "raw",
}) => {
  const dispatch = useDispatch();
  const { system: urlSystem, subsystem: urlSubsystem } = useParams();

  // --- Schema
  const { platformSchema = {} } = useSelector((state) => state.pscore || {});
  const { devices = [], devicesByPlatform = {}, loadingDevices = false } = useSelector((state) => state.platformDevice || {});
  const { availableKPIs = { kpis: [] }, accessError = null } = useSelector(
    (state) => state.kpi || {}
  );
  const pinnedByPlatform = useSelector(
    (s) => s.kpiPinned?.pinnedByPlatform || {}
  );
  const savedDevicesByPlatform = useSelector(
    (s) => s.kpiPinned?.savedDevicesByPlatform || {}
  );

  // ====== Cascading selections
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // ====== Devices/KPIs/time
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // ====== Chart controls
  const [chartMode, setChartMode] = useState("absolute");
  const [viewMode, setViewMode] = useState("per-kpi-row");

  // ====== Range / bucket controls
  const [quickRange, setQuickRange] = useState(initialQuickRange);
  const [bucketOverride, setBucketOverride] = useState(initialBucketOverride);

  // Auto-pick KPI lần đầu
  const [allowAutoPick, setAllowAutoPick] = useState(true);

  // Auto-restore từ pinned config sau khi refresh
  const autoRestoreDone = useRef(false);
  const [autoFetchPending, setAutoFetchPending] = useState(false);

  // Đánh dấu user đã fetch ít nhất 1 lần — cho phép auto-refetch khi range/bucket đổi
  const hasFetched = useRef(false);

  // ====== Prefix filter
  const [selectedPrefix, setSelectedPrefix] = useState("__all__");

  // ====== Load schema
  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
  }, [dispatch]);

  // ====== Preselect từ URL
  useEffect(() => {
    if (!platformSchema || Object.keys(platformSchema).length === 0) return;
    if (urlSystem && platformSchema[urlSystem]) {
      const groupOpt = { label: urlSystem, value: urlSystem };
      setSelectedGroup(groupOpt);
      if (urlSubsystem && platformSchema[urlSystem][urlSubsystem]) {
        const subOpt = { label: urlSubsystem, value: urlSubsystem };
        setSelectedSubsystem(subOpt);
      }
    }
  }, [platformSchema, urlSystem, urlSubsystem]);

  // ====== Preselect từ props (embed)
  useEffect(() => {
    if (!platformSchema || Object.keys(platformSchema).length === 0) return;
    if (defaultGroup && platformSchema[defaultGroup]) {
      setSelectedGroup({ label: defaultGroup, value: defaultGroup });
      if (
        defaultSubsystem &&
        platformSchema[defaultGroup][defaultSubsystem]
      ) {
        setSelectedSubsystem({
          label: defaultSubsystem,
          value: defaultSubsystem,
        });
      }
    }
  }, [platformSchema, defaultGroup, defaultSubsystem]);

  useEffect(() => {
    if (defaultPlatform) setSelectedPlatform(defaultPlatform);
  }, [defaultPlatform]);

  // Auto-restore: khi platform đã set + devices đã load + chưa có selection nào + có KPI đã ghim
  useEffect(() => {
    if (embed || !defaultGroup || !defaultSubsystem) return;
    if (autoRestoreDone.current) return;
    if (!selectedPlatform || loadingDevices || devices.length === 0) return;
    if (selectedDevices.length > 0) {
      autoRestoreDone.current = true;
      return;
    }
    const pinned = pinnedByPlatform[selectedPlatform] || [];
    if (pinned.length === 0) return;

    const savedDevNames = savedDevicesByPlatform[selectedPlatform] || [];
    const allDevOpts = devices.map((d) => ({
      label: `${d.name} (${d.ip || "no-ip"})`,
      value: d.name,
    }));
    const toRestore =
      savedDevNames.length > 0
        ? allDevOpts.filter((d) => savedDevNames.includes(d.value))
        : allDevOpts;

    if (toRestore.length === 0) return;
    setSelectedDevices(toRestore);
    autoRestoreDone.current = true;
  }, [
    embed,
    defaultGroup,
    defaultSubsystem,
    selectedPlatform,
    loadingDevices,
    devices,
    selectedDevices.length,
    pinnedByPlatform,
    savedDevicesByPlatform,
  ]);

  // Key duy nhất cho embed instance này
  const embedKey = useMemo(
    () =>
      embed && kpiKey
        ? `${scope?.platform || ""}:${scope?.device || ""}:${kpiKey}`
        : null,
    [embed, kpiKey, scope]
  );

  // Embed: dùng devicesByPlatform[platform] để không đọc sai platform khi nhiều embed instances
  const effectiveDevices = useMemo(
    () => (embed && selectedPlatform ? devicesByPlatform[selectedPlatform] || [] : devices),
    [embed, selectedPlatform, devicesByPlatform, devices]
  );

  // ====== Embed mode: auto-init platform + kpiKey từ props
  const embedInitDone = useRef(false);
  useEffect(() => {
    if (!embed || embedInitDone.current || !scope) return;
    if (scope.platform) setSelectedPlatform(scope.platform);
    if (kpiKey) {
      setSelectedKPIs([{ label: kpiKey, value: kpiKey }]);
      setAllowAutoPick(false);
    }
    embedInitDone.current = true;
  }, [embed, scope, kpiKey]);

  // ====== Embed mode: auto-fetch khi devices đã load
  const embedFetchDone = useRef(false);
  useEffect(() => {
    if (!embed || embedFetchDone.current || !selectedPlatform || !kpiKey) return;
    const deviceParam = scope?.device
      ? [scope.device]
      : effectiveDevices.map((d) => d.name);
    if (deviceParam.length === 0) return;
    const end = new Date();
    const start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000);
    dispatch(
      fetchKPIChartDataBatch({
        selectedPlatform,
        selectedDevice: deviceParam,
        selectedKPIs: [kpiKey],
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        embedKey,
      })
    );
    embedFetchDone.current = true;
  }, [embed, selectedPlatform, kpiKey, effectiveDevices, scope, dispatch, embedKey]);

  // ====== Options từ schema
  const groupOptions = useMemo(
    () =>
      Object.keys(platformSchema || {}).map((g) => ({ label: g, value: g })),
    [platformSchema]
  );

  const subsystemOptions = useMemo(() => {
    if (!selectedGroup) return [];
    const subs = Object.keys(platformSchema[selectedGroup.value] || {});
    return subs.map((s) => ({ label: s, value: s }));
  }, [platformSchema, selectedGroup]);

  const platformOptions = useMemo(() => {
    if (!selectedGroup || !selectedSubsystem) return [];
    const arr =
      platformSchema[selectedGroup.value]?.[selectedSubsystem.value] || [];
    return arr.map((p) => ({ label: p, value: p }));
  }, [platformSchema, selectedGroup, selectedSubsystem]);

  // ====== Reset theo cấp
  const onChangeGroup = (opt) => {
    setSelectedGroup(opt);
    setSelectedSubsystem(null);
    setSelectedPlatform("");
    setSelectedDevices([]);
    setSelectedKPIs([]);
  };
  const onChangeSubsystem = (opt) => {
    setSelectedSubsystem(opt);
    setSelectedPlatform("");
    setSelectedDevices([]);
    setSelectedKPIs([]);
  };
  const onChangePlatform = (opt) => {
    const value = opt?.value || "";
    setSelectedPlatform(value);
    setSelectedDevices([]);
    setSelectedKPIs([]);
  };

  // ====== Load devices khi có platform
  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
  }, [dispatch, selectedPlatform]);

  // ====== Sau khi chọn devices → fetch danh sách KPI
  useEffect(() => {
    if (selectedPlatform && selectedDevices.length > 0) {
      const selectedDeviceNames = selectedDevices.map((d) => d.value);
      dispatch(
        fetchAvailableKPIs({
          selectedPlatform,
          selectedDevices: selectedDeviceNames,
        })
      );
      setSelectedKPIs([]);
      setSelectedPrefix("__all__");
    }
  }, [dispatch, selectedPlatform, selectedDevices]);

  // ====== Auto pick KPI đầu tiên (1 lần mỗi filter set)
  const filterKey = useMemo(() => {
    const devs = (selectedDevices || [])
      .map((d) => d.value)
      .sort()
      .join(",");
    return `${selectedPlatform}::${devs}`;
  }, [selectedPlatform, selectedDevices]);

  useEffect(() => {
    if (embed) return;
    setAllowAutoPick(true);
    setSelectedKPIs([]);
    setSelectedPrefix("__all__");
  }, [filterKey, embed]);

  useEffect(() => {
    if (!allowAutoPick) return;
    if (embed) return;
    if (availableKPIs.kpis?.length > 0 && selectedKPIs.length === 0) {
      if (autoRestoreDone.current) {
        const pinned = (pinnedByPlatform[selectedPlatform] || []).filter((k) =>
          availableKPIs.kpis.includes(k)
        );
        if (pinned.length > 0) {
          setSelectedKPIs(pinned.map((k) => ({ label: k, value: k })));
          setAutoFetchPending(true);
          return;
        }
      }
    }
  }, [availableKPIs.kpis, selectedKPIs.length, allowAutoPick, pinnedByPlatform, selectedPlatform, embed]);

  // ====== WebSocket realtime
  useCausecodeWebSocket({
    selectedPlatform,
    selectedDevices,
    selectedKPIs,
  });

  // ====== Auto-fetch sau khi restore từ pinned config
  useEffect(() => {
    if (!autoFetchPending) return;
    if (!selectedPlatform || selectedDevices.length === 0 || selectedKPIs.length === 0) return;
    const rangeHours = quickRange !== "custom"
      ? (QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 72)
      : 72;
    const end = new Date();
    const start = new Date(end.getTime() - rangeHours * 60 * 60 * 1000);
    dispatch(
      fetchKPIChartDataBatch({
        selectedPlatform,
        selectedDevice: selectedDevices.map((d) => d.value),
        selectedKPIs: selectedKPIs.map((k) => k.value),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
    );
    hasFetched.current = true;
    setAutoFetchPending(false);
  }, [autoFetchPending, selectedPlatform, selectedDevices, selectedKPIs, dispatch, quickRange]);

  // ====== Auto-refetch khi range hoặc bucket thay đổi
  useEffect(() => {
    if (!hasFetched.current) return;
    if (quickRange === "custom") return;
    if (!selectedPlatform || selectedDevices.length === 0 || selectedKPIs.length === 0) return;

    const rangeHours = QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 72;
    const end = new Date();
    const start = new Date(end.getTime() - rangeHours * 60 * 60 * 1000);
    const effectiveBucket = bucketOverride === "auto" ? undefined : bucketOverride;

    dispatch(
      fetchKPIChartDataBatch({
        selectedPlatform,
        selectedDevice: selectedDevices.map((d) => d.value),
        selectedKPIs: selectedKPIs.map((k) => k.value),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        bucket: effectiveBucket,
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickRange, bucketOverride]);

  // ====== Devices Select options
  const deviceOptions = useMemo(
    () =>
      effectiveDevices.map((d) => ({
        label: `${d.name} (${d.ip || "no-ip"})`,
        value: d.name,
      })),
    [effectiveDevices]
  );
  const combinedDeviceOptions = [
    { label: "-- Chọn tất cả thiết bị --", value: "__all__" },
    ...deviceOptions,
  ];
  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((opt) => opt.value === "__all__")) {
      setSelectedDevices(deviceOptions);
    } else {
      setSelectedDevices(selected);
    }
  };

  // ====== Prefix map & options
  const prefixMap = useMemo(() => {
    const map = {};
    for (const k of availableKPIs?.kpis || []) {
      const px = getKpiPrefix(k) || "(no-prefix)";
      (map[px] ||= []).push(k);
    }
    Object.values(map).forEach((arr) => arr.sort());
    return map;
  }, [availableKPIs?.kpis]);

  const prefixOptions = useMemo(() => {
    const keys = Object.keys(prefixMap).sort();
    return [{ label: "Tất cả", value: "__all__" }].concat(
      keys.map((k) => ({ label: k, value: k }))
    );
  }, [prefixMap]);

  // ====== KPI options (lọc theo prefix) + 'chọn tất cả KPI'
  const kpiOptionsAll = useMemo(
    () => (availableKPIs?.kpis || []).map((k) => ({ label: k, value: k })),
    [availableKPIs?.kpis]
  );

  const kpiOptionsFiltered = useMemo(() => {
    let baseList;
    if (selectedPrefix === "__all__") {
      baseList = kpiOptionsAll;
    } else {
      const list = prefixMap[selectedPrefix] || [];
      baseList = list.map((k) => ({ label: k, value: k }));
    }
    return [{ label: "-- Chọn tất cả KPI --", value: "__all__" }, ...baseList];
  }, [kpiOptionsAll, prefixMap, selectedPrefix]);

  // ====== Trigger fetch chart data
  const handleCheckKPI = () => {
    const selectedNames = selectedDevices.map((d) => d.value);
    let startDateTime, endDateTime;

    if (quickRange !== "custom") {
      const rangeHours = QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 72;
      endDateTime = new Date();
      startDateTime = new Date(endDateTime.getTime() - rangeHours * 60 * 60 * 1000);
    } else if (!startDate || !endDate) {
      endDateTime = new Date();
      startDateTime = new Date(endDateTime.getTime() - 3 * 24 * 60 * 60 * 1000);
    } else {
      startDateTime = new Date(startDate);
      endDateTime = new Date(endDate);
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      startDateTime.setHours(startH, startM, 0, 0);
      endDateTime.setHours(endH, endM, 0, 0);
    }

    const effectiveBucket = bucketOverride === "auto" ? undefined : bucketOverride;

    if (selectedPlatform && selectedKPIs.length > 0) {
      hasFetched.current = true;
      dispatch(
        fetchKPIChartDataBatch({
          selectedPlatform,
          selectedDevice: selectedNames.length > 0 ? selectedNames : undefined,
          selectedKPIs: selectedKPIs.map((k) => k.value),
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          bucket: effectiveBucket,
        })
      );
      onFetch?.({ selectedKPIs, selectedPlatform, selectedDevices, chartMode, viewMode });
    }
  };

  // ====== PIN all selected KPIs
  const handlePinToHealthTable = () => {
    if (!selectedPlatform || selectedKPIs.length === 0) return;
    const kpis = selectedKPIs.map((k) => k.value);
    const devices = selectedDevices.map((d) => d.value);
    dispatch(setPinnedKPIsAndSave({ platform: selectedPlatform, kpis, devices }));
    try {
      dispatch(
        showTemporaryAlert({
          type: "success",
          message: `Đã ghim ${kpis.length} KPI cho '${selectedPlatform}'.`,
          timeout: 2500,
        })
      );
    } catch {}
  };

  const handlePinToDashboard = async () => {
    if (!pinGroup || !selectedPlatform || selectedKPIs.length === 0) return;
    const device = selectedDevices.length === 1 ? selectedDevices[0].value : null;
    let successCount = 0;
    for (const kpi of selectedKPIs) {
      const result = await dispatch(addPin({
        group: pinGroup,
        platform: selectedPlatform,
        device,
        kpi_key: kpi.value,
        title: kpi.label || kpi.value,
      }));
      if (!result.error) successCount++;
    }
    try {
      dispatch(showTemporaryAlert({
        type: successCount > 0 ? "success" : "danger",
        message: successCount > 0
          ? `Đã ghim ${successCount} KPI lên Dashboard.`
          : "Ghim thất bại, vui lòng thử lại.",
        timeout: 2500,
      }));
    } catch {}
  };

  // ====== KPI search input UX
  const [kpiSearchInput, setKpiSearchInput] = useState("");
  const kpiInputRef = useRef("");
  const [kpiMenuOpen, setKpiMenuOpen] = useState(false);

  // ====== Danh sách KPI đã chọn — toggle panel
  const [showSelectedList, setShowSelectedList] = useState(false);

  const handleAddAllFiltered = () => {
    const existing = new Set(selectedKPIs.map((k) => k.value));
    const toAdd = kpiOptionsFiltered
      .filter((o) => o.value !== "__all__" && !existing.has(o.value));
    if (toAdd.length === 0) return;
    setSelectedKPIs((prev) => [...prev, ...toAdd]);
    setAllowAutoPick(false);
  };

  // ====== Remove KPI
  const removeKPI = (kpiValue) => {
    setSelectedKPIs((prev) => prev.filter((x) => x.value !== kpiValue));
    setAllowAutoPick(false);
  };

  // ====== Embed cleanup
  useEffect(() => {
    if (!embed || !embedKey) return;
    return () => {
      dispatch(clearEmbeddedData(embedKey));
    };
  }, [embed, embedKey, dispatch]);

  return (
    <>
      {!hideToolbar && <Card className="mb-4">
        <Card.Body>
          {/* Hàng 1: Group/Sub/Platform */}
          <Row className="align-items-center mb-3">
            <Col md={4}>
              <Select
                isClearable
                isSearchable
                options={groupOptions}
                value={selectedGroup}
                onChange={onChangeGroup}
                placeholder="-- Chọn Group/System --"
              />
            </Col>
            <Col md={4}>
              <Select
                isClearable
                isSearchable
                options={subsystemOptions}
                value={selectedSubsystem}
                onChange={onChangeSubsystem}
                placeholder="-- Chọn Subsystem --"
                isDisabled={!selectedGroup}
              />
            </Col>
            <Col md={4}>
              <Select
                isClearable
                isSearchable
                options={platformOptions}
                value={
                  selectedPlatform
                    ? { label: selectedPlatform, value: selectedPlatform }
                    : null
                }
                onChange={onChangePlatform}
                placeholder="-- Chọn Platform --"
                isDisabled={!selectedSubsystem}
              />
            </Col>
          </Row>

          {/* Hàng 2: Devices / Prefix / KPI / Buttons */}
          <Row className="align-items-start mb-2">
            <Col md={3}>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={combinedDeviceOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="-- Chọn thiết bị --"
                isDisabled={!selectedPlatform}
                styles={{
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: "60px",
                    overflowY: "auto",
                    flexWrap: "wrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                }}
              />
            </Col>

            {/* Prefix */}
            <Col md={2}>
              <Select
                isSearchable
                isClearable={false}
                options={prefixOptions}
                value={
                  prefixOptions.find((o) => o.value === selectedPrefix) ||
                  prefixOptions[0]
                }
                onChange={(opt) => {
                  setSelectedPrefix(opt?.value || "__all__");
                }}
                placeholder="-- Prefix --"
                isDisabled={selectedDevices.length === 0}
              />
            </Col>

            {/* KPI */}
            <Col md={4}>
              <Select
                isMulti
                isClearable
                isSearchable
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                menuIsOpen={kpiMenuOpen}
                onMenuOpen={() => setKpiMenuOpen(true)}
                onMenuClose={() => {
                  setKpiMenuOpen(false);
                  setTimeout(() => setKpiSearchInput(kpiInputRef.current), 0);
                }}
                inputValue={kpiSearchInput}
                onInputChange={(value, { action }) => {
                  if (action === "input-change") {
                    kpiInputRef.current = value;
                    setKpiSearchInput(value);
                  }
                  if (action === "menu-close") setKpiMenuOpen(false);
                }}
                onChange={(selected, meta) => {
                  if (!selected) {
                    setSelectedKPIs([]);
                  } else if (selected.find((opt) => opt.value === "__all__")) {
                    const all = kpiOptionsFiltered.filter(
                      (opt) => opt.value !== "__all__"
                    );
                    setSelectedKPIs(all);
                  } else {
                    setSelectedKPIs(selected);
                  }
                  setAllowAutoPick(false);
                  if (meta?.action === "select-option") {
                    setTimeout(() => setKpiSearchInput(kpiInputRef.current), 0);
                  }
                }}
                hideSelectedOptions={false}
                options={kpiOptionsFiltered}
                value={selectedKPIs}
                maxMenuHeight={440}
                placeholder={
                  selectedPrefix === "__all__"
                    ? "-- Chọn KPI --"
                    : `-- KPI thuộc '${selectedPrefix}' --`
                }
                isDisabled={selectedDevices.length === 0}
                styles={{
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: "60px",
                    overflowY: "auto",
                    flexWrap: "wrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                }}
              />
              {/* Hàng phụ dưới KPI Select */}
              <div className="d-flex gap-2 mt-1">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={handleAddAllFiltered}
                  disabled={
                    selectedDevices.length === 0
                    || kpiOptionsFiltered.filter(o => o.value !== "__all__").length === 0
                  }
                  title="Bổ sung tất cả KPI trong prefix hiện tại vào danh sách đã chọn"
                >
                  + Thêm tất cả
                </Button>
                <Button
                  size="sm"
                  variant={showSelectedList ? "secondary" : "outline-secondary"}
                  onClick={() => setShowSelectedList((v) => !v)}
                  disabled={selectedKPIs.length === 0}
                >
                  📋 {selectedKPIs.length} đã chọn
                </Button>
              </div>
            </Col>

            {/* Buttons */}
            <Col md={3}>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  className="flex-fill"
                  onClick={handleCheckKPI}
                  disabled={!selectedPlatform || selectedKPIs.length === 0}
                >
                  Xem
                </Button>
                <Button
                  className="flex-fill"
                  variant="outline-primary"
                  onClick={handlePinToHealthTable}
                  disabled={!selectedPlatform || selectedKPIs.length === 0}
                  title="Ghim các KPI đã chọn vào Healthcheck Table"
                >
                  📌 Ghim
                </Button>
                {pinGroup && (
                  <Button
                    className="flex-fill"
                    variant="outline-success"
                    onClick={handlePinToDashboard}
                    disabled={!selectedPlatform || selectedKPIs.length === 0}
                    title="Lưu KPI đã chọn lên Dashboard (per-user, lưu server)"
                  >
                    ⭐ Dashboard
                  </Button>
                )}
              </div>
            </Col>
          </Row>

          {/* Panel danh sách KPI đã chọn */}
          {showSelectedList && selectedKPIs.length > 0 && (
            <Row className="mb-2">
              <Col>
                <div
                  className="border rounded p-2 bg-light"
                  style={{ maxHeight: 180, overflowY: "auto" }}
                >
                  <div className="d-flex flex-wrap gap-1">
                    {selectedKPIs.map((k) => (
                      <span
                        key={k.value}
                        className="badge bg-white text-dark border d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "0.78rem", fontWeight: 400 }}
                      >
                        {k.label}
                        <span
                          style={{ cursor: "pointer", fontSize: "0.9rem", lineHeight: 1 }}
                          onClick={() => removeKPI(k.value)}
                          title="Bỏ chọn"
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* Hàng 3: Quick range + Bucket override */}
          <Row className="align-items-center mb-2">
            <Col className="d-flex flex-wrap align-items-center gap-3">
              {/* Quick range */}
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
                  <Button
                    variant={quickRange === "custom" ? "primary" : "outline-primary"}
                    onClick={() => setQuickRange("custom")}
                  >Tuỳ chỉnh</Button>
                </div>
              </div>

              <div style={{ width: 1, height: 26, background: "#dee2e6", flexShrink: 0 }} />

              {/* Bucket override */}
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
                    →&nbsp;
                    {quickRange !== "custom"
                      ? getEffectiveBucketLabel(QUICK_RANGES.find((r) => r.value === quickRange)?.hours || 72, "auto")
                      : "auto"}
                  </small>
                )}
              </div>
            </Col>
          </Row>

          {/* Custom date pickers */}
          {quickRange === "custom" && (
            <Row className="align-items-end mb-2">
              <Col md={3}>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  className="form-control"
                  placeholderText="Ngày bắt đầu"
                />
              </Col>
              <Col md={3}>
                <FormControl
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  className="form-control"
                  placeholderText="Ngày kết thúc"
                />
              </Col>
              <Col md={3}>
                <FormControl
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </Col>
            </Row>
          )}

          {!hideCharts && (
            <Row className="mb-2">
              <Col className="d-flex flex-wrap gap-2">
                <div className="btn-group" role="group" aria-label="Chart value mode">
                  <Button
                    size="sm"
                    variant={chartMode === "absolute" ? "primary" : "outline-primary"}
                    onClick={() => setChartMode("absolute")}
                  >
                    Absolute
                  </Button>
                  <Button
                    size="sm"
                    variant={chartMode === "delta" ? "primary" : "outline-primary"}
                    onClick={() => setChartMode("delta")}
                  >
                    Delta
                  </Button>
                </div>

                <div className="btn-group" role="group" aria-label="View mode">
                  <Button
                    size="sm"
                    variant={viewMode === "per-kpi" ? "success" : "outline-success"}
                    onClick={() => setViewMode("per-kpi")}
                  >
                    Mỗi KPI 1 đồ thị
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "all-in-one" ? "success" : "outline-success"}
                    onClick={() => setViewMode("all-in-one")}
                  >
                    1 đồ thị tất cả KPI
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "per-kpi-row" ? "success" : "outline-success"}
                    onClick={() => setViewMode("per-kpi-row")}
                  >
                    Mỗi KPI 1 hàng
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>}

      {/* 403 RBAC banner */}
      {accessError === 403 && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
          <span>⚠️</span>
          <span>Không có quyền truy cập thiết bị này. Vui lòng liên hệ admin để được cấp quyền.</span>
        </div>
      )}

      {/* Empty state: platform đã chọn nhưng không có device nào trong scope */}
      {selectedPlatform && !loadingDevices && effectiveDevices.length === 0 && accessError !== 403 && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3" role="alert">
          <span>ℹ️</span>
          <span>Không có thiết bị nào trong phạm vi quyền của bạn cho platform <strong>{selectedPlatform}</strong>.</span>
        </div>
      )}

      {!hideCharts && (
        <KPIChartGrid
          selectedKPIs={selectedKPIs}
          selectedPlatform={selectedPlatform}
          chartMode={chartMode}
          viewMode={viewMode}
          onRemoveKPI={removeKPI}
          embed={embed}
          embedKey={embedKey}
        />
      )}
    </>
  );
};

export default KPIExplorerCore;
