import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchPlatformGroupSchema,
  fetchSystemStatus,
} from "../../../redux/Healthcheck/healthcheckSlice";
import snocStore from "../../../store/snocStore";
import HealthcheckTable from "../../tables/health/HealthcheckTable";
import styles from "./../../../styles/SystemHealth.module.scss";
import TopNavbarHealth from "./TopNavbarHealth";

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

  const handleSubsystemClick = (group, subsystem, platform) => {
    setSelectedSubsystem({ group, subsystem, platform });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    dispatch(fetchSystemStatus());
  };

  // 🔸 TÍNH TỔNG HỢP: đếm theo status của từng subsystem
  const summary = useMemo(() => {
    let normal = 0,
      warning = 0,
      error = 0,
      total = 0;

    Object.values(systemStatus).forEach((group) => {
      const children = group?.children || {};
      Object.values(children).forEach((child) => {
        const st = child?.status || "Unknown";
        if (st === "Normal") normal += 1;
        else if (st === "Warning") warning += 1;
        else if (st === "Error") error += 1;
        total += 1;
      });
    });

    if (total === 0 && platformSchema && Object.keys(platformSchema).length) {
      Object.values(platformSchema).forEach((subsystems) => {
        total += Object.keys(subsystems || {}).length;
      });
    }

    return { normal, warning, error, total };
  }, [systemStatus, platformSchema]);

  // 🔸 Card tổng hợp (light)
  const SummaryCard = ({ title, value, icon, accent = "secondary" }) => (
    <Card className="shadow-sm border bg-white">
      <Card.Body className="d-flex align-items-center justify-content-between p-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className={`rounded-3 border d-flex align-items-center justify-content-center text-${accent}`}
            style={{ width: 36, height: 36, background: "#f8f9fa" }}
            aria-label={title}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
          </div>
          <div className="text-secondary" style={{ fontSize: 14 }}>
            {title}
          </div>
        </div>
        <div className="fw-bold text-dark" style={{ fontSize: 22 }}>
          {value}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <div className={`${styles.container}`}>
        <Row>
          <Col md={12}>
            {/* ✅ Last updated tổng thể */}
            {systemLastUpdated && (
              <div className="text-end mb-2" style={{ fontSize: "0.9rem" }}>
                Last updated: {renderLastUpdatedOneLine(systemLastUpdated)}
              </div>
            )}

            {/* ✅ DẢI TỔNG HỢP (light) */}
            <Row className="g-3 mb-4">
              <Col md={3} sm={6} xs={12}>
                <SummaryCard
                  title="Systems Normal"
                  value={summary.normal}
                  icon="✅"
                  accent="success"
                />
              </Col>
              <Col md={3} sm={6} xs={12}>
                <SummaryCard
                  title="Systems Warning"
                  value={summary.warning}
                  icon="⚠️"
                  accent="warning"
                />
              </Col>
              <Col md={3} sm={6} xs={12}>
                <SummaryCard
                  title="Systems Error"
                  value={summary.error}
                  icon="⛔"
                  accent="danger"
                />
              </Col>
              <Col md={3} sm={6} xs={12}>
                <SummaryCard
                  title="Total Systems"
                  value={summary.total}
                  icon="📶"
                  accent="primary"
                />
              </Col>
            </Row>

            <Row>
              {Object.entries(platformSchema).map(([groupName, subsystems]) => {
                const groupData = systemStatus[groupName] || {};
                const groupStatus = groupData.status || "Unknown";
                const groupChildren = groupData.children || {};
                const cardClass = cardClassMapping[groupName] || "";

                return (
                  <Col md={6} key={groupName} className="mb-4">
                    <Card
                      className={`shadow-sm bg-white border ${styles.cardCommon} ${cardClass}`}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="mb-0 fw-bold fs-4 text-dark">
                            {groupName}
                          </h5>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <span
                              className={`${styles.statusBadge} ${
                                styles[statusColorClass[groupStatus]]
                              }`}
                              style={{
                                background: "#f8f9fa",
                                color: "#212529",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              {statusIcon[groupStatus]} {groupStatus}
                            </span>
                          )}
                        </div>

                        {/* ✅ Group 1 dòng */}
                        {groupData.last_updated && (
                          <div className="mb-2 text-muted">
                            Updated:{" "}
                            {renderLastUpdatedOneLine(groupData.last_updated)}
                          </div>
                        )}

                        {!loading && Object.keys(subsystems).length > 0 && (
                          <div className="d-flex flex-wrap gap-3 mt-3">
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
                                    recentlyUpdated[groupName][subsystemLabel] <
                                    3000;

                                const dynamicClass = updatedRecently
                                  ? styles.updated
                                  : "";

                                return (
                                  <div
                                    key={subsystemLabel}
                                    className={`${styles.subItem} ${dynamicClass} bg-white border`}
                                    style={{
                                      boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                                    }}
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
                                      <span className="fw-semibold fs-6 text-dark">
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

                        {!loading && (
                          <div className={`${styles.statRow} text-dark`}>
                            <div
                              className={
                                groupData.ok_count > 0
                                  ? styles.ok
                                  : styles.total
                              }
                            >
                              🟢 OK: <strong>{groupData.ok_count || 0}</strong>
                            </div>
                            <div
                              className={
                                groupData.nok_count > 0
                                  ? styles.nok
                                  : styles.total
                              }
                            >
                              🔴 NOK:{" "}
                              <strong>{groupData.nok_count || 0}</strong>
                            </div>
                            <div className={styles.total}>
                              📦 Total:{" "}
                              <strong>{groupData.total_devices || 0}</strong>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>

        {/* ✅ Modal hiển thị HealthcheckTable */}
        {modalVisible && selectedSubsystem && (
          <Modal
            show={modalVisible}
            onHide={handleCloseModal}
            size="xl"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedSubsystem.group} / {selectedSubsystem.subsystem}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <HealthcheckTable
                group={selectedSubsystem.group}
                subsystem={selectedSubsystem.subsystem}
                platformList={selectedSubsystem.platform}
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
