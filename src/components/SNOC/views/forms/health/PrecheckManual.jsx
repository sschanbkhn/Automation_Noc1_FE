// pages/Precheck/PrecheckManual.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Alert, Badge, Button, Card, Col, Collapse,
  Form, ProgressBar, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  fetchPrecheckParamConfig,
  runManualPrecheck,
  clearManualResult,
} from "../../../redux/Healthcheck/precheckSlice";
import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import { SERVER_MEDIA } from "../../../config/constant";

// ── Constants ─────────────────────────────────────────────────────────────
const KQ_STYLE = {
  OK:  { bg: "#198754", color: "white", icon: "✓" },
  NOK: { bg: "#dc3545", color: "white", icon: "✗" },
};
const KQ_DEFAULT   = { bg: "#e9ecef", color: "#6c757d", icon: "—" };
const GROUP_COLORS = [
  "#0d6efd","#dc3545","#fd7e14","#6610f2",
  "#198754","#0dcaf0","#6c757d","#20c997","#d63384",
];
const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

// ── Helpers ───────────────────────────────────────────────────────────────
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

// ── GroupDot ──────────────────────────────────────────────────────────────
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

// ── SummaryBar ────────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────
const PrecheckManual = () => {
  const dispatch = useDispatch();

  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const {
    running = false, manualResult = null, manualError = null,
    paramConfig = [], paramConfigReady = false,
  } = useSelector((s) => s.precheck || {});

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedDevices,  setSelectedDevices]  = useState([]);
  const [expandedHosts,    setExpandedHosts]    = useState({});
  const isEditingRef = useRef(false);

  // Fetch on mount
  useEffect(() => { dispatch(fetchPlatforms()); }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatform?.value;
    if (val) {
      dispatch(fetchDevicesByPlatform(val));
      dispatch(fetchPrecheckParamConfig(val));
    }
    if (!isEditingRef.current) setSelectedDevices([]);
    isEditingRef.current = false;
    dispatch(clearManualResult());
  }, [dispatch, selectedPlatform]);

  useEffect(() => { setExpandedHosts({}); }, [manualResult]);

  // Derived
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

  // Handlers
  const handleDeviceChange = (sel) => {
    if (!sel) return setSelectedDevices([]);
    setSelectedDevices(sel.find((o) => o.value === "__all__") ? deviceOptions : sel);
  };

  const handleRun = () => {
    if (!selectedPlatform) return alert("Vui lòng chọn platform");
    if (!selectedDevices.length) return alert("Vui lòng chọn ít nhất 1 thiết bị");
    dispatch(runManualPrecheck({
      platform:   selectedPlatform.value,
      node_names: selectedDevices.map((d) => d.value),
    }));
  };

  const expandAll = () => {
    const all = {};
    (manualResult?.results || []).forEach((r) => { all[r.hostname] = true; });
    setExpandedHosts(all);
  };
  const collapseAll  = () => setExpandedHosts({});
  const toggleExpand = (host) =>
    setExpandedHosts((p) => ({ ...p, [host]: !p[host] }));

  // Export Excel
  const handleExport = () => {
    if (!manualResult) return;
    const { results = [], platform } = manualResult;
    const rows = [];
    results.forEach((r) => {
      (r.ketquaprecheck || []).forEach((grp) => {
        (grp.congviecchitiet || []).forEach((task) => {
          rows.push({
            "Hostname":         r.hostname,
            "IP":               r.ip,
            "Platform":         platform,
            "Nhóm":             `Nhóm ${grp.idnhomcongviec}`,
            "Tên kiểm tra":     task.tencongviecchitiet,
            "Câu lệnh":         task.caulenh,
            "Tiêu chí":         task.tieuchidanhgia,
            "Kết quả":          task.ketqua,
            "Chi tiết lỗi":     task.chitietloi || "",
            "Bắt đầu":          r.thoigianbatdauPrecheck,
            "Kết thúc":         r.thoigianketthucPrecheck,
          });
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Precheck");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" }),
      `precheck_${platform}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const results = manualResult?.results || [];

  return (
    <>
      <TopNavbarHealth />
      <div className="container-fluid px-3 py-3">

        {/* ── Control card ─────────────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa" }}>
            🔍 Precheck Manual
          </Card.Header>
          <Card.Body>
            <Row className="g-2 align-items-end">
              <Col md={3}>
                <Form.Label className="small mb-1">Platform</Form.Label>
                <Select
                  options={platformOptions}
                  value={selectedPlatform}
                  onChange={(v) => { isEditingRef.current = false; setSelectedPlatform(v); }}
                  placeholder="Chọn platform..."
                  isClearable
                  styles={SELECT_STYLES}
                />
              </Col>
              <Col md={5}>
                <Form.Label className="small mb-1">
                  Thiết bị{" "}
                  {loadingDevices && <Spinner size="sm" animation="border" className="ms-1"/>}
                </Form.Label>
                <Select
                  isMulti
                  options={combinedOptions}
                  value={selectedDevices}
                  onChange={handleDeviceChange}
                  placeholder="Chọn thiết bị..."
                  isDisabled={!selectedPlatform || loadingDevices}
                  styles={SELECT_STYLES}
                  closeMenuOnSelect={false}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="primary"
                  onClick={handleRun}
                  disabled={running || !selectedPlatform || !selectedDevices.length}
                >
                  {running
                    ? <><Spinner size="sm" animation="border" className="me-1"/> Đang chạy...</>
                    : "▶ Chạy Precheck"}
                </Button>
              </Col>
              {results.length > 0 && (
                <>
                  <Col md="auto">
                    <Button size="sm" variant="outline-secondary" onClick={expandAll}>Mở tất cả</Button>
                  </Col>
                  <Col md="auto">
                    <Button size="sm" variant="outline-secondary" onClick={collapseAll}>Đóng tất cả</Button>
                  </Col>
                  <Col md="auto">
                    <Button size="sm" variant="outline-success" onClick={handleExport}>⬇ Excel</Button>
                  </Col>
                </>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* ── Error alert ───────────────────────────────────────────────── */}
        {manualError && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearManualResult())}>
            <strong>Lỗi:</strong> {manualError}
          </Alert>
        )}

        {/* ── Running placeholder ───────────────────────────────────────── */}
        {running && (
          <Card body className="text-center py-5 shadow-sm mb-3">
            <Spinner animation="border" variant="primary" className="mb-2"/>
            <div className="text-muted small">Đang chạy Precheck, vui lòng chờ...</div>
          </Card>
        )}

        {/* ── Summary bar ───────────────────────────────────────────────── */}
        {!running && manualResult && (
          <SummaryBar summary={manualResult.summary} />
        )}

        {/* ── Results table ─────────────────────────────────────────────── */}
        {!running && results.length > 0 && (
          <Card className="shadow-sm mb-3">
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0" style={{ tableLayout: "fixed" }}>
                <thead style={{ background: "#343a40", color: "white", fontSize: "0.8rem" }}>
                  <tr>
                    <th style={{ width: 36 }}/>
                    <th style={{ width: 160 }}>Hostname</th>
                    <th style={{ width: 120 }}>IP</th>
                    <th style={{ width: 90,  textAlign: "center" }}>Kết quả</th>
                    <th style={{ width: 80,  textAlign: "center" }}>Nhóm Pass</th>
                    <th>Thời gian</th>
                    <th style={{ width: 80,  textAlign: "center" }}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const isOpen    = !!expandedHosts[r.hostname];
                    const overallOk = r.statusCode === 200;
                    const groups    = r.ketquaprecheck || [];
                    const okGroups  = groups.filter(
                      (g) => calcGroupStatus(g.congviecchitiet) === "OK"
                    ).length;

                    return (
                      <React.Fragment key={r.hostname}>
                        <tr
                          style={{ cursor: "pointer", background: isOpen ? "#f0f4ff" : "white" }}
                          onClick={() => toggleExpand(r.hostname)}
                        >
                          <td className="text-center" style={{ fontSize: "0.7rem" }}>
                            {isOpen ? "▼" : "▶"}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: "0.83rem" }}>{r.hostname}</td>
                          <td style={{ fontSize: "0.8rem", color: "#495057" }}>{r.ip || "—"}</td>
                          <td className="text-center">
                            <Badge
                              bg={overallOk ? "success" : "danger"}
                              style={{ fontSize: "0.75rem" }}
                            >
                              {overallOk ? "✓ OK" : "✗ NOK"}
                            </Badge>
                          </td>
                          <td className="text-center" style={{ fontSize: "0.8rem" }}>
                            <span style={{ color: okGroups === groups.length ? "#198754" : "#dc3545", fontWeight: 600 }}>
                              {okGroups}/{groups.length}
                            </span>
                            {/* group status dots */}
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

                        {/* Detail collapse row */}
                        <tr style={{ background: "#f8f9fa" }}>
                          <td colSpan={7} style={{ padding: 0, border: 0 }}>
                            <Collapse in={isOpen}>
                              <div>
                                <div style={{ margin: "0 8px 8px 36px", borderLeft: "4px solid #0d6efd", borderRadius: "0 4px 4px 0" }}>
                                  <Table bordered size="sm" className="mb-0" style={{ background: "white" }}>
                                    <thead>
                                      <tr style={{ background: "#e9ecef", fontSize: "0.76rem" }}>
                                        <th style={{ width: 130 }}>Nhóm</th>
                                        <th>Tên kiểm tra</th>
                                        <th style={{ minWidth: 160 }}>Câu lệnh</th>
                                        <th style={{ minWidth: 160 }}>Tiêu chí</th>
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
                                              <td style={{ fontSize: "0.79rem" }}>{task.tencongviecchitiet}</td>
                                              <td>
                                                <code style={{
                                                  background: "#f1f3f5", padding: "1px 5px",
                                                  borderRadius: 3, fontSize: "0.72rem",
                                                  wordBreak: "break-all", color: "#495057",
                                                }}>
                                                  {task.caulenh || "—"}
                                                </code>
                                              </td>
                                              <td style={{ fontSize: "0.77rem", color: "#0d6efd", fontStyle: "italic" }}>
                                                {task.tieuchidanhgia}
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
                                              <td style={{ fontSize: "0.77rem", color: task.ketqua === "NOK" ? "#dc3545" : "#6c757d" }}>
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

        {/* Empty state */}
        {!running && manualResult && results.length === 0 && (
          <Card body className="text-center text-muted py-4">
            Không có kết quả — kiểm tra lại platform hoặc thiết bị
          </Card>
        )}
      </div>
    </>
  );
};

export default PrecheckManual;
