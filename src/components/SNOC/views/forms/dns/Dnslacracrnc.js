// // src/components/DNS/Dnslacracrnc.jsx
// import React, { useMemo, useState } from "react";
// import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import Select from "react-select";
// import {
//   clearDnsResult,
//   fetchDnsCheckResult3G,
//   fetchGenerateTmpRNC, // ✅ thunk Generate TMP RNC
// } from "../../../redux/Dns/dnsSlice";
// import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";

// const Dnslacracrnc = () => {
//   const dispatch = useDispatch();

//   const [selectedNode, setSelectedNode] = useState("dnsgn");

//   // GIỮ NGUYÊN OPTIONS MME NHƯ CODE GỐC (kể cả mục lặp)
//   const MME_VALUES = useMemo(
//     () => [
//       "mmee1a",
//       "mmee1b",
//       "mmee1c",
//       "mmee1d",
//       "mmee1e",
//       "mmee1f",
//       "mmee1g",
//       "mmee1h",
//       "mmee1i",
//       "mmee1k",
//       "mmee3c",
//       "mmee3c",
//       "mmee3c",
//       "mmee3d",
//       "mmee2a",
//       "mmee2b",
//       "mmee2c",
//       "mmee2d",
//       "mmee2e",
//       "mmee2f",
//       "mmee2g",
//       "mmee2h",
//       "mmeeet1a",
//       "mmeeet1b",
//     ],
//     []
//   );
//   const mmeOptions = useMemo(
//     () => MME_VALUES.map((v) => ({ label: v, value: v })),
//     [MME_VALUES]
//   );
//   const ALL_OPT = { label: "-- Chọn tất cả --", value: "__all__" };
//   const mmeOptionsCombined = useMemo(
//     () => [ALL_OPT, ...mmeOptions],
//     [mmeOptions]
//   );

//   // ✅ MSS Pool options (multi-select)
//   const MSSPOOL_VALUES = useMemo(
//     () => [
//       "msspool",
//       "msspool_1",
//       "mssectogw",
//       "tsse1x",
//       "tsse2x",
//       "msse1e",
//       "msse1e_1",
//       "msse1f",
//       "msse1f_1",
//       "vmsse1g",
//       "vmsse1g_1",
//       "vmsse1h",
//       "vmsse1h_1",
//       "mssn1b",
//       "mssn1b_1",
//       "msse3a",
//       "msse3a_1",
//       "msse3b",
//       "msse3b_1",
//       "msse3c",
//       "msse3c_1",
//       "vmsse3d",
//       "vmsse3d_1",
//       "vmsse3e",
//       "vmsse3e_1",
//       "mssn3c",
//       "mssn3c_1",
//       "msse2f",
//       "msse2g",
//       "vmsse2h",
//       "vmsse2h_1",
//       "vmsse2i",
//       "vmsse2i_1",
//       "mssn2f",
//       "mssn2f_1",
//       "vmsse4e",
//       "vmsse4e_1",
//       "vmsse4f",
//       "vmsse4f_1",
//       "mssn4d",
//       "mssn4d_1",
//       "tsse1b",
//       "tsse1c",
//       "tsse2c",
//       "tsse2d",
//     ],
//     []
//   );
//   const msspoolOptions = useMemo(
//     () => MSSPOOL_VALUES.map((v) => ({ label: v, value: v })),
//     [MSSPOOL_VALUES]
//   );

//   const [selectedMme, setSelectedMme] = useState([]);
//   const [selectedMsspool, setSelectedMsspool] = useState([]); // ✅ MSSPOOL multi

//   // Thứ tự: RNCID → LAC → RAC
//   const [rncid, setRncid] = useState("");
//   const [lac, setLac] = useState("");
//   const [rac, setRac] = useState("");

//   // ✅ Ẩn/hiện note ở 2 textbox
//   const [hideNotes, setHideNotes] = useState(false);

//   const {
//     dns1b = [],
//     dns2b = [],
//     loading = false,
//   } = useSelector((state) => state.dns || {});

