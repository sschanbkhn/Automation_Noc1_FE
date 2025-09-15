// src/components/DNS/TACConfigPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  clearDnsResult,
  fetchDnsCheckResultTAC,
  fetchGenerateTmpCommandTAC,
} from "../../../redux/Dns/dnsSlice";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";

const MME_GROUP_VALUES = [
  "mme1x", "mme2x", "mme3x",
  "mmee1x", "mmee2x", "mmee3x", "mmee3x1",
  "mmee1de",
  "mmeet1x",
  "mmen1abcd", "mmen2abcd",
  "mmee1a", "mmee1b", "mmee1c", "mmee1d", "mmee1e", "mmee1f",
  "mmee1g", "mmee1h", "mmee1i", "mmee1k",
  "mmeet1a", "mmeet1b",
  "mmee3a", "mmee3b", "mmee3c", "mmee3d",
  "mmee2a", "mmee2b", "mmee2c", "mmee2d",
  "mmee2e", "mmee2f", "mmee2g", "mmee2h",
];

const PGW_POOL_VALUES = [
  "epg1x", "epg2x", "epg3x", "epg4x",
  "epg1x5g", "epg2x5g", "epg3x5g", "epg4x5g",
  "epge1a", "epge1b", "epge1c", "epge1d",
  "epgce1e", "epgce1f", "epgce1g", "epgce1h", "epgce1i", "epgce1k",
  "epgcet1a", "epgcet1b",
  "epge3a", "epge3b", "epge3c",
  "epgce3d", "epgce3e", "epgce3f",
  "epge2a", "epge2b", "epge2c", "epge2d",
  "epgce2e", "epgce2f", "epgce2g", "epgce2h", "epgce2i", "epgce2k",
  "epge4a", "epge4b",
];

const PGW_5G_POOL_VALUES = [
  "epg1x5g", "epg2x5g", "epg3x5g", "epg4x5g",
  "epge1a", "epge1b", "epge1c", "epge1d",
  "epgce1e", "epgce1f", "epgce1g", "epgce1h", "epgce1i", "epgce1k",
  "epgcet1a", "epgcet1b",
  "epge3a", "epge3b", "epge3c",
  "epgce3d", "epgce3e", "epgce3f",
  "epge2a", "epge2b", "epge2c", "epge2d",
  "epgce2e", "epgce2f", "epgce2g", "epgce2h", "epgce2i", "epgce2k",
  "epge4a", "epge4b",
];

