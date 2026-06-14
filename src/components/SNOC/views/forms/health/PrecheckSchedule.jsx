// pages/Precheck/PrecheckSchedule.jsx
// ✅ Dùng genericScheduleSlice thunks — giống ScheduleGeneric.js
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Badge, Button, Card, Col, Form, FormControl,
  InputGroup, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

// ✅ Dùng genericScheduleSlice — giống ScheduleGeneric.js
import {
  createGenericSchedule,
  deleteGenericSchedule,
  fetchGenericSchedule,
  selectGenericLoadingByType,
  selectGenericSchedulesByType,
  toggleGenericSchedule,
  updateGenericSchedule,
} from "../../../redux/KPI/genericScheduleSlice";
import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups }       from "../../../redux/User/groupSlice";
// ✅ getJwtClaims từ snocApiWithAutoToken
import { getJwtClaims }     from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth      from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── Constants ──────────────────────────────────────────────────────────────
const USECASE_TYPE = "precheck";

const DEFAULT_FORM = {
  name: "", platform: "", node_names: [],
  cron: "0 6 * * *", action: "precheck",
  department: "", group: "",
};

const MULTI_SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const StatusBadge = ({ status }) => {
  const map = {
    success: { label: "All OK",       color: "success",   icon: "✅" },
    warning: { label: "Partial/NOK",  color: "warning",   icon: "⚠️" },
    failed:  { label: "Lỗi thực thi", color: "danger",    icon: "🔴" },
    null:    { label: "Chưa chạy",    color: "secondary", icon: "⏳" },
  };
  const s = map[status] || map.null;
  return <Badge bg={s.color}>{s.icon} {s.label}</Badge>;
};

