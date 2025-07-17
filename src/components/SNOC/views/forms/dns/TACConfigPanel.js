import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";
import {
  fetchDnsCheckResultTAC,
  fetchGenerateTmpCommandTAC,
  clearDnsResult,
} from "../../../redux/Dns/dnsSlice";
import { Provider } from "react-redux";
import snocStore from "../../../store/snocStore";

const TACConfigPanelContent = () => {
  const dispatch = useDispatch();

  const [node, setNode] = useState("dnsgn");
  const [tac, setTac] = useState("");
  const [mmeGroups, setMmeGroups] = useState([]);
  const [sgwGroups, setSgwGroups] = useState([]);

  const {
    tacResult = {},
    tmpCommands = {},
    loading = false,
  } = useSelector((state) => state.dns || {});

  const dns1b = [...(tacResult.dns1b || []), ...(tmpCommands.dns1b || [])];
  const dns2b = [...(tacResult.dns2b || []), ...(tmpCommands.dns2b || [])];

  const handleCheck = () => {
    const tacList = tac
      .split(",")
      .map((x) => parseInt(x.trim()))
      .filter((x) => !isNaN(x));
    dispatch(
      fetchDnsCheckResultTAC({
        platform: node,
        tacList,
        filename: "test.db",
        domain: "epc.mnc002.mcc452.3gppnetwork.org -v RAN",
      })
    );
  };

  const handleAdd = () => {
    console.log("Add TAC:", { node, mmeGroups, sgwGroups, tac });
    // TODO: dispatch thực tế nếu có
  };

  const handleDelete = () => {
    console.log("Delete TAC:", { node, mmeGroups, sgwGroups, tac });
    // TODO: xử lý sau
  };

  const handleCreateTmp = () => {
    const tacList = tac
      .split(",")
      .map((x) => parseInt(x.trim()))
      .filter((x) => !isNaN(x));

    dispatch(
      fetchGenerateTmpCommandTAC({
        tacList,
        mmeList: mmeGroups, // ✅ Đúng key
        sgwList: sgwGroups, // ✅ Đúng key
      })
    );
  };

  const handleClear = () => {
    setTac("");
    dispatch(clearDnsResult());
  };

  const handleCopy = (lines, label) => {
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert(`📋 Đã copy ${label} vào clipboard`);
    });
  };

  const mmeOptions = [
    "mme1x",
    "mmee1a",
    "mmee1b",
    "mmee1c",
    "mmee1d",
    "mmee1e",
    "mmee1f",
    "mmee1g",
    "mmee1h",
    "mmee1i",
    "mmee1k",
  ].map((v) => ({ value: v, label: v }));

  const sgwOptions = [
    "epge1a",
    "epge1b",
    "epge1c",
    "epge1d",
    "epgce1e",
    "epgce1f",
    "epgce1g",
    "epgce1h",
    "epgce1i",
    "epgce1k",
    "epg1x",
    "epg1x5g",
    "epg2x",
    "epg2x5g",
    "epg3x",
    "epg3x5g",
    "epg4x",
    "epg4x5g",
  ].map((v) => ({ value: v, label: v }));

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
                <option value="dnsgn">dnsgn</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>TAC (cách nhau bởi dấu phẩy)</Form.Label>
              <Form.Control
                type="text"
                value={tac}
                onChange={(e) => setTac(e.target.value)}
                placeholder="VD: 30211, 12345"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Label>Phím chức năng</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
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
              <Button variant="warning" onClick={handleCreateTmp}>
                Create tmp
              </Button>
              <Button variant="secondary" onClick={handleClear}>
                Clear cache
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Group MME</Form.Label>
              <Select
                isMulti
                options={mmeOptions}
                value={mmeOptions.filter((opt) =>
                  mmeGroups.includes(opt.value)
                )}
                onChange={(selected) =>
                  setMmeGroups(selected.map((s) => s.value))
                }
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>PGW Pool</Form.Label>
              <Select
                isMulti
                options={sgwOptions}
                value={sgwOptions.filter((opt) =>
                  sgwGroups.includes(opt.value)
                )}
                onChange={(selected) =>
                  setSgwGroups(selected.map((s) => s.value))
                }
              />
            </Form.Group>
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
                  onClick={() => handleCopy(dns1b, "DNS1B")}
                >
                  Copy DNS1B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns1b.join("\n")}
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
                  onClick={() => handleCopy(dns2b, "DNS2B")}
                >
                  Copy DNS2B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns2b.join("\n")}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const TACConfigPanel = () => (
  <Provider store={snocStore}>
    <TACConfigPanelContent />
  </Provider>
);

export default TACConfigPanel;
