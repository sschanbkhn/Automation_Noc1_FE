import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import Select from "react-select";
import {
  CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import snocApi from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const today         = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const PLAT_PAGE_SIZE = 10;
const DEV_PAGE_SIZE  = 10;

// ── Sub-components ────────────────────────────────────────────────────────────

const KpiCard = ({ title, value, variant = "primary" }) => (
  <Card className="text-center shadow-sm h-100">
    <Card.Body className="py-3">
      <div className="text-muted small mb-1">{title}</div>
      <div className={`fs-3 fw-bold text-${variant}`}>{value ?? "—"}</div>
    </Card.Body>
  </Card>
);

const TablePaginator = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const start = Math.max(1, currentPage - 2);
  const pages = Array.from(
    { length: Math.min(5, totalPages - start + 1) },
    (_, i) => start + i
  ).filter((p) => p <= totalPages);
  return (
    <Pagination size="sm" className="justify-content-center mt-2 mb-0">
      <Pagination.Prev disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} />
      {pages.map((p) => (
        <Pagination.Item key={p} active={p === currentPage} onClick={() => onPageChange(p)}>
          {p}
        </Pagination.Item>
      ))}
      <Pagination.Next disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} />
    </Pagination>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const HealthcheckExternalStats = () => {
  const [dateFrom,   setDateFrom]   = useState(thirtyDaysAgo);
  const [dateTo,     setDateTo]     = useState(today);
  const [platforms,  setPlatforms]  = useState([]);
  const [platOptions, setPlatOptions] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const [kpiCards,        setKpiCards]        = useState(null);
  const [trendData,       setTrendData]       = useState([]);
  const [platBreakdown,   setPlatBreakdown]   = useState([]);
  const [topNokDevices,   setTopNokDevices]   = useState([]);
  const [recentRuns,      setRecentRuns]      = useState({ count: 0, results: [] });

  const [platPage,  setPlatPage]  = useState(1);
  const [devPage,   setDevPage]   = useState(1);
  const [runsPage,  setRunsPage]  = useState(1);

  // Fetch platform options
  useEffect(() => {
    snocApi.get("nornirps/NornirGetPlatformView/")
      .then((res) => {
        setPlatOptions(
          (res.data || []).map((p) => ({
            label: `${p.name} (${p.device_count ?? 0})`,
            value: p.name,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const fetchStats = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("date_from", dateFrom);
      params.set("date_to",   dateTo);
      platforms.forEach((p) => params.append("platform", p.value));
      params.set("page", page);

      const res = await snocApi.get(`nornirps/healthcheck/external/stats/?${params}`);
      const d   = res.data;

      setKpiCards(d.kpi_cards);
      setTrendData(d.trend_data || []);
      setPlatBreakdown(d.platform_breakdown || []);
      setTopNokDevices(d.top_nok_devices || []);
      setRecentRuns(d.recent_runs || { count: 0, results: [] });
      setPlatPage(1);
      setDevPage(1);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, platforms]);

  useEffect(() => { fetchStats(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunsPageChange = (page) => {
    setRunsPage(page);
    fetchStats(page);
  };

  // Client-side paginated slices
  const platPageData = useMemo(() => {
    const s = (platPage - 1) * PLAT_PAGE_SIZE;
    return platBreakdown.slice(s, s + PLAT_PAGE_SIZE);
  }, [platBreakdown, platPage]);

  const devPageData = useMemo(() => {
    const s = (devPage - 1) * DEV_PAGE_SIZE;
    return topNokDevices.slice(s, s + DEV_PAGE_SIZE);
  }, [topNokDevices, devPage]);

  const platTotalPages = Math.ceil(platBreakdown.length / PLAT_PAGE_SIZE);
  const devTotalPages  = Math.ceil(topNokDevices.length / DEV_PAGE_SIZE);
  const runsTotalPages = Math.ceil((recentRuns.count || 0) / 20);

  const okRateVariant = kpiCards
    ? kpiCards.ok_rate >= 90 ? "success" : kpiCards.ok_rate >= 70 ? "warning" : "danger"
    : "secondary";

  const nokPctVariant = (pct) => pct > 20 ? "danger" : pct > 5 ? "warning" : "success";

  return (
    <>
      <TopNavbarHealth />
      <div className="container-fluid px-3 py-3">

        {/* ── Filter bar ──────────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2 small" style={{ background: "#f8f9fa" }}>
            Healthcheck External — Thống kê báo cáo
          </Card.Header>
          <Card.Body className="py-2">
            <Row className="g-2 align-items-end">
              <Col md={3}>
                <Form.Label className="small mb-1">Từ ngày</Form.Label>
                <Form.Control
                  type="date" size="sm"
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="small mb-1">Đến ngày</Form.Label>
                <Form.Control
                  type="date" size="sm"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small mb-1">Platform</Form.Label>
                <Select
                  isMulti
                  options={platOptions}
                  value={platforms}
                  onChange={setPlatforms}
                  placeholder="Tất cả platform..."
                  styles={SELECT_STYLES}
                  closeMenuOnSelect={false}
                />
              </Col>
              <Col md="auto" className="d-flex align-items-end">
                <Button
                  variant="primary" size="sm"
                  disabled={loading}
                  onClick={() => { setRunsPage(1); fetchStats(1); }}
                >
                  {loading
                    ? <><Spinner size="sm" animation="border" className="me-1" />Đang tải...</>
                    : "Áp dụng"}
                </Button>
              </Col>
            </Row>
            {error && <div className="text-danger mt-2 small">{error}</div>}
          </Card.Body>
        </Card>

        {/* ── KPI cards ────────────────────────────────────────────── */}
        <Row className="g-3 mb-3">
          <Col md={3}>
            <KpiCard
              title="Tổng lần chạy"
              value={kpiCards?.total_runs?.toLocaleString()}
              variant="primary"
            />
          </Col>
          <Col md={3}>
            <KpiCard
              title="Tổng lượt kiểm tra thiết bị"
              value={kpiCards?.total_device_checks?.toLocaleString()}
              variant="info"
            />
          </Col>
          <Col md={3}>
            <KpiCard
              title="Tỷ lệ OK"
              value={kpiCards ? `${kpiCards.ok_rate}%` : null}
              variant={okRateVariant}
            />
          </Col>
          <Col md={3}>
            <KpiCard
              title="Platform NOK nhiều nhất"
              value={kpiCards?.most_nok_platform}
              variant="danger"
            />
          </Col>
        </Row>

        {/* ── Trend chart ──────────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2 small">
            Xu hướng theo ngày — OK vs NOK
          </Card.Header>
          <Card.Body>
            {!loading && trendData.length === 0 && (
              <div className="text-muted text-center py-3 small">Không có dữ liệu</div>
            )}
            {trendData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.75rem" }} />
                  <Line type="monotone" dataKey="ok"  name="OK"  stroke="#198754" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
                  <Line type="monotone" dataKey="nok" name="NOK" stroke="#dc3545" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>

        {/* ── Platform breakdown ───────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2 small">
            Thống kê theo Platform
            {platBreakdown.length > 0 && (
              <Badge bg="secondary" className="ms-2">{platBreakdown.length}</Badge>
            )}
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Platform</th>
                  <th className="text-center">Runs</th>
                  <th className="text-center">OK</th>
                  <th className="text-center">NOK</th>
                  <th className="text-center">NOK %</th>
                  <th className="text-center">Thời gian TB (s)</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="text-center py-3"><Spinner size="sm" animation="border" /></td></tr>
                )}
                {!loading && platPageData.map((r, i) => (
                  <tr key={i}>
                    <td className="fw-semibold">{r.platform}</td>
                    <td className="text-center">{r.runs}</td>
                    <td className="text-center text-success fw-semibold">{r.ok}</td>
                    <td className="text-center text-danger fw-semibold">{r.nok}</td>
                    <td className="text-center">
                      <Badge bg={nokPctVariant(r.nok_pct)}>{r.nok_pct}%</Badge>
                    </td>
                    <td className="text-center text-muted">{r.avg_duration ?? "—"}</td>
                  </tr>
                ))}
                {!loading && platBreakdown.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-3 small">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </Table>
            <div className="px-3">
              <TablePaginator currentPage={platPage} totalPages={platTotalPages} onPageChange={setPlatPage} />
            </div>
          </Card.Body>
        </Card>

        {/* ── Top NOK devices ──────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2 small">Top NOK Devices</Card.Header>
          <Card.Body className="p-0">
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Host</th>
                  <th>IP</th>
                  <th>Platform</th>
                  <th className="text-center">Tổng lần KT</th>
                  <th className="text-center">NOK</th>
                  <th className="text-center">NOK %</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-3"><Spinner size="sm" animation="border" /></td></tr>
                )}
                {!loading && devPageData.map((r, i) => (
                  <tr key={i} className={r.nok_pct > 50 ? "table-danger" : ""}>
                    <td className="text-muted">{(devPage - 1) * DEV_PAGE_SIZE + i + 1}</td>
                    <td className="fw-semibold">{r.host}</td>
                    <td className="text-muted">{r.ip || "—"}</td>
                    <td>{r.platform}</td>
                    <td className="text-center">{r.total_checks}</td>
                    <td className="text-center text-danger fw-bold">{r.nok_count}</td>
                    <td className="text-center">
                      <Badge bg={nokPctVariant(r.nok_pct)}>{r.nok_pct}%</Badge>
                    </td>
                  </tr>
                ))}
                {!loading && topNokDevices.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-3 small">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </Table>
            <div className="px-3">
              <TablePaginator currentPage={devPage} totalPages={devTotalPages} onPageChange={setDevPage} />
            </div>
          </Card.Body>
        </Card>

        {/* ── Recent runs history ──────────────────────────────────── */}
        <Card className="shadow-sm mb-3">
          <Card.Header className="fw-semibold py-2 small">
            Lịch sử các lần chạy
            {recentRuns.count > 0 && (
              <Badge bg="secondary" className="ms-2">{recentRuns.count} runs</Badge>
            )}
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Thời gian</th>
                  <th>Platform</th>
                  <th className="text-center">Nodes</th>
                  <th className="text-center">OK</th>
                  <th className="text-center">NOK</th>
                  <th className="text-center">Duration (s)</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-3"><Spinner size="sm" animation="border" /></td></tr>
                )}
                {!loading && recentRuns.results.map((r, i) => (
                  <tr key={i} className={r.nok > 0 ? "table-warning" : ""}>
                    <td style={{ fontSize: "0.82rem" }}>
                      {r.run_time ? new Date(r.run_time).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td>{r.platform}</td>
                    <td className="text-center">{r.nodes}</td>
                    <td className="text-center text-success fw-semibold">{r.ok}</td>
                    <td className="text-center text-danger fw-semibold">{r.nok}</td>
                    <td className="text-center text-muted">{r.duration ?? "—"}</td>
                    <td className="text-center">
                      <Badge bg={r.status === "OK" ? "success" : "danger"}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
                {!loading && recentRuns.results.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-3 small">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </Table>
            <div className="px-3">
              <TablePaginator currentPage={runsPage} totalPages={runsTotalPages} onPageChange={handleRunsPageChange} />
            </div>
          </Card.Body>
        </Card>

      </div>
    </>
  );
};

export default HealthcheckExternalStats;
