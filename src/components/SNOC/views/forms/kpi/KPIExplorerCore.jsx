// kpi/KPIExplorerCore.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, FormControl, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import Select from "react-select";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useCausecodeWebSocket from "../../../hooks/useCausecodeWebSocket";

// Redux actions/selectors
import { fetchPlatformGroupSchema } from "../../../redux/Healthcheck/healthcheckSlice";
import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  fetchAvailableKPIs,
  fetchKPIChartData,
} from "../../../redux/KPI/kpiSlice";
import { setPinnedKPIs } from "../../../redux/KPI/kpiPinnedSlice";
import { showTemporaryAlert } from "../../../redux/Alert/alertSlice";

/** Format giờ ICT (Asia/Bangkok ~ UTC+7) */
function formatTimeLocal(ts, withDate = false) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    timeZone: "Asia/Bangkok",
    hour12: false,
    ...(withDate
      ? {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      : { hour: "2-digit", minute: "2-digit" }),
  });
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
}) => {
  const dispatch = useDispatch();
  const { system: urlSystem, subsystem: urlSubsystem } = useParams();
  const location = useLocation();

  // --- Schema
  const { platformSchema = {} } = useSelector((state) => state.pscore || {});
  const { devices = [] } = useSelector((state) => state.platformDevice || {});
  const { kpiChartData = {}, availableKPIs = { kpis: [] } } = useSelector(
    (state) => state.kpi || {}
  );
  const pinnedByPlatform = useSelector(
    (s) => s.kpiPinned?.pinnedByPlatform || {}
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
  const [chartMode, setChartMode] = useState("absolute"); // 'absolute' | 'delta'
  const [viewMode, setViewMode] = useState("per-kpi"); // 'per-kpi' | 'all-in-one'

  // Auto-pick KPI lần đầu
  const [allowAutoPick, setAllowAutoPick] = useState(true);

  // ====== Prefix filter
  const [selectedPrefix, setSelectedPrefix] = useState("__all__"); // "__all__" | prefix string

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
      setSelectedKPIs([]); // reset mỗi lần đổi device list
      setSelectedPrefix("__all__"); // reset prefix khi đổi context
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
    setAllowAutoPick(true);
    setSelectedKPIs([]);
    setSelectedPrefix("__all__");
  }, [filterKey]);

  useEffect(() => {
    if (!allowAutoPick) return;
    if (availableKPIs.kpis?.length > 0 && selectedKPIs.length === 0) {
      setSelectedKPIs([
        { label: availableKPIs.kpis[0], value: availableKPIs.kpis[0] },
      ]);
    }
  }, [availableKPIs.kpis, selectedKPIs.length, allowAutoPick]);

  // ====== WebSocket realtime
  useCausecodeWebSocket({
    selectedPlatform,
    selectedDevices,
    selectedKPIs,
  });

  // ====== Devices Select options
  const deviceOptions = useMemo(
    () =>
      devices.map((d) => ({
        label: `${d.name} (${d.ip || "no-ip"})`,
        value: d.name,
      })),
    [devices]
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

    if (!startDate || !endDate) {
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

    if (selectedPlatform && selectedKPIs.length > 0) {
      selectedKPIs.forEach((kpiObj) => {
        dispatch(
          fetchKPIChartData({
            selectedPlatform,
            selectedDevice: selectedNames.length > 0 ? selectedNames : undefined,
            selectedKPI: kpiObj.value,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
          })
        );
      });
    }
  };

  // ====== PIN all selected KPIs
  const pinnedSet = useMemo(
    () => new Set(pinnedByPlatform[selectedPlatform] || []),
    [pinnedByPlatform, selectedPlatform]
  );

  const handlePinToHealthTable = () => {
    if (!selectedPlatform || selectedKPIs.length === 0) return;
    const kpis = selectedKPIs.map((k) => k.value);
    dispatch(setPinnedKPIs({ platform: selectedPlatform, kpis }));
    try {
      dispatch(
        showTemporaryAlert({
          type: "success",
          message: `Đã ghim ${kpis.length} KPI cho '${selectedPlatform}' vào Healthcheck Table.`,
          timeout: 2500,
        })
      );
    } catch {}
  };

  // ====== Chuẩn hoá dữ liệu cho chart
  const groupedChartDataByKPIAndDevice = useMemo(() => {
    const groups = {};
    for (const kpi in kpiChartData) {
      const rows = Array.isArray(kpiChartData[kpi]) ? kpiChartData[kpi] : [];
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
        const arr = Array.from(minuteMap.values()).sort((a, b) => a.ts - b.ts);
        deviceObj[dev] = arr;
      }
      groups[kpi] = deviceObj;
    }
    return groups;
  }, [kpiChartData]);

  // ====== Delta transform
  const getDeltaLineData = (deviceData) => {
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
  };

  // ====== Legend per-kpi (theo thiết bị)
  const [visibleDevices, setVisibleDevices] = useState([]);
  const [showAll, setShowAll] = useState(true);
  useEffect(() => {
    const all = new Set();
    for (const kpi in groupedChartDataByKPIAndDevice) {
      for (const dev in groupedChartDataByKPIAndDevice[kpi]) {
        all.add(dev);
      }
    }
    setVisibleDevices(Array.from(all));
    setShowAll(true);
  }, [groupedChartDataByKPIAndDevice]);
  const toggleDeviceVisibility = (deviceName) => {
    setVisibleDevices((prev) =>
      prev.includes(deviceName)
        ? prev.filter((d) => d !== deviceName)
        : [...prev, deviceName]
    );
  };
  const toggleAllDevices = () => {
    if (showAll) {
      setVisibleDevices([]);
    } else {
      const all = new Set();
      for (const kpi in groupedChartDataByKPIAndDevice) {
        for (const dev in groupedChartDataByKPIAndDevice[kpi]) {
          all.add(dev);
        }
      }
      setVisibleDevices(Array.from(all));
    }
    setShowAll(!showAll);
  };

  // ====== Combined view (1 chart cho tất cả KPI)
  const colors = [
    "#2ca02c",
    "#1f77b4",
    "#d62728",
    "#ff7f0e",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ];
  const selectedKpiValues = useMemo(
    () => selectedKPIs.map((k) => k.value),
    [selectedKPIs]
  );
  const combinedSeries = useMemo(() => {
    const list = [];
    selectedKpiValues.forEach((kpi) => {
      const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
      const displayData =
        chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;
      for (const [device, arr] of Object.entries(displayData)) {
        list.push({
          key: `${kpi}__${device}`,
          name: `${device} • ${kpi}`,
          data: arr,
          kpi,
          device,
        });
      }
    });
    return list;
  }, [selectedKpiValues, groupedChartDataByKPIAndDevice, chartMode]);
  const combinedColorMap = useMemo(() => {
    const map = {};
    combinedSeries.forEach((s, idx) => {
      map[s.key] = colors[idx % colors.length];
    });
    return map;
  }, [combinedSeries]);

  const [visibleSeriesKeys, setVisibleSeriesKeys] = useState([]);
  const [showAllCombined, setShowAllCombined] = useState(true);
  useEffect(() => {
    setVisibleSeriesKeys(combinedSeries.map((s) => s.key));
    setShowAllCombined(true);
  }, [combinedSeries]);
  const toggleSeriesVisibility = (key) => {
    setVisibleSeriesKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };
  const toggleAllSeries = () => {
    if (showAllCombined) {
      setVisibleSeriesKeys([]);
    } else {
      setVisibleSeriesKeys(combinedSeries.map((s) => s.key));
    }
    setShowAllCombined(!showAllCombined);
  };

  // ====== KPI search input UX
  const [kpiSearchInput, setKpiSearchInput] = useState("");
  const kpiInputRef = useRef("");
  const [kpiMenuOpen, setKpiMenuOpen] = useState(false);

  // ====== Remove KPI
  const removeKPI = (kpiValue) => {
    setSelectedKPIs((prev) => prev.filter((x) => x.value !== kpiValue));
    setAllowAutoPick(false);
  };

  // ====== Group selected KPIs theo prefix (cho phần render per-kpi)
  const selectedByPrefix = useMemo(() => {
    const map = {};
    for (const k of selectedKPIs) {
      const px = getKpiPrefix(k.value) || "(no-prefix)";
      (map[px] ||= []).push(k);
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.value > b.value ? 1 : -1))
    );
    return map;
  }, [selectedKPIs]);

  return (
    <>
      <Card className="mb-4">
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
          <Row className="align-items-center mb-3">
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
                    maxHeight: "38px",
                    overflowX: "auto",
                    flexWrap: "nowrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                }}
              />
            </Col>

            {/* Prefix */}
            <Col md={3}>
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
                placeholder="-- Chọn prefix KPI --"
                isDisabled={selectedDevices.length === 0}
              />
            </Col>

            {/* KPI */}
            <Col md={3}>
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
                placeholder={
                  selectedPrefix === "__all__"
                    ? "-- Chọn KPI --"
                    : `-- KPI thuộc '${selectedPrefix}' --`
                }
                isDisabled={selectedDevices.length === 0}
                styles={{
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: "38px",
                    overflowX: "auto",
                    flexWrap: "nowrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                }}
              />
            </Col>

            {/* Buttons */}
            <Col md={3}>
              <div className="d-flex gap-2">
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
              </div>
            </Col>
          </Row>

          {/* Hàng 3: Thời gian + chế độ hiển thị */}
          <Row className="align-items-end mb-2">
            <Col md={3}>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="form-control"
                placeholderText="Chọn ngày bắt đầu"
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
                placeholderText="Chọn ngày kết thúc"
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
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ALL-IN-ONE */}
      {viewMode === "all-in-one" && selectedKPIs.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Body>
                {/* Badge KPI + toggle pin + remove */}
                <div className="mb-2 d-flex flex-wrap gap-2">
                  {selectedKPIs.map((k) => (
                    <span key={k.value} className="badge text-bg-light">
                      {k.label}{" "}
                      <span
                        role="button"
                        onClick={() => {
                          const next = pinnedSet.has(k.value)
                            ? [...[...pinnedSet].filter((x) => x !== k.value)]
                            : [...pinnedSet, k.value];
                          dispatch(setPinnedKPIs({ platform: selectedPlatform, kpis: next }));
                        }}
                        style={{
                          marginLeft: 6,
                          cursor: "pointer",
                          opacity: pinnedSet.has(k.value) ? 1 : 0.4,
                        }}
                        title={pinnedSet.has(k.value) ? "Bỏ ghim KPI này" : "Ghim KPI này"}
                      >
                        📌
                      </span>
                      <span
                        role="button"
                        onClick={() => removeKPI(k.value)}
                        style={{ marginLeft: 6, cursor: "pointer" }}
                        title="Bỏ KPI này"
                      >
                        ✕
                      </span>
                    </span>
                  ))}
                </div>

                {combinedSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={660}>
                    <LineChart margin={{ top: 20, right: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="ts"
                        scale="time"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(ts) => formatTimeLocal(ts)}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(ts) =>
                          `⏱ ${formatTimeLocal(ts, true)} (ICT)`
                        }
                        formatter={(value, name) => [value, name]}
                      />
                      {combinedSeries.map((s, idx) =>
                        visibleSeriesKeys.includes(s.key) ? (
                          <Line
                            key={s.key}
                            type="monotone"
                            data={s.data}
                            dataKey="value"
                            name={s.name}
                            stroke={colors[idx % colors.length]}
                            dot={{ r: 1 }}
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        ) : null
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted">Chưa có dữ liệu để vẽ biểu đồ.</div>
                )}

                <div className="d-flex gap-2 mt-3" style={{ fontSize: "12px" }}>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={toggleAllSeries}
                    title={showAllCombined ? "Ẩn tất cả" : "Hiện tất cả"}
                  >
                    👁️
                  </Button>
                  <div
                    className="d-flex flex-wrap gap-2"
                    style={{ maxHeight: 140, overflowY: "auto" }}
                  >
                    {combinedSeries.map((s, idx) => {
                      const visible = visibleSeriesKeys.includes(s.key);
                      return (
                        <span
                          key={s.key}
                          onClick={() => toggleSeriesVisibility(s.key)}
                          style={{
                            cursor: "pointer",
                            color: colors[idx % colors.length],
                            textDecoration: visible ? "none" : "line-through",
                            whiteSpace: "nowrap",
                          }}
                          title={s.name}
                        >
                          {s.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* PER-KPI: nhóm theo prefix */}
      {viewMode === "per-kpi" && (
        <div>
          {Object.entries(selectedByPrefix).map(([px, kpiList]) => (
            <div key={px} className="mb-3">
              <h6 className="mb-2">
                Nhóm: <i>{px}</i>
              </h6>
              <Row>
                {kpiList.map((kpiObj) => {
                  const kpi = kpiObj.value;
                  const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
                  const displayData =
                    chartMode === "delta"
                      ? getDeltaLineData(deviceData)
                      : deviceData;

                  return (
                    <Col md={4} key={kpi} className="mb-4">
                      <Card className="position-relative">
                        {/* Close & remove KPI */}
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => removeKPI(kpi)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            lineHeight: "1",
                            border: "1px solid #ddd",
                          }}
                          title="Đóng chart & bỏ chọn KPI này"
                        >
                          ✕
                        </Button>

                        <Card.Body>
                          <h6 className="mb-2">
                            KPI: <i>{kpi}</i>
                          </h6>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart margin={{ top: 20, right: 20, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                type="number"
                                dataKey="ts"
                                scale="time"
                                domain={["dataMin", "dataMax"]}
                                tickFormatter={(ts) => formatTimeLocal(ts)}
                                angle={-45}
                                textAnchor="end"
                              />
                              <YAxis />
                              <Tooltip
                                labelFormatter={(ts) =>
                                  `⏱ ${formatTimeLocal(ts, true)} (ICT)`
                                }
                                formatter={(value, name) => [value, name]}
                              />
                              {Object.entries(displayData).map(
                                ([device, data], index) =>
                                  visibleDevices.includes(device) ? (
                                    <Line
                                      key={device}
                                      type="monotone"
                                      data={data}
                                      dataKey="value"
                                      name={device}
                                      stroke={colors[index % colors.length]}
                                      dot={{ r: 1 }}
                                      strokeWidth={2}
                                      isAnimationActive={false}
                                    />
                                  ) : null
                              )}
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Legend thiết bị */}
                          <div
                            className="d-flex flex-column gap-1 mt-2"
                            style={{
                              maxHeight: "120px",
                              overflowY: "auto",
                              fontSize: "11px",
                            }}
                          >
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={toggleAllDevices}
                              title={showAll ? "Ẩn tất cả" : "Hiện tất cả"}
                              style={{
                                width: "32px",
                                padding: "2px 6px",
                                cursor: "pointer",
                              }}
                            >
                              👁️
                            </Button>
                            {Object.keys(deviceData).map((device, index) => {
                              const isVisible = visibleDevices.includes(device);
                              return (
                                <div
                                  key={device}
                                  onClick={() => toggleDeviceVisibility(device)}
                                  style={{
                                    cursor: "pointer",
                                    color: colors[index % colors.length],
                                    textDecoration: isVisible
                                      ? "none"
                                      : "line-through",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={device}
                                >
                                  {device}
                                </div>
                              );
                            })}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default KPIExplorerCore;
