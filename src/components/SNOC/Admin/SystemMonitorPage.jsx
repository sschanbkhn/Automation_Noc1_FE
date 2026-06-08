// src/views/admin/SystemMonitorPage.jsx  — v3 (final)
// Dùng đúng hook pattern + env var REACT_APP_SNOC_WS_URL
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { fetchHosts } from "../redux/Hosts/hostsSlice";
import {
  Badge, Button, Card, Col, Form, Modal,
  OverlayTrigger, Row, Spinner, Table, Tooltip,
} from "react-bootstrap";
import { getJwtClaims } from "../api/snocApiWithAutoToken";
import snocApi from "../api/snocApiWithAutoToken";
import useMonitorWebSocket from "../hooks/useMonitorWebSocket";
import TopNavbarHealth from "../views/dashboard/DashOrigin/TopNavbarHealth";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmtSec = (s) => {
  if (!s || s <= 0) return "—";
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  if (s >= 60)   return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${s}s`;
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || { bg: "#6c757d", icon: "?", label: status };
  return (
    <span style={{
      background: c.bg, color: "#fff", borderRadius: 20,
      padding: "2px 9px", fontSize: "0.71rem", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {c.icon} {c.label}
    </span>
  );
};

const KpiCard = ({ icon, value, label, color }) => (
  <Card className="shadow-sm text-center h-100" style={{ borderTop: `3px solid ${color}` }}>
    <Card.Body className="py-2 px-1">
      <div style={{ fontSize: "1.4rem" }}>{icon}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.68rem", color: "#6c757d", lineHeight: 1.2 }}>{label}</div>
    </Card.Body>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const MonitorDashboard = () => {
  const dispatch      = useDispatch();
  const reduxDevices  = useSelector((state) => state.hosts?.devices || []);
  const reduxHostsLoading = useSelector((state) => state.hosts?.loading || false);

  const [data,       setData]       = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [trigger,    setTrigger]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [actionMsg,  setActionMsg]  = useState("");

  const [filterStatus,     setFilterStatus]     = useState("all");
  const [filterModule,     setFilterModule]      = useState("all");
  const [jobDetail,        setJobDetail]         = useState(null);
  const [showRelAll,       setShowRelAll]        = useState(false);
  const [releasing,        setReleasing]         = useState(false);
  const [showAuthRelAll,   setShowAuthRelAll]    = useState(false);
  const [authReleasing,    setAuthReleasing]     = useState(false);
  const [showManualLock,    setShowManualLock]    = useState(false);
  const [selectedDevices,   setSelectedDevices]   = useState([]); // react-select options [{label, value}]
  const [manualLockReason,  setManualLockReason]  = useState("");
  const [manualLocking,     setManualLocking]     = useState(false);
  const [lockFilter,        setLockFilter]        = useState("all"); // all | locked | warned
  const [lockSearch,        setLockSearch]        = useState("");

  const claims    = useMemo(() => getJwtClaims(), []);
  const isAdmin   = claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  const isSuperUser = claims?.is_superuser || claims?.role === "super";

  const flash = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3500);
  };

  // ── WebSocket (theo pattern của useScheduleWebSocket) ──────────────────
  const onSnapshot = useCallback((snapData, trig = "") => {
    setData(snapData);
    setLastUpdate(new Date());
    if (trig) setTrigger(trig);
  }, []);

  const onJobDone = useCallback((jobId) => {
    flash(`✅ Job ${jobId?.slice(0, 8)}... hoàn thành`);
  }, []);

  const { isConnected, hasEverConnected, sendRefresh } =
    useMonitorWebSocket(onSnapshot, onJobDone);

  // ── Fallback REST khi chưa có WS ──────────────────────────────────────
  const fetchREST = async () => {
    setLoading(true);
    try {
      const res = await snocApi.get("nornirps/monitor/status/");
      setData(res.data);
      setLastUpdate(new Date());
    } catch (e) {
      flash("❌ " + (e?.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu qua REST, sau đó WS sẽ tự push
  useEffect(() => { fetchREST(); }, []); // eslint-disable-line

  // ── Actions ────────────────────────────────────────────────────────────
  const releaseLock = async (node) => {
    try {
      await snocApi.post("nornirps/monitor/lock/release/", { node });
      flash(`🔓 Released: ${node}`);
      sendRefresh();
    } catch (e) { flash("❌ " + (e?.response?.data?.error || e.message)); }
  };

  const releaseAllLocks = async () => {
    setReleasing(true);
    try {
      await snocApi.delete("nornirps/monitor/lock/release/");
      setShowRelAll(false);
      flash("🔓 Đã release tất cả locks");
      sendRefresh();
    } catch (e) { flash("❌ " + (e?.response?.data?.error || e.message)); }
    finally { setReleasing(false); }
  };

  const cancelJob = async (jobId) => {
    try {
      await snocApi.delete(`nornirps/monitor/job/${jobId}/cancel/`);
      flash(`🚫 Cancelled job ${jobId.slice(0, 8)}...`);
      sendRefresh();
    } catch (e) { flash("❌ " + (e?.response?.data?.error || e.message)); }
  };

  const unlockAuthDevice = async (deviceName) => {
    try {
      await snocApi.post(`nornirps/monitor/auth-lock/${deviceName}/unlock/`);
      flash(`🔓 Đã mở khóa auth: ${deviceName}`);
      sendRefresh();
      fetchREST();
    } catch (e) { flash("❌ " + (e?.response?.data?.error || e.message)); }
  };

  const unlockAllAuthDevices = async () => {
    setAuthReleasing(true);
    try {
      await snocApi.delete("nornirps/monitor/auth-lock/clear/");
      setShowAuthRelAll(false);
      flash("🔓 Đã mở khóa tất cả auth locks");
      sendRefresh();
      fetchREST();
    } catch (e) { flash("❌ " + (e?.response?.data?.error || e.message)); }
    finally { setAuthReleasing(false); }
  };

  const _closeManualLockModal = () => {
    setShowManualLock(false);
    setSelectedDevices([]);
    setManualLockReason("");
  };

  const lockDeviceManually = async () => {
    if (selectedDevices.length === 0) { flash("❌ Chưa chọn device nào"); return; }
    if (!manualLockReason.trim())     { flash("❌ Vui lòng nhập lý do"); return; }
    setManualLocking(true);
    try {
      await snocApi.post("nornirps/monitor/auth-lock/manual-lock/", {
        device_names: selectedDevices.map((d) => d.value),
        reason: manualLockReason.trim(),
      });
      flash(`🔒 Đã khóa ${selectedDevices.length} device thủ công`);
      _closeManualLockModal();
      sendRefresh();
      fetchREST();
    } catch (e) { flash("❌ " + (e?.response?.data?.error || e.message)); }
    finally { setManualLocking(false); }
  };

  const openManualLockModal = () => {
    setShowManualLock(true);
    setSelectedDevices([]);
    setManualLockReason("");
    if (reduxDevices.length === 0) dispatch(fetchHosts());
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const locks      = data?.locks?.nodes        || [];
  const allJobs    = data?.queue?.jobs         || [];
  const qcount     = data?.queue?.counts       || {};
  const cacheInf   = data?.cache               || {};
  const authLocks  = data?.auth_locks?.devices || [];
  const authStats  = data?.auth_stats          || {};
  const authLocked = authLocks.filter((d) => d.locked);

  // Derived stats (fallback tính từ authLocks nếu backend chưa trả auth_stats)
  const statAutoLocked   = authStats.auto_locked   ?? authLocks.filter((d) => d.locked && d.lock_type !== "manual").length;
  const statManualLocked = authStats.manual_locked ?? authLocks.filter((d) => d.locked && d.lock_type === "manual").length;
  const statWarned       = authStats.warned        ?? authLocks.filter((d) => !d.locked && d.fail_count > 0).length;
  const statTotal        = authStats.total         ?? authLocks.length;

  // Filter + search cho Device Lock table
  const filteredAuthLocks = authLocks.filter((d) => {
    if (lockFilter === "locked"  && !d.locked)                    return false;
    if (lockFilter === "warned"  && (d.locked || !d.fail_count))  return false;
    if (lockSearch) {
      const q = lockSearch.toLowerCase();
      return d.device_name?.toLowerCase().includes(q) ||
             d.platform?.toLowerCase().includes(q) ||
             d.hostname?.toLowerCase().includes(q);
    }
    return true;
  });

  // Options cho react-select trong modal khóa thủ công
  const deviceOptions = useMemo(() =>
    reduxDevices.map((d) => ({
      label: `${d.name}${d.hostname ? ` (${d.hostname})` : ""}${d.platform ? ` — ${d.platform}` : ""}`,
      value: d.name,
    })), [reduxDevices]
  );
  const allDeviceOption = { label: "── Chọn tất cả thiết bị ──", value: "__all__" };

  const handleDeviceSelectChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((o) => o.value === "__all__")) {
      setSelectedDevices(deviceOptions);
    } else {
      setSelectedDevices(selected);
    }
  };

  const SELECT_STYLES = {
    valueContainer: (b) => ({ ...b, maxHeight: "80px", overflowY: "auto", flexWrap: "wrap" }),
    multiValue:     (b) => ({ ...b, margin: "2px 3px" }),
  };

  const filteredJobs = allJobs.filter((j) => {
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    if (filterModule !== "all" && j.module !== filterModule)  return false;
    return true;
  });

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f5f6fa", minHeight: "calc(100vh - 56px)" }}
      className="container-fluid px-3 py-3">

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-semibold mb-0">🖥️ System Monitor</h5>
          <small className="text-muted d-flex align-items-center gap-2">
            <span style={{ color: isConnected ? "#198754" : hasEverConnected ? "#ffc107" : "#dc3545" }}>
              ● {isConnected ? "Live (WS)" : hasEverConnected ? "Reconnecting..." : "Connecting..."}
            </span>
            {lastUpdate && `· ${lastUpdate.toLocaleTimeString("vi-VN")}`}
            {trigger && <em>· {trigger}</em>}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          {actionMsg && (
            <span style={{
              fontSize: "0.82rem",
              color: actionMsg.startsWith("❌") ? "#dc3545" : "#198754",
            }}>
              {actionMsg}
            </span>
          )}
          <Button size="sm" variant="outline-secondary"
            onClick={() => { fetchREST(); sendRefresh(); }} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "🔄 Refresh"}
          </Button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <Row className="g-2 mb-3">
        <Col xs={6} md={2}><KpiCard icon="🔒"
          value={locks.length} label="Devices locked"
          color={locks.length > 0 ? "#dc3545" : "#198754"} /></Col>
        <Col xs={6} md={2}><KpiCard icon="⏳"
          value={qcount.pending || 0} label="Pending" color="#6c757d" /></Col>
        <Col xs={6} md={2}><KpiCard icon="⚙️"
          value={qcount.running || 0} label="Running" color="#0d6efd" /></Col>
        <Col xs={6} md={2}><KpiCard icon="✅"
          value={qcount.done || 0} label="Done" color="#198754" /></Col>
        <Col xs={6} md={2}><KpiCard icon="❌"
          value={(qcount.failed || 0) + (qcount.locked || 0)}
          label="Failed / Locked" color="#dc3545" /></Col>
        <Col xs={6} md={2}><KpiCard icon="💾"
          value={cacheInf.used_memory_human || "N/A"}
          label="Redis Memory" color="#6f42c1" /></Col>
        <Col xs={6} md={2}><KpiCard icon="🔐"
          value={authLocked.length}
          label="Auth Locked" color={authLocked.length > 0 ? "#dc3545" : "#198754"} /></Col>
      </Row>

      <Row className="g-3">
        {/* ── Lock Panel ── */}
        <Col lg={4}>
          <Card className="shadow-sm" style={{ height: 430 }}>
            <Card.Header className="py-2 d-flex justify-content-between align-items-center"
              style={{ background: "#fff3cd" }}>
              <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>
                🔒 Locks đang hoạt động ({locks.length})
              </span>
              {locks.length > 0 && isSuperUser && (
                <Button size="sm" variant="danger" style={{ fontSize: "0.72rem" }}
                  onClick={() => setShowRelAll(true)}>
                  Release All
                </Button>
              )}
            </Card.Header>
            <div style={{ overflowY: "auto", height: 370 }}>
              {locks.length === 0 ? (
                <div className="text-center text-success py-5" style={{ fontSize: "0.88rem" }}>
                  ✅ Không có device đang bị lock
                </div>
              ) : (
                <Table size="sm" className="mb-0 align-middle">
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ fontSize: "0.75rem" }}>
                      <th className="ps-2">Device</th>
                      <th className="text-center">TTL còn lại</th>
                      <th className="text-center">Release</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locks.map((lk) => {
                      const node = lk.key?.replace("hc:node:", "") || lk.key;
                      const ttl  = lk.ttl_seconds;
                      // Màu: đỏ = vừa lock (<30s đã hết / hoặc >1740s = mới lock);
                      // vàng = <5ph; xám = bình thường
                      const badgeBg = ttl < 300 ? "warning" : ttl > 1740 ? "danger" : "secondary";
                      const tip     = ttl > 1740
                        ? "Vừa mới lock — đang chạy"
                        : ttl < 300
                        ? "Sắp hết lock"
                        : "Đang chạy bình thường";
                      return (
                        <tr key={lk.key} style={{ fontSize: "0.8rem" }}>
                          <td className="ps-2">
                            <code style={{ fontSize: "0.76rem" }}>{node}</code>
                          </td>
                          <td className="text-center">
                            <OverlayTrigger overlay={<Tooltip>{tip}</Tooltip>}>
                              <Badge bg={badgeBg} style={{ fontSize: "0.68rem" }}>
                                ⏱ {fmtSec(ttl)}
                              </Badge>
                            </OverlayTrigger>
                          </td>
                          <td className="text-center">
                            {isAdmin && (
                              <OverlayTrigger overlay={<Tooltip>Force release lock</Tooltip>}>
                                <Button size="sm" variant="outline-danger"
                                  style={{ fontSize: "0.7rem", padding: "0 5px", lineHeight: 1.5 }}
                                  onClick={() => releaseLock(node)}>
                                  🔓
                                </Button>
                              </OverlayTrigger>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          </Card>
        </Col>

        {/* ── Cache Panel ── */}
        <Col lg={2}>
          <Card className="shadow-sm" style={{ height: 430 }}>
            <Card.Header className="py-2 fw-semibold"
              style={{ background: "#f0e6ff", fontSize: "0.88rem" }}>
              💾 Redis Info
            </Card.Header>
            <Card.Body style={{ fontSize: "0.82rem" }}>
              {!cacheInf.available ? (
                <div className="text-danger mt-2">Redis không kết nối được</div>
              ) : (
                [
                  ["Version",  cacheInf.redis_version],
                  ["Memory",   cacheInf.used_memory_human],
                  ["Max Mem",  cacheInf.maxmemory_human],
                  ["Clients",  cacheInf.connected_clients],
                  ["Keys",     cacheInf.total_keys],
                  ["Uptime",   `${cacheInf.uptime_days} ngày`],
                ].map(([label, val]) => (
                  <div key={label}
                    className="d-flex justify-content-between mb-2 pb-1"
                    style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <span className="text-muted">{label}</span>
                    <span className="fw-semibold">{val ?? "—"}</span>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ── Queue Panel ── */}
        <Col lg={6}>
          <Card className="shadow-sm" style={{ height: 430 }}>
            <Card.Header className="py-2" style={{ background: "#e8f4fd" }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>
                  📋 Job Queue ({filteredJobs.length} / {allJobs.length})
                </span>
                <div className="d-flex gap-2">
                  <Form.Select size="sm" style={{ width: 115, fontSize: "0.75rem" }}
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </Form.Select>
                  <Form.Select size="sm" style={{ width: 115, fontSize: "0.75rem" }}
                    value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                    <option value="all">All Module</option>
                    {Object.entries(MODULE_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {k}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <div style={{ overflowY: "auto", height: 370 }}>
              {filteredJobs.length === 0 ? (
                <div className="text-center text-muted py-5" style={{ fontSize: "0.88rem" }}>
                  Không có job nào
                </div>
              ) : (
                <Table size="sm" className="mb-0 align-middle">
                  <thead className="table-light"
                    style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ fontSize: "0.73rem" }}>
                      <th className="ps-2">Job ID</th>
                      <th>Module</th>
                      <th>Platform</th>
                      <th className="text-center">Nodes</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => {
                      const mc = MODULE_CFG[job.module] || { color: "#6c757d", icon: "?" };
                      return (
                        <tr key={job.job_id} style={{ fontSize: "0.77rem" }}>
                          <td className="ps-2">
                            <Button variant="link" size="sm" className="p-0"
                              style={{ fontSize: "0.73rem", fontFamily: "monospace" }}
                              onClick={() => setJobDetail(job)}>
                              {job.job_id?.slice(0, 8)}...
                            </Button>
                          </td>
                          <td style={{ color: mc.color, fontWeight: 600 }}>
                            {mc.icon} {job.module || "—"}
                          </td>
                          <td>
                            <code style={{ fontSize: "0.7rem" }}>
                              {job.platform?.split(",")[0] || "—"}
                            </code>
                          </td>
                          <td className="text-center">
                            <Badge bg="light" text="dark" className="border" style={{ fontSize: "0.7rem" }}>
                              {(job.nodes || []).length}
                            </Badge>
                          </td>
                          <td><StatusBadge status={job.status} /></td>
                          <td className="text-center">
                            {job.status === "pending" && isAdmin && (
                              <Button size="sm" variant="outline-danger"
                                style={{ fontSize: "0.68rem", padding: "0 5px" }}
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
            </div>
          </Card>
        </Col>
      </Row>

      {/* ════════════════════════════════════════════════════════
          Device Lock Manager — always visible
          ════════════════════════════════════════════════════════ */}
      <Row className="g-3 mt-1">
        <Col lg={12}>
          <Card className="shadow-sm">

            {/* ── Header ── */}
            <Card.Header className="py-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
              style={{ background: "#fdf0ff", borderBottom: "2px solid #9b59b6" }}>
              <span className="fw-bold" style={{ fontSize: "0.92rem", color: "#6f42c1" }}>
                🔐 Device Lock Manager
              </span>
              {isAdmin && (
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <Button size="sm" variant="outline-danger"
                    style={{ fontSize: "0.76rem" }}
                    onClick={openManualLockModal}>
                    🔒 Khóa thủ công
                  </Button>
                  {authLocked.length > 0 && (
                    <Button size="sm" variant="success"
                      style={{ fontSize: "0.76rem" }}
                      onClick={() => setShowAuthRelAll(true)}>
                      🔓 Mở khóa tất cả ({authLocked.length})
                    </Button>
                  )}
                </div>
              )}
            </Card.Header>

            {/* ── Stats Row ── */}
            <div className="px-3 pt-3 pb-2">
              <Row className="g-2">
                {[
                  { icon: "🔒", value: statAutoLocked,   label: "Khóa tự động",  color: statAutoLocked   > 0 ? "#dc3545" : "#198754" },
                  { icon: "🔧", value: statManualLocked, label: "Khóa thủ công", color: statManualLocked > 0 ? "#fd7e14" : "#198754" },
                  { icon: "⚠️", value: statWarned,       label: "Cảnh báo",      color: statWarned       > 0 ? "#ffc107" : "#198754" },
                  { icon: "📋", value: statTotal,        label: "Tổng ghi nhận", color: "#6f42c1"                                    },
                ].map(({ icon, value, label, color }) => (
                  <Col xs={6} md={3} key={label}>
                    <div className="border rounded text-center py-2 px-1"
                      style={{ background: "#fff", borderColor: color + "40" }}>
                      <div style={{ fontSize: "1.2rem" }}>{icon}</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 700, color }}>{value}</div>
                      <div style={{ fontSize: "0.67rem", color: "#6c757d" }}>{label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* ── Filter + Search ── */}
            <div className="px-3 pb-2 d-flex align-items-center gap-2 flex-wrap">
              {[
                { key: "all",    label: "Tất cả",    count: statTotal },
                { key: "locked", label: "Đang khóa", count: authLocked.length },
                { key: "warned", label: "Cảnh báo",  count: statWarned },
              ].map(({ key, label, count }) => (
                <Button key={key} size="sm"
                  variant={lockFilter === key ? "primary" : "outline-secondary"}
                  style={{ fontSize: "0.74rem", borderRadius: 20, padding: "2px 12px" }}
                  onClick={() => setLockFilter(key)}>
                  {label} <Badge bg="light" text="dark" style={{ fontSize: "0.65rem" }}>{count}</Badge>
                </Button>
              ))}
              <Form.Control size="sm" placeholder="🔍 Tìm device, platform, IP..."
                value={lockSearch} onChange={(e) => setLockSearch(e.target.value)}
                style={{ maxWidth: 220, fontSize: "0.76rem", borderRadius: 20 }} />
            </div>

            {/* ── Table ── */}
            <div style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto" }}>
              {filteredAuthLocks.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ fontSize: "0.88rem" }}>
                  {authLocks.length === 0
                    ? "✅ Không có device nào bị ghi nhận lỗi xác thực"
                    : "Không có kết quả phù hợp bộ lọc"}
                </div>
              ) : (
                <Table size="sm" className="mb-0 align-middle">
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr style={{ fontSize: "0.73rem" }}>
                      <th className="ps-2">Device</th>
                      <th>Platform</th>
                      <th>IP</th>
                      <th className="text-center">Loại</th>
                      <th className="text-center">Fail</th>
                      <th className="text-center">Trạng thái</th>
                      <th>Khóa lúc</th>
                      <th>Bởi / Lý do</th>
                      <th className="text-center">Mở khóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuthLocks.map((d) => {
                      const isManual = d.lock_type === "manual";
                      const reason   = isManual ? d.manual_reason : d.last_fail_reason;
                      const lockedBy = d.locked_by_username;
                      return (
                        <tr key={d.device_name} style={{ fontSize: "0.78rem" }}
                          className={d.locked ? "table-danger" : "table-warning"}>
                          <td className="ps-2">
                            <code style={{ fontSize: "0.74rem", fontWeight: 600 }}>{d.device_name}</code>
                          </td>
                          <td>
                            <Badge bg="secondary" style={{ fontSize: "0.66rem" }}>
                              {d.platform || "—"}
                            </Badge>
                          </td>
                          <td style={{ color: "#555", whiteSpace: "nowrap" }}>
                            {d.hostname || "—"}
                          </td>
                          <td className="text-center">
                            <OverlayTrigger overlay={<Tooltip>{isManual ? "Khóa thủ công bởi admin" : "Tự động khóa do sai password"}</Tooltip>}>
                              <span style={{
                                fontSize: "0.68rem", borderRadius: 10, padding: "1px 7px", fontWeight: 600,
                                background: isManual ? "#fd7e14" : "#dc3545", color: "#fff",
                              }}>
                                {isManual ? "🔧 Manual" : "🤖 Auto"}
                              </span>
                            </OverlayTrigger>
                          </td>
                          <td className="text-center">
                            <Badge bg={d.fail_count >= (d.threshold || 3) ? "danger" : "warning"}
                              text={d.fail_count >= (d.threshold || 3) ? undefined : "dark"}
                              style={{ fontSize: "0.67rem" }}>
                              {d.fail_count}/{d.threshold || 3}
                            </Badge>
                          </td>
                          <td className="text-center">
                            {d.locked ? (
                              <span style={{
                                background: "#dc3545", color: "#fff", borderRadius: 10,
                                padding: "2px 8px", fontSize: "0.67rem", fontWeight: 600,
                              }}>🔒 Đang khóa</span>
                            ) : (
                              <span style={{
                                background: "#ffc107", color: "#212529", borderRadius: 10,
                                padding: "2px 8px", fontSize: "0.67rem", fontWeight: 600,
                              }}>⚠️ Cảnh báo</span>
                            )}
                          </td>
                          <td style={{ whiteSpace: "nowrap", color: "#555", fontSize: "0.72rem" }}>
                            {d.locked_at
                              ? new Date(d.locked_at).toLocaleString("vi-VN")
                              : d.last_fail_at
                              ? new Date(d.last_fail_at).toLocaleString("vi-VN")
                              : "—"}
                          </td>
                          <td style={{ maxWidth: 220, fontSize: "0.72rem" }}>
                            {lockedBy && (
                              <span className="text-muted me-1" style={{ fontSize: "0.67rem" }}>
                                👤 {lockedBy}
                              </span>
                            )}
                            <span style={{
                              display: "block", overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap",
                              color: isManual ? "#fd7e14" : "#dc3545",
                            }} title={reason}>
                              {reason || "—"}
                            </span>
                          </td>
                          <td className="text-center">
                            {isAdmin && (
                              <OverlayTrigger overlay={
                                <Tooltip>
                                  {d.locked ? "Mở khóa device — cho phép SSH lại" : "Reset cảnh báo — xóa fail count"}
                                </Tooltip>
                              }>
                                <Button size="sm"
                                  variant={d.locked ? "outline-success" : "outline-warning"}
                                  style={{ fontSize: "0.7rem", padding: "1px 7px" }}
                                  onClick={() => unlockAuthDevice(d.device_name)}>
                                  {d.locked ? "🔓 Mở khóa" : "🔄 Reset"}
                                </Button>
                              </OverlayTrigger>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>

          </Card>
        </Col>
      </Row>

      {/* ── Modal: Mở khóa tất cả ── */}
      <Modal show={showAuthRelAll} onHide={() => setShowAuthRelAll(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>Xác nhận mở khóa tất cả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Mở khóa <strong>tất cả {authLocked.length} device</strong> đang bị khóa?
          <p className="text-warning mb-0 mt-2" style={{ fontSize: "0.8rem" }}>
            ⚠ Đảm bảo đã cập nhật đúng thông tin đăng nhập trước khi mở khóa.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={() => setShowAuthRelAll(false)}>Hủy</Button>
          <Button size="sm" variant="success" onClick={unlockAllAuthDevices} disabled={authReleasing}>
            {authReleasing ? <Spinner size="sm" animation="border" /> : "Mở khóa tất cả"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: Khóa thủ công ── nhất quán với Healthcheck/Precheck (react-select) */}
      <Modal show={showManualLock} onHide={_closeManualLockModal} size="md" centered>
        <Modal.Header closeButton style={{ background: "#fdf0ff" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>🔒 Khóa thủ công thiết bị</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* ── Chọn thiết bị — react-select isMulti với search ── */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Thiết bị *
              {selectedDevices.length > 0 && (
                <Badge bg="danger" className="ms-2" style={{ fontSize: "0.7rem" }}>
                  {selectedDevices.length} đã chọn
                </Badge>
              )}
            </Form.Label>
            {reduxHostsLoading ? (
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                <Spinner size="sm" animation="border" className="me-1" />Đang tải danh sách...
              </div>
            ) : (
              <Select
                isMulti
                isSearchable
                placeholder="Tìm và chọn thiết bị..."
                options={[allDeviceOption, ...deviceOptions]}
                value={selectedDevices}
                onChange={handleDeviceSelectChange}
                styles={SELECT_STYLES}
                noOptionsMessage={() => "Không tìm thấy thiết bị"}
                loadingMessage={() => "Đang tải..."}
              />
            )}
          </Form.Group>

          {/* ── Lý do khóa ── */}
          <Form.Group className="mb-2">
            <Form.Label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Lý do khóa *</Form.Label>
            <Form.Control as="textarea" rows={2} size="sm"
              placeholder="Ví dụ: Bảo trì định kỳ, đang thay password..."
              value={manualLockReason}
              onChange={(e) => setManualLockReason(e.target.value)}
              style={{ fontSize: "0.8rem", resize: "none" }} />
          </Form.Group>
          <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>
            Device bị khóa sẽ bị bỏ qua trong healthcheck, precheck, bảo dưỡng cho đến khi admin mở khóa.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={_closeManualLockModal}>Hủy</Button>
          <Button size="sm" variant="danger" onClick={lockDeviceManually}
            disabled={manualLocking || selectedDevices.length === 0}>
            {manualLocking
              ? <Spinner size="sm" animation="border" />
              : `🔒 Khóa ${selectedDevices.length > 0 ? selectedDevices.length + " thiết bị" : "thiết bị"}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Release All Modal ── */}
      <Modal show={showRelAll} onHide={() => setShowRelAll(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>Xác nhận release all</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Giải phóng <strong>tất cả {locks.length} locks</strong>?
          <p className="text-danger mb-0 mt-2" style={{ fontSize: "0.8rem" }}>
            ⚠ Các operation bị block sẽ có thể chạy lại ngay.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={() => setShowRelAll(false)}>Hủy</Button>
          <Button size="sm" variant="danger" onClick={releaseAllLocks} disabled={releasing}>
            {releasing ? <Spinner size="sm" animation="border" /> : "Release All"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Job Detail Modal ── */}
      <Modal show={!!jobDetail} onHide={() => setJobDetail(null)} size="lg" scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "0.95rem" }}>
            Job: <code>{jobDetail?.job_id?.slice(0, 8)}...</code>{" "}
            <StatusBadge status={jobDetail?.status} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "0.82rem" }}>
          {jobDetail && (() => {
            const mc = MODULE_CFG[jobDetail.module] || { color: "#6c757d", icon: "?" };
            return (
              <>
                <Row className="g-2 mb-3">
                  {[
                    ["Module",   `${mc.icon} ${jobDetail.module || "—"}`],
                    ["Platform", jobDetail.platform || "—"],
                    ["User ID",  String(jobDetail.user_id || "—")],
                    ["Caller IP",jobDetail.caller_ip || "—"],
                    ["Service",  jobDetail.svc_name || "—"],
                    ["Webhook",  jobDetail.webhook_url || "—"],
                  ].map(([label, val]) => (
                    <Col xs={6} key={label}>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>{label}</div>
                      <div className="fw-semibold" style={{ wordBreak: "break-all" }}>{val}</div>
                    </Col>
                  ))}
                </Row>

                {(jobDetail.nodes || []).length > 0 && (
                  <div className="mb-3">
                    <div className="text-muted mb-1" style={{ fontSize: "0.72rem" }}>
                      Devices ({jobDetail.nodes.length})
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {jobDetail.nodes.map((n) => (
                        <code key={n} style={{
                          fontSize: "0.72rem", background: "#f0f0f0",
                          padding: "1px 7px", borderRadius: 4,
                        }}>{n}</code>
                      ))}
                    </div>
                  </div>
                )}

                {jobDetail.error && (
                  <div className="alert alert-danger py-2 mb-2" style={{ fontSize: "0.8rem" }}>
                    <strong>Error:</strong> {jobDetail.error}
                  </div>
                )}

                {jobDetail.result?.summary && (
                  <div className="d-flex gap-4 mb-2">
                    {Object.entries(jobDetail.result.summary).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div className="fw-bold fs-5">{v}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{k}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          {jobDetail?.status === "pending" && isAdmin && (
            <Button size="sm" variant="danger"
              onClick={() => { cancelJob(jobDetail.job_id); setJobDetail(null); }}>
              Cancel Job
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setJobDetail(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
const SystemMonitorPage = () => (
  <>
    <TopNavbarHealth />
    <MonitorDashboard />
  </>
);

export default SystemMonitorPage;
