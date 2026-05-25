import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, FormControl,
  InputGroup, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { createOutputIgnoreRule, deleteOutputIgnoreRule, fetchOutputIgnoreRules, patchOutputIgnoreRule } from "../../../redux/Healthcheck/outputIgnoreSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

// ── Constants ─────────────────────────────────────────────────────────────
const MODE_OPTIONS = [
  { label: "LINE (1 dòng)", value: "LINE"  },
  { label: "BLOCK (cụm)",   value: "BLOCK" },
];
const OP_OPTIONS = [
  { label: "EQUALS",     value: "EQUALS"     },
  { label: "CONTAINS",   value: "CONTAINS"   },
  { label: "STARTSWITH", value: "STARTSWITH" },
  { label: "ENDSWITH",   value: "ENDSWITH"   },
];
const DEFAULT_FORM = {
  department: "", group: "",
  platform: "*", usecase: "healthcheck", command_prefix: "*",
  enabled: true, case_insensitive: true, mode: "BLOCK",
  line_op: "CONTAINS", line_text: "",
  block_start_op: "STARTSWITH", block_start_text: "",
  block_end_op: "EQUALS", block_end_text: "END",
  reason: "",
};
const MULTI_SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

// ── Helpers ───────────────────────────────────────────────────────────────
function buildPayload(form) {
  const base = {
    host:           "*",
    platform:       form.platform       || "*",
    usecase:        form.usecase        || "*",
    command_prefix: form.command_prefix || "*",
    enabled:        !!form.enabled,
    case_insensitive: !!form.case_insensitive,
    mode:           form.mode,
    reason:         form.reason || "",
    group:          form.group      || null,
    department:     form.department || null,
  };
  if (form.mode === "LINE") {
    return { ...base, line_op: form.line_op, line_text: (form.line_text || "").trim() };
  }
  return {
    ...base,
    block_start_op:   form.block_start_op,
    block_start_text: (form.block_start_text || "").trim(),
    block_end_op:     form.block_end_op  || "EQUALS",
    block_end_text:   (form.block_end_text || "END").trim(),
  };
}

