import { saveAs } from "file-saver";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
  Spinner,
  Table,
  Badge,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { fetchDhttHistory } from "../../../redux/Healthcheck/dhttSlice";
// Import TopNavbar hoặc Sidebar tuỳ hệ thống của bạn
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// Map màu sắc theo status trả về từ API
const statusRowClass = {
  success: "table-success",
  failed: "table-danger",
  error: "table-danger",
  warning: "table-warning",
};

// Hàm hỗ trợ parse mảng nodes_attempted (đang ở dạng chuỗi "[...]")
const parseNodes = (nodesStr) => {
  if (!nodesStr) return "-";
  try {
    const parsed = JSON.parse(nodesStr);
    return Array.isArray(parsed) ? parsed.join(", ") : nodesStr;
  } catch (error) {
    return nodesStr; // Nếu không phải JSON hợp lệ thì in chuỗi gốc
  }
};

// Hàm hỗ trợ lấy chi tiết phản hồi từ response_body
const getResponseMessage = (body) => {
  if (!body) return "-";
  let msg = body.message || "";
  if (body.node_khong_ton_tai && body.node_khong_ton_tai.length > 0) {
    msg += ` (Node không tồn tại: ${body.node_khong_ton_tai.join(", ")})`;
  }
  return msg;
};

