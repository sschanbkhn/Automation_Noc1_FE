import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";
import {
  fetchDnsCheckResult3G,
  clearDnsResult,
} from "../../../redux/Dns/dnsSlice";
import { Provider } from "react-redux";
import snocStore, { RootState, AppDispatch } from "../../../store/snocStore";

const DnslacracrncContent = () => {
  const dispatch = useDispatch();
  const [selectedNode, setSelectedNode] = useState("dnsgn");
  const [selectedMme, setSelectedMme] = useState("mmee1d");
  const [lac, setLac] = useState("");
  const [rac, setRac] = useState("");
  const [rncid, setRncid] = useState("");

  const {
    dns1b = [],
    dns2b = [],
    loading = false,
  } = useSelector((state) => state.dns || {});
  const dnsState = useSelector((state) => state.dns);
  console.log("💥 Toàn bộ state.dns:", dnsState);
  const handleCheck = () => {
    dispatch(
      fetchDnsCheckResult3G({
        platform: selectedNode.toLowerCase(),
        lac,
        rac,
        rncid,
      })
    );
  };
  console.log("dns1b:", dns1b);
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
    dispatch(clearDnsResult());
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`📋 Đã copy ${label} vào clipboard`);
    });
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
                <option value="dnsgn">dnsgn</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>List MME</Form.Label>
              <Form.Select
                value={selectedMme}
                onChange={(e) => setSelectedMme(e.target.value)}
              >
                <option value="mmee1d">mmee1d</option>
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
              <Button
                variant="primary"
                onClick={handleCheck}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Đang kiểm tra...
                  </>
                ) : (
                  "Check"
                )}
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

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="mb-1">Kết quả DNS1B</Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns1b.join("\n"), "DNS1B")}
                >
                  Copy DNS1B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns1b.map((line) => line.trim()).join("\n")}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="mb-1">Kết quả DNS2B</Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns2b.join("\n"), "DNS2B")}
                >
                  Copy DNS2B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns2b.map((line) => line.trim()).join("\n")}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const Dnslacracrnc = () => (
  <Provider store={snocStore}>
    <DnslacracrncContent />
  </Provider>
);

export default Dnslacracrnc;
