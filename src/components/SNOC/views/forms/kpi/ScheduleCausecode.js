// src/pages/scheduler/ScheduleGeneric.jsx
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, FormControl, Row, Table } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleKpiWebSocket from "../../../hooks/useScheduleKpiWebSocket";

import {
  // ✅ lấy từ slice mới
  createGenericSchedule,
  deleteGenericSchedule,
  fetchGenericSchedule,
  toggleGenericSchedule,
  updateGenericSchedule,
  // ✅ selectors theo usecase_type
  selectGenericSchedulesByType,
  selectGenericLoadingByType,
} from "../../../redux/KPI/genericScheduleSlice";

import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";

import snocStore from "../../../store/snocStore";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const USECASE_OPTIONS = [
  { value: "causecode", label: "CauseCode" },
  { value: "kpi", label: "KPI" },
];

const USECASE_LABEL = {
  causecode: "CauseCode",
  kpi: "KPI",
};

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

const ScheduleGenericContent = () => {
  const dispatch = useDispatch();

  // Mặc định mở với CauseCode
  const [usecaseType, setUsecaseType] = useState(USECASE_OPTIONS[0].value);

  // 🔌 WS dành riêng cho SCHEDULE (cập nhật last_run_at/status)
  useScheduleKpiWebSocket({ endpoint: "schedule", silent: true });

  // Store: platform/device giữ nguyên
  const { platforms = [], devices = [] } = useSelector(
    (state) => state.platformDevice || {}
  );

  // ✅ lấy rows & loading theo usecase từ slice mới
  const rows = useSelector((state) =>
    selectGenericSchedulesByType(state, usecaseType)
  );
  const genericLoading = useSelector((state) =>
    selectGenericLoadingByType(state, usecaseType)
  );

  // Form state
  const [name, setName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [cronExpression, setCronExpression] = useState("");
  const [startTime, setStartTime] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // Init platforms
  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Mỗi lần đổi usecase → load danh sách + reset form
  useEffect(() => {
    dispatch(fetchGenericSchedule({ usecase_type: usecaseType }));
    setEditingTask(null);
    setName("");
    setSelectedPlatform("");
    setSelectedDevices([]);
    setCronExpression("");
    setStartTime("");
  }, [dispatch, usecaseType]);

  // Load devices theo platform
  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
  }, [dispatch, selectedPlatform]);

  // Options thiết bị
  const deviceOptions = useMemo(
    () =>
      (devices || []).map((d) => ({
        label: `${d.name} (${d.ip || "no-ip"})`,
        value: d.name,
      })),
    [devices]
  );
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

  // Cron validator rất cơ bản
  const validateCron = (expression) =>
    expression.trim().split(/\s+/).length === 5;

  const handleSubmitSchedule = () => {
    const selectedNames = selectedDevices.map((d) => d.value);
    if (
      !name ||
      !selectedPlatform ||
      !cronExpression ||
      !startTime ||
      selectedNames.length === 0
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!validateCron(cronExpression)) {
      alert("Cron không hợp lệ. Định dạng đúng: */5 * * * *");
      return;
    }

    const payload = {
      name,
      platform: selectedPlatform,
      node_names: selectedNames,
      cron: cronExpression,
      start_time: startTime,
      usecase_type: usecaseType, // 'causecode' | 'kpi'
    };

    if (editingTask) {
      dispatch(updateGenericSchedule({ id: editingTask.id, ...payload })).then(
        () => {
          dispatch(fetchGenericSchedule({ usecase_type: usecaseType }));
          setEditingTask(null);
        }
      );
    } else {
      dispatch(createGenericSchedule(payload)).then(() =>
        dispatch(fetchGenericSchedule({ usecase_type: usecaseType }))
      );
    }

    // Reset form
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
      dispatch(deleteGenericSchedule({ id, usecase_type: usecaseType })).then(
        () => dispatch(fetchGenericSchedule({ usecase_type: usecaseType }))
      );
    }
  };

  const handleToggle = (task) => {
    dispatch(
      toggleGenericSchedule({
        id: task.id,
        enabled: !task.enabled,
        usecase_type: usecaseType, // ✅ để slice tự refresh list
      })
    ).then(() =>
      dispatch(fetchGenericSchedule({ usecase_type: usecaseType }))
    );
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      <Row className="mb-3">
        <Col md={3}>
          <label className="form-label fw-semibold">Use case</label>
          <Select
            options={USECASE_OPTIONS}
            value={USECASE_OPTIONS.find((o) => o.value === usecaseType)}
            onChange={(opt) => setUsecaseType(opt?.value || "causecode")}
          />
        </Col>
      </Row>

      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <label className="form-label">Tên lịch</label>
                  <FormControl
                    placeholder="VD: pgw_cc_native"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <label className="form-label">Start time</label>
                  <FormControl
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <label className="form-label">Platform</label>
                  <FormControl
                    as="select"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    <option value="">-- Chọn platform --</option>
                    {platforms.map((p, i) => (
                      <option key={i} value={p.name}>
                        {p.name} ({p.device_count})
                      </option>
                    ))}
                  </FormControl>
                </Col>
                <Col md={3}>
                  <label className="form-label">Thiết bị</label>
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

              <Row className="mb-3">
                <Col md={4}>
                  <label className="form-label">Cron</label>
                  <FormControl
                    placeholder="*/5 * * * *"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                  />
                </Col>
                <Col md={3} className="d-flex align-items-end gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSubmitSchedule}
                    // ✅ disable theo loading của usecase hiện tại
                    disabled={genericLoading}
                  >
                    {editingTask ? "Lưu thay đổi" : "Đặt lịch"}
                  </Button>
                  {editingTask && (
                    <Button
                      variant="secondary"
                      onClick={() => setEditingTask(null)}
                    >
                      Huỷ
                    </Button>
                  )}
                </Col>
              </Row>

              <hr />
              <h5>📋 Lịch {USECASE_LABEL[usecaseType] || usecaseType}:</h5>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Use case</th>
                    <th>Platform</th>
                    <th>Cron</th>
                    <th>Thiết bị</th>
                    <th>Trạng thái</th>
                    <th>Chạy gần nhất</th>
                    <th>Kết quả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        Không có lịch nào
                      </td>
                    </tr>
                  ) : (
                    rows.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{USECASE_LABEL[s.usecase] || s.usecase}</td>
                        <td>{s.platform}</td>
                        <td>{s.cron}</td>
                        <td>{(s.node_names || []).join(", ")}</td>
                        <td>
                          <Button
                            variant={s.enabled ? "success" : "secondary"}
                            size="sm"
                            onClick={() => handleToggle(s)}
                          >
                            {s.enabled ? "🟢 Bật" : "🔴 Tắt"}
                          </Button>
                        </td>
                        <td>
                          {s.last_run_at
                            ? dayjs(s.last_run_at).format("DD/MM/YYYY HH:mm")
                            : "Chưa chạy"}
                        </td>
                        <td>
                          {s.result_summary || (
                            <StatusBadge status={s.last_run_status} />
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="warning"
                            className="me-2"
                            onClick={() => handleEdit(s)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            🗑️
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

const ScheduleGeneric = () => (
  <Provider store={snocStore}>
    <ScheduleGenericContent />
  </Provider>
);

export default ScheduleGeneric;
