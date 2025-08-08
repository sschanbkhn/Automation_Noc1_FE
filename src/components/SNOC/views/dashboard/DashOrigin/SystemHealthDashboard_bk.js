import React, { useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSystemStatus,
  fetchPlatformGroupSchema,
} from "../../../redux/Healthcheck/healthcheckSlice";
import snocStore from "../../../store/snocStore";
import TopNavbarHealth from "./TopNavbarHealth";
import styles from "./../../../styles/SystemHealth.module.scss";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner"; // cập nhật path cho đúng
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import Clock from "../../../components/Clock";
import Alert from "../../../components/Alert/Alert";

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

const SystemHealthContent = () => {
  useScheduleWebSocket(); // ✅ Gọi ở đây

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    systemStatus = {},
    loading = false,
    platformSchema = {},
    recentlyUpdated = {},
  } = useSelector((state) => state.pscore || {});

  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
    dispatch(fetchSystemStatus());
  }, [dispatch]);

  const handleCardClick = (systemLabel, platformList) => {
    navigate(`/healthcheck/${encodeURIComponent(systemLabel)}`, {
      state: {
        group: systemLabel,
        platform: platformList,
      },
    });
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
            <Row>
              {Object.entries(platformSchema).map(([groupName, subsystems]) => {
                const groupData = systemStatus[groupName] || {};
                const groupStatus = groupData.status || "Unknown";
                const groupChildren = groupData.children || {};
                const cardClass = cardClassMapping[groupName] || "";

                // Gom tất cả platform trong group để route vào khi click thẻ lớn
                const allGroupPlatforms = Object.values(subsystems).flat();

                return (
                  <Col md={6} key={groupName} className="mb-4">
                    <Card
                      className={`shadow ${styles.cardCommon} ${cardClass}`}
                      onClick={() =>
                        handleCardClick(groupName, allGroupPlatforms)
                      }
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

                        {!loading && Object.keys(subsystems).length > 0 && (
                          <div className="d-flex flex-wrap gap-3 mt-3">
                            {Object.entries(subsystems).map(
                              ([subsystemLabel, platforms]) => {
                                const childData =
                                  groupChildren?.[subsystemLabel] || {};
                                const childStatus =
                                  childData.status || "Unknown";

                                // ✅ Kiểm tra subsystem có vừa được cập nhật không
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/healthcheck/${encodeURIComponent(
                                          groupName
                                        )}/${encodeURIComponent(
                                          subsystemLabel
                                        )}`,
                                        {
                                          state: {
                                            group: groupName,
                                            subsystem: subsystemLabel,
                                            platform: platforms,
                                          },
                                        }
                                      );
                                    }}
                                  >
                                    {statusIcon[childStatus]}
                                    <div className="d-flex flex-column">
                                      <span className="fw-semibold fs-6">
                                        {subsystemLabel}
                                      </span>
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
