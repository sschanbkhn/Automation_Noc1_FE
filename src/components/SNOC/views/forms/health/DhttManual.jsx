import React, { useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Badge, Button, Card, Col, Collapse, Form,
  OverlayTrigger, ProgressBar, Row,
  Spinner, Table, Tooltip,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import { fetchDhttParamConfig, runManualDhtt } from "../../../redux/Healthcheck/dhttSlice";
import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import { SERVER_MEDIA } from "../../../config/constant";
// ── Constants ─────────────────────────────────────────────────────────────
const GROUP_COLORS = ["#0d6efd", "#dc3545", "#fd7e14", "#6610f2", "#198754",
                      "#0dcaf0", "#6c757d", "#20c997"];

const KQ_STYLE = {
  0: { bg: "#dc3545", color: "white",   icon: "✗", label: "FAIL" },
  1: { bg: "#198754", color: "white",   icon: "✓", label: "PASS" },
  2: { bg: "#e9ecef", color: "#6c757d", icon: "—", label: "SKIP" },
};

const MULTI_SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const calcGroupStatus = (kqMap, ids) => {
  const vals = ids.map(id => kqMap[id]?.ket_qua);
  if (vals.some(v => v === 0))          return "FAIL";
  if (vals.every(v => v === 1))         return "PASS";
  if (vals.every(v => v === 2))         return "SKIP";
  if (vals.some(v => v === 1 || v === 2)) return "PARTIAL";
  return "SKIP";
};

const GroupDot = ({ status }) => {
  const map = {
    PASS:    { bg: "#198754", icon: "✓" },
    FAIL:    { bg: "#dc3545", icon: "✗" },
    PARTIAL: { bg: "#fd7e14", icon: "~" },
    SKIP:    { bg: "#adb5bd", icon: "—" },
  };
  const s = map[status] || map.SKIP;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, background: s.bg, color: "white",
      borderRadius: "50%", fontWeight: "bold", fontSize: "0.85rem",
    }}>
      {s.icon}
    </span>
  );
};

// ── KetQuaCell ────────────────────────────────────────────────────────────
const KetQuaCell = ({ kq, idLabel }) => {
  if (!kq) return (
    <td style={{ textAlign: "center", background: "#f8f9fa", color: "#adb5bd" }}>—</td>
  );
  const s = KQ_STYLE[kq.ket_qua] ?? KQ_STYLE[2];
  const cell = (
    <td style={{
      background: s.bg, color: s.color, textAlign: "center",
      fontWeight: "bold", fontSize: "0.85rem", padding: "5px 4px",
      cursor: kq.ket_qua === 0 ? "help" : "default",
    }}>
      {s.icon}
    </td>
  );
  if (kq.ket_qua === 0 && kq.fail_description) {
    return (
      <OverlayTrigger placement="top" overlay={
        <Tooltip>
          <div className="text-start" style={{ maxWidth: 280 }}>
            <strong>#{kq.id_thamso} — {idLabel?.detail}</strong>
            <hr className="my-1" />
            {kq.fail_description}
          </div>
        </Tooltip>
      }>
        {cell}
      </OverlayTrigger>
    );
  }
  return cell;
};

