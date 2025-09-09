import React, { useEffect, useState } from "react";
import { Row, Col, Table, Badge, Card } from "react-bootstrap";
import MyPieChart from "./MyPieChart"; // ✅ import your chart

const Dashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalIP: 0,
    totalFails: 0,
    totalPass: 0,
    passRate: 0,
  });
  const [filter, setFilter] = useState<string>("All"); // ✅ filter state

  useEffect(() => {
    // Example: Replace with your real API fetch
    fetch("http://10.155.43.198:5678/webhook/ee325191-920a-49c9-b580-66040987d8ac")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);

        const totalIP = data.length;
        const totalFails = data.filter(
          (d: any) => d.port_22 === "Open" || d.port_23 === "Open"
        ).length;
        const totalPass = totalIP - totalFails;
        const passRate =
          totalIP > 0 ? (((totalPass) / totalIP) * 100).toFixed(1) : 0;

        setSummary({
          totalIP,
          totalFails,
          totalPass,
          passRate,
        });
      });
  }, []);

  // ✅ Filter reports based on chart click
  const filteredReports = reports.filter((r) => {
    if (filter === "Fail") {
      return r.port_22 === "Open" || r.port_23 === "Open";
    } else if (filter === "Pass") {
      return r.port_22 !== "Open" && r.port_23 !== "Open";
    }
    return true; // All
  });

  return (
    <div className="container mt-4">
      {/* Summary Cards */}
      <Row className="mb-4 text-center">
        <Col md={3}>
          <Card className="p-3 shadow-sm rounded">
            <div className="fs-4 fw-bold text-danger">{summary.totalIP}</div>
            <div>Total IP</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm rounded">
            <div className="fs-4 fw-bold text-warning">{summary.totalFails}</div>
            <div>Total Fails</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm rounded">
            <div className="fs-4 fw-bold text-success">{summary.passRate}%</div>
            <div>Pass Percentage</div>
          </Card>
        </Col>
        <Col md={3}>
          {/* ✅ Chart with filter */}
          <Card className="p-2 shadow-sm rounded">
            <MyPieChart
              title="Pass vs Fail"
              data={[
                { label: "Pass", value: summary.totalPass, color: "#28a745" }, // green
                { label: "Fail", value: summary.totalFails, color: "#dc3545" }, // red
              ]}
              onClickSlice={(label) => {
                setFilter((prev) => (prev === label ? "All" : label));
              }}
            />
            <small className="text-muted">
              Current filter: <b>{filter}</b>
            </small>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <h5>Device Reports</h5>
      <Table bordered hover responsive className="align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>IP Address</th>
            <th>Device Type</th>
            <th>Port 22</th>
            <th>Port 23</th>
            <th>Update Time</th>
            <th>Update History</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((r, idx) => (
            <tr key={idx}>
              <td>{r.ip}</td>
              <td>{r.device_type.trim()}</td>
              <td>
                <Badge bg={r.port_22 === "Open" ? "danger" : "secondary"}>
                  {r.port_22}
                </Badge>
              </td>
              <td>
                <Badge bg={r.port_23 === "Open" ? "danger" : "secondary"}>
                  {r.port_23}
                </Badge>
              </td>
              <td>{new Date(r.update_time).toLocaleString()}</td>
              <td>
                <Badge bg="info">{r.update_history}</Badge>
              </td>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Dashboard;
