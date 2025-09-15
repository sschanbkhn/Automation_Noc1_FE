// src/components/DNS/Dnslacracrnc.jsx
import React, { useMemo, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  clearDnsResult,
  fetchDnsCheckResult3G,
  fetchGenerateTmpRNC, // ✅ thunk Generate TMP RNC
} from "../../../redux/Dns/dnsSlice";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";

const Dnslacracrnc = () => {
  const dispatch = useDispatch();

  const [selectedNode, setSelectedNode] = useState("dnsgn");

  // GIỮ NGUYÊN OPTIONS MME NHƯ CODE GỐC (kể cả mục lặp)
  const MME_VALUES = useMemo(
    () => [
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
      "mmee3c",
      "mmee3c",
      "mmee3c",
      "mmee3d",
      "mmee2a",
      "mmee2b",
      "mmee2c",
      "mmee2d",
      "mmee2e",
      "mmee2f",
      "mmee2g",
      "mmee2h",
      "mmeeet1a",
      "mmeeet1b",
    ],
    []
  );
  const mmeOptions = useMemo(
    () => MME_VALUES.map((v) => ({ label: v, value: v })),
    [MME_VALUES]
  );
  const ALL_OPT = { label: "-- Chọn tất cả --", value: "__all__" };
  const mmeOptionsCombined = useMemo(
    () => [ALL_OPT, ...mmeOptions],
    [mmeOptions]
  );

  // ✅ MSS Pool options (multi-select)
  const MSSPOOL_VALUES = useMemo(
    () => [
      "msspool",
      "msspool_1",
      "mssectogw",
      "tsse1x",
      "tsse2x",
      "msse1e",
      "msse1e_1",
      "msse1f",
      "msse1f_1",
      "vmsse1g",
      "vmsse1g_1",
      "vmsse1h",
      "vmsse1h_1",
      "mssn1b",
      "mssn1b_1",
      "msse3a",
      "msse3a_1",
      "msse3b",
      "msse3b_1",
      "msse3c",
      "msse3c_1",
      "vmsse3d",
      "vmsse3d_1",
      "vmsse3e",
      "vmsse3e_1",
      "mssn3c",
      "mssn3c_1",
      "msse2f",
      "msse2g",
      "vmsse2h",
      "vmsse2h_1",
      "vmsse2i",
      "vmsse2i_1",
      "mssn2f",
      "mssn2f_1",
      "vmsse4e",
      "vmsse4e_1",
      "vmsse4f",
      "vmsse4f_1",
      "mssn4d",
      "mssn4d_1",
      "tsse1b",
      "tsse1c",
      "tsse2c",
      "tsse2d",
    ],
    []
  );
  const msspoolOptions = useMemo(
    () => MSSPOOL_VALUES.map((v) => ({ label: v, value: v })),
    [MSSPOOL_VALUES]
  );

  const [selectedMme, setSelectedMme] = useState([]);
  const [selectedMsspool, setSelectedMsspool] = useState([]); // ✅ MSSPOOL multi

  // Thứ tự: RNCID → LAC → RAC
  const [rncid, setRncid] = useState("");
  const [lac, setLac] = useState("");
  const [rac, setRac] = useState("");

  // ✅ Ẩn/hiện note ở 2 textbox
  const [hideNotes, setHideNotes] = useState(false);

  const {
    dns1b = [],
    dns2b = [],
    loading = false,
  } = useSelector((state) => state.dns || {});

  const handleMmeChange = (selected) => {
    if (!selected) return setSelectedMme([]);
    if (selected.find((o) => o.value === "__all__")) {
      setSelectedMme(mmeOptions); // chọn tất cả
    } else {
      setSelectedMme(selected);
    }
  };

  // ===== Parse N dòng Excel theo thứ tự: RNCID, LAC, RAC
  const parseTripletLines = (raw) => {
    const lines = (raw || "")
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const rows = [];
    for (const line of lines) {
      const splitter = /\t/.test(line) ? /\t+/ : /,/.test(line) ? /,+/ : /\s+/;
      const toks = line
        .split(splitter)
        .map((t) => t.trim())
        .filter(Boolean);
      if (toks.length < 3) continue;
      const nums = toks.filter((t) => /^\d+$/.test(t));
      const [rncV, lacV, racV] =
        nums.length >= 3 ? nums.slice(0, 3) : toks.slice(0, 3);
      rows.push({ rncid: rncV || "", lac: lacV || "", rac: racV || "" });
    }
    return rows;
  };

  const handlePasteTriplets = (e) => {
    const text = e.clipboardData?.getData("text") ?? "";
    if (!/\t|,|\r?\n/.test(text)) return; // để paste thường
    const rows = parseTripletLines(text);
    if (rows.length > 0) {
      e.preventDefault();
      setBatchRows(rows);
      setRncid(rows[0].rncid);
      setLac(rows[0].lac);
      setRac(rows[0].rac);
    }
  };

  const [batchRows, setBatchRows] = useState([]); // [{rncid,lac,rac}, ...]
  const clearBatch = () => setBatchRows([]);

  const toIntOrNull = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const buildSets = () => {
    if (batchRows.length > 0) {
      return batchRows.map((r) => [
        toIntOrNull(r.rncid),
        toIntOrNull(r.lac),
        toIntOrNull(r.rac),
      ]);
    }
    return [[toIntOrNull(rncid), toIntOrNull(lac), toIntOrNull(rac)]];
  };

  // ✅ Check: gửi nhiều bộ sets nếu có batch
  const handleCheck = () => {
    const sets = buildSets();
    dispatch(
      fetchDnsCheckResult3G({
        platform: selectedNode.toLowerCase(),
        sets, // ← API mới show theo từng [SET #]
      })
    );
  };

  const handleAdd = () => {
    console.log("Add:", {
      selectedNode,
      selectedMme: selectedMme.map((o) => o.value),
      selectedMsspool: selectedMsspool.map((o) => o.value),
      rncid,
      lac,
      rac,
    });
  };

  const handleDelete = () => {
    console.log("Delete:", {
      selectedNode,
      selectedMme: selectedMme.map((o) => o.value),
      selectedMsspool: selectedMsspool.map((o) => o.value),
      rncid,
      lac,
      rac,
    });
  };

  // ✅ Generate TMP (gọi /nornirps/generate-tmp-rnc/ trả về {dns1b, dns2b})
  const handleGenerateTmp = () => {
    const mmeList = selectedMme.map((o) => o.value);
    const msspoolList = selectedMsspool.map((o) => o.value);
    if (mmeList.length === 0) {
      alert("Vui lòng chọn ít nhất 1 MME.");
      return;
    }
    const sets = buildSets();
    dispatch(fetchGenerateTmpRNC({ mmeList, sets, msspoolList }));
  };

  const handleClear = () => {
    setRncid("");
    setLac("");
    setRac("");
    setBatchRows([]);
    setSelectedMsspool([]);
    dispatch(clearDnsResult());
  };

  // ✅ Remove notes: filter các dòng bắt đầu bằng #, //, --, REM..., và dòng trống
  const stripNotes = (arr) =>
    (arr || []).filter((line) => {
      const s = String(line || "").trim();
      if (!s) return false;
      if (/^(#|\/\/|--|REM\b)/i.test(s)) return false;
      return true;
    });

  const dns1bToShow = (hideNotes ? stripNotes(dns1b) : dns1b)
    .map((line) => String(line || "").trim())
    .join("\n");
  const dns2bToShow = (hideNotes ? stripNotes(dns2b) : dns2b)
    .map((line) => String(line || "").trim())
    .join("\n");

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(
        `📋 Đã copy ${label}${hideNotes ? " (no notes)" : ""} vào clipboard`
      );
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
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            </Form.Group>
          </Col>

          {/* MSS Pool (multi) */}
          <Col md={3}>
            <Form.Group>
              <Form.Label>MSS Pool (tuỳ chọn)</Form.Label>
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={msspoolOptions}
                value={selectedMsspool}
                onChange={setSelectedMsspool}
                placeholder="-- Chọn MSS Pool (nếu cần) --"
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
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            </Form.Group>
          </Col>

          {/* Thứ tự: RNCID → LAC → RAC */}
          <Col md={1}>
            <Form.Group>
              <Form.Label>RNCID</Form.Label>
              <Form.Control
                type="number"
                value={rncid}
                onChange={(e) => setRncid(e.target.value)}
                onPaste={handlePasteTriplets}
                placeholder="VD: 2001"
              />
            </Form.Group>
          </Col>

          <Col md={1}>
            <Form.Group>
              <Form.Label>LAC</Form.Label>
              <Form.Control
                type="number"
                value={lac}
                onChange={(e) => setLac(e.target.value)}
                onPaste={handlePasteTriplets}
                placeholder="VD: 12345"
              />
            </Form.Group>
          </Col>

          <Col md={1}>
            <Form.Group>
              <Form.Label>RAC</Form.Label>
              <Form.Control
                type="number"
                value={rac}
                onChange={(e) => setRac(e.target.value)}
                onPaste={handlePasteTriplets}
                placeholder="VD: 10"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Bảng batch các dòng dán được */}
        {batchRows.length > 0 && (
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-semibold">
                  Đã dán{" "}
                  <span className="text-primary">{batchRows.length}</span> dòng
                </div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={clearBatch}
                >
                  Xoá batch
                </Button>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>#</th>
                      <th>RNCID</th>
                      <th>LAC</th>
                      <th>RAC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((r, idx) => (
                      <tr key={`${r.rncid}-${r.lac}-${r.rac}-${idx}`}>
                        <td>{idx + 1}</td>
                        <td>{r.rncid}</td>
                        <td>{r.lac}</td>
                        <td>{r.rac}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-muted small mt-1">
                Tất cả các dòng trong bảng sẽ được gửi khi bấm <b>Check</b> hoặc{" "}
                <b>Generate TMP</b>.
              </div>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          <Col>
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

              <Button
                variant="warning"
                onClick={handleGenerateTmp}
                disabled={loading}
                title="Sinh lệnh TMP từ [rncid, lac, rac] + MME (+ MSS Pool nếu có)"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Generating...
                  </>
                ) : (
                  "Generate TMP"
                )}
              </Button>

              {/* ✅ Toggle remove notes */}
              <Button
                variant={hideNotes ? "outline-dark" : "dark"}
                onClick={() => setHideNotes((v) => !v)}
                title={hideNotes ? "Show notes" : "Remove notes"}
              >
                {hideNotes ? "Show notes" : "Remove notes"}
              </Button>

              <Button variant="success" onClick={handleAdd}>
                Add
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="secondary" onClick={handleClear}>
                Clear textboxs
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="mb-1">
                  Kết quả DNS1B{" "}
                  {hideNotes && <span className="text-muted">(no notes)</span>}
                </Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns1bToShow, "DNS1B")}
                >
                  Copy DNS1B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns1bToShow}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="mb-1">
                  Kết quả DNS2B{" "}
                  {hideNotes && <span className="text-muted">(no notes)</span>}
                </Form.Label>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleCopy(dns2bToShow, "DNS2B")}
                >
                  Copy DNS2B
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={30}
                value={dns2bToShow}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Dnslacracrnc;
