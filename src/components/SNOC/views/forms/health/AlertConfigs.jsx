import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal,
  Row, Spinner, Tab, Table, Tabs,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  createAlertConfig, deleteAlertConfig, fetchAlertConfigs,
  fetchAlertLogs, fetchAlertStates,
  resetAlertConfigState, testAlertConfig, updateAlertConfig,
} from "../../../redux/Healthcheck/alertConfigSlice";
import { fetchAnalysisSchema } from "../../../redux/Healthcheck/analysisParamSlice";
import { fetchDevicesByPlatform } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
import snocApi, { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── helpers ───────────────────────────────────────────────────────────────────

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const EMPTY_FORM = {
  label: "",
  function_name: "",
  platform: "",
  device_names: [],
  department: null,
  group: null,
  send_sms: false,
  sms_numbers: "",
  send_telegram: false,
  telegram_chat_ids: "",
  send_email: false,
  email_addresses: "",
  trigger_mode: "first_only",
  repeat_interval_minutes: 60,
  send_clear_notification: true,
  enabled: true,
};

const parseLines = (str) =>
  (str || "").split("\n").map((s) => s.trim()).filter(Boolean);

const joinLines = (arr) =>
  Array.isArray(arr) ? arr.join("\n") : (arr || "");

const configToForm = (cfg) => ({
  label:                   cfg.label || "",
  function_name:           cfg.function_name || "",
  platform:                cfg.platform || "",
  device_names:            cfg.device_names || [],
  department:              cfg.department ?? null,
  group:                   cfg.group ?? null,
  send_sms:                cfg.send_sms || false,
  sms_numbers:             joinLines(cfg.sms_numbers),
  send_telegram:           cfg.send_telegram || false,
  telegram_chat_ids:       joinLines(cfg.telegram_chat_ids),
  send_email:              cfg.send_email || false,
  email_addresses:         joinLines(cfg.email_addresses),
  trigger_mode:            cfg.trigger_mode || "first_only",
  repeat_interval_minutes: cfg.repeat_interval_minutes || 60,
  send_clear_notification: cfg.send_clear_notification !== false,
  enabled:                 cfg.enabled !== false,
});

const formToPayload = (form) => ({
  label:                   form.label.trim(),
  function_name:           form.function_name,
  platform:                form.platform.trim(),
  device_names:            form.device_names,
  department:              form.department,
  group:                   form.group,
  send_sms:                form.send_sms,
  sms_numbers:             form.send_sms ? parseLines(form.sms_numbers) : [],
  send_telegram:           form.send_telegram,
  telegram_chat_ids:       form.send_telegram ? parseLines(form.telegram_chat_ids) : [],
  send_email:              form.send_email,
  email_addresses:         form.send_email ? parseLines(form.email_addresses) : [],
  trigger_mode:            form.trigger_mode,
  repeat_interval_minutes: Number(form.repeat_interval_minutes),
  send_clear_notification: form.send_clear_notification,
  enabled:                 form.enabled,
  schedule:                null,
});

const fmtDatetime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const CHANNEL_COLORS = { sms: "success", telegram: "primary", email: "warning" };
const LOG_TYPE_COLORS = { alert: "danger", clear: "success" };
const STATUS_COLORS   = { sent: "success", failed: "danger", skipped: "secondary" };

const ScopeBadge = ({ cfg }) => {
  if (cfg.group_name) {
    return (
      <>
        <Badge bg="info" className="small me-1">{cfg.department_name}</Badge>
        <Badge bg="primary" className="small">{cfg.group_name}</Badge>
      </>
    );
  }
  if (cfg.department_name) {
    return <Badge bg="secondary" className="small">{cfg.department_name}</Badge>;
  }
  return <Badge bg="dark" className="small">Global</Badge>;
};

// ── component ─────────────────────────────────────────────────────────────────

const AlertConfigs = () => {
  const dispatch = useDispatch();

  const { configs, logs, states, loading, saving } =
    useSelector((s) => s.alertConfig);
  const { schema } = useSelector((s) => s.analysisParam);
  const departments = useSelector((s) => s.department.departments);
  const groups      = useSelector((s) => s.group.groups);
  const { devicesByPlatform } = useSelector((s) => s.platformDevice);

  const claims = useMemo(() => getJwtClaims(), []);
  const isSuper = useMemo(() =>
    Boolean(claims?.is_superuser || claims?.role === 'super'), [claims]);
  const isAdmin = useMemo(() =>
    Boolean(claims?.is_superuser || ["super", "admin"].includes(claims?.role)), [claims]);

  // For admin (non-super): dept is fixed from JWT
  const adminDeptId   = useMemo(() => claims?.dept_id   ?? null, [claims]);
  const adminDeptName = useMemo(() => claims?.dept_name ?? null, [claims]);

  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [modalTab, setModalTab]     = useState("config");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // List-level filters
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterEnabled, setFilterEnabled]   = useState("all"); // "all" | "enabled" | "disabled"

  // Platform options — fetched dynamically, filtered by dept/group when selected
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [platformsLoading, setPlatformsLoading]     = useState(false);
  const platformFetchRef = useRef(0); // cancel stale requests

  useEffect(() => {
    dispatch(fetchAlertConfigs());
    dispatch(fetchAnalysisSchema());
    if (isAdmin) {
      dispatch(fetchDepartments());
      dispatch(fetchGroups());
    }
  }, [dispatch, isAdmin]);

  // Fetch platforms filtered by currently selected dept/group in form
  const fetchAvailablePlatforms = useCallback(async (deptId, groupId) => {
    const seq = ++platformFetchRef.current;
    setPlatformsLoading(true);
    try {
      const params = {};
      if (deptId)  params.department = deptId;
      if (groupId) params.group = groupId;
      const res = await snocApi.get("/nornirps/NornirGetPlatformView/", { params });
      if (seq !== platformFetchRef.current) return; // stale
      setAvailablePlatforms(
        (res.data || []).map((p) => ({ value: p.name, label: p.name }))
      );
    } catch {
      if (seq !== platformFetchRef.current) return;
      setAvailablePlatforms([]);
    } finally {
      if (seq === platformFetchRef.current) setPlatformsLoading(false);
    }
  }, []);

  // Re-fetch platforms whenever dept/group scope in form changes
  useEffect(() => {
    if (!showModal) return;
    fetchAvailablePlatforms(form.department, form.group);
  }, [showModal, form.department, form.group, fetchAvailablePlatforms]);

  // Fetch devices when platform is selected in form (for device_names multi-select)
  useEffect(() => {
    if (showModal && form.platform) {
      dispatch(fetchDevicesByPlatform(form.platform));
    }
  }, [dispatch, showModal, form.platform]);

  // ── device_names options (filtered by selected platform in form) ──────────
  const deviceNameOptions = useMemo(() => {
    const devs = (form.platform && devicesByPlatform[form.platform]) || [];
    return devs.map((d) => ({ value: d.name, label: d.name }));
  }, [devicesByPlatform, form.platform]);

  const deviceNamesSelected = useMemo(
    () => (form.device_names || []).map((n) => ({ value: n, label: n })),
    [form.device_names]
  );

  // ── function_name options from analysis schema ─────────────────────────────
  const fnOptions = useMemo(
    () => Object.entries(schema).map(([key, s]) => ({
      value: key,
      label: `${s.label} (${key})`,
    })),
    [schema]
  );

  const fnSelected = useMemo(
    () => fnOptions.find((o) => o.value === form.function_name) || null,
    [fnOptions, form.function_name]
  );

  // ── dept/group Select options ──────────────────────────────────────────────
  const deptOptions = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments]
  );

  // Groups filtered by currently selected dept in form (for super)
  // or by admin's dept (for admin)
  const filteredGroupOptions = useMemo(() => {
    const deptId = isSuper ? form.department : adminDeptId;
    if (!deptId) return groups.map((g) => ({ value: g.id, label: g.name }));
    return groups
      .filter((g) => (g.department?.id ?? g.department) === deptId)
      .map((g) => ({ value: g.id, label: g.name }));
  }, [groups, isSuper, form.department, adminDeptId]);

  const deptSelected  = useMemo(
    () => deptOptions.find((o) => o.value === form.department) || null,
    [deptOptions, form.department]
  );
  const groupSelected = useMemo(
    () => filteredGroupOptions.find((o) => o.value === form.group) || null,
    [filteredGroupOptions, form.group]
  );

  // ── form helpers ───────────────────────────────────────────────────────────
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      ...EMPTY_FORM,
      // Admin: pre-fill dept from JWT (BE will enforce, but helps UX)
      department: isSuper ? null : adminDeptId,
    });
    setModalTab("config");
    setShowModal(true);
  };

  const openEdit = (cfg) => {
    setEditTarget(cfg);
    setForm(configToForm(cfg));
    setModalTab("config");
    dispatch(fetchAlertLogs({ configId: cfg.id }));
    dispatch(fetchAlertStates(cfg.id));
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = formToPayload(form);
    if (!payload.label || !payload.function_name) return;

    if (editTarget) {
      const res = await dispatch(updateAlertConfig({ id: editTarget.id, data: payload }));
      if (!res.error) setShowModal(false);
    } else {
      const res = await dispatch(createAlertConfig(payload));
      if (!res.error) setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteAlertConfig(id));
    setConfirmDelete(null);
  };

  // ── list-level filter derived data ────────────────────────────────────────

  const platformsInConfigs = useMemo(() => {
    const seen = new Set();
    return configs
      .filter((c) => c.platform && !seen.has(c.platform) && seen.add(c.platform))
      .map((c) => ({ value: c.platform, label: c.platform }));
  }, [configs]);

  const filteredConfigs = useMemo(() => {
    let result = configs;
    if (filterPlatform) result = result.filter((c) => c.platform === filterPlatform);
    if (filterEnabled !== "all") result = result.filter((c) => c.enabled === (filterEnabled === "enabled"));
    return result;
  }, [configs, filterPlatform, filterEnabled]);

  // ── channel badge summary ──────────────────────────────────────────────────
  const renderChannelBadges = (cfg) => (
    <div className="d-flex gap-1 flex-wrap">
      {cfg.send_sms && (
        <Badge bg="success" className="small">
          SMS {cfg.sms_numbers?.length > 0 ? `(${cfg.sms_numbers.length})` : ""}
        </Badge>
      )}
      {cfg.send_telegram && (
        <Badge bg="primary" className="small">
          Tele {cfg.telegram_chat_ids?.length > 0 ? `(${cfg.telegram_chat_ids.length})` : ""}
        </Badge>
      )}
      {cfg.send_email && (
        <Badge bg="warning" text="dark" className="small">
          Email {cfg.email_addresses?.length > 0 ? `(${cfg.email_addresses.length})` : ""}
        </Badge>
      )}
      {!cfg.send_sms && !cfg.send_telegram && !cfg.send_email && (
        <span className="text-muted small">—</span>
      )}
    </div>
  );

  // ── channel section in form ────────────────────────────────────────────────
  const renderChannelSection = (key, label, emoji, textareaKey, placeholder) => (
    <Card className="mb-2">
      <Card.Body className="p-2">
        <Form.Check
          type="switch"
          id={`switch-${key}`}
          label={<strong>{emoji} {label}</strong>}
          checked={form[key]}
          onChange={(e) => setField(key, e.target.checked)}
          className="mb-2"
        />
        {form[key] && (
          <Form.Control
            as="textarea"
            rows={3}
            value={form[textareaKey]}
            onChange={(e) => setField(textareaKey, e.target.value)}
            placeholder={placeholder}
            className="font-monospace small"
          />
        )}
      </Card.Body>
    </Card>
  );

  // ── scope section in form ──────────────────────────────────────────────────
  const renderScopeSection = () => {
    if (!isAdmin) return null;
    return (
      <Card className="mb-3">
        <Card.Body className="p-2">
          <Form.Label className="fw-bold mb-2">Phạm vi (Scope)</Form.Label>
          {isSuper ? (
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="small text-muted">Department</Form.Label>
                <Select
                  options={[{ value: null, label: "— Global (tất cả dept) —" }, ...deptOptions]}
                  value={deptSelected || { value: null, label: "— Global (tất cả dept) —" }}
                  onChange={(opt) => {
                    setField("department", opt?.value ?? null);
                    setField("group", null);
                    setField("platform", ""); // reset platform khi đổi dept
                  }}
                  placeholder="Global (tất cả dept)"
                  isClearable={false}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small text-muted">
                  Group {form.department ? "" : <span className="text-muted">(chọn dept trước)</span>}
                </Form.Label>
                <Select
                  options={[{ value: null, label: "— Tất cả group trong dept —" }, ...filteredGroupOptions]}
                  value={groupSelected || { value: null, label: "— Tất cả group trong dept —" }}
                  onChange={(opt) => {
                    setField("group", opt?.value ?? null);
                    setField("platform", ""); // reset platform khi đổi group
                  }}
                  isDisabled={!form.department}
                  placeholder="Tất cả group trong dept"
                  isClearable={false}
                />
              </Col>
            </Row>
          ) : (
            // Admin: dept fixed, chỉ chọn group
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="small text-muted">Department</Form.Label>
                <Form.Control
                  value={adminDeptName || "—"}
                  disabled
                  className="bg-light"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small text-muted">Group (để trống = toàn bộ dept)</Form.Label>
                <Select
                  options={[{ value: null, label: "— Toàn bộ dept —" }, ...filteredGroupOptions]}
                  value={groupSelected || { value: null, label: "— Toàn bộ dept —" }}
                  onChange={(opt) => {
                    setField("group", opt?.value ?? null);
                    setField("platform", "");
                  }}
                  placeholder="Toàn bộ dept"
                  isClearable={false}
                />
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    );
  };

  // ── log table in modal ─────────────────────────────────────────────────────
  const renderLogs = (cfgId) => {
    const cfgLogs = logs[cfgId] || [];
    if (!cfgLogs.length) {
      return <div className="text-muted text-center py-3">Chưa có log nào</div>;
    }
    return (
      <Table responsive bordered size="sm" className="mb-0 small">
        <thead className="table-light">
          <tr>
            <th>Thời gian</th>
            <th>Type</th>
            <th>Kênh</th>
            <th>Target</th>
            <th>Device</th>
            <th>Function</th>
            <th>Status</th>
            <th>Lỗi</th>
          </tr>
        </thead>
        <tbody>
          {cfgLogs.map((log) => (
            <tr key={log.id}>
              <td className="text-nowrap">{fmtDatetime(log.sent_at)}</td>
              <td>
                <Badge bg={LOG_TYPE_COLORS[log.log_type] || "secondary"}>
                  {log.log_type === "alert" ? "ALERT" : "CLEAR"}
                </Badge>
              </td>
              <td>
                <Badge bg={CHANNEL_COLORS[log.channel] || "secondary"} className="small">
                  {log.channel}
                </Badge>
              </td>
              <td className="font-monospace">{log.target}</td>
              <td>{log.device_name}</td>
              <td className="small text-muted">{log.function_name}</td>
              <td>
                <Badge bg={STATUS_COLORS[log.status] || "secondary"} className="small">
                  {log.status}
                </Badge>
              </td>
              <td className="text-danger small">{log.error_message || "—"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // ── states table in modal ──────────────────────────────────────────────────
  const renderStates = (cfgId) => {
    const cfgStates = states[cfgId] || [];
    if (!cfgStates.length) {
      return <div className="text-muted text-center py-3">Không có alert đang active</div>;
    }
    return (
      <Table responsive bordered size="sm" className="mb-0 small">
        <thead className="table-light">
          <tr>
            <th>Device</th>
            <th>Platform</th>
            <th>Function</th>
            <th>Lần đầu gửi</th>
            <th>Lần cuối gửi</th>
          </tr>
        </thead>
        <tbody>
          {cfgStates.map((st) => (
            <tr key={st.id}>
              <td className="fw-semibold">{st.device_name}</td>
              <td>{st.platform}</td>
              <td className="small text-muted">{st.function_name}</td>
              <td className="text-nowrap">{fmtDatetime(st.first_sent_at)}</td>
              <td className="text-nowrap">{fmtDatetime(st.last_sent_at)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // ── main render ───────────────────────────────────────────────────────────

  return (
    <>
      <TopNavbarHealth />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Alert Notification Config
                <Badge bg="secondary" className="ms-2">{configs.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => dispatch(fetchAlertConfigs())}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Reload"}
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="primary" onClick={openCreate}>
                    + Tạo mới
                  </Button>
                )}
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              {loading && configs.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: "2rem" }}>🔔</div>
                  <div>Chưa có alert config nào</div>
                  {isAdmin && (
                    <Button className="mt-2" variant="primary" onClick={openCreate}>
                      + Tạo mới
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* ── Filter bar ────────────────────────────────────────── */}
                  <div className="d-flex gap-2 align-items-center px-3 py-2 border-bottom flex-wrap bg-light">
                    <span className="text-muted small fw-semibold text-nowrap">Lọc:</span>
                    <div style={{ minWidth: 180 }}>
                      <Select
                        styles={SELECT_STYLES}
                        options={[{ value: "", label: "Tất cả platform" }, ...platformsInConfigs]}
                        value={{ value: filterPlatform, label: filterPlatform || "Tất cả platform" }}
                        onChange={(opt) => setFilterPlatform(opt?.value ?? "")}
                        placeholder="Platform..."
                        isClearable
                      />
                    </div>
                    <div className="d-flex gap-1">
                      {[
                        { v: "all",      label: "Tất cả" },
                        { v: "enabled",  label: "Đang ON" },
                        { v: "disabled", label: "Đang OFF" },
                      ].map(({ v, label }) => (
                        <Button
                          key={v}
                          size="sm"
                          variant={filterEnabled === v ? "primary" : "outline-secondary"}
                          onClick={() => setFilterEnabled(v)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                    {(filterPlatform || filterEnabled !== "all") && (
                      <>
                        <Badge bg="warning" text="dark" className="small">
                          {filteredConfigs.length}/{configs.length}
                        </Badge>
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0 text-muted small"
                          onClick={() => { setFilterPlatform(""); setFilterEnabled("all"); }}
                        >
                          ✕ Xóa filter
                        </Button>
                      </>
                    )}
                  </div>

                  <Table responsive hover className="mb-0 small align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Label</th>
                      <th>Scope</th>
                      <th>Function</th>
                      <th>Platform</th>
                      <th>Devices</th>
                      <th>Channels</th>
                      <th>Trigger</th>
                      <th>Clear</th>
                      <th style={{ width: 60 }}>Active</th>
                      <th style={{ width: 240 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConfigs.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted py-4">
                          Không có config nào khớp với bộ lọc
                        </td>
                      </tr>
                    ) : filteredConfigs.map((cfg) => (
                      <tr key={cfg.id} className={!cfg.enabled ? "opacity-50" : ""}>
                        <td className="fw-semibold">{cfg.label}</td>
                        <td><ScopeBadge cfg={cfg} /></td>
                        <td>
                          <code className="small">{cfg.function_name}</code>
                        </td>
                        <td>
                          {cfg.platform ? (
                            <Badge bg="info" text="dark">{cfg.platform}</Badge>
                          ) : (
                            <span className="text-muted">Tất cả</span>
                          )}
                        </td>
                        <td>
                          {cfg.device_names?.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {cfg.device_names.map((n) => (
                                <Badge key={n} bg="success" className="small">{n}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">Tất cả</span>
                          )}
                        </td>
                        <td>{renderChannelBadges(cfg)}</td>
                        <td>
                          {cfg.trigger_mode === "first_only" ? (
                            <Badge bg="secondary">1 lần đầu</Badge>
                          ) : (
                            <Badge bg="warning" text="dark">
                              Lặp /{cfg.repeat_interval_minutes}ph
                            </Badge>
                          )}
                        </td>
                        <td>
                          {cfg.send_clear_notification
                            ? <Badge bg="success">Clear</Badge>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <Badge bg={cfg.enabled ? "success" : "secondary"}>
                            {cfg.enabled ? "ON" : "OFF"}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openEdit(cfg)}
                            >
                              Sửa
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => dispatch(testAlertConfig(cfg.id))}
                                  disabled={saving}
                                  title="Gửi test tới tất cả targets"
                                >
                                  Test
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => dispatch(resetAlertConfigState(cfg.id))}
                                  disabled={saving}
                                  title="Xóa toàn bộ AlertState của config này"
                                >
                                  Reset
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => setConfirmDelete(cfg)}
                                >
                                  Xóa
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {editTarget ? "Sửa Alert Config" : "Tạo Alert Config"}
            {editTarget && (
              <span className="ms-2">
                <ScopeBadge cfg={editTarget} />
              </span>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={modalTab}
            onSelect={(k) => setModalTab(k)}
            className="mb-3"
          >
            {/* ── Tab Config ─────────────────────────────────────────────── */}
            <Tab eventKey="config" title="Cấu hình">
              <Form>
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        value={form.label}
                        onChange={(e) => setField("label", e.target.value)}
                        placeholder="Ví dụ: Disk alert PGW"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        Platform
                        {platformsLoading && (
                          <Spinner size="sm" animation="border" className="ms-1" />
                        )}
                      </Form.Label>
                      <Select
                        options={[
                          { value: "", label: "— Tất cả platforms —" },
                          ...availablePlatforms,
                        ]}
                        value={
                          form.platform
                            ? { value: form.platform, label: form.platform }
                            : { value: "", label: "— Tất cả platforms —" }
                        }
                        onChange={(opt) => setField("platform", opt?.value ?? "")}
                        isLoading={platformsLoading}
                        isClearable={false}
                        isSearchable
                        placeholder="Tất cả platforms"
                        noOptionsMessage={() =>
                          form.department || form.group
                            ? "Không có platform nào trong scope này"
                            : "Không có platform"
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {form.platform && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Thiết bị cụ thể{" "}
                      <span className="text-muted fw-normal">(tùy chọn — để trống = áp dụng tất cả)</span>
                    </Form.Label>
                    <Select
                      styles={SELECT_STYLES}
                      options={deviceNameOptions}
                      value={deviceNamesSelected}
                      onChange={(opts) => setField("device_names", (opts || []).map((o) => o.value))}
                      placeholder="Tất cả thiết bị trong platform này..."
                      isMulti
                      closeMenuOnSelect={false}
                      isClearable
                      noOptionsMessage={() => form.platform ? "Không có thiết bị nào" : "Chọn platform trước"}
                    />
                    {form.device_names?.length > 0 && (
                      <small className="text-warning">
                        Alert chỉ fire cho {form.device_names.length} thiết bị được chọn
                      </small>
                    )}
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Hàm phân tích <span className="text-danger">*</span></Form.Label>
                  <Select
                    options={fnOptions}
                    value={fnSelected}
                    onChange={(opt) => setField("function_name", opt?.value || "")}
                    placeholder="Chọn hàm analyze_*..."
                    isClearable
                    isSearchable
                  />
                </Form.Group>

                {/* ── Scope ─────────────────────────────────────────────── */}
                {renderScopeSection()}

                {/* ── Channels ──────────────────────────────────────────── */}
                <Form.Label className="fw-bold">Kênh thông báo</Form.Label>

                {renderChannelSection(
                  "send_sms", "SMS", "📱", "sms_numbers",
                  "+84901234567\n+84912345678"
                )}
                {renderChannelSection(
                  "send_telegram", "Telegram", "📢", "telegram_chat_ids",
                  "-100123456789\n-100987654321"
                )}
                {renderChannelSection(
                  "send_email", "Email", "📧", "email_addresses",
                  "noc@example.com\nops@example.com"
                )}

                {/* ── Trigger ───────────────────────────────────────────── */}
                <Card className="mb-2">
                  <Card.Body className="p-2">
                    <Form.Label className="fw-bold">Trigger mode</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        id="trigger-first"
                        label="Chỉ gửi lần đầu (+ clear khi OK)"
                        name="trigger_mode"
                        checked={form.trigger_mode === "first_only"}
                        onChange={() => setField("trigger_mode", "first_only")}
                      />
                      <Form.Check
                        type="radio"
                        id="trigger-repeat"
                        label="Lặp theo giờ"
                        name="trigger_mode"
                        checked={form.trigger_mode === "repeat_hourly"}
                        onChange={() => setField("trigger_mode", "repeat_hourly")}
                      />
                    </div>
                    {form.trigger_mode === "repeat_hourly" && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="small">Lặp mỗi</span>
                        <Form.Control
                          type="number"
                          style={{ width: 80 }}
                          size="sm"
                          min={5}
                          value={form.repeat_interval_minutes}
                          onChange={(e) => setField("repeat_interval_minutes", e.target.value)}
                        />
                        <span className="small">phút</span>
                      </div>
                    )}
                    <Form.Check
                      className="mt-2"
                      type="checkbox"
                      id="send-clear"
                      label="Gửi thông báo khi thiết bị trở về OK (Clear notification)"
                      checked={form.send_clear_notification}
                      onChange={(e) => setField("send_clear_notification", e.target.checked)}
                    />
                  </Card.Body>
                </Card>

                <Form.Check
                  type="switch"
                  id="cfg-enabled"
                  label="Enabled"
                  checked={form.enabled}
                  onChange={(e) => setField("enabled", e.target.checked)}
                />
              </Form>
            </Tab>

            {/* ── Tab Logs (edit mode only) ──────────────────────────────── */}
            {editTarget && (
              <Tab eventKey="logs" title={`Logs (${(logs[editTarget.id] || []).length})`}>
                <div className="d-flex justify-content-end mb-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => dispatch(fetchAlertLogs({ configId: editTarget.id }))}
                  >
                    Reload
                  </Button>
                </div>
                {renderLogs(editTarget.id)}
              </Tab>
            )}

            {/* ── Tab Active States (edit mode only) ────────────────────── */}
            {editTarget && (
              <Tab
                eventKey="states"
                title={`Active Alerts (${(states[editTarget.id] || []).length})`}
              >
                <div className="d-flex justify-content-end mb-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => dispatch(fetchAlertStates(editTarget.id))}
                  >
                    Reload
                  </Button>
                </div>
                {renderStates(editTarget.id)}
              </Tab>
            )}
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {isAdmin && modalTab === "config" && (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !form.label || !form.function_name}
            >
              {saving ? <Spinner size="sm" animation="border" className="me-1" /> : null}
              {editTarget ? "Cập nhật" : "Tạo"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ── Confirm Delete ────────────────────────────────────────────────── */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa alert config <strong>{confirmDelete?.label}</strong>? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(confirmDelete.id)}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AlertConfigs;
