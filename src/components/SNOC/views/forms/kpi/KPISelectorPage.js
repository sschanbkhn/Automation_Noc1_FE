// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Button, Card, Col, FormControl, InputGroup, Row } from "react-bootstrap";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { Provider, useDispatch, useSelector } from "react-redux";
// import { useLocation, useParams } from "react-router-dom";
// import Select from "react-select";
// import {
//   CartesianGrid,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
// import useCausecodeWebSocket from "../../../hooks/useCausecodeWebSocket";
// import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
// import { fetchAvailableKPIs, fetchKPIChartData } from "../../../redux/KPI/kpiSlice";
// import snocStore from "../../../store/snocStore";
// import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// /** Format giờ ICT (Asia/Bangkok ~ UTC+7) */
// function formatTimeLocal(ts, withDate = false) {
//   const d = new Date(ts);
//   return d.toLocaleString(undefined, {
//     timeZone: "Asia/Bangkok",
//     hour12: false,
//     ...(withDate
//       ? { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }
//       : { hour: "2-digit", minute: "2-digit" }),
//   });
// }

// const KPISelectorPageContent = () => {
//   const { system, subsystem } = useParams();
//   const location = useLocation();
//   const { platformOptions = [] } = location.state || {};
//   const dispatch = useDispatch();

//   const { devices } = useSelector((state) => state.platformDevice || {});
//   const { kpiChartData = {}, availableKPIs = { kpis: [] } } = useSelector((state) => state.kpi || {});

//   const [selectedPlatform, setSelectedPlatform] = useState("");
//   const [selectedDevices, setSelectedDevices] = useState([]);      // [{label, value}]
//   const [selectedKPIs, setSelectedKPIs] = useState([]);            // [{label, value}]
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [startTime, setStartTime] = useState("00:00");
//   const [endTime, setEndTime] = useState("23:59");
//   const [visibleDevices, setVisibleDevices] = useState([]);
//   const [showAll, setShowAll] = useState(true);
//   const [chartMode, setChartMode] = useState("absolute");

//   // Cho phép auto-pick KPI lần đầu sau khi đổi filter
//   const [allowAutoPick, setAllowAutoPick] = useState(true);
//   const filterKey = useMemo(() => {
//     const devs = (selectedDevices || []).map((d) => d.value).sort().join(",");
//     return `${selectedPlatform}::${devs}`;
//   }, [selectedPlatform, selectedDevices]);

//   useEffect(() => {
//     setAllowAutoPick(true);
//     setSelectedKPIs([]);
//   }, [filterKey]);

//   // WS cập nhật realtime theo filter hiện tại
//   useCausecodeWebSocket({
//     selectedPlatform,
//     selectedDevices, // [{label,value}]
//     selectedKPIs,    // [{label,value}]
//   });

//   useEffect(() => {
//     if (selectedPlatform) {
//       dispatch(fetchDevicesByPlatform(selectedPlatform));
//       setSelectedDevices([]);
//       setSelectedKPIs([]);
//     }
//   }, [dispatch, selectedPlatform]);

//   useEffect(() => {
//     if (selectedPlatform && selectedDevices.length > 0) {
//       const selectedDeviceNames = selectedDevices.map((d) => d.value);
//       dispatch(fetchAvailableKPIs({ selectedPlatform, selectedDevices: selectedDeviceNames }));
//       setSelectedKPIs([]);
//     }
//   }, [dispatch, selectedPlatform, selectedDevices]);

//   useEffect(() => {
//     if (!allowAutoPick) return;
//     if (availableKPIs.kpis?.length > 0 && selectedKPIs.length === 0) {
//       setSelectedKPIs([{ label: availableKPIs.kpis[0], value: availableKPIs.kpis[0] }]);
//     }
//   }, [availableKPIs.kpis, selectedKPIs.length, allowAutoPick]);

//   const deviceOptions = useMemo(
//     () =>
//       devices.map((d) => ({
//         label: `${d.name} (${d.ip || "no-ip"})`,
//         value: d.name,
//       })),
//     [devices]
//   );

//   const combinedOptions = [{ label: "-- Chọn tất cả thiết bị --", value: "__all__" }, ...deviceOptions];

//   const handleDeviceChange = (selected) => {
//     if (!selected) return setSelectedDevices([]);
//     if (selected.find((opt) => opt.value === "__all__")) {
//       setSelectedDevices(deviceOptions);
//     } else {
//       setSelectedDevices(selected);
//     }
//   };

