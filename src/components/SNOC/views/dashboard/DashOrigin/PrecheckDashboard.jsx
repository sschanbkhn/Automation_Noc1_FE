// pages/Precheck/PrecheckDashboard.jsx
// ✅ Dùng snocApiWithAutoToken + genericScheduleSlice giống DhttDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, ProgressBar, Row, Spinner, Table,
} from "react-bootstrap";
import {
  Bar, BarChart, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// ✅ genericScheduleSlice — giống DhttDashboard.jsx
import {
  fetchGenericSchedule,
  selectGenericSchedulesByType,
} from "../../../redux/KPI/genericScheduleSlice";
import {
  fetchPrecheckHistory,
} from "../../../redux/Healthcheck/precheckSlice";
import useScheduleKpiWebSocket from "../../../hooks/useScheduleKpiWebSocket";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── Constants ──────────────────────────────────────────────────────────────
const USECASE_TYPE = "precheck";

const STATUS_CFG = {
  success: { bg: "#198754", text: "white",  label: "OK",   icon: "✅" },
  warning: { bg: "#fd7e14", text: "white",  label: "NOK",  icon: "⚠️" },
  failed:  { bg: "#dc3545", text: "white",  label: "Lỗi",  icon: "🔴" },
  null:    { bg: "#adb5bd", text: "white",  label: "—",    icon: "⏳" },
};

const STATUS_BAR_COLORS = {
  ok:     "#198754",
  failed: "#dc3545",
};

// ── Helpers ────────────────────────────────────────────────────────────────
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
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1)  return "vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24) return `${diffHr}h trước`;
  return `${Math.floor(diffHr / 24)}d trước`;
};

// ── KPI Card ──────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent }) => (
  <Card className="shadow-sm h-100" style={{ borderTop: `4px solid ${accent}` }}>
    <Card.Body className="py-3 px-3">
      <div className="text-muted" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: accent, lineHeight: 1.1 }}>{value}</div>
      {sub && <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>{sub}</div>}
    </Card.Body>
  </Card>
);

