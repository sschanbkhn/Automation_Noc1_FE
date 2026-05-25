import { saveAs } from "file-saver";
import React, { useEffect, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, InputGroup,
  Modal, Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { fetchDhttHistory } from "../../../redux/Healthcheck/dhttSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── Helpers ────────────────────────────────────────────────────────────────
const parseNodes = (nodesStr) => {
  if (!nodesStr) return "—";
  try {
    const parsed = JSON.parse(nodesStr);
    return Array.isArray(parsed) ? parsed.join(", ") : nodesStr;
  } catch {
    return nodesStr;
  }
};

const getStatusBadge = (item) => {
  const isPartial =
    item.status?.toLowerCase() === "success" &&
    item.response_body?.node_khong_ton_tai?.length > 0;

  if (isPartial)
    return <Badge bg="warning" text="dark">PARTIAL SUCCESS</Badge>;
  if (item.status?.toLowerCase() === "success")
    return <Badge bg="success">SUCCESS</Badge>;
  return <Badge bg="danger">{item.status?.toUpperCase() || "FAILED"}</Badge>;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ── Component ──────────────────────────────────────────────────────────────
const DhttHistoricalReporting = () => {
  const dispatch = useDispatch();
  const { items = [], loading = false, count = 0 } =
    useSelector((s) => s.dhtt || {});

  // Filter state
  const [host,       setHost]       = useState("");
  const [hours,      setHours]      = useState("24");
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [pageSize,   setPageSize]   = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeMode, setTimeMode] = useState("preset");
  // Sort
  const [sortConfig, setSortConfig] = useState({ key: "execution_time", direction: "desc" });

  // Modal
  const [showModal,      setShowModal]      = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Ref để giữ params khi đổi page
  const paramsRef = useRef({ host: "", hours: "24", start: "", end: "", status: "" });

  // ── Fetch ─────────────────────────────────────────────────────────────
  const doFetch = (page = 1, params = paramsRef.current) => {
    dispatch(fetchDhttHistory({
      host:      params.host,
      hours:     !params.start && !params.end ? params.hours : undefined,
      start:     params.start || undefined,
      end:       params.end   || undefined,
      page,
      page_size: pageSize,
    }));
  };

  useEffect(() => { doFetch(currentPage); }, [dispatch, currentPage, pageSize]);


  const handleSearch = (e) => {
  e.preventDefault();
  paramsRef.current = {
    host:   host.trim(),
    hours:  timeMode === "preset" ? hours : undefined,
    start:  timeMode === "range" && startDate ? startDate : undefined,
    end:    timeMode === "range" && endDate   ? endDate   : undefined,
  };
  setCurrentPage(1);
  doFetch(1);
};

const handleReset = () => {
  setHost(""); setHours("24"); setStartDate(""); setEndDate("");
  setFilterStatus(""); setTimeMode("preset"); setCurrentPage(1);
  paramsRef.current = { host: "", hours: "24", start: "", end: "" };
  doFetch(1, { host: "", hours: "24", start: "", end: "" });
};

  // ── Sort + Filter ──────────────────────────────────────────────────────
  const processedItems = [...items]
    .filter(item => {
      if (!filterStatus) return true;
      const isPartial =
        item.status?.toLowerCase() === "success" &&
        item.response_body?.node_khong_ton_tai?.length > 0;
      if (filterStatus === "partial") return isPartial;
      if (filterStatus === "success") return item.status?.toLowerCase() === "success" && !isPartial;
      return item.status?.toLowerCase() === filterStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const va = a[sortConfig.key], vb = b[sortConfig.key];
      if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
      if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(count / pageSize);

  const handleSort = (key) => {
    setSortConfig(p => ({
      key,
      direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
    }));
  };
  const sortIcon = (key) =>
    sortConfig.key !== key ? "↕" : sortConfig.direction === "asc" ? "↑" : "↓";

  // ── Export ─────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    const data = processedItems.map((item, i) => ({
      STT:              (currentPage - 1) * pageSize + i + 1,
      "Thời gian":      fmtDate(item.execution_time),
      "Tác vụ":         item.task_name || "—",
      Platform:         item.platform  || "—",
      "Nodes xử lý":    parseNodes(item.nodes_attempted),
      "Mã HTTP":        item.status_code || "—",
      "Trạng thái":     item.status?.toUpperCase() || "—",
      "Message":        item.response_body?.message || "—",
      "Node không tồn tại":
        (item.response_body?.node_khong_ton_tai || []).join(", ") || "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DHTT_History");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `DHTT_History_${new Date().toISOString().slice(0,10)}.xlsx`
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <TopNavbarHealth />

      {/* ── DETAIL MODAL ─────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết phản hồi ĐHTT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetail && (
            <div>
              <Row className="mb-2">
                <Col sm={4} className="fw-bold">Thời gian:</Col>
                <Col sm={8}>{fmtDate(selectedDetail.execution_time)}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4} className="fw-bold">Tác vụ:</Col>
                <Col sm={8}>{selectedDetail.task_name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4} className="fw-bold">Platform:</Col>
                <Col sm={8}>{selectedDetail.platform}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4} className="fw-bold">Nodes:</Col>
                <Col sm={8}>{parseNodes(selectedDetail.nodes_attempted)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Trạng thái:</Col>
                <Col sm={8}>
                  {getStatusBadge(selectedDetail)}
                  <span className="ms-2 text-muted small">
                    HTTP {selectedDetail.status_code}
                  </span>
                </Col>
              </Row>

              <hr />
              <h6 className="fw-bold text-primary">Phân tích phản hồi ĐHTT:</h6>
              <Table bordered size="sm" className="mt-2">
                <tbody>
                  <tr>
                    <td className="bg-light" style={{ width: "45%" }}>
                      Node không tồn tại trên ĐHTT:
                    </td>
                    <td>
                      {(selectedDetail.response_body?.node_khong_ton_tai || []).length > 0
                        ? selectedDetail.response_body.node_khong_ton_tai.map(n => (
                            <Badge key={n} bg="secondary" className="me-1">{n}</Badge>
                          ))
                        : <span className="text-muted">Không có</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light">Node sai thông tin:</td>
                    <td>
                      {(selectedDetail.response_body?.node_sai_thong_tin || []).length > 0
                        ? selectedDetail.response_body.node_sai_thong_tin.join(", ")
                        : <span className="text-muted">Không có</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light">Node sai kết quả bảo dưỡng:</td>
                    <td>
                      {(selectedDetail.response_body?.node_sai_ket_qua_bao_duong || []).length > 0
                        ? selectedDetail.response_body.node_sai_ket_qua_bao_duong.join(", ")
                        : <span className="text-muted">Không có</span>}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <h6 className="fw-bold text-primary mt-3">Dữ liệu thô (JSON):</h6>
              <pre style={{
                background: "#f8f9fa", padding: "12px", borderRadius: "5px",
                maxHeight: "280px", overflow: "auto", fontSize: "11px",
              }}>
                {JSON.stringify(selectedDetail.response_body, null, 2)}
              </pre>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

      {/* ── MAIN CARD ────────────────────────────────────────────────── */}
      <Row className="mt-3">
        <Col md={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <Card.Title as="h5" className="mb-0">Lịch sử đồng bộ ĐHTT</Card.Title>
                <Button variant="outline-success" onClick={exportToExcel}>
                  📥 Xuất Excel
                </Button>
              </div>


{/* ── Filter form ── */}
<Form onSubmit={handleSearch} className="mt-3">
  <Row className="g-2 align-items-end">

    {/* Host */}
    <Col md={3}>
      <Form.Label className="small mb-1">Node</Form.Label>
      <InputGroup>
        <InputGroup.Text>🔍</InputGroup.Text>
        <Form.Control
          placeholder="Tên node..."
          value={host}
          onChange={e => setHost(e.target.value)}
        />
      </InputGroup>
    </Col>

    {/* Chế độ lọc thời gian */}
    <Col md={2}>
      <Form.Label className="small mb-1">Chế độ thời gian</Form.Label>
      <Form.Select
        value={timeMode}
        onChange={e => {
          setTimeMode(e.target.value);
          setStartDate(""); setEndDate(""); setHours("24");
        }}
      >
        <option value="preset">Nhanh (preset)</option>
        <option value="range">Khoảng thời gian</option>
      </Form.Select>
    </Col>

    {/* Preset hours */}
    {timeMode === "preset" && (
      <Col md={2}>
        <Form.Label className="small mb-1">Khoảng thời gian</Form.Label>
        <Form.Select value={hours} onChange={e => setHours(e.target.value)}>
          <option value="1">1 giờ qua</option>
          <option value="3">3 giờ qua</option>
          <option value="6">6 giờ qua</option>
          <option value="12">12 giờ qua</option>
          <option value="24">24 giờ qua</option>
          <option value="48">2 ngày qua</option>
          <option value="72">3 ngày qua</option>
          <option value="168">7 ngày qua</option>
          <option value="336">14 ngày qua</option>
          <option value="720">30 ngày qua</option>
        </Form.Select>
      </Col>
    )}

    {/* Date range */}
    {timeMode === "range" && (
      <>
        <Col md={2}>
          <Form.Label className="small mb-1">Từ ngày</Form.Label>
          <Form.Control
            type="datetime-local"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label className="small mb-1">Đến ngày</Form.Label>
          <Form.Control
            type="datetime-local"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </Col>
      </>
    )}

    {/* Status filter */}
    <Col md={2}>
      <Form.Label className="small mb-1">Trạng thái</Form.Label>
      <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
        <option value="">Tất cả</option>
        <option value="success">SUCCESS</option>
        <option value="partial">PARTIAL SUCCESS</option>
        <option value="failed">FAILED</option>
        <option value="error">ERROR</option>
      </Form.Select>
    </Col>

    {/* Buttons */}
    <Col md={1} className="d-flex gap-1">
      <Button variant="primary" type="submit" disabled={loading}>Lọc</Button>
      <Button variant="outline-secondary" type="button" onClick={handleReset}>↺</Button>
    </Col>
  </Row>
</Form>



            </Card.Header>

            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <>
                  {/* Page size + count */}
                  <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
                    <small className="text-muted">
                      Hiển thị {processedItems.length} / {count} bản ghi
                    </small>
                    <InputGroup style={{ width: 140 }}>
                      <InputGroup.Text className="small">Hiển thị</InputGroup.Text>
                      <Form.Select
                        size="sm"
                        value={pageSize}
                        onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      >
                        {PAGE_SIZE_OPTIONS.map(n => (
                          <option key={n} value={n}>{n} dòng</option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </div>

                  <Table responsive hover bordered size="sm" className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 50 }}>STT</th>
                        <th style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                          onClick={() => handleSort("execution_time")}>
                          Thời gian {sortIcon("execution_time")}
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("task_name")}>
                          Tác vụ {sortIcon("task_name")}
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("platform")}>
                          Platform {sortIcon("platform")}
                        </th>
                        <th>Nodes xử lý</th>
                        <th style={{ cursor: "pointer", textAlign: "center" }}
                          onClick={() => handleSort("status")}>
                          Trạng thái {sortIcon("status")}
                        </th>
                        <th>Chi tiết phản hồi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            Không có dữ liệu
                          </td>
                        </tr>
                      ) : processedItems.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{(currentPage - 1) * pageSize + index + 1}</td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {fmtDate(item.execution_time)}
                          </td>
                          <td>{item.task_name}</td>
                          <td>{item.platform}</td>
                          <td style={{ fontSize: "0.82rem" }}>
                            {parseNodes(item.nodes_attempted)}
                          </td>
                          <td className="text-center">
                            {getStatusBadge(item)}
                            <div className="mt-1 small text-muted">{item.status_code}</div>
                          </td>
                          <td>
                            <div style={{
                              maxWidth: 220, whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "inline-block", verticalAlign: "middle",
                              fontSize: "0.82rem",
                            }}>
                              {item.response_body?.message || "—"}
                            </div>
                            <Button
                              variant="link" size="sm" className="p-0 ms-2"
                              onClick={() => { setSelectedDetail(item); setShowModal(true); }}
                            >
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3 pb-2">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      />
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 || page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <Pagination.Item
                              key={page} active={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        }
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return <Pagination.Ellipsis key={`e-${page}`} disabled />;
                        }
                        return null;
                      })}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      />
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DhttHistoricalReporting;