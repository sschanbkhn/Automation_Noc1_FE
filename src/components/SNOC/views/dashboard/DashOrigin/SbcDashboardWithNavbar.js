// src/components/SNOC/dashboard/DashOrigin/SbcDashboardWithNavbar.jsx
import React, { useEffect } from "react";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchConnectionConfigs,
  fetchServicePrefixes,
} from "../../../redux/Sbc/sbcConnectionSlice";
import TopNavbar from "./TopNavbarSbc";

const SbcDashboardWithNavbar = () => {
  const dispatch = useDispatch();

  const {
    configs = [],
    servicePrefixes = [],
    // ❌ Chưa có trong slice thì đừng destructure
    // routingPolicies = [],

    loadingConfigs = false,
    loadingServicePrefixes = false,
    // loadingRoutingPolicies = false,
  } = useSelector((state) => state.sbcConnection || {});

  useEffect(() => {
    dispatch(fetchConnectionConfigs());
    dispatch(fetchServicePrefixes());
    // ❌ Chỉ bật lại khi đã làm xong phần routing Redux
    // dispatch(fetchRoutingPolicies());
  }, [dispatch]);

  const isLoading = loadingConfigs || loadingServicePrefixes; // || loadingRoutingPolicies;

  // ====== TÍNH TOÁN TỔNG HỢP ======
  const totalConnections = configs.length;
  const activeNumbers = servicePrefixes.length;
  // const totalRoutingPolicies = routingPolicies.length;
  const totalRoutingPolicies = 0; // tạm set 0 cho đẹp UI

  const qualityAlerts = 0; // sau này có thật thì map từ API

  const logDetail = isLoading
    ? "Đang tải dữ liệu tổng hợp từ hệ thống SBC..."
    : `✅ ${totalConnections} kết nối đang khai báo. ✅ ${activeNumbers} đầu số dịch vụ. ✅ ${totalRoutingPolicies} rule định tuyến. ⚠️ ${qualityAlerts} cảnh báo chất lượng (nếu có).`;

  return (
    <>
      <TopNavbar />

      <div className="bg-light min-vh-100 p-4">
        <h4 className="fw-bold text-primary mb-4">Bảng Điều Khiển Tổng Quan</h4>

        <p className="mb-4">
          Chào mừng bạn đến với công cụ quản lý định tuyến SBC. Chọn một mục từ
          thanh điều hướng để bắt đầu.
        </p>

        {isLoading && (
          <div className="mb-4 d-flex align-items-center text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Đang tải dữ liệu tổng hợp...
          </div>
        )}

        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 bg-light-subtle">
              <Card.Body>
                <h6 className="text-primary">Số Lượng Kết Nối</h6>
                <h2 className="fw-bold text-primary">{totalConnections}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 bg-success-subtle">
              <Card.Body>
                <h6 className="text-success">Đầu Số Đang Khai Báo</h6>
                <h2 className="fw-bold text-success">
                  {activeNumbers.toLocaleString()}
                </h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 bg-warning-subtle">
              <Card.Body>
                <h6 className="text-warning">Cảnh Báo Chất Lượng</h6>
                <h2 className="fw-bold text-warning">{qualityAlerts}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Header className="fw-bold text-primary">
            Kết Quả Tổng Hợp
          </Card.Header>
          <Card.Body>
            <strong>Log Chi Tiết:</strong>
            <div
              className="bg-dark text-white p-3 mt-2 rounded"
              style={{ fontFamily: "monospace" }}
            >
              {logDetail}
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default SbcDashboardWithNavbar;