// ── Schedule Chip — giống DhttDashboard ──────────────────────────────────
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
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 20,
        background: schedule.enabled ? s.bg + "20" : "#f8f9fa",
        border: `1.5px solid ${schedule.enabled ? s.bg : "#dee2e6"}`,
        cursor: "pointer", fontSize: "0.8rem", fontWeight: 500,
        color: schedule.enabled ? s.bg : "#adb5bd",
        transition: "all 0.2s",
        opacity: schedule.enabled ? 1 : 0.6,
        userSelect: "none",
      }}
    >
      <span>{s.icon}</span>
      <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {schedule.name}
      </span>
      {schedule.last_run_at && (
        <span style={{ fontSize: "0.7rem", color: "#6c757d" }}>
          {timeSince(schedule.last_run_at)}
        </span>
      )}
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
const PrecheckDashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // ✅ WebSocket để nhận update realtime — giống DhttDashboard
  useScheduleKpiWebSocket({ endpoint: "schedule", silent: true });

  // ✅ Dùng genericScheduleSlice selector
  const schedules = useSelector((s) => selectGenericSchedulesByType(s, USECASE_TYPE)) || [];

  const {
    historyItems: items = [],
    historyLoading: loading = false,
  } = useSelector((s) => s.precheck || {});

  const [selectedSched, setSelectedSched] = useState(null);
  const [flashIds,      setFlashIds]      = useState(new Set());
  const prevSchedules   = useRef([]);

  // Fetch on mount
  useEffect(() => {
    // ✅ fetchGenericSchedule với usecase_type="precheck"
    dispatch(fetchGenericSchedule({ usecase_type: USECASE_TYPE }));
    dispatch(fetchPrecheckHistory({ hours: 48, page_size: 200 }));
  }, [dispatch]);

  // Flash khi schedule status thay đổi
  useEffect(() => {
    const changed = schedules
      .filter((s) => {
        const prev = prevSchedules.current.find((p) => p.id === s.id);
        return prev && prev.last_run_status !== s.last_run_status;
      })
      .map((s) => s.id);
    if (changed.length) {
      setFlashIds(new Set(changed));
      setTimeout(() => setFlashIds(new Set()), 1000);
    }
    prevSchedules.current = schedules;
  }, [schedules]);

  // ── Computed KPIs ──────────────────────────────────────────────────────
  const totalRuns   = items.length;
  const okRuns      = items.filter((i) => i.status === "success").length;
  const partialRuns = items.filter((i) => i.status === "warning").length;
  const failedRuns  = items.filter((i) => i.status === "failed").length;
  const successRate = totalRuns ? Math.round((okRuns / totalRuns) * 100) : 0;
  const activeSched = schedules.filter((s) => s.enabled).length;

  // ── Group by platform ──────────────────────────────────────────────────
  const byPlatform = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const p = item.platform || "unknown";
      if (!map[p]) map[p] = [];
      map[p].push(item);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  // ── Timeline (24h grouped by hour) cho Recharts ───────────────────────
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
      const h = new Date(now);
      h.setHours(h.getHours() - (23 - i), 0, 0, 0);
      const next = new Date(h); next.setHours(h.getHours() + 1);
      const bucket = items.filter((it) => {
        const t = new Date(it.execution_time);
        return t >= h && t < next;
      });
      return {
        hour:    `${String(h.getHours()).padStart(2, "0")}:00`,
        ok:      bucket.filter((x) => x.status === "success").length,
        failed:  bucket.filter((x) => x.status !== "success").length,
      };
    });
  }, [items]);

  // ── Recent 10 runs ────────────────────────────────────────────────────
  const recent = useMemo(() =>
    [...items]
      .sort((a, b) => new Date(b.execution_time) - new Date(a.execution_time))
      .slice(0, 10),
    [items]
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />
      <div className="container-fluid px-3 py-3">

        {/* ── KPI row ──────────────────────────────────────────────────── */}
        <Row className="g-3 mb-3">
          <Col xs={6} md={3}>
            <KpiCard label="Tổng lần chạy (48h)" value={totalRuns}
              sub="Manual + Scheduled" accent="#0d6efd"/>
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Tỷ lệ thành công" value={`${successRate}%`}
              sub={`${okRuns} OK / ${totalRuns} lần`} accent="#198754"/>
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Lịch đang hoạt động" value={activeSched}
              sub={`/ ${schedules.length} lịch tổng`} accent="#0dcaf0"/>
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="NOK / Failed" value={failedRuns + partialRuns}
              sub={`${failedRuns} failed, ${partialRuns} partial`} accent="#dc3545"/>
          </Col>
        </Row>

        {/* ── Schedule chips ────────────────────────────────────────────── */}
        {schedules.length > 0 && (
          <Card className="mb-3 shadow-sm">
            <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa", fontSize: "0.88rem" }}>
              📅 Lịch đang chạy
              <Button size="sm" variant="link" className="ms-2 p-0"
                style={{ fontSize: "0.78rem" }}
                onClick={() => navigate("/precheck/schedule")}>
                Quản lý →
              </Button>
            </Card.Header>
            <Card.Body className="py-2">
              <div className="d-flex flex-wrap gap-2">
                {schedules.map((s) => (
                  <ScheduleChip
                    key={s.id}
                    schedule={s}
                    onClick={setSelectedSched}
                    flash={flashIds.has(s.id)}
                  />
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* ── Bar chart 24h (Recharts) ─────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa", fontSize: "0.88rem" }}>
            📊 Hoạt động 24h qua
            {loading && <Spinner size="sm" animation="border" className="ms-2"/>}
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={12} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "#6c757d" }}
                  tickLine={false} axisLine={false}
                  interval={3}
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false}/>
                <Tooltip
                  contentStyle={{ fontSize: "0.78rem", borderRadius: 6 }}
                  formatter={(val, name) => [val, name === "ok" ? "✅ OK" : "❌ Failed"]}
                />
                <Bar dataKey="ok"     fill={STATUS_BAR_COLORS.ok}     stackId="a" radius={[0, 0, 0, 0]}/>
                <Bar dataKey="failed" fill={STATUS_BAR_COLORS.failed}  stackId="a" radius={[3, 3, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        <Row className="g-3 mb-3">
          {/* ── Platform status ──────────────────────────────────────────── */}
          <Col lg={8}>
            <Card className="shadow-sm h-100">
              <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa", fontSize: "0.88rem" }}>
                🖥️ Trạng thái theo Platform (48h)
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0" style={{ fontSize: "0.8rem" }}>
                  <thead style={{ background: "#e9ecef" }}>
                    <tr>
                      <th>Platform</th>
                      <th style={{ textAlign: "center" }}>Tổng</th>
                      <th style={{ textAlign: "center", color: "#198754" }}>✅</th>
                      <th style={{ textAlign: "center", color: "#fd7e14" }}>⚠</th>
                      <th style={{ textAlign: "center", color: "#dc3545" }}>🔴</th>
                      <th style={{ minWidth: 120 }}>Tỷ lệ</th>
                      <th>Lần cuối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={7} className="text-center py-3">
                        <Spinner size="sm" animation="border"/>
                      </td></tr>
                    )}
                    {!loading && byPlatform.length === 0 && (
                      <tr><td colSpan={7} className="text-center text-muted py-3">
                        Không có dữ liệu 48h qua
                      </td></tr>
                    )}
                    {byPlatform.map(([plt, its]) => {
                      const total   = its.length;
                      const ok      = its.filter((i) => i.status === "success").length;
                      const warning = its.filter((i) => i.status === "warning").length;
                      const failed  = its.filter((i) => i.status === "failed").length;
                      const pct     = total ? Math.round((ok / total) * 100) : 0;
                      const variant = pct === 100 ? "success" : pct >= 70 ? "warning" : "danger";
                      return (
                        <tr key={plt}>
                          <td style={{ fontWeight: 600 }}>
                            <code style={{ background: "#f1f3f5", padding: "1px 6px", borderRadius: 3 }}>
                              {plt}
                            </code>
                          </td>
                          <td className="text-center">{total}</td>
                          <td className="text-center" style={{ color: "#198754", fontWeight: 600 }}>{ok}</td>
                          <td className="text-center" style={{ color: "#fd7e14", fontWeight: 600 }}>{warning}</td>
                          <td className="text-center" style={{ color: "#dc3545", fontWeight: 600 }}>{failed}</td>
                          <td>
                            <ProgressBar now={pct} variant={variant} style={{ height: 8 }}
                              label={`${pct}%`}/>
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "#6c757d" }}>
                            {fmtDate(its[0]?.execution_time)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* ── Selected schedule detail ─────────────────────────────────── */}
          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa", fontSize: "0.88rem" }}>
                {selectedSched ? `📋 ${selectedSched.name}` : "📋 Chi tiết lịch"}
              </Card.Header>
              <Card.Body>
                {!selectedSched ? (
                  <div className="text-muted text-center py-4" style={{ fontSize: "0.84rem" }}>
                    Click vào một lịch để xem chi tiết
                  </div>
                ) : (
                  <div style={{ fontSize: "0.84rem" }}>
                    {[
                      ["Platform",  <code>{selectedSched.platform}</code>],
                      ["Cron",      <code>{selectedSched.cron}</code>],
                      ["Trạng thái", selectedSched.enabled
                        ? <Badge bg="success">Đang bật</Badge>
                        : <Badge bg="secondary">Đã tắt</Badge>],
                      ["Kết quả cuối",
                        <Badge
                          style={{
                            background: (STATUS_CFG[selectedSched.last_run_status] || STATUS_CFG.null).bg,
                            color: "white",
                          }}
                        >
                          {(STATUS_CFG[selectedSched.last_run_status] || STATUS_CFG.null).icon}{" "}
                          {(STATUS_CFG[selectedSched.last_run_status] || STATUS_CFG.null).label}
                        </Badge>
                      ],
                      ["Lần chạy cuối", fmtDate(selectedSched.last_run_at)],
                      ["Group", selectedSched.owner_group || "—"],
                      ["Thiết bị",
                        <span title={(selectedSched.node_names || []).join(", ")}>
                          {(selectedSched.node_names || []).length} node(s)
                        </span>
                      ],
                    ].map(([label, val]) => (
                      <div key={label} className="d-flex justify-content-between mb-2"
                        style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 4 }}>
                        <span className="text-muted">{label}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                    <div className="mt-3">
                      <div className="text-muted mb-1" style={{ fontSize: "0.78rem" }}>Thiết bị:</div>
                      <div className="d-flex flex-wrap gap-1">
                        {(selectedSched.node_names || []).map((n) => (
                          <Badge key={n} bg="light" text="dark" className="border">
                            {n}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ── Recent 10 runs ────────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <Card.Header className="fw-semibold py-2 d-flex justify-content-between align-items-center"
            style={{ background: "#f8f9fa", fontSize: "0.88rem" }}>
            <span>🕐 10 lần chạy gần nhất</span>
            <Button size="sm" variant="outline-primary" style={{ fontSize: "0.75rem" }}
              onClick={() => navigate("/precheck/history")}>
              Xem toàn bộ →
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.8rem" }}>
              <thead style={{ background: "#343a40", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Platform</th>
                  <th>Node</th>
                  <th style={{ textAlign: "center" }}>Trạng thái</th>
                  <th>Loại</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="text-center py-3">
                    <Spinner size="sm" animation="border"/>
                  </td></tr>
                )}
                {!loading && recent.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-3">
                    Chưa có dữ liệu
                  </td></tr>
                )}
                {recent.map((item, idx) => {
                  const s = STATUS_CFG[item.status] || STATUS_CFG.null;
                  const nodes = Array.isArray(item.nodes_attempted)
                    ? item.nodes_attempted.join(", ")
                    : item.nodes_attempted;
                  return (
                    <tr key={item.id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td style={{ color: "#6c757d" }}>{fmtDate(item.execution_time)}</td>
                      <td>
                        <code style={{ background: "#f1f3f5", padding: "1px 5px", borderRadius: 3, fontSize: "0.78rem" }}>
                          {item.platform}
                        </code>
                      </td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nodes}
                      </td>
                      <td className="text-center">
                        <Badge style={{ background: s.bg, color: s.text, fontSize: "0.72rem" }}>
                          {s.icon} {s.label}
                        </Badge>
                      </td>
                      <td style={{ color: "#6c757d" }}>
                        {item.usecase === "precheck_manual" ? "Manual" : "Scheduled"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default PrecheckDashboard;
