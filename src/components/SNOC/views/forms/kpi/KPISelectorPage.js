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
import { Provider, useDispatch, useSelector } from "react-redux";
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
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchAvailableKPIs,
  fetchKPIChartData,
} from "../../../redux/Healthcheck/healthcheckSlice";
import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import snocStore from "../../../store/snocStore";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const KPISelectorPageContent = () => {
  const { system, subsystem } = useParams();
  const location = useLocation();
  const { platformOptions = [] } = location.state || {};
  const dispatch = useDispatch();
  useScheduleWebSocket();

  const { devices } = useSelector((state) => state.platformDevice || {});
  const { kpiChartData = {}, availableKPIs = { kpis: [] } } = useSelector(
    (state) => state.pscore || {}
  );

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [visibleDevices, setVisibleDevices] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [chartMode, setChartMode] = useState("absolute");

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
    if (availableKPIs.kpis?.length > 0 && selectedKPIs.length === 0) {
      setSelectedKPIs([
        { label: availableKPIs.kpis[0], value: availableKPIs.kpis[0] },
      ]);
    }
  }, [availableKPIs.kpis]);

  const deviceOptions = useMemo(() => {
    return devices.map((d) => ({
      label: `${d.name} (${d.ip || "no-ip"})`,
      value: d.name,
    }));
  }, [devices]);

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
      startDateTime.setHours(startH, startM);
      endDateTime.setHours(endH, endM);
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

  const groupedChartDataByKPIAndDevice = useMemo(() => {
    const groups = {};
    for (const kpi in kpiChartData) {
      const kpiData = kpiChartData[kpi];
      for (const row of kpiData) {
        const { device } = row;
        if (!groups[kpi]) groups[kpi] = {};
        if (!groups[kpi][device]) groups[kpi][device] = [];
        groups[kpi][device].push(row);
      }
    }
    return groups;
  }, [kpiChartData]);

  const getDeltaLineData = (deviceData) => {
    const deltaByDevice = {};
    Object.entries(deviceData).forEach(([device, arr]) => {
      deltaByDevice[device] = arr.map((row, idx) => ({
        ...row,
        value: idx === 0 ? 0 : row.value - arr[idx - 1].value,
      }));
    });
    return deltaByDevice;
  };

  useEffect(() => {
    const allDevices = new Set();
    for (const kpi in groupedChartDataByKPIAndDevice) {
      for (const device in groupedChartDataByKPIAndDevice[kpi]) {
        allDevices.add(device);
      }
    }
    setVisibleDevices(Array.from(allDevices));
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
      const allDevices = new Set();
      for (const kpi in groupedChartDataByKPIAndDevice) {
        for (const device in groupedChartDataByKPIAndDevice[kpi]) {
          allDevices.add(device);
        }
      }
      setVisibleDevices(Array.from(allDevices));
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
                isSearchable={true} // 🔹 bật search
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
                  multiValue: (base) => ({
                    ...base,
                    margin: "1px 2px",
                  }),
                }}
              />
            </Col>
            <Col md={3}>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                menuIsOpen={kpiMenuOpen}
                onMenuOpen={() => setKpiMenuOpen(true)}
                onMenuClose={() => {
                  setKpiMenuOpen(false);
                  // ⚠️ Ngăn react-select reset inputValue
                  setTimeout(() => {
                    setKpiSearchInput(kpiInputRef.current);
                  }, 0);
                }}
                inputValue={kpiSearchInput}
                onInputChange={(value, { action }) => {
                  if (action === "input-change") {
                    kpiInputRef.current = value;
                    setKpiSearchInput(value);
                  }
                  if (action === "menu-close") {
                    setKpiMenuOpen(false);
                  }
                }}
                onChange={(selected, meta) => {
                  setSelectedKPIs(selected || []);
                  if (meta.action === "select-option") {
                    setTimeout(() => {
                      setKpiSearchInput(kpiInputRef.current);
                    }, 0);
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
                  multiValue: (base) => ({
                    ...base,
                    margin: "1px 2px",
                  }),
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
                onChange={(date) => setStartDate(date)}
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
                onChange={(date) => setEndDate(date)}
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
            <Col>
              <Button
                size="sm"
                variant={
                  chartMode === "absolute" ? "primary" : "outline-primary"
                }
                onClick={() => setChartMode("absolute")}
              >
                Absolute
              </Button>{" "}
              <Button
                size="sm"
                variant={chartMode === "delta" ? "primary" : "outline-primary"}
                onClick={() => setChartMode("delta")}
              >
                Delta
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
                        dataKey="timestamp"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getHours()}:${String(
                            date.getMinutes()
                          ).padStart(2, "0")}`;
                        }}
                        angle={-45}
                        textAnchor="end"
                        interval={Math.floor(
                          (kpiChartData[kpi]?.length || 1) / 10
                        )}
                      />
                      <YAxis />
                      <Tooltip />
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
                            textDecoration: isVisible ? "none" : "line-through",
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
    </>
  );
};

const KPISelectorPage = () => (
  <Provider store={snocStore}>
    <KPISelectorPageContent />
  </Provider>
);

export default KPISelectorPage;