const DhttHistoricalReporting = () => {
  const dispatch = useDispatch();
  const { items = [], loading = false, count = 0 } = useSelector(
    (state) => state.dhtt || {}
  );

  const [host, setHost] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const searchHostRef = useRef("");
  const pageSize = 10;

// 2. Thêm state mới cho Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
const handleShowDetail = (item) => {
    setSelectedDetail(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDetail(null);
  };
  useEffect(() => {
    dispatch(
      fetchDhttHistory({
        host: searchHostRef.current,
        page: currentPage,
        page_size: pageSize,
      })
    );
  }, [dispatch, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedHost = host.trim();
    searchHostRef.current = trimmedHost;
    setCurrentPage(1);
    dispatch(
      fetchDhttHistory({ host: trimmedHost, page: 1, page_size: pageSize })
    );
  };

  const totalPages = Math.ceil(count / pageSize);
  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const exportToExcel = () => {
    const data = sortedItems.map((item, index) => ({
      STT: (currentPage - 1) * pageSize + index + 1,
      "Thời gian": item.execution_time || "-",
      "Tác vụ": item.task_name || "-",
      Platform: item.platform || "-",
      "Danh sách Node": parseNodes(item.nodes_attempted),
      "Mã HTTP": item.status_code || "-",
      "Trạng thái": item.status || "-",
      "Chi tiết phản hồi": getResponseMessage(item.response_body),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DHTT_History");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `DHTT_Historical_Export.xlsx`);
  };

  return (
    <>
          <TopNavbarHealth />

      <React.Fragment>
        <Row className="mt-3">
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
                <Card.Title as="h5" className="mb-0">
                  Lịch sử đồng bộ DHTT
                </Card.Title>
                <Form
                  onSubmit={handleSearch}
                  className="d-flex align-items-center ms-3"
                  style={{ flexWrap: "nowrap" }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên node..."
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="me-2"
                    style={{ width: "200px" }}
                  />
                  <Button variant="primary" type="submit" className="px-3">
                    Tìm kiếm
                  </Button>
                  <Button
                    variant="outline-success"
                    type="button"
                    className="px-3 ms-2"
                    onClick={exportToExcel}
                  >
                    Xuất Excel
                  </Button>
                </Form>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <>
                    <Table responsive hover bordered className="table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>STT</th>
                          <th
                            onClick={() => handleSort("execution_time")}
                            style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Thời gian
                          </th>
                          <th
                            onClick={() => handleSort("task_name")}
                            style={{ cursor: "pointer" }}
                          >
                            Tác vụ
                          </th>
                          <th
                            onClick={() => handleSort("platform")}
                            style={{ cursor: "pointer" }}
                          >
                            Platform
                          </th>
                          <th>Nodes xử lý</th>
                          <th
                            onClick={() => handleSort("status")}
                            style={{ cursor: "pointer", textAlign: "center" }}
                          >
                            Trạng thái
                          </th>
                          <th>Chi tiết phản hồi</th>
                        </tr>
                      </thead>
<tbody>
          {sortedItems.map((item, index) => {
            // Logic Badge bạn vừa đề cập
            const isPartialSuccess = 
              item.status?.toLowerCase() === "success" && 
              item.response_body?.node_khong_ton_tai?.length > 0;

            return (
              <tr key={item.id || index}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td style={{ whiteSpace: "nowrap" }}>{item.execution_time}</td>
                <td>{item.task_name}</td>
                <td>{item.platform}</td>
                <td>{parseNodes(item.nodes_attempted)}</td>
                
                {/* Cập nhật phần Badge theo logic bạn muốn */}
                <td className="text-center">
                  <Badge bg={isPartialSuccess ? "warning" : (item.status?.toLowerCase() === "success" ? "success" : "danger")}>
                    {isPartialSuccess ? "PARTIAL SUCCESS" : item.status?.toUpperCase()}
                  </Badge>
                  <div className="mt-1 small fw-bold">{item.status_code}</div>
                </td>

                {/* 3. Sửa lại phần Chi tiết phản hồi: Ngắn gọn + Nút bấm */}
                <td>
                  <div style={{ 
                    maxWidth: "250px", 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    verticalAlign: "middle"
                  }}>
                    {item.response_body?.message || "No message"}
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 ms-2" 
                    onClick={() => handleShowDetail(item)}
                  >
                    Xem chi tiết
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
                    </Table>
{/* 4. Thành phần Modal để hiển thị chi tiết đầy đủ */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết phản hồi từ hệ thống ĐHTT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetail && (
            <div className="p-2">
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Thời gian chạy:</Col>
                <Col sm={8}>{selectedDetail.execution_time}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">Thông điệp chính:</Col>
                <Col sm={8}>
                  <Badge bg={selectedDetail.status === "success" ? "success" : "danger"}>
                    {selectedDetail.response_body?.message}
                  </Badge>
                </Col>
              </Row>

              <hr />

              <h6 className="fw-bold text-primary">Phân tích dữ liệu:</h6>
              <Table bordered size="sm" className="mt-2">
                <tbody>
                  <tr>
                    <td className="bg-light" style={{ width: "40%" }}>Node không tồn tại trên ĐHTT:</td>
                    <td>
                      {selectedDetail.response_body?.node_khong_ton_tai?.length > 0 ? (
                        selectedDetail.response_body.node_khong_ton_tai.map(node => (
                          <Badge key={node} bg="secondary" className="me-1">{node}</Badge>
                        ))
                      ) : <span className="text-muted">Không có</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light">Node sai thông tin:</td>
                    <td>
                      {selectedDetail.response_body?.node_sai_thong_tin?.length > 0 ? (
                         selectedDetail.response_body.node_sai_thong_tin.join(", ")
                      ) : <span className="text-muted">Không có</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light">Node sai kết quả bảo dưỡng:</td>
                    <td>
                       {selectedDetail.response_body?.node_sai_ket_qua_bao_duong?.length > 0 ? (
                         selectedDetail.response_body.node_sai_ket_qua_bao_duong.join(", ")
                      ) : <span className="text-muted">Không có</span>}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <h6 className="fw-bold text-primary mt-4">Dữ liệu thô (JSON):</h6>
              <pre style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "15px", 
                borderRadius: "5px",
                maxHeight: "300px",
                overflow: "auto",
                fontSize: "12px"
              }}>
                {JSON.stringify(selectedDetail.response_body, null, 2)}
              </pre>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
                    {totalPages > 1 && (
                      <Pagination className="justify-content-center mt-3">
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <Pagination.Item
                                key={page}
                                active={currentPage === page}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            );
                          }
                          if (
                            page === currentPage - 3 ||
                            page === currentPage + 3
                          ) {
                            return (
                              <Pagination.Ellipsis
                                key={`ellipsis-${page}`}
                                disabled
                              />
                            );
                          }
                          return null;
                        })}
                        <Pagination.Next
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                      </Pagination>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </>
  );
};

export default DhttHistoricalReporting;