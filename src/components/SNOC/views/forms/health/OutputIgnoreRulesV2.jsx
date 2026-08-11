import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, FormControl,
  InputGroup, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  createOutputIgnoreRuleV2,
  deleteOutputIgnoreRuleV2,
  fetchOutputIgnoreRulesV2,
  patchOutputIgnoreRuleV2,
} from "../../../redux/Healthcheck/outputIgnoreSliceV2";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups }      from "../../../redux/User/groupSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

// ── Constants ─────────────────────────────────────────────────────────────
const OPERATOR_OPTIONS = [
  { label: "OR  — bất kỳ điều kiện nào khớp", value: "OR"  },
  { label: "AND — tất cả điều kiện phải khớp", value: "AND" },
];
const EMPTY_LINE_COND  = { mode: "LINE",  line_op: "CONTAINS",   line_text: "" };
const EMPTY_BLOCK_COND = {
  mode: "BLOCK",
  block_start_op: "STARTSWITH", block_start_text: "",
  block_end_op:   "EQUALS",     block_end_text:   "END",
  // old single filter — kept for backward compat display
  block_body_op:  null,         block_body_text:  "",
  // new multiple filters
  block_body_filters:          [],
  block_body_filter_operator:  "OR",
};
const EMPTY_BODY_FILTER = { op: "CONTAINS", text: "" };

// Convert old single body filter → new list format (nếu data từ DB cũ chưa có block_body_filters)
function normalizeCondition(c) {
  if (c.mode !== "BLOCK") return c;
  // Data cũ: có block_body_op nhưng chưa có block_body_filters → migrate sang list
  if (!c.block_body_filters && c.block_body_op) {
    return {
      ...c,
      block_body_filters: [{ op: c.block_body_op, text: c.block_body_text || "" }],
      block_body_filter_operator: "OR",
      block_body_op:   null,
      block_body_text: "",
    };
  }
  // Đảm bảo luôn có 2 field mới
  return {
    block_body_filters: [],
    block_body_filter_operator: "OR",
    ...c,
  };
}
const DEFAULT_FORM = {
  name: "", department: "", group: "",
  platform: "*", usecase: "healthcheck", command_prefix: "*",
  enabled: true, case_insensitive: true,
  line_operator: "OR", block_operator: "OR",
  conditions: [],
  reason: "",
};
const MULTI_SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

function validateForm(form) {
  if (!form.name?.trim())     return "Tên rule không được để trống";
  if (!form.conditions?.length) return "Phải có ít nhất 1 condition";
  for (let i = 0; i < form.conditions.length; i++) {
    const c = form.conditions[i];
    if (c.mode === "LINE") {
      if (!c.line_op)             return `Condition ${i+1}: LINE thiếu line_op`;
      if (!c.line_text?.trim())   return `Condition ${i+1}: LINE thiếu line_text`;
    }
    if (c.mode === "BLOCK") {
      if (!c.block_start_op)             return `Condition ${i+1}: BLOCK thiếu start_op`;
      if (!c.block_start_text?.trim())   return `Condition ${i+1}: BLOCK thiếu start_text`;
      if (!c.block_end_op)               return `Condition ${i+1}: BLOCK thiếu end_op`;
      if (!c.block_end_text?.trim())     return `Condition ${i+1}: BLOCK thiếu end_text`;
      // body filters mới (multiple) — mỗi filter phải có đủ op + text
      const filters = c.block_body_filters || [];
      for (let j = 0; j < filters.length; j++) {
        if (!filters[j].op)           return `Condition ${i+1}: Body filter ${j+1}: thiếu op`;
        if (!filters[j].text?.trim()) return `Condition ${i+1}: Body filter ${j+1}: thiếu text`;
      }
    }
  }
  return null;
}

