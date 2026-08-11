import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  InputGroup,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import { SERVER_MEDIA } from "../../../config/constant";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import { GenericHealthCheckView } from "../../../redux/Healthcheck/healthcheckSlice";
import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchHosts, fetchDeviceApps, fetchAllDeviceApps } from "../../../redux/Hosts/hostsSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner"; 
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

// Định dạng style đồng bộ với Precheck để hiển thị thanh cuộn nếu chọn quá nhiều thiết bị
const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const Healthcheck = () => {
  useScheduleWebSocket(); // ✅ Gọi ở đây

  const dispatch = useDispatch();
  
  // Tính toán quyền Admin/Super
  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.role === 'admin' || claims?.role === 'super';
  }, []);

  const { platforms = [], devices = [], loadingDevices = false } = useSelector(
    (state) => state.platformDevice || {}
  );
  const { healthchecknodes = [], loading = false } = useSelector(
    (state) => state.pscore ?? {}
  );
  const { devices: allHosts = [], allDeviceApps = [] } = useSelector((state) => state.hosts || {});

  // Chuyển sang quản lý object { label, value } giống Precheck để react-select hoạt động đúng
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);

  // State cho tính năng healthcheck theo tên thiết bị
  const [deviceForApps, setDeviceForApps] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsAlert, setAppsAlert] = useState(null); // { variant, message }

  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchHosts());
    dispatch(fetchAllDeviceApps());
  }, [dispatch]);

  useEffect(() => {
    const platformVal = selectedPlatform?.value;
    if (platformVal) {
      dispatch(fetchDevicesByPlatform(platformVal));
    }
    setSelectedDevices([]); // reset khi đổi platform
  }, [dispatch, selectedPlatform]);

  // Convert danh sách platforms sang dạng options cho react-select (Có khả năng SEARCH)
  const platformOptions = useMemo(() => {
    return platforms.map((p) => ({
      label: `${p?.name} (${p?.device_count ?? 0})`,
      value: p?.name,
    }));
  }, [platforms]);

  const deviceOptions = useMemo(() => {
    return devices.map((d) => ({
      label: d.is_app
        ? `↳ ${d.display_name || d.name} (${d.ip || "no-ip"})`
        : `${d.name} (${d.ip || "no-ip"})`,
      value: d.name,
    }));
  }, [devices]);

  const allOption = { label: "-- Chọn tất cả thiết bị --", value: "__all__" };
  const combinedOptions = useMemo(() => [allOption, ...deviceOptions], [deviceOptions]);

  const deviceNamesWithApps = useMemo(() =>
    new Set(allDeviceApps.map(app => app.device_name)),
  [allDeviceApps]);

  const representativeDeviceOptions = useMemo(() =>
    allHosts
      .filter(d => deviceNamesWithApps.has(d.name))
      .map(d => ({
        value: d.name,
        label: d.hostname
          ? `${d.name} (${d.platform || "?"}) — có IP`
          : `${d.name} (${d.platform || "?"}) — chỉ apps`,
      })),
  [allHosts, deviceNamesWithApps]);

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((opt) => opt.value === "__all__")) {
      setSelectedDevices(deviceOptions); // Chọn tất cả
    } else {
      setSelectedDevices(selected);
    }
  };

  const handleHealthcheck = () => {
    const platformVal = selectedPlatform?.value;
    const selectedNames = selectedDevices.map((d) => d.value);
    
    if (platformVal && selectedNames.length > 0) {
      dispatch(
        GenericHealthCheckView({
          selectedPlatform: platformVal,
          selectedDevice: selectedNames,
        })
      );
    } else {
      console.log("Vui lòng chọn platform và thiết bị.");
    }
  };

  const handleHealthcheckByDevice = async () => {
    if (!deviceForApps) return;
    setAppsAlert(null);
    setLoadingApps(true);
    try {
      const result = await dispatch(fetchDeviceApps(deviceForApps.value)).unwrap();
      const apps = result.apps || [];
      if (apps.length === 0) {
        setAppsAlert({ variant: "warning", message: `Thiết bị "${deviceForApps.value}" không có app nào được cấu hình.` });
        return;
      }
      const parentDevice = allHosts.find(d => d.name === deviceForApps.value);
      const hasIp = !!parentDevice?.hostname;

      // Case 2 (có IP): dùng platform của thiết bị đại diện
      // Case 1 (không IP): lấy platform từ app đầu tiên
      const platformName = hasIp
        ? (parentDevice?.platform || apps[0]?.platform)
        : apps[0]?.platform;

      if (!platformName) {
        setAppsAlert({ variant: "danger", message: `Không xác định được platform của thiết bị "${deviceForApps.value}".` });
        return;
      }
      const appNames = apps.map(app => `${deviceForApps.value}__${app.app_name.toLowerCase()}`);

      // Case 2: healthcheck cả thiết bị đại diện lẫn toàn bộ apps
      // Case 1: chỉ healthcheck apps
      const deviceList = hasIp ? [deviceForApps.value, ...appNames] : appNames;

      dispatch(GenericHealthCheckView({ selectedPlatform: platformName, selectedDevice: deviceList }));
    } catch (err) {
      setAppsAlert({ variant: "danger", message: `Lỗi: ${err?.message || "Không lấy được danh sách app."}` });
    } finally {
      setLoadingApps(false);
    }
  };

  const statusRowClass = {
    OK: "",
    Warning: "table-warning",
    Error: "table-danger",
    NOK: "table-danger",
    Unknown: "table-secondary",
  };
