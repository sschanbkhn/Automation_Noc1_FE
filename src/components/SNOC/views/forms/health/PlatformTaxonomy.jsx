import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal,
  Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  createGroupEntity, createSubsystemEntity, deleteGroupEntity, deleteSubsystemEntity,
  fetchGroupEntities, fetchSubsystemEntities, updateGroupEntity, updateSubsystemEntity,
} from "../../../redux/Healthcheck/platformTaxonomySlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import {
  createRequestSortFunction, filterData, getClassNamesFor, sortData,
} from "../../../utils/tableUtils";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const PAGE_SIZE = 20;

const PlatformTaxonomy = () => {
  const dispatch = useDispatch();
  const { groups, subsystems, loading, saving } = useSelector((s) => s.platformTaxonomy);

  const isSuperUser = useMemo(() => {
    const claims = getJwtClaims();
    return Boolean(claims?.is_superuser || claims?.role === "super");
  }, []);

  // ── Group modal state ──────────────────────────────────────────────────
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null);
  const [groupPage, setGroupPage] = useState(1);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSortConfig, setGroupSortConfig] = useState({ key: null, direction: "asc" });
  const requestGroupSort = createRequestSortFunction(setGroupSortConfig, groupSortConfig);

  // ── Subsystem modal state ──────────────────────────────────────────────
  const [showSubsystemModal, setShowSubsystemModal] = useState(false);
  const [editSubsystem, setEditSubsystem] = useState(null);
  const [subsystemForm, setSubsystemForm] = useState({ group: null, name: "" });
  const [confirmDeleteSubsystem, setConfirmDeleteSubsystem] = useState(null);
  const [subsystemFilterGroup, setSubsystemFilterGroup] = useState(null);
  const [subsystemPage, setSubsystemPage] = useState(1);
  const [subsystemSearch, setSubsystemSearch] = useState("");
  const [subsystemSortConfig, setSubsystemSortConfig] = useState({ key: null, direction: "asc" });
  const requestSubsystemSort = createRequestSortFunction(setSubsystemSortConfig, subsystemSortConfig);

  useEffect(() => {
    dispatch(fetchGroupEntities());
    dispatch(fetchSubsystemEntities());
  }, [dispatch]);

  const groupOptions = useMemo(
    () => groups.map((g) => ({ value: g.id, label: g.name })),
    [groups]
  );

  const subsystemCountByGroup = useMemo(() => {
    const m = {};
    subsystems.forEach((s) => { m[s.group] = (m[s.group] || 0) + 1; });
    return m;
  }, [subsystems]);

  const filteredSubsystems = useMemo(
    () => subsystemFilterGroup ? subsystems.filter((s) => s.group === subsystemFilterGroup) : subsystems,
    [subsystems, subsystemFilterGroup]
  );

  // ── Group CRUD ──────────────────────────────────────────────────────────
  const openCreateGroup = () => { setEditGroup(null); setGroupName(""); setShowGroupModal(true); };
  const openEditGroup = (g) => { setEditGroup(g); setGroupName(g.name); setShowGroupModal(true); };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;
    const res = editGroup
      ? await dispatch(updateGroupEntity({ id: editGroup.id, data: { name: groupName.trim() } }))
      : await dispatch(createGroupEntity({ name: groupName.trim() }));
    if (!res.error) setShowGroupModal(false);
  };

  const handleDeleteGroup = async (id) => {
    await dispatch(deleteGroupEntity(id));
    setConfirmDeleteGroup(null);
  };

  // ── Subsystem CRUD ──────────────────────────────────────────────────────
  const openCreateSubsystem = () => {
    setEditSubsystem(null);
    setSubsystemForm({ group: subsystemFilterGroup, name: "" });
    setShowSubsystemModal(true);
  };
  const openEditSubsystem = (s) => {
    setEditSubsystem(s);
    setSubsystemForm({ group: s.group, name: s.name });
    setShowSubsystemModal(true);
  };

  const handleSaveSubsystem = async () => {
    if (!subsystemForm.group || !subsystemForm.name.trim()) return;
    const payload = { group: subsystemForm.group, name: subsystemForm.name.trim() };
    const res = editSubsystem
      ? await dispatch(updateSubsystemEntity({ id: editSubsystem.id, data: payload }))
      : await dispatch(createSubsystemEntity(payload));
    if (!res.error) setShowSubsystemModal(false);
  };

  const handleDeleteSubsystem = async (id) => {
    await dispatch(deleteSubsystemEntity(id));
    setConfirmDeleteSubsystem(null);
  };

  // ── search + sort + pagination ─────────────────────────────────────────
  const searchedGroups = useMemo(
    () => filterData(groups, groupSearch, ["id"]),
    [groups, groupSearch]
  );
  const sortedGroups = useMemo(
    () => (groupSortConfig.key ? sortData(searchedGroups, groupSortConfig.key, groupSortConfig.direction) : searchedGroups),
    [searchedGroups, groupSortConfig]
  );
  const groupTotalPages = Math.max(1, Math.ceil(sortedGroups.length / PAGE_SIZE));
  const pagedGroups = sortedGroups.slice((groupPage - 1) * PAGE_SIZE, groupPage * PAGE_SIZE);

  const searchedSubsystems = useMemo(
    () => filterData(filteredSubsystems, subsystemSearch, ["id", "group"]),
    [filteredSubsystems, subsystemSearch]
  );
  const sortedSubsystems = useMemo(
    () => (subsystemSortConfig.key ? sortData(searchedSubsystems, subsystemSortConfig.key, subsystemSortConfig.direction) : searchedSubsystems),
    [searchedSubsystems, subsystemSortConfig]
  );
  const subsystemTotalPages = Math.max(1, Math.ceil(sortedSubsystems.length / PAGE_SIZE));
  const pagedSubsystems = sortedSubsystems.slice((subsystemPage - 1) * PAGE_SIZE, subsystemPage * PAGE_SIZE);

  useEffect(() => { setGroupPage(1); }, [groupSearch, groupSortConfig]);
  useEffect(() => { setSubsystemPage(1); }, [subsystemSearch, subsystemSortConfig]);

  const renderPagination = (page, totalPages, setPage) => totalPages > 1 && (
    <Pagination className="justify-content-center mt-3">
      <Pagination.Prev onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} />
      {Array.from({ length: totalPages }, (_, i) => (
        <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
    </Pagination>
  );

  return (
    <>
      <TopNavbarHealth />

      {!isSuperUser && (
        <div className="alert alert-warning mb-3">
          Chỉ Super Admin mới có thể tạo/sửa/xóa Group/Subsystem.
        </div>
      )}

      {/* ── Groups ─────────────────────────────────────────────────────── */}
      <Row className="mb-3">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Platform Group
                <Badge bg="secondary" className="ms-2">{groups.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => dispatch(fetchGroupEntities())} disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : "Reload"}
                </Button>
                {isSuperUser && (
                  <Button size="sm" variant="primary" onClick={openCreateGroup}>+ Group mới</Button>
                )}
              </div>
            </Card.Header>
            {groups.length > 0 && (
              <div className="px-3 pt-3">
                <Form.Control
                  size="sm"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Tìm kiếm tên group..."
                  style={{ maxWidth: 320 }}
                />
              </div>
            )}
            <Card.Body className="p-0">
              {groups.length === 0 ? (
                <div className="text-center text-muted py-4">Chưa có Group nào trong catalog.</div>
              ) : (
                <>
                  <Table responsive hover className="mb-0 small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th role="button" onClick={() => requestGroupSort("name")} className={getClassNamesFor(groupSortConfig, "name")}>Tên</th>
                        <th>Số Subsystem</th>
                        <th style={{ width: 160 }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedGroups.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-3">Không tìm thấy group nào khớp tìm kiếm</td>
                        </tr>
                      )}
                      {pagedGroups.map((g) => (
                        <tr key={g.id}>
                          <td className="fw-semibold">{g.name}</td>
                          <td>{subsystemCountByGroup[g.id] || 0}</td>
                          <td>
                            {isSuperUser && (
                              <div className="d-flex gap-1 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => openEditGroup(g)}>Sửa</Button>
                                <Button size="sm" variant="outline-danger" onClick={() => setConfirmDeleteGroup(g)}>Xóa</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {renderPagination(groupPage, groupTotalPages, setGroupPage)}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Subsystems ─────────────────────────────────────────────────── */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Subsystem
                <Badge bg="secondary" className="ms-2">{filteredSubsystems.length}</Badge>
              </Card.Title>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => dispatch(fetchSubsystemEntities())} disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : "Reload"}
                </Button>
                {isSuperUser && (
                  <Button size="sm" variant="primary" onClick={openCreateSubsystem}>+ Subsystem mới</Button>
                )}
              </div>
            </Card.Header>
            <div className="d-flex gap-2 align-items-center px-3 py-2 border-bottom bg-light flex-wrap">
              <span className="text-muted small fw-semibold text-nowrap">Lọc theo Group:</span>
              <div style={{ minWidth: 220 }}>
                <Select
                  styles={SELECT_STYLES}
                  options={groupOptions}
                  value={groupOptions.find((o) => o.value === subsystemFilterGroup) || null}
                  onChange={(opt) => { setSubsystemFilterGroup(opt?.value ?? null); setSubsystemPage(1); }}
                  placeholder="Tất cả group..."
                  isClearable
                />
              </div>
              <Form.Control
                size="sm"
                value={subsystemSearch}
                onChange={(e) => setSubsystemSearch(e.target.value)}
                placeholder="Tìm kiếm tên subsystem..."
                style={{ maxWidth: 260 }}
              />
            </div>
            <Card.Body className="p-0">
              {filteredSubsystems.length === 0 ? (
                <div className="text-center text-muted py-4">Chưa có Subsystem nào khớp bộ lọc.</div>
              ) : (
                <>
                  <Table responsive hover className="mb-0 small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th role="button" onClick={() => requestSubsystemSort("group_name")} className={getClassNamesFor(subsystemSortConfig, "group_name")}>Group</th>
                        <th role="button" onClick={() => requestSubsystemSort("name")} className={getClassNamesFor(subsystemSortConfig, "name")}>Tên Subsystem</th>
                        <th style={{ width: 160 }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedSubsystems.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-3">Không tìm thấy subsystem nào khớp tìm kiếm</td>
                        </tr>
                      )}
                      {pagedSubsystems.map((s) => (
                        <tr key={s.id}>
                          <td><Badge bg="info" text="dark">{s.group_name}</Badge></td>
                          <td className="fw-semibold">{s.name}</td>
                          <td>
                            {isSuperUser && (
                              <div className="d-flex gap-1 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => openEditSubsystem(s)}>Sửa</Button>
                                <Button size="sm" variant="outline-danger" onClick={() => setConfirmDeleteSubsystem(s)}>Xóa</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {renderPagination(subsystemPage, subsystemTotalPages, setSubsystemPage)}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Group modal ────────────────────────────────────────────────── */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} size="sm" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editGroup ? "Sửa Group" : "Tạo Group mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-bold">Tên Group <span className="text-danger">*</span></Form.Label>
            <Form.Control value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Vd 'UDC Core'" />
          </Form.Group>
          {editGroup && (
            <small className="text-muted d-block mt-2">
              Đổi tên sẽ tự động cập nhật mọi Platform Mapping đang dùng group này.
            </small>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGroupModal(false)}>Đóng</Button>
          <Button variant="primary" onClick={handleSaveGroup} disabled={saving || !groupName.trim()}>
            {saving ? <Spinner size="sm" animation="border" className="me-1" /> : null}
            {editGroup ? "Cập nhật" : "Tạo"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Subsystem modal ────────────────────────────────────────────── */}
      <Modal show={showSubsystemModal} onHide={() => setShowSubsystemModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editSubsystem ? "Sửa Subsystem" : "Tạo Subsystem mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Group <span className="text-danger">*</span></Form.Label>
            <Select
              styles={SELECT_STYLES}
              options={groupOptions}
              value={groupOptions.find((o) => o.value === subsystemForm.group) || null}
              onChange={(opt) => setSubsystemForm((f) => ({ ...f, group: opt?.value ?? null }))}
              placeholder="Chọn group..."
              isClearable
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-bold">Tên Subsystem <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={subsystemForm.name}
              onChange={(e) => setSubsystemForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Vd 'HLR'"
            />
          </Form.Group>
          {editSubsystem && (
            <small className="text-muted d-block mt-2">
              Đổi tên/đổi group sẽ tự động cập nhật mọi Platform Mapping đang dùng subsystem này.
            </small>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubsystemModal(false)}>Đóng</Button>
          <Button
            variant="primary"
            onClick={handleSaveSubsystem}
            disabled={saving || !subsystemForm.group || !subsystemForm.name.trim()}
          >
            {saving ? <Spinner size="sm" animation="border" className="me-1" /> : null}
            {editSubsystem ? "Cập nhật" : "Tạo"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Confirm delete Group ───────────────────────────────────────── */}
      <Modal show={!!confirmDeleteGroup} onHide={() => setConfirmDeleteGroup(null)} size="sm">
        <Modal.Header closeButton><Modal.Title>Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>
          Xóa group <strong>{confirmDeleteGroup?.name}</strong>? Sẽ bị chặn nếu group còn subsystem con.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteGroup(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => handleDeleteGroup(confirmDeleteGroup.id)} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Confirm delete Subsystem ───────────────────────────────────── */}
      <Modal show={!!confirmDeleteSubsystem} onHide={() => setConfirmDeleteSubsystem(null)} size="sm">
        <Modal.Header closeButton><Modal.Title>Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>
          Xóa subsystem <strong>{confirmDeleteSubsystem?.name}</strong>? Sẽ bị chặn nếu còn Platform Mapping đang dùng.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteSubsystem(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => handleDeleteSubsystem(confirmDeleteSubsystem.id)} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PlatformTaxonomy;
