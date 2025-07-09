import React, { useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ dùng useNavigate thay vì useHistory
import { fetchSystemStatus } from "./../../../redux/Healthcheck/healthcheckSlice";

const statusColorClass = {
  Normal: "success",
  Warning: "warning",
  Error: "danger",
  Unknown: "secondary",
};

const statusIcon = {
  Normal: "✔️",
  Warning: "⚠️",
  Error: "❌",
  Unknown: "❓",
};

const systems = [
  {
    label: "PS Core",
    platform: ["ps_core"],
    children: [
      { label: "MME", platform: "mme" },
      { label: "PGW", platform: "pgw" },
      { label: "PCRF", platform: "pcrf" },
    ],
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
    label: "Signal",
    platform: ["signal"],
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

const SystemHealth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ thay cho useHistory()
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
    <div className="bg-light min-vh-100 p-3">
      <Row>
        <Col md={12}>
          <h4 className="mb-4">System Health Dashboard</h4>
          <Row>
            {systems.map((system) => {
              const groupData = systemStatus[system.label] || {};
              const status = groupData.status || "Unknown";
              const children = groupData.children || {};
              const cardClass = systemCardStyle[system.label] || "bg-white";

              return (
                <Col md={6} key={system.label} className="mb-4">
                  <Card
                    className={`shadow-sm ${cardClass} cursor-pointer`}
                    onClick={() => handleCardClick(system.label)}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h5 className="mb-0 fw-bold">{system.label}</h5>
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <span
                            className={`badge bg-${statusColorClass[status]}`}
                          >
                            {statusIcon[status]} {status}
                          </span>
                        )}
                      </div>

                      {/* Hiển thị các label con nếu có */}
                      {!loading && Object.keys(children).length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {Object.entries(children).map(
                            ([label, childStatus]) => (
                              <div
                                key={label}
                                className="d-flex align-items-center gap-1 border px-2 py-1 rounded bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation(); // Ngăn click lan lên card
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
                                <span>{statusIcon[childStatus]}</span>
                                <span className="small">{label}</span>
                              </div>
                            )
                          )}
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
  );
};

export default SystemHealth;