//   const kpiOptions = (availableKPIs?.kpis || []).map((kpi) => ({ label: kpi, value: kpi }));

//   const handleCheckKPI = () => {
//     const selectedNames = selectedDevices.map((d) => d.value);
//     let startDateTime, endDateTime;

//     if (!startDate || !endDate) {
//       endDateTime = new Date();
//       startDateTime = new Date(endDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
//     } else {
//       startDateTime = new Date(startDate);
//       endDateTime = new Date(endDate);
//       const [startH, startM] = startTime.split(":").map(Number);
//       const [endH, endM] = endTime.split(":").map(Number);
//       startDateTime.setHours(startH, startM, 0, 0);
//       endDateTime.setHours(endH, endM, 0, 0);
//     }

//     if (selectedPlatform && selectedKPIs.length > 0) {
//       selectedKPIs.forEach((kpiObj) => {
//         dispatch(
//           fetchKPIChartData({
//             selectedPlatform,
//             selectedDevice: selectedNames.length > 0 ? selectedNames : undefined,
//             selectedKPI: kpiObj.value,
//             startDate: startDateTime.toISOString(),
//             endDate: endDateTime.toISOString(),
//           })
//         );
//       });
//     }
//   };

//   /**
//    * CHUẨN HOÁ DỮ LIỆU CHO CHART
//    * - ép value → Number
//    * - bỏ bản ghi lỗi timestamp
//    * - quy timestamp về “đầu phút” (floor 60s) để dedup DB + WS
//    * - giữ bản ghi **cuối cùng** trong phút (Map overwrite)
//    * - sort tăng dần theo ts
//    *
//    * Kết quả: groups[kpi][device] = Array<{ device, platform, kpi, value:Number, timestamp:String, ts:Number }>
//    */
//   const groupedChartDataByKPIAndDevice = useMemo(() => {
//     const groups = {};
//     for (const kpi in kpiChartData) {
//       const rows = Array.isArray(kpiChartData[kpi]) ? kpiChartData[kpi] : [];
//       const byDeviceMinute = {}; // { [device]: Map<tsMin, point> }

//       for (const row of rows) {
//         const device = row?.device;
//         const ts = Date.parse(row?.timestamp);
//         if (!device || !Number.isFinite(ts)) continue;

//         const tsMin = Math.floor(ts / 60000) * 60000;
//         const val = Number(row?.value);
//         if (!Number.isFinite(val)) continue;

//         const mm = (byDeviceMinute[device] ||= new Map());
//         // giữ “bản ghi mới nhất” trong cùng phút
//         mm.set(tsMin, { ...row, value: val, ts: tsMin });
//       }

//       const deviceObj = {};
//       for (const [dev, minuteMap] of Object.entries(byDeviceMinute)) {
//         const arr = Array.from(minuteMap.values()).sort((a, b) => a.ts - b.ts);
//         deviceObj[dev] = arr;
//       }

//       groups[kpi] = deviceObj;
//     }
//     return groups;
//   }, [kpiChartData]);

//   /**
//    * TÍNH DELTA
//    * - delta = value(i) - value(i-1) nếu cùng device & ts tăng
//    * - nếu âm (counter reset) → clamp 0
//    */
//   const getDeltaLineData = (deviceData) => {
//     const delta = {};
//     Object.entries(deviceData).forEach(([dev, arr]) => {
//       let prev = null;
//       delta[dev] = arr.map((p) => {
//         let d = 0;
//         if (prev && p.ts > prev.ts) {
//           const diff = p.value - prev.value;
//           d = diff >= 0 ? diff : 0; // tránh âm khi counter reset
//         }
//         prev = p;
//         return { ...p, value: d };
//       });
//     });
//     return delta;
//   };

//   // Build danh sách thiết bị ban đầu cho legend (hiện tất)
//   useEffect(() => {
//     const all = new Set();
//     for (const kpi in groupedChartDataByKPIAndDevice) {
//       for (const dev in groupedChartDataByKPIAndDevice[kpi]) {
//         all.add(dev);
//       }
//     }
//     setVisibleDevices(Array.from(all));
//     setShowAll(true);
//   }, [groupedChartDataByKPIAndDevice]);

