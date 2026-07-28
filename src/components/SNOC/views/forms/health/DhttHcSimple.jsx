import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Alert, Badge, Button, Card, Col, Form,
  ProgressBar, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  fetchDhttHcSimpleJobStatus,
  resetDhttHcSimpleJob,
  runDhttHcSimple,
} from "../../../redux/Healthcheck/dhttHcSimpleSlice";
import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const POLL_INTERVAL  = 4000;  // ms
const POLL_MAX_COUNT = 450;   // 4s × 450 ≈ 30 phút — đủ headroom cho HLR/CUDB

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const DhttHcSimple = () => {
  const dispatch = useDispatch();

  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const { running = false, manualResult = null, jobId = null, jobStatus = null, error = null } =
    useSelector((s) => s.dhttHcSimple || {});

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedDevices,  setSelectedDevices]  = useState([]);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  const pollRef      = useRef(null);
  const pollCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  const pollJob = useCallback((id) => {
    dispatch(fetchDhttHcSimpleJobStatus(id)).then((action) => {
      const status = action.payload?.status;
      if (["done", "failed", "locked", "cancelled"].includes(status)) {
        stopPolling();
        return;
      }
      pollCountRef.current += 1;
      if (pollCountRef.current >= POLL_MAX_COUNT) {
        setPollTimedOut(true);
        stopPolling();
      }
    });
  }, [dispatch, stopPolling]);

  useEffect(() => {
    if (jobId && running && !pollRef.current) {
      pollCountRef.current = 0;
      setPollTimedOut(false);
      pollJob(jobId);
      pollRef.current = setInterval(() => pollJob(jobId), POLL_INTERVAL);
    }
    if (!running) stopPolling();
  }, [jobId, running, pollJob, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => { dispatch(fetchPlatforms()); }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform?.value) {
      dispatch(fetchDevicesByPlatform(selectedPlatform.value));
    }
    setSelectedDevices([]);
  }, [dispatch, selectedPlatform]);

  const platformOptions = useMemo(() =>
    platforms.map(p => ({ label: `${p.name} (${p.device_count ?? 0})`, value: p.name })),
  [platforms]);

  const deviceOptions = useMemo(() =>
    devices.map(d => ({ label: `${d.name} (${d.ip || "no-ip"})`, value: d.name })),
  [devices]);

  const combinedDeviceOptions = useMemo(() => [
    { label: "-- Chọn tất cả --", value: "__all__" }, ...deviceOptions,
  ], [deviceOptions]);

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find(o => o.value === "__all__")) setSelectedDevices(deviceOptions);
    else setSelectedDevices(selected);
  };

  const handleRun = () => {
    if (!selectedPlatform) return alert("Vui lòng chọn platform");
    if (!selectedDevices.length) return alert("Vui lòng chọn ít nhất 1 thiết bị");
    dispatch(resetDhttHcSimpleJob());
    setPollTimedOut(false);
    dispatch(runDhttHcSimple({
      platform:   selectedPlatform.value,
      node_names: selectedDevices.map(d => d.value),
    }));
  };

  const handleExport = () => {
    if (!manualResult) return;
    const { outputs = [], dhtt_sync, platform } = manualResult;

    const sheet1 = outputs.map(r => ({
      Host:             r.host,
      IP:               r.ip || "—",
      "HC Status":      r.status,
      "Fail Description": r.notes || "—",
      "ĐHTT HTTP":      dhtt_sync?.status_code || "—",
      "ĐHTT Message":   dhtt_sync?.response?.message || "—",
      "Bắt đầu":        r.starttime ? new Date(r.starttime).toLocaleString("vi-VN") : "—",
      "Kết thúc":       r.endtime   ? new Date(r.endtime).toLocaleString("vi-VN")   : "—",
    }));

    const resp   = dhtt_sync?.response || {};
    const sheet2 = (dhtt_sync?.payload_sent || []).map(n => ({
      Hostname:        n.hostname,
      IP:              n.ip,
      "Ngày đánh giá": n.ngay_danh_gia,
      "Phân loại HT":  n.phan_loai_he_thong,
      "id_thamso=112": (n.listKqbd || []).find(k => k.id_thamso === 112)?.ket_qua ?? "—",
      "Fail description": (n.listKqbd || []).find(k => k.id_thamso === 112)?.fail_description || "—",
    }));
    const sheet3 = [{
      "HTTP Code": dhtt_sync?.status_code,
      "Message":   resp.message,
      "Result":    resp.result ? "true" : "false",
      "Total":     resp.total,
      "Node không tồn tại": (resp.node_khong_ton_tai || []).join(", "),
      "Mã phiếu Web ĐH":    (resp.id_phieu_web_dh || []).join(", "),
    }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet1), "Kết quả HC Simple");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet2), "Request ĐHTT");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet3), "Response ĐHTT");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `HCSimple_Manual_${platform}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const summary = manualResult?.summary;
  const outputs = manualResult?.outputs || [];
  const sync    = manualResult?.dhtt_sync;

  return (
    <>
      <TopNavbarHealth />
      <Row className="mt-3">
        <Col md={12}>

          {/* ── Form ────────────────────────────────────────────────── */}
          <Card className="mb-3">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">🛡️ Bảo Dưỡng HC Simple — Manual</Card.Title>
              {summary && !running && (
                <div className="d-flex gap-2">
                  <Badge bg="secondary">Tổng: {summary.total}</Badge>
                  <Badge bg="success">✅ OK: {summary.ok}</Badge>
                  <Badge bg="warning" text="dark">⚠️ NOK: {summary.nok}</Badge>
                  <Badge bg="danger">🔴 Lỗi: {summary.failed}</Badge>
                </div>
              )}
            </Card.Header>
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Label className="fw-bold">Platform</Form.Label>
                  <Select
                    options={platformOptions}
                    value={selectedPlatform}
                    onChange={setSelectedPlatform}
                    placeholder="-- Tìm platform --"
                    isClearable
                    styles={SELECT_STYLES}
                    isDisabled={running}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold">Thiết bị</Form.Label>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    options={combinedDeviceOptions}
                    value={selectedDevices}
                    onChange={handleDeviceChange}
                    placeholder="-- Chọn thiết bị --"
                    isDisabled={!selectedPlatform || running}
                    isLoading={loadingDevices}
                    styles={SELECT_STYLES}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="primary" className="w-100"
                    onClick={handleRun}
                    disabled={running || !selectedPlatform || !selectedDevices.length}
                  >
                    {running
                      ? <><Spinner size="sm" animation="border" className="me-1" />Đang chạy...</>
                      : "▶️ Chạy ngay"}
                  </Button>
                </Col>
              </Row>
              {running && (
                <div className="mt-3">
                  <ProgressBar animated now={100} label={
                    jobStatus === "queued" ? "Đã xếp hàng, chờ worker xử lý..." :
                    jobStatus === "running" ? "Đang kết nối và thu thập dữ liệu (có thể mất vài phút với HLR/CUDB)..." :
                    "Đang chạy..."
                  } />
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ── Lỗi / timeout ────────────────────────────────────── */}
          {!running && pollTimedOut && (
            <Alert variant="warning">
              ⏱️ Đã poll quá thời gian tối đa ({Math.round(POLL_MAX_COUNT * POLL_INTERVAL / 60000)} phút) mà job chưa
              hoàn thành. Job có thể vẫn đang chạy ở backend — kiểm tra lại History sau ít phút.
            </Alert>
          )}
          {!running && !pollTimedOut && error && (
            <Alert variant="danger">❌ {typeof error === "string" ? error : JSON.stringify(error)}</Alert>
          )}

          {/* ── Bảng kết quả ─────────────────────────────────────── */}
          {!running && outputs.length > 0 && (
            <Card className="mb-3">
              <Card.Header className="d-flex align-items-center justify-content-between">
                <Card.Title as="h6" className="mb-0">
                  Kết quả — <code>{manualResult?.platform}</code>
                  <span className="text-muted fw-normal ms-2" style={{ fontSize: "0.82rem" }}>
                    ({outputs.length} thiết bị)
                  </span>
                </Card.Title>
                <Button variant="outline-success" size="sm" onClick={handleExport}>
                  📥 Excel
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ minWidth: 120 }}>Host</th>
                      <th style={{ minWidth: 100 }}>IP</th>
                      <th style={{ textAlign: "center", minWidth: 80 }}>HC Status</th>
                      <th>Fail Description</th>
                      <th style={{ minWidth: 80, textAlign: "center" }}>ĐHTT</th>
                      <th style={{ minWidth: 100 }}>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputs.map(r => {
                      const hcBg =
                        r.status === "OK"  ? "table-success" :
                        r.status === "NOK" ? "table-warning"  : "table-danger";
                      const notesText = typeof r.notes === "string"
                        ? r.notes
                        : JSON.stringify(r.notes);
                      return (
                        <tr key={r.host} className={hcBg}>
                          <td><strong>{r.host}</strong></td>
                          <td><code style={{ fontSize: "0.8rem" }}>{r.ip || "—"}</code></td>
                          <td style={{ textAlign: "center" }}>
                            <Badge bg={
                              r.status === "OK"  ? "success" :
                              r.status === "NOK" ? "warning" : "danger"
                            } text={r.status === "NOK" ? "dark" : undefined}>
                              {r.status}
                            </Badge>
                          </td>
                          <td style={{ fontSize: "0.8rem", maxWidth: 400, whiteSpace: "pre-wrap" }}>
                            {r.status !== "OK" ? (notesText || "—") : "—"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {sync ? (
                              <Badge bg={sync.status_code === 200 ? "success" : "danger"}
                                style={{ fontSize: "0.72rem" }}>
                                HTTP {sync.status_code}
                              </Badge>
                            ) : "—"}
                          </td>
                          <td style={{ fontSize: "0.75rem" }}>
                            <div>▶ {fmtTime(r.starttime)}</div>
                            <div className="text-muted">■ {fmtTime(r.endtime)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* ── ĐHTT Sync Result ─────────────────────────────────── */}
          {!running && sync && (() => {
            const resp = sync.response || {};
            const isOk = sync.status_code === 200 && resp.result === true;
            const hasUnknown = (resp.node_khong_ton_tai || []).length > 0;

            return (
              <Card border={isOk ? "success" : "danger"}>
                <Card.Header className={`d-flex align-items-center justify-content-between ${isOk ? "bg-success text-white" : "bg-danger text-white"}`}>
                  <span className="fw-bold">{isOk ? "✅" : "❌"} Kết quả gửi lên Web Điều Hành</span>
                  <Badge bg="light" text="dark">HTTP {sync.status_code}</Badge>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3 mb-3">
                    <Col md={3}>
                      <div className="text-muted small mb-1">Trạng thái</div>
                      <Badge bg={isOk ? "success" : "danger"} style={{ fontSize: "0.9rem" }}>
                        {resp.message || sync.status?.toUpperCase()}
                      </Badge>
                    </Col>
                    <Col md={2}>
                      <div className="text-muted small mb-1">Tổng bản ghi</div>
                      <strong>{resp.total ?? "—"}</strong>
                    </Col>
                    <Col md={3}>
                      <div className="text-muted small mb-1">Mã phiếu Web ĐH</div>
                      {(resp.id_phieu_web_dh || []).length > 0
                        ? resp.id_phieu_web_dh.map((id, i) => (
                            <Badge key={i} bg="info" className="me-1">{id}</Badge>
                          ))
                        : <span className="text-muted">—</span>}
                    </Col>
                    <Col md={4}>
                      <div className="text-muted small mb-1">Request ID</div>
                      <code style={{ fontSize: "0.7rem", wordBreak: "break-all" }}>
                        {resp.request_id || "—"}
                      </code>
                    </Col>
                    {hasUnknown && (
                      <Col md={12}>
                        <div className="text-muted small mb-1">⚠️ Node không tồn tại trên ĐHTT:</div>
                        <div className="d-flex flex-wrap gap-1">
                          {resp.node_khong_ton_tai.map((n, i) => (
                            <Badge key={i} bg="warning" text="dark">{n}</Badge>
                          ))}
                        </div>
                      </Col>
                    )}
                    {(resp.node_sai_thong_tin || []).length > 0 && (
                      <Col md={12}>
                        <div className="text-muted small mb-1">⚠️ Node sai thông tin:</div>
                        <div className="d-flex flex-wrap gap-1">
                          {resp.node_sai_thong_tin.map((n, i) => (
                            <Badge key={i} bg="danger">{n}</Badge>
                          ))}
                        </div>
                      </Col>
                    )}
                    {(resp.node_sai_ket_qua_bao_duong || []).length > 0 && (
                      <Col md={12}>
                        <div className="text-muted small mb-1">⚠️ Node sai kết quả bảo dưỡng:</div>
                        <div className="d-flex flex-wrap gap-1">
                          {resp.node_sai_ket_qua_bao_duong.map((n, i) => (
                            <Badge key={i} bg="warning" text="dark">{n}</Badge>
                          ))}
                        </div>
                      </Col>
                    )}
                  </Row>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="fw-bold small mb-1">
                        📤 Request Payload
                        <Badge bg="secondary" className="ms-2">
                          {(sync.payload_sent || []).length} node
                        </Badge>
                      </div>
                      <pre style={{
                        background: "#f8f9fa", padding: "10px", borderRadius: 4,
                        fontSize: "0.72rem", maxHeight: 300, overflow: "auto",
                        border: "1px solid #dee2e6", margin: 0,
                      }}>
                        {JSON.stringify(sync.payload_sent, null, 2)}
                      </pre>
                    </Col>
                    <Col md={6}>
                      <div className="fw-bold small mb-1">
                        📥 Response ĐHTT
                        <Badge bg={isOk ? "success" : "danger"} className="ms-2">
                          {isOk ? "OK" : "ERROR"}
                        </Badge>
                      </div>
                      <pre style={{
                        background: isOk ? "#f0fff4" : "#fff5f5",
                        padding: "10px", borderRadius: 4,
                        fontSize: "0.72rem", maxHeight: 300, overflow: "auto",
                        border: `1px solid ${isOk ? "#c3e6cb" : "#f5c6cb"}`,
                        margin: 0,
                      }}>
                        {JSON.stringify(resp, null, 2)}
                      </pre>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })()}

          {!running && manualResult && outputs.length === 0 && (
            <Card body className="text-center text-muted py-4">
              Không có kết quả — kiểm tra lại platform hoặc thiết bị
            </Card>
          )}

        </Col>
      </Row>
    </>
  );
};

export default DhttHcSimple;
