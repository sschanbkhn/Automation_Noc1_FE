// File: Schedule.js
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, FormControl, Row, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  createHealthcheckSchedule,
  deleteHealthcheckSchedule,
  fetchHealthcheckSchedules,
  toggleScheduleEnabled,
  updateHealthcheckSchedule,
} from "../../../redux/Healthcheck/healthcheckSlice";
import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner"; // cập nhật path cho đúng
const StatusBadge = ({ status }) => {
  const map = {
    success: { label: "Thành công", color: "success", icon: "✅" },
    failed: { label: "Thất bại", color: "danger", icon: "❌" },
    warning: { label: "Cảnh báo", color: "warning", icon: "⚠️" },
    partial: { label: "Một phần", color: "secondary", icon: "🟡" },
    null: { label: "Chưa chạy", color: "secondary", icon: "⏳" },
  };
  const s = map[status] || map.null;
  return (
    <span className={`badge bg-${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
};

const Schedule = () => {
  useScheduleWebSocket(); // ✅ Gọi ở đây
  const dispatch = useDispatch();
  const { platforms, devices } = useSelector((state) => state.platformDevice);
  const { scheduleCreating, scheduledTasks = [] } = useSelector(
    (state) => state.pscore
  );

  const [name, setName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [cronExpression, setCronExpression] = useState("");
  const [startTime, setStartTime] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchHealthcheckSchedules());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
    setSelectedDevices([]);
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
      setSelectedDevices(deviceOptions);
    } else {
      setSelectedDevices(selected);
    }
  };

  const validateCron = (expression) => {
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5;
  };

  const handleSubmitSchedule = () => {
    const selectedNames = selectedDevices.map((d) => d.value);

    if (
      !name ||
      !selectedPlatform ||
      selectedNames.length === 0 ||
      !cronExpression ||
      !startTime
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!validateCron(cronExpression)) {
      alert("Biểu thức cron không hợp lệ. Định dạng đúng: */5 * * * *");
      return;
    }

    const payload = {
      name,
      platform: selectedPlatform,
      node_names: selectedNames,
      cron: cronExpression,
      start_time: startTime,
    };

    if (editingTask) {
      dispatch(
        updateHealthcheckSchedule({ id: editingTask.id, ...payload })
      ).then(() => {
        dispatch(fetchHealthcheckSchedules());
        setEditingTask(null);
      });
    } else {
      dispatch(createHealthcheckSchedule(payload)).then(() =>
        dispatch(fetchHealthcheckSchedules())
      );
    }

    setName("");
    setSelectedPlatform("");
    setSelectedDevices([]);
    setCronExpression("");
    setStartTime("");
  };

  const handleEdit = (task) => {
    setName(task.name);
    setSelectedPlatform(task.platform);
    setSelectedDevices(task.node_names.map((d) => ({ label: d, value: d })));
    setCronExpression(task.cron);
    setStartTime(task.start_time);
    setEditingTask(task);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá lịch này không?")) {
      dispatch(deleteHealthcheckSchedule(id));
    }
  };

  const handleToggleEnabled = (task) => {
    dispatch(toggleScheduleEnabled({ id: task.id, enabled: !task.enabled }));
  };

  const filteredTasks = scheduledTasks
    .filter((s) =>
      s.name.toLowerCase().includes(searchText.trim().toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (Array.isArray(valA)) valA = valA.join(", ");
      if (Array.isArray(valB)) valB = valB.join(", ");

      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";

      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const renderSortIcon = (col) => {
    if (sortColumn !== col) return "";
    return sortAsc ? " ▲" : " ▼";
  };

  const handleSort = (col) => {
    if (sortColumn === col) setSortAsc((prev) => !prev);
    else {
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body>
              {/* Form đặt lịch */}
              <Row className="align-items-center mb-3">
                <Col md={3}>
                  <FormControl
                    placeholder="Tên lịch (vd: Check PGW sáng)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <FormControl
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Col>
                <Col md={3}>
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
                </Col>
                <Col md={3}>
                  <Select
                    isMulti
                    options={combinedOptions}
                    value={selectedDevices}
                    onChange={handleDeviceChange}
                    isDisabled={!selectedPlatform}
                    placeholder="-- Chọn thiết bị --"
                  />
                </Col>
              </Row>

              <Row className="align-items-center mb-4">
                <Col md={4}>
                  <FormControl
                    placeholder="cron (vd: */5 * * * *)"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="primary"
                    onClick={handleSubmitSchedule}
                    disabled={scheduleCreating}
                  >
                    {scheduleCreating
                      ? "Đang xử lý..."
                      : editingTask
                      ? "Lưu thay đổi"
                      : "Đặt lịch"}
                  </Button>

                  {editingTask && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingTask(null);
                        setName("");
                        setSelectedPlatform("");
                        setSelectedDevices([]);
                        setCronExpression("");
                        setStartTime("");
                      }}
                      className="ms-2"
                    >
                      Huỷ bỏ
                    </Button>
                  )}
                </Col>
                <Col md={6}>
                  <FormControl
                    placeholder="Tìm kiếm theo tên lịch..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
              </Row>

              <hr />

              <h5>📋 Danh sách lịch đã tạo:</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Tên{renderSortIcon("name")}
                    </th>
                    <th
                      onClick={() => handleSort("platform")}
                      style={{ cursor: "pointer" }}
                    >
                      Platform{renderSortIcon("platform")}
                    </th>
                    <th
                      onClick={() => handleSort("cron")}
                      style={{ cursor: "pointer" }}
                    >
                      Cron{renderSortIcon("cron")}
                    </th>
                    <th
                      onClick={() => handleSort("node_names")}
                      style={{ cursor: "pointer" }}
                    >
                      Thiết bị{renderSortIcon("node_names")}
                    </th>
                    <th
                      onClick={() => handleSort("enabled")}
                      style={{ cursor: "pointer" }}
                    >
                      Trạng thái{renderSortIcon("enabled")}
                    </th>
                    <th
                      onClick={() => handleSort("last_run_at")}
                      style={{ cursor: "pointer" }}
                    >
                      Chạy gần nhất{renderSortIcon("last_run_at")}
                    </th>
                    <th
                      onClick={() => handleSort("last_run_status")}
                      style={{ cursor: "pointer" }}
                    >
                      Kết quả{renderSortIcon("last_run_status")}
                    </th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        Không có lịch nào
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.platform}</td>
                        <td>{s.cron}</td>
                        <td>{s.node_names?.join(", ")}</td>
                        <td>
                          <Button
                            size="sm"
                            variant={s.enabled ? "success" : "secondary"}
                            onClick={() => handleToggleEnabled(s)}
                          >
                            {s.enabled ? "🟢 Bật" : "🔴 Tắt"}
                          </Button>
                        </td>
                        <td>
                          {s.last_run_at
                            ? (() => {
                                const d = new Date(s.last_run_at);
                                const day = String(d.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                const month = String(d.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                ); // tháng bắt đầu từ 0
                                const year = d.getFullYear();
                                const hours = String(d.getHours()).padStart(
                                  2,
                                  "0"
                                );
                                const minutes = String(d.getMinutes()).padStart(
                                  2,
                                  "0"
                                );
                                return `${day}/${month}/${year} ${hours}:${minutes}`;
                              })()
                            : "Chưa chạy"}
                        </td>
                        <td>
                          <StatusBadge status={s.last_run_status} />
                        </td>
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(s)}
                          >
                            ✏️ Sửa
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(s.id)}
                          >
                            🗑️ Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Schedule;
