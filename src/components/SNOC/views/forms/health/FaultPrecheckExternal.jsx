// pages/FaultPrecheck/FaultPrecheckExternal.jsx
// Live view: trigger FCP jobs từ bên ngoài, poll kết quả
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Alert, Badge, Button, Card, Col,
  Collapse, Form, ProgressBar, Row, Spinner, Table,
} from "react-bootstrap";
import snocApi from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── Constants ──────────────────────────────────────────────────────────────────
const POLL_INTERVAL  = 10000;
const POLL_MAX_COUNT = 130;

const STATUS_COLOR = {
  pending: "#6c757d",
  running: "#0d6efd",
  done:    "#198754",
  failed:  "#dc3545",
  locked:  "#fd7e14",
};

const KQ_STYLE = {
  OK:  { bg: "#198754", color: "white", icon: "✓" },
  NOK: { bg: "#dc3545", color: "white", icon: "✗" },
};
const KQ_DEFAULT = { bg: "#e9ecef", color: "#6c757d", icon: "—" };

const GROUP_COLORS = [
  "#0d6efd","#dc3545","#fd7e14","#6610f2",
  "#198754","#0dcaf0","#6c757d","#20c997","#d63384",
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const calcGroupStatus = (tasks = []) => {
  if (!tasks.length) return "SKIP";
  return tasks.some((t) => t.ketqua === "NOK") ? "NOK" : "OK";
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const GroupDot = ({ status }) => {
  const s = status === "OK"
    ? { bg: "#198754", icon: "✓" }
    : status === "NOK"
    ? { bg: "#dc3545", icon: "✗" }
    : { bg: "#adb5bd", icon: "—" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 24, height: 24, borderRadius: "50%",
      background: s.bg, color: "white", fontWeight: "bold", fontSize: "0.78rem",
    }}>
      {s.icon}
    </span>
  );
};

