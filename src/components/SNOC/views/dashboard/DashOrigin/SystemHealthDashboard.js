// src/components/SNOC/views/dashboard/DashOrigin/SystemHealthDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Modal, Row, Spinner, Table } from "react-bootstrap";
import KPIExplorerCore from "../../forms/kpi/KPIExplorerCore";

import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import { SERVER_MEDIA } from "../../../config/constant";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchHealthcheckSchedules,
  fetchLatestHealthcheckView,
  fetchPlatformGroupSchema,
  fetchPSCoreStatus,
  fetchSystemStatus,
  fetchSystemStatusByGroup,
  syncDeviceExcluded,
} from "../../../redux/Healthcheck/healthcheckSlice";
import HealthcheckTable from "../../tables/health/HealthcheckTable";
import styles from "./../../../styles/SystemHealth.module.scss";
import TopNavbarHealth from "./TopNavbarHealth";

// ====== HẰNG SỐ / SELECTOR ỔN ĐỊNH ======
const statusColorClass = {
  Normal: "success",
  Warning: "warning",
  Error: "danger",
  Unknown: "secondary",
};

const cardClassMapping = {
  "CS Core": styles.cardCsCore,
  "PS Core": styles.cardPsCore,
  Signal: styles.cardSignal,
  OCS: styles.cardOcs,
  "IMS Core": styles.cardIms,
  "UDC Core": styles.cardUdc,
};

const LINE_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#AA336A",
];

const EMPTY_OBJ = Object.freeze({});

const selectSystemStatus = (s) => s.pscore?.systemStatus ?? EMPTY_OBJ;
const selectLoading = (s) => s.pscore?.loading ?? false;
const selectPlatformSchema = (s) => s.pscore?.platformSchema ?? EMPTY_OBJ;
const selectRecentlyUpdated = (s) => s.pscore?.recentlyUpdated ?? EMPTY_OBJ;
const selectSystemLastUpdated = (s) =>
  s.pscore?.last_updated ?? s.pscore?.systemStatus?.last_updated ?? null;

// ====== UTILS ======
const slug = (s = "") =>
  s.toString().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");

const LS_ORDER_KEY = "hc_group_order";
const normalizeOrder = (stored, names) => {
  const set = new Set(names);
  const base = Array.isArray(stored) ? stored.filter((g) => set.has(g)) : [];
  const missing = names.filter((g) => !base.includes(g));
  return [...base, ...missing];
};

const LS_SUB_ORDER_PREFIX = "hc_sub_order:";
const getSubOrderKey = (groupName) =>
  `${LS_SUB_ORDER_PREFIX}${slug(groupName)}`;
const normalizeSubOrder = (stored, subNames) => {
  const set = new Set(subNames);
  const base = Array.isArray(stored) ? stored.filter((s) => set.has(s)) : [];
  const missing = subNames.filter((s) => !base.includes(s));
  return [...base, ...missing];
};

