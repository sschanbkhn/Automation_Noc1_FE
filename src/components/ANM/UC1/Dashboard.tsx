import React, { useEffect, useState } from 'react';
import Card from 'components/common/Card';
import { Row, Col, Table, Button, Badge } from 'react-bootstrap';
import mockData from './DashboardMockData.json';

const Dashboard = () => {
  const [summary, setSummary] = useState<any>({});
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    setSummary(mockData.summary);
    setReports(mockData.reports.concat(Array(9).fill(mockData.reports[0]))); // để có 10 dòng demo
  }, []);

  return (
    <div className="container">
      {/* Summary Boxes */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 text-center bg-light">
            <div className="fs-4 fw-bold text-danger">{summary.totalAlarm}</div>
            <div>Total Alarm</div>
            <small className="text-success">{summary.changeAlarm} from yesterday</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center bg-light">
            <div className="fs-4 fw-bold text-warning">{summary.totalOrder}</div>
            <div>Total Order</div>
            <small className="text-success">{summary.changeOrder} from yesterday</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center bg-light">
            <div className="fs-4 fw-bold text-success">{summary.successRate}%</div>
            <div>Success Rate</div>
            <small className="text-success">{summary.changeSuccessRate} from yesterday</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center bg-light text-muted">
            <div>Biểu đồ sẽ thay thế sau (pie chart)</div>
          </Card>
        </Col>
      </Row>

      {/* Report Table */}
      <h5>Báo cáo theo BNG</h5>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Mã tỉnh.</th>
            <th>Tên tỉnh</th>
            <th>Thiết bị</th>
            <th>Số thuê bao đa phiên</th>
            <th>Số thuê bao vượt phiên</th>
            <th>Tần suất/ngày</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr key={idx}>
              <td>{r.code}</td>
              <td>{r.province}</td>
              <td>{r.device}</td>
              <td>{r.ip}</td>
              <td className="text-danger fw-bold">{r.exceed}</td>
              <td>
                <Badge bg="success">👁 {r.frequency}</Badge>
              </td>
              <td>
                <Button variant="primary" size="sm">Clear</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Dashboard;
