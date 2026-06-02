// DhttDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import {
  Bar, BarChart, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchGenericSchedule,
  selectGenericSchedulesByType,
} from "../../../redux/KPI/genericScheduleSlice";
import { fetchDhttHistory } from "../../../redux/Healthcheck/dhttSlice";
import useScheduleKpiWebSocket from "../../../hooks/useScheduleKpiWebSocket";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";

// ── Constants ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  success: { bg: "#198754", label: "OK",   icon: "✅" },
  warning: { bg: "#fd7e14", label: "NOK",  icon: "⚠️" },
  failed:  { bg: "#dc3545", label: "Lỗi",  icon: "🔴" },
  skipped: { bg: "#6c757d", label: "Skip", icon: "⏭️" },
  null:    { bg: "#adb5bd", label: "—",    icon: "⏳" },
};

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("vi-VN", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const timeSince = (iso) => {
  if (!iso) return null;
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24) return `${diffHr}h trước`;
  return `${Math.floor(diffHr / 24)}d trước`;
};

// ── Schedule Chip ─────────────────────────────────────────────────────────
const ScheduleChip = ({ schedule, onClick, flash }) => {
  const s   = STATUS_CFG[schedule.last_run_status] || STATUS_CFG.null;
  const ref = useRef(null);

  useEffect(() => {
    if (flash && ref.current) {
      ref.current.classList.add("schedule-flash");
      setTimeout(() => ref.current?.classList.remove("schedule-flash"), 800);
    }
  }, [flash]);

  return (
    <div
      ref={ref}
      onClick={() => onClick(schedule)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 8px", borderRadius: 20, cursor: "pointer",
        background: s.bg + "22", border: `1.5px solid ${s.bg}`,
        fontSize: "0.78rem", margin: "2px",
        transition: "transform 0.15s",
      }}
      title={schedule.last_result_summary || schedule.name}
    >
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: schedule.enabled ? s.bg : "#adb5bd",
        display: "inline-block", flexShrink: 0,
      }} />
      <span style={{ fontWeight: 600, color: "#333" }}>
        {schedule.name.length > 18 ? schedule.name.slice(0, 16) + "…" : schedule.name}
      </span>
      <span style={{ color: s.bg, fontWeight: "bold" }}>{s.icon}</span>
    </div>
  );
};