const TACConfigPanel = () => {
  const dispatch = useDispatch();

  const [node, setNode] = useState("dnsgn");
  const [tac, setTac] = useState("");

  // Dropdown (kiểu KPIExplorerUnified): lưu mảng option objects
  const [selectedMme, setSelectedMme] = useState([]);
  const [selectedSgw, setSelectedSgw] = useState([]);
  const [selectedPgw5g, setSelectedPgw5g] = useState([]);

  const { tacResult = {}, tmpCommands = {}, loading = false } =
    useSelector((state) => state.dns || {});

  // Kết quả từ store
  const dns1bArr = [...(tacResult.dns1b || []), ...(tmpCommands.dns1b || [])];
  const dns2bArr = [...(tacResult.dns2b || []), ...(tmpCommands.dns2b || [])];

  // Local text cho 2 textarea để có thể "Clear textbox" mà không ảnh hưởng store
  const [dns1bText, setDns1bText] = useState("");
  const [dns2bText, setDns2bText] = useState("");
  useEffect(() => {
    setDns1bText(dns1bArr.join("\n"));
  }, [JSON.stringify(dns1bArr)]);
  useEffect(() => {
    setDns2bText(dns2bArr.join("\n"));
  }, [JSON.stringify(dns2bArr)]);

  const mmeOptions = useMemo(
    () => MME_GROUP_VALUES.map((v) => ({ label: v, value: v })),
    []
  );
  const sgwOptions = useMemo(
    () => PGW_POOL_VALUES.map((v) => ({ label: v, value: v })),
    []
  );
  const pgw5gOptions = useMemo(
    () => PGW_5G_POOL_VALUES.map((v) => ({ label: v, value: v })),
    []
  );

  const ALL_OPT = { label: "-- Chọn tất cả --", value: "__all__" };
  const mmeOptionsCombined = useMemo(() => [ALL_OPT, ...mmeOptions], [mmeOptions]);
  const sgwOptionsCombined = useMemo(() => [ALL_OPT, ...sgwOptions], [sgwOptions]);
  const pgw5gOptionsCombined = useMemo(() => [ALL_OPT, ...pgw5gOptions], [pgw5gOptions]);

  const handleMmeChange = (selected) => {
    if (!selected) return setSelectedMme([]);
    if (selected.find((o) => o.value === "__all__")) setSelectedMme(mmeOptions);
    else setSelectedMme(selected);
  };
  const handleSgwChange = (selected) => {
    if (!selected) return setSelectedSgw([]);
    if (selected.find((o) => o.value === "__all__")) setSelectedSgw(sgwOptions);
    else setSelectedSgw(selected);
  };
  const handlePgw5gChange = (selected) => {
    if (!selected) return setSelectedPgw5g([]);
    if (selected.find((o) => o.value === "__all__")) setSelectedPgw5g(pgw5gOptions);
    else setSelectedPgw5g(selected);
  };

  const parseTacList = (text) =>
    text
      .split(/[,\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => Number.isFinite(x));

  const handleCheck = () => {
    const tacList = parseTacList(tac);
    dispatch(
      fetchDnsCheckResultTAC({
        platform: node,
        tacList,
        filename: "test.db",
        domain: "epc.mnc002.mcc452.3gppnetwork.org -v RAN",
      })
    );
  };

  const handleCreateTmp = () => {
    const tacList = parseTacList(tac);
    dispatch(
      fetchGenerateTmpCommandTAC({
        tacList,
        mmeList: selectedMme.map((o) => o.value),
        sgwList: selectedSgw.map((o) => o.value),
        pgw5gList: selectedPgw5g.map((o) => o.value),
      })
    );
  };

  const handleAdd = () => {
    const tacList = parseTacList(tac);
    console.log("Add TAC:", {
      node,
      mmeList: selectedMme.map((o) => o.value),
      sgwList: selectedSgw.map((o) => o.value),
      pgw5gList: selectedPgw5g.map((o) => o.value),
      tacList,
    });
  };

  const handleDelete = () => {
    const tacList = parseTacList(tac);
    console.log("Delete TAC:", {
      node,
      mmeList: selectedMme.map((o) => o.value),
      sgwList: selectedSgw.map((o) => o.value),
      pgw5gList: selectedPgw5g.map((o) => o.value),
      tacList,
    });
  };

  const handleClearCache = () => {
    dispatch(clearDnsResult()); // vẫn giữ nút này để xóa cache Redux
  };

  // 🔸 Nút mới: Clear textbox (xóa nội dung 2 textarea, KHÔNG đụng store)
  const handleClearTextboxes = () => {
    setDns1bText("");
    setDns2bText("");
  };

  const handleCopy = (lines, label) => {
    const text = (lines || []).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert(`📋 Đã copy ${label} vào clipboard`);
    });
  };

  return (
    <>
      <TopNavbarDns />
      <Form className="p-3">
        {/* Row 1: Node + TAC + Buttons */}
        <Row className="mb-3 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Node</Form.Label>
              <Form.Select value={node} onChange={(e) => setNode(e.target.value)}>
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
              <Button variant="primary" onClick={handleCheck} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Đang kiểm tra...
                  </>
                ) : (
                  "Check"
                )}
              </Button>
              <Button variant="success" onClick={handleAdd}>Add</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
              <Button variant="secondary" onClick={handleClearCache}>Clear cache dns</Button>
            </div>
          </Col>
        </Row>

        {/* Row 2: MME / PGW Pool / PGW 5G Pool + Buttons */}
        <Row className="mb-3 align-items-end">
          <Col md={4} lg={3} xl={2}>
            <Form.Group>
              <Form.Label>Group MME</Form.Label>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={mmeOptionsCombined}
                value={selectedMme}
                onChange={handleMmeChange}
                placeholder="-- Chọn MME --"
                styles={{
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: "38px",
                    overflowX: "auto",
                    flexWrap: "nowrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              />
            </Form.Group>
          </Col>

          <Col md={4} lg={3} xl={2}>
            <Form.Group>
              <Form.Label>PGW Pool</Form.Label>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={sgwOptionsCombined}
                value={selectedSgw}
                onChange={handleSgwChange}
                placeholder="-- Chọn PGW Pool --"
                styles={{
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: "38px",
                    overflowX: "auto",
                    flexWrap: "nowrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              />
            </Form.Group>
          </Col>

          <Col md={4} lg={3} xl={2}>
            <Form.Group>
              <Form.Label>PGW 5G Pool</Form.Label>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={pgw5gOptionsCombined}
                value={selectedPgw5g}
                onChange={handlePgw5gChange}
                placeholder="-- Chọn PGW 5G --"
                styles={{
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: "38px",
                    overflowX: "auto",
                    flexWrap: "nowrap",
                  }),
                  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              />
            </Form.Group>
          </Col>

          <Col md={12} lg={6}>
            <Form.Label>Phím chức năng</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="warning" onClick={handleCreateTmp}>Generate TMP</Button>
              {/* 🔸 nút mới */}
              <Button variant="secondary" onClick={handleClearTextboxes}>Clear textbox</Button>
            </div>
          </Col>
        </Row>

        {/* Row 3: Kết quả */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="mb-1">Kết quả DNS1B</Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns1bText.split("\n"), "DNS1B")}
                >
                  Copy DNS1B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns1bText}
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
                  onClick={() => handleCopy(dns2bText.split("\n"), "DNS2B")}
                >
                  Copy DNS2B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns2bText}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default TACConfigPanel;
