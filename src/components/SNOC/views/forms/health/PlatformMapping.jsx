import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Form, Modal,
  Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import {
  createPlatformMapping, deletePlatformMapping,
  fetchPlatformMappings, fetchProfileRegistry,
  updatePlatformMapping,
} from "../../../redux/Healthcheck/platformMappingSlice";
import { fetchGroupEntities, fetchSubsystemEntities } from "../../../redux/Healthcheck/platformTaxonomySlice";
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { runImportSync } from "../../../redux/Healthcheck/configSyncSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import {
  createRequestSortFunction, filterData, getClassNamesFor, sortData,
} from "../../../utils/tableUtils";

// ── helpers ───────────────────────────────────────────────────────────────────

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const EMPTY_FORM = {
  platform: null,     // platform id
  profile_key: "",
  group: "",
  subsystem: "",
  is_active: true,
};

const PAGE_SIZE = 20;

const PlatformMapping = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mappings, profiles, loading, saving } = useSelector((s) => s.platformMapping);
  const { platforms } = useSelector((s) => s.platformDevice);
  const { groups: groupEntities, subsystems: subsystemEntities } = useSelector((s) => s.platformTaxonomy);

  const isSuperUser = useMemo(() => {
    const claims = getJwtClaims();
    return Boolean(claims?.is_superuser || claims?.role === "super");
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [useNewGroup, setUseNewGroup] = useState(false);
  const [useNewSubsystem, setUseNewSubsystem] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const requestSort = createRequestSortFunction(setSortConfig, sortConfig);
  const [deviceGapReport, setDeviceGapReport] = useState(null);
  const [checkingGap, setCheckingGap] = useState(false);

  useEffect(() => {
    dispatch(fetchPlatformMappings());
    dispatch(fetchProfileRegistry());
    dispatch(fetchGroupEntities());
    dispatch(fetchSubsystemEntities());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ── options ─────────────────────────────────────────────────────────────
  const platformOptions = useMemo(
    () => platforms.map((p) => ({ value: p.id, label: `${p.name} (${p.device_count} device)` })),
    [platforms]
  );

  const profileOptions = useMemo(
    () => profiles.map((p) => ({
      value: p.key,
      label: `${p.key} (${p.task_func || "?"} → ${p.command_file || "?"})`,
    })),
    [profiles]
  );

  // Value vẫn là chuỗi tên (name) — payload PlatformTaskMapping.group/subsystem không đổi,
  // chỉ nguồn options đổi từ "suy ra từ mapping hiện có" sang catalog Group/Subsystem riêng
  // (cho phép chọn Group/Subsystem đã tạo trước, chưa có mapping nào dùng).
  const groupOptions = useMemo(
    () => groupEntities.map((g) => ({ value: g.name, label: g.name })),
    [groupEntities]
  );

  const subsystemOptions = useMemo(
    () => subsystemEntities
      .filter((s) => s.group_name === form.group)
      .map((s) => ({ value: s.name, label: s.name })),
    [subsystemEntities, form.group]
  );

  const platformSelected = useMemo(
    () => platformOptions.find((o) => o.value === form.platform) || null,
    [platformOptions, form.platform]
  );
  const profileSelected = useMemo(
    () => profileOptions.find((o) => o.value === form.profile_key) || null,
    [profileOptions, form.profile_key]
  );
  const groupSelected = useMemo(
    () => groupOptions.find((o) => o.value === form.group) || null,
    [groupOptions, form.group]
  );
  const subsystemSelected = useMemo(
    () => subsystemOptions.find((o) => o.value === form.subsystem) || null,
    [subsystemOptions, form.subsystem]
  );

  // ── form open/close ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setUseNewGroup(false);
    setUseNewSubsystem(false);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      platform: m.platform,
      profile_key: m.profile_key || "",
      group: m.group || "",
      subsystem: m.subsystem || "",
      is_active: m.is_active !== false,
    });
    setUseNewGroup(Boolean(m.group) && !groupEntities.some((g) => g.name === m.group));
    setUseNewSubsystem(
      Boolean(m.subsystem) &&
      !subsystemEntities.some((s) => s.group_name === m.group && s.name === m.subsystem)
    );
    setShowModal(true);
  };

  // Đổi Group (không phải "nhóm mới") → subsystem cũ có thể không còn thuộc group này, reset lại.
  const handleGroupChange = (value) => {
    setField("group", value);
    setField("subsystem", "");
    setUseNewSubsystem(false);
  };

  const handleUseNewGroupToggle = (checked) => {
    setUseNewGroup(checked);
    setField("group", "");
    setField("subsystem", "");
    // Group hoàn toàn mới thì chắc chắn chưa có subsystem nào để chọn.
    setUseNewSubsystem(checked);
  };

  const handleSave = async () => {
    if (!form.platform || !form.profile_key) return;
    const payload = {
      platform: form.platform,
      profile_key: form.profile_key,
      group: form.group || null,
      subsystem: form.subsystem || null,
      is_active: form.is_active,
    };
    if (editTarget) {
      const res = await dispatch(updatePlatformMapping({ id: editTarget.id, data: payload }));
      if (!res.error) setShowModal(false);
    } else {
      const res = await dispatch(createPlatformMapping(payload));
      if (!res.error) setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deletePlatformMapping(id));
    setConfirmDelete(null);
  };

  // Kiểm tra platform đã có automation (PLATFORM_CONFIG) nhưng chưa có Device/Platform trong DB
  // — dùng local state (không đọc s.configSync.importReport) để không "rò" report cũ từ trang ConfigSync.
  const handleCheckDeviceGap = async () => {
    setCheckingGap(true);
    const res = await dispatch(runImportSync({ apply: false }));
    setCheckingGap(false);
    if (!res.error) setDeviceGapReport(res.payload.report);
  };

  // ── search + sort + pagination ─────────────────────────────────────────
  const filteredMappings = useMemo(
    () => filterData(mappings, searchTerm, ["id", "platform"]),
    [mappings, searchTerm]
  );
  const sortedMappings = useMemo(
    () => (sortConfig.key ? sortData(filteredMappings, sortConfig.key, sortConfig.direction) : filteredMappings),
    [filteredMappings, sortConfig]
  );
  const totalPages = Math.max(1, Math.ceil(sortedMappings.length / PAGE_SIZE));
  const pagedMappings = sortedMappings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortConfig]);

  // ── main render ─────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      {isSuperUser && (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex align-items-center justify-content-between">
                <Card.Title as="h6" className="mb-0">Platform còn thiếu Device</Card.Title>
                <Button size="sm" variant="outline-primary" onClick={handleCheckDeviceGap} disabled={checkingGap}>
                  {checkingGap ? <Spinner size="sm" animation="border" /> : "Kiểm tra platform còn thiếu Device"}
                </Button>
              </Card.Header>
              {deviceGapReport && (
                <Card.Body>
                  {deviceGapReport.skipped_no_platform?.length > 0 ? (
                    <Alert variant="warning" className="small mb-0">
                      <div className="mb-2">
                        <strong>{deviceGapReport.skipped_no_platform.length} platform</strong> đã có automation SSH
                        sẵn (PLATFORM_CONFIG) nhưng chưa có Device nào được thêm vào hệ thống, nên chưa thể tạo
                        Platform Mapping. Vào trang Devices, thêm 1 Device với trường Platform đúng tên bên dưới,
                        sau đó quay lại đây bấm "Kiểm tra" lại rồi chạy Import ở trang Đồng bộ File ⇄ DB.
                      </div>
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {deviceGapReport.skipped_no_platform.map((slug) => (
                          <Badge key={slug} bg="warning" text="dark">{slug}</Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="primary" onClick={() => navigate("/healthcheck/devices")}>
                        Đi tới trang Devices
                      </Button>
                    </Alert>
                  ) : (
                    <Alert variant="success" className="small mb-0">
                      Tất cả platform có automation sẵn đều đã có Device.
                    </Alert>
                  )}
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mt-3">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Platform Mapping
                <Badge bg="secondary" className="ms-2">{mappings.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => dispatch(fetchPlatformMappings())}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Reload"}
                </Button>
                {isSuperUser && (
                  <Button size="sm" variant="primary" onClick={openCreate}>
                    + Gán mapping mới
                  </Button>
                )}
              </div>
            </Card.Header>

            {!isSuperUser && (
              <div className="alert alert-warning m-3 mb-0">
                Chỉ Super Admin mới có thể tạo/sửa/xóa platform mapping.
              </div>
            )}

            {mappings.length > 0 && (
              <div className="px-3 pt-3">
                <Form.Control
                  size="sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm platform, group, subsystem, profile..."
                  style={{ maxWidth: 360 }}
                />
              </div>
            )}

            <Card.Body className="p-0">
              {loading && mappings.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : mappings.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: "2rem" }}>🔌</div>
                  <div>Chưa có platform mapping nào — các platform đang chạy theo config tĩnh (PLATFORM_CONFIG)</div>
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0 small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th role="button" onClick={() => requestSort("platform_name")} className={getClassNamesFor(sortConfig, "platform_name")}>Platform</th>
                        <th role="button" onClick={() => requestSort("group")} className={getClassNamesFor(sortConfig, "group")}>Group</th>
                        <th role="button" onClick={() => requestSort("subsystem")} className={getClassNamesFor(sortConfig, "subsystem")}>Subsystem</th>
                        <th role="button" onClick={() => requestSort("profile_key")} className={getClassNamesFor(sortConfig, "profile_key")}>Profile</th>
                        <th role="button" onClick={() => requestSort("is_active")} className={getClassNamesFor(sortConfig, "is_active")}>Trạng thái</th>
                        <th style={{ width: 160 }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedMappings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-3">Không tìm thấy mapping nào khớp tìm kiếm</td>
                        </tr>
                      )}
                      {pagedMappings.map((m) => {
                        const profile = profiles.find((p) => p.key === m.profile_key);
                        return (
                          <tr key={m.id} className={!m.is_active ? "opacity-50" : ""}>
                            <td className="fw-semibold">{m.platform_name}</td>
                            <td>{m.group ? <Badge bg="info" text="dark">{m.group}</Badge> : <span className="text-muted">—</span>}</td>
                            <td>{m.subsystem || <span className="text-muted">—</span>}</td>
                            <td>
                              <code className="small">{m.profile_key}</code>
                              {profile && (
                                <div className="text-muted small">
                                  {profile.task_func} → {profile.command_file}
                                </div>
                              )}
                            </td>
                            <td>
                              <Badge bg={m.is_active ? "success" : "secondary"}>
                                {m.is_active ? "Active" : "Disabled"}
                              </Badge>
                            </td>
                            <td>
                              {isSuperUser && (
                                <div className="d-flex gap-1 flex-wrap">
                                  <Button size="sm" variant="outline-primary" onClick={() => openEdit(m)}>
                                    Sửa
                                  </Button>
                                  <Button size="sm" variant="outline-danger" onClick={() => setConfirmDelete(m)}>
                                    Xóa
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>

                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      <Pagination.Prev
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editTarget ? "Sửa Platform Mapping" : "Gán Platform Mapping"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Platform <span className="text-danger">*</span></Form.Label>
              <Select
                styles={SELECT_STYLES}
                options={platformOptions}
                value={platformSelected}
                onChange={(opt) => setField("platform", opt?.value ?? null)}
                placeholder="Chọn platform..."
                isClearable
                isDisabled={Boolean(editTarget)}
              />
              {editTarget && (
                <small className="text-muted">Không đổi được platform sau khi tạo — xóa và tạo mapping mới nếu cần.</small>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Profile (task_func + command_file có sẵn) <span className="text-danger">*</span>
              </Form.Label>
              <Select
                styles={SELECT_STYLES}
                options={profileOptions}
                value={profileSelected}
                onChange={(opt) => setField("profile_key", opt?.value ?? "")}
                placeholder="Chọn profile..."
                isClearable
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Group</Form.Label>
                {useNewGroup ? (
                  <Form.Control
                    value={form.group}
                    onChange={(e) => setField("group", e.target.value)}
                    placeholder="Nhập tên group mới, vd 'UDC Core'"
                  />
                ) : (
                  <Select
                    styles={SELECT_STYLES}
                    options={groupOptions}
                    value={groupSelected}
                    onChange={(opt) => handleGroupChange(opt?.value ?? "")}
                    placeholder="Chọn group..."
                    isClearable
                  />
                )}
                <Form.Check
                  type="checkbox"
                  className="mt-1"
                  id="use-new-group"
                  label="Nhóm mới (chưa có trong danh sách)"
                  checked={useNewGroup}
                  onChange={(e) => handleUseNewGroupToggle(e.target.checked)}
                />
                {useNewGroup && (
                  <small className="text-warning d-block mt-1">
                    Nhóm mới sẽ vô hình với NOC1/NOC2/NOC3 cho tới khi được thêm vào trang "Phân quyền theo Group".
                  </small>
                )}
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Subsystem</Form.Label>
                {useNewSubsystem ? (
                  <Form.Control
                    value={form.subsystem}
                    onChange={(e) => setField("subsystem", e.target.value)}
                    placeholder="Nhập tên subsystem mới, vd 'HLR'"
                  />
                ) : (
                  <Select
                    styles={SELECT_STYLES}
                    options={subsystemOptions}
                    value={subsystemSelected}
                    onChange={(opt) => setField("subsystem", opt?.value ?? "")}
                    placeholder={form.group ? "Chọn subsystem..." : "Chọn Group trước"}
                    isClearable
                    isDisabled={!form.group}
                    noOptionsMessage={() =>
                      form.group ? "Group này chưa có subsystem nào" : "Chọn Group trước"
                    }
                  />
                )}
                <Form.Check
                  type="checkbox"
                  className="mt-1"
                  id="use-new-subsystem"
                  label="Subsystem mới (chưa có trong group này)"
                  checked={useNewSubsystem}
                  onChange={(e) => { setUseNewSubsystem(e.target.checked); setField("subsystem", ""); }}
                  disabled={useNewGroup}
                />
              </Col>
            </Row>

            <Form.Check
              type="switch"
              id="mapping-active"
              label="Active"
              checked={form.is_active}
              onChange={(e) => setField("is_active", e.target.checked)}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !form.platform || !form.profile_key}
          >
            {saving ? <Spinner size="sm" animation="border" className="me-1" /> : null}
            {editTarget ? "Cập nhật" : "Tạo"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Confirm Delete ────────────────────────────────────────────────── */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa mapping của <strong>{confirmDelete?.platform_name}</strong>? Platform sẽ quay về dùng
          config tĩnh (PLATFORM_CONFIG) nếu có, hoặc ping-only nếu không.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => handleDelete(confirmDelete.id)} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PlatformMapping;
