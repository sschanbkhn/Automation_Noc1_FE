import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import MyPieChart from "./MyPieChart";

interface Filters {
  status?: string;
}

interface DashboardProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: (filters: Filters) => void;
}

const DashboardSummary: React.FC<DashboardProps> = ({ goToTab, setFilters }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalIP: 0,
    totalFails: 0,
    totalPass: 0,
    passRate: 0,
  });

  useEffect(() => {
    fetch("http://10.147.50.118:5678/webhook/ee325191-920a-49c9-b580-66040987d8ac")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);

        const totalIP = data.length;
        const totalFails = data.filter(
          (d: any) => d.port_22 === "Open" || d.port_23 === "Open"
        ).length;
        const totalPass = totalIP - totalFails;
        const passRate = totalIP > 0 ? (((totalPass) / totalIP) * 100).toFixed(1) : 0;

        setSummary({
          totalIP,
          totalFails,
          totalPass,
          passRate,
        });
      });
  }, []);

  const handleSliceClick = (label: string) => {
    if (!setFilters || !goToTab) return;

    const filter: Filters = { status: label }; // Pass "Pass" or "Fail"
    setFilters(filter); // Apply filter to UC1
    goToTab("uc2"); // Switch to UC1 tab
  };

  return (
    <div className="container mt-4">
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
          <Card className="p-2 shadow-sm rounded">
            <MyPieChart
              title="Pass vs Fail"
              data={[
                { label: "Pass", value: summary.totalPass, color: "#28a745" },
                { label: "Fail", value: summary.totalFails, color: "#dc3545" },
              ]}
              onClickSlice={handleSliceClick}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSummary;
