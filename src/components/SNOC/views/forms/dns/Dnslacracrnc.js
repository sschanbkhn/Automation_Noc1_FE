import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns"; // Adjust the import path as needed

const Dnslacracrnc = () => {
  const [selectedNode, setSelectedNode] = useState("DNSE1B");
  const [selectedMme, setSelectedMme] = useState("mmee1d");
  const [lac, setLac] = useState("");
  const [rac, setRac] = useState("");
  const [rncid, setRncid] = useState("");

  const handleCheck = () => {
    console.log("Check:", { selectedNode, selectedMme, lac, rac, rncid });
  };

  const handleAdd = () => {
    console.log("Add:", { selectedNode, selectedMme, lac, rac, rncid });
  };

  const handleDelete = () => {
    console.log("Delete:", { selectedNode, selectedMme, lac, rac, rncid });
  };

  const handleClear = () => {
    setLac("");
    setRac("");
    setRncid("");
  };

  return (
    <>
      <TopNavbarDns />
      <Form className="p-3">
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Node</Form.Label>
              <Form.Select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
              >
                <option value="DNSE1B">DNSE1B</option>
                {/* Thêm node khác nếu cần */}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>list mme</Form.Label>
              <Form.Select
                value={selectedMme}
                onChange={(e) => setSelectedMme(e.target.value)}
              >
                <option value="mmee1d">mmee1d</option>
                {/* Thêm MME khác nếu cần */}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>LAC (số thập phân)</Form.Label>
              <Form.Control
                type="number"
                value={lac}
                onChange={(e) => setLac(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>RAC (số thập phân)</Form.Label>
              <Form.Control
                type="number"
                value={rac}
                onChange={(e) => setRac(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>RNCID (số thập phân)</Form.Label>
              <Form.Control
                type="number"
                value={rncid}
                onChange={(e) => setRncid(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Phím chức năng</Form.Label>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleCheck}>
                Check
              </Button>
              <Button variant="success" onClick={handleAdd}>
                Add
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="secondary" onClick={handleClear}>
                Clear cache
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Dnslacracrnc;
