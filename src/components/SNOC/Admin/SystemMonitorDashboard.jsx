// src/pages/Admin/SystemMonitorDashboard.jsx  — FILE MỚI
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal,
  OverlayTrigger, Row, Spinner, Table, Tooltip,
} from "react-bootstrap";
import snocApi from "../../api/snocApiWithAutoToken";
import { getJwtClaims } from "../../api/snocApiWithAutoToken";

// ── Constants ──────────────────────────────────────────────────────────────
const WS_BASE = process.env.REACT_APP_WS_URL || "ws://localhost:8000";

const STATUS_CFG = {
  pending:   { bg: "#6c757d", icon: "⏳", label: "Pending"   },
  running:   { bg: "#0d6efd", icon: "⚙️", label: "Running"   },
  done:      { bg: "#198754", icon: "✅", label: "Done"       },
  failed:    { bg: "#dc3545", icon: "❌", label: "Failed"     },
  locked:    { bg: "#fd7e14", icon: "🔒", label: "Locked"     },
  cancelled: { bg: "#adb5bd", icon: "🚫", label: "Cancelled" },
};

const MODULE_CFG = {
  precheck:    { color: "#0d6efd", icon: "🔍" },
  healthcheck: { color: "#198754", icon: "❤️" },
  dhtt:        { color: "#fd7e14", icon: "🔧" },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtSeconds = (s) => {
  if (!s || s < 0) return "—";
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

const StatusBadge = ({ status, size = "sm" }) => {
  const c = STATUS_CFG[status] || { bg: "#6c757d", icon: "?", label: status };
  return (
    <span style={{
      background: c.bg, color: "white",
      padding: size === "sm" ? "2px 8px" : "4px 12px",
      borderRadius: 20, fontSize: size === "sm" ? "0.72rem" : "0.82rem",
      fontWeight: 500, whiteSpace: "nowrap",
    }}>
      {c.icon} {c.label}
    </span>
  );
};

// ── Hook: WebSocket monitor ────────────────────────────────────────────────
function useMonitorWS(token, onSnapshot, onJobDone) {
  const wsRef    = useRef(null);
  const timerRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(`${WS_BASE}/ws/monitor/?token=${token}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "snapshot")  onSnapshot(msg.data, msg.trigger);
        if (msg.type === "job.done")  onJobDone(msg.job_id);
      } catch (_) {}
    };

    ws.onclose = () => {
      // Auto-reconnect sau 5s
      timerRef.current = setTimeout(connect, 5000);
    };

    wsRef.current = ws;
  }, [token, onSnapshot, onJobDone]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const refresh = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "refresh" }));
    }
  };

  const readyState = wsRef.current?.readyState;
  return { refresh, readyState };
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
const SystemMonitorDashboard = () => {
  const claims = getJwtClaims();
  const token  = sessionStorage.getItem("access_token") || "";

  const [data,      setData]      = useState(null);
  const [lastUpdate,setLastUpdate]= useState(null);
  const [trigger,   setTrigger]   = useState("");
  const [loading,   setLoading]   = useState(false);

  // Lock modal
  const [showReleaseAll, setShowReleaseAll] = useState(false);
  const [releasing,      setReleasing]      = useState(false);

  // Job filter
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterModule,  setFilterModule]  = useState("all");
  const [showJobDetail, setShowJobDetail] = useState(null);

  const onSnapshot = useCallback((snap, trig = "") => {
    setData(snap);
    setLastUpdate(new Date());
    if (trig) setTrigger(trig);
  }, []);

  const onJobDone = useCallback((jobId) => {
    setTrigger(`Job ${jobId?.slice(0, 8)}... completed`);
  }, []);

  const { refresh, readyState } = useMonitorWS(token, onSnapshot, onJobDone);

  // Fallback REST nếu WS chưa connect
  const fetchREST = async () => {
    setLoading(true);
    try {
      const res = await snocApi.get("nornirps/monitor/status/");
      setData(res.data);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchREST(); }, []); // eslint-disable-line

  // ── Actions ──────────────────────────────────────────────────────────────
  const releaseLock = async (node) => {
    await snocApi.post("nornirps/monitor/lock/release/", { node });
    refresh();
  };

  const releaseAllLocks = async () => {
    setReleasing(true);
    try {
      await snocApi.delete("nornirps/monitor/lock/release/");
      setShowReleaseAll(false);
      refresh();
    } finally { setReleasing(false); }
  };

  const cancelJob = async (jobId) => {
    try {
      await snocApi.delete(`nornirps/monitor/job/${jobId}/cancel/`);
      refresh();
    } catch (e) {
      alert(e?.response?.data?.error || "Không thể cancel job này.");
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const locks  = data?.locks?.nodes || [];
  const allJobs = data?.queue?.jobs  || [];
  const qcount = data?.queue?.counts || {};
  const cacheInfo = data?.cache || {};

  const filteredJobs = allJobs.filter((j) => {
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    if (filterModule !== "all" && j.module !== filterModule) return false;
    return true;
  });

  const wsConnected = readyState === WebSocket.OPEN;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid px-3 py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-semibold mb-0">🖥️ System Monitor</h5>
          <small className="text-muted">
            {wsConnected
              ? <><span className="text-success">●</span> Live (WS)</>
              : <><span className="text-warning">●</span> Connecting...</>}
            {lastUpdate && <> · Cập nhật: {lastUpdate.toLocaleTimeString("vi-VN")}</>}
            {trigger && <> · <em>{trigger}</em></>}
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary"
            onClick={() => { fetchREST(); refresh(); }} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border"/> : "🔄 Refresh"}
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <Row className="g-3 mb-3">
        {[
          { label: "Devices bị lock", value: locks.length, color: locks.length > 0 ? "#dc3545" : "#198754", icon: "🔒" },
          { label: "Jobs Pending",    value: qcount.pending  || 0, color: "#6c757d", icon: "⏳" },
          { label: "Jobs Running",    value: qcount.running  || 0, color: "#0d6efd", icon: "⚙️" },
          { label: "Jobs Done (cache)",value: qcount.done    || 0, color: "#198754", icon: "✅" },
          { label: "Jobs Failed",     value: (qcount.failed  || 0) + (qcount.locked || 0),
            color: "#dc3545", icon: "❌" },
          { label: "Redis Memory",    value: cacheInfo.used_memory_human || "N/A",
            color: "#6f42c1", icon: "💾" },
        ].map((k) => (
          <Col xs={6} md={2} key={k.label}>
            <Card className="shadow-sm h-100 text-center"
              style={{ borderTop: `3px solid ${k.color}` }}>
              <Card.Body className="py-2 px-2">
                <div style={{ fontSize: "1.6rem" }}>{k.icon}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: k.color }}>
                  {k.value}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#6c757d" }}>{k.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        {/* ── LOCK PANEL ─────────────────────────────────────────────── */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="py-2 d-flex justify-content-between align-items-center"
              style={{ background: "#fff3cd", fontSize: "0.88rem" }}>
              <span className="fw-semibold">🔒 Device Locks ({locks.length})</span>
              {locks.length > 0 && (
                <Button size="sm" variant="danger"
                  style={{ fontSize: "0.72rem" }}
                  onClick={() => setShowReleaseAll(true)}>
                  Release All
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-0"
              style={{ maxHeight: 380, overflowY: "auto" }}>
              {locks.length === 0 ? (
                <div className="text-center text-success py-4" style={{ fontSize: "0.88rem" }}>
                  ✅ Không có device nào đang bị lock
                </div>
              ) : (
                <Table size="sm" className="mb-0 align-middle">
                  <thead style={{ background: "#f8f9fa", position: "sticky", top: 0 }}>
                    <tr style={{ fontSize: "0.78rem" }}>
                      <th>Device</th>
                      <th style={{ textAlign: "center" }}>TTL</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locks.map((lk) => {
                      const node = lk.key?.replace("hc:node:", "") || lk.key;
                      return (
                        <tr key={lk.key} style={{ fontSize: "0.8rem" }}>
                          <td>
                            <code style={{ fontSize: "0.78rem" }}>{node}</code>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Badge bg={lk.ttl_seconds > 300 ? "secondary" : "warning"}
                              text="dark" style={{ fontSize: "0.7rem" }}>
                              {fmtSeconds(lk.ttl_seconds)}
                            </Badge>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <OverlayTrigger overlay={<Tooltip>Force release lock này</Tooltip>}>
                              <Button size="sm" variant="outline-danger"
                                style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                                onClick={() => releaseLock(node)}>
                                🔓
                              </Button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ── CACHE PANEL ────────────────────────────────────────────── */}
        <Col lg={2}>
          <Card className="shadow-sm h-100">
            <Card.Header className="py-2 fw-semibold"
              style={{ background: "#f0e6ff", fontSize: "0.88rem" }}>
              💾 Redis Cache
            </Card.Header>
            <Card.Body style={{ fontSize: "0.82rem" }}>
              {!cacheInfo.available ? (
                <div className="text-danger">Redis không khả dụng</div>
              ) : (
                <>
                  {[
                    ["Version",  cacheInfo.redis_version],
                    ["Memory",   cacheInfo.used_memory_human],
                    ["Max Mem",  cacheInfo.maxmemory_human],
                    ["Clients",  cacheInfo.connected_clients],
                    ["Keys",     cacheInfo.total_keys],
                    ["Uptime",   `${cacheInfo.uptime_days}d`],
                  ].map(([label, val]) => (
                    <div key={label} className="d-flex justify-content-between mb-2"
                      style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 3 }}>
                      <span className="text-muted">{label}</span>
                      <span className="fw-semibold">{val || "—"}</span>
                    </div>
                  ))}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ── QUEUE PANEL ────────────────────────────────────────────── */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="py-2"
              style={{ background: "#e8f4fd", fontSize: "0.88rem" }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="fw-semibold">
                  📋 Job Queue ({filteredJobs.length}/{allJobs.length})
                </span>
                <div className="d-flex gap-2">
                  <Form.Select size="sm" style={{ width: 120, fontSize: "0.78rem" }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {Object.keys(STATUS_CFG).map((s) => (
                      <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                    ))}
                  </Form.Select>
                  <Form.Select size="sm" style={{ width: 120, fontSize: "0.78rem" }}
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}>
                    <option value="all">All Module</option>
                    {Object.keys(MODULE_CFG).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0"
              style={{ maxHeight: 380, overflowY: "auto" }}>
              {filteredJobs.length === 0 ? (
                <div className="text-center text-muted py-4" style={{ fontSize: "0.88rem" }}>
                  Không có job nào
                </div>
              ) : (
                <Table size="sm" className="mb-0 align-middle" style={{ fontSize: "0.78rem" }}>
                  <thead style={{ background: "#f8f9fa", position: "sticky", top: 0 }}>
                    <tr>
                      <th>Job ID</th>
                      <th>Module</th>
                      <th>Platform</th>
                      <th>Nodes</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => {
                      const mc = MODULE_CFG[job.module] || { color: "#6c757d", icon: "?" };
                      return (
                        <tr key={job.job_id}>
                          <td>
                            <Button variant="link" size="sm" className="p-0"
                              style={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                              onClick={() => setShowJobDetail(job)}>
                              {job.job_id?.slice(0, 8)}...
                            </Button>
                          </td>
                          <td>
                            <span style={{ color: mc.color, fontWeight: 600 }}>
                              {mc.icon} {job.module || "—"}
                            </span>
                          </td>
                          <td><code style={{ fontSize: "0.72rem" }}>{job.platform || "—"}</code></td>
                          <td>
                            <Badge bg="light" text="dark" className="border">
                              {(job.nodes || []).length}
                            </Badge>
                          </td>
                          <td><StatusBadge status={job.status} /></td>
                          <td style={{ textAlign: "center" }}>
                            {["pending"].includes(job.status) && (
                              <Button size="sm" variant="outline-danger"
                                style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                                onClick={() => cancelJob(job.job_id)}>
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Release All Locks Modal ───────────────────────────────────────── */}
      <Modal show={showReleaseAll} onHide={() => setShowReleaseAll(false)} size="sm">
        <Modal.Header closeButton><Modal.Title>Xác nhận</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>Giải phóng <strong>tất cả {locks.length} locks</strong>?</p>
          <p className="text-danger mb-0" style={{ fontSize: "0.82rem" }}>
            ⚠ Thao tác này cho phép các operation đang bị block chạy lại ngay.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReleaseAll(false)}>Hủy</Button>
          <Button variant="danger" onClick={releaseAllLocks} disabled={releasing}>
            {releasing ? <Spinner size="sm" animation="border"/> : "Release All"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Job Detail Modal ─────────────────────────────────────────────── */}
      <Modal show={!!showJobDetail} onHide={() => setShowJobDetail(null)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>
            Job: <code>{showJobDetail?.job_id?.slice(0, 8)}...</code>
            {" "}<StatusBadge status={showJobDetail?.status} size="normal"/>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "0.82rem" }}>
          {showJobDetail && (
            <>
              {[
                ["Module",   showJobDetail.module],
                ["Platform", showJobDetail.platform],
                ["Nodes",    (showJobDetail.nodes || []).join(", ") || "—"],
                ["User ID",  showJobDetail.user_id || "—"],
                ["Caller IP",showJobDetail.caller_ip || "—"],
                ["Service",  showJobDetail.svc_name || "—"],
                ["Error",    showJobDetail.error || "—"],
              ].map(([label, val]) => val && val !== "—" ? (
                <div key={label} className="mb-2">
                  <span className="text-muted fw-semibold">{label}: </span>
                  <span>{val}</span>
                </div>
              ) : null)}
              {showJobDetail.result && (
                <details className="mt-2">
                  <summary className="text-primary" style={{ cursor: "pointer" }}>
                    Kết quả chi tiết
                  </summary>
                  <pre style={{ fontSize: "0.72rem", maxHeight: 200, overflow: "auto",
                    background: "#f8f9fa", padding: 8, borderRadius: 4, marginTop: 6 }}>
                    {JSON.stringify(showJobDetail.result?.summary, null, 2)}
                  </pre>
                </details>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {showJobDetail?.status === "pending" && (
            <Button variant="danger" size="sm"
              onClick={() => { cancelJob(showJobDetail.job_id); setShowJobDetail(null); }}>
              Cancel Job
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowJobDetail(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SystemMonitorDashboard;
