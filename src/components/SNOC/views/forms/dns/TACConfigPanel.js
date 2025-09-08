// import React, { useState } from "react";
// import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import Select from "react-select";
// import {
//   clearDnsResult,
//   fetchDnsCheckResultTAC,
//   fetchGenerateTmpCommandTAC,
// } from "../../../redux/Dns/dnsSlice";
// import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";

// const TACConfigPanel = () => {
//   const dispatch = useDispatch();

//   const [node, setNode] = useState("dnsgn");
//   const [tac, setTac] = useState("");
//   const [mmeGroups, setMmeGroups] = useState([]);
//   const [sgwGroups, setSgwGroups] = useState([]);
//   const [pgw5gGroups, setPgw5gGroups] = useState([]);
//   const {
//     tacResult = {},
//     tmpCommands = {},
//     loading = false,
//   } = useSelector((state) => state.dns || {});

//   const dns1b = [...(tacResult.dns1b || []), ...(tmpCommands.dns1b || [])];
//   const dns2b = [...(tacResult.dns2b || []), ...(tmpCommands.dns2b || [])];

//   const handleCheck = () => {
//     const tacList = tac
//       .split(",")
//       .map((x) => parseInt(x.trim()))
//       .filter((x) => !isNaN(x));
//     dispatch(
//       fetchDnsCheckResultTAC({
//         platform: node,
//         tacList,
//         filename: "test.db",
//         domain: "epc.mnc002.mcc452.3gppnetwork.org -v RAN",
//       })
//     );
//   };

//   const handleAdd = () => {
//     console.log("Add TAC:", { node, mmeGroups, sgwGroups, tac });
//     // TODO: dispatch thực tế nếu có
//   };

//   const handleDelete = () => {
//     console.log("Delete TAC:", { node, mmeGroups, sgwGroups, tac });
//     // TODO: xử lý sau
//   };

//   const handleCreateTmp = () => {
//     const tacList = tac
//       .split(",")
//       .map((x) => parseInt(x.trim()))
//       .filter((x) => !isNaN(x));

//     dispatch(
//       fetchGenerateTmpCommandTAC({
//         tacList,
//         mmeList: mmeGroups, // ✅ Đúng key
//         sgwList: sgwGroups, // ✅ Đúng key
//         pgw5gList: pgw5gGroups, // ✅ Gửi thêm PGW 5G vào API
//       })
//     );
//   };

//   const handleClear = () => {
//     setTac("");
//     dispatch(clearDnsResult());
//   };

//   const handleCopy = (lines, label) => {
//     const text = lines.join("\n");
//     navigator.clipboard.writeText(text).then(() => {
//       alert(`📋 Đã copy ${label} vào clipboard`);
//     });
//   };

//   const mmeOptions = [
//     "mme1x",
//     "mmee1a",
//     "mmee1b",
//     "mmee1c",
//     "mmee1d",
//     "mmee1e",
//     "mmee1f",
//     "mmee1g",
//     "mmee1h",
//     "mmee1i",
//     "mmee1k",
//   ].map((v) => ({ value: v, label: v }));

//   const sgwOptions = [
//     "epge1a",
//     "epge1b",
//     "epge1c",
//     "epge1d",
//     "epgce1e",
//     "epgce1f",
//     "epgce1g",
//     "epgce1h",
//     "epgce1i",
//     "epgce1k",
//     "epg1x",
//     "epg1x5g",
//     "epg2x",
//     "epg2x5g",
//     "epg3x",
//     "epg3x5g",
//     "epg4x",
//     "epg4x5g",
//   ].map((v) => ({ value: v, label: v }));
//   const pgw5gOptions = ["epg1x5g", "epg2x5g", "epg3x5g", "epg4x5g"].map(
//     (v) => ({ value: v, label: v })
//   );
//   return (
//     <>
//       <TopNavbarDns />
//       <Form className="p-3">
//         <Row className="mb-3">
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>Node</Form.Label>
//               <Form.Select
//                 value={node}
//                 onChange={(e) => setNode(e.target.value)}
//               >
//                 <option value="dnsgn">dnsgn</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={3}>
//             <Form.Group>
//               <Form.Label>TAC (cách nhau bởi dấu phẩy)</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={tac}
//                 onChange={(e) => setTac(e.target.value)}
//                 placeholder="VD: 30211, 12345"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
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
//               <Button variant="success" onClick={handleAdd}>
//                 Add
//               </Button>
//               <Button variant="danger" onClick={handleDelete}>
//                 Delete
//               </Button>

