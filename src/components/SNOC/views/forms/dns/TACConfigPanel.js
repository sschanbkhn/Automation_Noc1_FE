import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns"; // Adjust the import path as needed

const TACConfigPanel = () => {
  const [node, setNode] = useState("DNSE1B");
  const [groupMme, setGroupMme] = useState("mmee1x");
  const [groupSgw, setGroupSgw] = useState("epge1x7");
  const [tac, setTac] = useState("");

  const handleCheck = () => {
    console.log("Check TAC:", { node, groupMme, groupSgw, tac });
  };

  const handleAdd = () => {
    console.log("Add TAC:", { node, groupMme, groupSgw, tac });
  };

  const handleDelete = () => {
    console.log("Delete TAC:", { node, groupMme, groupSgw, tac });
  };

  const handleClear = () => {
    setTac("");
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
                value={node}
                onChange={(e) => setNode(e.target.value)}
              >
                <option value="DNSE1B">DNSE1B</option>
                {/* Add more options if needed */}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Tac (số thập phân)</Form.Label>
              <Form.Control
                type="number"
                value={tac}
                onChange={(e) => setTac(e.target.value)}
                placeholder="Điền số thập phân"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
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

        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>group mme</Form.Label>
              <Form.Select
                value={groupMme}
                onChange={(e) => setGroupMme(e.target.value)}
              >
                <option value="mmee1x">mmee1x</option>
                {/* More if needed */}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>group sgw</Form.Label>
              <Form.Select
                value={groupSgw}
                onChange={(e) => setGroupSgw(e.target.value)}
              >
                <option value="epge1x7">epge1x7</option>
                {/* More if needed */}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default TACConfigPanel;
