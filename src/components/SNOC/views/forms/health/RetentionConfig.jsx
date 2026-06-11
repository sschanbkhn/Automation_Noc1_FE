import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal,
  Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  createRetentionConfig, deleteRetentionConfig,
  fetchRetentionConfigs, updateRetentionConfig,
} from "../../../redux/Healthcheck/retentionConfigSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
import snocApi, { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../../../redux/Alert/alertSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── constants ──────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: "1w", label: "1 Tuần" },
  { value: "2w", label: "2 Tuần" },
  { value: "3w", label: "3 Tuần" },
  { value: "1m", label: "1 Tháng" },
  { value: "3m", label: "3 Tháng" },
  { value: "6m", label: "6 Tháng" },
  { value: "1y", label: "1 Năm" },
];

const SCOPE_OPTIONS = [
  { value: "result_files", label: "File Kết Quả" },
  { value: "history",      label: "Lịch Sử" },
  { value: "both",         label: "Cả Hai" },
];

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  department:       null,
  group:            null,
  platform:         null,
  retention_period: "3m",
  scope:            "both",
  enabled:          true,
};

// ── helpers ────────────────────────────────────────────────────────────────────

const scopeBadgeVariant = (scope) =>
  scope === "both" ? "primary" : scope === "history" ? "info" : "warning";

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