// ── ConditionEditor ───────────────────────────────────────────────────────
const ConditionEditor = ({ conditions, onChange }) => {
  const update = (idx, patch) =>
    onChange(conditions.map((c, i) => i === idx ? { ...c, ...patch } : c));
  const remove = (idx) =>
    onChange(conditions.filter((_, i) => i !== idx));

  return (
    <div className="d-flex flex-column gap-2">
      {conditions.map((c, idx) => (
        <div key={idx} className="border rounded p-2 bg-light position-relative">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Badge bg={c.mode === "LINE" ? "info" : "warning"} text="dark">
              {c.mode}
            </Badge>
            <small className="text-muted">#{idx + 1}</small>
            <Button
              size="sm" variant="outline-danger"
              className="ms-auto py-0 px-1"
              onClick={() => remove(idx)}
            >✕</Button>
          </div>

          {c.mode === "LINE" && (
            <Row className="g-2">
              <Col md={4}>
                <Form.Label className="small">line_op</Form.Label>
                <FormControl
                  as="select" size="sm"
                  value={c.line_op || "CONTAINS"}
                  onChange={e => update(idx, { line_op: e.target.value })}
                >
                  <option value="CONTAINS">CONTAINS</option>
                  <option value="EQUALS">EQUALS</option>
                  <option value="STARTSWITH">STARTSWITH</option>
                  <option value="ENDSWITH">ENDSWITH</option>
                </FormControl>
              </Col>
              <Col md={8}>
                <Form.Label className="small">line_text</Form.Label>
                <FormControl
                  size="sm"
                  value={c.line_text || ""}
                  onChange={e => update(idx, { line_text: e.target.value })}
                  placeholder="Chuỗi cần match..."
                />
              </Col>
            </Row>
          )}

          {c.mode === "BLOCK" && (
            <>
              {/* ── Row 1: Start condition ───────────────────────── */}
              <Row className="g-2 mb-1">
                <Col xs={12}>
                  <small className="text-muted fw-semibold">
                    🟢 Block START — dòng bắt đầu block
                  </small>
                </Col>
                <Col md={4}>
                  <Form.Label className="small">start_op</Form.Label>
                  <FormControl
                    as="select" size="sm"
                    value={c.block_start_op || "STARTSWITH"}
                    onChange={e => update(idx, { block_start_op: e.target.value })}
                  >
                    <option value="STARTSWITH">STARTSWITH</option>
                    <option value="CONTAINS">CONTAINS</option>
                    <option value="EQUALS">EQUALS</option>
                    <option value="ENDSWITH">ENDSWITH</option>
                  </FormControl>
                </Col>
                <Col md={8}>
                  <Form.Label className="small">start_text</Form.Label>
                  <FormControl
                    size="sm"
                    value={c.block_start_text || ""}
                    onChange={e => update(idx, { block_start_text: e.target.value })}
                    placeholder="Chuỗi bắt đầu block..."
                  />
                </Col>
              </Row>

              {/* ── Row 2: Body Filters (OPTIONAL, multiple) ─────── */}
              {(() => {
                const filters = c.block_body_filters || [];
                const hasFilters = filters.length > 0;

                const updateFilter = (fi, patch) => {
                  const newFilters = filters.map((f, i) => i === fi ? { ...f, ...patch } : f);
                  update(idx, { block_body_filters: newFilters });
                };
                const removeFilter = (fi) => {
                  const newFilters = filters.filter((_, i) => i !== fi);
                  update(idx, { block_body_filters: newFilters });
                };
                const addFilter = () =>
                  update(idx, { block_body_filters: [...filters, { ...EMPTY_BODY_FILTER }] });

                return (
                  <div className="border rounded p-2 mb-1" style={{ background: "#f8f9fa" }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <small className="text-muted fw-semibold">
                        🔍 Body Filters{" "}
                        <em className="fw-normal">
                          — chỉ drop block nếu bên trong thỏa mãn
                          {!hasFilters && " (bỏ trống = drop tất cả block khớp START/END)"}
                        </em>
                      </small>
                      <Button size="sm" variant="outline-secondary" className="py-0 px-2"
                        onClick={addFilter}
                      >
                        + Thêm filter
                      </Button>
                    </div>

                    {hasFilters && (
                      <>
                        {filters.map((f, fi) => (
                          <Row key={fi} className="g-1 mb-1 align-items-center">
                            <Col md={3}>
                              <FormControl
                                as="select" size="sm"
                                value={f.op || "CONTAINS"}
                                onChange={e => updateFilter(fi, { op: e.target.value })}
                              >
                                <option value="CONTAINS">CONTAINS</option>
                                <option value="EQUALS">EQUALS</option>
                                <option value="STARTSWITH">STARTSWITH</option>
                                <option value="ENDSWITH">ENDSWITH</option>
                              </FormControl>
                            </Col>
                            <Col>
                              <FormControl
                                size="sm"
                                value={f.text || ""}
                                onChange={e => updateFilter(fi, { text: e.target.value })}
                                placeholder={`VD: FAULT`}
                              />
                            </Col>
                            <Col xs="auto">
                              <Button size="sm" variant="outline-danger" className="py-0 px-1"
                                onClick={() => removeFilter(fi)}
                              >✕</Button>
                            </Col>
                          </Row>
                        ))}

                        {filters.length >= 2 && (
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <small className="text-muted">Kết hợp:</small>
                            {["OR", "AND"].map(op => (
                              <Form.Check
                                key={op} inline type="radio"
                                id={`bfo-${idx}-${op}`}
                                name={`bfo-${idx}`}
                                label={
                                  <small>
                                    <strong>{op}</strong>
                                    {op === "OR"
                                      ? " — bất kỳ filter nào khớp"
                                      : " — tất cả filter đều phải có ít nhất 1 dòng khớp"}
                                  </small>
                                }
                                checked={(c.block_body_filter_operator || "OR") === op}
                                onChange={() => update(idx, { block_body_filter_operator: op })}
                              />
                            ))}
                          </div>
                        )}

                        <small className="text-info d-block mt-1">
                          💡 Block sẽ bị xóa toàn bộ (kể cả dòng START và END) nếu thỏa mãn điều kiện trên.
                          Nếu không thỏa mãn → block được <strong>giữ lại</strong>.
                        </small>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* ── Row 3: End condition ─────────────────────────── */}
              <Row className="g-2">
                <Col xs={12}>
                  <small className="text-muted fw-semibold">
                    🔴 Block END — dòng kết thúc block (luôn bị drop)
                    <span className="text-info ms-2">
                      💡 Nếu end_op = start_op và end_text = start_text → boundary pattern:
                      dòng END tự động làm START của block kế tiếp
                    </span>
                  </small>
                </Col>
                <Col md={4}>
                  <Form.Label className="small">end_op</Form.Label>
                  <FormControl
                    as="select" size="sm"
                    value={c.block_end_op || "EQUALS"}
                    onChange={e => update(idx, { block_end_op: e.target.value })}
                  >
                    <option value="EQUALS">EQUALS</option>
                    <option value="STARTSWITH">STARTSWITH</option>
                    <option value="CONTAINS">CONTAINS</option>
                    <option value="ENDSWITH">ENDSWITH</option>
                  </FormControl>
                </Col>
                <Col md={8}>
                  <Form.Label className="small">end_text</Form.Label>
                  <FormControl
                    size="sm"
                    value={c.block_end_text || ""}
                    onChange={e => update(idx, { block_end_text: e.target.value })}
                    placeholder="END"
                  />
                </Col>
              </Row>
            </>
          )}
        </div>
      ))}

      {/* Add buttons */}
      <div className="d-flex gap-2 mt-1">
        <Button
          size="sm" variant="outline-info"
          onClick={() => onChange([...conditions, { ...EMPTY_LINE_COND }])}
        >
          + LINE
        </Button>
        <Button
          size="sm" variant="outline-warning"
          onClick={() => onChange([...conditions, { ...EMPTY_BLOCK_COND }])}
        >
          + BLOCK
        </Button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const OutputIgnoreRulesV2 = () => {
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
    useSelector((s) => s.outputIgnoreV2 || {});
  const { departments = [] } = useSelector((s) => s.department || {});
  const { groups = []      } = useSelector((s) => s.group      || {});

  // Filter / Sort
  const [search,        setSearch]        = useState("");
  const [filterEnabled, setFilterEnabled] = useState("");
  const [sortBy,        setSortBy]        = useState("id");
  const [sortDir,       setSortDir]       = useState("desc");

  const toggleSort = (f) => {
    if (sortBy === f) setSortDir(p => p === "asc" ? "desc" : "asc");
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
  const isEditingRef = useRef(false);

  // ── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchOutputIgnoreRulesV2());
    dispatch(fetchPlatforms());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatformOption?.value;
    if (val) dispatch(fetchDevicesByPlatform(val));
    if (!isEditingRef.current) setSelectedDevices([]);
    isEditingRef.current = false;
  }, [dispatch, selectedPlatformOption]);

  // ── Derived ──────────────────────────────────────────────────────────
  const platformOptions = useMemo(() =>
    platforms.map(p => ({ label: `${p?.name} (${p?.device_count ?? 0})`, value: p?.name })),
  [platforms]);

  const displayGroups = useMemo(() => {
    if (!form.department) return groups;
    return groups.filter(g =>
      String(g.department?.id || g.department) === String(form.department)
    );
  }, [groups, form.department]);

  const deviceOptions = useMemo(() =>
    devices.map(d => ({ label: `${d.name} (${d.ip || "no-ip"})`, value: d.name })),
  [devices]);

  const combinedDeviceOptions = useMemo(() => [
    { label: "-- Chọn tất cả --", value: "__all__" },
    ...deviceOptions,
  ], [deviceOptions]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = (items || []).filter(r => {
      if (filterEnabled === "1" && !r.enabled) return false;
      if (filterEnabled === "0" &&  r.enabled) return false;
      if (!q) return true;
      const hay = [
        r.id, r.name, r.platform, r.usecase, r.command_prefix,
        r.reason, r.group, r.creator, r.updater,
        ...(r.hosts || []),
        ...(r.conditions || []).map(c =>
          [c.line_text, c.block_start_text].filter(Boolean).join(" ")
        ),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });

    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = r => {
      if (sortBy === "id")      return Number(r.id) || 0;
      if (sortBy === "enabled") return r.enabled ? 1 : 0;
      return (r[sortBy] || "").toLowerCase();
    };
    arr.sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      return va < vb ? -1 * dir : va > vb ? dir : 0;
    });
    return arr;
  }, [items, search, filterEnabled, sortBy, sortDir]);

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
    setSelectedDevices([]);
    setShowModal(true);
  };

  const openEdit = (r) => {
    isEditingRef.current = true;
    setEditingId(r.id);
    const deptObj  = departments.find(d => d.name === r.department);
    const groupObj = groups.find(g => g.name === r.group);
    setForm({
      name:             r.name             || "",
      department:       deptObj?.id        || "",
      group:            groupObj?.id       || "",
      platform:         r.platform         || "*",
      usecase:          r.usecase          || "healthcheck",
      command_prefix:   r.command_prefix   || "*",
      enabled:          !!r.enabled,
      case_insensitive: !!r.case_insensitive,
      line_operator:    r.line_operator    || "OR",
      block_operator:   r.block_operator   || "OR",
      conditions: (r.conditions || []).map(normalizeCondition),
      reason:           r.reason           || "",
    });
    const platVal = r.platform && r.platform !== "*" ? r.platform : null;
    setSelectedPlatformOption(platVal ? { label: platVal, value: platVal } : null);
    setSelectedDevices(
      (r.hosts || [])
        .filter(h => h !== "*")
        .map(h => ({ label: h, value: h }))
    );
    if (platVal) dispatch(fetchDevicesByPlatform(platVal));
    setShowModal(true);
  };

  const openClone = (r) => {
    isEditingRef.current = false;
    setEditingId(null);
    const deptObj  = departments.find(d => d.name === r.department);
    const groupObj = groups.find(g => g.name === r.group);
    setForm({
      name:             `Copy of ${r.name}`,
      department:       deptObj?.id        || (!isAdmin ? (userClaims?.department_id ?? "") : ""),
      group:            groupObj?.id       || (!isAdmin ? (userClaims?.group_id      ?? "") : ""),
      platform:         r.platform         || "*",
      usecase:          r.usecase          || "healthcheck",
      command_prefix:   r.command_prefix   || "*",
      enabled:          true,
      case_insensitive: !!r.case_insensitive,
      line_operator:    r.line_operator    || "OR",
      block_operator:   r.block_operator   || "OR",
      conditions: (r.conditions || []).map(normalizeCondition),
      reason:           r.reason           || "",
    });
    const platVal = r.platform && r.platform !== "*" ? r.platform : null;
    setSelectedPlatformOption(platVal ? { label: platVal, value: platVal } : null);
    setSelectedDevices(
      (r.hosts || []).filter(h => h !== "*").map(h => ({ label: h, value: h }))
    );
    if (platVal) dispatch(fetchDevicesByPlatform(platVal));
    setShowModal(true);
  };

  const openDelete = (r) => { setDeletingRule(r); setShowDeleteModal(true); };

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find(o => o.value === "__all__")) setSelectedDevices(deviceOptions);
    else setSelectedDevices(selected);
  };

  const onSubmit = async () => {
    const err = validateForm(form);
    if (err) return alert(err);

    const hosts = selectedDevices.length > 0
      ? selectedDevices.map(d => d.value)
      : ["*"];

    // Normalize conditions trước khi gửi API
    const normalizedConditions = (form.conditions || []).map(c => {
      if (c.mode !== "BLOCK") return c;
      const filters = (c.block_body_filters || []).filter(f => f.op && f.text?.trim());
      return {
        ...c,
        // old single filter: clear nếu đang dùng new format
        block_body_op:   filters.length ? null : (c.block_body_op  || null),
        block_body_text: filters.length ? null : (c.block_body_text || null),
        // new multiple filters
        block_body_filters:         filters,
        block_body_filter_operator: filters.length >= 2 ? (c.block_body_filter_operator || "OR") : "OR",
      };
    });

    const payload = {
      name:             form.name.trim(),
      hosts,
      platform:         form.platform       || "*",
      usecase:          form.usecase         || "*",
      command_prefix:   form.command_prefix  || "*",
      enabled:          form.enabled,
      case_insensitive: form.case_insensitive,
      line_operator:    form.line_operator,
      block_operator:   form.block_operator,
      conditions:       normalizedConditions,
      reason:           form.reason,
      group:            form.group      || null,
      department:       form.department || null,
    };

    try {
      if (editingId) {
        await dispatch(patchOutputIgnoreRuleV2({ id: editingId, patch: payload })).unwrap();
      } else {
        await dispatch(createOutputIgnoreRuleV2(payload)).unwrap();
      }
      setShowModal(false);   // ← chỉ đóng modal khi thành công
    } catch (_err) {
      // lỗi đã được thunk dispatch showTemporaryAlert — giữ modal mở để user sửa
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingRule) return;
    await dispatch(deleteOutputIgnoreRuleV2(deletingRule.id));
    setShowDeleteModal(false);
    setDeletingRule(null);
  };

  const onToggleEnabled = (r) =>
    dispatch(patchOutputIgnoreRuleV2({ id: r.id, patch: { enabled: !r.enabled } }));

  const colSpan = 9 + (isAdmin ? 3 : 0);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      {/* ── CREATE / EDIT MODAL ──────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId
              ? `Sửa Rule: ${form.name}`
              : form.name.startsWith("Copy of ")
                ? "Clone Rule"
                : "Tạo Ignore Rule V2"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Row 1: Name */}
          <Row className="g-2 mb-3">
            <Col md={12}>
              <Form.Label className="fw-bold">Tên Rule <span className="text-danger">*</span></Form.Label>
              <FormControl
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="VD: MSS_BSP_Block_NOC1"
              />
            </Col>
          </Row>

          {/* Row 2: Dept + Group */}
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Label className="fw-bold">Department</Form.Label>
              <FormControl
                as="select"
                value={form.department}
                onChange={e => {
                  const newDept = e.target.value;
                  const filtered = groups.filter(g =>
                    String(g.department?.id || g.department) === String(newDept)
                  );
                  setForm(p => ({
                    ...p,
                    department: newDept,
                    group: filtered.length === 1 ? String(filtered[0].id) : "",
                  }));
                }}
                disabled={!isAdmin}
              >
                <option value="">-- Chọn Department --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
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
                {(isAdmin || displayGroups.length > 1) && (
                  <option value="">-- Chọn Group --</option>
                )}
                {displayGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </FormControl>
            </Col>
          </Row>

          {/* Row 3: Platform + Hosts + Usecase + Cmd */}
          <Row className="g-2 mb-3 align-items-end">
            <Col md={3}>
              <Form.Label>Platform</Form.Label>
              <Select
                options={platformOptions}
                value={selectedPlatformOption}
                onChange={opt => {
                  isEditingRef.current = !!editingId;
                  setSelectedPlatformOption(opt);
                  setForm(p => ({ ...p, platform: opt?.value || "*" }));
                }}
                placeholder="-- Tìm platform --"
                isClearable isSearchable
              />
            </Col>
            <Col md={4}>
              <Form.Label>Hosts</Form.Label>
              <Select
                isMulti isSearchable
                closeMenuOnSelect={false} hideSelectedOptions={false}
                options={combinedDeviceOptions}
                value={selectedDevices}
                onChange={handleDeviceChange}
                placeholder="-- Chọn host hoặc để trống = * --"
                isDisabled={!selectedPlatformOption}
                isLoading={loadingDevices}
                styles={MULTI_SELECT_STYLES}
              />
              <small className="text-muted">Không chọn = áp dụng cho tất cả host (*)</small>
            </Col>
            <Col md={3}>
              <Form.Label>Usecase</Form.Label>
              <FormControl
                value={form.usecase}
                onChange={e => setForm(p => ({ ...p, usecase: e.target.value }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Cmd prefix</Form.Label>
              <FormControl
                value={form.command_prefix}
                placeholder="allip / *"
                onChange={e => setForm(p => ({ ...p, command_prefix: e.target.value }))}
              />
            </Col>
          </Row>

          {/* Row 4: Flags */}
          <Row className="g-2 mb-3">
            <Col md={6}>
              <div className="d-flex gap-4">
                <Form.Check type="checkbox" label="Enabled"
                  checked={!!form.enabled}
                  onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))} />
                <Form.Check type="checkbox" label="Case Insensitive"
                  checked={!!form.case_insensitive}
                  onChange={e => setForm(p => ({ ...p, case_insensitive: e.target.checked }))} />
              </div>
            </Col>
            <Col md={6}>
              <Form.Label>Reason</Form.Label>
              <FormControl
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Lý do ignore..."
              />
            </Col>
          </Row>

          {/* Row 5: Operators */}
          <Row className="g-2 mb-2">
            <Col md={6}>
              <Form.Label className="fw-bold">
                LINE operator
                <span className="text-muted fw-normal ms-1 small">
                  — áp dụng giữa các LINE conditions
                </span>
              </Form.Label>
              <Select
                options={OPERATOR_OPTIONS}
                value={OPERATOR_OPTIONS.find(o => o.value === form.line_operator)}
                onChange={opt => setForm(p => ({ ...p, line_operator: opt.value }))}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">
                BLOCK operator
                <span className="text-muted fw-normal ms-1 small">
                  — áp dụng giữa các BLOCK conditions
                </span>
              </Form.Label>
              <Select
                options={OPERATOR_OPTIONS}
                value={OPERATOR_OPTIONS.find(o => o.value === form.block_operator)}
                onChange={opt => setForm(p => ({ ...p, block_operator: opt.value }))}
              />
            </Col>
          </Row>

          {/* Row 6: Conditions editor */}
          <div className="border rounded p-3 mt-2">
            <div className="fw-bold mb-2">
              Conditions
              <span className="text-muted fw-normal ms-2 small">
                ({form.conditions.length} điều kiện)
              </span>
            </div>
            <ConditionEditor
              conditions={form.conditions}
              onChange={conds => setForm(p => ({ ...p, conditions: conds }))}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Hủy
          </Button>
          <Button
            variant={editingId ? "warning" : "primary"}
            onClick={onSubmit}
            disabled={saving}
          >
            {saving
              ? <Spinner size="sm" animation="border" />
              : editingId ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── DELETE MODAL ─────────────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa rule <strong>{deletingRule?.name}</strong>?
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

      {/* ── MAIN CARD ────────────────────────────────────────────────── */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Output Ignore Rules V2
                <Badge bg="primary" className="ms-2">{items.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary"
                  onClick={() => dispatch(fetchOutputIgnoreRulesV2())}
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
                <Col md={8}>
                  <InputGroup>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <FormControl
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="name / host / platform / cmd / text / reason..." />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Enabled</InputGroup.Text>
                    <FormControl as="select" value={filterEnabled}
                      onChange={e => setFilterEnabled(e.target.value)}>
                      <option value="">All</option>
                      <option value="1">ON</option>
                      <option value="0">OFF</option>
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
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("name")}>
                        Tên {sortIcon("name")}
                      </th>
                      <th>Hosts</th>
                      <th style={{ cursor: "pointer" }} onClick={() => toggleSort("platform")}>
                        Platform {sortIcon("platform")}
                      </th>
                      <th>Usecase / Cmd</th>
                      <th>Conditions</th>
                      <th>Operators</th>
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
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={colSpan} className="text-center text-muted py-3">
                          Không có rule nào
                        </td>
                      </tr>
                    ) : filteredItems.map(r => {
                      const canAct = checkCanAction(r);
                      const lineConds  = (r.conditions || []).filter(c => c.mode === "LINE");
                      const blockConds = (r.conditions || []).filter(c => c.mode === "BLOCK");
                      return (
                        <tr key={r.id} className={!r.enabled ? "table-secondary" : ""}>
                          <td className="fw-bold">{r.id}</td>
                          <td>
                            {r.enabled
                              ? <Badge bg="success">ON</Badge>
                              : <Badge bg="secondary">OFF</Badge>}
                          </td>
                          <td className="fw-bold">{r.name}</td>

                          {/* Hosts */}
                          <td style={{ maxWidth: 180 }}>
                            <div className="d-flex flex-wrap gap-1">
                              {(r.hosts || []).map((h, i) => (
                                <Badge key={i} bg="light" text="dark" className="border">
                                  {h}
                                </Badge>
                              ))}
                            </div>
                          </td>

                          <td>{r.platform}</td>

                          {/* Usecase / Cmd */}
                          <td style={{ fontSize: "0.82rem" }}>
                            <div>{r.usecase}</div>
                            <code className="text-muted">{r.command_prefix}</code>
                          </td>

                          {/* Conditions summary */}
                          <td style={{ fontSize: "0.82rem", minWidth: 200 }}>
                            {lineConds.length > 0 && (
                              <div className="mb-1">
                                <Badge bg="info" text="dark" className="me-1">
                                  LINE ×{lineConds.length}
                                </Badge>
                                {lineConds.map((c, i) => (
                                  <div key={i} className="text-truncate" style={{ maxWidth: 180 }}
                                    title={`${c.line_op} | ${c.line_text}`}>
                                    <small>{c.line_op}: <em>{c.line_text}</em></small>
                                  </div>
                                ))}
                              </div>
                            )}
                            {blockConds.length > 0 && (
                              <div>
                                <Badge bg="warning" text="dark" className="me-1">
                                  BLOCK ×{blockConds.length}
                                </Badge>
                                {blockConds.map((c, i) => (
                                  <div key={i} className="text-truncate" style={{ maxWidth: 220 }}
                                    title={[
                                      `START: ${c.block_start_op} | ${c.block_start_text}`,
                                      c.block_body_op ? `BODY: ${c.block_body_op} | ${c.block_body_text}` : null,
                                      `END: ${c.block_end_op} | ${c.block_end_text}`,
                                    ].filter(Boolean).join(" → ")}>
                                    <small>
                                      {c.block_start_op}: <em>{c.block_start_text}</em>
                                      {c.block_body_op && (
                                        <span className="text-primary ms-1">
                                          → body:{c.block_body_op}
                                        </span>
                                      )}
                                    </small>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Operators */}
                          <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                            {lineConds.length > 0 && (
                              <div>
                                <Badge bg="info" text="dark">LINE</Badge>
                                {" "}{r.line_operator}
                              </div>
                            )}
                            {blockConds.length > 0 && (
                              <div>
                                <Badge bg="warning" text="dark">BLOCK</Badge>
                                {" "}{r.block_operator}
                              </div>
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
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {fmtDate(r.updated_at)}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="outline-primary"
                                onClick={() => openEdit(r)}
                                disabled={saving || !canAct}
                                title={!canAct ? "Không có quyền" : "Sửa"}>
                                ✏️
                              </Button>
                              <Button size="sm" variant="outline-secondary"
                                onClick={() => openClone(r)}
                                disabled={saving}
                                title="Clone rule này">
                                📋
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

export default OutputIgnoreRulesV2;