import { saveAs } from "file-saver";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as ExcelJS from "exceljs";
import { SERVER_MEDIA } from "../../../config/constant";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchLatestHealthcheckView,
  fetchPSCoreStatus,
  toggleDeviceExcluded,
} from "../../../redux/Healthcheck/healthcheckSlice";
import styles from "./../../../styles/SystemHealth.module.scss";

// ✅ Recharts cho đồ thị
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const NOK_BAR_COLOR = "#dc3545";

const statusRowClass = {
  OK: "table-success",
  Warning: "table-warning",
  Error: "table-danger",
  NOK: "table-danger",
  Unknown: "table-secondary",
};

const HealthcheckTable = ({
  group,
  subsystem,
  platformList = [],
  hideChart = false, // 👈 thêm prop
}) => {
  useScheduleWebSocket();
  const dispatch = useDispatch();

  const {
    lastestitems = [],
    countlastest = 0,
    loading = false,
  } = useSelector((state) => state.pscore || {});

  const {
    hostHistoryItems = [],
    hostHistoryCount = 0,
    hostHistoryLoading = false,
  } = useSelector((state) => state.pscore || {});

  // 🔹 Dữ liệu cho đồ thị NOK theo giờ (24h)
  const { hourlyItems = [], hourlyLoading = false } = useSelector(
    (state) => state.pscore || {}
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const searchHostRef = useRef("");

  const [showHostHistory, setShowHostHistory] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [hostHistoryPage, setHostHistoryPage] = useState(1);

  // 🔹 Drilldown chart theo giờ
  const [showHourModal, setShowHourModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedHourItems, setSelectedHourItems] = useState([]);

  const pageSize = 10;
  const totalPages = Math.ceil(countlastest / pageSize);

  // Fetch list latest theo bảng
  useEffect(() => {
    dispatch(
      fetchLatestHealthcheckView({
        host: searchHostRef.current,
        page: currentPage,
        platform: platformList,
      })
    );
  }, [dispatch, currentPage, group, subsystem, platformList]);

  // Fetch history theo host khi mở modal lịch sử
  useEffect(() => {
    if (showHostHistory && selectedHost) {
      dispatch(
        fetchPSCoreStatus({
          host: selectedHost,
          page: hostHistoryPage,
          platform: [],
          option: "",
          storeKey: "hostHistory",
        })
      );
    }
  }, [dispatch, showHostHistory, selectedHost, hostHistoryPage]);

  // ✅ Chỉ fetch dữ liệu chart 24h khi KHÔNG ẩn chart
  useEffect(() => {
    if (hideChart) return;
    if (!platformList || platformList.length === 0) return;
    dispatch(
      fetchPSCoreStatus({
        platform: platformList,
        page: 1,
        page_size: 1000, // gom đủ dữ liệu
        hours: 24, // 24h gần nhất
        option: "",
        storeKey: "hourly",
      })
    );
  }, [dispatch, platformList, hideChart]);

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
      item.ip?.toLowerCase().includes(lowerSearch) ||
      item.status?.toLowerCase().includes(lowerSearch) ||
      (Array.isArray(item.notes)
        ? item.notes.some((note) =>
            note.note?.toLowerCase().includes(lowerSearch)
          )
        : String(item.notes || "").toLowerCase().includes(lowerSearch)) ||
      new Date(item.starttime).toLocaleString().toLowerCase().includes(lowerSearch);

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

  const exportToExcel = async () => {
    const data = sortedItems.map((item, index) => ({
      STT: (currentPage - 1) * pageSize + index + 1,
      Host: item.host,
      IP: item.ip || "-",
      "Thời gian": new Date(item.starttime).toLocaleString(),
      "Trạng thái": item.status,
      "Ghi chú": Array.isArray(item.notes)
        ? item.notes.map((n) => n.note).join(" | ")
        : String(item.notes || ""),
      "File kết quả": item.result_file || "",
      Excluded: item.excluded ? "Yes" : "No",
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

  // ================== Build series NOK theo giờ (24h) ==================
  const buildHourlySeries = (items) => {
    const now = new Date();
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      d.setMinutes(0, 0, 0);
      hours.push(d);
    }
    const key = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:00`;

    const bucket = new Map(hours.map((d) => [key(d), 0]));

    items.forEach((it) => {
      if (!it?.starttime) return;
      const t = new Date(it.starttime);
      const h = new Date(t);
      h.setMinutes(0, 0, 0);
      const k = key(h);
      const isNok = it.status === "NOK" || it.status === "Error";
      if (isNok && bucket.has(k)) bucket.set(k, bucket.get(k) + 1);
    });

    return hours.map((d) => ({
      hour: key(d).slice(11, 16), // HH:00
      nok: bucket.get(key(d)) || 0,
    }));
  };

  // ✅ Chỉ build series / index khi có chart để hiển thị
  const hourlySeries = useMemo(
    () => (!hideChart ? buildHourlySeries(hourlyItems || []) : []),
    [hourlyItems, hideChart]
  );

  const hourIndex = useMemo(() => {
    if (hideChart) return new Map();
    const m = new Map();
    (hourlyItems || []).forEach((it) => {
      if (!it?.starttime) return;
      const t = new Date(it.starttime);
      const h = new Date(t);
      h.setMinutes(0, 0, 0);
      const label = String(h.getHours()).padStart(2, "0") + ":00";
      const isNok = it.status === "NOK" || it.status === "Error";
      if (!isNok) return;
      if (!m.has(label)) m.set(label, []);
      m.get(label).push(it);
    });
    return m;
  }, [hourlyItems, hideChart]);

  // ✅ Tooltip tùy biến: hiện top một số host NOK
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const arr = hourIndex.get(label) || [];
    const uniqHosts = Array.from(new Set(arr.map((x) => x.host)));
    const top = uniqHosts.slice(0, 6);
    const more = uniqHosts.length - top.length;

    return (
      <div className="p-2 bg-white border rounded shadow-sm">
        <div>
          <strong>{label}</strong>
        </div>
        <div>NOK: {payload[0].value}</div>
        {top.map((h) => (
          <div key={h} style={{ fontSize: "0.85rem" }}>
            • {h}
          </div>
        ))}
        {more > 0 && (
          <div style={{ fontSize: "0.85rem" }}>
            +{more} node nữa… (click cột để xem)
          </div>
        )}
      </div>
    );
  };

  // ✅ Click cột để mở modal liệt kê node NOK giờ đó
  const handleBarClick = (data /* entry */, index) => {
    const label = data?.payload?.hour;
    const arr = hourIndex.get(label) || [];
    setSelectedHour(label);
    setSelectedHourItems(arr);
    setShowHourModal(true);
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
            {/* ==== ĐỒ THỊ NOK THEO GIỜ (24H) ==== */}
            {!hideChart && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">NOK theo giờ (24h gần nhất)</h6>
                  {hourlyLoading && <Spinner animation="border" size="sm" />}
                </div>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={hourlySeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="nok"
                        name="NOK"
                        fill={NOK_BAR_COLOR}
                        stroke={NOK_BAR_COLOR}
                        cursor="pointer"
                        onClick={handleBarClick}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

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
                      <th>IP</th>
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
                          <td>
                            <Button
                              variant="link"
                              className="p-0 text-decoration-underline"
                              onClick={() => {
                                setSelectedHost(item.host);
                                setHostHistoryPage(1);
                                setShowHostHistory(true);
                              }}
                            >
                              {item.host}
                            </Button>
                          </td>
                          <td>{item.ip || "-"}</td>
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
                            {Array.isArray(item.notes)
                              ? item.notes.map((n) => n.note).join(" | ")
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

                {/* Modal lịch sử theo host */}
                <Modal
                  show={showHostHistory}
                  onHide={() => setShowHostHistory(false)}
                  size="xl"
                  centered
                  dialogClassName={styles.modalWide}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Lịch sử healthcheck: {selectedHost}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {hostHistoryLoading ? (
                      <div className="text-center my-4">
                        <Spinner animation="border" />
                      </div>
                    ) : (
                      <Table responsive hover bordered className="table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Thời gian</th>
                            <th>Platform</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th>File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hostHistoryItems.map((it, idx) => {
                            const t = new Date(it.starttime);
                            const notes = Array.isArray(it.notes)
                              ? it.notes.map((n) => n.note).join(" | ")
                              : it.notes || "";
                            return (
                              <tr
                                key={it.id || `${idx}-${t.getTime()}`}
                                className={statusRowClass[it.status] || ""}
                              >
                                <td title={t.toLocaleString()}>
                                  {t.toLocaleString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  })}
                                </td>
                                <td>{it.platform}</td>
                                <td>{it.status}</td>
                                <td style={{ whiteSpace: "pre-line" }}>{notes}</td>
                                <td>
                                  {it.result_file ? (
                                    <a
                                      href={`${SERVER_MEDIA}/download${it.result_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      Download
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowHostHistory(false)}
                    >
                      Đóng
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Modal drilldown: node NOK theo giờ */}
                <Modal
                  show={showHourModal}
                  onHide={() => setShowHourModal(false)}
                  size="lg"
                  centered
                  dialogClassName={styles.modalWide}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Node NOK lúc {selectedHour}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Table responsive hover bordered className="table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Thời gian</th>
                          <th>Host</th>
                          <th>Platform</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedHourItems.map((it, idx) => {
                          const t = new Date(it.starttime);
                          const notes = Array.isArray(it.notes)
                            ? it.notes.map((n) => n.note).join(" | ")
                            : it.notes || "";
                          return (
                            <tr
                              key={it.id || `${idx}-${t.getTime()}`}
                              className={statusRowClass[it.status] || ""}
                            >
                              <td title={t.toLocaleString()}>
                                {t.toLocaleString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </td>
                              <td>{it.host}</td>
                              <td>{it.platform}</td>
                              <td>{it.status}</td>
                              <td style={{ whiteSpace: "pre-line" }}>{notes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    {selectedHourItems.length === 0 && (
                      <div className="text-center text-muted">
                        Không có node NOK trong giờ này.
                      </div>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHourModal(false)}>
                      Đóng
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HealthcheckTable;
