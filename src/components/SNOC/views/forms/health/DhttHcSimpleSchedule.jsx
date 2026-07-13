import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Badge, Button, Card, Col, Form, FormControl,
  Modal, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import useScheduleKpiWebSocket from "../../../hooks/useScheduleKpiWebSocket";
import {
  createGenericSchedule, deleteGenericSchedule, fetchGenericSchedule,
  selectGenericLoadingByType, selectGenericSchedulesByType,
  toggleGenericSchedule, updateGenericSchedule,
} from "../../../redux/KPI/genericScheduleSlice";
import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups }      from "../../../redux/User/groupSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const USECASE_TYPE = "dhtt_hc_simple";

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
    skipped: { label: "Skipped",      color: "secondary", icon: "⏭️" },
    null:    { label: "Chưa chạy",    color: "secondary", icon: "⏳" },
  };
  const s = map[status] || map.null;
  return <Badge bg={s.color}>{s.icon} {s.label}</Badge>;
};

const DEFAULT_FORM = { name: "", platform: "", node_names: [], cron: "", department: "", group: "" };

const DhttHcSimpleSchedule = () => {
  const dispatch = useDispatch();
  useScheduleKpiWebSocket({ endpoint: "schedule", silent: true });

  const userClaims = useMemo(() => getJwtClaims(), []);
  const isAdmin    = useMemo(() =>
    userClaims?.is_superuser || ["super", "admin"].includes(userClaims?.role),
  [userClaims]);
  const checkCanAction = (task) => isAdmin || task.owner_group === userClaims?.group_name;

  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const { departments = [] } = useSelector((s) => s.department || {});
  const { groups = []      } = useSelector((s) => s.group      || {});

  const rows  = useSelector((s) => selectGenericSchedulesByType(s, USECASE_TYPE)) || [];
  const busy  = useSelector((s) => selectGenericLoadingByType(s, USECASE_TYPE));

  const allRows = useMemo(() =>
    [...rows].sort((a, b) => {
      const ta = a?.last_run_at ? Date.parse(a.last_run_at) : -Infinity;
      const tb = b?.last_run_at ? Date.parse(b.last_run_at) : -Infinity;
      return tb - ta;
    }),
  [rows]);

  const [showModal,       setShowModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask,     setEditingTask]     = useState(null);
  const [deletingTask,    setDeletingTask]    = useState(null);
  const [form,            setForm]            = useState(DEFAULT_FORM);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedDevices,  setSelectedDevices]  = useState([]);
  const isEditingRef = useRef(false);

  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
    dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform?.value) dispatch(fetchDevicesByPlatform(selectedPlatform.value));
    if (!isEditingRef.current) setSelectedDevices([]);
    isEditingRef.current = false;
  }, [dispatch, selectedPlatform]);

  const platformOptions = useMemo(() =>
    platforms.map(p => ({ label: `${p.name} (${p.device_count ?? 0})`, value: p.name })),
  [platforms]);

  const displayGroups = useMemo(() => {
    if (!form.department) return groups;
    return groups.filter(g => String(g.department?.id || g.department) === String(form.department));
  }, [groups, form.department]);

  const deviceOptions = useMemo(() =>
    devices.map(d => ({ label: `${d.name} (${d.ip || "no-ip"})`, value: d.name })),
  [devices]);

  const combinedDeviceOptions = useMemo(() => [
    { label: "-- Chọn tất cả --", value: "__all__" }, ...deviceOptions,
  ], [deviceOptions]);

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find(o => o.value === "__all__")) setSelectedDevices(deviceOptions);
    else setSelectedDevices(selected);
  };

  const openCreate = () => {
    isEditingRef.current = false;
    setEditingTask(null);
    const deptId = userClaims?.department_id
      ?? groups.find(g => g.id === Number(userClaims?.group_id))?.department?.id
      ?? "";
    setForm({ ...DEFAULT_FORM, department: !isAdmin ? deptId : "", group: !isAdmin ? (userClaims?.group_id ?? "") : "" });
    setSelectedPlatform(null);
    setSelectedDevices([]);
    setShowModal(true);
  };

  const openEdit = useCallback((task) => {
    isEditingRef.current = true;
    setEditingTask(task);
    const deptObj  = departments.find(d => d.name === task.department);
    const groupObj = groups.find(g => g.name === task.owner_group);
    setForm({
      name: task.name || "", cron: task.cron || "",
      department: deptObj?.id || "", group: groupObj?.id || "",
      platform: task.platform || "", node_names: task.node_names || [],
    });
    const platVal = task.platform || null;
    setSelectedPlatform(platVal ? { label: platVal, value: platVal } : null);
    setSelectedDevices((task.node_names || []).map(d => ({ label: d, value: d })));
    if (platVal) dispatch(fetchDevicesByPlatform(platVal));
    setShowModal(true);
  }, [departments, groups, dispatch]);

  const openDelete = useCallback((task) => { setDeletingTask(task); setShowDeleteModal(true); }, []);

  const handleToggle = useCallback((task) => {
    dispatch(toggleGenericSchedule({ id: task.id, enabled: !task.enabled, usecase_type: USECASE_TYPE }))
      .then(() => dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE })));
  }, [dispatch]);

  const handleSubmit = () => {
    const selectedNames = selectedDevices.map(d => d.value);
    if (!form.name || !selectedPlatform || !form.cron || !selectedNames.length) {
      alert("Vui lòng nhập đầy đủ: Tên, Platform, Thiết bị, Cron");
      return;
    }
    if (form.cron.trim().split(/\s+/).length !== 5) {
      alert("Cron không hợp lệ. Định dạng: */5 * * * *");
      return;
    }

    const payload = {
      name:         form.name,
      platform:     selectedPlatform.value,
      node_names:   selectedNames,
      cron:         form.cron,
      start_time:   dayjs().second(0).millisecond(0).format("YYYY-MM-DDTHH:mm:ssZ"),
      usecase_type: USECASE_TYPE,
      action:       "dhtt_hc_simple_sync",
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

  return (
    <>
      <TopNavbarHealth />

      {/* ── Create / Edit Modal ──────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTask ? `Sửa lịch: ${editingTask.name}` : "Tạo lịch HC Simple"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label className="fw-bold">Department</Form.Label>
              <FormControl
                as="select"
                value={form.department}
                onChange={e => {
                  const newDept = e.target.value;
                  const filtered = groups.filter(g => String(g.department?.id || g.department) === String(newDept));
                  setForm(p => ({ ...p, department: newDept, group: filtered.length === 1 ? String(filtered[0].id) : "" }));
                }}
                disabled={!isAdmin}
              >
                <option value="">-- Chọn Department --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </FormControl>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">Group</Form.Label>
              <FormControl
                as="select"
                value={form.group}
                onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
                disabled={!isAdmin}
              >
                {(isAdmin || displayGroups.length > 1) && <option value="">-- Chọn Group --</option>}
                {displayGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </FormControl>
            </Col>
          </Row>
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label>Tên lịch <span className="text-danger">*</span></Form.Label>
              <FormControl
                placeholder="VD: hc_simple_cs_mss_daily"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Cron <span className="text-danger">*</span></Form.Label>
              <FormControl
                placeholder="0 6 * * *"
                value={form.cron}
                onChange={e => setForm(p => ({ ...p, cron: e.target.value }))}
              />
            </Col>
          </Row>
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label>Platform <span className="text-danger">*</span></Form.Label>
              <Select
                options={platformOptions}
                value={selectedPlatform}
                onChange={opt => {
                  isEditingRef.current = !!editingTask;
                  setSelectedPlatform(opt);
                  setForm(p => ({ ...p, platform: opt?.value || "" }));
                }}
                placeholder="-- Tìm platform --"
                isClearable
                styles={SELECT_STYLES}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Action</Form.Label>
              <FormControl value="dhtt_hc_simple_sync" disabled />
            </Col>
          </Row>
          <Row className="g-2">
            <Col md={12}>
              <Form.Label>Thiết bị <span className="text-danger">*</span></Form.Label>
              <Select
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={combinedDeviceOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="-- Chọn thiết bị --"
                isDisabled={!selectedPlatform}
                isLoading={loadingDevices}
                styles={SELECT_STYLES}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={busy}>Hủy</Button>
          <Button
            variant={editingTask ? "warning" : "primary"}
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? <Spinner size="sm" animation="border" /> : editingTask ? "Cập nhật" : "Tạo lịch"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Modal ──────────────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title>Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>Xóa lịch <strong>{deletingTask?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={onConfirmDelete} disabled={busy}>
            {busy ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Schedule Table ────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <Card.Title as="h5" className="mb-0">🛡️ Lịch Bảo Dưỡng HC Simple</Card.Title>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm"
              onClick={() => dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }))}
              disabled={busy}>
              Reload
            </Button>
            <Button variant="primary" size="sm" onClick={openCreate} disabled={busy}>
              + Tạo lịch
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive size="sm" className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Tên</th>
                <th>Platform</th>
                <th>Cron</th>
                <th>Thiết bị</th>
                <th>ON/OFF</th>
                <th>Kết quả</th>
                <th>Tóm tắt</th>
                <th>Lần chạy cuối</th>
                {isAdmin && <th>Group</th>}
                <th style={{ width: 100 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {allRows.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="text-center text-muted py-3">
                    Chưa có lịch nào
                  </td>
                </tr>
              ) : allRows.map(row => {
                const canAct = checkCanAction(row);
                return (
                  <tr key={row.id}>
                    <td className="fw-bold">{row.name}</td>
                    <td>{row.platform}</td>
                    <td><code>{row.cron}</code></td>
                    <td className="text-truncate" style={{ maxWidth: 160 }}
                      title={(row.node_names || []).join(", ")}>
                      {(row.node_names || []).length > 0
                        ? `${row.node_names[0]}${row.node_names.length > 1 ? ` +${row.node_names.length - 1}` : ""}`
                        : "—"}
                    </td>
                    <td>
                      <Button size="sm" variant={row.enabled ? "success" : "secondary"}
                        disabled={!canAct} onClick={() => handleToggle(row)}>
                        {row.enabled ? "ON" : "OFF"}
                      </Button>
                    </td>
                    <td><StatusBadge status={row.last_run_status} /></td>
                    <td style={{ fontSize: "0.78rem", maxWidth: 200, whiteSpace: "pre-wrap" }}>
                      {row.last_result_summary || "—"}
                    </td>
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
                    <td>
                      {canAct ? (
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-warning" onClick={() => openEdit(row)}>✏️</Button>
                          <Button size="sm" variant="outline-danger" onClick={() => openDelete(row)}>🗑️</Button>
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
      </Card>
    </>
  );
};

export default DhttHcSimpleSchedule;