//   const handleMmeChange = (selected) => {
//     if (!selected) return setSelectedMme([]);
//     if (selected.find((o) => o.value === "__all__")) {
//       setSelectedMme(mmeOptions); // chọn tất cả
//     } else {
//       setSelectedMme(selected);
//     }
//   };

//   // ===== Parse N dòng Excel theo thứ tự: RNCID, LAC, RAC
//   const parseTripletLines = (raw) => {
//     const lines = (raw || "")
//       .trim()
//       .split(/\r?\n/)
//       .map((l) => l.trim())
//       .filter(Boolean);
//     const rows = [];
//     for (const line of lines) {
//       const splitter = /\t/.test(line) ? /\t+/ : /,/.test(line) ? /,+/ : /\s+/;
//       const toks = line
//         .split(splitter)
//         .map((t) => t.trim())
//         .filter(Boolean);
//       if (toks.length < 3) continue;
//       const nums = toks.filter((t) => /^\d+$/.test(t));
//       const [rncV, lacV, racV] =
//         nums.length >= 3 ? nums.slice(0, 3) : toks.slice(0, 3);
//       rows.push({ rncid: rncV || "", lac: lacV || "", rac: racV || "" });
//     }
//     return rows;
//   };

//   const handlePasteTriplets = (e) => {
//     const text = e.clipboardData?.getData("text") ?? "";
//     if (!/\t|,|\r?\n/.test(text)) return; // để paste thường
//     const rows = parseTripletLines(text);
//     if (rows.length > 0) {
//       e.preventDefault();
//       setBatchRows(rows);
//       setRncid(rows[0].rncid);
//       setLac(rows[0].lac);
//       setRac(rows[0].rac);
//     }
//   };

//   const [batchRows, setBatchRows] = useState([]); // [{rncid,lac,rac}, ...]
//   const clearBatch = () => setBatchRows([]);

//   const toIntOrNull = (v) => {
//     if (v === null || v === undefined) return null;
//     const s = String(v).trim();
//     if (!s) return null;
//     const n = Number(s);
//     return Number.isFinite(n) ? n : null;
//   };

//   const buildSets = () => {
//     if (batchRows.length > 0) {
//       return batchRows.map((r) => [
//         toIntOrNull(r.rncid),
//         toIntOrNull(r.lac),
//         toIntOrNull(r.rac),
//       ]);
//     }
//     return [[toIntOrNull(rncid), toIntOrNull(lac), toIntOrNull(rac)]];
//   };

//   // ✅ Check: gửi nhiều bộ sets nếu có batch
//   const handleCheck = () => {
//     const sets = buildSets();
//     dispatch(
//       fetchDnsCheckResult3G({
//         platform: selectedNode.toLowerCase(),
//         sets, // ← API mới show theo từng [SET #]
//       })
//     );
//   };

//   const handleAdd = () => {
//     console.log("Add:", {
//       selectedNode,
//       selectedMme: selectedMme.map((o) => o.value),
//       selectedMsspool: selectedMsspool.map((o) => o.value),
//       rncid,
//       lac,
//       rac,
//     });
//   };

//   const handleDelete = () => {
//     console.log("Delete:", {
//       selectedNode,
//       selectedMme: selectedMme.map((o) => o.value),
//       selectedMsspool: selectedMsspool.map((o) => o.value),
//       rncid,
//       lac,
//       rac,
//     });
//   };

//   // ✅ Generate TMP (gọi /nornirps/generate-tmp-rnc/ trả về {dns1b, dns2b})
//   // const handleGenerateTmp = () => {
//   //   const mmeList = selectedMme.map((o) => o.value);
//   //   const msspoolList = selectedMsspool.map((o) => o.value);
//   //   if (mmeList.length === 0) {
//   //     alert("Vui lòng chọn ít nhất 1 MME.");
//   //     return;
//   //   }
//   //   const sets = buildSets();
//   //   dispatch(fetchGenerateTmpRNC({ mmeList, sets, msspoolList }));
//   // };
//   const handleGenerateTmp = () => {
//     const mmeList = selectedMme.map((o) => o.value).filter(Boolean); // có thể rỗng
//     const msspoolList = selectedMsspool.map((o) => o.value).filter(Boolean); // có thể rỗng
//     const sets = buildSets(); // [[rncid,lac,rac], ...]

