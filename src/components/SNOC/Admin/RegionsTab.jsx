// RegionsTab.jsx  — FILE MỚI
import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createRegion, deleteRegion, fetchRegions,
  selectRegion, toggleModalCreateRegion,
  toggleModalDeleteRegion, toggleModalUpdateRegion, updateRegion,
} from "../redux/User/regionSlice";

const EmptyState = ({ text = "Không có dữ liệu" }) => (
  <div className="py-4 text-center text-muted">{text}</div>
);

const RegionsTab = () => {
  const dispatch = useDispatch();
  const {
    regions = [], statusRegion = "idle", selectedRegion = null,
    showModalCreateRegion = false, showModalUpdateRegion = false,
    showModalDeleteRegion = false,
  } = useSelector((s) => s.region ?? {});

  const [search, setSearch] = useState("");
  const [form, setForm]     = useState({ name: "", code: "", description: "" });

  useEffect(() => { dispatch(fetchRegions()); }, [dispatch]);

  useEffect(() => {
    if (showModalUpdateRegion && selectedRegion) {
      setForm({
        name:        selectedRegion?.name        ?? "",
        code:        selectedRegion?.code        ?? "",
        description: selectedRegion?.description ?? "",
      });
    }
  }, [showModalUpdateRegion, selectedRegion]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter((r) =>
      r.name?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q)
    );
  }, [regions, search]);

  const openCreate = () => { setForm({ name: "", code: "", description: "" }); dispatch(toggleModalCreateRegion()); };
  const openUpdate = (r) => { dispatch(selectRegion(r)); dispatch(toggleModalUpdateRegion()); };
  const openDelete = (r) => { dispatch(selectRegion(r)); dispatch(toggleModalDeleteRegion()); };

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createRegion(form));
    dispatch(fetchRegions());
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRegion) return;
    await dispatch(updateRegion({ regionId: selectedRegion.id, regionData: form }));
    dispatch(fetchRegions());
  };
  const handleDelete = async () => {
    if (!selectedRegion) return;
    await dispatch(deleteRegion(selectedRegion.id));
  };

  const FormBody = () => (
    <Row className="g-3">
      <Col md={8}>
        <Form.Label>Tên vùng *</Form.Label>
        <Form.Control required value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="VD: Miền Bắc" />
      </Col>
      <Col md={4}>
        <Form.Label>Mã vùng *</Form.Label>
        <Form.Control required value={form.code} maxLength={20}
          onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
          placeholder="VD: MB" />
      </Col>
      <Col md={12}>
        <Form.Label>Mô tả</Form.Label>
        <Form.Control as="textarea" rows={2} value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
      </Col>
    </Row>
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold">🌐 Quản lý Vùng</div>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <Form.Control placeholder="Tìm vùng..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Button size="sm" onClick={openCreate}>+ Tạo vùng</Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {statusRegion === "loading" ? (
          <div className="py-4 text-center"><Spinner animation="border" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState text="Chưa có vùng nào" />
        ) : (
          <Table hover size="sm" className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Mã</th>
                <th>Tên vùng</th>
                <th style={{ textAlign: "center" }}>Phòng ban</th>
                <th style={{ textAlign: "center" }}>Thiết bị</th>
                <th>Mô tả</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td><Badge bg="primary" pill style={{ fontFamily: "monospace" }}>{r.code}</Badge></td>
                  <td className="fw-semibold">{r.name}</td>
                  <td style={{ textAlign: "center" }}>
                    <Badge bg="info" text="dark">{r.department_count ?? 0}</Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge bg="secondary">{r.device_count ?? 0}</Badge>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#6c757d" }}>{r.description || "—"}</td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <Button variant="outline-primary" onClick={() => openUpdate(r)}>Sửa</Button>
                      <Button variant="outline-danger"  onClick={() => openDelete(r)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showModalCreateRegion} onHide={() => dispatch(toggleModalCreateRegion())}>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton><Modal.Title>Tạo vùng mới</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalCreateRegion())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalUpdateRegion} onHide={() => dispatch(toggleModalUpdateRegion())}>
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton><Modal.Title>Cập nhật vùng</Modal.Title></Modal.Header>
          <Modal.Body>{FormBody()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => dispatch(toggleModalUpdateRegion())}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalDeleteRegion} onHide={() => dispatch(toggleModalDeleteRegion())} size="sm">
        <Modal.Header closeButton><Modal.Title>Xóa vùng</Modal.Title></Modal.Header>
        <Modal.Body>Xóa vùng <b>{selectedRegion?.code} — {selectedRegion?.name}</b>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(toggleModalDeleteRegion())}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default RegionsTab;