function validateForm(form) {
  if (!form.mode) return "Thiếu mode";
  if (form.mode === "LINE") {
    if (!form.line_op)           return "Thiếu line_op";
    if (!form.line_text?.trim()) return "Thiếu line_text";
  } else {
    if (!form.block_start_op)           return "Thiếu block_start_op";
    if (!form.block_start_text?.trim()) return "Thiếu block_start_text";
    if (!form.block_end_op)             return "Thiếu block_end_op";
    if (!form.block_end_text?.trim())   return "Thiếu block_end_text";
  }
  return null;
}

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── Component ─────────────────────────────────────────────────────────────
const OutputIgnoreRules = () => {
  const dispatch = useDispatch();

  // 🛡️ RBAC
  const userClaims = useMemo(() => getJwtClaims(), []);
  const isAdmin    = useMemo(() =>
    userClaims?.role === "super" || userClaims?.is_superuser,
  [userClaims]);
  const checkCanAction = (r) => isAdmin || r.group === userClaims?.group_name;

  // Selectors
  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const { items = [], loading = false, saving = false } =
    useSelector((s) => s.outputIgnore  || {});
  const { departments = [] } = useSelector((s) => s.department || {});
  const { groups = []      } = useSelector((s) => s.group      || {});

  // Filter / Sort
  const [filterEnabled, setFilterEnabled] = useState("");
  const [filterMode,    setFilterMode]    = useState("");
  const [search,        setSearch]        = useState("");
  const [sortBy,        setSortBy]        = useState("id");
  const [sortDir,       setSortDir]       = useState("desc");

  const toggleSort = (f) => {
    if (sortBy === f) setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortBy(f); setSortDir("asc"); }
  };
  const sortIcon = (f) => sortBy !== f ? "↕" : sortDir === "asc" ? "↑" : "↓";

  // Modal
  const [showModal,       setShowModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId,       setEditingId]       = useState(null);
  const [deletingRule,    setDeletingRule]    = useState(null);

  // Form
  const [form,                   setForm]                   = useState(DEFAULT_FORM);
  const [selectedPlatformOption, setSelectedPlatformOption] = useState(null);
  const [selectedDevices,        setSelectedDevices]        = useState([]);

  // Ref để tránh reset selectedDevices khi mở edit
  const isEditingRef = useRef(false);

  // ── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchOutputIgnoreRules());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatformOption?.value;
    if (val) dispatch(fetchDevicesByPlatform(val));
    if (!isEditingRef.current) {
      setSelectedDevices([]);
    }
    isEditingRef.current = false;
  }, [dispatch, selectedPlatformOption]);

  // ── Derived ──────────────────────────────────────────────────────────
  const platformOptions = useMemo(() =>
    platforms.map((p) => ({
      label: `${p?.name} (${p?.device_count ?? 0})`,
      value: p?.name,
    })),
  [platforms]);

  const displayGroups = useMemo(() => {
    if (!form.department) return groups;
    return groups.filter((g) =>
      String(g.department?.id || g.department) === String(form.department)
    );
  }, [groups, form.department]);

  const deviceOptions = useMemo(() =>
    devices.map((d) => ({ label: `${d.name} (${d.ip || "no-ip"})`, value: d.name })),
  [devices]);

  const combinedDeviceOptions = useMemo(() => [
    { label: "-- Chọn tất cả --", value: "__all__" },
    ...deviceOptions,
  ], [deviceOptions]);

  const filteredAndSortedItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = (items || []).filter((r) => {
      if (filterMode    && r.mode    !== filterMode)    return false;
      if (filterEnabled === "1" && !r.enabled) return false;
      if (filterEnabled === "0" &&  r.enabled) return false;
      if (!q) return true;
      const hay = [r.id, r.host, r.platform, r.usecase, r.command_prefix,
        r.mode, r.line_op, r.line_text, r.block_start_op, r.block_start_text,
        r.block_end_op, r.block_end_text, r.reason, r.group, r.creator, r.updater]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = (r) => {
      if (sortBy === "id")      return Number(r.id) || 0;
      if (sortBy === "enabled") return r.enabled ? 1 : 0;
      return (r[sortBy] || "").toLowerCase();
    };
    arr.sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      return va < vb ? -1 * dir : va > vb ? dir : 0;
    });
    return arr;
  }, [items, filterEnabled, filterMode, search, sortBy, sortDir]);

  // ── Modal helpers ────────────────────────────────────────────────────
  const openCreate = () => {
    isEditingRef.current = false;
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      department: !isAdmin ? (userClaims?.department_id ?? "") : "",
      group:      !isAdmin ? (userClaims?.group_id      ?? "") : "",
    });
    setSelectedPlatformOption(null);
    setSelectedDevices([]);
    setShowModal(true);
  };

  const openEdit = (r) => {
    isEditingRef.current = true;
    setEditingId(r.id);
    const deptObj  = departments.find((d) => d.name === r.department);
    const groupObj = groups.find((g) => g.name === r.group);
    setForm({
      department:       deptObj?.id  || "",
      group:            groupObj?.id || "",
      platform:         r.platform         ?? "*",
      usecase:          r.usecase          ?? "healthcheck",
      command_prefix:   r.command_prefix   ?? "*",
      enabled:          !!r.enabled,
      case_insensitive: !!r.case_insensitive,
      mode:             r.mode             ?? "BLOCK",
      line_op:          r.line_op          ?? "CONTAINS",
      line_text:        r.line_text        ?? "",
      block_start_op:   r.block_start_op   ?? "STARTSWITH",
      block_start_text: r.block_start_text ?? "",
      block_end_op:     r.block_end_op     ?? "EQUALS",
      block_end_text:   r.block_end_text   ?? "END",
      reason:           r.reason           ?? "",
    });
    const platVal = r.platform && r.platform !== "*" ? r.platform : null;
    setSelectedPlatformOption(
      platVal ? { label: platVal, value: platVal } : null
    );
    setSelectedDevices(
      r.host && r.host !== "*" ? [{ label: r.host, value: r.host }] : []
    );
    if (platVal) dispatch(fetchDevicesByPlatform(platVal));
    setShowModal(true);
  };

  const openDelete = (r) => { setDeletingRule(r); setShowDeleteModal(true); };

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((o) => o.value === "__all__")) setSelectedDevices(deviceOptions);
    else setSelectedDevices(selected);
  };

  // const onSubmit = async () => {
  //   const err = validateForm(form);
  //   if (err) return alert(err);
  //   if (!selectedPlatformOption) return alert("Vui lòng chọn platform");
  //   if (!selectedDevices || selectedDevices.length === 0)
  //     return alert("Vui lòng chọn ít nhất 1 host");

  //   const basePayload = buildPayload(form);
  //   if (editingId) {
  //     await dispatch(patchOutputIgnoreRule({
  //       id: editingId,
  //       patch: { ...basePayload, host: selectedDevices[0]?.value },
  //     }));
  //   } else {
  //     await Promise.all(
  //       selectedDevices.map((d) =>
  //         dispatch(createOutputIgnoreRule({ ...basePayload, host: d.value }))
  //       )
  //     );
  //   }
  //   setShowModal(false);
  // };

