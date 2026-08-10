import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal,
  Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  createGroupSchemaPermission, deleteGroupSchemaPermission,
  fetchGroupSchemaPermissions, updateGroupSchemaPermission,
} from "../../../redux/Healthcheck/groupSchemaPermissionSlice";
import { fetchPlatformGroupKeys } from "../../../redux/Healthcheck/platformMappingSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
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
  group: null,               // Django Group id
  allowed_platform_groups: [], // list of platform-group keys
};

const PAGE_SIZE = 20;

const GroupSchemaPermissions = () => {
  const dispatch = useDispatch();

  const { permissions, loading, saving } = useSelector((s) => s.groupSchemaPermission);
  const { groupKeys } = useSelector((s) => s.platformMapping);
  const djangoGroups = useSelector((s) => s.group.groups);

  const isSuperUser = useMemo(() => {
    const claims = getJwtClaims();
    return Boolean(claims?.is_superuser || claims?.role === "super");
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const requestSort = createRequestSortFunction(setSortConfig, sortConfig);

  useEffect(() => {
    dispatch(fetchGroupSchemaPermissions());
    dispatch(fetchPlatformGroupKeys());
    dispatch(fetchGroups());
  }, [dispatch]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ── options ─────────────────────────────────────────────────────────────
  const djangoGroupOptions = useMemo(
    () => djangoGroups.map((g) => ({ value: g.id, label: g.name })),
    [djangoGroups]
  );

  const platformGroupOptions = useMemo(
    () => groupKeys.map((g) => ({ value: g, label: g })),
    [groupKeys]
  );

  const groupSelected = useMemo(
    () => djangoGroupOptions.find((o) => o.value === form.group) || null,
    [djangoGroupOptions, form.group]
  );

  const allowedSelected = useMemo(
    () => (form.allowed_platform_groups || []).map((v) => ({ value: v, label: v })),
    [form.allowed_platform_groups]
  );

  // ── form open/close ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      group: p.group,
      allowed_platform_groups: p.allowed_platform_groups || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.group) return;
    const payload = {
      group: form.group,
      allowed_platform_groups: form.allowed_platform_groups,
    };
    if (editTarget) {
      const res = await dispatch(updateGroupSchemaPermission({ id: editTarget.id, data: payload }));
      if (!res.error) setShowModal(false);
    } else {
      const res = await dispatch(createGroupSchemaPermission(payload));
      if (!res.error) setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteGroupSchemaPermission(id));
    setConfirmDelete(null);
  };

  // ── search + sort + pagination ─────────────────────────────────────────
  const filteredPermissions = useMemo(
    () => filterData(permissions, searchTerm, ["id", "group"]),
    [permissions, searchTerm]
  );
  const sortedPermissions = useMemo(
    () => (sortConfig.key ? sortData(filteredPermissions, sortConfig.key, sortConfig.direction) : filteredPermissions),
    [filteredPermissions, sortConfig]
  );
  const totalPages = Math.max(1, Math.ceil(sortedPermissions.length / PAGE_SIZE));
  const pagedPermissions = sortedPermissions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortConfig]);

  // ── main render ─────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Phân quyền theo Group
                <Badge bg="secondary" className="ms-2">{permissions.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => dispatch(fetchGroupSchemaPermissions())}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Reload"}
                </Button>
                {isSuperUser && (
                  <Button size="sm" variant="primary" onClick={openCreate}>
                    + Gán phân quyền mới
                  </Button>
                )}
              </div>
            </Card.Header>

            {!isSuperUser && (
              <div className="alert alert-warning m-3 mb-0">
                Chỉ Super Admin mới có thể tạo/sửa/xóa phân quyền.
              </div>
            )}

            {permissions.length > 0 && (
              <div className="px-3 pt-3">
                <Form.Control
                  size="sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm group, platform-group..."
                  style={{ maxWidth: 360 }}
                />
              </div>
            )}

            <Card.Body className="p-0">
              {loading && permissions.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : permissions.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: "2rem" }}>🛡️</div>
                  <div>Chưa có phân quyền nào — các group đang dùng theo config tĩnh (GROUP_SCHEMA_PERMISSIONS)</div>
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0 small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th role="button" onClick={() => requestSort("group_name")} className={getClassNamesFor(sortConfig, "group_name")}>Django Group</th>
                        <th>Platform-group được thấy</th>
                        <th style={{ width: 160 }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPermissions.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-3">Không tìm thấy phân quyền nào khớp tìm kiếm</td>
                        </tr>
                      )}
                      {pagedPermissions.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.group_name}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {(p.allowed_platform_groups || []).length > 0 ? (
                                p.allowed_platform_groups.map((g) => (
                                  <Badge key={g} bg="info" text="dark">{g}</Badge>
                                ))
                              ) : (
                                <span className="text-muted">— (không thấy gì)</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {isSuperUser && (
                              <div className="d-flex gap-1 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => openEdit(p)}>
                                  Sửa
                                </Button>
                                <Button size="sm" variant="outline-danger" onClick={() => setConfirmDelete(p)}>
                                  Xóa
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
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
          <Modal.Title>{editTarget ? "Sửa phân quyền" : "Gán phân quyền mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Django Group <span className="text-danger">*</span></Form.Label>
              <Select
                styles={SELECT_STYLES}
                options={djangoGroupOptions}
                value={groupSelected}
                onChange={(opt) => setField("group", opt?.value ?? null)}
                placeholder="Chọn group, vd NOC1, SNOC2..."
                isClearable
                isDisabled={Boolean(editTarget)}
              />
              {editTarget && (
                <small className="text-muted">Không đổi được group sau khi tạo — xóa và tạo phân quyền mới nếu cần.</small>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Platform-group được phép thấy</Form.Label>
              <Select
                styles={SELECT_STYLES}
                options={platformGroupOptions}
                value={allowedSelected}
                onChange={(opts) => setField("allowed_platform_groups", (opts || []).map((o) => o.value))}
                placeholder="Để trống = group này không thấy gì..."
                isMulti
                closeMenuOnSelect={false}
              />
              <small className="text-muted">
                Để trống danh sách này nghĩa là group không thấy bất kỳ platform-group nào (khác với việc
                không tạo phân quyền — không có row ở đây thì mặc định thấy tất cả).
              </small>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !form.group}>
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
          Xóa phân quyền của <strong>{confirmDelete?.group_name}</strong>? Group sẽ quay về dùng
          config tĩnh (GROUP_SCHEMA_PERMISSIONS) nếu có, hoặc thấy tất cả nếu không.
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

export default GroupSchemaPermissions;
