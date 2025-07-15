import React, { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc"; // hoặc đúng đường dẫn bạn đang đặt navbar

const DeclareNumberForm = () => {
  const [formData, setFormData] = useState({
    partner: "",
    service: "",
    prefix: "",
    routeCode: "",
    log: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      log: `✅ Đầu số ${prev.prefix} đã được khai báo thành công.`,
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Navbar trên cùng */}
      <TopNavbar />

      {/* Nội dung chính */}
      <div className="p-4 bg-light min-vh-100">
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold text-primary mb-3">
              Phiếu Khai Báo Đầu Số Dịch Vụ
            </h5>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Đối tác (từ kết nối đã tạo):{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên đối tác đã có kết nối"
                      value={formData.partner}
                      onChange={(e) => handleChange("partner", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Service: <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={formData.service}
                      onChange={(e) => handleChange("service", e.target.value)}
                      required
                    >
                      <option value="">Chọn Service</option>
                      <option value="VoIP">VoIP</option>
                      <option value="SMS">SMS</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Đầu số: <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập đầu số"
                      value={formData.prefix}
                      onChange={(e) => handleChange("prefix", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Mã định tuyến: <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã định tuyến"
                      value={formData.routeCode}
                      onChange={(e) =>
                        handleChange("routeCode", e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-end">
                <Button type="submit" variant="primary">
                  Gửi Phiếu
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>
            <h6 className="fw-bold text-primary mb-3">Kết Quả Xử Lý</h6>
            <p className="mb-1 fw-semibold">Log Chi Tiết:</p>
            <div
              className="bg-dark text-white p-3 rounded"
              style={{ fontFamily: "monospace" }}
            >
              {formData.log || "Chưa có log xử lý."}
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default DeclareNumberForm;