//     if (mmeList.length === 0) {
//       console.warn(
//         "No MME selected — backend sẽ chỉ sinh phần không cần MME (DELETE pair/RNC, MSC POOL nếu có LAC, v.v.)."
//       );
//     }

//     dispatch(fetchGenerateTmpRNC({ mmeList, sets, msspoolList }));
//   };

//   const handleClear = () => {
//     setRncid("");
//     setLac("");
//     setRac("");
//     setBatchRows([]);
//     setSelectedMsspool([]);
//     dispatch(clearDnsResult());
//   };

//   // ✅ Remove notes: filter các dòng bắt đầu bằng #, //, --, REM..., và dòng trống
//   const stripNotes = (arr) =>
//     (arr || []).filter((line) => {
//       const s = String(line || "").trim();
//       if (!s) return false;
//       if (/^(#|\/\/|--|REM\b)/i.test(s)) return false;
//       return true;
//     });

//   const dns1bToShow = (hideNotes ? stripNotes(dns1b) : dns1b)
//     .map((line) => String(line || "").trim())
//     .join("\n");
//   const dns2bToShow = (hideNotes ? stripNotes(dns2b) : dns2b)
//     .map((line) => String(line || "").trim())
//     .join("\n");

//   const handleCopy = (text, label) => {
//     navigator.clipboard.writeText(text).then(() => {
//       alert(
//         `📋 Đã copy ${label}${hideNotes ? " (no notes)" : ""} vào clipboard`
//       );
//     });
//   };

//   return (
//     <>
//       <TopNavbarDns />
//       <Form className="p-3">
//         <Row className="mb-3">
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Node</Form.Label>
//               <Form.Select
//                 value={selectedNode}
//                 onChange={(e) => setSelectedNode(e.target.value)}
//               >
//                 <option value="dnsgn">dnsgn</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>List MME</Form.Label>
//               <Select
//                 isMulti
//                 isSearchable
//                 closeMenuOnSelect={false}
//                 hideSelectedOptions={false}
//                 options={mmeOptionsCombined}
//                 value={selectedMme}
//                 onChange={handleMmeChange}
//                 placeholder="-- Chọn MME --"
//                 styles={{
//                   valueContainer: (base) => ({
//                     ...base,
//                     maxHeight: "38px",
//                     overflowX: "auto",
//                     flexWrap: "nowrap",
//                   }),
//                   multiValue: (base) => ({ ...base, margin: "1px 2px" }),
//                   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                 }}
//                 menuPortalTarget={
//                   typeof document !== "undefined" ? document.body : null
//                 }
//               />
//             </Form.Group>
//           </Col>

//           {/* MSS Pool (multi) */}
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>MSS Pool (tuỳ chọn)</Form.Label>
//               <Select
//                 isMulti
//                 isSearchable
//                 closeMenuOnSelect={false}
//                 hideSelectedOptions={false}
//                 options={msspoolOptions}
//                 value={selectedMsspool}
//                 onChange={setSelectedMsspool}
//                 placeholder="-- Chọn MSS Pool (nếu cần) --"
//                 styles={{
//                   valueContainer: (base) => ({
//                     ...base,
//                     maxHeight: "38px",
//                     overflowX: "auto",
//                     flexWrap: "nowrap",
//                   }),
//                   multiValue: (base) => ({ ...base, margin: "1px 2px" }),
//                   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                 }}
//                 menuPortalTarget={
//                   typeof document !== "undefined" ? document.body : null
//                 }
//               />
//             </Form.Group>
//           </Col>