console.log("=== 1. DỮ LIỆU REDUX ===", {
    platforms: platforms,
    devices: devices
  });

  console.log("=== 1. DỮ LIỆU REDUX ===", {
    platforms: platforms,
    devices: devices
  });

  console.log("=== 1. DỮ LIỆU REDUX ===", {
    platforms: platforms,
    devices: devices
  });

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      <Row>
        <Col sm={12}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Row className="align-items-end"> {/* Đổi sang align-items-end để căn đều hàng với Select */}
                
                {/* Ô chọn Platform mới - Đã tích hợp Search */}
                <Col md={3}>
                  <Select
                    options={platformOptions}
                    value={selectedPlatform}
                    onChange={(v) => setSelectedPlatform(v)}
                    placeholder="-- Chọn platform --"
                    isClearable
                    styles={SELECT_STYLES}
                  />
                </Col>

                {/* Ô chọn thiết bị */}
                <Col md={5}>
                  <Select
                    isMulti
                    options={combinedOptions}
                    value={selectedDevices}
                    onChange={handleDeviceChange}
                    isDisabled={!selectedPlatform || loadingDevices}
                    placeholder="-- Chọn thiết bị --"
                    styles={SELECT_STYLES}
                    closeMenuOnSelect={false}
                  />
                </Col>

                {/* Nút bấm Phân quyền */}
                <Col md={2}>
                  {isAdmin ? (
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={handleHealthcheck}
                      disabled={loading || !selectedPlatform || !selectedDevices.length}
                    >
                      {loading ? "Đang xử lý..." : "Healthcheck ngay"}
                    </Button>
                  ) : (
                    <div className="text-muted small text-center border p-2 rounded bg-light">
                      Quyền User: Chỉ xem dữ liệu
                    </div>
                  )}
                </Col>
              </Row>

              {isAdmin && (
                <>
                  <hr className="my-2" />
                  <Row className="align-items-center g-2">
                    <Col md="auto">
                      <span className="text-muted small fw-semibold">Healthcheck theo thiết bị đại diện:</span>
                    </Col>
                    <Col md={4}>
                      <Select
                        options={representativeDeviceOptions}
                        value={deviceForApps}
                        onChange={v => { setDeviceForApps(v); setAppsAlert(null); }}
                        isClearable
                        placeholder="Chọn thiết bị đại diện..."
                        styles={SELECT_STYLES}
                      />
                    </Col>
                    <Col md="auto">
                      <Button
                        variant="outline-primary"
                        onClick={handleHealthcheckByDevice}
                        disabled={!deviceForApps || loadingApps || loading}
                      >
                        {loadingApps
                          ? <><Spinner animation="border" size="sm" className="me-1" />Đang tải...</>
                          : "🔍 Healthcheck tất cả apps"}
                      </Button>
                    </Col>
                    {appsAlert && (
                      <Col md={12}>
                        <Alert variant={appsAlert.variant} className="mb-0 py-2 px-3 small"
                          dismissible onClose={() => setAppsAlert(null)}>
                          {appsAlert.message}
                        </Alert>
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bảng hiển thị kết quả giữ nguyên */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h5">
                PS Core - Danh sách bản ghi healthcheck
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table responsive hover bordered className="table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Host</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                      <th>File kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthchecknodes.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className={statusRowClass[item.status] || ""}
                      >
                        <td>{item.host}</td>
                        <td>{new Date(item.endtime).toLocaleString()}</td>
                        <td>{item.status}</td>
                        <td style={{ whiteSpace: "pre-line" }}>
                          {item.notes ? item.notes : ""}
                        </td>
                        <td>
                          {item.result_file ? (
                            <a
                              href={`${SERVER_MEDIA}/download${item.result_file}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download result for {item.host}
                            </a>
                          ) : (
                            "Không có file"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Healthcheck;