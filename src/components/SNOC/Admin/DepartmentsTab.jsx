// DepartmentsTab.jsx  — THAY THẾ TOÀN BỘ
// Thêm: cột Vùng trong bảng, field chọn Region khi tạo/sửa
import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  createDepartment, deleteDepartment, fetchDepartments,
  selectDepartment, toggleModalCreateDepartment,
  toggleModalDeleteDepartment, toggleModalUpdateDepartment, updateDepartment,
} from "../redux/User/departmentSlice";
import { fetchRegions } from "../redux/User/regionSlice";
import { getJwtClaims } from "../api/snocApiWithAutoToken";

const EmptyState = ({ text = "Không có dữ liệu" }) => (
  <div className="py-4 text-center text-muted">{text}</div>
);

const DepartmentsTab = () => {
  const dispatch = useDispatch();
  const claims = getJwtClaims();
  const isSuper = claims?.is_superuser || claims?.role === "super";

  const {
    departments = [], statusDepartment = "idle",
    showModalCreateDepartment = false, showModalUpdateDepartment = false,
    showModalDeleteDepartment = false, selectedDepartment = null,
  } = useSelector((s) => s.department ?? {});
  const { regions = [] } = useSelector((s) => s.region ?? {});

  const [search, setSearch] = useState("");
  const [form, setForm]     = useState({ name: "", region: "" });

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchRegions());
  }, [dispatch]);

  useEffect(() => {
    if (showModalUpdateDepartment && selectedDepartment) {
      setForm({
        name:   selectedDepartment?.name   ?? "",
        region: selectedDepartment?.region ?? "",  // region FK id (write_only)
      });
    }
  }, [showModalUpdateDepartment, selectedDepartment]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) =>
      d.name?.toLowerCase().includes(q) ||
      d.region_name?.toLowerCase().includes(q) ||
      d.region_code?.toLowerCase().includes(q)
    );
  }, [departments, search]);

  const openCreate = () => {
    setForm({ name: "", region: regions[0]?.id ?? "" });
    dispatch(toggleModalCreateDepartment());
  };
  const openUpdate = (d) => { dispatch(selectDepartment(d)); dispatch(toggleModalUpdateDepartment()); };
  const openDelete = (d) => { dispatch(selectDepartment(d)); dispatch(toggleModalDeleteDepartment()); };

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createDepartment({ name: form.name, region: form.region || null }));
    dispatch(fetchDepartments());
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    await dispatch(updateDepartment({
      departmentId: selectedDepartment.id,
      departmentData: { name: form.name, region: form.region || null },
    }));
    dispatch(fetchDepartments());
  };
  const handleDelete = async () => {
    if (!selectedDepartment) return;
    await dispatch(deleteDepartment(selectedDepartment.id));
  };

  const FormBody = () => (
    <Row className="g-3">
      <Col md={isSuper ? 7 : 12}>
        <Form.Label>Tên phòng ban *</Form.Label>
        <Form.Control required value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
      </Col>
      {isSuper && (
        <Col md={5}>
          <Form.Label>Vùng</Form.Label>
          <Form.Select value={form.region}
            onChange={(e) => setForm((s) => ({ ...s, region: e.target.value }))}>
            <option value="">— Không thuộc vùng —</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.code} — {r.name}</option>
            ))}
          </Form.Select>
        </Col>
      )}
    </Row>
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold">🏢 Quản lý Phòng ban</div>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <Form.Control placeholder="Tìm phòng ban / vùng..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
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
          <Table hover size="sm" className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên phòng ban</th>
                <th>Vùng</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr key={d.id || idx}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold">{d.name}</td>
                  <td>
                    {d.region_code
                      ? <Badge bg="primary" pill>{d.region_code} — {d.region_name}</Badge>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <Button variant="outline-primary" onClick={() => openUpdate(d)}>Sửa</Button>
                      <Button variant="outline-danger"  onClick={() => openDelete(d)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      {/* Tạo */}
      <Modal show={showModalCreateDepartment} onHide={() => dispatch(toggleModalCreateDepartment())}>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton><Modal.Title>Tạo phòng ban</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
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
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalUpdateDepartment())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Xóa */}
      <Modal show={showModalDeleteDepartment} onHide={() => dispatch(toggleModalDeleteDepartment())}>
        <Modal.Header closeButton><Modal.Title>Xóa phòng ban</Modal.Title></Modal.Header>
        <Modal.Body>Bạn chắc chắn xóa: <b>{selectedDepartment?.name}</b>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(toggleModalDeleteDepartment())}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default DepartmentsTab;