//           {/* Thứ tự: RNCID → LAC → RAC */}
//           <Col md={1}>
//             <Form.Group>
//               <Form.Label>RNCID</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={rncid}
//                 onChange={(e) => setRncid(e.target.value)}
//                 onPaste={handlePasteTriplets}
//                 placeholder="VD: 2001"
//               />
//             </Form.Group>
//           </Col>

//           <Col md={1}>
//             <Form.Group>
//               <Form.Label>LAC</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={lac}
//                 onChange={(e) => setLac(e.target.value)}
//                 onPaste={handlePasteTriplets}
//                 placeholder="VD: 12345"
//               />
//             </Form.Group>
//           </Col>

//           <Col md={1}>
//             <Form.Group>
//               <Form.Label>RAC</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={rac}
//                 onChange={(e) => setRac(e.target.value)}
//                 onPaste={handlePasteTriplets}
//                 placeholder="VD: 10"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Bảng batch các dòng dán được */}
//         {batchRows.length > 0 && (
//           <Row className="mb-3">
//             <Col>
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <div className="fw-semibold">
//                   Đã dán{" "}
//                   <span className="text-primary">{batchRows.length}</span> dòng
//                 </div>
//                 <Button
//                   size="sm"
//                   variant="outline-secondary"
//                   onClick={clearBatch}
//                 >
//                   Xoá batch
//                 </Button>
//               </div>
//               <div className="table-responsive">
//                 <table className="table table-sm table-bordered mb-0">
//                   <thead>
//                     <tr>
//                       <th style={{ width: 60 }}>#</th>
//                       <th>RNCID</th>
//                       <th>LAC</th>
//                       <th>RAC</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {batchRows.map((r, idx) => (
//                       <tr key={`${r.rncid}-${r.lac}-${r.rac}-${idx}`}>
//                         <td>{idx + 1}</td>
//                         <td>{r.rncid}</td>
//                         <td>{r.lac}</td>
//                         <td>{r.rac}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="text-muted small mt-1">
//                 Tất cả các dòng trong bảng sẽ được gửi khi bấm <b>Check</b> hoặc{" "}
//                 <b>Generate TMP</b>.
//               </div>
//             </Col>
//           </Row>
//         )}

//         <Row className="mb-3">
//           <Col>
//             <Form.Label>Phím chức năng</Form.Label>
//             <div className="d-flex gap-2 flex-wrap">
//               <Button
//                 variant="primary"
//                 onClick={handleCheck}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <Spinner size="sm" animation="border" className="me-2" />
//                     Đang kiểm tra...
//                   </>
//                 ) : (
//                   "Check"
//                 )}
//               </Button>

//               <Button
//                 variant="warning"
//                 onClick={handleGenerateTmp}
//                 disabled={loading}
//                 title="Sinh lệnh TMP từ [rncid, lac, rac] + MME (+ MSS Pool nếu có)"
//               >
//                 {loading ? (
//                   <>
//                     <Spinner size="sm" animation="border" className="me-2" />
//                     Generating...
//                   </>
//                 ) : (
//                   "Generate TMP"
//                 )}
//               </Button>

//               {/* ✅ Toggle remove notes */}
//               <Button
//                 variant={hideNotes ? "outline-dark" : "dark"}
//                 onClick={() => setHideNotes((v) => !v)}
//                 title={hideNotes ? "Show notes" : "Remove notes"}
//               >
//                 {hideNotes ? "Show notes" : "Remove notes"}
//               </Button>

//               <Button variant="success" onClick={handleAdd}>
//                 Add
//               </Button>
//               <Button variant="danger" onClick={handleDelete}>
//                 Delete
//               </Button>
//               <Button variant="secondary" onClick={handleClear}>
//                 Clear textboxs
//               </Button>
//             </div>
//           </Col>
//         </Row>

