// AccessScopeTab.jsx — v2: thêm modules selection
import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, InputGroup,
  Modal, Row, Spinner, Table,
} from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

import {
  createAccessScope, deleteAccessScope, fetchAccessScopes,
  selectScope, toggleShowCreate, toggleShowDelete,
  toggleShowUpdate, updateAccessScope,
} from "../redux/User/accessScopeSlice";
import { fetchDepartments } from "../redux/User/departmentSlice";
import { fetchGroups }       from "../redux/User/groupSlice";

const MULTI_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: 72, overflowY: "auto" }),
};

const MODULE_OPTIONS = [
  { value: "precheck",    label: "🔍 Precheck" },
  { value: "healthcheck", label: "❤️ Healthcheck" },
  { value: "dhtt",        label: "🔧 Bảo dưỡng (DHTT)" },
];

const MODULE_BADGE_COLOR = {
  precheck:    "primary",
  healthcheck: "success",
  dhtt:        "warning",
};

const DEFAULT_FORM = {
  name: "", code: "", description: "",
  department_ids: [], group_ids: [],
  modules: [],   // [] = tất cả
};

const AccessScopeTab = () => {
  const dispatch = useDispatch();

  const {
    scopes = [], status = "idle", selected = null,
    showCreate = false, showUpdate = false, showDelete = false,
  } = useSelector((s) => s.accessScope ?? {});
  const { departments = [] } = useSelector((s) => s.department ?? {});
  const { groups = []      } = useSelector((s) => s.group      ?? {});

  const [search, setSearch] = useState("");
  const [form,   setForm]   = useState(DEFAULT_FORM);

  useEffect(() => {
    dispatch(fetchAccessScopes());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (showUpdate && selected) {
      setForm({
        name:           selected.name        ?? "",
        code:           selected.code        ?? "",
        description:    selected.description ?? "",
        department_ids: (selected.departments ?? []).map((d) => d.id),
        group_ids:      (selected.groups      ?? []).map((g) => g.id),
        modules:        selected.modules      ?? [],
      });
    }
  }, [showUpdate, selected]);

  const deptOptions  = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments]
  );
  const groupOptions = useMemo(
    () => groups.map((g) => ({
      value: g.id,
      label: `${g.name}${g.department_name ? ` (${g.department_name})` : ""}`,
    })),
    [groups]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? scopes.filter((s) =>
          s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)
        )
      : scopes;
  }, [scopes, search]);

  const openCreate = () => { setForm(DEFAULT_FORM); dispatch(toggleShowCreate()); };
  const openUpdate = (sc) => { dispatch(selectScope(sc)); dispatch(toggleShowUpdate()); };
  const openDelete = (sc) => { dispatch(selectScope(sc)); dispatch(toggleShowDelete()); };

  const buildPayload = () => ({
    name:           form.name,
    code:           form.code.toUpperCase(),
    description:    form.description,
    department_ids: form.department_ids,
    group_ids:      form.group_ids,
    modules:        form.modules,   // [] = all modules
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createAccessScope(buildPayload()));
    dispatch(fetchAccessScopes());
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    await dispatch(updateAccessScope({ scopeId: selected.id, scopeData: buildPayload() }));
    dispatch(fetchAccessScopes());
  };
  const handleDelete = async () => {
    if (!selected) return;
    await dispatch(deleteAccessScope(selected.id));
  };

  const FormBody = () => (
    <Row className="g-3">
      <Col md={8}>
        <Form.Label>Tên phạm vi *</Form.Label>
        <Form.Control required value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="VD: Khu vực miền Bắc" />
      </Col>
      <Col md={4}>
        <Form.Label>Mã *</Form.Label>
        <Form.Control required value={form.code} maxLength={20}
          onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
          placeholder="VD: KV_MB" />
      </Col>
      <Col md={12}>
        <Form.Label>Mô tả</Form.Label>
        <Form.Control as="textarea" rows={2} value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
      </Col>

      {/* Module permission */}
      <Col md={12}>
        <Form.Label>
          ⚙️ Module được phép{" "}
          <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
            (không chọn = tất cả module)
          </span>
        </Form.Label>
        <Select
          isMulti isSearchable closeMenuOnSelect={false}
          options={MODULE_OPTIONS} styles={MULTI_STYLES}
          value={MODULE_OPTIONS.filter((o) => form.modules.includes(o.value))}
          onChange={(sel) => setForm((s) => ({ ...s, modules: sel.map((o) => o.value) }))}
          placeholder="Không giới hạn (cho phép tất cả module)..."
        />
        {form.modules.length > 0 && (
          <Form.Text className="text-warning">
            ⚠ User gán scope này chỉ được dùng module đã chọn
          </Form.Text>
        )}
      </Col>

      {/* Device access */}
      <Col md={12}>
        <Form.Label>
          🏢 Phòng ban bao gồm{" "}
          <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
            (tất cả nhóm trong phòng ban)
          </span>
        </Form.Label>
        <Select
          isMulti isSearchable closeMenuOnSelect={false}
          options={deptOptions} styles={MULTI_STYLES}
          value={deptOptions.filter((o) => form.department_ids.includes(o.value))}
          onChange={(sel) => setForm((s) => ({ ...s, department_ids: sel.map((o) => o.value) }))}
          placeholder="Chọn phòng ban..."
        />
      </Col>
      <Col md={12}>
        <Form.Label>
          👥 Nhóm cụ thể{" "}
          <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
            (bổ sung ngoài phòng ban)
          </span>
        </Form.Label>
        <Select
          isMulti isSearchable closeMenuOnSelect={false}
          options={groupOptions} styles={MULTI_STYLES}
          value={groupOptions.filter((o) => form.group_ids.includes(o.value))}
          onChange={(sel) => setForm((s) => ({ ...s, group_ids: sel.map((o) => o.value) }))}
          placeholder="Chọn nhóm cụ thể..."
        />
      </Col>
    </Row>
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold">🔐 Phạm vi truy cập</div>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <Form.Control placeholder="Tìm phạm vi..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Button size="sm" onClick={openCreate}>+ Tạo phạm vi</Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {status === "loading" ? (
          <div className="py-4 text-center"><Spinner animation="border" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-4 text-center text-muted">Chưa có phạm vi truy cập nào</div>
        ) : (
          <Table hover size="sm" className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Mã</th>
                <th>Tên phạm vi</th>
                <th>Module được phép</th>
                <th>Phòng ban</th>
                <th>Nhóm</th>
                <th style={{ textAlign: "center" }}>Thiết bị</th>
                <th style={{ textAlign: "center" }}>User</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sc, idx) => (
                <tr key={sc.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <Badge bg="success" pill style={{ fontFamily: "monospace" }}>
                      {sc.code}
                    </Badge>
                  </td>
                  <td className="fw-semibold">{sc.name}</td>
                  <td>
                    {/* modules: [] = all */}
                    {(sc.modules ?? []).length === 0 ? (
                      <Badge bg="secondary" style={{ fontSize: "0.7rem" }}>Tất cả</Badge>
                    ) : (
                      <div className="d-flex flex-wrap gap-1">
                        {(sc.modules ?? []).map((m) => (
                          <Badge key={m} bg={MODULE_BADGE_COLOR[m] || "secondary"}
                            style={{ fontSize: "0.7rem" }}>
                            {MODULE_OPTIONS.find((o) => o.value === m)?.label || m}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <div className="d-flex flex-wrap gap-1">
                      {(sc.departments ?? []).length === 0
                        ? <span className="text-muted" style={{ fontSize: "0.78rem" }}>—</span>
                        : (sc.departments ?? []).map((d) => (
                            <Badge key={d.id} bg="info" text="dark"
                              style={{ fontSize: "0.72rem" }}>{d.name}</Badge>
                          ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <div className="d-flex flex-wrap gap-1">
                      {(sc.groups ?? []).length === 0
                        ? <span className="text-muted" style={{ fontSize: "0.78rem" }}>—</span>
                        : (sc.groups ?? []).map((g) => (
                            <Badge key={g.id} bg="light" text="dark" className="border"
                              style={{ fontSize: "0.72rem" }}>{g.name}</Badge>
                          ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge bg="secondary">{sc.device_count ?? 0}</Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge bg="primary">{sc.user_count ?? 0}</Badge>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <Button variant="outline-primary" onClick={() => openUpdate(sc)}>Sửa</Button>
                      <Button variant="outline-danger"  onClick={() => openDelete(sc)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showCreate} onHide={() => dispatch(toggleShowCreate())} size="lg">
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton><Modal.Title>Tạo phạm vi truy cập</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleShowCreate())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showUpdate} onHide={() => dispatch(toggleShowUpdate())} size="lg">
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton><Modal.Title>Sửa: {selected?.name}</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleShowUpdate())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDelete} onHide={() => dispatch(toggleShowDelete())} size="sm">
        <Modal.Header closeButton><Modal.Title>Xóa phạm vi</Modal.Title></Modal.Header>
        <Modal.Body>
          Xóa <b>{selected?.code} — {selected?.name}</b>?
          {selected?.user_count > 0 && (
            <div className="text-danger mt-1" style={{ fontSize: "0.82rem" }}>
              ⚠ {selected.user_count} user đang dùng phạm vi này.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(toggleShowDelete())}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AccessScopeTab;