//   const toggleDeviceVisibility = (deviceName) => {
//     setVisibleDevices((prev) =>
//       prev.includes(deviceName) ? prev.filter((d) => d !== deviceName) : [...prev, deviceName]
//     );
//   };

//   const toggleAllDevices = () => {
//     if (showAll) {
//       setVisibleDevices([]);
//     } else {
//       const all = new Set();
//       for (const kpi in groupedChartDataByKPIAndDevice) {
//         for (const dev in groupedChartDataByKPIAndDevice[kpi]) {
//           all.add(dev);
//         }
//       }
//       setVisibleDevices(Array.from(all));
//     }
//     setShowAll(!showAll);
//   };

//   const colors = ["#2ca02c", "#1f77b4", "#d62728", "#ff7f0e", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

//   const [kpiSearchInput, setKpiSearchInput] = useState("");
//   const kpiInputRef = useRef("");
//   const [kpiMenuOpen, setKpiMenuOpen] = useState(false);

//   return (
//     <>
//       <TopNavbarHealth />
//       <WebSocketStatusBanner />

//       <Card className="mb-4">
//         <Card.Body>
//           <Row className="align-items-center mb-3">
//             <Col md={3}>
//               <InputGroup>
//                 <FormControl
//                   as="select"
//                   value={selectedPlatform}
//                   onChange={(e) => setSelectedPlatform(e.target.value)}
//                 >
//                   <option value="">
//                     -- Chọn platform ({system}/{subsystem}) --
//                   </option>
//                   {platformOptions.map((p, idx) => (
//                     <option key={idx} value={p}>{p}</option>
//                   ))}
//                 </FormControl>
//               </InputGroup>
//             </Col>

//             <Col md={3}>
//               <Select
//                 isMulti
//                 isSearchable
//                 closeMenuOnSelect={false}
//                 hideSelectedOptions={false}
//                 options={combinedOptions}
//                 value={selectedDevices}
//                 onChange={handleDeviceChange}
//                 placeholder="-- Chọn thiết bị --"
//                 styles={{
//                   valueContainer: (base) => ({ ...base, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
//                   multiValue: (base) => ({ ...base, margin: "1px 2px" }),
//                 }}
//               />
//             </Col>

//             <Col md={3}>
//               <Select
//                 isMulti
//                 isClearable
//                 isSearchable
//                 closeMenuOnSelect={false}
//                 blurInputOnSelect={false}
//                 menuIsOpen={kpiMenuOpen}
//                 onMenuOpen={() => setKpiMenuOpen(true)}
//                 onMenuClose={() => {
//                   setKpiMenuOpen(false);
//                   setTimeout(() => setKpiSearchInput(kpiInputRef.current), 0);
//                 }}
//                 inputValue={kpiSearchInput}
//                 onInputChange={(value, { action }) => {
//                   if (action === "input-change") {
//                     kpiInputRef.current = value;
//                     setKpiSearchInput(value);
//                   }
//                   if (action === "menu-close") setKpiMenuOpen(false);
//                 }}
//                 onChange={(selected, meta) => {
//                   setSelectedKPIs(selected || []);
//                   setAllowAutoPick(false);
//                   if (meta?.action === "select-option") {
//                     setTimeout(() => setKpiSearchInput(kpiInputRef.current), 0);
//                   }
//                 }}
//                 hideSelectedOptions={false}
//                 options={kpiOptions}
//                 value={selectedKPIs}
//                 placeholder="-- Chọn KPI --"
//                 styles={{
//                   valueContainer: (base) => ({ ...base, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
//                   multiValue: (base) => ({ ...base, margin: "1px 2px" }),
//                 }}
//               />
//             </Col>

//             <Col md={3}>
//               <Button className="w-100" onClick={handleCheckKPI}>Xem</Button>
//             </Col>
//           </Row>

//           <Row className="align-items-end mb-3">
//             <Col md={3}>
//               <DatePicker selected={startDate} onChange={setStartDate} className="form-control" placeholderText="Chọn ngày bắt đầu" />
//             </Col>
//             <Col md={3}>
//               <FormControl type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
//             </Col>
//             <Col md={3}>
//               <DatePicker selected={endDate} onChange={setEndDate} className="form-control" placeholderText="Chọn ngày kết thúc" />
//             </Col>
//             <Col md={3}>
//               <FormControl type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
//             </Col>
//           </Row>

