// src/components/SNOC/views/dashboard/DashOrigin/SystemHealthDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import Alert from "../../../components/Alert/Alert";
import Clock from "../../../components/Clock";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchPlatformGroupSchema,
  fetchPSCoreStatus,
  fetchSystemStatus,
} from "../../../redux/Healthcheck/healthcheckSlice";
import snocStore from "../../../store/snocStore";
import HealthcheckTable from "../../tables/health/HealthcheckTable";
import styles from "./../../../styles/SystemHealth.module.scss";
import TopNavbarHealth from "./TopNavbarHealth";

// ✅ Recharts giống modal
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const NOK_BAR_COLOR = "#dc3545"; // bootstrap danger red

const statusColorClass = {
  Normal: "success",
  Warning: "warning",
  Error: "danger",
  Unknown: "secondary",
};

const statusIcon = {
  Normal: <span className={`${styles.dot} ${styles.successDot}`} />,
  Warning: <span className={`${styles.dot} ${styles.warningDot}`} />,
  Error: <span className={`${styles.dot} ${styles.dangerDot}`} />,
  Unknown: <span className={`${styles.dot} ${styles.secondaryDot}`} />,
};

const cardClassMapping = {
  "CS Core": styles.cardCsCore,
  "PS Core": styles.cardPsCore,
  Signal: styles.cardSignal,
  OCS: styles.cardOcs,
  "IMS Core": styles.cardIms,
  "UDC Core": styles.cardUdc,
};

const slug = (s = "") =>
  s.toString().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");

