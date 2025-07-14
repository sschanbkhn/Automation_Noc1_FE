import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc"; // Adjust the import path as needed

const CreateConnectionForm = () => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);
    // TODO: Submit to API
  };

  return (
    <>
      <TopNavbar />
      <Container
        className="my-5 bg-white p-4 rounded shadow"
        style={{ maxWidth: 1200 }}
      >
        <h4 className="fw-bold text-primary mb-4">
          Phiếu Tạo Kết Nối Với Đối Tác Nước Ngoài
        </h4>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Đối tác: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control name="partner" onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  REALM: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control name="realm" onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Service: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select name="service" onChange={handleChange} required>
                  <option>Chọn Service</option>
                  {/* Add options */}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Connection Type:</Form.Label>
                <Form.Select name="connection_type" onChange={handleChange}>
                  <option>Chọn Connection Type</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nhóm đối tác về Viettel:</Form.Label>
                <Form.Select name="group_viettel" onChange={handleChange}>
                  <option>Chọn Nhóm Đối Tác Viettel (nếu có)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nhóm đối tác về Mobifone:</Form.Label>
                <Form.Select name="group_mobifone" onChange={handleChange}>
                  <option>Chọn Nhóm Đối Tác Mobifone (nếu có)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  IP SIP đối tác (IPv4): <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="ip_sip"
                  placeholder="VD: 192.168.1.1"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Subnet IP SIP đối tác: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="subnet_sip"
                  placeholder="VD: 255.255.255.0"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  IP RTP đối tác (IPv4): <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="ip_rtp"
                  placeholder="VD: 192.168.1.2"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Subnet IP RTP đối tác: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="subnet_rtp"
                  placeholder="VD: 255.255.255.0"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Số lượng kênh mách: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="channel_count"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Session Agent: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="session_agent"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  TGRP: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control name="tgrp" onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Prefix gửi đối tác:</Form.Label>
                <Form.Control name="prefix_send" onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Prefix đối tác gửi:</Form.Label>
                <Form.Control name="prefix_receive" onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end mt-4">
            <Button type="submit" variant="primary">
              Tạo Kết Nối
            </Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default CreateConnectionForm;
