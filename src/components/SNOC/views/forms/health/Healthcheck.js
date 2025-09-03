import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  FormControl,
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
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner"; // cập nhật path cho đúng

const Healthcheck = () => {
  useScheduleWebSocket(); // ✅ Gọi ở đây

  const dispatch = useDispatch();
  const { platforms, devices, loadingDevices } = useSelector(
    (state) => state.platformDevice
  );
  const { healthchecknodes = [], loading = false } = useSelector(
    (state) => state.pscore ?? {}
  );
  console.log("healthchecknodes", healthchecknodes);

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
    setSelectedDevices([]); // reset khi đổi platform
  }, [dispatch, selectedPlatform]);

  const deviceOptions = useMemo(() => {
    return devices.map((d) => ({
      label: `${d.name} (${d.ip || "no-ip"})`,
      value: d.name,
    }));
  }, [devices]);

  const allOption = { label: "-- Chọn tất cả thiết bị --", value: "__all__" };
  const combinedOptions = [allOption, ...deviceOptions];

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((opt) => opt.value === "__all__")) {
      setSelectedDevices(deviceOptions); // Chọn tất cả
    } else {
      setSelectedDevices(selected);
    }
  };

  const handleHealthcheck = () => {
    const selectedNames = selectedDevices.map((d) => d.value);
    if (selectedPlatform && selectedNames.length > 0) {
      dispatch(
        GenericHealthCheckView({
          selectedPlatform,
          selectedDevice: selectedNames,
        })
      );
    } else {
      console.log("Vui lòng chọn platform và thiết bị.");
    }
  };

  const statusRowClass = {
    OK: "",
    Warning: "table-warning",
    Error: "table-danger",
    NOK: "table-danger",
    Unknown: "table-secondary",
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={3}>
                  <InputGroup>
                    <FormControl
                      as="select"
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="custom-select"
                    >
                      <option value="">-- Chọn platform --</option>
                      {platforms.map((p, idx) => (
                        <option key={idx} value={p?.name}>
                          {p?.name} ({p?.device_count ?? 0})
                        </option>
                      ))}
                    </FormControl>
                  </InputGroup>
                </Col>

                <Col md={5}>
                  <Select
                    isMulti
                    options={combinedOptions}
                    value={selectedDevices}
                    onChange={handleDeviceChange}
                    isDisabled={!selectedPlatform}
                    placeholder="-- Chọn thiết bị --"
                  />
                </Col>

                <Col md={2}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    onClick={handleHealthcheck}
                  >
                    Healthcheck ngay
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
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
