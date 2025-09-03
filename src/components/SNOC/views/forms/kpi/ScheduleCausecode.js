import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, FormControl, Row, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleKpiWebSocket from "../../../hooks/useScheduleKpiWebSocket";

import {
  createGenericSchedule,
  deleteGenericSchedule,
  fetchGenericSchedule,
  selectGenericLoadingByType,
  // selectors
  selectGenericSchedulesByType,
  toggleGenericSchedule,
  updateGenericSchedule,
} from "../../../redux/KPI/genericScheduleSlice";

import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";

import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// Action options theo platform
import {
  getUsecaseOptionsForPlatform,
  isUsecaseAllowed,
} from "./platformUsecases";

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

const ScheduleGeneric = () => {
  const dispatch = useDispatch();

  // WS chỉ nghe status (last_run_at/status)
  useScheduleKpiWebSocket({ endpoint: "schedule", silent: true });

  // Form state
  const [name, setName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [cronExpression, setCronExpression] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // action (biến thể trong nhóm KPI), mặc định "causecode"
  const [action, setAction] = useState("causecode");

  // Store platform/device
  const { platforms = [], devices = [] } = useSelector(
    (state) => state.platformDevice || {}
  );

  // Loading theo nhóm KPI
  const formBusy = useSelector((state) =>
    selectGenericLoadingByType(state, "kpi")
  );

  // BẢNG: chỉ hiển thị KPI
  const rowsKpi = useSelector((state) =>
    selectGenericSchedulesByType(state, "kpi")
  );

  const allRows = useMemo(() => {
    const merged = [...(rowsKpi || [])];
    return merged.sort((a, b) => {
      const ta = a?.last_run_at ? Date.parse(a.last_run_at) : -Infinity;
      const tb = b?.last_run_at ? Date.parse(b.last_run_at) : -Infinity;
      return tb - ta;
    });
  }, [rowsKpi]);

  // Init platforms
  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Khi mount → fetch KPI
  useEffect(() => {
    dispatch(fetchGenericSchedule({ usecase_type: "kpi" }));
  }, [dispatch]);

  // Action options phụ thuộc platform
  const actionOptions = useMemo(
    () => getUsecaseOptionsForPlatform(selectedPlatform),
    [selectedPlatform]
  );
  const actionDisabled = actionOptions.length === 0;

  // Đồng bộ action khi đổi platform
  useEffect(() => {
    if (!selectedPlatform) {
      setAction("causecode");
      return;
    }
    if (actionOptions.length === 0) {
      setAction("causecode");
      return;
    }
    setAction((prev) =>
      prev && isUsecaseAllowed(selectedPlatform, prev)
        ? prev
        : actionOptions[0]?.value || "causecode"
    );
  }, [selectedPlatform, actionOptions]);

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

  const validateCron = (expression) =>
    expression.trim().split(/\s+/).length === 5;

  const resetForm = () => {
    setEditingTask(null);
    setName("");
    setSelectedPlatform("");
    setSelectedDevices([]);
    setCronExpression("");
    setAction("causecode");
  };

  const handleSubmitSchedule = () => {
    const selectedNames = selectedDevices.map((d) => d.value);

    if (actionOptions.length === 0) {
      alert("Platform này hiện chưa hỗ trợ Action theo cấu hình.");
      return;
    }

    if (
      !name ||
      !selectedPlatform ||
      !action ||
      !cronExpression ||
      selectedNames.length === 0
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!isUsecaseAllowed(selectedPlatform, action)) {
      alert("Action không hợp lệ với platform đã chọn.");
      return;
    }

    if (!validateCron(cronExpression)) {
      alert("Cron không hợp lệ. Định dạng đúng: */5 * * * *");
      return;
    }

    // ⏰ start_time mặc định: "bây giờ" (local, có offset, làm tròn giây)
    const defaultStartTime = dayjs()
      .second(0)
      .millisecond(0)
      .format("YYYY-MM-DDTHH:mm:ssZ");

    if (editingTask) {
      // UPDATE: theo yêu cầu, cũng reset start_time = now
      const payload = {
        name,
        platform: selectedPlatform,
        node_names: selectedNames,
        cron: cronExpression,
        start_time: defaultStartTime,
        usecase_type: "kpi",
        action,
      };
      dispatch(updateGenericSchedule({ id: editingTask.id, ...payload })).then(
        () => {
          dispatch(fetchGenericSchedule({ usecase_type: "kpi" }));
          resetForm();
        }
      );
    } else {
      // CREATE: gửi start_time = now
      const payload = {
        name,
        platform: selectedPlatform,
        node_names: selectedNames,
        cron: cronExpression,
        start_time: defaultStartTime,
        usecase_type: "kpi",
        action,
      };
      dispatch(createGenericSchedule(payload)).then(() => {
        dispatch(fetchGenericSchedule({ usecase_type: "kpi" }));
        resetForm();
      });
    }
  };

  const handleEdit = (task) => {
    setName(task.name);
    setSelectedPlatform(task.platform);

    const ok = task.action && isUsecaseAllowed(task.platform, task.action);
    const fallback =
      getUsecaseOptionsForPlatform(task.platform)[0]?.value || "causecode";
    setAction(ok ? task.action : fallback);

    setSelectedDevices(
      (task.node_names || []).map((d) => ({ label: d, value: d }))
    );
    setCronExpression(task.cron);
    setEditingTask(task);
  };

  const handleDelete = (task) => {
    const id = task.id;
    const type = "kpi";
    if (window.confirm("Bạn có chắc muốn xoá lịch này không?")) {
      dispatch(deleteGenericSchedule({ id, usecase_type: type })).then(() => {
        dispatch(fetchGenericSchedule({ usecase_type: type }));
      });
    }
  };

  const handleToggle = (task) => {
    const type = "kpi";
    dispatch(
      toggleGenericSchedule({
        id: task.id,
        enabled: !task.enabled,
        usecase_type: type,
      })
    ).then(() => dispatch(fetchGenericSchedule({ usecase_type: type })));
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      {/* Form tạo/sửa */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
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
              {actionDisabled && selectedPlatform && (
                <div className="text-muted small mt-1">
                  Platform này hiện chưa hỗ trợ Action.
                </div>
              )}
            </Col>

            <Col md={4}>
              <label className="form-label">Action</label>
              <Select
                options={actionOptions}
                value={actionOptions.find((o) => o.value === action) || null}
                onChange={(opt) => setAction(opt?.value || "causecode")}
                isDisabled={actionDisabled}
                placeholder={
                  actionDisabled
                    ? "Chưa có action cho platform này"
                    : "-- Chọn action --"
                }
              />
            </Col>

            <Col md={4}>
              <label className="form-label">Tên lịch</label>
              <FormControl
                placeholder="VD: pgw_kpi_causecode_5m"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
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
            <Col md={3}>
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
                disabled={formBusy}
              >
                {editingTask ? "Lưu thay đổi" : "Đặt lịch"}
              </Button>
              {editingTask && (
                <Button variant="secondary" onClick={resetForm}>
                  Huỷ
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bảng KPI */}
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body>
              <h5>📋 Tất cả lịch KPI</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Action</th>
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
                  {allRows.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        Không có lịch nào
                      </td>
                    </tr>
                  ) : (
                    allRows.map((s) => (
                      <tr key={`kpi:${s.id}`}>
                        <td>{s.name}</td>
                        <td>{s.action || "causecode"}</td>
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
                            onClick={() => handleDelete(s)}
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

export default ScheduleGeneric;
