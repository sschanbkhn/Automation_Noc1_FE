import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPlatformGroupSchema } from "../../../redux/Healthcheck/healthcheckSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import Alert from "../../../components/Alert/Alert";
import snocStore from "../../../store/snocStore";
import styles from "../../../styles/SystemHealth.module.scss";

const cardClassMapping = {
  "CS Core": styles.cardCsCore,
  "PS Core": styles.cardPsCore,
  Signal: styles.cardSignal,
  OCS: styles.cardOcs,
  "IMS Core": styles.cardIms,
  "UDC Core": styles.cardUdc,
};

const KPIChartDashboardContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { platformSchema = {} } = useSelector((state) => state.pscore || {});

  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
  }, [dispatch]);

  const handleSubsystemClick = (systemName, subsystemName, platforms) => {
    navigate(
      `/kpi/${encodeURIComponent(systemName)}/${encodeURIComponent(
        subsystemName
      )}`,
      {
        state: {
          platformOptions: platforms,
        },
      }
    );
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />

      <div className={styles.container}>
        <Row>
          <Col md={12}>
            <h3 className={styles.pageTitle}>KPI Chart Dashboard</h3>
            <Row>
              {Object.entries(platformSchema).map(
                ([systemName, subsystems]) => {
                  const cardClass = cardClassMapping[systemName] || "";
                  return (
                    <Col md={6} key={systemName} className="mb-4">
                      <Card
                        className={`shadow ${styles.cardCommon} ${cardClass}`}
                      >
                        <Card.Body className="p-4">
                          <h5 className="mb-3 fw-bold fs-4">{systemName}</h5>
                          <div className="d-flex flex-wrap gap-3">
                            {Object.entries(subsystems).map(
                              ([subsystemName, platforms]) => (
                                <div
                                  key={subsystemName}
                                  className={styles.subItem}
                                  onClick={() =>
                                    handleSubsystemClick(
                                      systemName,
                                      subsystemName,
                                      platforms
                                    )
                                  }
                                >
                                  <div className="d-flex flex-column">
                                    <span className="fw-semibold fs-6">
                                      {subsystemName}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                }
              )}
            </Row>
          </Col>
        </Row>
      </div>
    </>
  );
};

const KPIChartDashboard = () => (
  <Provider store={snocStore}>
    <KPIChartDashboardContent />
  </Provider>
);

export default KPIChartDashboard;
