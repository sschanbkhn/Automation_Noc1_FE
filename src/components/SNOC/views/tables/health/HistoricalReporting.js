import { saveAs } from "file-saver";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import Select from "react-select";
import * as XLSX from "xlsx";
import { SERVER_MEDIA } from "../../../config/constant";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchPSCoreStatus } from "../../../redux/Healthcheck/healthcheckSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue: (b) => ({ ...b, margin: "1px 2px" }),
};

const statusRowClass = {
  OK: "table-success",
  Warning: "table-warning",
  Error: "table-danger",
  NOK: "table-danger",
  Unknown: "table-secondary",
};

const HOURS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "1 giờ", value: 1 },
  { label: "6 giờ", value: 6 },
  { label: "12 giờ", value: 12 },
  { label: "24 giờ", value: 24 },
  { label: "48 giờ", value: 48 },
  { label: "72 giờ", value: 72 },
  { label: "7 ngày", value: 168 },
];

const HistoricalReporting = () => {
  useScheduleWebSocket();

  const dispatch = useDispatch();
  const {
    items = [],
    loading = false,
    count = 0,
  } = useSelector((state) => state.pscore || {});
  const { platforms = [] } = useSelector((s) => s.platformDevice || {});

  const [host, setHost] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedHours, setSelectedHours] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [hasSearched, setHasSearched] = useState(false);

  // Refs để giữ filter hiện tại khi đổi trang
  const searchHostRef = useRef("");
  const searchPlatformsRef = useRef([]);
  const searchHoursRef = useRef("");

  const pageSize = 10;

  const platformOptions = useMemo(
    () => platforms.map((p) => ({ label: p?.name, value: p?.name })),
    [platforms],
  );

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Chỉ fetch khi đã search và khi đổi trang
  useEffect(() => {
    if (!hasSearched) return;
    dispatch(
      fetchPSCoreStatus({
        host: searchHostRef.current,
        page: currentPage,
        platform: searchPlatformsRef.current,
        hours: searchHoursRef.current || undefined,
      }),
    );
  }, [dispatch, currentPage, hasSearched]);

  const totalPages = Math.ceil(count / pageSize);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedHost = host.trim();
    searchHostRef.current = trimmedHost;
    searchPlatformsRef.current = selectedPlatforms.map((p) => p.value);
    searchHoursRef.current = selectedHours;
    setCurrentPage(1);
    setHasSearched(true);
    dispatch(
      fetchPSCoreStatus({
        host: trimmedHost,
        page: 1,
        platform: searchPlatformsRef.current,
        hours: selectedHours || undefined,
      }),
    );
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedItems = [...items].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const exportToExcel = () => {
    const data = sortedItems.map((item, index) => ({
      STT: (currentPage - 1) * pageSize + index + 1,
      Host: item.host,
      IP: item.ip || "-",
      "Thời gian": new Date(item.created_at).toLocaleString(),
      "Trạng thái": item.status,
      "Ghi chú": Array.isArray(item.notes)
        ? item.notes.map((n) => n.note).join(" | ")
        : item.notes || "",
      "File kết quả": item.result_file || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HistoricalReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `historical_healthcheck_export.xlsx`);
  };

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
              <Card.Header>
                <Card.Title as="h5" className="mb-3">
                  Historical Reporting — Lịch sử Healthcheck
                </Card.Title>

                {/* Form tìm kiếm */}
                <Form onSubmit={handleSearch}>
                  <Row className="g-2 align-items-end">
                    <Col md={3}>
                      <Form.Label className="mb-1 small fw-semibold">Host / IP</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập host hoặc IP"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="mb-1 small fw-semibold">Platform</Form.Label>
                      <Select
                        isMulti
                        options={platformOptions}
                        value={selectedPlatforms}
                        onChange={setSelectedPlatforms}
                        placeholder="Tất cả platform..."
                        styles={SELECT_STYLES}
                        closeMenuOnSelect={false}
                        isClearable
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label className="mb-1 small fw-semibold">Khoảng thời gian</Form.Label>
                      <Form.Select
                        value={selectedHours}
                        onChange={(e) => setSelectedHours(e.target.value)}
                      >
                        {HOURS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md="auto">
                      <Button variant="primary" type="submit" className="px-4">
                        Tìm kiếm
                      </Button>
                    </Col>
                    <Col md="auto">
                      <Button
                        variant="outline-success"
                        type="button"
                        onClick={exportToExcel}
                        disabled={!hasSearched || sortedItems.length === 0}
                      >
                        Xuất Excel
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Header>

              <Card.Body>
                {!hasSearched ? (
                  <div className="text-center text-muted py-5">
                    <p className="mb-0">
                      Nhập điều kiện tìm kiếm và bấm <strong>Tìm kiếm</strong> để hiển thị lịch sử.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <>
                    <Table responsive hover bordered className="table-sm">
                      <thead className="table-light">
                        <tr>
                          <th onClick={() => handleSort("index")} style={{ cursor: "pointer" }}>
                            STT
                          </th>
                          <th onClick={() => handleSort("host")} style={{ cursor: "pointer" }}>
                            Host
                          </th>
                          <th>IP</th>
                          <th onClick={() => handleSort("created_at")} style={{ cursor: "pointer" }}>
                            Thời gian
                          </th>
                          <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                            Trạng thái
                          </th>
                          <th>Ghi chú</th>
                          <th>File kết quả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center text-muted">
                              Không tìm thấy bản ghi nào.
                            </td>
                          </tr>
                        ) : (
                          sortedItems.map((item, index) => (
                            <tr
                              key={item.id || index}
                              className={statusRowClass[item.status] || ""}
                            >
                              <td>{(currentPage - 1) * pageSize + index + 1}</td>
                              <td>{item.host}</td>
                              <td>{item.ip || "-"}</td>
                              <td>{new Date(item.created_at).toLocaleString()}</td>
                              <td>{item.status}</td>
                              <td style={{ whiteSpace: "pre-line" }}>
                                {Array.isArray(item.notes)
                                  ? item.notes.map((n) => n.note).join("\n")
                                  : item.notes || ""}
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
                          ))
                        )}
                      </tbody>
                    </Table>

                    {totalPages > 1 && (
                      <Pagination className="justify-content-center mt-3">
                        {currentPage > 1 && (
                          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
                        )}

                        {currentPage > 3 && (
                          <>
                            <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
                            {currentPage > 4 && <Pagination.Ellipsis disabled />}
                          </>
                        )}

                        {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
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

                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}
                            <Pagination.Item onClick={() => handlePageChange(totalPages)}>
                              {totalPages}
                            </Pagination.Item>
                          </>
                        )}

                        {currentPage < totalPages && (
                          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
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

export default HistoricalReporting;
