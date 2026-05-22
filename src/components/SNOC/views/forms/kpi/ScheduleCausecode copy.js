import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { USECASE_TYPES, getColumns } from "./schedule_config";
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
  const [activeType, setActiveType] = useState("kpi"); // Mặc định là kpi, có thể chọn dhtt
  // action (biến thể trong nhóm KPI), mặc định "causecode"
  const [action, setAction] = useState("causecode");

  // Store platform/device
  const { platforms = [], devices = [] } = useSelector(
    (state) => state.platformDevice || {},
  );

  // Loading theo nhóm KPI
  const formBusy = useSelector((state) =>
    selectGenericLoadingByType(state, "kpi"),
  );

  // BẢNG: chỉ hiển thị KPI
  // const rowsKpi = useSelector((state) =>
  //   selectGenericSchedulesByType(state, "kpi")
  // );
  const rows = useSelector((state) =>
    selectGenericSchedulesByType(state, activeType),
  );

  const currentRows = useSelector((state) =>
    selectGenericSchedulesByType(state, activeType),
  );

  const allRows = useMemo(() => {
    // Sử dụng currentRows thay vì rowsKpi
    const merged = [...(currentRows || [])];
    return merged.sort((a, b) => {
      const ta = a?.last_run_at ? Date.parse(a.last_run_at) : -Infinity;
      const tb = b?.last_run_at ? Date.parse(b.last_run_at) : -Infinity;
      return tb - ta;
    });
  }, [currentRows]); // Dependency change

  // Init platforms
  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Khi mount → fetch KPI
  useEffect(() => {
    dispatch(fetchGenericSchedule({ usecase_type: activeType }));
  }, [dispatch, activeType]);

  // Action options phụ thuộc platform
  const actionOptions = useMemo(
    () => getUsecaseOptionsForPlatform(selectedPlatform),
    [selectedPlatform],
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
        : actionOptions[0]?.value || "causecode",
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
    [devices],
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

    // 1. Kiểm tra các trường bắt buộc chung (không check action ở đây)
    if (
      !name ||
      !selectedPlatform ||
      !cronExpression ||
      selectedNames.length === 0
    ) {
      alert("Vui lòng nhập đầy đủ thông tin (Tên, Platform, Thiết bị, Cron).");
      return;
    }

    if (!validateCron(cronExpression)) {
      alert("Cron không hợp lệ. Định dạng đúng: */5 * * * *");
      return;
    }

    // 2. Xử lý Action và Validation riêng rẽ theo từng Usecase
    let finalAction = action;

    if (activeType === "kpi") {
      if (actionOptions.length === 0) {
        alert("Platform này hiện chưa hỗ trợ Action KPI theo cấu hình.");
        return;
      }
      if (!action) {
        alert("Vui lòng chọn Action.");
        return;
      }
      if (!isUsecaseAllowed(selectedPlatform, action)) {
        alert("Action không hợp lệ với platform đã chọn.");
        return;
      }
      finalAction = action;
    } else if (activeType === "dhtt") {
      // Với DHTT, ta ép cứng action và bỏ qua check isUsecaseAllowed
      finalAction = "dhtt_sync";
    }

    // 3. Khởi tạo Start Time
    const defaultStartTime = dayjs()
      .second(0)
      .millisecond(0)
      .format("YYYY-MM-DDTHH:mm:ssZ");

    // 4. Tạo Payload dùng chung cho cả Create và Update
    const payload = {
      name,
      platform: selectedPlatform,
      node_names: selectedNames,
      cron: cronExpression,
      start_time: defaultStartTime,
      usecase_type: activeType, // Lấy động từ Tab hiện tại
      action: finalAction, // Lấy action đã xử lý logic ở bước 2
    };

    // 5. Submit qua Redux
    if (editingTask) {
      // UPDATE
      dispatch(updateGenericSchedule({ id: editingTask.id, ...payload })).then(
        () => {
          // Đổi chữ "kpi" cứng thành activeType để bảng tự làm mới đúng Tab
          dispatch(fetchGenericSchedule({ usecase_type: activeType }));
          resetForm();
        },
      );
    } else {
      // CREATE
      dispatch(createGenericSchedule(payload)).then(() => {
        // Đổi chữ "kpi" cứng thành activeType
        dispatch(fetchGenericSchedule({ usecase_type: activeType }));
        resetForm();
      });
    }
  };

  // const handleEdit = (task) => {
  //   setName(task.name);
  //   setSelectedPlatform(task.platform);

  //   const ok = task.action && isUsecaseAllowed(task.platform, task.action);
  //   const fallback =
  //     getUsecaseOptionsForPlatform(task.platform)[0]?.value || "causecode";
  //   setAction(ok ? task.action : fallback);

  //   setSelectedDevices(
  //     (task.node_names || []).map((d) => ({ label: d, value: d }))
  //   );
  //   setCronExpression(task.cron);
  //   setEditingTask(task);
  // };

  // const handleDelete = (task) => {
  //   const id = task.id;
  //   const type = "kpi";
  //   if (window.confirm("Bạn có chắc muốn xoá lịch này không?")) {
  //     dispatch(deleteGenericSchedule({ id, usecase_type: type })).then(() => {
  //       dispatch(fetchGenericSchedule({ usecase_type: type }));
  //     });
  //   }
  // };

  // const handleToggle = (task) => {
  //   const type = "kpi";
  //   dispatch(
  //     toggleGenericSchedule({
  //       id: task.id,
  //       enabled: !task.enabled,
  //       usecase_type: type,
  //     })
  //   ).then(() => dispatch(fetchGenericSchedule({ usecase_type: type })));
  // };

  // const columns = useMemo(
  //   () => getColumns(handleToggle, handleEdit, handleDelete),
  //   [handleToggle, handleEdit, handleDelete]
  // );

  const handleEdit = useCallback(
    (task) => {
      setName(task.name);
      setSelectedPlatform(task.platform);

      const ok = task.action && isUsecaseAllowed(task.platform, task.action);
      const fallback =
        getUsecaseOptionsForPlatform(task.platform)[0]?.value || "causecode";
      setAction(ok ? task.action : fallback);

      setSelectedDevices(
        (task.node_names || []).map((d) => ({ label: d, value: d })),
      );
      setCronExpression(task.cron);
      setEditingTask(task);
    },
    [
      /* liệt kê các hàm set state ở đây nếu ESLint yêu cầu, thường là empty hoặc: */ setName,
      setSelectedPlatform,
      setAction,
      setSelectedDevices,
      setCronExpression,
      setEditingTask,
    ],
  );

  const handleDelete = useCallback(
    (task) => {
      const id = task.id;
      const type = activeType; // Sử dụng activeType thay vì fix cứng "kpi" để đồng bộ dynamic
      if (window.confirm("Bạn có chắc muốn xoá lịch này không?")) {
        dispatch(deleteGenericSchedule({ id, usecase_type: type })).then(() => {
          dispatch(fetchGenericSchedule({ usecase_type: type }));
        });
      }
    },
    [dispatch, activeType],
  ); // Thêm các phụ thuộc mà hàm này sử dụng

  const handleToggle = useCallback(
    (task) => {
      const type = activeType;
      dispatch(
        toggleGenericSchedule({
          id: task.id,
          enabled: !task.enabled,
          usecase_type: type,
        }),
      ).then(() => dispatch(fetchGenericSchedule({ usecase_type: type })));
    },
    [dispatch, activeType],
  );

  // Bây giờ columns sẽ không còn bị cảnh báo vàng nữa
  const columns = useMemo(
    () => getColumns(handleToggle, handleEdit, handleDelete),
    [handleToggle, handleEdit, handleDelete],
  );

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
      {/* Render các Tab động */}
      <div className="mb-3 d-flex gap-2">
        {USECASE_TYPES.map((type) => (
          <Button
            key={type.id}
            variant={
              activeType === type.id ? type.color : `outline-${type.color}`
            }
            onClick={() => setActiveType(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Render Bảng động */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allRows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={`${row.id}-${col.key}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default ScheduleGeneric;
