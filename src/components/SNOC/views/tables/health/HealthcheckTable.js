import { saveAs } from "file-saver";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Nav,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { SERVER_MEDIA } from "../../../config/constant";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import {
  fetchLatestHealthcheckView,
  fetchPSCoreStatus,
  GenericHealthCheckView,
  toggleDeviceExcluded,
  upsertLatestFromClient, // ✅ upsert ngay vào latest
} from "../../../redux/Healthcheck/healthcheckSlice";
import KPIExplorerCore from "../../forms/kpi/KPIExplorerCore";
import MultiPlatformKPITab from "../../forms/kpi/MultiPlatformKPITab";
import { fetchKpiDashboardState } from "../../../redux/KPI/kpiDashboardStateSlice";
import styles from "./../../../styles/SystemHealth.module.scss";
// ✅ Recharts cho đồ thị
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 👉 KPI Explorer core (tách phần chính để embed vào modal)

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
  hideChart = false,
}) => {
  useScheduleWebSocket();
  const dispatch = useDispatch();

  const {
    lastestitems = [],
    // countlastest = 0, // FE tự phân trang nên không cần
    loading = false,
  } = useSelector((state) => state.pscore || {});

  const {
    hostHistoryItems = [],
    hostHistoryCount = 0,
    hostHistoryLoading = false,
  } = useSelector((state) => state.pscore || {});

  // 🔹 Dữ liệu cho đồ thị NOK theo giờ (24h)
  const { hourlyItems = [], hourlyLoading = false } = useSelector(
    (state) => state.pscore || {},
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "starttime",
    direction: "desc",
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showHostHistory, setShowHostHistory] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [hostHistoryPage, setHostHistoryPage] = useState(1);

  // 🔹 Drilldown chart theo giờ
  const [showHourModal, setShowHourModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedHourItems, setSelectedHourItems] = useState([]);

  // Tab KPI section (chỉ dùng khi subsystem PGW)
  // Mặc định "multi" nếu đã có KPI Multi-PGW ghim liên quan tới platform của bảng này,
  // ngược lại giữ "single" như cũ.
  const isPgw = platformList.some((p) => p.toLowerCase().includes("pgw"));
  const { multiPinned = [], loaded: multiPinLoaded = false } = useSelector(
    (state) => state.kpiDashboardState || {}
  );
  useEffect(() => {
    if (!multiPinLoaded) dispatch(fetchKpiDashboardState());
  }, [multiPinLoaded, dispatch]);
  const hasRelevantMultiPin = useMemo(
    () => multiPinned.some((p) => (p.platforms || []).some((plat) => platformList.includes(plat))),
    [multiPinned, platformList]
  );
  const [kpiTab, setKpiTab] = useState("single");
  useEffect(() => {
    if (isPgw && hasRelevantMultiPin) setKpiTab("multi");
  }, [isPgw, hasRelevantMultiPin]);

  // ✅ trạng thái đang chạy healthcheck theo từng host (chỉ row đó quay)
  const [runningByHost, setRunningByHost] = useState({});
  const anyRowRunning = useMemo(
    () => Object.values(runningByHost).some(Boolean),
    [runningByHost],
  );

  const pageSize = 10;

  // ===== Fetch full list latest theo bảng (BE KHÔNG paginate) =====
  useEffect(() => {
    dispatch(
      fetchLatestHealthcheckView({
        host: searchTerm, // có thể filter host ở BE cho nhẹ; để "" nếu muốn lấy tất cả
        platform: platformList,
      }),
    );
  }, [dispatch, group, subsystem, platformList, searchTerm]);

  // Reset về trang 1 khi đổi context / filter
  useEffect(() => {
    setCurrentPage(1);
  }, [
    group,
    subsystem,
    JSON.stringify(platformList),
    searchTerm,
    statusFilter,
    startDate,
    endDate,
  ]);

  // ===== Fetch history theo host khi mở modal lịch sử =====
  useEffect(() => {
    if (showHostHistory && selectedHost) {
      dispatch(
        fetchPSCoreStatus({
          host: selectedHost,
          page: hostHistoryPage,
          platform: [],
          option: "",
          storeKey: "hostHistory",
        }),
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
        page_size: 1000,
        hours: 24,
        option: "",
        storeKey: "hourly",
      }),
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

  // ====== Xác định platform cho từng dòng ======
  const hostPlatformIndex = useMemo(() => {
    const m = new Map();
    (hourlyItems || []).forEach((it) => {
      if (it?.host && it?.platform) m.set(it.host, String(it.platform));
    });
    (hostHistoryItems || []).forEach((it) => {
      if (it?.host && it?.platform) m.set(it.host, String(it.platform));
    });
    (lastestitems || []).forEach((it) => {
      if (it?.host && it?.platform) m.set(it.host, String(it.platform));
    });
    return m;
  }, [hourlyItems, hostHistoryItems, lastestitems]);

  const normalizePlatform = (p) => (typeof p === "string" ? p.trim() : "");

  const resolvePlatformForRow = (item) => {
    const fromItem =
      normalizePlatform(item?.platform) ||
      normalizePlatform(item?.platform_name) ||
      (Array.isArray(item?.platforms)
        ? normalizePlatform(item.platforms[0])
        : "");
    if (fromItem) return fromItem;

    const byIndex = hostPlatformIndex.get(item?.host);
    if (byIndex) return byIndex;

    if (Array.isArray(platformList) && platformList.length === 1) {
      return platformList[0];
    }
    return "";
  };

  // ====== Chạy healthcheck 1 thiết bị + upsert ngay vào latest ======
  const runHealthcheck = async (platform, host, rowFallback = {}) => {
    if (!platform || !host) return;
    setRunningByHost((prev) => ({ ...prev, [host]: true }));
    try {
      const res = await dispatch(
        GenericHealthCheckView({
          selectedPlatform: platform,
          selectedDevice: [host],
        }),
      ).unwrap();

      const arr = Array.isArray(res) ? res : res ? [res] : [];
      for (const r of arr) {
        const normalized = {
          id:
            (r?.id && String(r.id)) ||
            `${r?.host || host}-${r?.endtime || r?.starttime || Date.now()}`,
          host: r?.host || host,
          ip: r?.ip ?? rowFallback.ip ?? "",
          platform: r?.platform || platform,
          status: r?.status || "OK",
          notes: Array.isArray(r?.notes)
            ? r.notes.map((n) => n?.note ?? "").join(" | ")
            : (r?.notes ?? ""),
          result_file: r?.result_file || "",
          usecase: r?.usecase || "manual",
          starttime: r?.starttime || new Date().toISOString(),
          endtime: r?.endtime || null,
          excluded:
            typeof rowFallback.excluded === "boolean"
              ? rowFallback.excluded
              : false,
          group,
          subsystem,
        };
        dispatch(upsertLatestFromClient(normalized));
      }
    } catch (err) {
      console.error("Healthcheck error:", err);
    } finally {
      setRunningByHost((prev) => ({ ...prev, [host]: false }));
    }
  };

  // ====== Lọc / sắp xếp / export ======
  const filteredItems = useMemo(() => {
    const lowerSearch = (searchTerm || "").toLowerCase();

    return (lastestitems || []).filter((item) => {
      // Text search (client-side)
      const matchesText =
        !lowerSearch ||
        item.host?.toLowerCase().includes(lowerSearch) ||
        item.ip?.toLowerCase().includes(lowerSearch) ||
        item.status?.toLowerCase().includes(lowerSearch) ||
        (Array.isArray(item.notes)
          ? item.notes.some((note) =>
              note.note?.toLowerCase().includes(lowerSearch),
            )
          : String(item.notes || "")
              .toLowerCase()
              .includes(lowerSearch)) ||
        new Date(item.starttime)
          .toLocaleString()
          .toLowerCase()
          .includes(lowerSearch);

      // Status filter
      const matchesStatus = statusFilter ? item.status === statusFilter : true;

      // Date range filter
      const matchesDate =
        (!startDate || new Date(item.starttime) >= new Date(startDate)) &&
        (!endDate || new Date(item.starttime) <= new Date(endDate));

      // Platform filter theo subsystem/platformList
      const rowPlat = resolvePlatformForRow(item);
      const matchesPlatform = !platformList?.length
        ? true
        : platformList.includes(rowPlat);

      return matchesText && matchesStatus && matchesDate && matchesPlatform;
    });
  }, [
    lastestitems,
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    platformList,
  ]);

  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    const { key, direction } = sortConfig;

    if (!key) {
      // mặc định sort theo thời gian mới nhất
      arr.sort((a, b) => new Date(b.starttime) - new Date(a.starttime));
      return arr;
    }

    arr.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (valA === valB) return 0;

      // nếu là thời gian
      if (key.toLowerCase().includes("time")) {
        const tA = new Date(valA).getTime();
        const tB = new Date(valB).getTime();
        return direction === "asc" ? tA - tB : tB - tA;
      }

      // so sánh string/number thường
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [filteredItems, sortConfig]);

  // Client-side pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage]);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const exportToExcel = () => {
    const data = sortedItems.map((item, index) => ({
      STT: index + 1,
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
        d.getDate(),
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
      nok: bucket.get(key(d)) || null,
    }));
  };

  // ✅ Chỉ build series / index khi có chart để hiển thị
  const hourlySeries = useMemo(
    () => (!hideChart ? buildHourlySeries(hourlyItems || []) : []),
    [hourlyItems, hideChart],
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
        <div>NOK: {payload?.[0]?.value ?? 0}</div>
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

  const handleChartClick = (data) => {
    const label = data?.activeLabel;
    if (!label) return;
    const arr = hourIndex.get(label) || [];
    setSelectedHour(label);
    setSelectedHourItems(arr);
    setShowHourModal(true);
  };

const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    console.log("Checking permissions for:", claims?.username);
    return claims?.role === 'admin' || claims?.role === 'super';
  }, []); // [] có nghĩa là chỉ chạy 1 lần duy nhất khi component load

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
            {/* 🔒 CHẶN SUBMIT FORM để tránh /to/ajaxRequestNotify */}
            <Form
              className="d-flex flex-wrap align-items-end gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
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
              <Button
                type="button"
                variant="outline-success"
                onClick={exportToExcel}
              >
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
                    <LineChart
                      data={hourlySeries}
                      onClick={handleChartClick}
                      style={{ cursor: "pointer" }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="nok"
                        name="NOK"
                        stroke={NOK_BAR_COLOR}
                        strokeWidth={2}
                        dot={{ r: 4, fill: NOK_BAR_COLOR, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: NOK_BAR_COLOR, stroke: "#fff", strokeWidth: 2 }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {loading && !anyRowRunning ? (
              <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                <Table
                  responsive
                  hover
                  bordered
                  className="table-sm"
                  style={{ fontSize: "0.75rem" }}
                >
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSort("index")}
                      >
                        STT
                      </th>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSort("host")}
                      >
                        Host
                      </th>
                      <th>IP</th>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSort("starttime")}
                      >
                        Thời gian
                      </th>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSort("status")}
                      >
                        Trạng thái
                      </th>
                      <th>Ghi chú</th>
                      <th>File kết quả</th>
                      <th style={{ width: 140 }}>Healthcheck</th>
                      <th>Exclude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedItems.map((item, index) => {
                      const startTimeDate = new Date(item.starttime);
                      const diffHours =
                        (new Date() - startTimeDate) / (1000 * 60 * 60);

                      const host = item.host;
                      const rowPlatform = resolvePlatformForRow(item);
                      const rowKey = `${host}|${rowPlatform}`; // ✅ key duy nhất theo host|platform

                      const running = !!runningByHost[host];
                      const disableBtn = !host || !rowPlatform || running;

                      const rowFallback = {
                        id: item.id,
                        ip: item.ip,
                        excluded: item.excluded,
                      };

                      return (
                        <tr
                          key={rowKey}
                          className={statusRowClass[item.status] || ""}
                        >
                          <td>{(currentPage - 1) * pageSize + index + 1}</td>
                          <td>
                            <Button
                              type="button" // 🔒 không để submit
                              variant="link"
                              className="p-0 text-decoration-underline"
                              onClick={() => {
                                setSelectedHost(item.host);
                                setHostHistoryPage(1);
                                setShowHostHistory(true);
                              }}
                              disabled={running}
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

                          {/* ✅ Nút healthcheck từng thiết bị */}
                          <td>
                            {isAdmin && (
                            <Button
                              type="button" // 🔒 không để submit
                              size="sm"
                              variant="primary"
                              className="d-inline-flex align-items-center gap-2"
                              disabled={disableBtn}
                              title={
                                !rowPlatform
                                  ? "Chưa xác định platform (hãy đảm bảo subsystem/platform đúng)"
                                  : "Chạy healthcheck thiết bị này"
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                runHealthcheck(rowPlatform, host, rowFallback);
                              }}
                            >
                              {running && (
                                <Spinner size="sm" animation="border" />
                              )}
                              <span>{running ? "Running..." : "Run"}</span>
                            </Button>
                            )}
                          </td>

                          <td className="text-center">
                            {isAdmin && (
                            <Form.Check
                              type="checkbox"
                              checked={!!item.excluded}
                              disabled={running}
                              onChange={(e) =>
                                handleToggleExclude(item.host, e.target.checked)
                              }
                            />
                            )}
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
                      (_, i) => Math.max(1, currentPage - 2) + i,
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
                    <Modal.Title>
                      Lịch sử healthcheck: {selectedHost}
                    </Modal.Title>
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
                          {hostHistoryItems.map((it) => {
                            const t = new Date(it.starttime);
                            const notes = Array.isArray(it.notes)
                              ? it.notes.map((n) => n.note).join(" | ")
                              : it.notes || "";
                            const histKey = `${it.host}|${
                              it.platform
                            }|${t.getTime()}`;
                            return (
                              <tr
                                key={histKey}
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
                                <td style={{ whiteSpace: "pre-line" }}>
                                  {notes}
                                </td>
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
                      type="button"
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
                        {selectedHourItems.map((it) => {
                          const t = new Date(it.starttime);
                          const notes = Array.isArray(it.notes)
                            ? it.notes.map((n) => n.note).join(" | ")
                            : it.notes || "";
                          const hrKey = `${it.host}|${
                            it.platform
                          }|${t.getTime()}`;
                          return (
                            <tr
                              key={hrKey}
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
                              <td style={{ whiteSpace: "pre-line" }}>
                                {notes}
                              </td>
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
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowHourModal(false)}
                    >
                      Đóng
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
            )}
          </Card.Body>
          {/* ==== KPI SECTION (inline) ==== */}
          <div className="mt-3">
            <Card>
              {isPgw && (
                <Card.Header className="py-1">
                  <Nav variant="tabs" activeKey={kpiTab} onSelect={setKpiTab} className="border-0 mb-n1">
                    <Nav.Item>
                      <Nav.Link eventKey="single" style={{ fontSize: "0.8rem", padding: "3px 12px" }}>
                        Single Platform
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="multi" style={{ fontSize: "0.8rem", padding: "3px 12px" }}>
                        📌 Multi-PGW
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>
              )}
              <Card.Body>
                {(!isPgw || kpiTab === "single") && (
                  <KPIExplorerCore
                    defaultGroup={group}
                    defaultSubsystem={subsystem}
                    defaultPlatform={platformList?.[0] || ""}
                    realtime={false}
                    embedded
                  />
                )}
                {isPgw && kpiTab === "multi" && (
                  <MultiPlatformKPITab />
                )}
              </Card.Body>
            </Card>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default HealthcheckTable;
