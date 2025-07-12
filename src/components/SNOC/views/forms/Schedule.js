// File: Schedule.js
import React, { useState, useEffect, useMemo } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Button, FormControl, Table } from "react-bootstrap";
import Select from "react-select";
import {
  fetchPlatforms,
  fetchDevicesByPlatform,
} from "../../redux/Healthcheck/platformDeviceSlice";
import {
  createHealthcheckSchedule,
  fetchHealthcheckSchedules,
  deleteHealthcheckSchedule,
  updateHealthcheckSchedule,
} from "../../redux/Healthcheck/healthcheckSlice";
import snocStore from "../../store/snocStore";
import useScheduleWebSocket from "../../hooks/useScheduleWebSocket";
const SchedulekContent = () => {
  useScheduleWebSocket(); // ✅ Kích hoạt nhận WebSocket update
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
    console.log("🔔 handleSubmitSchedule bắt đầu");
    const selectedNames = selectedDevices.map((d) => d.value);

    if (
      !name ||
      !selectedPlatform ||
      selectedNames.length === 0 ||
      !cronExpression ||
      !startTime
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      console.log("⛔ Dữ liệu thiếu:", {
        name,
        selectedPlatform,
        selectedDevices,
        cronExpression,
        startTime,
      });
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
    console.log("Payload:", payload);
    if (editingTask) {
      dispatch(
        updateHealthcheckSchedule({ id: editingTask.id, ...payload })
      ).then(() => {
        dispatch(fetchHealthcheckSchedules());
        setEditingTask(null);
      });
    } else {
      dispatch(createHealthcheckSchedule({ ...payload })).then(() =>
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
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("name")}
                  >
                    Tên{renderSortIcon("name")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("platform")}
                  >
                    Platform{renderSortIcon("platform")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("cron")}
                  >
                    Cron{renderSortIcon("cron")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("node_names")}
                  >
                    Thiết bị{renderSortIcon("node_names")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("enabled")}
                  >
                    Trạng thái{renderSortIcon("enabled")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("last_run_at")}
                  >
                    Chạy gần nhất{renderSortIcon("last_run_at")}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
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
                      <td>{s.enabled ? "🟢 Bật" : "🔴 Tắt"}</td>
                      <td>{s.last_run_at || "Chưa chạy"}</td>
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
  );
};

const Schedule = () => (
  <Provider store={snocStore}>
    <SchedulekContent />
  </Provider>
);

export default Schedule;