//         <Row className="mb-4">
//           <Col md={6}>
//             <Form.Group>
//               <div className="d-flex justify-content-between align-items-center">
//                 <Form.Label className="mb-1">
//                   Kết quả DNS1B{" "}
//                   {hideNotes && <span className="text-muted">(no notes)</span>}
//                 </Form.Label>
//                 <Button
//                   size="sm"
//                   variant="outline-secondary"
//                   onClick={() => handleCopy(dns1bToShow, "DNS1B")}
//                 >
//                   Copy DNS1B
//                 </Button>
//               </div>
//               <Form.Control
//                 as="textarea"
//                 rows={30}
//                 value={dns1bToShow}
//                 readOnly
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group>
//               <div className="d-flex justify-content-between align-items-center">
//                 <Form.Label className="mb-1">
//                   Kết quả DNS2B{" "}
//                   {hideNotes && <span className="text-muted">(no notes)</span>}
//                 </Form.Label>
//                 <Button
//                   size="sm"
//                   variant="outline-secondary"
//                   onClick={() => handleCopy(dns2bToShow, "DNS2B")}
//                 >
//                   Copy DNS2B
//                 </Button>
//               </div>
//               <Form.Control
//                 as="textarea"
//                 rows={30}
//                 value={dns2bToShow}
//                 readOnly
//               />
//             </Form.Group>
//           </Col>
//         </Row>
//       </Form>
//     </>
//   );
// };

