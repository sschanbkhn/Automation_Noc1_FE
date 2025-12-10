import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { addPin, loadPins, removePin } from "../../../redux/KPI/pinnedKpisSlice";
// (tuỳ dự án) import KPIExplorerCore nếu muốn render đồ thị:
import KPIExplorerCore from "../../forms/kpi/KPIExplorerCore";

export default function PinnedKPISection({
  group,
  subsystem,           // optional: nếu có → đây là Subsystem detail; nếu không → Group page
  scopes = "all",       // "subsystem,platform,device" | "platform,device" | "all"
  title = "Pinned KPIs",
}) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.pinned);

  const query = useMemo(() => ({ group, subsystem, scopes }), [group, subsystem, scopes]);

  useEffect(() => {
    if (group) dispatch(loadPins(query));
  }, [dispatch, group, subsystem, scopes]);

  // Modal add
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    kpi_key: "",
    title: "",
    subsystem: "",     // dùng khi đang ở Group page (không có prop subsystem)
    platform: "",
    device: "",
    chart_config: {},
  });

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    const payload = {
      group,
      subsystem: subsystem || form.subsystem || null,
      platform: form.platform || null,
      device: form.device || null,
      kpi_key: form.kpi_key.trim(),
      title: form.title || "",
      chart_config: form.chart_config || {},
    };
    await dispatch(addPin(payload));
    setShow(false);
    setForm({ kpi_key:"", title:"", subsystem:"", platform:"", device:"", chart_config:{} });
  };

  const handleUnpin = async (id) => {
    await dispatch(removePin(id));
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-bold">{title}</div>
        <div className="d-flex align-items-center gap-2">
          {loading && <Spinner size="sm" />}
          <Button size="sm" onClick={() => setShow(true)}>+ Pin KPI</Button>
        </div>
      </Card.Header>

      <Card.Body>
        {items.length === 0 && (
          <div className="text-muted">Chưa có KPI nào được pin.</div>
        )}

        <Row className="g-3">
          {items.map(pin => (
            <Col md={6} key={pin.id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{pin.title || pin.kpi_key}</div>
                      <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                        {pin.device
                          ? <>Device: <strong>{pin.device}</strong>{pin.platform ? <> — Platform: {pin.platform}</> : null}{pin.subsystem ? <> — Subsystem: {pin.subsystem}</> : null}</>
                          : pin.platform
                            ? <>Platform: <strong>{pin.platform}</strong>{pin.subsystem ? <> — Subsystem: {pin.subsystem}</> : null}</>
                            : pin.subsystem
                              ? <>Subsystem: <strong>{pin.subsystem}</strong></>
                              : <>Group</>
                        }
                      </div>
                    </div>
                    <Button size="sm" variant="outline-danger" onClick={() => handleUnpin(pin.id)}>Unpin</Button>
                  </div>

                  <div className="mt-2">
                    {/* Render đồ thị KPI bằng KPIExplorerCore (sửa props cho đúng API dự án của bạn) */}
                    <KPIExplorerCore
                      kpiKey={pin.kpi_key}
                      scope={{
                        group: pin.group,
                        subsystem: pin.subsystem || undefined,
                        platform: pin.platform || undefined,
                        device: pin.device || undefined,
                      }}
                      chartConfig={pin.chart_config}
                      titleOverride={pin.title || undefined}
                      embed
                      hideToolbar
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>

      {/* Modal Add */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton><Modal.Title>Pin KPI mới</Modal.Title></Modal.Header>
        <Modal.Body>
          {!subsystem && (
            <Form.Group className="mb-3">
              <Form.Label>Subsystem</Form.Label>
              <Form.Control name="subsystem" value={form.subsystem} onChange={onChange} placeholder="vd: PGW" />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>KPI Key</Form.Label>
            <Form.Control name="kpi_key" value={form.kpi_key} onChange={onChange} placeholder="vd: pgw.causecode.topn"/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Title (optional)</Form.Label>
            <Form.Control name="title" value={form.title} onChange={onChange} placeholder="Tên hiển thị"/>
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Platform (optional)</Form.Label>
                <Form.Control name="platform" value={form.platform} onChange={onChange} placeholder="vd: pgw_native_epg2"/>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Device (optional)</Form.Label>
                <Form.Control name="device" value={form.device} onChange={onChange} placeholder="vd: epg2-01"/>
              </Form.Group>
            </Col>
          </Row>
          {/* Nếu bạn muốn cấu hình chart nâng cao, có thể thêm JSON editor cho chart_config */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Đóng</Button>
          <Button onClick={handleAdd} disabled={!group || !form.kpi_key.trim()}>Pin</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
