import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  selectDepartment,
  toggleModalCreateDepartment,
  toggleModalDeleteDepartment,
  toggleModalUpdateDepartment,
  updateDepartment,
} from "../redux/User/departmentSlice";

const EmptyState = ({ text = "Không có dữ liệu" }) => (
  <div className="py-4 text-center text-muted">{text}</div>
);

const DepartmentsTab = () => {
  const dispatch = useDispatch();
  const {
    departments = [],
    statusDepartment = "idle",
    showModalCreateDepartment = false,
    showModalUpdateDepartment = false,
    showModalDeleteDepartment = false,
    selectedDepartment = null,
  } = useSelector((s) => s.department ?? {});

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "" });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (showModalUpdateDepartment && selectedDepartment) {
      setForm({ name: selectedDepartment?.name ?? "" });
    }
  }, [showModalUpdateDepartment, selectedDepartment]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments || [];
    return (departments || []).filter((d) =>
      d.name?.toLowerCase().includes(q)
    );
  }, [departments, search]);

  const openCreate = () => {
    setForm({ name: "" });
    dispatch(toggleModalCreateDepartment());
  };
  const openUpdate = (d) => {
    dispatch(selectDepartment(d));
    dispatch(toggleModalUpdateDepartment());
  };
  const openDelete = (d) => {
    dispatch(selectDepartment(d));
    dispatch(toggleModalDeleteDepartment());
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createDepartment(form));
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    await dispatch(updateDepartment({ departmentId: selectedDepartment.id, departmentData: form }));
  };
  const handleDelete = async () => {
    if (!selectedDepartment) return;
    await dispatch(deleteDepartment(selectedDepartment.id));
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold">Quản lý Phòng ban</div>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <Form.Control
              placeholder="Tìm phòng ban"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button size="sm" onClick={openCreate}>+ Tạo phòng ban</Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {statusDepartment === "loading" ? (
          <div className="py-4 text-center"><Spinner animation="border" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState text="Chưa có phòng ban hoặc không khớp bộ lọc" />
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tên phòng ban</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => (
                  <tr key={d.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{d.name}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Button variant="outline-primary" onClick={() => openUpdate(d)}>Sửa</Button>
                        <Button variant="outline-danger" onClick={() => openDelete(d)}>Xoá</Button>
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
      <Modal show={showModalCreateDepartment} onHide={() => dispatch(toggleModalCreateDepartment())}>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton><Modal.Title>Tạo phòng ban</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Tên phòng ban</Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalCreateDepartment())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cập nhật */}
      <Modal show={showModalUpdateDepartment} onHide={() => dispatch(toggleModalUpdateDepartment())}>
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton><Modal.Title>Cập nhật phòng ban</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Tên phòng ban</Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalUpdateDepartment())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Xoá */}
      <Modal show={showModalDeleteDepartment} onHide={() => dispatch(toggleModalDeleteDepartment())}>
        <Modal.Header closeButton><Modal.Title>Xoá phòng ban</Modal.Title></Modal.Header>
        <Modal.Body>Bạn chắc chắn xoá phòng ban: <b>{selectedDepartment?.name}</b>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(toggleModalDeleteDepartment())}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xoá</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default DepartmentsTab;