// ── Component ─────────────────────────────────────────────────────────────
const DhttManual = () => {
  const dispatch = useDispatch();

  const { platforms = [], devices = [], loadingDevices = false } =
    useSelector((s) => s.platformDevice || {});
  const {
    running = false, manualResult = null,
    paramConfig = [], paramConfigReady = false,
  } = useSelector((s) => s.dhtt || {});

  const [selectedPlatformOption, setSelectedPlatformOption] = useState(null);
  const [selectedDevices,        setSelectedDevices]        = useState([]);
  const [expandedHosts,          setExpandedHosts]          = useState({});
  const isEditingRef = useRef(false);

  useEffect(() => { dispatch(fetchPlatforms()); }, [dispatch]);

  useEffect(() => {
    const val = selectedPlatformOption?.value;
    if (val) {
      dispatch(fetchDevicesByPlatform(val));
      dispatch(fetchDhttParamConfig(val));   // ← fetch config theo platform
    }
    if (!isEditingRef.current) setSelectedDevices([]);
    isEditingRef.current = false;
  }, [dispatch, selectedPlatformOption]);

  useEffect(() => { setExpandedHosts({}); }, [manualResult]);

  // ── Derived từ paramConfig (dynamic theo platform) ────────────────────
  const ID_LABELS = useMemo(() => {
    const map = {};
    paramConfig.forEach(p => { map[p.id] = p; });
    return map;
  }, [paramConfig]);

  const REQUIRED_IDS = useMemo(() =>
    paramConfig.map(p => p.id),
  [paramConfig]);

  const GROUPS = useMemo(() => {
    const groupMap = {};
    paramConfig.forEach(p => {
      if (!groupMap[p.group]) groupMap[p.group] = { label: p.group, ids: [] };
      groupMap[p.group].ids.push(p.id);
    });
    return Object.values(groupMap).map((g, i) => ({
      ...g,
      abbr:  g.label.replace("Kiểm tra ", ""),
      color: GROUP_COLORS[i] || "#6c757d",
    }));
  }, [paramConfig]);

  const platformOptions = useMemo(() =>
    platforms.map(p => ({
      label: `${p.name} (${p.device_count ?? 0})`,
      value: p.name,
    })),
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
    if (!selectedPlatformOption) return alert("Vui lòng chọn platform");
    if (!selectedDevices.length) return alert("Vui lòng chọn ít nhất 1 thiết bị");
    dispatch(runManualDhtt({
      platform:   selectedPlatformOption.value,
      node_names: selectedDevices.map(d => d.value),
    }));
  };

  const toggleExpand = (host) =>
    setExpandedHosts(p => ({ ...p, [host]: !p[host] }));
  const expandAll = () => {
    const all = {};
    (manualResult?.outputs || []).forEach(r => { all[r.host] = true; });
    setExpandedHosts(all);
  };
  const collapseAll = () => setExpandedHosts({});

  // ── Export Excel ─────────────────────────────────────────────────────
  const handleExport = () => {
    if (!manualResult) return;
    const { outputs = [], dhtt_sync, platform } = manualResult;

    const sheet1 = outputs.map(r => {
      const kqMap = {};
      (r.dhtt_kqbd || []).forEach(k => { kqMap[k.id_thamso] = k; });
      const row = { Host: r.host, IP: r.ip || "—", "HC Status": r.status };
      REQUIRED_IDS.forEach(id => {
        const kq  = kqMap[id];
        const lbl = ID_LABELS[id];
        row[`[${id}] ${lbl?.detail || id}`] =
          kq ? ["FAIL", "PASS", "SKIP"][kq.ket_qua] ?? "—" : "—";
        if (kq?.ket_qua === 0)
          row[`[${id}] Mô tả lỗi`] = kq.fail_description || "";
      });
      row["ĐHTT HTTP"]    = dhtt_sync?.status_code || "—";
      row["ĐHTT Message"] = dhtt_sync?.response?.message || "—";
      row["Bắt đầu"]      = r.starttime ? new Date(r.starttime).toLocaleString("vi-VN") : "—";
      row["Kết thúc"]     = r.endtime   ? new Date(r.endtime).toLocaleString("vi-VN")   : "—";
      return row;
    });

    const resp   = dhtt_sync?.response || {};
    const sheet2 = (dhtt_sync?.payload_sent || []).map(n => ({
      Hostname: n.hostname, IP: n.ip,
      "Ngày đánh giá": n.ngay_danh_gia,
      "Phân loại HT":  n.phan_loai_he_thong,
      "Số tham số":    (n.listKqbd || []).length,
    }));
    const sheet3 = [{
      "HTTP Code": dhtt_sync?.status_code,
      "Message":   resp.message,
      "Result":    resp.result ? "true" : "false",
      "Total":     resp.total,
      "Request ID": resp.request_id,
      "Node không tồn tại": (resp.node_khong_ton_tai || []).join(", "),
      "Mã phiếu Web ĐH":    (resp.id_phieu_web_dh || []).join(", "),
    }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet1), "Kết quả HC");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet2), "Request ĐHTT");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet3), "Response ĐHTT");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `DHTT_Manual_${platform}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const summary = manualResult?.summary;
  const outputs = manualResult?.outputs || [];
  const sync    = manualResult?.dhtt_sync;

  const kqByHost = useMemo(() => {
    const map = {};
    outputs.forEach(r => {
      map[r.host] = {};
      (r.dhtt_kqbd || []).forEach(k => { map[r.host][k.id_thamso] = k; });
    });
    return map;
  }, [outputs]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />
      <Row className="mt-3">
        <Col md={12}>

          {/* ── Form ──────────────────────────────────────────────── */}
          <Card className="mb-3">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">🛠️ Bảo Dưỡng Manual</Card.Title>
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
                    value={selectedPlatformOption}
                    onChange={opt => {
                      isEditingRef.current = false;
                      setSelectedPlatformOption(opt);
                    }}
                    placeholder="-- Tìm platform --"
                    isClearable isSearchable isDisabled={running}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold">Thiết bị</Form.Label>
                  <Select
                    isMulti isSearchable
                    closeMenuOnSelect={false} hideSelectedOptions={false}
                    options={combinedDeviceOptions}
                    value={selectedDevices}
                    onChange={handleDeviceChange}
                    placeholder="-- Chọn thiết bị --"
                    isDisabled={!selectedPlatformOption || running}
                    isLoading={loadingDevices}
                    styles={MULTI_SELECT_STYLES}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="primary" className="w-100"
                    onClick={handleRun}
                    disabled={
                      running ||
                      !selectedPlatformOption ||
                      !selectedDevices.length ||
                      !paramConfigReady
                    }
                  >
                    {running
                      ? <><Spinner size="sm" animation="border" className="me-1" />Đang chạy...</>
                      : !paramConfigReady && selectedPlatformOption
                      ? <><Spinner size="sm" animation="border" className="me-1" />Config...</>
                      : "▶️ Chạy ngay"}
                  </Button>
                </Col>
              </Row>

              {/* Cảnh báo platform chưa có config */}
              {selectedPlatformOption && paramConfigReady && paramConfig.length === 0 && (
                <div className="alert alert-warning mt-2 mb-0 py-2"
                  style={{ fontSize: "0.82rem" }}>
                  ⚠️ Platform <strong>{selectedPlatformOption.value}</strong> chưa có cấu hình
                  tham số DHTT. Liên hệ quản trị bổ sung vào{" "}
                  <code>dhtt_param_config.py</code>.
                </div>
              )}

              {running && (
                <div className="mt-3">
                  <ProgressBar animated now={100}
                    label="Đang kết nối và thu thập dữ liệu..." />
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ── Tầng 1: Bảng tóm tắt per device ──────────────────── */}
          {!running && outputs.length > 0 && (
            <Card className="mb-3">
              <Card.Header>
                <div className="d-flex align-items-center justify-content-between">
                  <Card.Title as="h6" className="mb-0">
                    Tóm tắt — <code>{manualResult?.platform}</code>
                    <span className="text-muted fw-normal ms-2" style={{ fontSize: "0.82rem" }}>
                      ({outputs.length} thiết bị • {REQUIRED_IDS.length} tiêu chí)
                    </span>
                  </Card.Title>
                  <div className="d-flex gap-2 align-items-center">
                    {/* Legend */}
                    <div className="d-flex gap-1" style={{ fontSize: "0.72rem" }}>
                      {[
                        { bg: "#198754", label: "PASS"    },
                        { bg: "#dc3545", label: "FAIL"    },
                        { bg: "#fd7e14", label: "Partial" },
                        { bg: "#adb5bd", label: "SKIP"    },
                      ].map(s => (
                        <span key={s.label} style={{
                          background: s.bg, color: "white",
                          padding: "1px 7px", borderRadius: 10,
                        }}>
                          {s.label}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={expandAll}>Mở ▾</Button>
                    <Button variant="outline-secondary" size="sm" onClick={collapseAll}>Đóng ▴</Button>
                    <Button variant="outline-success"   size="sm" onClick={handleExport}>📥 Excel</Button>
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                <Table bordered size="sm" className="align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: 30 }}></th>
                      <th style={{ minWidth: 120 }}>Host</th>
                      <th style={{ minWidth: 100 }}>IP</th>
                      <th style={{ textAlign: "center", minWidth: 70 }}>HC</th>
                      {GROUPS.map(g => (
                        <th key={g.label} style={{ textAlign: "center", minWidth: 90 }}>
                          <span style={{
                            display: "inline-block", padding: "1px 6px",
                            background: g.color, color: "white",
                            borderRadius: 4, fontSize: "0.72rem",
                          }}>
                            {g.abbr}
                          </span>
                          <div style={{ fontSize: "0.65rem", color: "#adb5bd", marginTop: 2 }}>
                            {g.ids.length} tiêu chí
                          </div>
                        </th>
                      ))}
                      <th style={{ minWidth: 80,  textAlign: "center" }}>ĐHTT</th>
                      <th style={{ width: 70, textAlign: "center" }}>Output</th>
                      <th style={{ minWidth: 100 }}>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputs.map(r => {
                      const kqMap  = kqByHost[r.host] || {};
                      const isOpen = !!expandedHosts[r.host];
                      const hcBg   =
                        r.status === "OK"  ? "table-success" :
                        r.status === "NOK" ? "table-warning"  : "table-danger";

                      return (
                        <React.Fragment key={r.host}>
                          {/* Summary row */}
                          <tr className={hcBg} style={{ cursor: "pointer" }}
                            onClick={() => toggleExpand(r.host)}>
                            <td style={{ textAlign: "center", fontWeight: "bold" }}>
                              {isOpen ? "▾" : "▸"}
                            </td>
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
                            {GROUPS.map(g => (
                              <td key={g.label} style={{ textAlign: "center" }}>
                                <GroupDot status={calcGroupStatus(kqMap, g.ids)} />
                              </td>
                            ))}
                            <td style={{ textAlign: "center" }}>
                              {sync ? (
                                <Badge bg={sync.status_code === 200 ? "success" : "danger"}
                                  style={{ fontSize: "0.72rem" }}>
                                  HTTP {sync.status_code}
                                </Badge>
                              ) : "—"}
                            </td>
                            {/* ✅ Download output — 1 file per host, ở summary row */}
                            <td style={{ textAlign: "center" }}>
                              {r.result_file ? (
                                <a
                                  href={`${SERVER_MEDIA}/download/${r.result_file}`}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                                  >
                                    📄
                                  </Button>
                                </a>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td style={{ fontSize: "0.75rem" }}>
                              <div>▶ {fmtTime(r.starttime)}</div>
                              <div className="text-muted">■ {fmtTime(r.endtime)}</div>
                            </td>
                          </tr>

                          {/* Tầng 2: Chi tiết expand */}
                          <tr style={{ padding: 0 }}>
                            <td colSpan={4 + GROUPS.length + 2}
                              style={{ padding: 0, border: 0 }}>
                              <Collapse in={isOpen}>
                                <div>
                                  <div style={{
                                    margin: "0 8px 8px 32px",
                                    borderLeft: "4px solid #0d6efd",
                                    borderRadius: "0 4px 4px 0",
                                  }}>
                                    <Table bordered size="sm" className="mb-0"
                                      style={{ background: "white" }}>
                                      <thead>
                                        <tr style={{ background: "#e9ecef" }}>
                                          <th style={{ width: 110, fontSize: "0.78rem" }}>Nhóm</th>
                                          <th style={{ width: 40,  fontSize: "0.78rem", textAlign: "center" }}>ID</th>
                                          <th style={{ fontSize: "0.78rem", minWidth: 150 }}>Nội dung kiểm tra</th>
                                          <th style={{ fontSize: "0.78rem", minWidth: 160 }}>Câu lệnh</th>
                                          <th style={{ fontSize: "0.78rem", minWidth: 160 }}>Tiêu chí đánh giá</th>
                                          <th style={{ width: 70,  fontSize: "0.78rem", textAlign: "center" }}>Kết quả</th>
                                          <th style={{ fontSize: "0.78rem" }}>Mô tả lỗi</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {GROUPS.map(grp => grp.ids.map((id, idx) => {
                                          const kq = kqMap[id];
                                          const s  = KQ_STYLE[kq?.ket_qua ?? 2];
                                          const lbl = ID_LABELS[id];
                                          return (
                                            <tr key={id}>
                                              {idx === 0 ? (
                                                <td rowSpan={grp.ids.length} style={{
                                                  background: grp.color + "18",
                                                  fontWeight: "bold", fontSize: "0.78rem",
                                                  borderLeft: `3px solid ${grp.color}`,
                                                  verticalAlign: "middle", paddingLeft: 8,
                                                }}>
                                                  {grp.abbr}
                                                </td>
                                              ) : null}
                                              <td style={{ textAlign: "center", fontSize: "0.75rem", color: "#6c757d" }}>
                                                #{id}
                                              </td>
                                              <td style={{ fontSize: "0.8rem" }}>
                                                {lbl?.detail || "—"}
                                              </td>
                                              <td>
                                                <code style={{
                                                  background: "#f1f3f5", padding: "1px 5px",
                                                  borderRadius: 3, color: "#495057",
                                                  fontSize: "0.73rem", wordBreak: "break-all",
                                                }}>
                                                  {lbl?.command || "—"}
                                                </code>
                                              </td>
                                              {/* ✅ Tiêu chí đánh giá */}
                                              <td style={{
                                                fontSize: "0.78rem",
                                                color: "#0d6efd",
                                                fontStyle: "italic",
                                              }}>
                                                {lbl?.criteria || "—"}
                                              </td>
                                              <td style={{
                                                textAlign: "center",
                                                background: s.bg, color: s.color,
                                                fontWeight: "bold", fontSize: "0.85rem",
                                              }}>
                                                {s.icon}
                                              </td>
                                              <td style={{
                                                fontSize: "0.78rem",
                                                color: kq?.ket_qua === 0 ? "#dc3545" : "#6c757d",
                                              }}>
                                                {kq?.fail_description ||
                                                  (kq?.ket_qua === 2 ? "Không áp dụng" : "—")}
                                              </td>
                                              
                                            </tr>
                                          );
                                        }))}
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

          {/* ── ĐHTT Sync Result ─────────────────────────────────── */}
          {!running && sync && (() => {
            const resp = sync.response || {};
            const isOk = sync.status_code === 200 && resp.result === true;
            const hasUnknown = (resp.node_khong_ton_tai || []).length > 0;

            return (
              <Card border={isOk ? "success" : "danger"}>
                <Card.Header className={`d-flex align-items-center justify-content-between
                  ${isOk ? "bg-success text-white" : "bg-danger text-white"}`}>
                  <span className="fw-bold">
                    {isOk ? "✅" : "❌"} Kết quả gửi lên Web Điều Hành
                  </span>
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
                      <div className="text-muted small mb-1">Tổng bản ghi nhận</div>
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
                        <div className="text-muted small mb-1">
                          ⚠️ Node không tồn tại trên ĐHTT:
                        </div>
                        <div className="d-flex flex-wrap gap-1 mb-1">
                          {resp.node_khong_ton_tai.map((n, i) => (
                            <Badge key={i} bg="warning" text="dark">{n}</Badge>
                          ))}
                        </div>
                        <small className="text-muted">
                          Các node chưa được đăng ký. Liên hệ quản trị để bổ sung.
                        </small>
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
                  </Row>

                  {/* Request + Response side by side */}
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="fw-bold small mb-1">
                        📤 Nội dung gửi đi (Request Payload)
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
                        📥 Phản hồi từ ĐHTT (Response)
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

          {/* Empty state */}
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

export default DhttManual;