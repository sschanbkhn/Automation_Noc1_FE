import React, { useEffect, useState, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Form,
  Button,
  Pagination,
} from "react-bootstrap";
import { fetchPSCoreStatus } from "../../../redux/Healthcheck/healthcheckSlice";
import { SERVER_MEDIA } from "../../../config/constant";
import snocStore, { RootState, AppDispatch } from "../../../store/snocStore";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner"; // cập nhật path cho đúng

const statusRowClass = {
  OK: "table-success",
  Warning: "table-warning",
  Error: "table-danger",
  NOK: "table-danger",
  Unknown: "table-secondary",
};

const HistoricalReportingContent = () => {
  useScheduleWebSocket(); // ✅ Gọi ở đây

  const dispatch = useDispatch();
  const {
    items = [],
    loading = false,
    count = 0,
  } = useSelector((state) => state.pscore || {});
  const [host, setHost] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const searchHostRef = useRef("");
  const pageSize = 10;

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedHost = host.trim();
    searchHostRef.current = trimmedHost;
    setCurrentPage(1);
    dispatch(fetchPSCoreStatus({ host: trimmedHost, page: 1 }));
  };

  useEffect(() => {
    dispatch(
      fetchPSCoreStatus({ host: searchHostRef.current, page: currentPage })
    );
  }, [dispatch, currentPage]);

  const totalPages = Math.ceil(count / pageSize);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...items].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />

      <React.Fragment>
        <Row>
          <Col md={12} className="mb-3"></Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
                <Card.Title as="h5" className="mb-0">
                  Historical Reporting - Danh sách bản ghi healthcheck
                </Card.Title>
                <Form
                  onSubmit={handleSearch}
                  className="d-flex align-items-center ms-3"
                  style={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên node (host)"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="me-2"
                    style={{ width: "200px" }}
                  />
                  <Button variant="primary" type="submit" className="px-3">
                    Tìm kiếm
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
                          <th
                            onClick={() => handleSort("index")}
                            style={{ cursor: "pointer" }}
                          >
                            STT
                          </th>
                          <th
                            onClick={() => handleSort("host")}
                            style={{ cursor: "pointer" }}
                          >
                            Host
                          </th>
                          <th
                            onClick={() => handleSort("created_at")}
                            style={{ cursor: "pointer" }}
                          >
                            Thời gian
                          </th>
                          <th
                            onClick={() => handleSort("status")}
                            style={{ cursor: "pointer" }}
                          >
                            Trạng thái
                          </th>
                          <th>Ghi chú</th>
                          <th>File kết quả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedItems.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className={statusRowClass[item.status] || ""}
                          >
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{item.host}</td>
                            <td>
                              {new Date(item.created_at).toLocaleString()}
                            </td>
                            <td>{item.status}</td>
                            <td style={{ whiteSpace: "pre-line" }}>
                              {item.notes ? item.notes : ""}
                            </td>
                            <td>
                              {item.result_file ? (
                                <a
                                  href={`${SERVER_MEDIA}/download${item.result_file}`}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download result for {item.host}
                                </a>
                              ) : (
                                "Không có file"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {totalPages > 1 && (
                      <Pagination className="justify-content-center mt-3">
                        {currentPage > 1 && (
                          <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                          />
                        )}

                        {/* Hiện trang 1 luôn */}
                        {currentPage > 3 && (
                          <>
                            <Pagination.Item
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </Pagination.Item>
                            {currentPage > 4 && (
                              <Pagination.Ellipsis disabled />
                            )}
                          </>
                        )}

                        {/* Hiện khoảng từ currentPage-2 đến currentPage+2 */}
                        {Array.from(
                          { length: 5 },
                          (_, i) => currentPage - 2 + i
                        )
                          .filter((page) => page > 1 && page < totalPages)
                          .map((page) => (
                            <Pagination.Item
                              key={page}
                              active={currentPage === page}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Pagination.Item>
                          ))}

                        {/* Hiện trang cuối */}
                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <Pagination.Ellipsis disabled />
                            )}
                            <Pagination.Item
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </Pagination.Item>
                          </>
                        )}

                        {currentPage < totalPages && (
                          <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                          />
                        )}
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

const HistoricalReporting = () => (
  <Provider store={snocStore}>
    <HistoricalReportingContent />
  </Provider>
);

export default HistoricalReporting;