// ====== Build series NOK theo giờ (24h) ======
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

  (items || []).forEach((it) => {
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

// ====== Chart ngoài dashboard (theo group) ======
// ====== Chart ngoài dashboard (theo group) ======
const GroupNokChart = ({ platformList = [], storeKey, height = 160, title }) => {
  const dispatch = useDispatch();

  // Hỗ trợ cả 2 kiểu slice: map theo key (hourlyByKey) hoặc single (hourlyItems)
  const byKeyItems = useSelector((s) => s.pscore?.hourlyByKey?.[storeKey]);
  const byKeyLoading = useSelector((s) => s.pscore?.hourlyLoadingByKey?.[storeKey]);
  const singleItems = useSelector((s) => s.pscore?.hourlyItems);
  const singleLoading = useSelector((s) => s.pscore?.hourlyLoading);

  const items = byKeyItems ?? singleItems ?? [];
  const loading = (byKeyLoading ?? singleLoading) || false;

  // Khoá ổn định để tránh ref thay đổi (chống spam API)
  const platformKey = useMemo(() => {
    const set = new Set(platformList || []);
    return JSON.stringify(Array.from(set).sort());
  }, [platformList]);

  useEffect(() => {
    if (!platformList || platformList.length === 0 || !storeKey) return;
    dispatch(
      fetchPSCoreStatus({
        platform: platformList,
        page: 1,
        page_size: 1000,
        hours: 24,
        option: "",
        storeKey, // ưu tiên dạng map; nếu slice chưa map, fallback single vẫn chạy
      })
    );
  }, [dispatch, platformKey, storeKey, platformList]);

  // Dữ liệu cột NOK theo giờ
  const hourlySeries = useMemo(() => buildHourlySeries(items), [items]);

  // Index theo giờ -> danh sách NOK items (để hiện host trong tooltip)
  const hourIndex = useMemo(() => {
    const m = new Map();
    (items || []).forEach((it) => {
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
  }, [items]);

  // Tooltip tùy biến: liệt kê một số host NOK của giờ đang hover
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const arr = hourIndex.get(label) || [];
    // Lấy unique host theo giờ
    const uniqHosts = Array.from(new Set(arr.map((x) => x.host)));
    const top = uniqHosts.slice(0, 6);
    const more = uniqHosts.length - top.length;

    return (
      <div className="p-2 bg-white border rounded shadow-sm">
        <div><strong>{label}</strong></div>
        <div>NOK: {payload[0]?.value ?? 0}</div>
        {top.map((h) => (
          <div key={h} style={{ fontSize: "0.85rem" }}>• {h}</div>
        ))}
        {more > 0 && (
          <div style={{ fontSize: "0.85rem" }}>+{more} node nữa…</div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">{title || "NOK theo giờ (24h gần nhất)"}</small>
        {loading && <Spinner animation="border" size="sm" />}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart
            data={hourlySeries}
            margin={{ top: 4, right: 8, bottom: 12, left: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="nok" name="NOK" fill={NOK_BAR_COLOR} stroke={NOK_BAR_COLOR} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 🔹 Format ngày ngắn gọn dd/mm/yy
const formatDateShort = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yy = String(dateObj.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

// 🔹 1 dòng cho tổng thể & group
const renderLastUpdatedOneLine = (dateStr, small = false) => {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffHours = (now - dateObj) / (1000 * 60 * 60);

  const display = `${formatDateShort(dateObj)} ${dateObj.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;

  const textColor = diffHours > 24 ? "text-danger" : "text-muted";
  const fontSize = small ? "0.75rem" : "0.85rem";

  return (
    <span className={textColor} style={{ fontSize }}>
      {display}
    </span>
  );
};

// 🔹 2 dòng cho subsystem
const renderLastUpdatedTwoLines = (dateStr, small = false) => {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffHours = (now - dateObj) / (1000 * 60 * 60);

  const textColor = diffHours > 24 ? "text-danger" : "text-muted";
  const fontSize = small ? "0.75rem" : "0.85rem";

  return (
    <div
      className={`d-flex flex-column ${textColor}`}
      style={{ fontSize, lineHeight: "1.1rem" }}
    >
      <span>{formatDateShort(dateObj)}</span>
      <span>
        {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
};

const SystemHealthContent = () => {
  useScheduleWebSocket();
  const dispatch = useDispatch();

  const {
    systemStatus = {},
    loading = false,
    platformSchema = {},
    recentlyUpdated = {},
    last_updated: systemLastUpdated,
  } = useSelector((state) => state.pscore || {});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);

  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
    dispatch(fetchSystemStatus());
  }, [dispatch]);

  // ✅ Memo: group → platforms (dedupe + sort) để ổn định ref
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

  const handleSubsystemClick = (group, subsystem, platform) => {
    setSelectedSubsystem({ group, subsystem, platform });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    dispatch(fetchSystemStatus());
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <div className={styles.container}>
        <Row>
          <Col md={12}>
            <h3 className={styles.pageTitle}>
              System Health Dashboard
              <Clock
                style={{
                  float: "right",
                  fontSize: "1rem",
                  fontWeight: "normal",
                }}
              />
            </h3>

            {/* ✅ Tổng thể 1 dòng */}
            {systemLastUpdated && (
              <div className="text-end mb-2" style={{ fontSize: "0.9rem" }}>
                Last updated: {renderLastUpdatedOneLine(systemLastUpdated)}
              </div>
            )}

            <Row>
              {Object.entries(platformSchema).map(([groupName, subsystems]) => {
                const groupData = systemStatus[groupName] || {};
                const groupStatus = groupData.status || "Unknown";
                const groupChildren = groupData.children || {};
                const cardClass = cardClassMapping[groupName] || "";

                const groupPlatforms = groupPlatformsMap[groupName] || [];

                return (
                  <Col md={6} key={groupName} className="mb-4">
                    <Card
                      className={`shadow ${styles.cardCommon} ${cardClass}`}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="mb-0 fw-bold fs-4">{groupName}</h5>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <span
                              className={`${styles.statusBadge} ${
                                styles[statusColorClass[groupStatus]]
                              }`}
                            >
                              {statusIcon[groupStatus]} {groupStatus}
                            </span>
                          )}
                        </div>

                        {/* ✅ Group 1 dòng */}
                        {groupData.last_updated && (
                          <div className="mb-2">
                            Updated:{" "}
                            {renderLastUpdatedOneLine(groupData.last_updated)}
                          </div>
                        )}

                        {/* ✅ Bố cục 2 cột: Trái = Subsystems + Stats, Phải = Chart */}
                        <Row className="g-3 align-items-stretch">
                          {/* LEFT: Subsystems + Stats */}
                          <Col md={9} className="d-flex flex-column">
                            {/* ✅ Danh sách subsystem (không có chart) */}
                            {!loading && Object.keys(subsystems).length > 0 && (
                              <div className="d-flex flex-wrap gap-3 mt-2">
                                {Object.entries(subsystems).map(
                                  ([subsystemLabel, platforms]) => {
                                    const childData =
                                      groupChildren[subsystemLabel] || {};
                                    const childStatus =
                                      childData.status || "Unknown";

                                    const updatedRecently =
                                      recentlyUpdated?.[groupName]?.[
                                        subsystemLabel
                                      ] &&
                                      Date.now() -
                                        recentlyUpdated[groupName][
                                          subsystemLabel
                                        ] <
                                        3000;

                                    const dynamicClass = updatedRecently
                                      ? styles.updated
                                      : "";

                                    return (
                                      <div
                                        key={subsystemLabel}
                                        className={`${styles.subItem} ${dynamicClass}`}
                                        onClick={() =>
                                          handleSubsystemClick(
                                            groupName,
                                            subsystemLabel,
                                            platforms
                                          )
                                        }
                                      >
                                        {statusIcon[childStatus]}
                                        <div className="d-flex flex-column">
                                          <span className="fw-semibold fs-6">
                                            {subsystemLabel}
                                          </span>

                                          {/* ✅ Subsystem 2 dòng */}
                                          {childData.last_updated && (
                                            <span className="mt-1">
                                              {renderLastUpdatedTwoLines(
                                                childData.last_updated,
                                                true
                                              )}
                                            </span>
                                          )}

                                          <div className="d-flex gap-2 mt-1">
                                            <span
                                              className={
                                                childData.ok_count > 0
                                                  ? styles.ok
                                                  : styles.total
                                              }
                                            >
                                              {childData.ok_count || 0}
                                            </span>
                                            <span
                                              className={
                                                childData.nok_count > 0
                                                  ? styles.nok
                                                  : styles.total
                                              }
                                            >
                                              {childData.nok_count || 0}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            {/* ✅ Stats row */}
                            {!loading && (
                              <div className={`${styles.statRow} mt-auto`}>
                                <div
                                  className={
                                    groupData.ok_count > 0
                                      ? styles.ok
                                      : styles.total
                                  }
                                >
                                  {groupData.ok_count > 0 ? "🟢" : "⚪"} OK:{" "}
                                  <strong>{groupData.ok_count || 0}</strong>
                                </div>
                                <div
                                  className={
                                    groupData.nok_count > 0
                                      ? styles.nok
                                      : styles.total
                                  }
                                >
                                  {groupData.nok_count > 0 ? "🔴" : "⚪"} NOK:{" "}
                                  <strong>{groupData.nok_count || 0}</strong>
                                </div>
                                <div className={styles.total}>
                                  {groupData.total_devices > 0 ? "📦" : "⚪"}{" "}
                                  Total:{" "}
                                  <strong>
                                    {groupData.total_devices || 0}
                                  </strong>
                                </div>
                              </div>
                            )}
                          </Col>

                          {/* RIGHT: Chart */}
                          <Col md={3}>
                            {groupPlatforms.length > 0 && (
                              <GroupNokChart
                                platformList={groupPlatforms}
                                storeKey={`hourly_${slug(groupName)}_group`}
                                height={180}
                                title={`NOK theo giờ (24h) — ${groupName}`}
                              />
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>

        {/* ✅ Modal: Chart + Table */}
        {modalVisible && selectedSubsystem && (
          <Modal
            show={modalVisible}
            onHide={handleCloseModal}
            size="xl"
            centered
            dialogClassName={styles.modalWide}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedSubsystem.group} / {selectedSubsystem.subsystem}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <GroupNokChart
                platformList={selectedSubsystem.platform}
                storeKey={`hourly_${slug(selectedSubsystem.group)}_${slug(
                  selectedSubsystem.subsystem
                )}_modal`}
                height={220}
                title={`NOK theo giờ (24h): ${selectedSubsystem.group} / ${selectedSubsystem.subsystem}`}
              />

              <HealthcheckTable
                group={selectedSubsystem.group}
                subsystem={selectedSubsystem.subsystem}
                platformList={selectedSubsystem.platform}
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

const SystemHealth = () => (
  <Provider store={snocStore}>
    <SystemHealthContent />
  </Provider>
);

export default SystemHealth;
