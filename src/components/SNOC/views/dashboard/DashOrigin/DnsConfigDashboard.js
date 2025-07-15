import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import TopNavbarDns from "./TopNavbarDns";

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

const nodeCardStyle = {
  "DNS HNI1B": "bg-white border-start border-4 border-primary",
  "DNS DNSE1B": "bg-white border-start border-4 border-success",
  "DNS SGN1A": "bg-white border-start border-4 border-warning",
};

const mockData = {
  hni1b: {
    status: "Normal",
    tac_count: 12,
    lac_count: 30,
    rac_count: 15,
    rncid_count: 20,
    apn_count: 5,
    ok_count: 50,
    nok_count: 3,
    total: 53,
  },
  dnse1b: {
    status: "Warning",
    tac_count: 8,
    lac_count: 22,
    rac_count: 10,
    rncid_count: 14,
    apn_count: 4,
    ok_count: 40,
    nok_count: 5,
    total: 45,
  },
  sgn1a: {
    status: "Unknown",
    tac_count: 0,
    lac_count: 0,
    rac_count: 0,
    rncid_count: 0,
    apn_count: 0,
    ok_count: 0,
    nok_count: 0,
    total: 0,
  },
};

const nodes = [
  { label: "DNS HNI1B", zone: "hni1b" },
  { label: "DNS DNSE1B", zone: "dnse1b" },
  { label: "DNS SGN1A", zone: "sgn1a" },
];

const DnsConfigDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dnsSummary, setDnsSummary] = useState({});

  useEffect(() => {
    // Giả lập delay load dữ liệu
    setTimeout(() => {
      setDnsSummary(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <TopNavbarDns />
      <div className="bg-light min-vh-100 p-4">
        <h3 className="mb-4 fw-bold">DNS Configuration Summary</h3>
        <Row>
          {nodes.map((node) => {
            const summary = dnsSummary[node.zone] || {};
            const status = summary.status || "Unknown";
            const cardClass = nodeCardStyle[node.label] || "bg-white";

            return (
              <Col md={6} key={node.zone} className="mb-4">
                <Card className={`shadow ${cardClass}`}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0 fw-bold fs-4">{node.label}</h5>
                      {loading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <span
                          className={`badge bg-${statusColorClass[status]} fs-6 py-2 px-3`}
                        >
                          {statusIcon[status]} {status}
                        </span>
                      )}
                    </div>

                    {!loading && (
                      <div className="d-flex flex-wrap gap-3 text-muted mt-3 fs-6">
                        <div>
                          📌 TAC: <strong>{summary.tac_count}</strong>
                        </div>
                        <div>
                          📍 LAC: <strong>{summary.lac_count}</strong>
                        </div>
                        <div>
                          🧭 RAC: <strong>{summary.rac_count}</strong>
                        </div>
                        <div>
                          🎯 RNCID: <strong>{summary.rncid_count}</strong>
                        </div>
                        <div>
                          🌐 APN: <strong>{summary.apn_count}</strong>
                        </div>
                      </div>
                    )}

                    {!loading && (
                      <div className="d-flex justify-content-between mt-4">
                        <div className="text-success">
                          ✅ OK: <strong>{summary.ok_count}</strong>
                        </div>
                        <div className="text-danger">
                          ❌ NOK: <strong>{summary.nok_count}</strong>
                        </div>
                        <div className="text-muted">
                          📦 Total: <strong>{summary.total}</strong>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </>
  );
};

export default DnsConfigDashboard;
