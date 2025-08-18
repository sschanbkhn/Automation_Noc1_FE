import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import {
  fetchGenerateTmpCommandAPN,
  fetchDnsCheckResultTAC,
  clearDnsResult,
} from "../../../redux/Dns/dnsSlice";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";
import snocStore from "../../../store/snocStore";
import { Provider } from "react-redux";

const APNConfigPanelContent = () => {
  const dispatch = useDispatch();

  const [apns, setApns] = useState("");
  const [pgwGroups, setPgwGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const { tmpCommands = {}, tacResult = {} } = useSelector(
    (state) => state.dns || {}
  );
  const dns1b = [...(tacResult.dns1b || []), ...(tmpCommands.dns1b || [])];
  const dns2b = [...(tacResult.dns2b || []), ...(tmpCommands.dns2b || [])];

  const apnList = apns
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  const handleTmp = () => {
    dispatch(
      fetchGenerateTmpCommandAPN({
        apnList,
        sgwList: pgwGroups,
      })
    );
  };

  const handleAdd = () => {
    console.log("🟢 Add APN:", { apnList, pgwGroups });
    // TODO: Gọi API add nếu có
  };

  const handleDelete = () => {
    console.log("🔴 Delete APN:", { apnList, pgwGroups });
    // TODO: Gọi API delete nếu có
  };

  const handleShow = () => {
    setLoading(true);
    dispatch(
      fetchDnsCheckResultTAC({
        platform: "apn",
        tacList: apnList, // tái sử dụng luôn field tacList cho APN
        filename: "apn.db",
        domain: "epc.mnc002.mcc452.3gppnetwork.org -v RAN",
      })
    ).finally(() => setLoading(false));
  };

  const handleClear = () => {
    setApns("");
    dispatch(clearDnsResult());
  };

  const handleCopy = (lines, label) => {
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert(`📋 Đã copy ${label} vào clipboard`);
    });
  };

  const pgwOptions = [
    "epg1x",
    "epg2x",
    "epg3x",
    "epg4x",
    "epg1x5g",
    "epg2x5g",
    "epg3x5g",
    "epg4x5g",
  ].map((v) => ({ value: v, label: v }));

  return (
    <>
      <TopNavbarDns />
      <Form className="p-3">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Danh sách APN (cách nhau bởi dấu phẩy)</Form.Label>
              <Form.Control
                type="text"
                value={apns}
                onChange={(e) => setApns(e.target.value)}
                placeholder="vd: m3-world, m-wap"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>PGW Pool</Form.Label>
              <Select
                isMulti
                options={pgwOptions}
                value={pgwOptions.filter((opt) =>
                  pgwGroups.includes(opt.value)
                )}
                onChange={(selected) =>
                  setPgwGroups(selected.map((s) => s.value))
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Phím chức năng</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="info" onClick={handleShow} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Đang Show...
                  </>
                ) : (
                  "Show"
                )}
              </Button>
              <Button variant="warning" onClick={handleTmp}>
                Tmp Add
              </Button>
              <Button variant="success" onClick={handleAdd}>
                Add
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="secondary" onClick={handleClear}>
                Clear Cache
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between">
                <Form.Label>Kết quả DNS1B</Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns1b, "DNS1B")}
                >
                  Copy
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={20}
                value={dns1b.join("\n")}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between">
                <Form.Label>Kết quả DNS2B</Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns2b, "DNS2B")}
                >
                  Copy
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={20}
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

const APNConfigPanel = () => (
  <Provider store={snocStore}>
    <APNConfigPanelContent />
  </Provider>
);

export default APNConfigPanel;
