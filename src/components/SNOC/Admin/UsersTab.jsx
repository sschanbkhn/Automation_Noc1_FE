// UsersTab.jsx  — THAY THẾ: bổ sung access_scope, bỏ region_manager
import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, InputGroup,
  Modal, Row, Spinner, Table,
} from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

import { fetchDepartments }  from "../redux/User/departmentSlice";
import { fetchGroups }        from "../redux/User/groupSlice";
import { fetchAccessScopes }  from "../redux/User/accessScopeSlice";
import {
  changePassword, createUser, deleteUser, fetchUsers,
  selectUser as selectUserRow,
  toggleChangePasswordModal, toggleModalCreate,
  toggleModalDelete, toggleModalUpdate, updateUser, uploadUsersCSV,
} from "../redux/User/userSlice";

const fmtDate = (s) => { if (!s) return ""; const d = new Date(s); return isNaN(d) ? s : d.toLocaleString("vi-VN"); };

const ROLE_BADGE = {
  super: { bg: "danger",  label: "Super" },
  admin: { bg: "warning", label: "Admin" },
  user:  { bg: "secondary",label: "User"  },
};

const ScopeBadge = ({ user }) => {
  if (user?.is_superuser || user?.role === "super")
    return <Badge bg="danger">ALL</Badge>;
  if (user?.access_scope)
    return <Badge bg="success">{user.access_scope.code}</Badge>;
  if (user?.role === "admin")
    return <Badge bg="info" text="dark">{user?.department?.name || "?"}</Badge>;
  return <Badge bg="secondary">{user?.group?.name || "?"}</Badge>;
};

const DEFAULT_FORM = {
  username: "", email: "", first_name: "", last_name: "",
  role: "user", password: "",
  department_id: "", group_id: "", access_scope_id: "",
};

const MULTI_STYLES = {
  control: (b) => ({ ...b, minHeight: 36, fontSize: "0.88rem" }),
};