// ── Platform Card ─────────────────────────────────────────────────────────
const PlatformCard = ({ platform, schedules, onScheduleClick }) => {
  const total   = schedules.length;
  const ok      = schedules.filter(s => s.last_run_status === "success").length;
  const nok     = schedules.filter(s => s.last_run_status === "warning").length;
  const failed  = schedules.filter(s => s.last_run_status === "failed").length;
  const noRun   = schedules.filter(s => !s.last_run_status).length;

  const overallStatus =
    failed > 0  ? "failed"  :
    nok    > 0  ? "warning" :
    noRun === total ? null  : "success";

  const cfg = STATUS_CFG[overallStatus] || STATUS_CFG.null;

  const lastRun = schedules
    .filter(s => s.last_run_at)
    .sort((a, b) => new Date(b.last_run_at) - new Date(a.last_run_at))[0]
    ?.last_run_at;

  return (
    <Card style={{
      border: `2px solid ${cfg.bg}`,
      borderRadius: 10, height: "100%",
    }}>
      <Card.Header style={{
        background: cfg.bg + "18",
        borderBottom: `1px solid ${cfg.bg}44`,
        padding: "8px 12px",
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <span className="fw-bold" style={{ fontSize: "0.88rem" }}>
            <code>{platform}</code>
          </span>
          <span style={{
            fontSize: "0.72rem", fontWeight: "bold",
            color: cfg.bg, background: cfg.bg + "22",
            padding: "1px 8px", borderRadius: 10,
          }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Stats bar */}
        <div className="d-flex gap-2 mt-1" style={{ fontSize: "0.72rem" }}>
          {ok    > 0 && <span style={{ color: "#198754" }}>✅ OK: {ok}</span>}
          {nok   > 0 && <span style={{ color: "#fd7e14" }}>⚠️ NOK: {nok}</span>}
          {failed > 0 && <span style={{ color: "#dc3545" }}>🔴 Lỗi: {failed}</span>}
          {noRun > 0 && <span style={{ color: "#adb5bd" }}>⏳ Chưa: {noRun}</span>}
          <span className="ms-auto text-muted">{timeSince(lastRun)}</span>
        </div>
      </Card.Header>

      <Card.Body style={{ padding: "8px 10px" }}>
        <div className="d-flex flex-wrap">
          {schedules.map(s => (
            <ScheduleChip key={s.id} schedule={s}
              onClick={onScheduleClick} flash={false} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

// ── Sync History Chart ────────────────────────────────────────────────────
const SyncHistoryChart = ({ historyItems }) => {
  const data = useMemo(() => {
    const last24h = historyItems
      .filter(h => {
        const d = new Date(h.execution_time);
        return !isNaN(d.getTime()) &&
               Date.now() - d.getTime() < 24 * 3600 * 1000;
      })
      .slice(0, 20)
      .reverse();

    return last24h.map(h => ({
      time:    fmtTime(h.execution_time),
      status:  h.status_code === 200 ? 1 : 0,
      label:   h.task_name || h.platform,
      code:    h.status_code,
    }));
  }, [historyItems]);

  if (data.length === 0) return (
    <div className="text-center text-muted py-4" style={{ fontSize: "0.85rem" }}>
      Chưa có dữ liệu sync 24h qua
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis domain={[0, 1]} ticks={[0, 1]}
          tickFormatter={v => v === 1 ? "OK" : "Fail"}
          tick={{ fontSize: 10 }} />
        <Tooltip
          formatter={(v, _, props) =>
            [props.payload.code, props.payload.label]}
          labelFormatter={l => `Lúc: ${l}`}
        />
        <Bar dataKey="status" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i}
              fill={d.status === 1 ? "#198754" : "#dc3545"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Schedule Detail Modal ─────────────────────────────────────────────────
const ScheduleDetailModal = ({ schedule, onHide, onManual, navigate }) => {
  if (!schedule) return null;
  const s = STATUS_CFG[schedule.last_run_status] || STATUS_CFG.null;

  return (
    <Modal show onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1rem" }}>
          {s.icon} {schedule.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table size="sm" bordered>
          <tbody>
            <tr>
              <td className="fw-bold bg-light" style={{ width: "35%" }}>Platform</td>
              <td><code>{schedule.platform}</code></td>
            </tr>
            <tr>
              <td className="fw-bold bg-light">Nodes</td>
              <td style={{ fontSize: "0.82rem" }}>
                {(schedule.node_names || []).join(", ")}
              </td>
            </tr>
            <tr>
              <td className="fw-bold bg-light">Cron</td>
              <td><code>{schedule.cron}</code></td>
            </tr>
            <tr>
              <td className="fw-bold bg-light">Trạng thái</td>
              <td>
                <span style={{
                  color: s.bg, fontWeight: "bold",
                }}>
                  {s.icon} {s.label}
                </span>
              </td>
            </tr>
            <tr>
              <td className="fw-bold bg-light">Lần chạy cuối</td>
              <td>{fmtDate(schedule.last_run_at)}</td>
            </tr>
            <tr>
              <td className="fw-bold bg-light">Tóm tắt</td>
              <td style={{ fontSize: "0.82rem", whiteSpace: "pre-line" }}>
                {schedule.last_result_summary || "—"}
              </td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
        <Button variant="outline-info" size="sm"
          onClick={() => { onHide(); navigate("/dhtt/history"); }}>
          📋 Xem History
        </Button>
        <Button variant="primary" size="sm"
          onClick={() => { onHide(); onManual(schedule); }}>
          ▶️ Chạy Manual
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────
const DhttDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useScheduleKpiWebSocket({ endpoint: "schedule", silent: true });

  const schedules = useSelector(s => selectGenericSchedulesByType(s, "dhtt")) || [];
  const { items: historyItems = [], loading: histLoading } =
    useSelector(s => s.dhtt || {});

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [autoRefresh,      setAutoRefresh]      = useState(true);

  // Auto-refresh mỗi 60 giây
  useEffect(() => {
    dispatch(fetchGenericSchedule({ usecase_type: "dhtt" }));
    dispatch(fetchDhttHistory({ hours: 24, page_size: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      dispatch(fetchGenericSchedule({ usecase_type: "dhtt" }));
      dispatch(fetchDhttHistory({ hours: 24, page_size: 20 }));
    }, 60000);
    return () => clearInterval(timer);
  }, [dispatch, autoRefresh]);

  // ── Group by platform ───────────────────────────────────────────────────
  const byPlatform = useMemo(() => {
    const map = {};
    schedules.forEach(s => {
      const p = s.platform || "unknown";
      if (!map[p]) map[p] = [];
      map[p].push(s);
    });
    return map;
  }, [schedules]);

  // ── Summary counts ──────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:   schedules.length,
    active:  schedules.filter(s => s.enabled).length,
    success: schedules.filter(s => s.last_run_status === "success").length,
    warning: schedules.filter(s => s.last_run_status === "warning").length,
    failed:  schedules.filter(s => s.last_run_status === "failed").length,
    noRun:   schedules.filter(s => !s.last_run_status).length,
  }), [schedules]);

  const handleManual = (schedule) => {
    navigate("/dhtt/manual", {
      state: {
        platform:   schedule.platform,
        node_names: schedule.node_names,
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      {/* Detail Modal */}
      {selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onHide={() => setSelectedSchedule(null)}
          onManual={handleManual}
          navigate={navigate}
        />
      )}

      <div className="px-2 py-2">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="mb-0 fw-bold">🛠️ Bảo Dưỡng ĐHTT</h4>
            <small className="text-muted">
              Real-time · Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button variant={autoRefresh ? "success" : "outline-secondary"}
              size="sm"
              onClick={() => setAutoRefresh(p => !p)}>
              {autoRefresh ? "⏱ Auto" : "⏸ Paused"}
            </Button>
            <Button variant="outline-secondary" size="sm"
              onClick={() => {
                dispatch(fetchGenericSchedule({ usecase_type: "dhtt" }));
                dispatch(fetchDhttHistory({ hours: 24, page_size: 20 }));
              }}>
              🔄 Refresh
            </Button>
            <Button variant="primary" size="sm"
              onClick={() => navigate("/dhtt/manual")}>
              ▶️ Manual
            </Button>
            <Button variant="outline-secondary" size="sm"
              onClick={() => navigate("/healthcheck/kpischedule")}>
              📅 Lịch
            </Button>
            <Button variant="outline-info" size="sm"
              onClick={() => navigate("/dhtt/history")}>
              📋 History
            </Button>
          </div>
        </div>

        {/* ── Summary Bar ────────────────────────────────────────────── */}
        <Row className="g-2 mb-3">
          {[
            { label: "Tổng",      value: counts.total,   bg: "#0d6efd", icon: "📋" },
            { label: "Đang bật",  value: counts.active,  bg: "#0dcaf0", icon: "⚡" },
            { label: "All OK",    value: counts.success, bg: "#198754", icon: "✅" },
            { label: "Có NOK",    value: counts.warning, bg: "#fd7e14", icon: "⚠️" },
            { label: "Lỗi",       value: counts.failed,  bg: "#dc3545", icon: "🔴" },
            { label: "Chưa chạy", value: counts.noRun,   bg: "#6c757d", icon: "⏳" },
          ].map(c => (
            <Col key={c.label} xs={6} md={2}>
              <div style={{
                background: c.bg + "18", border: `1.5px solid ${c.bg}44`,
                borderRadius: 10, padding: "10px 14px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{
                    fontSize: "1.6rem", fontWeight: "bold", color: c.bg,
                    lineHeight: 1,
                  }}>
                    {c.value}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#555" }}>
                    {c.label}
                  </div>
                </div>
                <span style={{ fontSize: "1.4rem", opacity: 0.6 }}>{c.icon}</span>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Platform Cards + Chart ──────────────────────────────────── */}
        <Row className="g-3">
          {/* Platform Cards */}
          <Col md={8}>
            <Row className="g-2">
              {Object.entries(byPlatform).length === 0 ? (
                <Col>
                  <Card body className="text-center text-muted">
                    Chưa có lịch bảo dưỡng nào.{" "}
                    <Button variant="link" size="sm"
                      onClick={() => navigate("/healthcheck/kpischedule")}>
                      Tạo lịch ngay
                    </Button>
                  </Card>
                </Col>
              ) : Object.entries(byPlatform).map(([platform, sched]) => (
                <Col key={platform} md={6} xl={4}>
                  <PlatformCard
                    platform={platform}
                    schedules={sched}
                    onScheduleClick={setSelectedSchedule}
                  />
                </Col>
              ))}
            </Row>
          </Col>

          {/* Right panel */}
          <Col md={4}>
            <Row className="g-3">

              {/* Sync Chart */}
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <Card.Title as="h6" className="mb-0">
                      📊 Kết quả sync ĐHTT (24h)
                    </Card.Title>
                  </Card.Header>
                  <Card.Body className="p-2">
                    {histLoading
                      ? <div className="text-center py-3"><Spinner size="sm" animation="border" /></div>
                      : <SyncHistoryChart historyItems={historyItems} />}
                  </Card.Body>
                </Card>
              </Col>

              {/* Recent history */}
              <Col md={12}>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <Card.Title as="h6" className="mb-0">
                      📡 Đồng bộ gần nhất
                    </Card.Title>
                    <Button variant="link" size="sm" className="p-0"
                      onClick={() => navigate("/dhtt/history")}>
                      Xem tất cả →
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table size="sm" className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ fontSize: "0.75rem" }}>Tác vụ</th>
                          <th style={{ fontSize: "0.75rem", textAlign: "center" }}>HTTP</th>
                          <th style={{ fontSize: "0.75rem" }}>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyItems.slice(0, 6).map((h, i) => (
                          <tr key={h.id || i}>
                            <td style={{ fontSize: "0.78rem" }}>
                              <div className="fw-bold">{h.task_name || "—"}</div>
                              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                {h.platform}
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <Badge bg={h.status_code === 200 ? "success" : "danger"}
                                style={{ fontSize: "0.7rem" }}>
                                {h.status_code || "—"}
                              </Badge>
                            </td>
                            <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                              {fmtDate(h.execution_time)}
                            </td>
                          </tr>
                        ))}
                        {historyItems.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center text-muted py-3">
                              Không có dữ liệu
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

            </Row>
          </Col>
        </Row>
      </div>

      <style>{`
        .schedule-flash {
          animation: flash-border 0.8s ease;
        }
        @keyframes flash-border {
          0%   { box-shadow: 0 0 0 3px #0d6efd88; }
          100% { box-shadow: none; }
        }
      `}</style>
    </>
  );
};

export default DhttDashboard;