const SummaryBar = ({ summary = {} }) => {
  const { total = 0, ok = 0, nok = 0, failed = 0 } = summary;
  if (!total) return null;
  return (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body className="py-2">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>Tổng kết:</span>
          <Badge bg="secondary" pill>{total} item</Badge>
          <Badge bg="success"   pill>✓ OK: {ok}</Badge>
          <Badge bg="danger"    pill>✗ NOK: {nok}</Badge>
          {failed > 0 && <Badge bg="warning" text="dark" pill>⚠ Failed: {failed}</Badge>}
          <ProgressBar style={{ flex: 1, minWidth: 120, height: 10 }}>
            {ok     > 0 && <ProgressBar variant="success" now={(ok     / total) * 100} key="ok"/>}
            {nok    > 0 && <ProgressBar variant="danger"  now={(nok    / total) * 100} key="nok"/>}
            {failed > 0 && <ProgressBar variant="warning" now={(failed / total) * 100} key="f"/>}
          </ProgressBar>
        </div>
      </Card.Body>
    </Card>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const FaultPrecheckExternal = () => {
  // ── Form state ────────────────────────────────────────────────────────────────
  const [jobIdInput,  setJobIdInput]  = useState("");
  const [webhookUrl,  setWebhookUrl]  = useState("");

  const [itemsJson,   setItemsJson]   = useState(
    JSON.stringify([
      { device_name: "pgw_c_et1a", fcp_id: 1 },
      { device_name: "pgw_c_et1b", fcp_id: 1 },
    ], null, 2)
  );
  const [jsonError,   setJsonError]   = useState("");

  // ── Job / poll state ──────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false);
  const [jobId,       setJobId]       = useState(null);
  const [jobStatus,   setJobStatus]   = useState(null);
  const [pollCount,   setPollCount]   = useState(0);
  const [polling,     setPolling]     = useState(false);
  const [retryInfo,   setRetryInfo]   = useState("");
  const pollRef = useRef(null);

  // ── Result state ──────────────────────────────────────────────────────────────
  const [result,        setResult]        = useState(null);
  const [jobError,      setJobError]      = useState(null);
  const [submitError,   setSubmitError]   = useState("");
  const [notFound,      setNotFound]      = useState([]);
  const [notConfigured, setNotConfigured] = useState([]);
  const [expandedHosts, setExpandedHosts] = useState({});

  useEffect(() => { setExpandedHosts({}); }, [result]);

  // ── Poll ──────────────────────────────────────────────────────────────────────
  const pollJob = useCallback(async (id) => {
    try {
      const res = await snocApi.get(`nornirps/fcp/job/${id}/`);
      const d   = res.data;
      setJobStatus(d.status);
      if (d.status === "pending" && d.error && d.error.includes("Retry")) {
        setRetryInfo(d.error);
      } else {
        setRetryInfo("");
      }
      setPollCount((c) => {
        const next = c + 1;
        if (next >= POLL_MAX_COUNT) {
          setJobError("Đã poll quá thời gian tối đa.");
          setPolling(false);
          clearInterval(pollRef.current);
        }
        return next;
      });
      if (d.status === "done") {
        setResult(d.result || null);
        setPolling(false);
        clearInterval(pollRef.current);
      } else if (["failed", "locked", "cancelled"].includes(d.status)) {
        setJobError(d.error || `Job ${d.status}`);
        setPolling(false);
        clearInterval(pollRef.current);
      }
    } catch (e) {
      setJobError(e?.response?.data?.error || e.message);
      setPolling(false);
      clearInterval(pollRef.current);
    }
  }, []);

  const startPolling = useCallback((id) => {
    clearInterval(pollRef.current);
    setPolling(true);
    setPollCount(0);
    pollJob(id);
    pollRef.current = setInterval(() => pollJob(id), POLL_INTERVAL);
  }, [pollJob]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  // ── Submit trigger ─────────────────────────────────────────────────────────────
  const handleRun = async () => {
    setJsonError("");
    let items;
    try {
      items = JSON.parse(itemsJson);
      if (!Array.isArray(items) || !items.length) throw new Error("items phải là array không rỗng");
    } catch (e) {
      setJsonError(`JSON không hợp lệ: ${e.message}`);
      return;
    }

    setSubmitError("");
    setResult(null);
    setJobError(null);
    setJobId(null);
    setJobStatus(null);
    setRetryInfo("");
    setNotFound([]);
    setNotConfigured([]);
    setExpandedHosts({});

    setSubmitting(true);
    try {
      const res = await snocApi.post("nornirps/fcp/trigger/", {
        items,
        ...(webhookUrl.trim() ? { webhook_url: webhookUrl.trim() } : {}),
      });
      const { job_id, not_found = [], not_configured = [] } = res.data;
      setJobId(job_id);
      setNotFound(not_found);
      setNotConfigured(not_configured);
      setJobStatus("pending");
      startPolling(job_id);
    } catch (err) {
      const code = err?.response?.status;
      const msg  = err?.response?.data?.error || err?.response?.data?.detail || err.message;
      if (code === 429) {
        const ra = err?.response?.data?.retry_after;
        setSubmitError(`⏳ Rate limit — thử lại sau ${ra || 60}s`);
      } else if (code === 403) {
        setSubmitError(`🔒 ${msg}`);
      } else {
        setSubmitError(`❌ ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Poll job id thủ công ───────────────────────────────────────────────────────
  const handlePollManual = () => {
    const id = jobIdInput.trim();
    if (!id) return;
    setJobId(id);
    setResult(null);
    setJobError(null);
    setJobStatus(null);
    setRetryInfo("");
    setExpandedHosts({});
    startPolling(id);
  };

  const handleStopPoll = () => {
    clearInterval(pollRef.current);
    setPolling(false);
  };

  const handleRetryPoll = () => {
    if (jobId) {
      setJobError(null);
      startPolling(jobId);
    }
  };

  // ── Expand/Collapse ───────────────────────────────────────────────────────────
  const results = result?.results || [];
  const expandAll    = () => {
    const all = {};
    results.forEach((r) => { all[`${r.hostname}-${r.fcp_id}`] = true; });
    setExpandedHosts(all);
  };
  const collapseAll  = () => setExpandedHosts({});
  const toggleExpand = (key) => setExpandedHosts((p) => ({ ...p, [key]: !p[key] }));

  // ── Export Excel ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!result) return;
    const rows = [];
    results.forEach((r) => {
      (r.ketquaprecheck || []).forEach((grp) => {
        (grp.congviecchitiet || []).forEach((task) => {
          rows.push({
            "Hostname":        r.hostname,
            "IP":              r.ip,
            "Platform":        r.platform || "",
            "Mã lỗi (id)":    r.fcp_id || "",
            "Tên mã lỗi":     r.ten_ma_loi || "",
            "Nhóm":           grp.tennhom || "",
            "Tên kiểm tra":   task.tencongviecchitiet || "",
            "Câu lệnh":       task.caulenh,
            "Tiêu chí":       task.tieuchidanhgia || "",
            "Kết quả":        task.ketqua,
            "Chi tiết lỗi":   task.chitietloi || "",
            "Bắt đầu":        r.thoigianbatdauPrecheck,
            "Kết thúc":       r.thoigianketthucPrecheck,
          });
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FCP");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" }),
      `fcp_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const isRunning = submitting || polling;

  // ── RENDER ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />
      <div className="container-fluid px-3 py-3">

        {/* ── Control card ──────────────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa" }}>
            ⚡ Fault Code Precheck (FCP)
            <span className="text-muted fw-normal ms-2" style={{ fontSize: "0.8rem" }}>
              — Trigger từ external server, detect platform tự động
            </span>
          </Card.Header>
          <Card.Body>
            <Row className="g-2">
              {/* Items JSON */}
              <Col md={8}>
                <Form.Label className="small mb-1 fw-semibold">
                  Items (JSON array) — mỗi item: device_name, fcp_id (số nguyên)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={itemsJson}
                  onChange={(e) => setItemsJson(e.target.value)}
                  disabled={isRunning}
                  style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                />
                {jsonError && <div className="text-danger small mt-1">{jsonError}</div>}
              </Col>

              {/* Webhook + Actions */}
              <Col md={4}>
                <Form.Label className="small mb-1">Webhook URL (tùy chọn)</Form.Label>
                <Form.Control
                  size="sm"
                  type="url"
                  placeholder="https://..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={isRunning}
                  className="mb-2"
                />
                <div className="d-flex flex-column gap-2">
                  <Button
                    variant="danger"
                    onClick={handleRun}
                    disabled={isRunning}
                  >
                    {submitting
                      ? <><Spinner size="sm" animation="border" className="me-1"/>Đang gửi...</>
                      : polling
                      ? <><Spinner size="sm" animation="border" className="me-1"/>Đang poll...</>
                      : "▶ Trigger FCP"}
                  </Button>
                  {polling && (
                    <Button size="sm" variant="outline-secondary" onClick={handleStopPoll}>
                      ⏹ Dừng poll
                    </Button>
                  )}
                  {results.length > 0 && (
                    <div className="d-flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline-secondary" onClick={expandAll}>Mở tất cả</Button>
                      <Button size="sm" variant="outline-secondary" onClick={collapseAll}>Đóng tất cả</Button>
                      <Button size="sm" variant="outline-success"   onClick={handleExport}>⬇ Excel</Button>
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            {/* Poll by job id */}
            <hr className="my-2"/>
            <Row className="g-2 align-items-center">
              <Col md="auto">
                <span className="text-muted small fw-semibold">Poll Job ID:</span>
              </Col>
              <Col md={4}>
                <Form.Control
                  size="sm"
                  placeholder="Nhập Job ID để poll kết quả..."
                  value={jobIdInput}
                  onChange={(e) => setJobIdInput(e.target.value)}
                  disabled={polling}
                />
              </Col>
              <Col md="auto">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={handlePollManual}
                  disabled={!jobIdInput.trim() || polling}
                >
                  Poll
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ── Job info banner ────────────────────────────────────────────── */}
        {jobId && (
          <Card className="mb-3 border-0 shadow-sm"
            style={{ borderLeft: `4px solid ${STATUS_COLOR[jobStatus] || "#6c757d"}` }}>
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div style={{ fontSize: "0.83rem" }}>
                  <span className="text-muted me-2">Job ID:</span>
                  <code style={{ fontSize: "0.8rem", userSelect: "all" }}>{jobId}</code>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge style={{
                    background: STATUS_COLOR[jobStatus] || "#6c757d",
                    fontSize: "0.78rem", padding: "4px 10px",
                  }}>
                    {jobStatus === "pending" && "⏳ Đang chờ"}
                    {jobStatus === "running" && "⚙️ Đang chạy"}
                    {jobStatus === "done"    && "✅ Hoàn thành"}
                    {jobStatus === "failed"  && "❌ Lỗi"}
                    {jobStatus === "locked"  && "🔒 Device bận"}
                  </Badge>
                  {polling && (
                    <>
                      <Spinner size="sm" animation="border" style={{ color: "#0d6efd" }}/>
                      <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Poll #{pollCount}/{POLL_MAX_COUNT} (mỗi {POLL_INTERVAL / 1000}s)
                      </span>
                    </>
                  )}
                  {retryInfo && (
                    <span style={{ fontSize: "0.72rem", color: "#fd7e14" }}>
                      ⏳ {retryInfo}
                    </span>
                  )}
                  {["failed", "locked"].includes(jobStatus) && !polling && (
                    <Button size="sm" variant="outline-warning" onClick={handleRetryPoll}
                      style={{ fontSize: "0.75rem" }}>
                      🔄 Poll lại
                    </Button>
                  )}
                </div>
              </div>
              {(notFound.length > 0 || notConfigured.length > 0) && (
                <div className="mt-1" style={{ fontSize: "0.77rem" }}>
                  {notFound.length > 0 && (
                    <span className="text-danger me-3">
                      ❌ Không tìm thấy: {notFound.join(", ")}
                    </span>
                  )}
                  {notConfigured.length > 0 && (
                    <span className="text-warning">
                      ⚠ Chưa cấu hình: {notConfigured.map(n => `${n.device}(fcp_id=${n.fcp_id})`).join(", ")}
                    </span>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* ── Errors ───────────────────────────────────────────────────────── */}
        {submitError && (
          <Alert variant="danger" dismissible onClose={() => setSubmitError("")}>{submitError}</Alert>
        )}
        {jobError && (
          <Alert variant="warning" dismissible onClose={() => setJobError(null)}>
            <strong>Job error:</strong> {jobError}
          </Alert>
        )}

        {/* ── Polling placeholder ───────────────────────────────────────────── */}
        {(submitting || (polling && !result)) && (
          <Card body className="text-center py-5 shadow-sm mb-3">
            <Spinner animation="border" variant="danger" className="mb-2"/>
            <div className="text-muted small">
              {submitting ? "Đang gửi FCP request..." : `Đang poll kết quả (lần ${pollCount})...`}
            </div>
            {jobId && !submitting && (
              <div className="mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
                GET <code>{`nornirps/fcp/job/${jobId}/`}</code>
              </div>
            )}
          </Card>
        )}

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {result && <SummaryBar summary={result.summary}/>}

        {/* ── Results table ────────────────────────────────────────────────── */}
        {results.length > 0 && (
          <Card className="shadow-sm mb-3">
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0" style={{ tableLayout: "fixed" }}>
                <thead style={{ background: "#343a40", color: "white", fontSize: "0.8rem" }}>
                  <tr>
                    <th style={{ width: 36 }}/>
                    <th style={{ width: 150 }}>Hostname</th>
                    <th style={{ width: 60  }}>Mã lỗi</th>
                    <th>Tên mã lỗi</th>
                    <th style={{ width: 150 }}>Platform</th>
                    <th style={{ width: 80, textAlign: "center" }}>Kết quả</th>
                    <th style={{ width: 80, textAlign: "center" }}>Nhóm Pass</th>
                    <th>Thời gian</th>
                    <th style={{ width: 70, textAlign: "center" }}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const rowKey    = `${r.hostname}-${r.fcp_id}`;
                    const isOpen    = !!expandedHosts[rowKey];
                    const overallOk = r.statusCode === 200;
                    const groups    = r.ketquaprecheck || [];
                    const okGroups  = groups.filter(
                      (g) => calcGroupStatus(g.congviecchitiet) === "OK"
                    ).length;

                    return (
                      <React.Fragment key={rowKey}>
                        <tr
                          style={{ cursor: "pointer", background: isOpen ? "#fff3e0" : "white" }}
                          onClick={() => toggleExpand(rowKey)}
                        >
                          <td className="text-center" style={{ fontSize: "0.7rem" }}>
                            {isOpen ? "▼" : "▶"}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: "0.83rem" }}>{r.hostname}</td>
                          <td>
                            <code style={{ background: "#f1f3f5", padding: "1px 5px",
                              borderRadius: 3, fontSize: "0.75rem" }}>
                              {r.fcp_id ?? "—"}
                            </code>
                          </td>
                          <td style={{ fontSize: "0.79rem", color: "#495057" }}>
                            {r.ten_ma_loi || "—"}
                          </td>
                          <td style={{ fontSize: "0.76rem", color: "#6c757d" }}>
                            {r.platform || "—"}
                          </td>
                          <td className="text-center">
                            <Badge bg={overallOk ? "success" : "danger"} style={{ fontSize: "0.75rem" }}>
                              {overallOk ? "✓ OK" : "✗ NOK"}
                            </Badge>
                          </td>
                          <td className="text-center" style={{ fontSize: "0.8rem" }}>
                            <span style={{
                              color: okGroups === groups.length ? "#198754" : "#dc3545",
                              fontWeight: 600,
                            }}>
                              {okGroups}/{groups.length}
                            </span>
                            <div className="d-flex flex-wrap gap-1 justify-content-center mt-1">
                              {groups.map((g, i) => (
                                <GroupDot key={i} status={calcGroupStatus(g.congviecchitiet)} />
                              ))}
                            </div>
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "#6c757d" }}>
                            {fmtTime(r.thoigianbatdauPrecheck)} → {fmtTime(r.thoigianketthucPrecheck)}
                          </td>
                          <td className="text-center">
                            {r.result_file_url ? (
                              <a
                                href={r.result_file_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontSize: "0.78rem" }}
                              >
                                📄 Xem
                              </a>
                            ) : "—"}
                          </td>
                        </tr>

                        {/* Detail collapse */}
                        <tr style={{ background: "#f8f9fa" }}>
                          <td colSpan={9} style={{ padding: 0, border: 0 }}>
                            <Collapse in={isOpen}>
                              <div>
                                <div style={{
                                  margin: "0 8px 8px 36px",
                                  borderLeft: "4px solid #fd7e14",
                                  borderRadius: "0 4px 4px 0",
                                }}>
                                  <Table bordered size="sm" className="mb-0" style={{ background: "white" }}>
                                    <thead>
                                      <tr style={{ background: "#e9ecef", fontSize: "0.76rem" }}>
                                        <th style={{ width: 130 }}>Nhóm</th>
                                        <th>Tên kiểm tra</th>
                                        <th style={{ minWidth: 160 }}>Câu lệnh</th>
                                        <th style={{ minWidth: 140 }}>Tiêu chí</th>
                                        <th style={{ width: 66, textAlign: "center" }}>KQ</th>
                                        <th>Chi tiết lỗi</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {groups.map((grp, gi) => {
                                        const color = GROUP_COLORS[gi % GROUP_COLORS.length];
                                        const tasks = grp.congviecchitiet || [];
                                        return tasks.map((task, ti) => {
                                          const kqS = KQ_STYLE[task.ketqua] || KQ_DEFAULT;
                                          return (
                                            <tr key={`${gi}-${ti}`}>
                                              {ti === 0 && (
                                                <td rowSpan={tasks.length} style={{
                                                  background: color + "18",
                                                  fontWeight: "bold",
                                                  fontSize: "0.77rem",
                                                  borderLeft: `3px solid ${color}`,
                                                  verticalAlign: "middle",
                                                  paddingLeft: 8,
                                                }}>
                                                  <GroupDot status={calcGroupStatus(tasks)} />
                                                  <span className="ms-1">
                                                    {grp.tennhom || `Nhóm ${grp.idnhomcongviec}`}
                                                  </span>
                                                </td>
                                              )}
                                              <td style={{ fontSize: "0.79rem" }}>
                                                {task.tencongviecchitiet || "—"}
                                              </td>
                                              <td>
                                                <code style={{
                                                  background: "#f1f3f5", padding: "1px 5px",
                                                  borderRadius: 3, fontSize: "0.72rem",
                                                  wordBreak: "break-all", color: "#495057",
                                                }}>
                                                  {task.caulenh || "—"}
                                                </code>
                                              </td>
                                              <td style={{
                                                fontSize: "0.77rem", color: "#0d6efd",
                                                fontStyle: "italic",
                                              }}>
                                                {task.tieuchidanhgia || "—"}
                                              </td>
                                              <td style={{
                                                textAlign: "center",
                                                background: kqS.bg,
                                                color: kqS.color,
                                                fontWeight: "bold",
                                                fontSize: "0.84rem",
                                              }}>
                                                {kqS.icon}
                                              </td>
                                              <td style={{
                                                fontSize: "0.77rem",
                                                color: task.ketqua === "NOK" ? "#dc3545" : "#6c757d",
                                              }}>
                                                {task.chitietloi || "—"}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })}
                                    </tbody>
                                  </Table>
                                </div>
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {result && results.length === 0 && (
          <Card body className="text-center text-muted py-4">
            Không có kết quả — kiểm tra lại danh sách items
          </Card>
        )}
      </div>
    </>
  );
};

export default FaultPrecheckExternal;