const RetentionConfig = () => {
  const dispatch    = useDispatch();
  const { items, loading, saving } = useSelector((s) => s.retentionConfig);
  const departments = useSelector((s) => s.department.departments);
  const groups      = useSelector((s) => s.group.groups);

  const claims  = useMemo(() => getJwtClaims(), []);
  const isSuper = useMemo(() =>
    Boolean(claims?.is_superuser || claims?.role === "super"), [claims]);
  const isAdmin = useMemo(() =>
    Boolean(claims?.is_superuser || ["super", "admin"].includes(claims?.role)), [claims]);

  const adminDeptId   = useMemo(() => claims?.dept_id   ?? null, [claims]);
  const adminDeptName = useMemo(() => claims?.dept_name ?? null, [claims]);

  // ── local state ──────────────────────────────────────────────────────────────
  const [page, setPage]             = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [triggeringId, setTriggeringId]   = useState(null);

  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [platformsLoading, setPlatformsLoading]     = useState(false);

  useEffect(() => {
    dispatch(fetchRetentionConfigs());
    if (isAdmin) {
      dispatch(fetchDepartments());
      dispatch(fetchGroups());
    }
  }, [dispatch, isAdmin]);

  // ── platform options ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showModal) return;
    const params = {};
    if (form.department) params.department = form.department;
    if (form.group)      params.group      = form.group;
    setPlatformsLoading(true);
    snocApi
      .get("/nornirps/NornirGetPlatformView/", { params })
      .then((res) =>
        setAvailablePlatforms((res.data || []).map((p) => ({ value: p.id, label: p.name })))
      )
      .catch(() => setAvailablePlatforms([]))
      .finally(() => setPlatformsLoading(false));
  }, [showModal, form.department, form.group]);

  // ── select options ────────────────────────────────────────────────────────────
  const deptOptions = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments]
  );

  const filteredGroupOptions = useMemo(() => {
    const deptId = isSuper ? form.department : adminDeptId;
    if (!deptId) return groups.map((g) => ({ value: g.id, label: g.name }));
    return groups
      .filter((g) => (g.department?.id ?? g.department) === deptId)
      .map((g) => ({ value: g.id, label: g.name }));
  }, [groups, isSuper, form.department, adminDeptId]);

  const deptSelected    = useMemo(() => deptOptions.find((o) => o.value === form.department) || null, [deptOptions, form.department]);
  const groupSelected   = useMemo(() => filteredGroupOptions.find((o) => o.value === form.group) || null, [filteredGroupOptions, form.group]);
  const platformSelected = useMemo(() => availablePlatforms.find((o) => o.value === form.platform) || null, [availablePlatforms, form.platform]);
  const periodSelected  = useMemo(() => PERIOD_OPTIONS.find((o) => o.value === form.retention_period) || null, [form.retention_period]);
  const scopeSelected   = useMemo(() => SCOPE_OPTIONS.find((o) => o.value === form.scope) || null, [form.scope]);

  // ── pagination ────────────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems   = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // ── modal open ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, department: isSuper ? null : adminDeptId });
    setShowModal(true);
  };

  const openEdit = (cfg) => {
    setEditTarget(cfg);
    setForm({
      department:       cfg.department ?? null,
      group:            cfg.group ?? null,
      platform:         cfg.platform ?? null,
      retention_period: cfg.retention_period || "3m",
      scope:            cfg.scope || "both",
      enabled:          cfg.enabled !== false,
    });
    setShowModal(true);
  };

  // ── save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const payload = {
      department:       form.department,
      group:            form.group,
      platform:         form.platform,
      retention_period: form.retention_period,
      scope:            form.scope,
      enabled:          form.enabled,
    };
    const action = editTarget
      ? updateRetentionConfig({ id: editTarget.id, data: payload })
      : createRetentionConfig(payload);
    const res = await dispatch(action);
    if (!res.error) setShowModal(false);
  };

  const handleDelete = async (id) => {
    await dispatch(deleteRetentionConfig(id));
    setConfirmDelete(null);
  };

  const handleTriggerCleanup = async (cfg) => {
    setTriggeringId(cfg.id);
    try {
      await snocApi.post(`/nornirps/healthcheck/retention-configs/${cfg.id}/trigger-cleanup/`);
      dispatch(showTemporaryAlert({ message: `Đã queue cleanup cho config #${cfg.id}. Kiểm tra Celery log để theo dõi.`, type: "success" }));
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể trigger cleanup";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
    } finally {
      setTriggeringId(null);
    }
  };

  // ── scope section ─────────────────────────────────────────────────────────────
  const renderScopeSection = () => (
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
                onChange={(opt) => { setField("department", opt?.value ?? null); setField("group", null); setField("platform", null); }}
                isClearable={false}
                isSearchable
              />
            </Col>
            <Col md={6}>
              <Form.Label className="small text-muted">
                Group {!form.department && <span className="text-muted">(chọn dept trước)</span>}
              </Form.Label>
              <Select
                options={[{ value: null, label: "— Tất cả group —" }, ...filteredGroupOptions]}
                value={groupSelected || { value: null, label: "— Tất cả group —" }}
                onChange={(opt) => { setField("group", opt?.value ?? null); setField("platform", null); }}
                isDisabled={!form.department}
                isClearable={false}
                isSearchable
              />
            </Col>
          </Row>
        ) : (
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="small text-muted">Department</Form.Label>
              <Form.Control value={adminDeptName || "—"} disabled className="bg-light" />
            </Col>
            <Col md={6}>
              <Form.Label className="small text-muted">Group (để trống = toàn bộ dept)</Form.Label>
              <Select
                options={[{ value: null, label: "— Toàn bộ dept —" }, ...filteredGroupOptions]}
                value={groupSelected || { value: null, label: "— Toàn bộ dept —" }}
                onChange={(opt) => { setField("group", opt?.value ?? null); setField("platform", null); }}
                isClearable={false}
                isSearchable
              />
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );

  // ── main render ───────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                🗂️ Cấu Hình Lưu Giữ Healthcheck
                <Badge bg="secondary" className="ms-2">{items.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => dispatch(fetchRetentionConfigs())}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Reload"}
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="primary" onClick={openCreate}>
                    + Thêm mới
                  </Button>
                )}
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              {loading && items.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: "2rem" }}>🗂️</div>
                  <div>Chưa có cấu hình lưu giữ nào</div>
                  {isAdmin && (
                    <Button className="mt-2" variant="primary" onClick={openCreate}>
                      + Thêm mới
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0 small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Phạm vi (Dept / Group)</th>
                        <th>Platform</th>
                        <th>Chu Kỳ Lưu Giữ</th>
                        <th>Loại Dữ Liệu</th>
                        <th style={{ width: 70 }}>Trạng Thái</th>
                        <th>Cập nhật bởi</th>
                        {isAdmin && <th style={{ width: 190 }}>Hành động</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((cfg, idx) => (
                        <tr key={cfg.id} className={!cfg.enabled ? "opacity-50" : ""}>
                          <td className="text-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                          <td><ScopeBadge cfg={cfg} /></td>
                          <td>
                            {cfg.platform_name
                              ? <Badge bg="info" text="dark">{cfg.platform_name}</Badge>
                              : <span className="text-muted small">Tất cả</span>}
                          </td>
                          <td>
                            <Badge bg="dark">{cfg.retention_period_label || cfg.retention_period}</Badge>
                          </td>
                          <td>
                            <Badge bg={scopeBadgeVariant(cfg.scope)}>
                              {cfg.scope_label || cfg.scope}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={cfg.enabled ? "success" : "secondary"}>
                              {cfg.enabled ? "ON" : "OFF"}
                            </Badge>
                          </td>
                          <td className="text-muted small">{cfg.updater_username || "—"}</td>
                          {isAdmin && (
                            <td>
                              <div className="d-flex gap-1 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => openEdit(cfg)}>
                                  Sửa
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  disabled={triggeringId === cfg.id || !cfg.enabled}
                                  title={!cfg.enabled ? "Config đang tắt" : "Chạy cleanup ngay"}
                                  onClick={() => handleTriggerCleanup(cfg)}
                                >
                                  {triggeringId === cfg.id
                                    ? <Spinner size="sm" animation="border" />
                                    : "Chạy ngay"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => setConfirmDelete(cfg)}
                                >
                                  Xóa
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center py-2">
                      <Pagination size="sm" className="mb-0">
                        <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={page === i + 1}
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editTarget ? "Sửa Cấu Hình Lưu Giữ" : "Thêm Cấu Hình Lưu Giữ"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Scope */}
            {renderScopeSection()}

            {/* Platform */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Platform
                {platformsLoading && <Spinner size="sm" animation="border" className="ms-1" />}
              </Form.Label>
              <Select
                options={[{ value: null, label: "— Tất cả platforms —" }, ...availablePlatforms]}
                value={platformSelected || { value: null, label: "— Tất cả platforms —" }}
                onChange={(opt) => setField("platform", opt?.value ?? null)}
                isLoading={platformsLoading}
                isClearable={false}
                isSearchable
                placeholder="Tất cả platforms"
              />
            </Form.Group>

            {/* Chu kỳ + Scope trên cùng 1 row */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Chu Kỳ Lưu Giữ <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    options={PERIOD_OPTIONS}
                    value={periodSelected}
                    onChange={(opt) => setField("retention_period", opt?.value || "3m")}
                    isClearable={false}
                    isSearchable
                    placeholder="Chọn chu kỳ..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Loại Dữ Liệu <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    options={SCOPE_OPTIONS}
                    value={scopeSelected}
                    onChange={(opt) => setField("scope", opt?.value || "both")}
                    isClearable={false}
                    isSearchable
                    placeholder="Chọn loại..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="switch"
              id="retention-enabled"
              label="Enabled (tự động dọn dẹp)"
              checked={form.enabled}
              onChange={(e) => setField("enabled", e.target.checked)}
            />
          </Form>

          {/* Info hint */}
          <div className="mt-3 p-2 bg-light rounded small text-muted">
            <strong>Lưu ý:</strong> Celery task <code>cleanup_healthcheck_data</code> chạy hàng
            ngày và xóa dữ liệu cũ hơn chu kỳ đã chọn.
            Với <em>File Kết Quả</em>: file trên disk bị xóa, trường{" "}
            <code>result_file</code> được xóa trống.
            Với <em>Lịch Sử</em>: xóa bản ghi <code>HealthcheckSummary</code>,{" "}
            <code>Snapshot</code>, <code>SnapshotEvent</code>.
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !form.retention_period || !form.scope}
            >
              {saving ? <Spinner size="sm" animation="border" className="me-1" /> : null}
              {editTarget ? "Cập nhật" : "Tạo"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ── Confirm Delete ────────────────────────────────────────────────────── */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa cấu hình lưu giữ{" "}
          <strong>
            {confirmDelete?.retention_period_label} — {confirmDelete?.scope_label}
          </strong>
          ? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Hủy</Button>
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

export default RetentionConfig;
