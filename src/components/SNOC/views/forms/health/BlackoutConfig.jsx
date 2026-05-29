import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, FormControl,
  InputGroup, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  createBlackout, deleteBlackout, fetchBlackouts,
  patchBlackout, toggleBlackout,
} from "../../../redux/Healthcheck/blackoutSlice";
import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups }      from "../../../redux/User/groupSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

// ── Constants ─────────────────────────────────────────────────────────────
const SCOPE_OPTIONS = [
  { value: "PLATFORM", label: "🖥️ Toàn bộ platform" },
  { value: "DEVICE",   label: "📟 Thiết bị cụ thể"  },
];
const TYPE_OPTIONS = [
  { value: "DAILY_WINDOW",  label: "🕐 Hàng ngày trong khung giờ" },
  { value: "WEEKLY_WINDOW", label: "📅 Ngày trong tuần + khung giờ" },
  { value: "DURATION",      label: "⏸️ Tạm dừng trong X phút" },
  { value: "UNTIL",         label: "⏰ Tạm dừng đến thời điểm" },
];
const DAY_OPTIONS = [
  { value: 0, label: "Thứ 2" },
  { value: 1, label: "Thứ 3" },
  { value: 2, label: "Thứ 4" },
  { value: 3, label: "Thứ 5" },
  { value: 4, label: "Thứ 6" },
  { value: 5, label: "Thứ 7" },
  { value: 6, label: "Chủ nhật" },
];

