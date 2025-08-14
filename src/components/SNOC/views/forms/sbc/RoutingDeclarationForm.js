import React, { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc"; // đường dẫn navbar của bạn

const RoutingDeclarationForm = () => {
  const [formData, setFormData] = useState({
    source: "",
    service: "",
    country: "",
    destinationCode: "",
    ratio: "",
    partner1: "",
    partner2: "",
    partner3: "",
    log: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      log: `✅ Định tuyến đến ${prev.destinationCode} đã được khai báo.`,
    }));
  };

  return (
    <>
      <TopNavbar />

      <div className="p-4 bg-light min-vh-100">
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold text-primary mb-3">
              Phiếu Khai Báo Định Tuyến Lưu Lượng
            </h5>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Nguồn dữ liệu (Đối tác từ kết nối):{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên đối tác"
                      value={formData.source}
                      onChange={(e) => handleChange("source", e.target.value)}
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
                      <option value="Voice">Voice</option>
                      <option value="SMS">SMS</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CountryName:</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Destination Code: <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.destinationCode}
                      onChange={(e) =>
                        handleChange("destinationCode", e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Tỷ lệ (%): <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="VD: 70"
                      value={formData.ratio}
                      onChange={(e) => handleChange("ratio", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Card className="mt-3 mb-4 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-primary">
                    Hướng Chọn Định Tuyến
                  </h6>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hướng chọn 1 (Đối tác):</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.partner1}
                          onChange={(e) =>
                            handleChange("partner1", e.target.value)
                          }
                          placeholder="Tên đối tác"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hướng chọn 2 (Đối tác):</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.partner2}
                          onChange={(e) =>
                            handleChange("partner2", e.target.value)
                          }
                          placeholder="Tên đối tác (nếu có)"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hướng chọn 3 (Đối tác):</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.partner3}
                          onChange={(e) =>
                            handleChange("partner3", e.target.value)
                          }
                          placeholder="Tên đối tác (nếu có)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

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

export default RoutingDeclarationForm;
