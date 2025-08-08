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
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { SERVER_MEDIA } from "../../../config/constant";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchLatestHealthcheckView,
  toggleDeviceExcluded, // ✅ Action toggle exclude
} from "../../../redux/Healthcheck/healthcheckSlice";

const statusRowClass = {
  OK: "",
  Warning: "table-warning",
  Error: "table-danger",
  NOK: "table-danger",
  Unknown: "table-secondary",
};

const HealthcheckTable = ({ group, subsystem, platformList = [] }) => {
  useScheduleWebSocket();
  const dispatch = useDispatch();

  const {
    lastestitems = [],
    countlastest = 0,
    loading = false,
  } = useSelector((state) => state.pscore || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const searchHostRef = useRef("");

  const pageSize = 10;
  const totalPages = Math.ceil(countlastest / pageSize);

  useEffect(() => {
    dispatch(
      fetchLatestHealthcheckView({
        host: searchHostRef.current,
        page: currentPage,
        platform: platformList,
      })
    );
  }, [dispatch, currentPage, group, subsystem, platformList]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleToggleExclude = (host, checked) => {
    dispatch(toggleDeviceExcluded({ host, excluded: checked }));
  };

  const filteredItems = lastestitems.filter((item) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesText =
      item.host?.toLowerCase().includes(lowerSearch) ||
      item.ip?.toLowerCase().includes(lowerSearch) || // ✅ Search theo IP
      item.status?.toLowerCase().includes(lowerSearch) ||
      item.notes?.some((note) =>
        note.note?.toLowerCase().includes(lowerSearch)
      ) ||
      new Date(item.starttime)
        .toLocaleString()
        .toLowerCase()
        .includes(lowerSearch);

    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesDate =
      (!startDate || new Date(item.starttime) >= new Date(startDate)) &&
      (!endDate || new Date(item.starttime) <= new Date(endDate));

    return matchesText && matchesStatus && matchesDate;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const exportToExcel = () => {
    const data = sortedItems.map((item, index) => ({
      STT: (currentPage - 1) * pageSize + index + 1,
      Host: item.host,
      IP: item.ip || "-", // ✅ Xuất IP
      "Thời gian": new Date(item.starttime).toLocaleString(),
      "Trạng thái": item.status,
      "Ghi chú": Array.isArray(item.notes)
        ? item.notes.map((n) => n.note).join(" | ")
        : "",
      "File kết quả": item.result_file || "",
      Excluded: item.excluded ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Healthcheck");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `${group || "healthcheck"}_export.xlsx`);
  };

  return (
    <Row>
      <Col md={12}>
        <Card>
          <Card.Header className="d-flex flex-wrap align-items-end justify-content-between gap-2">
            <div>
              <Card.Title as="h5" className="mb-0">
                {group} / {subsystem} - Bản ghi healthcheck
              </Card.Title>
            </div>
            <Form className="d-flex flex-wrap align-items-end gap-2">
              <Form.Group>
                <Form.Label className="mb-1">Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo Host/IP/Trạng thái..."
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="mb-1">Trạng thái</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="OK">OK</option>
                  <option value="NOK">NOK</option>
                  <option value="Warning">Warning</option>
                  <option value="Error">Error</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="mb-1">Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="mb-1">Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
              <Button variant="outline-success" onClick={exportToExcel}>
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
                      <th>Host</th>
                      <th>IP</th> {/* ✅ Thêm cột IP */}
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                      <th>File kết quả</th>
                      <th>Exclude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item, index) => {
                      const startTimeDate = new Date(item.starttime);
                      const diffHours =
                        (new Date() - startTimeDate) / (1000 * 60 * 60);

                      return (
                        <tr
                          key={item.id || index}
                          className={statusRowClass[item.status] || ""}
                        >
                          <td>{(currentPage - 1) * pageSize + index + 1}</td>
                          <td>{item.host}</td>
                          <td>{item.ip || "-"}</td> {/* ✅ Hiển thị IP */}
                          {/* ✅ Bôi đỏ nếu quá 24h + tooltip full datetime */}
                          <td
                            className={diffHours > 24 ? "text-danger" : ""}
                            title={startTimeDate.toLocaleString()}
                          >
                            {startTimeDate.toLocaleString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
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
                                Download
                              </a>
                            ) : (
                              "Không có file"
                            )}
                          </td>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={!!item.excluded}
                              onChange={(e) =>
                                handleToggleExclude(item.host, e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {totalPages > 1 && (
                  <Pagination className="justify-content-center mt-3">
                    {currentPage > 1 && (
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    )}
                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => Math.max(1, currentPage - 2) + i
                    )
                      .filter((page) => page <= totalPages)
                      .map((page) => (
                        <Pagination.Item
                          key={page}
                          active={currentPage === page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}
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
  );
};

export default HealthcheckTable;
