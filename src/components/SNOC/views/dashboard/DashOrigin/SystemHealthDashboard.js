import React, { useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSystemStatus } from "../../../redux/Healthcheck/healthcheckSlice";
import snocStore from "../../../store/snocStore";
import TopNavbarHealth from "./TopNavbarHealth";
const statusColorClass = {
  Normal: "success",
  Warning: "warning",
  Error: "danger",
  Unknown: "secondary",
};

const statusIcon = {
  Normal: "✅",
  Warning: "⚠️",
  Error: "❌",
  Unknown: "❓",
};

const systems = [
  {
    label: "Signal",
    platform: ["signal"],
  },

  {
    label: "CS Core",
    platform: ["cs_core"],
    children: [
      { label: "MSS", platform: "mss" },
      { label: "MGW", platform: "mgw" },
    ],
  },
  {
    label: "PS Core",
    platform: ["ps_core"],
    children: [
      { label: "MME", platform: "mme" },
      { label: "PGW", platform: "pgw" },
      { label: "PCRF", platform: "pcrf" },
      { label: "DNS", platform: "dns" },
    ],
  },
  {
    label: "UDC Core",
    platform: ["udc"],
  },
  {
    label: "IMS Core",
    platform: ["ims"],
  },

  {
    label: "OCS",
    platform: ["ocs_sdp"],
  },
];

const systemCardStyle = {
  "CS Core": "bg-white border-start border-4 border-primary",
  "PS Core": "bg-white border-start border-4 border-info",
  Signal: "bg-white border-start border-4 border-warning",
  OCS: "bg-white border-start border-4 border-success",
};

const SystemHealthContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { systemStatus = {}, loading = false } = useSelector(
    (state) => state.pscore || {}
  );

  useEffect(() => {
    dispatch(fetchSystemStatus());
  }, [dispatch]);

  const routeMapping = {
    "CS Core": "/healthcheck/cs-core",
    "PS Core": "/healthcheck/ps-core",
    Signal: "/healthcheck/signal",
    OCS: "/healthcheck/ocs",
  };

  const platformMapping = {
    "CS Core": ["cs_core"],
    "PS Core": ["ps_core"],
    Signal: ["signal"],
    OCS: ["ocs_sdp"],
  };

  const handleCardClick = (systemLabel) => {
    navigate(routeMapping[systemLabel], {
      state: { platform: platformMapping[systemLabel] },
    });
  };

  return (
    <>
      <TopNavbarHealth />
      <div className="bg-light min-vh-100 p-4">
        <Row>
          <Col md={12}>
            <h3 className="mb-4 fw-bold">System Health Dashboard</h3>
            <Row>
              {systems.map((system) => {
                const groupData = systemStatus[system.label] || {};
                const status = groupData.status || "Unknown";
                const children = groupData.children || {};
                const cardClass = systemCardStyle[system.label] || "bg-white";

                return (
                  <Col md={6} key={system.label} className="mb-4">
                    <Card
                      className={`shadow ${cardClass}`}
                      onClick={() => handleCardClick(system.label)}
                      style={{ cursor: "pointer" }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="mb-0 fw-bold fs-4">{system.label}</h5>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <span
                              className={`badge bg-${statusColorClass[status]} fs-6 py-2 px-3`}
                            >
                              <span className="fs-5">{statusIcon[status]}</span>{" "}
                              {status}
                            </span>
                          )}
                        </div>

                        {!loading && Object.keys(children).length > 0 && (
                          <div className="d-flex flex-wrap gap-3 mt-3">
                            {Object.entries(children).map(
                              ([label, childData]) => {
                                const childStatus =
                                  typeof childData === "object"
                                    ? childData.status
                                    : childData;

                                return (
                                  <div
                                    key={label}
                                    className="d-flex align-items-center gap-2 border px-3 py-2 rounded bg-light"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/healthcheck/${label.toLowerCase()}`,
                                        {
                                          state: {
                                            platform: [label.toLowerCase()],
                                          },
                                        }
                                      );
                                    }}
                                  >
                                    <span className="fs-5">
                                      {statusIcon[childStatus]}
                                    </span>
                                    <span className="fw-semibold fs-6">
                                      {label}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}

                        {!loading && (
                          <div className="d-flex justify-content-between mt-4">
                            <div className="text-success">
                              ✅ OK: <strong>{groupData.ok_count || 0}</strong>
                            </div>
                            <div className="text-danger">
                              ❌ NOK:{" "}
                              <strong>{groupData.nok_count || 0}</strong>
                            </div>
                            <div className="text-muted">
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
