import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion, Badge, Button, Card, Col, Form,
  InputGroup, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  deleteAnalysisParam, fetchAnalysisParams, fetchAnalysisSchema,
  saveAnalysisParam, setSelectedPlatform,
} from "../../../redux/Healthcheck/analysisParamSlice";
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── helpers ──────────────────────────────────────────────────────────────────

const draftKey = (fnKey, paramName) => `${fnKey}::${paramName}`;

// Returns list of SSH files relevant to a platform name, or null = show all.
const getPlatformFiles = (platformName) => {
  if (!platformName || platformName === "*") return null;
  const p = platformName.toLowerCase().replace(/-/g, "_");
  if (p.includes("pgw"))  return ["ssh_nornir.py"];
  if (p.includes("mme"))  return ["sshmmee.py"];
  if (p.includes("pcrf")) return ["ssh_nornir_pcrf.py"];
  if (p.includes("mss"))  return ["ssh_nornir_mss.py"];
  if (p.includes("tss"))  return ["ssh_nornir_tss.py"];
  if (p.includes("hss"))  return ["ssh_nornir_hss.py"];
  if (p.includes("sbc"))  return ["ssh_sbc.py"];
  if (p.includes("dns"))  return ["dns.py"];
  if (p.includes("cudb")) return ["ssh_nornir_cudb.py"];
  if (p.includes("ims") || p.includes("sbg")) return ["ssh_nornir_ims.py"];
  if (p.includes("fda"))  return ["fda.py"];
  if (p.includes("hlr"))  return ["healthcheck_hlr.py"];
  return null;
};

const fmtValue = (val) => {
  if (val === null || val === undefined) return "—";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
};

const parseValue = (raw, type) => {
  if (type === "int")      return parseInt(raw, 10);
  if (type === "float")    return parseFloat(raw);
  if (type === "bool")     return Boolean(raw);
  if (type === "str_list") {
    return typeof raw === "string"
      ? raw.split(",").map((s) => s.trim()).filter(Boolean)
      : raw;
  }
  return raw;
};

const toInputValue = (val, type) => {
  if (type === "str_list") return Array.isArray(val) ? val.join(", ") : String(val ?? "");
  return val ?? "";
};

// ── component ─────────────────────────────────────────────────────────────────

