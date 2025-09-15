import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  createGroup,
  deleteGroup,
  fetchGroups,
  selectGroup,
  toggleModalCreateGroup,
  toggleModalDeleteGroup,
  toggleModalUpdateGroup,
  updateGroup,
} from "../redux/User/groupSlice";
import { fetchDepartments } from "../redux/User/departmentSlice";

const EmptyState = ({ text = "Không có dữ liệu" }) => (
  <div className="py-4 text-center text-muted">{text}</div>
);

const GroupsTab = () => {
  const dispatch = useDispatch();
  const {
    groups = [],
    statusGroup = "idle",
    showModalCreateGroup = false,
    showModalUpdateGroup = false,
    showModalDeleteGroup = false,
    selectedGroup = null,
  } = useSelector((s) => s.group ?? {});
  const { departments: departmentsList = [] } = useSelector((s) => s.department ?? {});

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", department_id: "" });

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (showModalUpdateGroup && selectedGroup) {
      setForm({
        name: selectedGroup?.name ?? "",
        department_id: selectedGroup?.department?.id ?? "",
      });
    }
  }, [showModalUpdateGroup, selectedGroup]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups || [];
    return (groups || []).filter((g) => {
      const deptName = g?.department?.name || "";
      return (
        g.name?.toLowerCase().includes(q) ||
        deptName.toLowerCase().includes(q)
      );
    });
  }, [groups, search]);

  const openCreate = () => {
    setForm({
      name: "",
      department_id: departmentsList[0]?.id ?? "",
    });
    dispatch(toggleModalCreateGroup());
  };
  const openUpdate = (g) => {
    dispatch(selectGroup(g));
    dispatch(toggleModalUpdateGroup());
  };
  const openDelete = (g) => {
    dispatch(selectGroup(g));
    dispatch(toggleModalDeleteGroup());
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      ...(form.department_id ? { department_id: Number(form.department_id) } : {}),
    };
    await dispatch(createGroup(payload));
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    const payload = {
      name: form.name,
      ...(form.department_id ? { department_id: Number(form.department_id) } : {}),
    };
    await dispatch(updateGroup({ groupId: selectedGroup.id, groupData: payload }));
  };
  const handleDelete = async () => {
    if (!selectedGroup) return;
    await dispatch(deleteGroup(selectedGroup.id));
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold">Quản lý Nhóm</div>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <Form.Control
              placeholder="Tìm nhóm/phòng ban"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button size="sm" onClick={openCreate}>+ Tạo nhóm</Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {statusGroup === "loading" ? (
          <div className="py-4 text-center"><Spinner animation="border" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState text="Chưa có nhóm hoặc không khớp bộ lọc" />
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tên nhóm</th>
                  <th>Phòng ban</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, idx) => (
                  <tr key={g.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{g.name}</td>
                    <td>{g.department?.name || "-"}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Button variant="outline-primary" onClick={() => openUpdate(g)}>Sửa</Button>
                        <Button variant="outline-danger" onClick={() => openDelete(g)}>Xoá</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Tạo */}
      <Modal show={showModalCreateGroup} onHide={() => dispatch(toggleModalCreateGroup())}>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton><Modal.Title>Tạo nhóm</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={7}>
                <Form.Label>Tên nhóm</Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </Col>
              <Col md={5}>
                <Form.Label>Phòng ban</Form.Label>
                <Form.Select
                  value={form.department_id}
                  onChange={(e) => setForm((s) => ({ ...s, department_id: e.target.value }))}
                >
                  <option value="">(Không gán)</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalCreateGroup())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cập nhật */}
      <Modal show={showModalUpdateGroup} onHide={() => dispatch(toggleModalUpdateGroup())}>
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton><Modal.Title>Cập nhật nhóm</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={7}>
                <Form.Label>Tên nhóm</Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </Col>
              <Col md={5}>
                <Form.Label>Phòng ban</Form.Label>
                <Form.Select
                  value={form.department_id}
                  onChange={(e) => setForm((s) => ({ ...s, department_id: e.target.value }))}
                >
                  <option value="">(Không gán)</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalUpdateGroup())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Xoá */}
      <Modal show={showModalDeleteGroup} onHide={() => dispatch(toggleModalDeleteGroup())}>
        <Modal.Header closeButton><Modal.Title>Xoá nhóm</Modal.Title></Modal.Header>
        <Modal.Body>Bạn chắc chắn xoá nhóm: <b>{selectedGroup?.name}</b>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(toggleModalDeleteGroup())}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xoá</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default GroupsTab;