// ── Component ──────────────────────────────────────────────────────────────
const PrecheckSchedule = () => {
  const dispatch = useDispatch();

  // ✅ RBAC — giống ScheduleGeneric.js
  const userClaims = useMemo(() => getJwtClaims(), []);
  const isAdmin    = useMemo(
    () => userClaims?.role === "super" || userClaims?.is_superuser,
    [userClaims]
  );
  const checkCanAction = (task) =>
    isAdmin || task.owner_group === userClaims?.group_name;

  // Selectors
  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const { departments = [] } = useSelector((s) => s.department || {});
  const { groups = []      } = useSelector((s) => s.group      || {});

  // ✅ Dùng genericScheduleSlice selectors — giống ScheduleGeneric.js
  const formBusy  = useSelector((s) => selectGenericLoadingByType(s, USECASE_TYPE));
  const allRows   = useSelector((s) => selectGenericSchedulesByType(s, USECASE_TYPE));

  const sortedRows = useMemo(() =>
    [...(allRows || [])].sort((a, b) => {
      const ta = a?.last_run_at ? Date.parse(a.last_run_at) : -Infinity;
      const tb = b?.last_run_at ? Date.parse(b.last_run_at) : -Infinity;
      return tb - ta;
    }),
    [allRows]
  );

  // Modal state
  const [showModal,        setShowModal]        = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [editingTask,      setEditingTask]      = useState(null);
  const [deletingTask,     setDeletingTask]     = useState(null);

  // Form state
  const [form,                   setForm]                   = useState(DEFAULT_FORM);
  const [selectedPlatformOption, setSelectedPlatformOption] = useState(null);
  const [selectedDevices,        setSelectedDevices]        = useState([]);
  const isEditingRef = useRef(false);

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
    // ✅ fetch đúng usecase_type — giống ScheduleGeneric.js
    dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
  }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatformOption?.value;
    if (val) dispatch(fetchDevicesByPlatform(val));
    if (!isEditingRef.current) setSelectedDevices([]);
    isEditingRef.current = false;
  }, [dispatch, selectedPlatformOption]);

  // ── Derived ────────────────────────────────────────────────────────────
  const platformOptions = useMemo(() =>
    platforms.map((p) => ({ label: `${p.name} (${p.device_count ?? 0})`, value: p.name })),
    [platforms]
  );

  const deviceOptions = useMemo(() =>
    devices.map((d) => ({ label: `${d.name} (${d.ip || "—"})`, value: d.name })),
    [devices]
  );

  const combinedDeviceOptions = useMemo(() => [
    { label: "-- Chọn tất cả --", value: "__all__" },
    ...deviceOptions,
  ], [deviceOptions]);

  const displayGroups = useMemo(() => {
    if (!form.department) return groups;
    return groups.filter((g) =>
      String(g.department?.id || g.department) === String(form.department)
    );
  }, [groups, form.department]);

  const departmentOptions = useMemo(() =>
    departments.map((d) => ({ label: d.name, value: String(d.id) }))
  , [departments]);

  const groupOptions = useMemo(() =>
    displayGroups.map((g) => ({ label: g.name, value: String(g.id) }))
  , [displayGroups]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((o) => o.value === "__all__")) setSelectedDevices(deviceOptions);
    else setSelectedDevices(selected);
  };

  const openCreate = () => {
    isEditingRef.current = false;
    setEditingTask(null);
    const deptId = userClaims?.department_id
      ?? groups.find((g) => g.id === Number(userClaims?.group_id))?.department?.id
      ?? "";
    setForm({
      ...DEFAULT_FORM,
      department: !isAdmin ? deptId : "",
      group:      !isAdmin ? (userClaims?.group_id ?? "") : "",
    });
    setSelectedPlatformOption(null);
    setSelectedDevices([]);
    setShowModal(true);
  };

  const openEdit = useCallback((task) => {
    isEditingRef.current = true;
    setEditingTask(task);
    const deptObj  = departments.find((d) => d.name === task.department);
    const groupObj = groups.find((g) => g.name === task.owner_group);
    setForm({
      name:       task.name        || "",
      cron:       task.cron        || "",
      action:     task.action      || "precheck",
      department: deptObj?.id      || "",
      group:      groupObj?.id     || "",
      platform:   task.platform    || "",
      node_names: task.node_names  || [],
    });
    const platVal = task.platform || null;
    setSelectedPlatformOption(platVal ? { label: platVal, value: platVal } : null);
    setSelectedDevices((task.node_names || []).map((d) => ({ label: d, value: d })));
    if (platVal) dispatch(fetchDevicesByPlatform(platVal));
    setShowModal(true);
  }, [departments, groups, dispatch]);

  const openDelete = useCallback((task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  }, []);

  // ✅ toggle dùng toggleGenericSchedule — giống ScheduleGeneric.js
  const handleToggle = useCallback((task) => {
    dispatch(toggleGenericSchedule({
      id: task.id, enabled: !task.enabled, usecase_type: USECASE_TYPE,
    })).then(() => dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE })));
  }, [dispatch]);

  // ✅ submit dùng createGenericSchedule / updateGenericSchedule
  const handleSubmit = () => {
    const selectedNames = selectedDevices.map((d) => d.value);
    if (!form.name || !selectedPlatformOption || !form.cron || selectedNames.length === 0) {
      alert("Vui lòng nhập đầy đủ: Tên, Platform, Thiết bị, Cron");
      return;
    }
    if (form.cron.trim().split(/\s+/).length !== 5) {
      alert("Cron không hợp lệ. Định dạng: */5 * * * * (5 phần)");
      return;
    }

    const payload = {
      name:         form.name,
      platform:     selectedPlatformOption.value,
      node_names:   selectedNames,
      cron:         form.cron,
      start_time:   dayjs().second(0).millisecond(0).format("YYYY-MM-DDTHH:mm:ssZ"),
      usecase_type: USECASE_TYPE,           // ← field backend đọc
      action:       "precheck",
      group:        form.group      || null,
      department:   form.department || null,
    };

    if (editingTask) {
      dispatch(updateGenericSchedule({ id: editingTask.id, ...payload }))
        .then(() => {
          dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
          setShowModal(false);
        });
    } else {
      dispatch(createGenericSchedule(payload))
        .then(() => {
          dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
          setShowModal(false);
        });
    }
  };

  const onConfirmDelete = () => {
    if (!deletingTask) return;
    dispatch(deleteGenericSchedule({ id: deletingTask.id, usecase_type: USECASE_TYPE }))
      .then(() => {
        dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
        setShowDeleteModal(false);
        setDeletingTask(null);
      });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      {/* ── CREATE / EDIT MODAL ─────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTask ? `Sửa lịch: ${editingTask.name}` : "Tạo lịch PRECHECK"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Row 1: Dept + Group */}
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label className="fw-bold">Department</Form.Label>
              <Select
                options={departmentOptions}
                value={departmentOptions.find((o) => o.value === String(form.department)) || null}
                onChange={(opt) => {
                  const newDept = opt?.value || "";
                  const filtered = groups.filter((g) =>
                    String(g.department?.id || g.department) === String(newDept)
                  );
                  setForm((p) => ({
                    ...p, department: newDept,
                    group: filtered.length === 1 ? String(filtered[0].id) : "",
                  }));
                }}
                placeholder="-- Chọn Department --"
                isClearable
                isDisabled={!isAdmin}
                styles={MULTI_SELECT_STYLES}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">Group</Form.Label>
              <Select
                options={groupOptions}
                value={groupOptions.find((o) => o.value === String(form.group)) || null}
                onChange={(opt) => setForm((p) => ({ ...p, group: opt?.value || "" }))}
                placeholder="-- Chọn Group --"
                isClearable
                isDisabled={!isAdmin}
                styles={MULTI_SELECT_STYLES}
              />
            </Col>
          </Row>

          {/* Row 2: Tên + Cron */}
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label>Tên lịch <span className="text-danger">*</span></Form.Label>
              <FormControl
                placeholder="VD: precheck_pgw_daily_6am"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Cron <span className="text-danger">*</span></Form.Label>
              <FormControl
                placeholder="0 6 * * *"
                value={form.cron}
                onChange={(e) => setForm((p) => ({ ...p, cron: e.target.value }))}
              />
              <Form.Text className="text-muted">
                <code>0 6 * * *</code> = 6:00 sáng hàng ngày &nbsp;|&nbsp;
                <code>0 2 * * 1</code> = 2:00 sáng thứ Hai
              </Form.Text>
            </Col>
          </Row>

          {/* Row 3: Platform */}
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label>Platform <span className="text-danger">*</span></Form.Label>
              <Select
                options={platformOptions}
                value={selectedPlatformOption}
                onChange={(opt) => {
                  isEditingRef.current = !!editingTask;
                  setSelectedPlatformOption(opt);
                  setForm((p) => ({ ...p, platform: opt?.value || "" }));
                }}
                placeholder="-- Tìm platform --"
                isClearable isSearchable
              />
            </Col>
            <Col md={6}>
              <Form.Label>Action</Form.Label>
              <FormControl value="precheck" disabled />
            </Col>
          </Row>

          {/* Row 4: Devices */}
          <Row className="g-2">
            <Col md={12}>
              <Form.Label>Thiết bị <span className="text-danger">*</span></Form.Label>
              <Select
                isMulti isSearchable
                closeMenuOnSelect={false} hideSelectedOptions={false}
                options={combinedDeviceOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="-- Chọn thiết bị --"
                isDisabled={!selectedPlatformOption}
                isLoading={loadingDevices}
                styles={MULTI_SELECT_STYLES}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={formBusy}>Hủy</Button>
          <Button
            variant={editingTask ? "warning" : "primary"}
            onClick={handleSubmit}
            disabled={formBusy}
          >
            {formBusy
              ? <Spinner size="sm" animation="border"/>
              : editingTask ? "Cập nhật" : "Tạo lịch"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── DELETE MODAL ────────────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Xóa lịch <strong>{deletingTask?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={onConfirmDelete} disabled={formBusy}>
            {formBusy ? <Spinner size="sm" animation="border"/> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── MAIN CARD ───────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">📅 Lịch Precheck tự động</span>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }))}
              disabled={formBusy}
            >
              Reload
            </Button>
            <Button variant="primary" onClick={openCreate} disabled={formBusy}>
              + Tạo lịch
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <Table striped bordered hover responsive size="sm" className="align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Tên</th>
                <th>Platform</th>
                <th>Cron</th>
                <th>Thiết bị</th>
                <th>ON/OFF</th>
                <th>Kết quả</th>
                <th>Lần chạy cuối</th>
                {isAdmin && <th>Group</th>}
                {isAdmin && <th>Creator</th>}
                <th style={{ width: 100 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 8} className="text-center text-muted py-3">
                    {formBusy ? <Spinner size="sm" animation="border"/> : "Không có lịch nào"}
                  </td>
                </tr>
              ) : sortedRows.map((row) => {
                const canAct = checkCanAction(row);
                return (
                  <tr key={row.id}>
                    <td className="fw-bold">{row.name}</td>
                    <td><code>{row.platform}</code></td>
                    <td><code style={{ fontSize: "0.8rem" }}>{row.cron}</code></td>
                    <td
                      className="text-truncate" style={{ maxWidth: 160 }}
                      title={(row.node_names || []).join(", ")}
                    >
                      {(row.node_names || []).length > 0
                        ? `${row.node_names[0]}${row.node_names.length > 1 ? ` +${row.node_names.length - 1}` : ""}`
                        : "—"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={row.enabled ? "success" : "secondary"}
                        disabled={!canAct || formBusy}
                        onClick={() => handleToggle(row)}
                      >
                        {row.enabled ? "ON" : "OFF"}
                      </Button>
                    </td>
                    <td><StatusBadge status={row.last_run_status}/></td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                      {fmtDate(row.last_run_at)}
                    </td>
                    {isAdmin && (
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {row.owner_group || "—"}
                        </Badge>
                      </td>
                    )}
                    {isAdmin && (
                      <td style={{ fontSize: "0.82rem" }}>{row.creator_email || "—"}</td>
                    )}
                    <td>
                      {canAct ? (
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-warning"
                            onClick={() => openEdit(row)}>✏️</Button>
                          <Button size="sm" variant="outline-danger"
                            onClick={() => openDelete(row)}>🗑️</Button>
                        </div>
                      ) : (
                        <span className="text-muted small">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
        {sortedRows.length > 0 && (
          <Card.Footer className="py-1">
            <small className="text-muted">
              {sortedRows.length} lịch •{" "}
              {sortedRows.filter((r) => r.enabled).length} đang bật
            </small>
          </Card.Footer>
        )}
      </Card>
    </>
  );
};

export default PrecheckSchedule;
