import React, { useEffect, useState } from "react";
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import Alert from "../../../components/Alert/Alert";
import Clock from "../../../components/Clock";
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
    {
      hour: "2-digit",
      minute: "2-digit",
    }
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
        {dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
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

                        {!loading && (
                          <div className={styles.statRow}>
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
                              {groupData.total_devices > 0 ? "📦" : "⚪"} Total:{" "}
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
            dialogClassName={styles.modalWide} // ✅ dùng class trong CSS module
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
