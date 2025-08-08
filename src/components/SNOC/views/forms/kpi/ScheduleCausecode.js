import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, FormControl, Row, Table } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  createGenericSchedule,
  deleteGenericSchedule,
  fetchGenericSchedule,
  toggleGenericSchedule,
  updateGenericSchedule,
} from "../../../redux/Healthcheck/healthcheckSlice";
import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";
import snocStore from "../../../store/snocStore";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const USECASE_TYPE = "causecode";

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

const ScheduleCausecodeContent = () => {
  useScheduleWebSocket("causecode_updates");
  const dispatch = useDispatch();
  const { platforms, devices } = useSelector((state) => state.platformDevice);
  const { genericSchedules, scheduleCreating } = useSelector(
    (state) => state.pscore
  );

  const [name, setName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [cronExpression, setCronExpression] = useState("");
  const [startTime, setStartTime] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE })); // ✅ truyền object
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
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
      usecase_type: USECASE_TYPE,
    };

    if (editingTask) {
      dispatch(updateGenericSchedule({ id: editingTask.id, ...payload })).then(
        () => {
          dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
          setEditingTask(null);
        }
      );
    } else {
      dispatch(createGenericSchedule(payload)).then(() =>
        dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }))
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
      dispatch(deleteGenericSchedule({ id, usecase_type: USECASE_TYPE })).then(
        () => dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }))
      );
    }
  };

  const handleToggle = (task) => {
    dispatch(
      toggleGenericSchedule({
        id: task.id,
        enabled: !task.enabled,
        usecase_type: USECASE_TYPE,
      })
    ).then(() =>
      dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }))
    );
  };

  // Lấy list từ genericSchedules theo usecase_type
  const causecodeTasks = genericSchedules[USECASE_TYPE] || [];

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <FormControl
                    placeholder="Tên lịch"
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
                    {editingTask ? "Lưu thay đổi" : "Đặt lịch"}
                  </Button>
                  {editingTask && (
                    <Button
                      variant="secondary"
                      className="ms-2"
                      onClick={() => setEditingTask(null)}
                    >
                      Huỷ
                    </Button>
                  )}
                </Col>
              </Row>
              <hr />
              <h5>📋 Lịch CauseCode:</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên</th>
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
                  {causecodeTasks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Không có lịch nào
                      </td>
                    </tr>
                  ) : (
                    causecodeTasks.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.platform}</td>
                        <td>{s.cron}</td>
                        <td>{s.node_names.join(", ")}</td>
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

const ScheduleCausecode = () => (
  <Provider store={snocStore}>
    <ScheduleCausecodeContent />
  </Provider>
);

export default ScheduleCausecode;
