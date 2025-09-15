import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { fetchDepartments } from "../redux/User/departmentSlice";
import { fetchGroups } from "../redux/User/groupSlice";
import {
  changePassword,
  createUser,
  deleteUser,
  fetchUsers,
  selectUser as selectUserRow,
  toggleChangePasswordModal,
  toggleModalCreate,
  toggleModalDelete,
  toggleModalUpdate,
  updateUser,
  uploadUsersCSV,
} from "../redux/User/userSlice";

const EmptyState = ({ text = "Không có dữ liệu" }) => (
  <div className="py-4 text-center text-muted">{text}</div>
);

const BadgeBool = ({ v }) => (
  <span className={`badge ${v ? "bg-success" : "bg-secondary"}`}>
    {v ? "Có" : "Không"}
  </span>
);

const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("vi-VN");
};

const UsersTab = () => {
  const dispatch = useDispatch();

  // user slice
  const {
    users = [],
    status = "idle",
    roles = [],
    showModalCreate = false,
    showModalUpdate = false,
    showModalDelete = false,
    showChangePasswordModal = false,
    selectedUser = null,
    loading = false,
  } = useSelector((s) => s.user ?? {});
  console.log("users", users);
  // group & department (để chọn group_id / department_id)
  const { groups: groupsList = [] } = useSelector((s) => s.group ?? {});
  const { departments: departmentsList = [] } = useSelector(
    (s) => s.department ?? {}
  );

  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);

  // form tạo/sửa (lưu ý: dùng group_id & department_id đúng theo backend)
  const [formUser, setFormUser] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    password: "",
    department_id: "",
    group_id: "",
  });

  // form đổi mật khẩu
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  // load dữ liệu
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  // filter nhóm theo phòng ban đã chọn
  const groupedByDepartment = useMemo(() => {
    const map = new Map();
    for (const g of groupsList) {
      const depId = g?.department?.id ?? null;
      if (!map.has(depId)) map.set(depId, []);
      map.get(depId).push(g);
    }
    return map;
  }, [groupsList]);

  const groupsForSelectedDepartment = useMemo(() => {
    const depIdNum = Number(formUser.department_id) || null;
    return groupedByDepartment.get(depIdNum) || [];
  }, [groupedByDepartment, formUser.department_id]);

  // Prefill khi mở modal Update
  useEffect(() => {
    if (showModalUpdate && selectedUser) {
      setFormUser({
        username: selectedUser?.username ?? "",
        email: selectedUser?.email ?? "",
        first_name: selectedUser?.first_name ?? "",
        last_name: selectedUser?.last_name ?? "",
        role: selectedUser?.role ?? "",
        password: "",
        department_id: selectedUser?.department?.id ?? "",
        group_id: selectedUser?.group?.id ?? "",
      });
    }
  }, [showModalUpdate, selectedUser]);

  // nếu đổi phòng ban trong form -> auto chọn nhóm thuộc phòng ban đó
  useEffect(() => {
    if (!showModalCreate && !showModalUpdate) return; // chỉ khi trong modal
    const list = groupsForSelectedDepartment;
    if (list.length === 0) {
      setFormUser((s) => ({ ...s, group_id: "" }));
    } else if (!list.find((g) => String(g.id) === String(formUser.group_id))) {
      setFormUser((s) => ({ ...s, group_id: String(list[0].id) }));
    }
  }, [
    formUser.department_id,
    groupsForSelectedDepartment,
    showModalCreate,
    showModalUpdate,
  ]); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users || [];
    return (users || []).filter((u) => {
      const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ");
      const deptName = u.department?.name || "";
      const groupName = u.group?.name || "";
      const fields = [
        u.username,
        u.email,
        fullName,
        u.role,
        deptName,
        groupName,
        String(u.is_active),
        String(u.is_staff),
        String(u.is_superuser),
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [users, search]);

  const onOpenCreate = () => {
    const depDefault = departmentsList[0]?.id ?? "";
    const groupsOfDefaultDep = groupedByDepartment.get(depDefault) || [];
    const groupDefault = groupsOfDefaultDep[0]?.id ?? "";
    setFormUser({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: roles?.[0]?.key || "user",
      password: "",
      department_id: depDefault ? String(depDefault) : "",
      group_id: groupDefault ? String(groupDefault) : "",
    });
    dispatch(toggleModalCreate());
  };

  const onOpenUpdate = (u) => {
    dispatch(selectUserRow(u));
    dispatch(toggleModalUpdate());
  };
  const onOpenDelete = (u) => {
    dispatch(selectUserRow(u));
    dispatch(toggleModalDelete());
  };
  const onOpenChangePwd = (u) => {
    dispatch(selectUserRow(u));
    setPwd1("");
    setPwd2("");
    dispatch(toggleChangePasswordModal(u));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formUser.department_id || !formUser.group_id) {
      alert("Vui lòng chọn Phòng ban và Nhóm.");
      return;
    }
    const payload = {
      username: formUser.username,
      email: formUser.email,
      first_name: formUser.first_name,
      last_name: formUser.last_name,
      role: formUser.role,
      password: formUser.password,
      department_id: Number(formUser.department_id),
      group_id: Number(formUser.group_id),
    };
    await dispatch(createUser(payload));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formUser.department_id || !formUser.group_id) {
      alert("Vui lòng chọn Phòng ban và Nhóm.");
      return;
    }
    const payload = {
      username: formUser.username,
      email: formUser.email,
      first_name: formUser.first_name,
      last_name: formUser.last_name,
      role: formUser.role,
      department_id: Number(formUser.department_id),
      group_id: Number(formUser.group_id),
    };
    await dispatch(updateUser({ userId: selectedUser.id, userData: payload }));
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    await dispatch(deleteUser(selectedUser.id));
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (pwd1.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự.");
    if (pwd1 !== pwd2) return alert("Xác nhận mật khẩu không khớp.");
    await dispatch(changePassword({ id: selectedUser.id, password: pwd1 }));
    dispatch(toggleChangePasswordModal());
  };

  const handleUpload = async () => {
    if (!file) return;
    await dispatch(uploadUsersCSV(file));
    setFile(null);
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold">Quản lý Người dùng</div>
        <div className="d-flex gap-2 flex-wrap">
          <InputGroup size="sm">
            <Form.Control
              placeholder="Tìm (username, email, vai trò, nhóm, phòng ban...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Form.Group
            controlId="uploadUsersCsv"
            className="d-flex align-items-center"
          >
            <Form.Control
              type="file"
              size="sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Form.Group>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Tải CSV"}
          </Button>
          <Button size="sm" onClick={onOpenCreate}>
            + Tạo người dùng
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {status === "loading" ? (
          <div className="py-4 text-center">
            <Spinner animation="border" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState text="Chưa có người dùng hoặc không khớp bộ lọc" />
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nhóm</th>
                  <th>Phòng ban</th>
                  <th>Vai trò</th>
                  <th>Nhân viên</th>
                  <th>Siêu quản trị</th>
                  <th>Kích hoạt</th>
                  <th>Ngày</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const deptName = u.department?.name || "";
                  const groupName = u.group?.name || "";
                  return (
                    <tr key={u.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{groupName}</td>
                      <td>{deptName}</td>
                      <td>{u.role}</td>
                      <td>
                        <BadgeBool v={!!u.is_staff} />
                      </td>
                      <td>
                        <BadgeBool v={!!u.is_superuser} />
                      </td>
                      <td>
                        <BadgeBool v={!!u.is_active} />
                      </td>
                      <td className="text-nowrap">{fmtDate(u.date)}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            onClick={() => onOpenUpdate(u)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="outline-warning"
                            onClick={() => onOpenChangePwd(u)}
                          >
                            Đổi mật khẩu
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => onOpenDelete(u)}
                          >
                            Xoá
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Modal: Tạo */}
      <Modal
        show={showModalCreate}
        onHide={() => dispatch(toggleModalCreate())}
        size="lg"
      >
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo người dùng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  value={formUser.username}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, username: e.target.value }))
                  }
                />
              </Col>
              <Col md={4}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={formUser.email}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </Col>
              <Col md={4}>
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  required
                  value={formUser.password}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, password: e.target.value }))
                  }
                />
              </Col>

              <Col md={3}>
                <Form.Label>Họ</Form.Label>
                <Form.Control
                  value={formUser.first_name}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, first_name: e.target.value }))
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Label>Tên</Form.Label>
                <Form.Control
                  value={formUser.last_name}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, last_name: e.target.value }))
                  }
                />
              </Col>

              <Col md={3}>
                <Form.Label>Phòng ban</Form.Label>
                <Form.Select
                  required
                  value={formUser.department_id}
                  onChange={(e) =>
                    setFormUser((s) => ({
                      ...s,
                      department_id: e.target.value,
                    }))
                  }
                >
                  {departmentsList.length === 0 && (
                    <option value="">-- Chọn --</option>
                  )}
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Label>Nhóm</Form.Label>
                <Form.Select
                  required
                  value={formUser.group_id}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, group_id: e.target.value }))
                  }
                >
                  {groupsForSelectedDepartment.length === 0 && (
                    <option value="">-- Chọn --</option>
                  )}
                  {groupsForSelectedDepartment.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Label>Vai trò</Form.Label>
                <Form.Select
                  value={formUser.role}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, role: e.target.value }))
                  }
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.value}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => dispatch(toggleModalCreate())}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal: Cập nhật */}
      <Modal
        show={showModalUpdate}
        onHide={() => dispatch(toggleModalUpdate())}
        size="lg"
      >
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton>
            <Modal.Title>Cập nhật người dùng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  value={formUser.username}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, username: e.target.value }))
                  }
                />
              </Col>
              <Col md={4}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={formUser.email}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </Col>

              <Col md={4}>
                <Form.Label>Vai trò</Form.Label>
                <Form.Select
                  value={formUser.role}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, role: e.target.value }))
                  }
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.value}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Phòng ban</Form.Label>
                <Form.Select
                  required
                  value={formUser.department_id}
                  onChange={(e) =>
                    setFormUser((s) => ({
                      ...s,
                      department_id: e.target.value,
                    }))
                  }
                >
                  {departmentsList.length === 0 && (
                    <option value="">-- Chọn --</option>
                  )}
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Nhóm</Form.Label>
                <Form.Select
                  required
                  value={formUser.group_id}
                  onChange={(e) =>
                    setFormUser((s) => ({ ...s, group_id: e.target.value }))
                  }
                >
                  {groupsForSelectedDepartment.length === 0 && (
                    <option value="">-- Chọn --</option>
                  )}
                  {groupsForSelectedDepartment.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => dispatch(toggleModalUpdate())}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal: Xoá */}
      <Modal
        show={showModalDelete}
        onHide={() => dispatch(toggleModalDelete())}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xoá người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn chắc chắn xoá người dùng: <b>{selectedUser?.username}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => dispatch(toggleModalDelete())}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xoá
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Đổi mật khẩu */}
      <Modal
        show={showChangePasswordModal}
        onHide={() => dispatch(toggleChangePasswordModal())}
      >
        <Form onSubmit={handleChangePwd}>
          <Modal.Header closeButton>
            <Modal.Title>Đổi mật khẩu</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-2">
              Người dùng: <b>{selectedUser?.username}</b>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={pwd1}
                onChange={(e) => setPwd1(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nhập lại mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => dispatch(toggleChangePasswordModal())}
            >
              Hủy
            </Button>
            <Button type="submit">Cập nhật</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default UsersTab;
