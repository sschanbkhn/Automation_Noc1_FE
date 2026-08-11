// pages/FaultPrecheck/FaultPrecheckHistory.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, InputGroup,
  Modal, Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { fetchFCPHistory } from "../../../redux/Healthcheck/faultPrecheckSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const StatusBadge = ({ status }) => {
  const map = {
    ok:      { bg: "success",            label: "OK"      },
    nok:     { bg: "danger",             label: "NOK"     },
    failed:  { bg: "warning", text:"dark", label: "FAILED"  },
  };
  const s = map[status?.toLowerCase()] || { bg: "secondary", label: status?.toUpperCase() || "—" };
  return <Badge bg={s.bg} text={s.text}>{s.label}</Badge>;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ── Component ──────────────────────────────────────────────────────────────
const FaultPrecheckHistory = () => {
  const dispatch = useDispatch();
  const {
    historyItems: items = [],
    historyCount: count = 0,
    historyLoading: loading = false,
  } = useSelector((s) => s.faultPrecheck || {});

  const [host,        setHost]        = useState("");
  const [fcpId,       setFcpId]       = useState("");
  const [platform,    setPlatform]    = useState("");
  const [hours,       setHours]       = useState("24");
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [timeMode,    setTimeMode]    = useState("preset");
  const [pageSize,    setPageSize]    = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal,   setShowModal]   = useState(false);
  const [detail,      setDetail]      = useState(null);

  const paramsRef = useRef({ host: "", fcp_id: "", platform: "", hours: "24", start: "", end: "" });

  const doFetch = (page = 1, p = paramsRef.current) => {
    dispatch(fetchFCPHistory({
      host:      p.host      || undefined,
      fcp_id:    p.fcp_id    || undefined,
      platform:  p.platform  || undefined,
      hours:     (!p.start && !p.end) ? p.hours : undefined,
      start:     p.start     || undefined,
      end:       p.end       || undefined,
      page,
      page_size: pageSize,
    }));
    setCurrentPage(page);
  };

  const handleSearch = () => {
    const p = {
      host:    host.trim(),
      fcp_id:  fcpId.trim(),
      platform: platform.trim(),
      hours:   timeMode === "preset" ? hours : "",
      start:   timeMode === "range"  ? startDate : "",
      end:     timeMode === "range"  ? endDate   : "",
    };
    paramsRef.current = p;
    doFetch(1, p);
  };

  const handlePageChange = (page) => doFetch(page);

  useEffect(() => { handleSearch(); }, [pageSize]); // eslint-disable-line
  useEffect(() => { handleSearch(); }, []);          // eslint-disable-line

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = items.map((item) => ({
      "Thời gian":   fmtDate(item.execution_time),
      "Device":      item.device_name,
      "IP":          item.device_ip || "",
      "Platform":    item.platform,
      "Mã lỗi (id)": item.fcp_id,
      "Tên mã lỗi":  item.ten_ma_loi || "",
      "Trạng thái":  item.status,
      "Group":       item.group || "",
      "Người chạy":  item.creator || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FCP History");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" }),
      `fcp_history_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // ── Pagination ──────────────────────────────────────────────────────────
  const totalPages = Math.ceil(count / pageSize) || 1;
  const pageItems  = [];
  const PAD = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= PAD) {
      pageItems.push(i);
    } else if (pageItems[pageItems.length - 1] !== "...") {
      pageItems.push("...");
    }
  }

  return (
    <>
      <TopNavbarHealth />
      <div className="container-fluid px-3 py-3">

        {/* ── Filter card ───────────────────────────────────────────────── */}
        <Card className="mb-3 shadow-sm">
          <Card.Header className="fw-semibold py-2" style={{ background: "#f8f9fa" }}>
            ⚡ Lịch sử Fault Code Precheck (FCP)
          </Card.Header>
          <Card.Body>
            <Row className="g-2 align-items-end">
              <Col md={2}>
                <Form.Label className="small mb-1">Device</Form.Label>
                <Form.Control
                  size="sm" value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="pgw_c_et1a..."
                />
              </Col>
              <Col md={2}>
                <Form.Label className="small mb-1">Mã lỗi (id)</Form.Label>
                <Form.Control
                  size="sm" value={fcpId}
                  onChange={(e) => setFcpId(e.target.value)}
                  placeholder="1, 2..."
                />
              </Col>
              <Col md={2}>
                <Form.Label className="small mb-1">Platform</Form.Label>
                <Form.Control
                  size="sm" value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="pgw_ericsson..."
                />
              </Col>
              <Col md={2}>
                <Form.Label className="small mb-1">Thời gian</Form.Label>
                <Form.Select size="sm" value={timeMode} onChange={(e) => setTimeMode(e.target.value)}>
                  <option value="preset">Preset</option>
                  <option value="range">Khoảng ngày</option>
                </Form.Select>
              </Col>
              {timeMode === "preset" ? (
                <Col md={1}>
                  <Form.Label className="small mb-1">Trong vòng</Form.Label>
                  <Form.Select size="sm" value={hours} onChange={(e) => setHours(e.target.value)}>
                    {[1,6,12,24,48,72,168].map((h) => (
                      <option key={h} value={h}>{h} giờ</option>
                    ))}
                  </Form.Select>
                </Col>
              ) : (
                <>
                  <Col md={1}>
                    <Form.Label className="small mb-1">Từ ngày</Form.Label>
                    <Form.Control size="sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                  </Col>
                  <Col md={1}>
                    <Form.Label className="small mb-1">Đến ngày</Form.Label>
                    <Form.Control size="sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                  </Col>
                </>
              )}
              <Col md="auto">
                <Button size="sm" variant="primary" onClick={handleSearch} disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border"/> : "🔍 Tìm kiếm"}
                </Button>
              </Col>
              <Col md="auto">
                <Button size="sm" variant="outline-success" onClick={handleExport} disabled={!items.length}>
                  ⬇ Excel
                </Button>
              </Col>
              <Col md="auto" className="ms-auto">
                <InputGroup size="sm">
                  <InputGroup.Text>Hiển thị</InputGroup.Text>
                  <Form.Select
                    style={{ width: 70 }}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.82rem" }}>
              <thead style={{ background: "#343a40", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Device</th>
                  <th>Mã lỗi (id)</th>
                  <th>Tên mã lỗi</th>
                  <th>Platform</th>
                  <th>Trạng thái</th>
                  <th>Group</th>
                  <th style={{ textAlign: "center" }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="text-center py-4">
                    <Spinner animation="border" size="sm" className="me-2"/>Đang tải...
                  </td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted py-4">
                    Không có dữ liệu
                  </td></tr>
                )}
                {!loading && items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-muted">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td>{fmtDate(item.execution_time)}</td>
                    <td style={{ fontWeight: 600 }}>{item.device_name}</td>
                    <td>
                      <code style={{ background: "#f1f3f5", padding: "1px 5px", borderRadius: 3 }}>
                        {item.fcp_id}
                      </code>
                    </td>
                    <td style={{ color: "#495057" }}>{item.ten_ma_loi || "—"}</td>
                    <td>
                      <code style={{ background: "#f1f3f5", padding: "1px 5px", borderRadius: 3 }}>
                        {item.platform}
                      </code>
                    </td>
                    <td><StatusBadge status={item.status}/></td>
                    <td>{item.group || "—"}</td>
                    <td className="text-center">
                      <Button
                        size="sm" variant="outline-danger"
                        style={{ fontSize: "0.72rem", padding: "1px 8px" }}
                        onClick={() => { setDetail(item); setShowModal(true); }}
                        disabled={!(item.results?.ketquaprecheck || []).length}
                      >
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>

          {totalPages > 1 && (
            <Card.Footer className="d-flex align-items-center justify-content-between py-1">
              <small className="text-muted">
                {count} bản ghi · trang {currentPage}/{totalPages}
              </small>
              <Pagination size="sm" className="mb-0">
                <Pagination.Prev disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}/>
                {pageItems.map((p, i) =>
                  p === "..." ? (
                    <Pagination.Ellipsis key={`e${i}`} disabled/>
                  ) : (
                    <Pagination.Item
                      key={p} active={p === currentPage}
                      onClick={() => handlePageChange(p)}
                    >{p}</Pagination.Item>
                  )
                )}
                <Pagination.Next disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}/>
              </Pagination>
            </Card.Footer>
          )}
        </Card>
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>
            Chi tiết FCP — {detail?.device_name} — {detail?.fcp_id} — {fmtDate(detail?.execution_time)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "12px" }}>
          {detail && (
            <div>
              <div className="mb-2 small">
                <strong>Tên mã lỗi:</strong> {detail.ten_ma_loi || "—"} &nbsp;|&nbsp;
                <strong>Platform:</strong> {detail.platform} &nbsp;|&nbsp;
                <strong>IP:</strong> {detail.device_ip || "—"}
              </div>
              {(detail.results?.ketquaprecheck || []).map((grp, gi) => (
                <div key={gi} className="mb-3">
                  {grp.tennhom && (
                    <div className="small fw-semibold text-secondary mb-1"
                      style={{ borderBottom: "1px solid #dee2e6", paddingBottom: 2 }}>
                      {grp.tennhom}
                    </div>
                  )}
                  <Table bordered size="sm" style={{ fontSize: "0.78rem" }}>
                    <thead>
                      <tr style={{ background: "#e9ecef" }}>
                        <th>Công việc / Câu lệnh</th>
                        <th style={{ width: 66, textAlign: "center" }}>KQ</th>
                        <th>Tiêu chí / Chi tiết lỗi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(grp.congviecchitiet || []).map((task, ti) => (
                        <tr key={ti}>
                          <td>
                            <div style={{ fontWeight: 500, fontSize: "0.77rem" }}>{task.tencongviecchitiet || "—"}</div>
                            <code style={{ fontSize: "0.72rem", color: "#6c757d" }}>{task.caulenh || ""}</code>
                          </td>
                          <td style={{
                            textAlign: "center", fontWeight: "bold",
                            background: task.ketqua === "OK" ? "#d1e7dd" : "#f8d7da",
                            color:      task.ketqua === "OK" ? "#0f5132" : "#842029",
                          }}>
                            {task.ketqua === "OK" ? "✓" : "✗"}
                          </td>
                          <td style={{ color: task.ketqua === "NOK" ? "#dc3545" : "#6c757d", fontSize: "0.77rem" }}>
                            {task.ketqua === "NOK" ? (task.chitietloi || "—") : (task.tieuchidanhgia || "—")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
              {!(detail.results?.ketquaprecheck || []).length && (
                <div className="text-center text-muted small py-2">Không có dữ liệu chi tiết</div>
              )}
              {detail.results?.result_file_url && (
                <div className="mt-2 small">
                  <strong>File output:</strong>{" "}
                  <a href={detail.results.result_file_url} target="_blank" rel="noreferrer">
                    📄 Tải xuống
                  </a>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FaultPrecheckHistory;
