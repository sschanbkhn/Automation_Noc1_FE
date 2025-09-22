import React, { useEffect, useState } from "react";
import { Table, Badge, Button } from "react-bootstrap";

interface Filters {
  status?: string;
}

interface UC2Props {
  goToTab?: (tabKey: string) => void;
  filters?: Filters;
  setFilters?: (filters: Filters) => void;
}

const ReportsPage: React.FC<UC2Props> = ({ goToTab, filters }) => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://10.147.50.118:5678/webhook/ee325191-920a-49c9-b580-66040987d8ac")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
      });
  }, []);

  // Use filters.status instead of URL query
  const status = filters?.status || "All";

  const filteredReports = reports.filter((r) => {
    if (status === "Fail") {
      return r.port_22 === "Open" || r.port_23 === "Open";
    } else if (status === "Pass") {
      return r.port_22 !== "Open" && r.port_23 !== "Open";
    }
    return true; // All
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Kết quả chi tiết ({status})</h4>
        <Button variant="secondary" onClick={() => goToTab && goToTab("uc1")}>
          ← quay lại
        </Button>
      </div>

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

export default ReportsPage;
