import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { addPin, loadPins, removePin } from "../../../redux/KPI/pinnedKpisSlice";
// (tuỳ dự án) import KPIExplorerCore nếu muốn render đồ thị:
import KPIExplorerCore from "../../forms/kpi/KPIExplorerCore";

export default function PinnedKPISection({
  group,
  subsystem,           // optional: nếu có → đây là Subsystem detail; nếu không → Group page
  platform = null,     // optional: lọc theo platform cụ thể (dùng trong KPIDashboard)
  scopes = "all",       // "subsystem,platform,device" | "platform,device" | "all"
  title = "Pinned KPIs",
  showAddButton = true, // false khi context đã có KPIExplorerCore để thêm pin (vd: KPIDashboard)
}) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.pinned);
  const loadingByKey = useSelector(s => s.kpi?.loadingByKey || {});

  const query = useMemo(() => ({ group, subsystem, platform, scopes }), [group, subsystem, platform, scopes]);

  useEffect(() => {
    if (group) dispatch(loadPins(query));
  }, [dispatch, group, subsystem, platform, scopes]);

  // Modal add
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({
    kpi_key: "",
    title: "",
    subsystem: "",     // dùng khi đang ở Group page (không có prop subsystem)
    platform: "",
    device: "",
    chart_config: {},
  });

  const onChange = (e) => {
    setFormError(null);
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    setShow(false);
    setFormError(null);
    setForm({ kpi_key: "", title: "", subsystem: "", platform: "", device: "", chart_config: {} });
  };

  const handleAdd = async () => {
    if (!form.kpi_key.trim()) return;

    const resolvedSubsystem = subsystem || form.subsystem || null;
    const resolvedPlatform = form.platform || platform || null;
    const resolvedDevice = form.device || null;

    if (!resolvedSubsystem && !resolvedPlatform && !resolvedDevice) {
      setFormError("Cần nhập ít nhất một trong: Subsystem, Platform hoặc Device.");
      return;
    }

    const payload = {
      group,
      subsystem: resolvedSubsystem,
      platform: resolvedPlatform,
      device: resolvedDevice,
      kpi_key: form.kpi_key.trim(),
      title: form.title || "",
      chart_config: form.chart_config || {},
    };
    const result = await dispatch(addPin(payload));
    if (addPin.rejected.match(result)) {
      setFormError("Lưu thất bại. Kiểm tra lại thông tin.");
      return;
    }
    handleClose();
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
          {showAddButton && <Button size="sm" onClick={() => setShow(true)}>+ Pin KPI</Button>}
        </div>
      </Card.Header>

      <Card.Body>
        {items.length === 0 && !loading && (
          <div className="text-muted text-center py-3">
            Chưa có KPI nào được pin. Bấm "+ Pin KPI" để thêm.
          </div>
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

                  {(() => {
                    const pinKey = `${pin.platform || ""}:${pin.device || ""}:${pin.kpi_key}`;
                    const isPinLoading = loadingByKey[pinKey] === true;
                    return (
                      <div className="mt-2 position-relative" style={{ minHeight: 80 }}>
                        {isPinLoading && (
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{ zIndex: 2, background: "rgba(255,255,255,0.7)" }}
                          >
                            <Spinner size="sm" />
                          </div>
                        )}
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
                    );
                  })()}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>

      {/* Modal Add */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>Pin KPI mới</Modal.Title></Modal.Header>
        <Modal.Body>
          {!subsystem && (
            <Form.Group className="mb-3">
              <Form.Label>Subsystem</Form.Label>
              <Form.Control name="subsystem" value={form.subsystem} onChange={onChange} placeholder="vd: PGW" />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>KPI Key <span className="text-danger">*</span></Form.Label>
            <Form.Control name="kpi_key" value={form.kpi_key} onChange={onChange} placeholder="vd: pgw.causecode.topn" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Title (optional)</Form.Label>
            <Form.Control name="title" value={form.title} onChange={onChange} placeholder="Tên hiển thị" />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Platform {platform ? "" : "(optional)"}</Form.Label>
                <Form.Control
                  name="platform"
                  value={platform || form.platform}
                  onChange={platform ? undefined : onChange}
                  placeholder="vd: pgw_native_epg2"
                  disabled={!!platform}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Device (optional)</Form.Label>
                <Form.Control name="device" value={form.device} onChange={onChange} placeholder="vd: epg2-01" />
              </Form.Group>
            </Col>
          </Row>
          {formError && (
            <div className="text-danger small">{formError}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Đóng</Button>
          <Button onClick={handleAdd} disabled={!group || !form.kpi_key.trim()}>Pin</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