// export default Dnslacracrnc;

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

  // GIỮ NGUYÊN OPTIONS MME NHƯ CODE GỐC (kể cả mục lặp) → loại trùng khi render
  const MME_VALUES = useMemo(
    () =>
      Array.from(
        new Set([
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
        ])
      ),
    []
  );
  const mmeOptions = useMemo(
    () => MME_VALUES.map((v) => ({ label: v, value: v })),
    [MME_VALUES]
  );
  const ALL_OPT = useMemo(
    () => ({ label: "-- Chọn tất cả --", value: "__all__" }),
    []
  );
  const mmeOptionsCombined = useMemo(
    () => [ALL_OPT, ...mmeOptions],
    [ALL_OPT, mmeOptions]
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

  // ✅ Ẩn/hiện note ở 2 textbox (remove notes)
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

  // ===== Batch nhập liệu linh hoạt =====

  // Parse text -> ma trận số: [[...nums], ...]
  const parseMatrix = (rawText) => {
    const text = String(rawText || "").trim();
    if (!text) return [];
    const lines = text
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
      const nums = toks.filter((t) => /^-?\d+$/.test(t)); // chỉ lấy số
      if (nums.length) rows.push(nums);
    }
    return rows;
  };

  const toIntOrNull = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const toNumOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Điền dữ liệu theo "kiểu"
  const applyByKind = (rowObj, incoming, kind) => {
    const next = { ...rowObj };
    switch (kind) {
      case "FULL": // [rncid, lac, rac]
        next.rncid = toNumOrNull(incoming[0]);
        next.lac = toNumOrNull(incoming[1]);
        next.rac = toNumOrNull(incoming[2]);
        break;
      case "RNCID_LAC": // [rncid, lac]
        next.rncid = toNumOrNull(incoming[0]);
        next.lac = toNumOrNull(incoming[1]);
        break;
      case "LAC_RAC": // [lac, rac]
        next.lac = toNumOrNull(incoming[0]);
        next.rac = toNumOrNull(incoming[1]);
        break;
      case "RNCID_ONLY": // [rncid]
        next.rncid = toNumOrNull(incoming[0]);
        break;
      case "LAC_ONLY": // [lac]
        next.lac = toNumOrNull(incoming[0]);
        break;
      default:
        break;
    }
    return next;
  };

  // Merge batch theo quy tắc
  const mergeBatch = (current, incomingRows, kind) => {
    const cur = Array.isArray(current) ? [...current] : [];

    if (cur.length === 0) {
      return incomingRows.map((arr) =>
        applyByKind({ rncid: null, lac: null, rac: null }, arr, kind)
      );
    }

    if (incomingRows.length === 1) {
      const single = incomingRows[0];
      return cur.map((row) => applyByKind(row, single, kind));
    }

    const maxLen = Math.max(cur.length, incomingRows.length);
    const next = [];
    for (let i = 0; i < maxLen; i++) {
      const base = cur[i] ?? { rncid: null, lac: null, rac: null };
      const inc = incomingRows[i];
      next.push(inc ? applyByKind(base, inc, kind) : base);
    }
    return next;
  };

  const [batchRows, setBatchRows] = useState([]); // [{rncid,lac,rac}, ...]
  const clearBatch = () => setBatchRows([]);

  const syncInputsFromHead = (rows) => {
    if (!rows || !rows.length) return;
    const h = rows[0];
    setRncid(h.rncid ?? "");
    setLac(h.lac ?? "");
    setRac(h.rac ?? "");
  };

  // Paste vào RNCID: 1 cột (RNCID), 2 cột (RNCID,LAC), 3 cột (RNCID,LAC,RAC)
  const handlePasteRNCID = (e) => {
    const text = e.clipboardData?.getData("text") ?? "";
    if (!/\t|,|\r?\n/.test(text)) return; // cho paste 1 giá trị thường
    e.preventDefault();

    const matrix = parseMatrix(text);
    if (!matrix.length) return;

    if (matrix.some((r) => r.length >= 3)) {
      const normalized = matrix.map((r) => [r[0], r[1], r[2]]);
      const merged = mergeBatch(batchRows, normalized, "FULL");
      setBatchRows(merged);
      syncInputsFromHead(merged);
      return;
    }

    if (matrix.every((r) => r.length === 2)) {
      const merged = mergeBatch(batchRows, matrix, "RNCID_LAC");
      setBatchRows(merged);
      syncInputsFromHead(merged);
      return;
    }

    if (matrix.every((r) => r.length === 1)) {
      const merged = mergeBatch(batchRows, matrix, "RNCID_ONLY");
      setBatchRows(merged);
      syncInputsFromHead(merged);
      return;
    }

    // Fallback: coi cột đầu là RNCID
    const singles = matrix.map((r) => [r[0]]);
    const merged = mergeBatch(batchRows, singles, "RNCID_ONLY");
    setBatchRows(merged);
    syncInputsFromHead(merged);
  };

  // Paste vào LAC: 1 cột (LAC), 2 cột (LAC,RAC), 3 cột (RNCID,LAC,RAC)
  const handlePasteLAC = (e) => {
    const text = e.clipboardData?.getData("text") ?? "";
    if (!/\t|,|\r?\n/.test(text)) return; // cho paste 1 giá trị thường
    e.preventDefault();

    const matrix = parseMatrix(text);
    if (!matrix.length) return;

    if (matrix.some((r) => r.length >= 3)) {
      const normalized = matrix.map((r) => [r[0], r[1], r[2]]);
      const merged = mergeBatch(batchRows, normalized, "FULL");
      setBatchRows(merged);
      syncInputsFromHead(merged);
      return;
    }

    if (matrix.every((r) => r.length === 2)) {
      const merged = mergeBatch(batchRows, matrix, "LAC_RAC");
      setBatchRows(merged);
      syncInputsFromHead(merged);
      return;
    }

    if (matrix.every((r) => r.length === 1)) {
      const merged = mergeBatch(batchRows, matrix, "LAC_ONLY");
      setBatchRows(merged);
      syncInputsFromHead(merged);
      return;
    }

    // Trộn lẫn: ưu tiên (LAC,RAC), còn 1 cột map vào LAC
    const twos = matrix.filter((r) => r.length === 2);
    const ones = matrix.filter((r) => r.length === 1);
    let tmp = batchRows;
    if (twos.length) tmp = mergeBatch(tmp, twos, "LAC_RAC");
    if (ones.length) tmp = mergeBatch(tmp, ones, "LAC_ONLY");
    setBatchRows(tmp);
    syncInputsFromHead(tmp);
  };

  // ====== Build sets gửi API ======
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
        sets, // ← API show theo từng [SET #]
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
    const mmeList = selectedMme.map((o) => o.value).filter(Boolean); // có thể rỗng
    const msspoolList = selectedMsspool.map((o) => o.value).filter(Boolean); // có thể rỗng
    const sets = buildSets(); // [[rncid,lac,rac], ...]

    if (mmeList.length === 0) {
      console.warn(
        "No MME selected — backend sẽ chỉ sinh phần không cần MME (DELETE pair/RNC, MSC POOL nếu có LAC, v.v.)."
      );
    }

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

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      alert(
        `📋 Đã copy ${label}${hideNotes ? " (no notes)" : ""} vào clipboard`
      );
    } else {
      alert(
        `⚠️ Không copy được ${label}. 
- Nếu đang mở qua IP LAN (http://10.x...), hãy dùng http://localhost hoặc bật HTTPS.
- Hoặc thử copy thủ công (Ctrl/Cmd + A rồi Ctrl/Cmd + C).`
      );
    }
  };

  // ====== Notes-only colorize (giữ nền như textarea Bootstrap) ======
  const isNoteLine = (s) => /^(#|\/\/|--|REM\b)/i.test(String(s || "").trim());

  const CodePaneNotes = ({ text, height = 520 }) => {
    const lines = String(text || "").split("\n");
    const styleBase = {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontSize: 13,
      margin: 0,
      color: "inherit", // theo theme Bootstrap (#212529)
    };
    // Dùng palette gần Bootstrap
    const colors = {
      gutterBg: "rgba(0,0,0,0.03)", // rất nhạt, giống bg-muted
      faint: "#6c757d", // text-muted
      noteBg: "#fff3cd", // bg-warning-subtle
      noteFg: "#664d03", // text-warning-emphasis
    };

    return (
      // form-control để kế thừa nền, viền, radius của textarea Bootstrap
      <div className="form-control p-0" style={{ height }}>
        {/* grid 2 cột: số dòng + nội dung */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr",
            height: "100%",
          }}
        >
          {/* cột số dòng */}
          <div
            style={{
              background: colors.gutterBg,
              color: colors.faint,
              padding: "8px 6px",
              overflowY: "auto",
            }}
          >
            {lines.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styleBase,
                  textAlign: "right",
                  color: colors.faint,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* nội dung */}
          <div style={{ padding: 8, overflowY: "auto" }}>
            {lines.map((l, i) => {
              const isNote = isNoteLine(l);
              if (isNote) {
                return (
                  <div key={i} style={{ ...styleBase }}>
                    <span
                      style={{
                        background: colors.noteBg,
                        color: colors.noteFg,
                        padding: "2px 6px",
                        borderRadius: 6,
                        display: "inline-block",
                        maxWidth: "100%",
                      }}
                    >
                      {l || " "}
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={styleBase}>
                  {l || " "}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Copy-clipboard bền vững: ưu tiên Clipboard API, fallback execCommand
  const copyToClipboard = async (text) => {
    try {
      const normalized = String(text ?? "");
      if (!normalized) return false;

      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(normalized);
        return true;
      }

      // Fallback cho HTTP/LAN hoặc trình duyệt cũ
      const ta = document.createElement("textarea");
      ta.value = normalized;
      // tránh scroll nhảy
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.left = "-1000px";
      ta.setAttribute("readonly", "");
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand("copy"); // trả về true/false
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      console.error("copyToClipboard error:", e);
      return false;
    }
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
                onPaste={handlePasteRNCID}
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
                onPaste={handlePasteLAC}
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
                  disabled={!dns1bToShow?.trim()}
                >
                  Copy DNS1B
                </Button>
              </div>
              {/* Hiển thị với highlight notes */}
              <CodePaneNotes text={dns1bToShow} height={520} />
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
                  disabled={!dns1bToShow?.trim()}
                >
                  Copy DNS2B
                </Button>
              </div>
              {/* Hiển thị với highlight notes */}
              <CodePaneNotes text={dns2bToShow} height={520} />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Dnslacracrnc;