const DEFAULT_FORM = {
  scope: "PLATFORM", platform: "", device: "",
  type: "DAILY_WINDOW", enabled: true, reason: "",
  start_time: "", end_time: "", days_of_week: [],
  duration_minutes: 30, pause_until: "",
  department: "", group: "",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtPauseEnds = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const MULTI_SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

// ── Component ─────────────────────────────────────────────────────────────
const BlackoutConfigPage = () => {
  const dispatch = useDispatch();

  // 🛡️ RBAC
  const userClaims = useMemo(() => getJwtClaims(), []);
  const isAdmin    = useMemo(() =>
    userClaims?.role === "super" || userClaims?.is_superuser,
  [userClaims]);
  const checkCanAction = (r) => isAdmin || r.group === userClaims?.group_name;

  // Selectors
  const { items = [], loading = false, saving = false } =
    useSelector((s) => s.blackout || {});
  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const { departments = [] } = useSelector((s) => s.department || {});
  const { groups = []      } = useSelector((s) => s.group      || {});

  // Filter
  const [search,       setSearch]       = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [filterActive, setFilterActive] = useState("");

  // Modal
  const [showModal,       setShowModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId,       setEditingId]       = useState(null);
  const [deletingItem,    setDeletingItem]    = useState(null);

  // Form
  const [form,                   setForm]                   = useState(DEFAULT_FORM);
  const [selectedPlatformOption, setSelectedPlatformOption] = useState(null);
  const [selectedDeviceOption,   setSelectedDeviceOption]   = useState(null);
  const isEditingRef = useRef(false);

  // ── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchBlackouts());
    dispatch(fetchPlatforms());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatformOption?.value;
    if (val) dispatch(fetchDevicesByPlatform(val));
    if (!isEditingRef.current) setSelectedDeviceOption(null);
    isEditingRef.current = false;
  }, [dispatch, selectedPlatformOption]);

  // ── Derived ──────────────────────────────────────────────────────────
  const platformOptions = useMemo(() =>
    platforms.map(p => ({ label: `${p.name} (${p.device_count ?? 0})`, value: p.name })),
  [platforms]);

  const deviceOptions = useMemo(() =>
    devices.map(d => ({ label: `${d.name} (${d.ip || "no-ip"})`, value: d.name })),
  [devices]);

  const displayGroups = useMemo(() => {
    if (!form.department) return groups;
    return groups.filter(g =>
      String(g.department?.id || g.department) === String(form.department)
    );
  }, [groups, form.department]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(r => {
      if (filterType   && r.type    !== filterType)   return false;
      if (filterActive === "1" && !r.is_active_now)   return false;
      if (filterActive === "0" &&  r.is_active_now)   return false;
      if (!q) return true;
      return [r.platform, r.device, r.type, r.reason, r.group, r.creator]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [items, search, filterType, filterActive]);

  // ── Modal helpers ─────────────────────────────────────────────────────
  const openCreate = () => {
    isEditingRef.current = false;
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      department: !isAdmin ? (userClaims?.department_id ?? "") : "",
      group:      !isAdmin ? (userClaims?.group_id      ?? "") : "",
    });
    setSelectedPlatformOption(null);
    setSelectedDeviceOption(null);
    setShowModal(true);
  };

  const openEdit = (r) => {
    isEditingRef.current = true;
    setEditingId(r.id);
    const deptObj  = departments.find(d => d.name === r.department);
    const groupObj = groups.find(g => g.name === r.group);
    setForm({
      scope:            r.scope            || "PLATFORM",
      platform:         r.platform         || "",
      device:           r.device           || "",
      type:             r.type             || "DAILY_WINDOW",
      enabled:          !!r.enabled,
      reason:           r.reason           || "",
      start_time:       r.start_time       || "",
      end_time:         r.end_time         || "",
      days_of_week:     r.days_of_week     || [],
      duration_minutes: r.duration_minutes || 30,
      pause_until:      r.pause_until
        ? new Date(r.pause_until).toISOString().slice(0, 16) : "",
      department: deptObj?.id  || "",
      group:      groupObj?.id || "",
    });
    setSelectedPlatformOption(
      r.platform ? { label: r.platform, value: r.platform } : null
    );
    setSelectedDeviceOption(
      r.device ? { label: r.device, value: r.device } : null
    );
    if (r.platform) dispatch(fetchDevicesByPlatform(r.platform));
    setShowModal(true);
  };

  const openDelete = (r) => { setDeletingItem(r); setShowDeleteModal(true); };

  const onSubmit = async () => {
    if (!selectedPlatformOption) return alert("Vui lòng chọn platform");
    if (form.scope === "DEVICE" && !selectedDeviceOption)
      return alert("Vui lòng chọn thiết bị");

    const payload = {
      scope:    form.scope,
      platform: selectedPlatformOption.value,
      device:   form.scope === "DEVICE" ? selectedDeviceOption?.value : null,
      type:     form.type,
      enabled:  form.enabled,
      reason:   form.reason,
      group:      form.group      || null,
      department: form.department || null,
      // Fields tùy type
      ...(["DAILY_WINDOW", "WEEKLY_WINDOW"].includes(form.type) && {
        start_time: form.start_time,
        end_time:   form.end_time,
      }),
      ...(form.type === "WEEKLY_WINDOW" && {
        days_of_week: form.days_of_week,
      }),
      ...(form.type === "DURATION" && {
        duration_minutes: Number(form.duration_minutes),
      }),
      ...(form.type === "UNTIL" && {
        pause_until: form.pause_until || null,
      }),
    };

    if (editingId) {
      await dispatch(patchBlackout({ id: editingId, patch: payload }));
    } else {
      await dispatch(createBlackout(payload));
    }
    setShowModal(false);
  };

  const onConfirmDelete = async () => {
    if (!deletingItem) return;
    await dispatch(deleteBlackout(deletingItem.id));
    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  const scopeValue = SCOPE_OPTIONS.find(o => o.value === form.scope) || SCOPE_OPTIONS[0];
  const typeValue  = TYPE_OPTIONS.find(o => o.value === form.type)   || TYPE_OPTIONS[0];
  const dayValues  = DAY_OPTIONS.filter(o => (form.days_of_week || []).includes(o.value));

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      {/* ── DELETE MODAL ───────────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa blackout <strong>{deletingItem?.platform}</strong>
          {deletingItem?.device && <> / <strong>{deletingItem.device}</strong></>}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={onConfirmDelete} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Sửa Blackout" : "Tạo Blackout mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Row 1: Dept + Group */}
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Label className="fw-bold">Department</Form.Label>
              <FormControl as="select" value={form.department}
                onChange={e => {
                  const newDept = e.target.value;
                  const filtered = groups.filter(g =>
                    String(g.department?.id || g.department) === String(newDept)
                  );
                  setForm(p => ({
                    ...p, department: newDept,
                    group: filtered.length === 1 ? String(filtered[0].id) : "",
                  }));
                }}
                disabled={!isAdmin}>
                <option value="">-- Chọn Department --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </FormControl>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">Group</Form.Label>
              <FormControl as="select" value={form.group}
                onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
                disabled={!isAdmin}>
                {(isAdmin || displayGroups.length > 1) && (
                  <option value="">-- Chọn Group --</option>
                )}
                {displayGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </FormControl>
            </Col>
          </Row>

          {/* Row 2: Scope + Platform + Device */}
          <Row className="g-2 mb-3">
            <Col md={3}>
              <Form.Label>Phạm vi</Form.Label>
              <Select options={SCOPE_OPTIONS} value={scopeValue}
                onChange={opt => setForm(p => ({ ...p, scope: opt.value }))} />
            </Col>
            <Col md={form.scope === "DEVICE" ? 4 : 9}>
              <Form.Label>Platform <span className="text-danger">*</span></Form.Label>
              <Select
                options={platformOptions}
                value={selectedPlatformOption}
                onChange={opt => {
                  isEditingRef.current = !!editingId;
                  setSelectedPlatformOption(opt);
                  setForm(p => ({ ...p, platform: opt?.value || "" }));
                }}
                placeholder="-- Tìm platform --"
                isClearable isSearchable
              />
            </Col>
            {form.scope === "DEVICE" && (
              <Col md={5}>
                <Form.Label>Thiết bị <span className="text-danger">*</span></Form.Label>
                <Select
                  options={deviceOptions}
                  value={selectedDeviceOption}
                  onChange={opt => {
                    setSelectedDeviceOption(opt);
                    setForm(p => ({ ...p, device: opt?.value || "" }));
                  }}
                  placeholder="-- Chọn thiết bị --"
                  isDisabled={!selectedPlatformOption}
                  isLoading={loadingDevices}
                  isClearable isSearchable
                />
              </Col>
            )}
          </Row>

          {/* Row 3: Type + Enabled + Reason */}
          <Row className="g-2 mb-3">
            <Col md={5}>
              <Form.Label>Loại blackout</Form.Label>
              <Select options={TYPE_OPTIONS} value={typeValue}
                onChange={opt => setForm(p => ({ ...p, type: opt.value }))} />
            </Col>
            <Col md={3} className="d-flex align-items-end pb-1">
              <Form.Check type="switch" label="Kích hoạt"
                checked={!!form.enabled}
                onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))} />
            </Col>
            <Col md={4}>
              <Form.Label>Lý do</Form.Label>
              <FormControl value={form.reason} placeholder="Mô tả ngắn..."
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
            </Col>
          </Row>

          {/* Row 4: Type-specific fields */}
          {["DAILY_WINDOW", "WEEKLY_WINDOW"].includes(form.type) && (
            <Row className="g-2 mb-2">
              <Col md={3}>
                <Form.Label>Từ giờ</Form.Label>
                <FormControl type="time" value={form.start_time}
                  onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
              </Col>
              <Col md={3}>
                <Form.Label>Đến giờ</Form.Label>
                <FormControl type="time" value={form.end_time}
                  onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
              </Col>
              {form.type === "WEEKLY_WINDOW" && (
                <Col md={6}>
                  <Form.Label>Các ngày trong tuần</Form.Label>
                  <Select
                    isMulti
                    options={DAY_OPTIONS}
                    value={dayValues}
                    onChange={opts =>
                      setForm(p => ({ ...p, days_of_week: opts.map(o => o.value) }))
                    }
                    placeholder="-- Chọn ngày --"
                    styles={MULTI_SELECT_STYLES}
                  />
                </Col>
              )}
            </Row>
          )}

          {form.type === "DURATION" && (
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label>Thời gian tạm dừng (phút)</Form.Label>
                <InputGroup>
                  <FormControl type="number" min={1} value={form.duration_minutes}
                    onChange={e => setForm(p => ({
                      ...p, duration_minutes: Number(e.target.value)
                    }))} />
                  <InputGroup.Text>phút</InputGroup.Text>
                </InputGroup>
                <small className="text-muted">
                  Blackout sẽ tự tắt sau {form.duration_minutes} phút kể từ lúc tạo/kích hoạt
                </small>
              </Col>
            </Row>
          )}

          {form.type === "UNTIL" && (
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label>Tạm dừng đến thời điểm</Form.Label>
                <FormControl type="datetime-local" value={form.pause_until}
                  onChange={e => setForm(p => ({ ...p, pause_until: e.target.value }))} />
                <small className="text-muted">
                  Blackout sẽ tự tắt sau thời điểm này
                </small>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Hủy
          </Button>
          <Button variant={editingId ? "warning" : "primary"} onClick={onSubmit} disabled={saving}>
            {saving
              ? <Spinner size="sm" animation="border" />
              : editingId ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── MAIN CARD ───────────────────────────────────────────────── */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                🚫 Blackout Config
                <Badge bg="secondary" className="ms-2">{items.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary"
                  onClick={() => dispatch(fetchBlackouts())}
                  disabled={loading || saving}>
                  Reload
                </Button>
                <Button variant="danger" onClick={openCreate} disabled={saving}>
                  + Thêm Blackout
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {/* Filters */}
              <Row className="mb-3 g-2">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <FormControl value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="platform / device / reason..." />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <FormControl as="select" value={filterType}
                    onChange={e => setFilterType(e.target.value)}>
                    <option value="">Tất cả loại</option>
                    {TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </FormControl>
                </Col>
                <Col md={4}>
                  <FormControl as="select" value={filterActive}
                    onChange={e => setFilterActive(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="1">🔴 Đang active</option>
                    <option value="0">⚪ Không active</option>
                  </FormControl>
                </Col>
              </Row>

              {/* Table */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table responsive hover bordered size="sm" className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Trạng thái</th>
                      <th>Phạm vi</th>
                      <th>Platform / Device</th>
                      <th>Loại</th>
                      <th>Lịch / Thời gian</th>
                      <th>Lý do</th>
                      {isAdmin && <th>Group</th>}
                      {isAdmin && <th>Creator</th>}
                      {isAdmin && <th>Updater</th>}
                      <th style={{ whiteSpace: "nowrap" }}>Tạo lúc</th>
                      <th style={{ width: 130 }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 10 : 7} className="text-center text-muted py-3">
                          Không có blackout nào
                        </td>
                      </tr>
                    ) : filteredItems.map(r => {
                      const canAct = checkCanAction(r);
                      return (
                        <tr key={r.id}>
                          {/* Trạng thái */}
                          <td className="text-center">
                            <Badge bg={r.is_active_now ? "danger" : r.enabled ? "warning" : "secondary"}>
                              {r.is_active_now ? "🔴 Active" : r.enabled ? "🟡 Enabled" : "⚪ Off"}
                            </Badge>
                          </td>

                          {/* Scope */}
                          <td>
                            <Badge bg={r.scope === "DEVICE" ? "info" : "primary"} text="dark">
                              {r.scope === "DEVICE" ? "📟 Device" : "🖥️ Platform"}
                            </Badge>
                          </td>

                          {/* Platform / Device */}
                          <td>
                            <div><code>{r.platform}</code></div>
                            {r.device && (
                              <div className="text-muted small">→ {r.device}</div>
                            )}
                          </td>

                          {/* Type */}
                          <td style={{ fontSize: "0.82rem" }}>
                            {TYPE_OPTIONS.find(o => o.value === r.type)?.label || r.type}
                          </td>

                          {/* Schedule detail */}
                          <td style={{ fontSize: "0.82rem" }}>
                            {r.type === "DAILY_WINDOW" && (
                              <span>⏰ {r.start_time} – {r.end_time}</span>
                            )}
                            {r.type === "WEEKLY_WINDOW" && (
                              <div>
                                <div>⏰ {r.start_time} – {r.end_time}</div>
                                <div className="text-muted">
                                  {(r.days_of_week || []).map(d =>
                                    DAY_OPTIONS.find(o => o.value === d)?.label
                                  ).join(", ")}
                                </div>
                              </div>
                            )}
                            {r.type === "DURATION" && (
                              <div>
                                <div>⏱ {r.duration_minutes} phút</div>
                                {r.pause_ends_at && (
                                  <div className="text-muted">
                                    Đến: {fmtPauseEnds(r.pause_ends_at)}
                                  </div>
                                )}
                              </div>
                            )}
                            {r.type === "UNTIL" && (
                              <span>📅 {fmtDate(r.pause_until)}</span>
                            )}
                          </td>

                          <td style={{ fontSize: "0.82rem" }}>{r.reason || "—"}</td>

                          {isAdmin && (
                            <td>
                              <Badge bg="light" text="dark" className="border">
                                {r.group || "—"}
                              </Badge>
                            </td>
                          )}
                          {isAdmin && <td style={{ fontSize: "0.82rem" }}>{r.creator || "—"}</td>}
                          {isAdmin && <td style={{ fontSize: "0.82rem" }}>{r.updater || "—"}</td>}

                          <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {fmtDate(r.created_at)}
                          </td>

                          {/* Actions */}
                          <td>
                            {canAct ? (
                              <div className="d-flex gap-1">
                                <Button size="sm" variant="outline-primary"
                                  onClick={() => openEdit(r)} disabled={saving}
                                  title="Sửa">✏️</Button>
                                <Button size="sm"
                                  variant={r.enabled ? "outline-secondary" : "outline-success"}
                                  onClick={() => dispatch(toggleBlackout({ id: r.id, enabled: !r.enabled }))}
                                  disabled={saving}
                                  title={r.enabled ? "Tắt" : "Bật"}>
                                  {r.enabled ? "OFF" : "ON"}
                                </Button>
                                <Button size="sm" variant="outline-danger"
                                  onClick={() => openDelete(r)} disabled={saving}
                                  title="Xóa">🗑️</Button>
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
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BlackoutConfigPage;