//           <Row className="mb-2">
//             <Col>
//               <Button
//                 size="sm"
//                 variant={chartMode === "absolute" ? "primary" : "outline-primary"}
//                 onClick={() => setChartMode("absolute")}
//               >
//                 Absolute
//               </Button>{" "}
//               <Button
//                 size="sm"
//                 variant={chartMode === "delta" ? "primary" : "outline-primary"}
//                 onClick={() => setChartMode("delta")}
//               >
//                 Delta
//               </Button>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       <Row>
//         {selectedKPIs.map((kpiObj) => {
//           const kpi = kpiObj.value;
//           const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
//           const displayData = chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;

//           return (
//             <Col md={4} key={kpi} className="mb-4">
//               <Card>
//                 <Card.Body>
//                   <h6 className="mb-2">KPI: <i>{kpi}</i></h6>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <LineChart margin={{ top: 20, right: 20, bottom: 50 }}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis
//                         type="number"
//                         dataKey="ts"
//                         scale="time"
//                         domain={["dataMin", "dataMax"]}  // để Recharts tự lấy min/max ở tất cả series
//                         tickFormatter={(ts) => formatTimeLocal(ts)}
//                         angle={-45}
//                         textAnchor="end"
//                       />
//                       <YAxis />
//                       <Tooltip
//                         labelFormatter={(ts) => `⏱ ${formatTimeLocal(ts, true)} (ICT)`}
//                         formatter={(value, name) => [value, name]}
//                       />
//                       {Object.entries(displayData).map(([device, data], index) =>
//                         visibleDevices.includes(device) ? (
//                           <Line
//                             key={device}
//                             type="monotone"
//                             data={data}
//                             dataKey="value"
//                             name={device}
//                             stroke={colors[index % colors.length]}
//                             dot={{ r: 2 }}
//                             strokeWidth={2}
//                             isAnimationActive={false}
//                           />
//                         ) : null
//                       )}
//                     </LineChart>
//                   </ResponsiveContainer>

//                   <div className="d-flex flex-column gap-1 mt-2" style={{ maxHeight: "120px", overflowY: "auto", fontSize: "11px" }}>
//                     <Button
//                       size="sm"
//                       variant="outline-secondary"
//                       onClick={toggleAllDevices}
//                       title={showAll ? "Ẩn tất cả" : "Hiện tất cả"}
//                       style={{ width: "32px", padding: "2px 6px", cursor: "pointer" }}
//                     >
//                       👁️
//                     </Button>
//                     {Object.keys(deviceData).map((device, index) => {
//                       const isVisible = visibleDevices.includes(device);
//                       return (
//                         <div
//                           key={device}
//                           onClick={() => toggleDeviceVisibility(device)}
//                           style={{
//                             cursor: "pointer",
//                             color: colors[index % colors.length],
//                             textDecoration: isVisible ? "none" : "line-through",
//                             whiteSpace: "nowrap",
//                           }}
//                           title={device}
//                         >
//                           {device}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//           );
//         })}
//       </Row>
//     </>
//   );
// };

// const KPISelectorPage = () => (
//   <Provider store={snocStore}>
//     <KPISelectorPageContent />
//   </Provider>
// );

// export default KPISelectorPage;

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  FormControl,
  InputGroup,
  Row,
} from "react-bootstrap";
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
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useCausecodeWebSocket from "../../../hooks/useCausecodeWebSocket";
import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  fetchAvailableKPIs,
  fetchKPIChartData,
} from "../../../redux/KPI/kpiSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

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