const onSubmit = async () => {
  const err = validateForm(form);
  if (err) return alert(err);
  if (!selectedPlatformOption) return alert("Vui lòng chọn platform");
  if (!selectedDevices || selectedDevices.length === 0)
    return alert("Vui lòng chọn ít nhất 1 host");

  const basePayload = buildPayload(form);

  if (editingId) {
    // Patch rule hiện tại với host đầu tiên
    await dispatch(patchOutputIgnoreRule({
      id: editingId,
      patch: { ...basePayload, host: selectedDevices[0]?.value },
    }));
    // Tạo mới rule cho các host còn lại (nếu có)
    if (selectedDevices.length > 1) {
      await Promise.all(
        selectedDevices.slice(1).map((d) =>
          dispatch(createOutputIgnoreRule({ ...basePayload, host: d.value }))
        )
      );
    }
  } else {
    await Promise.all(
      selectedDevices.map((d) =>
        dispatch(createOutputIgnoreRule({ ...basePayload, host: d.value }))
      )
    );
  }
  setShowModal(false);
};

  const onConfirmDelete = async () => {
    if (!deletingRule) return;
    await dispatch(deleteOutputIgnoreRule(deletingRule.id));
    setShowDeleteModal(false);
    setDeletingRule(null);
  };

  const onToggleEnabled = (r) =>
    dispatch(patchOutputIgnoreRule({ id: r.id, patch: { enabled: !r.enabled } }));

  // Select value helpers
  const modeValue  = MODE_OPTIONS.find((x) => x.value === form.mode)         || MODE_OPTIONS[1];
  const lineOpValue = OP_OPTIONS.find((x) => x.value === form.line_op)       || OP_OPTIONS[1];
  const bsOpValue  = OP_OPTIONS.find((x) => x.value === form.block_start_op) || OP_OPTIONS[2];
  const beOpValue  = OP_OPTIONS.find((x) => x.value === form.block_end_op)   || OP_OPTIONS[0];

  const colSpan = 11 + (isAdmin ? 3 : 0); // +3: Group, Creator, Updater

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      {/* ── CREATE / EDIT MODAL ─────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? `Sửa Rule #${editingId}` : "Tạo Output Ignore Rule"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Row 1: Dept + Group */}
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label className="fw-bold">Department</Form.Label>
              <FormControl
                as="select"
                value={form.department}
                onChange={(e) => {
                  const newDept = e.target.value;
                  const filtered = groups.filter((g) =>
                    String(g.department?.id || g.department) === String(newDept)
                  );
                  setForm((p) => ({
                    ...p,
                    department: newDept,
                    group: filtered.length === 1 ? String(filtered[0].id) : "",
                  }));
                }}
                disabled={!isAdmin}
              >
                <option value="">-- Chọn Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </FormControl>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">Group</Form.Label>
              <FormControl
                as="select"
                value={form.group}
                onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
                disabled={!isAdmin}
              >
                {(isAdmin || displayGroups.length > 1) && (
                  <option value="">-- Chọn Group --</option>
                )}
                {displayGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </FormControl>
            </Col>
          </Row>

          {/* Row 2: Mode + Platform + Host + Usecase */}
          <Row className="g-2 mb-2 align-items-end">
            <Col md={2}>
              <Form.Label>Mode</Form.Label>
              <Select
                options={MODE_OPTIONS}
                value={modeValue}
                onChange={(opt) => setForm((p) => ({ ...p, mode: opt.value }))}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Platform</Form.Label>
              <Select
                options={platformOptions}
                value={selectedPlatformOption}
                onChange={(opt) => {
                  isEditingRef.current = !!editingId;
                  setSelectedPlatformOption(opt);
                  setForm((p) => ({ ...p, platform: opt?.value || "*" }));
                }}
                placeholder="-- Tìm platform --"
                isClearable
                isSearchable
              />
            </Col>
            <Col md={5}>
              <Form.Label>Host (node)</Form.Label>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={combinedDeviceOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="-- Chọn thiết bị --"
                isDisabled={!selectedPlatformOption}
                isLoading={loadingDevices}
                styles={MULTI_SELECT_STYLES}
              />
              {editingId && (
                <small className="text-muted">
                  * Update chỉ áp cho <b>host đầu tiên</b>
                </small>
              )}
            </Col>
            <Col md={2}>
              <Form.Label>Usecase</Form.Label>
              <FormControl
                value={form.usecase}
                onChange={(e) => setForm((p) => ({ ...p, usecase: e.target.value }))}
              />
            </Col>
          </Row>

          {/* Row 3: Cmd + Flags + Rule fields + Reason */}
          <Row className="g-2 align-items-end">
            <Col md={2}>
              <Form.Label>Cmd prefix</Form.Label>
              <FormControl
                value={form.command_prefix}
                placeholder="allip / strsp / *"
                onChange={(e) => setForm((p) => ({ ...p, command_prefix: e.target.value }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Flags</Form.Label>
              <div className="d-flex gap-3 mt-1">
                <Form.Check type="checkbox" label="Enabled"
                  checked={!!form.enabled}
                  onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))} />
                <Form.Check type="checkbox" label="CI"
                  checked={!!form.case_insensitive}
                  onChange={(e) => setForm((p) => ({ ...p, case_insensitive: e.target.checked }))} />
              </div>
            </Col>

            {form.mode === "LINE" ? (
              <>
                <Col md={2}>
                  <Form.Label>line_op</Form.Label>
                  <Select options={OP_OPTIONS} value={lineOpValue}
                    onChange={(opt) => setForm((p) => ({ ...p, line_op: opt.value }))} />
                </Col>
                <Col md={4}>
                  <Form.Label>line_text</Form.Label>
                  <FormControl value={form.line_text}
                    onChange={(e) => setForm((p) => ({ ...p, line_text: e.target.value }))} />
                </Col>
              </>
            ) : (
              <>
                <Col md={2}>
                  <Form.Label>start_op</Form.Label>
                  <Select options={OP_OPTIONS} value={bsOpValue}
                    onChange={(opt) => setForm((p) => ({ ...p, block_start_op: opt.value }))} />
                </Col>
                <Col md={2}>
                  <Form.Label>start_text</Form.Label>
                  <FormControl value={form.block_start_text}
                    onChange={(e) => setForm((p) => ({ ...p, block_start_text: e.target.value }))} />
                </Col>
                <Col md={1}>
                  <Form.Label>end_op</Form.Label>
                  <Select options={OP_OPTIONS} value={beOpValue}
                    onChange={(opt) => setForm((p) => ({ ...p, block_end_op: opt.value }))} />
                </Col>
                <Col md={1}>
                  <Form.Label>end_text</Form.Label>
                  <FormControl value={form.block_end_text}
                    onChange={(e) => setForm((p) => ({ ...p, block_end_text: e.target.value }))} />
                </Col>
              </>
            )}

            <Col md={2}>
              <Form.Label>Reason</Form.Label>
              <FormControl value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
            </Col>
          </Row>
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

      {/* ── DELETE CONFIRM MODAL ────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa rule <strong>#{deletingRule?.id}</strong> — host{" "}
          <strong>{deletingRule?.host}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={saving}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirmDelete} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── MAIN CARD ───────────────────────────────────────────────── */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">Output Ignore Rules</Card.Title>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary"
                  onClick={() => dispatch(fetchOutputIgnoreRules())}
                  disabled={loading || saving}>
                  Reload
                </Button>
                <Button variant="primary" onClick={openCreate} disabled={saving}>
                  + Tạo Rule
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {/* Filters */}
              <Row className="mb-3 g-2">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <FormControl
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="host / platform / cmd / text / reason..." />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Enabled</InputGroup.Text>
                    <FormControl as="select" value={filterEnabled}
                      onChange={(e) => setFilterEnabled(e.target.value)}>
                      <option value="">All</option>
                      <option value="1">ON</option>
                      <option value="0">OFF</option>
                    </FormControl>
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Mode</InputGroup.Text>
                    <FormControl as="select" value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value)}>
                      <option value="">All</option>
                      <option value="LINE">LINE</option>
                      <option value="BLOCK">BLOCK</option>
                    </FormControl>
                  </InputGroup>
                </Col>
              </Row>

              {/* Table */}
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table responsive hover bordered size="sm" className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("id")}>
                        ID {sortIcon("id")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("enabled")}>
                        Status {sortIcon("enabled")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("host")}>
                        Host {sortIcon("host")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("platform")}>
                        Platform {sortIcon("platform")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("usecase")}>
                        Usecase {sortIcon("usecase")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("command_prefix")}>
                        Cmd {sortIcon("command_prefix")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("mode")}>
                        Mode {sortIcon("mode")}
                      </th>
                      <th>Rule</th>
                      <th>Reason</th>
                      {isAdmin && <th>Group</th>}
                      {isAdmin && <th>Creator</th>}
                      {isAdmin && <th>Updater</th>}
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("created_at")}>
                        Tạo lúc {sortIcon("created_at")}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("updated_at")}>
                        Cập nhật {sortIcon("updated_at")}
                      </th>
                      <th style={{ width: 160 }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedItems.length === 0 ? (
                      <tr>
                        <td colSpan={colSpan} className="text-center text-muted py-3">
                          Không có rule nào
                        </td>
                      </tr>
                    ) : filteredAndSortedItems.map((r) => {
                      const canAct = checkCanAction(r);
                      return (
                        <tr key={r.id} className={!r.enabled ? "table-secondary" : ""}>
                          <td className="fw-bold">{r.id}</td>
                          <td>
                            {r.enabled
                              ? <Badge bg="success">ON</Badge>
                              : <Badge bg="secondary">OFF</Badge>}
                          </td>
                          <td><code>{r.host}</code></td>
                          <td>{r.platform}</td>
                          <td>{r.usecase}</td>
                          <td><code>{r.command_prefix}</code></td>
                          <td>
                            <Badge bg={r.mode === "LINE" ? "info" : "warning"} text="dark">
                              {r.mode}
                            </Badge>
                          </td>
                          <td style={{ whiteSpace: "pre-line", fontSize: "0.82rem" }}>
                            {r.mode === "LINE"
                              ? `${r.line_op} | ${r.line_text}`
                              : `${r.block_start_op} | ${r.block_start_text}\n...\n${r.block_end_op} | ${r.block_end_text}`}
                          </td>
                          <td style={{ fontSize: "0.82rem" }}>{r.reason || "—"}</td>
                          {isAdmin && (
                            <td>
                              <Badge bg="light" text="dark" className="border">
                                {r.group || "—"}
                              </Badge>
                            </td>
                          )}
                          {isAdmin && (
                            <td style={{ fontSize: "0.82rem" }}>{r.creator || "—"}</td>
                          )}
                          {isAdmin && (
                            <td style={{ fontSize: "0.82rem" }}>{r.updater || "—"}</td>
                          )}
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {fmtDate(r.created_at)}
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {fmtDate(r.updated_at)}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="outline-primary"
                                onClick={() => openEdit(r)}
                                disabled={saving || !canAct}
                                title={!canAct ? "Không có quyền" : "Sửa"}>
                                ✏️
                              </Button>
                              <Button size="sm"
                                variant={r.enabled ? "outline-secondary" : "outline-success"}
                                onClick={() => onToggleEnabled(r)}
                                disabled={saving || !canAct}
                                title={!canAct ? "Không có quyền" : r.enabled ? "Tắt" : "Bật"}>
                                {r.enabled ? "OFF" : "ON"}
                              </Button>
                              <Button size="sm" variant="outline-danger"
                                onClick={() => openDelete(r)}
                                disabled={saving || !canAct}
                                title={!canAct ? "Không có quyền" : "Xóa"}>
                                🗑️
                              </Button>
                            </div>
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

export default OutputIgnoreRules;