const formatDateShort = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yy = String(dateObj.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

const renderLastUpdatedOneLine = (dateStr, small = false) => {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffHours = (now - dateObj) / (1000 * 60 * 60);
  const display = `${formatDateShort(dateObj)} ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const textColor = diffHours > 24 ? "text-danger" : "text-muted";
  const fontSize = small ? "0.75rem" : "0.85rem";
  return (
    <span className={textColor} style={{ fontSize }}>
      {display}
    </span>
  );
};

// ====== HELPER: Running-state NOK chart (tránh răng cưa do schedule không đều) ======
// Thay vì đếm events xảy ra trong từng phút (gây trồi sụt khi platforms có chu kỳ khác nhau),
// hàm này duy trì trạng thái mới nhất của từng thiết bị và đếm "đang NOK" tại mỗi phút.
const buildMinuteSeries = (
  items,
  platformList,
  excludedHostsSet,
  hours = 24,
) => {
  const safePlatforms = Array.isArray(platformList) ? platformList : [];

  const now = new Date();
  now.setHours(now.getHours() + 2); // Bù giờ server

  const totalMinutes = hours * 60;

  const points = [];
  for (let i = totalMinutes - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 1000);
    d.setSeconds(0, 0);
    points.push(d);
  }

  const windowStart = points[0];

  const key = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}`;

  // Sắp xếp items theo thời gian tăng dần để duyệt một lần (O(n log n))
  const validItems = (items || [])
    .filter((it) => it?.starttime && it?.host)
    .map((it) => ({ ...it, _t: new Date(it.starttime) }))
    .filter((it) => !isNaN(it._t.getTime()))
    .sort((a, b) => a._t - b._t);

  // Running state: hostKey → thông tin thiết bị tại trạng thái mới nhất đã biết
  const deviceState = new Map();
  let itemIdx = 0;

  const applyItem = (it) => {
    const hostKey = (it.host || "").trim().toLowerCase();
    deviceState.set(hostKey, {
      host: it.host,
      platform: (it.platform || "").trim(),
      status: it.status,
      excludedFlag: it.excluded === true,
      notes:
        it.notes ||
        it.note ||
        it.message ||
        it.description ||
        it.reason ||
        "Không có thông tin lỗi",
      result_file: it.result_file || "",
    });
  };

  // Khởi tạo state từ items TRƯỚC cửa sổ hiển thị (thiết bị NOK từ trước vẫn được tính)
  while (itemIdx < validItems.length && validItems[itemIdx]._t < windowStart) {
    applyItem(validItems[itemIdx]);
    itemIdx++;
  }

  return points.map((d) => {
    const minuteEnd = new Date(d.getTime() + 60000);

    // Áp dụng tất cả kết quả healthcheck xảy ra trong phút này
    while (itemIdx < validItems.length && validItems[itemIdx]._t < minuteEnd) {
      applyItem(validItems[itemIdx]);
      itemIdx++;
    }

    // Đếm NOK từ trạng thái hiện tại của tất cả thiết bị đã biết
    let totalNok = 0;
    const platformNok = {};
    safePlatforms.forEach((p) => { platformNok[p] = 0; });
    const errorDetails = [];

    deviceState.forEach((device, hostKey) => {
      const isExcluded =
        device.excludedFlag || (excludedHostsSet && excludedHostsSet.has(hostKey));
      if (isExcluded) return;
      if (device.status !== "NOK" && device.status !== "Error") return;

      totalNok++;
      if (Object.prototype.hasOwnProperty.call(platformNok, device.platform)) {
        platformNok[device.platform]++;
      }
      errorDetails.push({
        host: device.host,
        platform: device.platform,
        status: device.status,
        notes: device.notes,
        result_file: device.result_file,
      });
    });

    const row = {
      time: key(d).slice(11, 16),
      Total: totalNok > 0 ? totalNok : null,
      errorDetails,
    };

    safePlatforms.forEach((p) => {
      row[p] = platformNok[p] > 0 ? platformNok[p] : null;
    });

    return row;
  });
};

// ====== COMPONENT: BIỂU ĐỒ ======
const GroupNokChart = ({
  platformList = [],
  storeKey,
  height = 130, // Chiều cao mặc định ban đầu từ prop
  title,
  excludedHostsSet,
  onExpand,
}) => {
  const dispatch = useDispatch();
  const [hiddenKeys, setHiddenKeys] = useState(new Set());

  // Quản lý khoảng thời gian xem biểu đồ (Mặc định 24h)
  const [timeRange, setTimeRange] = useState(24);

  // Quản lý co giãn trục Y (Bắt đầu từ 0 hoặc Tự động cắt đáy)
  const [yAxisScale, setYAxisScale] = useState("zero");

  // Quản lý kích thước (chiều cao vật lý) của biểu đồ
  const [chartHeight, setChartHeight] = useState(height);

  // 🔥 STATE MỚI: Quản lý dữ liệu khi click vào biểu đồ để hiện Popup
  const [clickedPoint, setClickedPoint] = useState(null);

  // Đồng bộ lại chiều cao nếu component cha truyền prop mới (VD: Mở Modal)
  useEffect(() => {
    setChartHeight(height);
  }, [height]);

  const byKeyItems = useSelector((s) => s.pscore?.hourlyByKey?.[storeKey]);
  const byKeyLoading = useSelector(
    (s) => s.pscore?.hourlyLoadingByKey?.[storeKey],
  );
  const byPlatform = useSelector((s) => s.pscore?.hourlyByPlatform || {});

  const safePlatformList = useMemo(
    () => (Array.isArray(platformList) ? platformList : []),
    [platformList],
  );

  const items = useMemo(() => {
    const out = [];
    safePlatformList.forEach((p) => {
      const arr = byPlatform[p] || [];
      if (arr.length) out.push(...arr);
    });
    if (byKeyItems?.length) out.push(...byKeyItems);
    return out;
  }, [safePlatformList, byPlatform, byKeyItems]);

  const chartData = useMemo(
    () =>
      buildMinuteSeries(items, safePlatformList, excludedHostsSet, timeRange),
    [items, safePlatformList, excludedHostsSet, timeRange],
  );

  const platformKey = useMemo(
    () => JSON.stringify(safePlatformList.slice().sort()),
    [safePlatformList],
  );

  useEffect(() => {
    if (!safePlatformList.length || !storeKey) return;
    dispatch(
      fetchPSCoreStatus({
        platform: safePlatformList,
        page: 1,
        page_size: 2000,
        hours: 24,
        option: "",
        storeKey,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, platformKey, storeKey]);

  const loading = !!byKeyLoading;

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  // 🔥 1. Hàm xử lý logic khi click trúng chấm tròn
  const handleDotClick = (dataKey, payload, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (!payload || !payload.errorDetails) return;

    let filteredDetails = payload.errorDetails;

    // Lọc thiết bị theo đúng tên đường vừa click (Nếu không phải đường Total)
    if (dataKey !== "Total") {
      filteredDetails = filteredDetails.filter(
        (item) => (item.platform || "").toString().trim() === dataKey,
      );
    }

    if (filteredDetails.length > 0) {
      setClickedPoint({
        time: payload.time,
        lineName: dataKey, // Lưu tên đường để hiện lên Header Modal
        details: filteredDetails,
      });
    }
  };

  // 🔥 2. Hàm TỰ VẼ chấm tròn để ép trình duyệt nhận sự kiện Click
  const renderCustomActiveDot = (props, dataKey) => {
    const { cx, cy, stroke, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6} // Kích thước chấm sáng to một chút để dễ click
        fill={stroke}
        stroke="#fff"
        strokeWidth={2}
        style={{ cursor: "pointer", pointerEvents: "all" }} // 👈 XUYÊN THỦNG TOOLTIP LÀ NHỜ DÒNG NÀY
        onClick={(e) => handleDotClick(dataKey, payload, e)}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const visiblePayload = payload.filter((p) => !hiddenKeys.has(p.dataKey));
    if (visiblePayload.length === 0) return null;
    const hasError = visiblePayload.some((p) => p.value > 0);
    if (!hasError) return null;

    return (
      <div
        className="p-2 bg-white border rounded shadow-sm"
        style={{ fontSize: "0.75rem", minWidth: "120px", zIndex: 1000 }}
      >
        <div className="fw-bold mb-1 border-bottom pb-1">{label}</div>
        {visiblePayload.map((entry) => {
          if (entry.name !== "Total" && entry.value === 0) return null;
          return (
            <div
              key={entry.name}
              style={{
                color: entry.color,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{entry.name}:</span>
              <span className="fw-bold ms-2">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const tickInterval = timeRange === 3 ? 29 : timeRange === 6 ? 59 : 119;

  return (
    <div className="mb-0 w-100">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted fw-bold" style={{ fontSize: "0.75rem" }}>
          {title || ""}
        </small>

        {/* THANH CÔNG CỤ TỔNG HỢP */}
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          {loading && (
            <Spinner
              animation="border"
              size="sm"
              variant="primary"
              style={{ width: "0.8rem", height: "0.8rem" }}
            />
          )}

          {/* NHÓM NÚT [+] VÀ [-] ĐỂ THAY ĐỔI CHIỀU CAO BIỂU ĐỒ */}
          <div className="btn-group shadow-sm" role="group">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-0 px-2 fw-bold"
              style={{ fontSize: "0.75rem" }}
              title="Giảm chiều cao biểu đồ"
              onClick={(e) => {
                e.stopPropagation();
                setChartHeight((prev) => Math.max(100, prev - 40));
              }}
            >
              -
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-0 px-2 fw-bold"
              style={{ fontSize: "0.75rem" }}
              title="Tăng chiều cao biểu đồ"
              onClick={(e) => {
                e.stopPropagation();
                setChartHeight((prev) => prev + 40);
              }}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={`btn btn-sm py-0 px-2 ${
              yAxisScale === "auto"
                ? "btn-info text-white fw-bold"
                : "btn-outline-secondary"
            }`}
            style={{ fontSize: "0.65rem" }}
            title={
              yAxisScale === "auto"
                ? "Trục Y đang tự động co giãn"
                : "Trục Y bắt đầu từ 0"
            }
            onClick={(e) => {
              e.stopPropagation();
              setYAxisScale(yAxisScale === "auto" ? "zero" : "auto");
            }}
          >
            ↕ Y-Zoom
          </button>

          <div className="btn-group shadow-sm" role="group">
            {[3, 6, 12, 24].map((hr) => (
              <button
                key={hr}
                type="button"
                className={`btn btn-sm py-0 px-2 ${
                  timeRange === hr
                    ? "btn-primary fw-bold"
                    : "btn-outline-secondary"
                }`}
                style={{ fontSize: "0.65rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeRange(hr);
                }}
              >
                {hr}h
              </button>
            ))}
          </div>

          {onExpand && (
            <button
              type="button"
              className="btn btn-sm btn-light border py-0 px-1 text-secondary"
              title="Phóng to biểu đồ"
              style={{ lineHeight: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: chartHeight,
          transition: "height 0.2s ease-in-out",
        }}
      >
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              bottom: chartHeight > 150 ? 5 : 0,
              left: -25,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9 }}
              interval={tickInterval}
              minTickGap={15}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 9 }}
              domain={yAxisScale === "auto" ? ["dataMin", "auto"] : [0, "auto"]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={6}
              height={20}
              onClick={handleLegendClick}
              wrapperStyle={{
                fontSize: "8px",
                paddingTop: "0px",
                cursor: "pointer",
                userSelect: "none",
              }}
              formatter={(value, entry) => (
                <span
                  style={{
                    color: hiddenKeys.has(entry.dataKey) ? "#ccc" : "#333",
                    textDecoration: hiddenKeys.has(entry.dataKey)
                      ? "line-through"
                      : "none",
                    fontSize: "8px",
                    fontWeight: "600",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="#dc3545"
              strokeWidth={2}
              dot={false}
              activeDot={(props) => renderCustomActiveDot(props, "Total")}
              name="Total"
              connectNulls
              isAnimationActive={false}
              hide={hiddenKeys.has("Total")}
            />
            {safePlatformList.map((p, idx) => (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                // 👇 SỬA DÒNG NÀY: Truyền tên của platform (p) vào hàm vẽ
                activeDot={(props) => renderCustomActiveDot(props, p)}
                name={p}
                connectNulls
                isAnimationActive={false}
                hide={hiddenKeys.has(p)}
              />
            ))}

            {chartHeight > 150 && (
              <Brush
                dataKey="time"
                height={15}
                stroke="#0d6efd"
                fill="#f8f9fa"
                tickFormatter={() => ""}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 MODAL: HIỂN THỊ TRUY VẤN LỖI CHI TIẾT (ĐỒNG BỘ 100% GIAO DIỆN) */}
      {clickedPoint && (
        <Modal
          show={!!clickedPoint}
          onHide={() => setClickedPoint(null)}
          centered
          dialogClassName={styles.modalWide}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Chi tiết sự cố{" "}
              {clickedPoint.lineName === "Total"
                ? "(Tất cả)"
                : `(${clickedPoint.lineName})`}{" "}
              lúc {clickedPoint.time}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Sử dụng đúng các prop và class giống hệt HealthcheckTable */}
            <Table
              responsive
              hover
              bordered
              className="table-sm mb-0"
              style={{ fontSize: "0.75rem" }}
            >
              <thead className="table-light sticky-top">
                <tr>
                  <th>Host</th>
                  <th>Platform</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  {/* 👇 THÊM CỘT TIÊU ĐỀ FILE */}
                  <th>File kết quả</th>
                </tr>
              </thead>
              <tbody>
                {clickedPoint.details.map((item, idx) => {
                  // Nếu trong component của bạn đã có sẵn biến statusRowClass,
                  // bạn có thể đổi thành: className={statusRowClass[item.status] || ""}
                  const isNok =
                    item.status === "NOK" || item.status === "Error";
                  const rowClass = isNok ? "table-danger" : "";

                  return (
                    <tr key={idx} className={rowClass}>
                      <td>{item.host}</td>
                      <td>{item.platform}</td>
                      <td>{item.status}</td>
                      <td style={{ whiteSpace: "pre-line" }}>{item.notes}</td>
                      {/* 👇 THÊM CỘT HIỂN THỊ LINK DOWNLOAD GIỐNG COMPONENT CỦA BẠN */}
                      <td>
                        {item.result_file ? (
                          <a
                            href={`${SERVER_MEDIA}/download${item.result_file}`}
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
            {clickedPoint.details.length === 0 && (
              <div className="text-center text-muted mt-2">
                Không có dữ liệu thiết bị NOK.
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setClickedPoint(null)}
            >
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

// ====== COMPONENT CON: Thẻ Subsystem (Tối ưu Re-render & Flash) ======
const SubsystemChip = React.memo(
  ({
    subsystemLabel,
    groupName,
    childData,
    updatedTimestamp,
    onSubDragStart,
    onSubDragEnd,
    onSubDragOver,
    onSubDrop,
    handleSubsystemClick,
    openSubsystemDetailInNewTab,
    subsFromSchema,
  }) => {
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
      if (!updatedTimestamp) return;
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }, [updatedTimestamp]);

    const rawStatus = childData.status || "Unknown";
    const statusKey = rawStatus.toLowerCase();

    const isNok = statusKey === "error" || statusKey === "nok";
    const isWarning = statusKey === "warning";
    const isNormal = statusKey === "normal" || statusKey === "ok";

    // 🔥 KIỂM TRA XEM CÓ SCHEDULE KHÔNG (Dựa vào total_devices)
    const hasSchedule = (childData.total_devices || 0) > 0;

    let bgColor = "#f8f9fa",
      borderColor = "#dee2e6",
      textColor = "#6c757d",
      dotColor = "#6c757d";

    // 👇 NẾU KHÔNG CÓ SCHEDULE, ÉP THÀNH MÀU XÁM MỜ HOÀN TOÀN
    if (!hasSchedule) {
      bgColor = "#f8f9fa";
      borderColor = "#e9ecef";
      textColor = "#adb5bd"; // Chữ xám mờ
      dotColor = "#ced4da"; // Chấm xám mờ
    } else if (isNok) {
      bgColor = "#fee2e2";
      borderColor = "#dc3545";
      textColor = "#b02a37";
      dotColor = "#dc3545";
    } else if (isWarning) {
      bgColor = "#fff7e6";
      borderColor = "#ffca2c";
      textColor = "#997404";
      dotColor = "#ffca2c";
    } else if (isNormal) {
      bgColor = "#f0fff4";
      borderColor = "#d1e7dd";
      textColor = "#0f5132";
      dotColor = "#198754";
    }

    const flashStyle = isFlashing
      ? {
          boxShadow: `0 0 8px ${borderColor}`,
          transform: "scale(1.02)",
          fontWeight: "bold",
          filter: "brightness(0.95)",
        }
      : {};

    return (
      <div
        className="d-flex align-items-center border rounded px-1 shadow-sm"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: textColor,
          cursor: "pointer",
          fontSize: "0.75rem",
          transition: "all 0.3s ease",
          borderWidth: "1px",
          // 👇 GIẢM ĐỘ ĐỤC XUỐNG CÒN 60% NẾU KHÔNG CÓ LỊCH TRÌNH
          opacity: hasSchedule ? 1 : 0.6,
          ...flashStyle,
        }}
        draggable
        onDragStart={(e) => onSubDragStart(groupName, subsystemLabel, e)}
        onDragEnd={onSubDragEnd}
        onDragOver={(e) => onSubDragOver(groupName, subsystemLabel, e)}
        onDrop={(e) => onSubDrop(groupName, subsystemLabel, e)}
        onClick={() =>
          handleSubsystemClick(
            groupName,
            subsystemLabel,
            subsFromSchema[subsystemLabel] || [],
          )
        }
        title={`Status: ${rawStatus} | OK: ${childData.ok_count || 0} | NOK: ${childData.nok_count || 0} | Exc: ${childData.excluded_count || 0}`}
      >
        <span
          className="me-1"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: isFlashing ? "transparent" : dotColor,
            border: isFlashing ? `2px solid ${dotColor}` : "none",
            display: "inline-block",
          }}
        ></span>
        <span className="fw-semibold">{subsystemLabel}</span>

        {childData.nok_count > 0 && (
          <span
            className="badge ms-1 py-0 px-1"
            style={{
              fontSize: "0.65em",
              backgroundColor: "#dc3545",
              color: "white",
            }}
          >
            {childData.nok_count}
          </span>
        )}

        <span
          role="button"
          className="ms-2 ps-1 border-start border-secondary opacity-50 hover-opacity-100"
          title="Open Subsystem in New Tab"
          onClick={(e) => {
            e.stopPropagation();
            openSubsystemDetailInNewTab(groupName, subsystemLabel);
          }}
          style={{ lineHeight: 0, cursor: "pointer" }}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
        </span>
      </div>
    );
  },
);

// ====== COMPONENT CHÍNH ======
const SystemHealth = () => {
  useScheduleWebSocket();
  const dispatch = useDispatch();
  const location = useLocation();
  const { group: groupParam, subsystem: subParam } = useParams();

  const systemStatus = useSelector(selectSystemStatus);
  const loading = useSelector(selectLoading);
  const platformSchema = useSelector(selectPlatformSchema);
  const recentlyUpdated = useSelector(selectRecentlyUpdated);
  const systemLastUpdated = useSelector(selectSystemLastUpdated);

  const scheduledTasks = useSelector((s) => s.pscore?.scheduledTasks || []);
  // Dòng cũ:
  // const latestItems = useSelector((s) => s.pscore?.lastestitems || []);

  // Dòng mới:
  const latestItems = useSelector((s) => s.pscore?.globalLatestItems || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);
  const [hiddenGroups, setHiddenGroups] = useState(() => new Set());
  const [hiddenSubsMap, setHiddenSubsMap] = useState({});
  const [groupOrder, setGroupOrder] = useState([]);
  const [draggingGroup, setDraggingGroup] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [subOrderMap, setSubOrderMap] = useState({});
  const [draggingSub, setDraggingSub] = useState(null);
  const [dragOverSub, setDragOverSub] = useState(null);

  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
    dispatch(fetchSystemStatus());
    dispatch(fetchHealthcheckSchedules());
    dispatch(
      fetchLatestHealthcheckView({
        page_size: 5000,
        option: "latest-per-host",
      }),
    );
  }, [dispatch]);

  // 🔥 THÊM USE-EFFECT NÀY VÀO BẤT KỲ ĐÂU BÊN TRONG COMPONENT
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Nếu có tab nào đó thay đổi biến 'cross_tab_sync_exclude'
      if (e.key === "cross_tab_sync_exclude" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data && data.host) {
            // Cập nhật Redux của Tab Này ngay lập tức!
            dispatch(
              syncDeviceExcluded({ host: data.host, excluded: data.excluded }),
            );
          }
        } catch (err) {
          console.error("Lỗi đồng bộ tab:", err);
        }
      }
    };

    // Đăng ký lắng nghe sự kiện Storage của trình duyệt
    window.addEventListener("storage", handleStorageChange);

    // Dọn dẹp khi đóng tab
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);

  // Tạo tập hợp Excluded Hosts để truyền cho Chart (Ép viết thường để đồng bộ)
  const excludedHostsSet = useMemo(() => {
    const set = new Set();
    (latestItems || []).forEach((it) => {
      if (it.excluded && it.host) {
        set.add(it.host.trim().toLowerCase());
      }
    });
    return set;
  }, [latestItems]);

  // 🔥 4. MEMO CALCULATIONS (ĐÃ FIX: LẤY SCHEDULE LÀM GỐC)
  const calculatedSystemStatus = useMemo(() => {
    const safeTasks = Array.isArray(scheduledTasks) ? scheduledTasks : [];
    const safeItems = Array.isArray(latestItems) ? latestItems : [];

    // Trả về dữ liệu gốc nếu chưa load xong
    if (!systemStatus || Object.keys(systemStatus).length === 0) {
      return systemStatus || {};
    }

    const newStatus = JSON.parse(JSON.stringify(systemStatus));

    // A. Reset các biến đếm an toàn
    Object.keys(newStatus).forEach((gName) => {
      if (!newStatus[gName] || typeof newStatus[gName] !== "object") return;

      newStatus[gName]._original_status = newStatus[gName].status; // Lưu lại phòng hờ
      newStatus[gName].ok_count = 0;
      newStatus[gName].nok_count = 0;
      newStatus[gName].excluded_count = 0;
      newStatus[gName].total_devices = 0;

      if (
        newStatus[gName].children &&
        typeof newStatus[gName].children === "object"
      ) {
        Object.keys(newStatus[gName].children).forEach((sName) => {
          const sub = newStatus[gName].children[sName];
          if (!sub || typeof sub !== "object") return;

          sub._original_status = sub.status;
          sub.ok_count = 0;
          sub.nok_count = 0;
          sub.excluded_count = 0;
          sub.total_devices = 0;
          sub.status = "Unknown"; // Tạm để Unknown
        });
      }
    });

    // B. Tạo TỪ ĐIỂN kết quả Healthcheck để tra cứu siêu tốc O(1)
    const itemsMap = {};
    safeItems.forEach((item) => {
      if (item && item.host) {
        // Lowercase để chống lỗi do hoa/thường (VD: SBCO1A vs sbco1a)
        itemsMap[item.host.trim().toLowerCase()] = item;
      }
    });

    // C. Dịch ngược Schema: cs_mss -> CS Core / MSS
    const reverseMap = {};
    if (platformSchema) {
      Object.keys(platformSchema).forEach((gName) => {
        const subs = platformSchema[gName];
        if (subs) {
          Object.keys(subs).forEach((sName) => {
            const plats = subs[sName];
            if (Array.isArray(plats)) {
              plats.forEach((p) => {
                reverseMap[p.trim().toLowerCase()] = {
                  group: gName,
                  sub: sName,
                };
              });
            }
          });
        }
      });
    }

    // D. QUÉT QUA SCHEDULE (LẤY LỊCH LÀM GỐC CHUẨN)
    safeTasks.forEach((task) => {
      if (!task.enabled || !Array.isArray(task.node_names) || !task.platform)
        return;

      const platformKey = task.platform.trim().toLowerCase();
      let mapping = reverseMap[platformKey];

      // Fallback: Tìm trực tiếp trong newStatus nếu Schema chưa map
      if (!mapping) {
        for (const gKey of Object.keys(newStatus)) {
          if (
            newStatus[gKey]?.children &&
            typeof newStatus[gKey].children === "object"
          ) {
            const foundSub = Object.keys(newStatus[gKey].children).find(
              (k) => k.toLowerCase() === platformKey,
            );
            if (foundSub) {
              mapping = { group: gKey, sub: foundSub };
              break;
            }
          }
        }
      }

      // NẾU TÌM THẤY CHỖ ĐỂ ĐIỀN DỮ LIỆU
      if (mapping) {
        const groupObj = newStatus[mapping.group];
        const subObj = groupObj?.children?.[mapping.sub];

        if (
          groupObj &&
          typeof groupObj === "object" &&
          subObj &&
          typeof subObj === "object"
        ) {
          task.node_names.forEach((nodeName) => {
            if (!nodeName) return;

            // 1. CHẮC CHẮN CỘNG TOTAL DEVICES VÌ NÓ NẰM TRONG SCHEDULE
            subObj.total_devices += 1;
            groupObj.total_devices += 1;

            // 2. Tra cứu trong Từ điển Healthcheck xem kết quả là gì
            const hostKey = nodeName.trim().toLowerCase();
            const record = itemsMap[hostKey];

            if (record) {
              if (record.excluded === true) {
                subObj.excluded_count += 1;
                groupObj.excluded_count += 1;
              } else if (record.status === "OK" || record.status === "Normal") {
                subObj.ok_count += 1;
                groupObj.ok_count += 1;
              } else {
                // Các trạng thái NOK, Error, Warning, Timeout...
                subObj.nok_count += 1;
                groupObj.nok_count += 1;
              }
            }
            // (Nếu không có record -> Node này được lên lịch nhưng chưa chạy bao giờ -> Kệ, chỉ tính vào Total)
          });
        }
      }
    });

    // E. CẬP NHẬT LẠI TRẠNG THÁI (STATUS) SAU KHI CỘNG DỒN
    Object.keys(newStatus).forEach((gName) => {
      const g = newStatus[gName];
      if (!g || typeof g !== "object") return;

      // Tính cho Group
      if (g.total_devices > 0) {
        // Nếu có NOK -> Warning. Nếu ko có NOK, nhưng có OK/Exclude -> Normal. Cả 3 bằng 0 -> Unknown
        g.status =
          g.nok_count > 0
            ? "Warning"
            : g.ok_count > 0 || g.excluded_count > 0
              ? "Normal"
              : "Unknown";
      } else {
        // Không có thiết bị nào trong Schedule -> Trả về gốc
        g.status = g._original_status || "Unknown";
      }

      // Tính cho Subsystem
      if (g.children && typeof g.children === "object") {
        Object.keys(g.children).forEach((sName) => {
          const s = g.children[sName];
          if (s && typeof s === "object") {
            if (s.total_devices > 0) {
              s.status =
                s.nok_count > 0
                  ? "Error"
                  : s.ok_count > 0 || s.excluded_count > 0
                    ? "Normal"
                    : "Unknown";
            } else {
              s.status = s._original_status || "Unknown";
            }
          }
        });
      }
    });

    return newStatus;
  }, [scheduledTasks, latestItems, systemStatus, platformSchema]);

  const displayData = calculatedSystemStatus;

  const groupNames = useMemo(() => {
    const ks = Object.keys(platformSchema || {});
    if (ks.length) return ks;
    return Object.keys(systemStatus || {});
  }, [platformSchema, systemStatus]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ORDER_KEY);
      const stored = raw ? JSON.parse(raw) : [];
      const normalized = normalizeOrder(stored, groupNames);
      setGroupOrder(normalized);
      localStorage.setItem(LS_ORDER_KEY, JSON.stringify(normalized));
    } catch {
      setGroupOrder(groupNames);
    }
  }, [groupNames]);

  useEffect(() => {
    try {
      if (groupOrder?.length)
        localStorage.setItem(LS_ORDER_KEY, JSON.stringify(groupOrder));
    } catch {}
  }, [groupOrder]);

  const groupSubNamesMap = useMemo(() => {
    const out = {};
    for (const groupName of groupNames) {
      const subsFromSchema = platformSchema[groupName] || {};
      const groupChildren = (systemStatus[groupName] || {}).children || {};
      const subs =
        Object.keys(subsFromSchema).length > 0
          ? Object.keys(subsFromSchema)
          : Object.keys(groupChildren);
      out[groupName] = subs;
    }
    return out;
  }, [groupNames, platformSchema, systemStatus]);

  useEffect(() => {
    try {
      const next = {};
      for (const [groupName, subs] of Object.entries(groupSubNamesMap)) {
        const key = getSubOrderKey(groupName);
        const raw = localStorage.getItem(key);
        const stored = raw ? JSON.parse(raw) : [];
        next[groupName] = normalizeSubOrder(stored, subs);
        localStorage.setItem(key, JSON.stringify(next[groupName]));
      }
      setSubOrderMap(next);
    } catch {}
  }, [groupSubNamesMap]);

  const groupPlatformsMap = useMemo(() => {
    const map = {};
    Object.entries(platformSchema || {}).forEach(([groupName, subsystems]) => {
      const set = new Set();
      Object.values(subsystems || {}).forEach((arr) => {
        if (Array.isArray(arr)) arr.forEach((p) => p && set.add(p));
      });
      map[groupName] = Array.from(set).sort();
    });
    return map;
  }, [platformSchema]);

  const handleSubsystemClick = (group, subsystem, platforms) => {
    setSelectedSubsystem({ group, subsystem, platform: platforms || [] });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    dispatch(fetchSystemStatus());
  };

  const soloGroup = useMemo(() => {
    const fromParam = groupParam ? decodeURIComponent(groupParam) : null;
    const fromQuery = new URLSearchParams(location.search).get("group");
    return fromParam || fromQuery || null;
  }, [groupParam, location.search]);

  const soloSubsystem = useMemo(() => {
    const fromParam = subParam ? decodeURIComponent(subParam) : null;
    const fromQuery = new URLSearchParams(location.search).get("subsystem");
    return fromParam || fromQuery || null;
  }, [subParam, location.search]);

  const visibleGroupNames = useMemo(() => {
    const base =
      soloGroup && groupNames.includes(soloGroup) ? [soloGroup] : groupNames;
    return base.filter((g) => !hiddenGroups.has(g));
  }, [groupNames, soloGroup, hiddenGroups]);

  const orderedVisibleGroups = useMemo(() => {
    const set = new Set(visibleGroupNames);
    const ordered = groupOrder.filter((g) => set.has(g));
    const missing = visibleGroupNames.filter((g) => !ordered.includes(g));
    return [...ordered, ...missing];
  }, [groupOrder, visibleGroupNames]);

  const openGroupInNewTab = (groupName) => {
    const encoded = encodeURIComponent(groupName);
    const targetPath = `/healthcheck/${encoded}`;
    const origin = window.location.origin;
    const basePath = window.location.pathname.replace(/\/$/, "");
    const isHashRouter = (window.location.hash || "").startsWith("#/");
    const absoluteUrl = isHashRouter
      ? `${origin}${basePath}#${targetPath}`
      : `${origin}${targetPath}`;
    window.open(absoluteUrl, "_blank", "noopener,noreferrer");
  };

  const openSubsystemDetailInNewTab = (groupName, subsystemLabel) => {
    const g = encodeURIComponent(groupName);
    const s = encodeURIComponent(subsystemLabel);
    const targetPath = `/healthcheck/${g}/${s}?detail=1`;
    const origin = window.location.origin;
    const basePath = window.location.pathname.replace(/\/$/, "");
    const isHashRouter = (window.location.hash || "").startsWith("#/");
    const absoluteUrl = isHashRouter
      ? `${origin}${basePath}#${targetPath}`
      : `${origin}${targetPath}`;
    window.open(absoluteUrl, "_blank", "noopener,noreferrer");
  };

  const refreshGroup = (groupName) => {
    dispatch(fetchSystemStatusByGroup(groupName));
    const platforms = groupPlatformsMap[groupName] || [];
    if (platforms.length) {
      dispatch(
        fetchPSCoreStatus({
          platform: platforms,
          page: 1,
          page_size: 1000,
          hours: 24,
          option: "",
          storeKey: `hourly_${slug(groupName)}_group`,
        }),
      );
    }
  };

  const hideGroup = (groupName) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      next.add(groupName);
      return next;
    });
  };

  const hideSubsystem = (groupName, subsystem) => {
    setHiddenSubsMap((prev) => {
      const next = { ...prev };
      const set = new Set(next[groupName] || []);
      set.add(subsystem);
      next[groupName] = set;
      return next;
    });
  };

  const onDragStart = (group, e) => {
    setDraggingGroup(group);
    try {
      e.dataTransfer.setData("text/plain", group);
      e.dataTransfer.effectAllowed = "move";
    } catch {}
  };
  const onDragOver = (target, e) => {
    e.preventDefault();
    if (target !== draggingGroup) setDragOverGroup(target);
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {}
  };
  const onDrop = (target, e) => {
    e.preventDefault();
    const source =
      (e.dataTransfer && e.dataTransfer.getData("text/plain")) || draggingGroup;
    if (!source || source === target) {
      setDragOverGroup(null);
      setDraggingGroup(null);
      return;
    }
    setGroupOrder((prev) => {
      const next = prev.filter((g) => g !== source);
      const idx = next.indexOf(target);
      if (idx === -1) next.push(source);
      else next.splice(idx, 0, source);
      return next;
    });
    setDragOverGroup(null);
    setDraggingGroup(null);
  };
  const onDragEnd = () => {
    setDragOverGroup(null);
    setDraggingGroup(null);
  };

  const onSubDragStart = (group, sub, e) => {
    setDraggingSub({ group, sub });
    try {
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", JSON.stringify({ group, sub }));
      e.dataTransfer.effectAllowed = "move";
    } catch {}
  };
  const onSubDragOver = (group, targetSub, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      draggingSub &&
      draggingSub.group === group &&
      draggingSub.sub !== targetSub
    ) {
      setDragOverSub({ group, sub: targetSub });
    }
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {}
  };
  const onSubDrop = (group, targetSub, e) => {
    e.preventDefault();
    e.stopPropagation();
    let payload = draggingSub;
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.group && data?.sub) payload = data;
      }
    } catch {}
    if (!payload || payload.group !== group || payload.sub === targetSub) {
      setDragOverSub(null);
      setDraggingSub(null);
      return;
    }
    setSubOrderMap((prev) => {
      const base = prev[group] || groupSubNamesMap[group] || [];
      const next = base.filter((s) => s !== payload.sub);
      const idx = next.indexOf(targetSub);
      if (idx === -1) next.push(payload.sub);
      else next.splice(idx, 0, payload.sub);
      try {
        localStorage.setItem(getSubOrderKey(group), JSON.stringify(next));
      } catch {}
      return { ...prev, [group]: next };
    });
    setDragOverSub(null);
    setDraggingSub(null);
  };
  const onSubDragEnd = (e) => {
    e?.stopPropagation?.();
    setDragOverSub(null);
    setDraggingSub(null);
  };

  const isSubDetail = useMemo(() => {
    const qp = new URLSearchParams(location.search);
    return !!(soloGroup && soloSubsystem && qp.get("detail") === "1");
  }, [soloGroup, soloSubsystem, location.search]);

  const detailPlatforms = useMemo(() => {
    return platformSchema?.[soloGroup]?.[soloSubsystem] || [];
  }, [platformSchema, soloGroup, soloSubsystem]);

  // RENDER DETAIL TAB
  if (isSubDetail) {
    return (
      <>
        <TopNavbarHealth />
        <WebSocketStatusBanner />
        <Alert />

        <div className={styles.container}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 fw-bold fs-4">
              {soloGroup} / {soloSubsystem}
            </h5>
            {systemLastUpdated && (
              <div className="text-end" style={{ fontSize: "0.9rem" }}>
                Last updated: {renderLastUpdatedOneLine(systemLastUpdated)}
              </div>
            )}
          </div>

          {detailPlatforms.length > 0 && (
            <GroupNokChart
              platformList={detailPlatforms}
              storeKey={`hourly_${slug(soloGroup)}_${slug(soloSubsystem)}_detail`}
              height={220}
              title={`NOK theo giờ (24h): ${soloGroup} / ${soloSubsystem}`}
              excludedHostsSet={excludedHostsSet} // Truyền cờ exclude
            />
          )}

          <HealthcheckTable
            group={soloGroup}
            subsystem={soloSubsystem}
            platformList={detailPlatforms}
            hideChart
          />
        </div>
      </>
    );
  }

  // RENDER DASHBOARD
  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />

      <div className={styles.container}>
        <Row>
          <Col md={12}>
            {systemLastUpdated && (
              <div className="text-end mb-2" style={{ fontSize: "0.9rem" }}>
                Last updated: {renderLastUpdatedOneLine(systemLastUpdated)}
              </div>
            )}

            {!loading && orderedVisibleGroups.length === 0 && (
              <Card className="mb-3">
                <Card.Body className="text-muted">
                  Không có dữ liệu hiển thị. Kiểm tra API
                  <code> /systemhealth/schema/</code> và{" "}
                  <code>/systemhealth/</code>.
                </Card.Body>
              </Card>
            )}

            <Row>
              {orderedVisibleGroups.map((groupName) => {
                const groupData = displayData[groupName] || {};
                const groupStatus = groupData.status || "Unknown";
                const groupChildren = groupData.children || {};

                // 🔥 KIỂM TRA GROUP CÓ SCHEDULE KHÔNG
                const hasSchedule = (groupData.total_devices || 0) > 0;

                // 👇 Gỡ bỏ viền màu đặc trưng của Group nếu không có lịch trình
                const cardClass = hasSchedule
                  ? cardClassMapping[groupName] || ""
                  : "";

                // CÁC BIẾN NÀY BẮT BUỘC PHẢI GIỮ LẠI ĐỂ KHÔNG BỊ CRASH
                const subsFromSchema = platformSchema[groupName] || {};
                const subsystems =
                  Object.keys(subsFromSchema).length > 0
                    ? subsFromSchema
                    : groupChildren;
                const groupPlatforms = groupPlatformsMap[groupName] || [];

                const rawSubNames = Object.keys(subsystems);
                const hiddenSet = hiddenSubsMap[groupName] || new Set();
                const subNamesVisible = rawSubNames.filter(
                  (s) =>
                    !hiddenSet.has(s) &&
                    (!(soloSubsystem && soloGroup === groupName) ||
                      s === soloSubsystem),
                );
                const subOrder = subOrderMap[groupName] || rawSubNames;
                const orderedSubs = (() => {
                  const set = new Set(subNamesVisible);
                  const base = subOrder.filter((s) => set.has(s));
                  const missing = subNamesVisible.filter(
                    (s) => !base.includes(s),
                  );
                  return [...base, ...missing];
                })();

                const highlightStyle =
                  dragOverGroup === groupName
                    ? { boxShadow: "inset 0 0 0 2px #0d6efd" }
                    : {};
                const gridProps = soloGroup
                  ? { md: 12, lg: 12, xl: 12 }
                  : { md: 12, lg: 6, xl: 6 };

                return (
                  <Col {...gridProps} key={groupName} className="mb-3">
                    <Card
                      className={`shadow-sm ${styles.cardCommon} ${cardClass}`}
                      style={{
                        ...highlightStyle,
                        border: "1px solid #dee2e6",
                        // 👇 ÉP ĐEN TRẮNG VÀ LÀM MỜ THẺ CARD NẾU KHÔNG CÓ SCHEDULE
                        filter: hasSchedule ? "none" : "grayscale(100%)",
                        opacity: hasSchedule ? 1 : 0.65,
                      }}
                      onDragOver={(e) => onDragOver(groupName, e)}
                      onDrop={(e) => onDrop(groupName, e)}
                      onDragEnter={(e) => onDragOver(groupName, e)}
                    >
                      <Card.Body className="p-2 d-flex flex-column h-100">
                        {/* HEADER */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2 overflow-hidden">
                            {!soloGroup && (
                              <span
                                role="button"
                                draggable
                                onDragStart={(e) => onDragStart(groupName, e)}
                                onDragEnd={onDragEnd}
                                className="text-muted cursor-grab"
                                style={{ fontSize: "1.1rem", lineHeight: 1 }}
                              >
                                ⠿
                              </span>
                            )}
                            <h6
                              className="mb-0 fw-bold text-truncate text-dark"
                              style={{ fontSize: "1rem" }}
                              title={`${groupName} (Status: ${groupStatus})`}
                            >
                              {groupName}
                            </h6>
                            {!loading && (
                              <span
                                className={`badge rounded-pill ${
                                  groupStatus === "Normal"
                                    ? "bg-success"
                                    : groupStatus === "Warning"
                                      ? "bg-warning text-dark"
                                      : groupStatus === "Error"
                                        ? "bg-danger"
                                        : "bg-secondary"
                                }`}
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: "normal",
                                }}
                              >
                                {groupStatus}
                              </span>
                            )}
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            {loading && (
                              <Spinner
                                animation="border"
                                size="sm"
                                style={{ width: "1rem", height: "1rem" }}
                                className="me-1"
                              />
                            )}
                            {/* 👇 BỔ SUNG NÚT HIDE (CHỈ HIỆN KHI KHÔNG PHẢI CHẾ ĐỘ SOLO GROUP) */}
                            {!soloGroup && (
                              <Button
                                size="sm"
                                variant="link"
                                className="p-0 text-muted me-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  hideGroup(groupName); // Gọi hàm ẩn Group
                                }}
                                title="Ẩn Group này"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                >
                                  {/* Icon con mắt bị gạch chéo (Eye-slash) */}
                                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                </svg>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 text-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                refreshGroup(groupName);
                              }}
                              title="Refresh"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="currentColor"
                              >
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                              </svg>
                            </Button>
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 text-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                openGroupInNewTab(groupName);
                              }}
                              title="Open Group Tab"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="currentColor"
                              >
                                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                              </svg>
                            </Button>
                          </div>
                        </div>

                        {/* === STATS BAR === */}
                        {!loading && (
                          <div
                            className="d-flex align-items-center gap-3 bg-light rounded px-2 py-1 mb-2 border"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {/* NOK */}
                            <span
                              className={
                                groupData.nok_count > 0
                                  ? "text-danger fw-bold"
                                  : "text-secondary"
                              }
                            >
                              NOK: {groupData.nok_count || 0}
                            </span>
                            {/* OK */}
                            <span
                              className={
                                groupData.ok_count > 0
                                  ? "text-success fw-bold"
                                  : "text-secondary"
                              }
                            >
                              OK: {groupData.ok_count || 0}
                            </span>
                            {/* 🔥 EXCLUDED */}
                            <span
                              className={
                                groupData.excluded_count > 0
                                  ? "text-warning fw-bold"
                                  : "text-secondary"
                              }
                              title="Thiết bị được bỏ qua cảnh báo"
                            >
                              Exc: {groupData.excluded_count || 0}
                            </span>
                            {/* TOTAL */}
                            <span className="text-dark fw-bold border-start border-2 ps-2">
                              Total: {groupData.total_devices || 0}
                            </span>

                            <span className="text-muted ms-auto">
                              Updated:{" "}
                              {groupData.last_updated
                                ? renderLastUpdatedOneLine(
                                    groupData.last_updated,
                                    true,
                                  )
                                : "--"}
                            </span>
                          </div>
                        )}

                        {/* === SUBSYSTEMS LIST (Chips) === */}
                        <div
                          className="flex-grow-1 mb-2"
                          style={{ maxHeight: "120px", overflowY: "auto" }}
                        >
                          {!loading && orderedSubs.length > 0 && (
                            <div className="d-flex flex-wrap gap-1">
                              {orderedSubs.map((subsystemLabel) => {
                                // 👇 Code mới chỉ ngắn gọn thế này thôi 👇
                                const childData =
                                  groupChildren[subsystemLabel] || {};
                                const ts =
                                  recentlyUpdated?.[groupName]?.[
                                    subsystemLabel
                                  ]; // Lấy timestamp để flash

                                return (
                                  <SubsystemChip
                                    key={subsystemLabel}
                                    subsystemLabel={subsystemLabel}
                                    groupName={groupName}
                                    childData={childData}
                                    updatedTimestamp={ts}
                                    onSubDragStart={onSubDragStart}
                                    onSubDragEnd={onSubDragEnd}
                                    onSubDragOver={onSubDragOver}
                                    onSubDrop={onSubDrop}
                                    handleSubsystemClick={handleSubsystemClick}
                                    openSubsystemDetailInNewTab={
                                      openSubsystemDetailInNewTab
                                    }
                                    subsFromSchema={subsFromSchema}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* CHART */}
                        <div className="mt-auto border-top pt-2">
                          {groupPlatforms.length > 0 && (
                            <GroupNokChart
                              platformList={groupPlatforms}
                              storeKey={`hourly_${slug(groupName)}_group`}
                              height={110}
                              title={null}
                              excludedHostsSet={excludedHostsSet} // Truyền cờ exclude xuống chart
                            />
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>

        {soloGroup && !isSubDetail && (
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="mb-0 fw-bold">KPI Explorer — {soloGroup}</h5>
              </div>
              <KPIExplorerCore
                hideChrome
                disableRealtime
                defaultGroup={soloGroup}
              />
            </Card.Body>
          </Card>
        )}

        {/* MODAL */}
        {modalVisible && selectedSubsystem && (
          <Modal
            show={modalVisible}
            onHide={handleCloseModal}
            centered
            dialogClassName={styles.modalWide}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedSubsystem.group} / {selectedSubsystem.subsystem}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
              {selectedSubsystem.platform?.length > 0 && (
                <GroupNokChart
                  platformList={selectedSubsystem.platform}
                  storeKey={`hourly_${slug(selectedSubsystem.group)}_${slug(selectedSubsystem.subsystem)}_modal`}
                  height={220}
                  title={`NOK trend (24h): ${selectedSubsystem.group} / ${selectedSubsystem.subsystem}`}
                  excludedHostsSet={excludedHostsSet}
                />
              )}
              <HealthcheckTable
                group={selectedSubsystem.group}
                subsystem={selectedSubsystem.subsystem}
                platformList={selectedSubsystem.platform || []}
                hideChart
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </>
  );
};

export default SystemHealth;