const UsersTab = () => {
  const dispatch = useDispatch();

  const {
    users = [], status = "idle", roles = [],
    showModalCreate = false, showModalUpdate = false,
    showModalDelete = false, showChangePasswordModal = false,
    selectedUser = null, errorCreateUser = null,
  } = useSelector((s) => s.user ?? {});

  const { groups: groupsList = [] }    = useSelector((s) => s.group       ?? {});
  const { departments: deptList = [] } = useSelector((s) => s.department  ?? {});
  const { scopes = [] }                = useSelector((s) => s.accessScope  ?? {});

  const [search,   setSearch]   = useState("");
  const [file,     setFile]     = useState(null);
  const [formUser, setFormUser] = useState(DEFAULT_FORM);
  const [pwd1, setPwd1] = useState(""); const [pwd2, setPwd2] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
    dispatch(fetchAccessScopes());
  }, [dispatch]);

  // Groups grouped by dept
  const groupedByDept = useMemo(() => {
    const map = new Map();
    for (const g of groupsList) {
      const id = g?.department?.id ?? null;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(g);
    }
    return map;
  }, [groupsList]);

  const groupsForDept = useMemo(() => {
    const id = Number(formUser.department_id) || null;
    return groupedByDept.get(id) || [];
  }, [groupedByDept, formUser.department_id]);

  const scopeOptions = useMemo(() => scopes.map((sc) => ({
    value: sc.id,
    label: `[${sc.code}] ${sc.name}`,
  })), [scopes]);

  // Prefill update
  useEffect(() => {
    if (showModalUpdate && selectedUser) {
      setFormUser({
        username:       selectedUser?.username           ?? "",
        email:          selectedUser?.email              ?? "",
        first_name:     selectedUser?.first_name         ?? "",
        last_name:      selectedUser?.last_name          ?? "",
        role:           selectedUser?.role               ?? "user",
        password:       "",
        department_id:  selectedUser?.department?.id     ?? "",
        group_id:       selectedUser?.group?.id          ?? "",
        access_scope_id:selectedUser?.access_scope?.id  ?? "",
      });
    }
  }, [showModalUpdate, selectedUser]);

  // Auto-select group khi đổi dept
  useEffect(() => {
    if (!showModalCreate && !showModalUpdate) return;
    const list = groupsForDept;
    if (list.length === 0) setFormUser((s) => ({ ...s, group_id: "" }));
    else if (!list.find((g) => String(g.id) === String(formUser.group_id)))
      setFormUser((s) => ({ ...s, group_id: String(list[0].id) }));
  }, [formUser.department_id, groupsForDept, showModalCreate, showModalUpdate]); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [
      u.username, u.email, u.role,
      u.department?.name, u.group?.name, u.access_scope?.code,
    ].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)));
  }, [users, search]);

  const openCreate = () => {
    const depId = deptList[0]?.id ?? "";
    const grpId = (groupedByDept.get(depId) || [])[0]?.id ?? "";
    setFormUser({ ...DEFAULT_FORM, department_id: depId ? String(depId) : "", group_id: grpId ? String(grpId) : "" });
    dispatch(toggleModalCreate());
  };

  const buildPayload = () => ({
    username:        formUser.username,
    email:           formUser.email,
    first_name:      formUser.first_name,
    last_name:       formUser.last_name,
    role:            formUser.role,
    password:        formUser.password || undefined,
    department_id:   Number(formUser.department_id)  || null,
    group_id:        Number(formUser.group_id)        || null,
    access_scope_id: Number(formUser.access_scope_id) || null,
  });

  const handleCreate = async (e) => { e.preventDefault(); await dispatch(createUser(buildPayload())); };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const { password, ...rest } = buildPayload();
    await dispatch(updateUser({ userId: selectedUser.id, userData: rest }));
  };
  const handleDelete = async () => { if (!selectedUser) return; await dispatch(deleteUser(selectedUser.id)); };
  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (pwd1.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự.");
    if (pwd1 !== pwd2)   return alert("Xác nhận mật khẩu không khớp.");
    await dispatch(changePassword({ id: selectedUser.id, password: pwd1 }));
    dispatch(toggleChangePasswordModal());
  };

  const FormBody = () => (
    <Row className="g-3">
      <Col md={4}>
        <Form.Label>Username *</Form.Label>
        <Form.Control required value={formUser.username}
          onChange={(e) => setFormUser((s) => ({ ...s, username: e.target.value }))} />
      </Col>
      <Col md={4}>
        <Form.Label>Email *</Form.Label>
        <Form.Control type="email" required value={formUser.email}
          onChange={(e) => setFormUser((s) => ({ ...s, email: e.target.value }))} />
      </Col>
      <Col md={4}>
        <Form.Label>Vai trò</Form.Label>
        <Form.Select value={formUser.role}
          onChange={(e) => setFormUser((s) => ({ ...s, role: e.target.value }))}>
          {roles.map((r) => <option key={r.key} value={r.key}>{r.value}</option>)}
        </Form.Select>
      </Col>
      <Col md={3}>
        <Form.Label>Họ</Form.Label>
        <Form.Control value={formUser.first_name}
          onChange={(e) => setFormUser((s) => ({ ...s, first_name: e.target.value }))} />
      </Col>
      <Col md={3}>
        <Form.Label>Tên</Form.Label>
        <Form.Control value={formUser.last_name}
          onChange={(e) => setFormUser((s) => ({ ...s, last_name: e.target.value }))} />
      </Col>
      <Col md={4}>
    <Form.Label>Mật khẩu *</Form.Label>
    <Form.Control 
      type="password" 
      required 
      value={formUser.password}
      onChange={(e) => setFormUser((s) => ({ ...s, password: e.target.value }))} 
    />
  </Col>
      <Col md={3}>
        <Form.Label>Phòng ban</Form.Label>
        <Form.Select value={formUser.department_id}
          onChange={(e) => setFormUser((s) => ({ ...s, department_id: e.target.value }))}>
          <option value="">-- Chọn --</option>
          {deptList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Form.Select>
      </Col>
      <Col md={3}>
        <Form.Label>Nhóm</Form.Label>
        <Form.Select value={formUser.group_id}
          onChange={(e) => setFormUser((s) => ({ ...s, group_id: e.target.value }))}>
          <option value="">-- Chọn --</option>
          {groupsForDept.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Form.Select>
      </Col>

      {/* Phạm vi mở rộng — tùy chọn cho bất kỳ user nào */}
      <Col md={12}>
        <Form.Label>
          🔐 Phạm vi truy cập mở rộng{" "}
          <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
            (tùy chọn — user sẽ thấy thêm device của các phòng ban / nhóm trong phạm vi này)
          </span>
        </Form.Label>
        <Select
          isClearable options={scopeOptions} styles={MULTI_STYLES}
          value={scopeOptions.find((o) => String(o.value) === String(formUser.access_scope_id)) || null}
          onChange={(opt) => setFormUser((s) => ({ ...s, access_scope_id: opt ? String(opt.value) : "" }))}
          placeholder="Không có (chỉ thấy nhóm/phòng ban của mình)..."
        />
      </Col>

      {errorCreateUser && (
        <Col md={12}>
          <div className="alert alert-danger py-1 mb-0" style={{ fontSize: "0.82rem" }}>
            {typeof errorCreateUser === "string" ? errorCreateUser : JSON.stringify(errorCreateUser)}
          </div>
        </Col>
      )}
    </Row>
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="fw-semibold">👤 Quản lý Người dùng</div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <InputGroup size="sm" style={{ width: 200 }}>
            <Form.Control placeholder="Tìm user..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Form.Control type="file" size="sm" style={{ width: 160 }} accept=".csv"
            onChange={(e) => setFile(e.target.files[0])} />
          {file && <Button size="sm" variant="outline-info"
            onClick={async () => { await dispatch(uploadUsersCSV(file)); setFile(null); }}>
            Upload CSV</Button>}
          <Button size="sm" variant="primary" onClick={openCreate}>+ Tạo user</Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {status === "loading" ? (
          <div className="py-4 text-center"><Spinner animation="border" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-4 text-center text-muted">Không có dữ liệu</div>
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0 align-middle" style={{ fontSize: "0.82rem" }}>
              <thead className="table-dark">
                <tr>
                  <th>#</th><th>Username</th><th>Email</th>
                  <th>Vai trò</th><th>Phạm vi</th>
                  <th>Phòng ban</th><th>Nhóm</th>
                  <th>Scope mở rộng</th>
                  <th style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{u.username}</td>
                    <td style={{ color: "#6c757d" }}>{u.email}</td>
                    <td>
                      <Badge bg={ROLE_BADGE[u.role]?.bg || "secondary"} style={{ fontSize: "0.71rem" }}>
                        {ROLE_BADGE[u.role]?.label || u.role}
                      </Badge>
                    </td>
                    <td><ScopeBadge user={u} /></td>
                    <td>{u.department?.name || "—"}</td>
                    <td>{u.group?.name      || "—"}</td>
                    <td>
                      {u.access_scope
                        ? <Badge bg="success" style={{ fontSize: "0.72rem" }}>
                            {u.access_scope.code}
                          </Badge>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <div className="btn-group btn-group-sm">
                        <Button variant="outline-primary"
                          onClick={() => { dispatch(selectUserRow(u)); dispatch(toggleModalUpdate()); }}>Sửa</Button>
                        <Button variant="outline-secondary"
                          onClick={() => { dispatch(selectUserRow(u)); setPwd1(""); setPwd2(""); dispatch(toggleChangePasswordModal(u)); }}>Pwd</Button>
                        <Button variant="outline-danger"
                          onClick={() => { dispatch(selectUserRow(u)); dispatch(toggleModalDelete()); }}>Xóa</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      <Modal show={showModalCreate} onHide={() => dispatch(toggleModalCreate())} size="lg">
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton><Modal.Title>Tạo người dùng</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalCreate())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalUpdate} onHide={() => dispatch(toggleModalUpdate())} size="lg">
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton><Modal.Title>Cập nhật: {selectedUser?.username}</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalUpdate())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalDelete} onHide={() => dispatch(toggleModalDelete())}>
        <Modal.Header closeButton><Modal.Title>Xóa người dùng</Modal.Title></Modal.Header>
        <Modal.Body>Xóa: <b>{selectedUser?.username}</b>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(toggleModalDelete())}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showChangePasswordModal} onHide={() => dispatch(toggleChangePasswordModal())}>
        <Form onSubmit={handleChangePwd}>
          <Modal.Header closeButton><Modal.Title>Đổi mật khẩu: {selectedUser?.username}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control type="password" value={pwd1} onChange={(e) => setPwd1(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nhập lại</Form.Label>
              <Form.Control type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleChangePasswordModal())}>Hủy</Button>
            <Button type="submit">Cập nhật</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default UsersTab;
