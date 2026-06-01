// pages/Healthcheck/HealthcheckExternal.jsx
// Test Healthcheck External API — POST 202 job_id → poll GET → kết quả HC
import { saveAs } from "file-saver";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert, Badge, Button, Card, Col, Collapse,
    Form, ProgressBar, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import * as XLSX from "xlsx";

import snocApi from "../../../api/snocApiWithAutoToken";
import { SERVER_MEDIA } from "../../../config/constant";
import {
    fetchDevicesByPlatform,
    fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── Constants ─────────────────────────────────────────────────────────────────
const POLL_INTERVAL  = 10000;   // ms
const POLL_MAX_COUNT = 130;     // ~21 phút (4 retry × 5ph + buffer)

const KQ_STYLE = {
  OK:  { bg: "#198754", color: "white", icon: "✓" },
  NOK: { bg: "#dc3545", color: "white", icon: "✗" },
};
const KQ_DEFAULT = { bg: "#e9ecef", color: "#6c757d", icon: "—" };
const GROUP_COLORS = [
  "#0d6efd","#dc3545","#fd7e14","#6610f2",
  "#198754","#0dcaf0","#6c757d","#20c997","#d63384",
];
const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const STATUS_COLOR = {
  pending:  "#6c757d",
  running:  "#0d6efd",
  done:     "#198754",
  failed:   "#dc3545",
  locked:   "#fd7e14",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Shared sub-components (giống PrecheckManual) ─────────────────────────────
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
          <Badge bg="secondary" pill>{total} node</Badge>
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

// ── Main Component ────────────────────────────────────────────────────────────
const HealthcheckExternal = () => {
  const dispatch = useDispatch();

  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});

  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedDevices,  setSelectedDevices]  = useState([]);
  const [webhookUrl,       setWebhookUrl]       = useState("");
  const isEditingRef = useRef(false);

  // ── Job / poll state ────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false);
  const [jobId,       setJobId]       = useState(null);
  const [pollUrl,     setPollUrl]     = useState("");
  const [jobStatus,   setJobStatus]   = useState(null);   // pending/running/done/failed/locked
  const [pollCount,   setPollCount]   = useState(0);
  const [polling,     setPolling]     = useState(false);
  const [retryInfo,   setRetryInfo]   = useState("");    // "Retry 2/4 sau 300s" 
  const pollRef = useRef(null);

  // ── Result state ────────────────────────────────────────────────────────────
  const [result,       setResult]       = useState(null);
  const [jobError,     setJobError]     = useState(null);
  const [submitError,  setSubmitError]  = useState("");
  const [notFound,     setNotFound]     = useState([]);
  const [blocked,      setBlocked]      = useState([]);
  const [expandedHosts,setExpandedHosts]= useState({});

  // ── Fetch platforms on mount ─────────────────────────────────────────────
  useEffect(() => { dispatch(fetchPlatforms()); }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatform?.value;
    if (val) {
      dispatch(fetchDevicesByPlatform(val));
    }
    if (!isEditingRef.current) setSelectedDevices([]);
    isEditingRef.current = false;
  }, [dispatch, selectedPlatform]);

  useEffect(() => { setExpandedHosts({}); }, [result]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const platformOptions = useMemo(
    () => platforms.map((p) => ({ label: `${p.name} (${p.device_count ?? 0})`, value: p.name })),
    [platforms]
  );
  const deviceOptions = useMemo(
    () => devices.map((d) => ({ label: `${d.name} (${d.ip || "—"})`, value: d.name })),
    [devices]
  );
  const combinedOptions = useMemo(
    () => [{ label: "— Chọn tất cả —", value: "__all__" }, ...deviceOptions],
    [deviceOptions]
  );

  const handleDeviceChange = (sel) => {
    if (!sel) return setSelectedDevices([]);
    setSelectedDevices(sel.find((o) => o.value === "__all__") ? deviceOptions : sel);
  };

  // ── Poll job ────────────────────────────────────────────────────────────────
  const pollJob = useCallback(async (id) => {
    try {
      const res = await snocApi.get(`nornirps/healthcheck/job/${id}/`);
      const d   = res.data;
      setJobStatus(d.status);
      // Hiển thị retry info khi đang pending
      if (d.status === "pending" && d.error && d.error.includes("Retry")) {
        setRetryInfo(d.error);
      } else {
        setRetryInfo("");
      }
      setPollCount((c) => {
        const next = c + 1;
        // Dừng poll nếu quá POLL_MAX_COUNT lần
        if (next >= POLL_MAX_COUNT) {
          setJobError("Đã poll quá thời gian tối đa. Job có thể vẫn đang retry.");
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
      // status="pending" với error "Retry N/M" → vẫn poll, hiển thị retry info
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
    pollJob(id); // poll ngay
    pollRef.current = setInterval(() => pollJob(id), POLL_INTERVAL);
  }, [pollJob]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!selectedDevices.length) return alert("Vui lòng chọn ít nhất 1 thiết bị");

    setSubmitError("");
    setResult(null);
    setJobError(null);
    setJobId(null);
    setPollUrl("");
    setJobStatus(null);
    setNotFound([]);
    setBlocked([]);
    setExpandedHosts({});

    const node_names = selectedDevices.map((d) => d.value);

    setSubmitting(true);
    try {
      const res = await snocApi.post("nornirps/healthcheck/external/", {
        node_names,
        ...(webhookUrl.trim() ? { webhook_url: webhookUrl.trim() } : {}),
      });

      const { job_id, poll_url, not_found = [], blocked: blk = [] } = res.data;
      setJobId(job_id);
      setPollUrl(poll_url || "");
      setNotFound(not_found);
      setBlocked(blk);
      setJobStatus("pending");
      startPolling(job_id);
    } catch (err) {
      const code = err?.response?.status;
      const msg  = err?.response?.data?.error
                || err?.response?.data?.detail
                || err.message;
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

  // ── Expand/Collapse ─────────────────────────────────────────────────────────
  const results = result?.results || [];   // HC: { host, ip, status, notes, result_file, starttime, endtime }
  const expandAll   = () => {
    const all = {};
    results.forEach((r) => { all[r.host || r.hostname] = true; });
    setExpandedHosts(all);
  };
  const collapseAll  = () => setExpandedHosts({});
  const toggleExpand = (key) =>
    setExpandedHosts((p) => ({ ...p, [key]: !p[key] }));

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!result) return;
    const rows = (result.results || []).map((r) => ({
      "Host":        r.host || r.hostname || "",
      "IP":          r.ip   || "",
      "Platform":    r.platform || "",
      "Trạng thái":  r.status || "",
      "Ghi chú":     r.notes  || "",
      "Bắt đầu":     r.starttime || "",
      "Kết thúc":    r.endtime   || "",
      "File kết quả": r.result_file || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Healthcheck");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" }),
      `healthcheck_external_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const isRunning = submitting || polling;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />
      <div className="container-fluid px-3 py-3">

        {/* ── Control card ───────────────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa" }}>
            ❤️ Healthcheck External API
            <span className="text-muted fw-normal ms-2" style={{ fontSize: "0.8rem" }}>
              (Async — tự detect platform, kết quả cập nhật dashboard realtime)
            </span>
          </Card.Header>
          <Card.Body>
            <Row className="g-2 align-items-end">
              {/* Platform (tuỳ chọn, để filter device list) */}
              <Col md={3}>
                <Form.Label className="small mb-1">
                  Platform{" "}
                  <span className="text-muted fw-normal">(tùy chọn — lọc device)</span>
                </Form.Label>
                <Select
                  options={platformOptions}
                  value={selectedPlatform}
                  onChange={(v) => { isEditingRef.current = false; setSelectedPlatform(v); }}
                  placeholder="Chọn platform để lọc..."
                  isClearable
                  styles={SELECT_STYLES}
                />
              </Col>

              {/* Device multi-select */}
              <Col md={5}>
                <Form.Label className="small mb-1">
                  Thiết bị{" "}
                  {loadingDevices && <Spinner size="sm" animation="border" className="ms-1"/>}
                  <span className="text-muted fw-normal">
                    {" "}(không chọn platform = nhập tên thủ công)
                  </span>
                </Form.Label>
                {selectedPlatform ? (
                  <Select
                    isMulti
                    options={combinedOptions}
                    value={selectedDevices}
                    onChange={handleDeviceChange}
                    placeholder="Chọn thiết bị..."
                    isDisabled={loadingDevices || isRunning}
                    styles={SELECT_STYLES}
                    closeMenuOnSelect={false}
                  />
                ) : (
                  // Nhập tay khi không chọn platform
                  <Form.Control
                    size="sm"
                    placeholder="pgw_c_et1a, mmeet1a, ... (cách nhau bởi dấu phẩy hoặc khoảng trắng)"
                    disabled={isRunning}
                    onBlur={(e) => {
                      const vals = e.target.value
                        .split(/[,\s]+/)
                        .map(n => n.trim().toLowerCase())
                        .filter(Boolean);
                      setSelectedDevices(vals.map(v => ({ label: v, value: v })));
                    }}
                  />
                )}
              </Col>

              {/* Webhook URL */}
              <Col md={2}>
                <Form.Label className="small mb-1">
                  Webhook URL <span className="text-muted fw-normal">(tùy chọn)</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="url"
                  placeholder="https://..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={isRunning}
                />
              </Col>

              {/* Actions */}
              <Col md="auto" className="d-flex gap-2 align-items-end">
                <Button
                  variant="primary"
                  onClick={handleRun}
                  disabled={isRunning || !selectedDevices.length}
                >
                  {submitting
                    ? <><Spinner size="sm" animation="border" className="me-1"/> Đang gửi...</>
                    : polling
                    ? <><Spinner size="sm" animation="border" className="me-1"/> Đang poll...</>
                    : "▶ Gửi Healthcheck"}
                </Button>
                {polling && (
                  <Button size="sm" variant="outline-secondary" onClick={handleStopPoll}>
                    ⏹ Dừng
                  </Button>
                )}
                {results.length > 0 && (
                  <>
                    <Button size="sm" variant="outline-secondary" onClick={expandAll}>Mở tất cả</Button>
                    <Button size="sm" variant="outline-secondary" onClick={collapseAll}>Đóng tất cả</Button>
                    <Button size="sm" variant="outline-success"   onClick={handleExport}>⬇ Excel</Button>
                  </>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ── Job info banner ─────────────────────────────────────────────── */}
        {jobId && (
          <Card className="mb-3 border-0 shadow-sm"
            style={{ borderLeft: `4px solid ${STATUS_COLOR[jobStatus] || "#6c757d"}` }}>
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div style={{ fontSize: "0.83rem" }}>
                  <span className="text-muted me-2">Job ID:</span>
                  <code style={{ fontSize: "0.8rem", userSelect: "all" }}>{jobId}</code>
                  {pollUrl && (
                    <span className="ms-3 text-muted" style={{ fontSize: "0.78rem" }}>
                      GET <code style={{ fontSize: "0.76rem" }}>{pollUrl}</code>
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge
                    style={{
                      background: STATUS_COLOR[jobStatus] || "#6c757d",
                      fontSize: "0.78rem", padding: "4px 10px",
                    }}
                  >
                    {jobStatus === "pending"  && "⏳ Đang chờ"}
                    {jobStatus === "running"  && "⚙️ Đang chạy"}
                    {jobStatus === "done"     && "✅ Hoàn thành"}
                    {jobStatus === "failed"   && "❌ Lỗi"}
                    {jobStatus === "locked"   && "🔒 Device bận"}
                  </Badge>
                  {polling && (
                    <>
                      <Spinner size="sm" animation="border" style={{ color: "#0d6efd" }} />
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
              {(notFound.length > 0 || blocked.length > 0) && (
                <div className="mt-1" style={{ fontSize: "0.77rem" }}>
                  {notFound.length > 0 && (
                    <span className="text-danger me-3">
                      ❌ Không tìm thấy: {notFound.join(", ")}
                    </span>
                  )}
                  {blocked.length > 0 && (
                    <span className="text-warning">
                      🔒 Ngoài quyền: {blocked.join(", ")}
                    </span>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* ── Errors ─────────────────────────────────────────────────────── */}
        {submitError && (
          <Alert variant="danger" dismissible onClose={() => setSubmitError("")}>
            {submitError}
          </Alert>
        )}
        {jobError && (
          <Alert variant="warning" dismissible onClose={() => setJobError(null)}>
            <strong>Job error:</strong> {jobError}
          </Alert>
        )}

        {/* ── Polling placeholder ─────────────────────────────────────────── */}
        {(submitting || (polling && !result)) && (
          <Card body className="text-center py-5 shadow-sm mb-3">
            <Spinner animation="border" variant="primary" className="mb-2"/>
            <div className="text-muted small">
              {submitting
                ? "Đang gửi request..."
                : `Đang poll kết quả (lần ${pollCount})...`}
            </div>
            {jobId && !submitting && (
              <div className="mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
                GET <code>{`nornirps/healthcheck/job/${jobId}/`}</code>
              </div>
            )}
          </Card>
        )}

        {/* ── Summary bar ─────────────────────────────────────────────────── */}
        {result && <SummaryBar summary={result.summary} />}

        {/* ── Results table (giống PrecheckManual) ────────────────────────── */}
        {results.length > 0 && (
          <Card className="shadow-sm mb-3">
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0" style={{ tableLayout: "fixed" }}>
                <thead style={{ background: "#343a40", color: "white", fontSize: "0.8rem" }}>
                  <tr>
                    <th style={{ width: 36 }}/>
                    <th style={{ width: 160 }}>Host</th>
                    <th style={{ width: 120 }}>IP</th>
                    <th style={{ width: 170 }}>Platform</th>
                    <th style={{ width: 90,  textAlign: "center" }}>Trạng thái</th>
                    <th>Ghi chú / Lỗi</th>
                    <th style={{ width: 150 }}>Thời gian</th>
                    <th style={{ width: 80,  textAlign: "center" }}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const host  = r.host || r.hostname || "";
                    const isOk  = r.status === "OK";
                    const isOpen = !!expandedHosts[host];

                    return (
                      <React.Fragment key={host}>
                        <tr
                          style={{
                            cursor: "pointer",
                            background: isOpen ? "#f0f4ff" : isOk ? "#f6fff8" : "#fff5f5",
                          }}
                          onClick={() => toggleExpand(host)}
                        >
                          <td className="text-center" style={{ fontSize: "0.7rem" }}>
                            {isOpen ? "▼" : "▶"}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: "0.83rem" }}>{host}</td>
                          <td style={{ fontSize: "0.8rem", color: "#495057" }}>{r.ip || "—"}</td>
                          <td style={{ fontSize: "0.76rem", color: "#6c757d" }}>{r.platform || "—"}</td>
                          <td className="text-center">
                            <Badge bg={isOk ? "success" : "danger"} style={{ fontSize: "0.75rem" }}>
                              {isOk ? "✓ OK" : "✗ NOK"}
                            </Badge>
                          </td>
                          <td style={{ fontSize: "0.8rem", color: isOk ? "#6c757d" : "#dc3545" }}>
                            {r.notes || "—"}
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "#6c757d" }}>
                            {fmtTime(r.starttime)} → {fmtTime(r.endtime)}
                          </td>
                          <td className="text-center">
                            {r.result_file ? (
                              <a
                                href={`${SERVER_MEDIA}${r.result_file}`}
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

                        {/* Detail collapse: info + [ALERT] lines */}
                        <tr style={{ background: "#f8f9fa" }}>
                          <td colSpan={8} style={{ padding: 0, border: 0 }}>
                            <Collapse in={isOpen}>
                              <div>
                                <div style={{
                                  margin: "0 8px 8px 36px",
                                  borderLeft: `4px solid ${isOk ? "#198754" : "#dc3545"}`,
                                  borderRadius: "0 4px 4px 0",
                                  background: "white",
                                  padding: "10px 14px",
                                  fontSize: "0.8rem",
                                }}>
                                  {/* Thông tin cơ bản */}
                                  <div className="d-flex flex-wrap gap-4 mb-2">
                                    {[
                                      ["IP",        r.ip],
                                      ["Platform",  r.platform],
                                      ["Bắt đầu",   fmtTime(r.starttime)],
                                      ["Kết thúc",  fmtTime(r.endtime)],
                                      ["Usecase",   r.usecase],
                                    ].map(([label, val]) => val ? (
                                      <div key={label}>
                                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{label}</div>
                                        <div className="fw-semibold">{val}</div>
                                      </div>
                                    ) : null)}
                                    {r.result_file && (
                                      <div>
                                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>File log</div>
                                        <a href={`${SERVER_MEDIA}${r.result_file}`}
                                          target="_blank" rel="noreferrer"
                                          style={{ fontSize: "0.8rem" }}>📄 Tải về</a>
                                      </div>
                                    )}
                                  </div>

                                  {/* [ALERT] lines */}
                                  {r.notes && (() => {
                                    const alerts = r.notes.split("\n").map(l => l.trim()).filter(Boolean);
                                    return (
                                      <div>
                                        <div className="fw-semibold mb-1" style={{ fontSize: "0.78rem", color: "#dc3545" }}>
                                          ⚠ {alerts.length} cảnh báo:
                                        </div>
                                        <div style={{ maxHeight: 260, overflowY: "auto",
                                          background: "#fff8f8", border: "1px solid #f5c6cb",
                                          borderRadius: 4, padding: "6px 10px" }}>
                                          {alerts.map((alert, ai) => (
                                            <div key={ai} style={{
                                              fontSize: "0.75rem",
                                              color: "#842029",
                                              borderBottom: ai < alerts.length-1 ? "1px solid #f5c6cb" : "none",
                                              padding: "3px 0",
                                              fontFamily: "Courier New, monospace",
                                            }}>
                                              {alert}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })()}
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

        {/* Empty state */}
        {result && results.length === 0 && (
          <Card body className="text-center text-muted py-4">
            Không có kết quả — kiểm tra lại danh sách thiết bị
          </Card>
        )}
      </div>
    </>
  );
};

export default HealthcheckExternal;