//               <Button variant="secondary" onClick={handleClear}>
//                 Clear cache dns
//               </Button>
//             </div>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>Group MME</Form.Label>
//               <Select
//                 isMulti
//                 options={mmeOptions}
//                 value={mmeOptions.filter((opt) =>
//                   mmeGroups.includes(opt.value)
//                 )}
//                 onChange={(selected) =>
//                   setMmeGroups(selected.map((s) => s.value))
//                 }
//               />
//             </Form.Group>
//           </Col>
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>PGW Pool</Form.Label>
//               <Select
//                 isMulti
//                 options={sgwOptions}
//                 value={sgwOptions.filter((opt) =>
//                   sgwGroups.includes(opt.value)
//                 )}
//                 onChange={(selected) =>
//                   setSgwGroups(selected.map((s) => s.value))
//                 }
//               />
//             </Form.Group>
//           </Col>
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>PGW 5G Pool</Form.Label>
//               <Select
//                 isMulti
//                 options={pgw5gOptions}
//                 value={pgw5gOptions.filter((opt) =>
//                   pgw5gGroups.includes(opt.value)
//                 )}
//                 onChange={(selected) =>
//                   setPgw5gGroups(selected.map((s) => s.value))
//                 }
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Label>Phím chức năng</Form.Label>
//             <div className="d-flex gap-2 flex-wrap">
//               <Button variant="warning" onClick={handleCreateTmp}>
//                 Generate TMP
//               </Button>
//               <Button variant="secondary" onClick={handleClear}>
//                 Clear textbox
//               </Button>
//             </div>
//           </Col>
//         </Row>

//         <Row className="mb-4">
//           <Col md={6}>
//             <Form.Group>
//               <div className="d-flex justify-content-between align-items-center">
//                 <Form.Label className="mb-1">Kết quả DNS1B</Form.Label>
//                 <Button
//                   size="sm"
//                   variant="outline-secondary"
//                   onClick={() => handleCopy(dns1b, "DNS1B")}
//                 >
//                   Copy DNS1B
//                 </Button>
//               </div>
//               <Form.Control
//                 as="textarea"
//                 rows={30}
//                 value={dns1b.join("\n")}
//                 readOnly
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group>
//               <div className="d-flex justify-content-between align-items-center">
//                 <Form.Label className="mb-1">Kết quả DNS2B</Form.Label>
//                 <Button
//                   size="sm"
//                   variant="outline-secondary"
//                   onClick={() => handleCopy(dns2b, "DNS2B")}
//                 >
//                   Copy DNS2B
//                 </Button>
//               </div>
//               <Form.Control
//                 as="textarea"
//                 rows={30}
//                 value={dns2b.join("\n")}
//                 readOnly
//               />
//             </Form.Group>
//           </Col>
//         </Row>
//       </Form>
//     </>
//   );
// };

// export default TACConfigPanel;


// src/components/DNS/TACConfigPanel.jsx
import React, { useMemo, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  clearDnsResult,
  fetchDnsCheckResultTAC,
  fetchGenerateTmpCommandTAC,
} from "../../../redux/Dns/dnsSlice";
import TopNavbarDns from "../../dashboard/DashOrigin/TopNavbarDns";

const TACConfigPanel = () => {
  const dispatch = useDispatch();

  const [node, setNode] = useState("dnsgn");

  // ✅ TAC quay về nguyên gốc: chuỗi nhập tay
  const [tac, setTac] = useState("");

  // Dropdown theo mẫu KPIExplorerUnified: lưu mảng option objects
  const [selectedMme, setSelectedMme] = useState([]);
  const [selectedSgw, setSelectedSgw] = useState([]);
  const [selectedPgw5g, setSelectedPgw5g] = useState([]);

  const { tacResult = {}, tmpCommands = {}, loading = false } =
    useSelector((state) => state.dns || {});

  const dns1b = [...(tacResult.dns1b || []), ...(tmpCommands.dns1b || [])];
  const dns2b = [...(tacResult.dns2b || []), ...(tmpCommands.dns2b || [])];

  const mmeOptions = useMemo(
    () =>
      [
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
      ].map((v) => ({ label: v, value: v })),
    []
  );

  const sgwOptions = useMemo(
    () =>
      [
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
      ].map((v) => ({ label: v, value: v })),
    []
  );

  const pgw5gOptions = useMemo(
    () => ["epg1x5g", "epg2x5g", "epg3x5g", "epg4x5g"].map((v) => ({ label: v, value: v })),
    []
  );

  // Sentinel “Chọn tất cả” đồng bộ với KPIExplorerUnified
  const ALL_OPT = { label: "-- Chọn tất cả --", value: "__all__" };
  const mmeOptionsCombined = useMemo(() => [ALL_OPT, ...mmeOptions], [mmeOptions]);
  const sgwOptionsCombined = useMemo(() => [ALL_OPT, ...sgwOptions], [sgwOptions]);
  const pgw5gOptionsCombined = useMemo(() => [ALL_OPT, ...pgw5gOptions], [pgw5gOptions]);

  // Handlers theo mẫu device select
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

  // Parse TAC giống bản gốc: chuyển chuỗi -> mảng số
  const parseTacList = (text) =>
    text
      .split(/[,\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => Number.isFinite(x));

  // Actions
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
    dispatch(clearDnsResult());
  };

  const handleClearTAC = () => setTac("");

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
        {/* Row 1: Node + TAC (nguyên gốc) + Buttons */}
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
              <Button variant="secondary" onClick={handleClearTAC}>Clear TAC</Button>
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
                  onClick={() => handleCopy(dns1b, "DNS1B")}
                >
                  Copy DNS1B
                </Button>
              </div>
              <Form.Control as="textarea" rows={30} value={dns1b.join("\n")} readOnly />
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
              <Form.Control as="textarea" rows={30} value={dns2b.join("\n")} readOnly />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default TACConfigPanel;
