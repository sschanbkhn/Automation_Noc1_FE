import React, { useEffect, useState, useRef, useMemo } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Form,
  Pagination,
  Button,
} from "react-bootstrap";
import { useParams, useLocation } from "react-router-dom";
import { fetchLatestHealthcheckView } from "../../../redux/Healthcheck/healthcheckSlice";
import { SERVER_MEDIA } from "../../../config/constant";
import Alert from "../../../components/Alert/Alert";
import snocStore from "../../../store/snocStore";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import snocApi from "../../../api/snocApiWithAutoToken";

const statusRowClass = {
  OK: "",
  Warning: "table-warning",
  Error: "table-danger",
  NOK: "table-danger",
  Unknown: "table-secondary",
};

const HealthcheckTable = () => {
  useScheduleWebSocket();
  const dispatch = useDispatch();
  const { group, subsystem } = useParams();
  const { state } = useLocation();

  const {
    lastestitems = [],
    loading = false,
    countlastest = 0,
  } = useSelector((state) => state.pscore || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [platformList, setPlatformList] = useState([]);
  const searchHostRef = useRef("");
  const pageSize = 10;

  useEffect(() => {
    const fetchPlatformList = async () => {
      if (state?.platform) {
        const pList = Array.isArray(state.platform)
          ? state.platform
          : [state.platform];
        setPlatformList(pList);
        return;
      }
      const stored = localStorage.getItem("platformFromDashboard");
      if (stored) {
        localStorage.removeItem("platformFromDashboard");
        try {
          const parsed = JSON.parse(stored);
          setPlatformList(Array.isArray(parsed) ? parsed : [parsed]);
          return;
        } catch {
          setPlatformList([]);
          return;
        }
      }
      // fallback: fetch from backend
      try {
        const res = await snocApi.get(
          `/nornirps/schema/platforms-by-subsystem/?group=${encodeURIComponent(
            group
          )}&subsystem=${encodeURIComponent(subsystem)}`
        );
        setPlatformList(res.data.platforms || []);
      } catch (err) {
        console.error("❌ Failed to fetch platforms", err);
        setPlatformList([]);
      }
    };

    fetchPlatformList();
  }, [group, subsystem, state]);

  useEffect(() => {
    if (platformList.length === 0) return;
    dispatch(
      fetchLatestHealthcheckView({
        host: searchHostRef.current,
        page: currentPage,
        platform: platformList,
      })
    );
  }, [dispatch, currentPage, group, subsystem, platformList]);

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

  const filteredItems = lastestitems.filter((item) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesText =
      item.host?.toLowerCase().includes(lowerSearch) ||
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

  const pagedItems = sortedItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToExcel = async () => {
    const data = filteredItems.map((item, index) => ({
      STT: index + 1,
      Host: item.host,
      "Thời gian": new Date(item.starttime).toLocaleString(),
      "Trạng thái": item.status,
      "Ghi chú": Array.isArray(item.notes)
        ? item.notes.map((n) => n.note).join(" | ")
        : "",
      "File kết quả": item.result_file || "",
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Healthcheck");

    // Định nghĩa columns
    const columns = Object.keys(data[0] || {}).map(key => ({
      header: key,
      key: key,
      width: 20
    }));
    worksheet.columns = columns;

    // Thêm data
    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `${group || "healthcheck"}_export.xlsx`);
  };

  const totalPages = Math.ceil(countlastest / pageSize);
  const title = subsystem && group ? `${group} / ${subsystem}` : group || "Healthcheck";

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex flex-wrap align-items-end justify-content-between gap-2">
              <div>
                <Card.Title as="h5" className="mb-0">
                  {title} - Bản ghi healthcheck
                </Card.Title>
              </div>
              <Form className="d-flex flex-wrap align-items-end gap-2">
                <Form.Group>
                  <Form.Label className="mb-1">Tìm kiếm</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <th onClick={() => handleSort("index")}>STT</th>
                        <th onClick={() => handleSort("host")}>Host</th>
                        <th onClick={() => handleSort("created_at")}>
                          Thời gian
                        </th>
                        <th onClick={() => handleSort("status")}>Trạng thái</th>
                        <th>Ghi chú</th>
                        <th>File kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedItems.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className={statusRowClass[item.status] || ""}
                        >
                          <td>{(currentPage - 1) * pageSize + index + 1}</td>
                          <td>{item.host}</td>
                          <td>{new Date(item.starttime).toLocaleString()}</td>
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
                      {currentPage > 3 && (
                        <>
                          <Pagination.Item onClick={() => handlePageChange(1)}>
                            1
                          </Pagination.Item>
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
    </>
  );
};

const HealthcheckPage = () => (
  <Provider store={snocStore}>
    <Alert />
    <HealthcheckTable />
  </Provider>
);

export default HealthcheckPage;
