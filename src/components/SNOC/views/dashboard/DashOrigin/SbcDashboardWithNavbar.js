import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Row, Col, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom"; // ✅ Bắt buộc nếu dùng N
import TopNavbar from "./TopNavbarSbc";
const SbcDashboardWithNavbar = () => {
  const [data, setData] = useState({
    totalConnections: 0,
    activeNumbers: 0,
    qualityAlerts: 0,
    logDetail: "Đang tải dữ liệu...",
  });

  useEffect(() => {
    // Giả lập fetch API
    setTimeout(() => {
      setData({
        totalConnections: 125,
        activeNumbers: 1500,
        qualityAlerts: 3,
        logDetail: "✅ 1500 đầu số hoạt động. ⚠️ 3 cảnh báo chất lượng.",
      });
    }, 1000);
  }, []);

  return (
    <>
      {/* Thanh menu trên cùng */}

      <TopNavbar />

      {/* Nội dung chính */}
      <div className="bg-light min-vh-100 p-4">
        <h4 className="fw-bold text-primary mb-4">Bảng Điều Khiển Tổng Quan</h4>

        <p className="mb-4">
          Chào mừng bạn đến với công cụ quản lý định tuyến SBC. Chọn một mục từ
          thanh điều hướng để bắt đầu.
        </p>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 bg-light-subtle">
              <Card.Body>
                <h6 className="text-primary">Số Lượng Kết Nối</h6>
                <h2 className="fw-bold text-primary">
                  {data.totalConnections}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0 bg-success-subtle">
              <Card.Body>
                <h6 className="text-success">Đầu Số Đang Hoạt Động</h6>
                <h2 className="fw-bold text-success">
                  {data.activeNumbers.toLocaleString()}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0 bg-warning-subtle">
              <Card.Body>
                <h6 className="text-warning">Cảnh Báo Chất Lượng</h6>
                <h2 className="fw-bold text-warning">{data.qualityAlerts}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Header className="fw-bold text-primary">
            Kết Quả Xử Lý
          </Card.Header>
          <Card.Body>
            <strong>Log Chi Tiết:</strong>
            <div
              className="bg-dark text-white p-3 mt-2 rounded"
              style={{ fontFamily: "monospace" }}
            >
              {data.logDetail}
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default SbcDashboardWithNavbar;