const KPISelectorPage = () => {
  const { system, subsystem } = useParams();
  const location = useLocation();
  const { platformOptions = [] } = location.state || {};
  const dispatch = useDispatch();

  const { devices } = useSelector((state) => state.platformDevice || {});
  const { kpiChartData = {}, availableKPIs = { kpis: [] } } = useSelector(
    (state) => state.kpi || {}
  );

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]); // [{label, value}]
  const [selectedKPIs, setSelectedKPIs] = useState([]); // [{label, value}]
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [visibleDevices, setVisibleDevices] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [chartMode, setChartMode] = useState("absolute");

  // 🔵 NEW: chế độ hiển thị: từng KPI hay gộp 1 đồ thị
  const [viewMode, setViewMode] = useState("per-kpi"); // 'per-kpi' | 'all-in-one'

  // Cho phép auto-pick KPI lần đầu sau khi đổi filter
  const [allowAutoPick, setAllowAutoPick] = useState(true);
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
  }, [filterKey]);

  // WS cập nhật realtime theo filter hiện tại
  useCausecodeWebSocket({
    selectedPlatform,
    selectedDevices, // [{label,value}]
    selectedKPIs, // [{label,value}]
  });

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
      setSelectedDevices([]);
      setSelectedKPIs([]);
    }
  }, [dispatch, selectedPlatform]);

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
    }
  }, [dispatch, selectedPlatform, selectedDevices]);

  useEffect(() => {
    if (!allowAutoPick) return;
    if (availableKPIs.kpis?.length > 0 && selectedKPIs.length === 0) {
      setSelectedKPIs([
        { label: availableKPIs.kpis[0], value: availableKPIs.kpis[0] },
      ]);
    }
  }, [availableKPIs.kpis, selectedKPIs.length, allowAutoPick]);

  const deviceOptions = useMemo(
    () =>
      devices.map((d) => ({
        label: `${d.name} (${d.ip || "no-ip"})`,
        value: d.name,
      })),
    [devices]
  );

  const combinedOptions = [
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

  const kpiOptions = (availableKPIs?.kpis || []).map((kpi) => ({
    label: kpi,
    value: kpi,
  }));

  const handleCheckKPI = () => {
    const selectedNames = selectedDevices.map((d) => d.value);
    let startDateTime, endDateTime;

    if (!startDate || !endDate) {
      endDateTime = new Date();
      startDateTime = new Date(endDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
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
            selectedDevice:
              selectedNames.length > 0 ? selectedNames : undefined,
            selectedKPI: kpiObj.value,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
          })
        );
      });
    }
  };

  /**
   * CHUẨN HOÁ DỮ LIỆU CHO CHART
   * - ép value → Number
   * - bỏ bản ghi lỗi timestamp
   * - quy timestamp về “đầu phút” (floor 60s) để dedup DB + WS
   * - giữ bản ghi **cuối cùng** trong phút (Map overwrite)
   * - sort tăng dần theo ts
   *
   * Kết quả: groups[kpi][device] = Array<{ device, platform, kpi, value:Number, timestamp:String, ts:Number }>
   */
  const groupedChartDataByKPIAndDevice = useMemo(() => {
    const groups = {};
    for (const kpi in kpiChartData) {
      const rows = Array.isArray(kpiChartData[kpi]) ? kpiChartData[kpi] : [];
      const byDeviceMinute = {}; // { [device]: Map<tsMin, point> }

      for (const row of rows) {
        const device = row?.device;
        const ts = Date.parse(row?.timestamp);
        if (!device || !Number.isFinite(ts)) continue;

        const tsMin = Math.floor(ts / 60000) * 60000;
        const val = Number(row?.value);
        if (!Number.isFinite(val)) continue;

        const mm = (byDeviceMinute[device] ||= new Map());
        // giữ “bản ghi mới nhất” trong cùng phút
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

  /**
   * TÍNH DELTA
   * - delta = value(i) - value(i-1) nếu cùng device & ts tăng
   * - nếu âm (counter reset) → clamp 0
   */
  const getDeltaLineData = (deviceData) => {
    const delta = {};
    Object.entries(deviceData).forEach(([dev, arr]) => {
      let prev = null;
      delta[dev] = arr.map((p) => {
        let d = 0;
        if (prev && p.ts > prev.ts) {
          const diff = p.value - prev.value;
          d = diff >= 0 ? diff : 0; // tránh âm khi counter reset
        }
        prev = p;
        return { ...p, value: d };
      });
    });
    return delta;
  };

  // Build danh sách thiết bị ban đầu cho legend (hiện tất)
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

  const [kpiSearchInput, setKpiSearchInput] = useState("");
  const kpiInputRef = useRef("");
  const [kpiMenuOpen, setKpiMenuOpen] = useState(false);

  // 🔵 NEW: Chuẩn bị dữ liệu cho chế độ gộp 1 đồ thị (series = device • KPI)
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

  // 🔵 NEW: legend cho chế độ gộp
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
      setVisibleSeriesKeys([]); // ẩn hết
    } else {
      setVisibleSeriesKeys(combinedSeries.map((s) => s.key)); // hiện hết
    }
    setShowAllCombined(!showAllCombined);
  };

  // 🔵 NEW: tạo color map ổn định cho từng series trong chế độ gộp
  const combinedColorMap = useMemo(() => {
    const map = {};
    combinedSeries.forEach((s, idx) => {
      map[s.key] = colors[idx % colors.length];
    });
    return map;
  }, [combinedSeries, colors]);

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col md={3}>
              <InputGroup>
                <FormControl
                  as="select"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option value="">
                    -- Chọn platform ({system}/{subsystem}) --
                  </option>
                  {platformOptions.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </FormControl>
              </InputGroup>
            </Col>

            <Col md={3}>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={combinedOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="-- Chọn thiết bị --"
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
                  setSelectedKPIs(selected || []);
                  setAllowAutoPick(false);
                  if (meta?.action === "select-option") {
                    setTimeout(() => setKpiSearchInput(kpiInputRef.current), 0);
                  }
                }}
                hideSelectedOptions={false}
                options={kpiOptions}
                value={selectedKPIs}
                placeholder="-- Chọn KPI --"
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

            <Col md={3}>
              <Button className="w-100" onClick={handleCheckKPI}>
                Xem
              </Button>
            </Col>
          </Row>

          <Row className="align-items-end mb-3">
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
              <div
                className="btn-group"
                role="group"
                aria-label="Chart value mode"
              >
                <Button
                  size="sm"
                  variant={
                    chartMode === "absolute" ? "primary" : "outline-primary"
                  }
                  onClick={() => setChartMode("absolute")}
                >
                  Absolute
                </Button>
                <Button
                  size="sm"
                  variant={
                    chartMode === "delta" ? "primary" : "outline-primary"
                  }
                  onClick={() => setChartMode("delta")}
                >
                  Delta
                </Button>
              </div>

              {/* 🔵 NEW: Chế độ hiển thị */}
              <div className="btn-group" role="group" aria-label="View mode">
                <Button
                  size="sm"
                  variant={
                    viewMode === "per-kpi" ? "success" : "outline-success"
                  }
                  onClick={() => setViewMode("per-kpi")}
                >
                  Mỗi KPI 1 đồ thị
                </Button>
                <Button
                  size="sm"
                  variant={
                    viewMode === "all-in-one" ? "success" : "outline-success"
                  }
                  onClick={() => setViewMode("all-in-one")}
                >
                  1 đồ thị tất cả KPI
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 🔵 NEW: Chế độ gộp 1 đồ thị */}
      {viewMode === "all-in-one" && selectedKPIs.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Body>
                <h6 className="mb-2">
                  Tổng hợp: <i>{selectedKpiValues.join(", ")}</i>
                </h6>
                <ResponsiveContainer width="100%" height={420}>
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
                    {combinedSeries.map((s) =>
                      visibleSeriesKeys.includes(s.key) ? (
                        <Line
                          key={s.key}
                          type="monotone"
                          data={s.data}
                          dataKey="value"
                          name={s.name}
                          stroke={combinedColorMap[s.key]}
                          dot={{ r: 2 }}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>

                {/* Legend mini cho gộp */}
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
                    {combinedSeries.map((s) => {
                      const visible = visibleSeriesKeys.includes(s.key);
                      return (
                        <span
                          key={s.key}
                          onClick={() => toggleSeriesVisibility(s.key)}
                          style={{
                            cursor: "pointer",
                            color: combinedColorMap[s.key],
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

                <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                  ⚠️ Lưu ý: các KPI có đơn vị/biên độ khác nhau nên khi gộp 1
                  trục Y có thể khó so sánh tuyệt đối. Dùng chế độ <b>Delta</b>{" "}
                  để so nhịp biến động.
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Chế độ mặc định: mỗi KPI 1 đồ thị */}
      {viewMode === "per-kpi" && (
        <Row>
          {selectedKPIs.map((kpiObj) => {
            const kpi = kpiObj.value;
            const deviceData = groupedChartDataByKPIAndDevice[kpi] || {};
            const displayData =
              chartMode === "delta" ? getDeltaLineData(deviceData) : deviceData;

            return (
              <Col md={4} key={kpi} className="mb-4">
                <Card>
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
                          domain={["dataMin", "dataMax"]} // để Recharts tự lấy min/max ở tất cả series
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
                                dot={{ r: 2 }}
                                strokeWidth={2}
                                isAnimationActive={false}
                              />
                            ) : null
                        )}
                      </LineChart>
                    </ResponsiveContainer>

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
      )}
    </>
  );
};

export default KPISelectorPage;