const AnalysisParams = () => {
  const dispatch = useDispatch();

  const { schema, params, selectedPlatform, loadingSchema, loadingParams, saving } =
    useSelector((s) => s.analysisParam);
  const { platforms } = useSelector((s) => s.platformDevice);

  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser === true;
  }, []);

  const [drafts, setDrafts] = useState({});
  const [search, setSearch]   = useState("");

  // load schema + platforms once
  useEffect(() => {
    dispatch(fetchAnalysisSchema());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // load params when platform changes, clear drafts
  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchAnalysisParams(selectedPlatform));
      setDrafts({});
    }
  }, [dispatch, selectedPlatform]);

  // overrideMap: "fnKey::paramName" → row from params API
  const overrideMap = useMemo(() => {
    const m = {};
    for (const row of params) {
      m[draftKey(row.function_name, row.param_name)] = row;
    }
    return m;
  }, [params]);

  const platformOptions = useMemo(() => [
    { value: "*", label: "* (Global — áp dụng mọi platform)" },
    ...platforms.map((p) => ({ value: p.name, label: p.name })),
  ], [platforms]);

  const selectedOption = useMemo(
    () => platformOptions.find((o) => o.value === selectedPlatform) || null,
    [platformOptions, selectedPlatform]
  );

  // all functions for the selected platform, filtered by platform + search
  const fnEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const relevantFiles = getPlatformFiles(selectedPlatform);
    return Object.entries(schema)
      .filter(([, s]) => !relevantFiles || relevantFiles.includes(s.file))
      .filter(([key, s]) => {
        if (!q) return true;
        return key.toLowerCase().includes(q) || s.label.toLowerCase().includes(q);
      });
  }, [schema, search, selectedPlatform]);

  const overrideCount = useMemo(
    () => params.filter((r) => r.override_id !== null).length,
    [params]
  );

  // ── draft helpers ─────────────────────────────────────────────────────────

  const getDisplayValue = (fnKey, pname, pschema) => {
    const key = draftKey(fnKey, pname);
    if (key in drafts) return drafts[key];
    const row = overrideMap[key];
    return toInputValue(row ? row.effective_value : pschema.default, pschema.type);
  };

  const setDraft = (fnKey, pname, value) =>
    setDrafts((d) => ({ ...d, [draftKey(fnKey, pname)]: value }));

  const clearDraft = (fnKey, pname) =>
    setDrafts((d) => { const n = { ...d }; delete n[draftKey(fnKey, pname)]; return n; });

  // ── actions ───────────────────────────────────────────────────────────────

  const handleSave = async (fnKey, pname, pschema) => {
    const key = draftKey(fnKey, pname);
    const raw = drafts[key]; // only called when dirty
    const value = parseValue(raw, pschema.type);
    await dispatch(saveAnalysisParam({ platform: selectedPlatform, function_name: fnKey, param_name: pname, value }));
    clearDraft(fnKey, pname);
    dispatch(fetchAnalysisParams(selectedPlatform));
  };

  const handleReset = async (fnKey, pname) => {
    const row = overrideMap[draftKey(fnKey, pname)];
    if (!row?.override_id) return;
    await dispatch(deleteAnalysisParam(row.override_id));
    clearDraft(fnKey, pname);
    dispatch(fetchAnalysisParams(selectedPlatform));
  };

  // ── render helpers ────────────────────────────────────────────────────────

  const renderInput = (fnKey, pname, pschema) => {
    const val     = getDisplayValue(fnKey, pname, pschema);
    const disabled = !isAdmin || !selectedPlatform || saving;

    if (pschema.type === "bool") {
      return (
        <Form.Check
          type="switch"
          checked={val === true || val === "true"}
          onChange={(e) => setDraft(fnKey, pname, e.target.checked)}
          disabled={disabled}
        />
      );
    }
    if (pschema.type === "str_list") {
      return (
        <Form.Control
          type="text"
          size="sm"
          style={{ minWidth: 200 }}
          value={val}
          onChange={(e) => setDraft(fnKey, pname, e.target.value)}
          disabled={disabled}
          placeholder="value1, value2..."
        />
      );
    }
    return (
      <Form.Control
        type="number"
        size="sm"
        style={{ width: 120 }}
        value={val}
        step={pschema.type === "float" ? 0.1 : 1}
        min={pschema.min_val ?? undefined}
        max={pschema.max_val ?? undefined}
        onChange={(e) => setDraft(fnKey, pname, e.target.value)}
        disabled={disabled}
      />
    );
  };

  const renderParamTable = (fnKey, fnSchema) => (
    <Table responsive bordered size="sm" className="mb-0 align-middle">
      <thead className="table-light">
        <tr>
          <th style={{ width: "22%" }}>Tham số</th>
          <th style={{ width: "7%" }}>Kiểu</th>
          <th style={{ width: "14%" }}>Default</th>
          <th style={{ width: "18%" }}>Override hiện tại</th>
          <th>Giá trị mới</th>
          {isAdmin && <th style={{ width: 145 }}>Hành động</th>}
        </tr>
      </thead>
      <tbody>
        {Object.entries(fnSchema.params).map(([pname, pschema]) => {
          const key          = draftKey(fnKey, pname);
          const row          = overrideMap[key];
          const hasOverride  = row && row.override_id !== null;
          const isGlobal     = hasOverride && row.is_global_override;
          const isDirty      = key in drafts;
          // can reset: override exists AND (it's platform-specific OR we're on the global platform)
          const canReset     = hasOverride && !(isGlobal && selectedPlatform !== "*");

          return (
            <tr key={pname} className={hasOverride ? "table-warning" : ""}>
              <td>
                <code className="small">{pname}</code>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                  {pschema.label}
                  {pschema.unit ? ` (${pschema.unit})` : ""}
                </div>
              </td>

              <td>
                <Badge bg="secondary" className="small">{pschema.type}</Badge>
              </td>

              <td className="font-monospace small text-muted">
                {fmtValue(pschema.default)}
              </td>

              <td className="small">
                {hasOverride ? (
                  <>
                    <span className="fw-bold">
                      {fmtValue(row.effective_value)}
                    </span>
                    {isGlobal && (
                      <Badge bg="info" className="ms-1 small">Global ↑</Badge>
                    )}
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>

              <td>{renderInput(fnKey, pname, pschema)}</td>

              {isAdmin && (
                <td>
                  <div className="d-flex gap-1">
                    <Button
                      size="sm"
                      variant={isDirty ? "primary" : "outline-secondary"}
                      onClick={() => handleSave(fnKey, pname, pschema)}
                      disabled={saving || !isDirty}
                    >
                      {saving ? <Spinner size="sm" animation="border" /> : "Lưu"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleReset(fnKey, pname)}
                      disabled={saving || !canReset}
                      title={
                        !hasOverride       ? "Không có override"
                        : isGlobal && selectedPlatform !== "*"
                          ? "Override này là global — vào tab * để reset"
                          : "Reset về default"
                      }
                    >
                      Reset
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  // ── main render ───────────────────────────────────────────────────────────

  return (
    <>
      <TopNavbarHealth />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                ⚙️ Analysis Parameters
                {selectedPlatform && overrideCount > 0 && (
                  <Badge bg="warning" text="dark" className="ms-2">
                    {overrideCount} override
                  </Badge>
                )}
              </Card.Title>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => selectedPlatform && dispatch(fetchAnalysisParams(selectedPlatform))}
                disabled={loadingParams || !selectedPlatform}
              >
                Reload
              </Button>
            </Card.Header>

            <Card.Body>
              {/* Controls */}
              <Row className="mb-3 g-2">
                <Col md={6}>
                  <Form.Label className="fw-bold">Platform</Form.Label>
                  <Select
                    options={platformOptions}
                    value={selectedOption}
                    onChange={(opt) => dispatch(setSelectedPlatform(opt?.value || ""))}
                    placeholder="-- Chọn platform để xem / sửa params --"
                    isClearable
                    isSearchable
                  />
                  {!isAdmin && selectedPlatform && (
                    <small className="text-muted">
                      Chế độ xem — chỉ super user mới có thể sửa
                    </small>
                  )}
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold">Tìm hàm phân tích</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="tên hàm hoặc label..."
                      disabled={!selectedPlatform}
                    />
                  </InputGroup>
                </Col>
              </Row>

              {/* Empty state */}
              {!selectedPlatform && (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: "2rem" }}>⚙️</div>
                  <div>Chọn platform để xem và cấu hình các ngưỡng phân tích healthcheck</div>
                  <div className="small mt-1">
                    Chọn <code>* (Global)</code> để đặt ngưỡng áp dụng cho tất cả platform
                  </div>
                </div>
              )}

              {/* Loading */}
              {selectedPlatform && (loadingParams || loadingSchema) && (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              )}

              {/* Accordion */}
              {selectedPlatform && !loadingParams && !loadingSchema && (
                fnEntries.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    Không tìm thấy hàm nào{search ? ` khớp với "${search}"` : " có tham số cấu hình"}
                  </div>
                ) : (
                  <>
                    <div className="text-muted small mb-2">
                      {fnEntries.length} hàm phân tích
                      {" "}({fnEntries.filter(([, s]) => Object.keys(s.params).length > 0).length} có tham số cấu hình)
                      {search && ` — lọc từ "${search}"`}
                    </div>
                    <Accordion>
                      {fnEntries.map(([fnKey, fnSchema], idx) => {
                        const fnHasOverride = Object.keys(fnSchema.params).some((pname) => {
                          const row = overrideMap[draftKey(fnKey, pname)];
                          return row && row.override_id !== null;
                        });
                        const fnHasDraft = Object.keys(fnSchema.params).some(
                          (pname) => draftKey(fnKey, pname) in drafts
                        );

                        return (
                          <Accordion.Item key={fnKey} eventKey={String(idx)}>
                            <Accordion.Header>
                              <span className="me-2 fw-semibold">{fnSchema.label}</span>
                              <Badge bg="light" text="dark" className="me-2 border small font-monospace">
                                {fnKey}
                              </Badge>
                              {fnSchema.command_patterns?.map((cmd) => (
                                <Badge key={cmd} bg="dark" className="me-1 small font-monospace fw-normal">
                                  {cmd}
                                </Badge>
                              ))}
                              {Object.keys(fnSchema.params).length === 0 ? (
                                <Badge bg="light" text="muted" className="me-2 border small fst-italic">
                                  no params
                                </Badge>
                              ) : (
                                <Badge bg="light" text="secondary" className="me-2 border small">
                                  {Object.keys(fnSchema.params).length} param
                                </Badge>
                              )}
                              {fnHasOverride && (
                                <Badge bg="warning" text="dark" className="small me-1">overridden</Badge>
                              )}
                              {fnHasDraft && (
                                <Badge bg="primary" className="small">unsaved</Badge>
                              )}
                            </Accordion.Header>
                            <Accordion.Body className="p-0">
                              {Object.keys(fnSchema.params).length === 0 ? (
                                <div className="px-3 py-2 text-muted small fst-italic">
                                  Hàm này không có tham số cấu hình (ngưỡng cố định trong code)
                                </div>
                              ) : renderParamTable(fnKey, fnSchema)}
                              {(fnSchema.criteria || fnSchema.sample_output) && (
                                <div className="px-3 pb-3 pt-2 border-top bg-light">
                                  {fnSchema.criteria && (
                                    <div className="mb-2">
                                      <span className="fw-semibold text-secondary small">
                                        Tiêu chí phân tích:{" "}
                                      </span>
                                      <span className="small">{fnSchema.criteria}</span>
                                    </div>
                                  )}
                                  {fnSchema.sample_output && (
                                    <div>
                                      <div className="fw-semibold text-secondary small mb-1">
                                        Output mẫu:
                                      </div>
                                      <pre
                                        className="mb-0 p-2 border rounded small bg-white"
                                        style={{
                                          maxHeight: 140,
                                          overflowY: "auto",
                                          whiteSpace: "pre-wrap",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {fnSchema.sample_output}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  </>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AnalysisParams;
