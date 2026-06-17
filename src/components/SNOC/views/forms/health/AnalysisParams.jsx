import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion, Badge, Button, Card, Col, Form,
  InputGroup, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  deleteAnalysisParam, fetchAnalysisParams, fetchAnalysisSchema,
  fetchDeviceSummary, saveAnalysisParam, setSelectedDevice, setSelectedPlatform,
} from "../../../redux/Healthcheck/analysisParamSlice";
import { fetchDevicesByPlatform, fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── helpers ──────────────────────────────────────────────────────────────────

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const draftKey = (fnKey, paramName) => `${fnKey}::${paramName}`;

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

  const { schema, params, deviceSummary, selectedPlatform, selectedDevice,
    loadingSchema, loadingParams, saving } =
    useSelector((s) => s.analysisParam);
  const { platforms, devicesByPlatform } = useSelector((s) => s.platformDevice);

  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser === true || claims?.role === "admin";
  }, []);

  const [drafts, setDrafts]           = useState({});
  const [search, setSearch]           = useState("");
  const [onlyOverridden, setOnlyOverridden] = useState(false);

  // load platforms once
  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // load devices + device summary when platform changes (skip for * global)
  useEffect(() => {
    if (selectedPlatform && selectedPlatform !== "*") {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
      dispatch(fetchDeviceSummary(selectedPlatform));
    }
  }, [dispatch, selectedPlatform]);

  // load schema + params when platform/device changes, clear drafts + filters
  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchAnalysisSchema(selectedPlatform));
      dispatch(fetchAnalysisParams({ platform: selectedPlatform, device_name: selectedDevice }));
      setDrafts({});
      setOnlyOverridden(false);
    }
  }, [dispatch, selectedPlatform, selectedDevice]);

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

  const deviceOptions = useMemo(() => {
    const devs = devicesByPlatform[selectedPlatform] || [];
    return [
      { value: "", label: "— Tất cả thiết bị (platform-level) —" },
      ...devs.map((d) => ({ value: d.name, label: d.name })),
    ];
  }, [devicesByPlatform, selectedPlatform]);

  const selectedPlatformOption = useMemo(
    () => platformOptions.find((o) => o.value === selectedPlatform) || null,
    [platformOptions, selectedPlatform]
  );

  const selectedDeviceOption = useMemo(
    () => deviceOptions.find((o) => o.value === selectedDevice) || deviceOptions[0] || null,
    [deviceOptions, selectedDevice]
  );

  // all functions for the selected platform (schema already filtered by backend),
  // then by search and onlyOverridden toggle
  const fnEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    let entries = Object.entries(schema).filter(([key, s]) => {
      if (!q) return true;
      return key.toLowerCase().includes(q) || s.label.toLowerCase().includes(q);
    });
    if (onlyOverridden) {
      entries = entries.filter(([fnKey, fnSchema]) =>
        Object.keys(fnSchema.params).some((pname) => {
          const row = overrideMap[draftKey(fnKey, pname)];
          return row && row.override_id !== null;
        })
      );
    }
    return entries;
  }, [schema, search, onlyOverridden, overrideMap]);

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
    const raw = drafts[key];
    const value = parseValue(raw, pschema.type);
    await dispatch(saveAnalysisParam({
      platform: selectedPlatform,
      device_name: selectedDevice,
      function_name: fnKey,
      param_name: pname,
      value,
    }));
    clearDraft(fnKey, pname);
    dispatch(fetchAnalysisParams({ platform: selectedPlatform, device_name: selectedDevice }));
    // refresh device summary sau khi save (vì có thể có device override mới)
    if (selectedPlatform && selectedPlatform !== "*") {
      dispatch(fetchDeviceSummary(selectedPlatform));
    }
  };

  const handleReset = async (fnKey, pname) => {
    const row = overrideMap[draftKey(fnKey, pname)];
    if (!row?.override_id) return;
    await dispatch(deleteAnalysisParam(row.override_id));
    clearDraft(fnKey, pname);
    dispatch(fetchAnalysisParams({ platform: selectedPlatform, device_name: selectedDevice }));
    if (selectedPlatform && selectedPlatform !== "*") {
      dispatch(fetchDeviceSummary(selectedPlatform));
    }
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

  const renderOverrideBadge = (row) => {
    if (!row || row.override_id === null) return <span className="text-muted">—</span>;
    const layer = row.override_layer;
    return (
      <>
        <span className="fw-bold">{fmtValue(row.effective_value)}</span>
        {layer === "device"   && <Badge bg="success"  className="ms-1 small">Device ↑</Badge>}
        {layer === "platform" && <Badge bg="primary"  className="ms-1 small">Platform ↑</Badge>}
        {layer === "global"   && <Badge bg="info"     className="ms-1 small">Global ↑</Badge>}
      </>
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
          const overrideLayer = row?.override_layer;
          const isDirty      = key in drafts;
          // chỉ cho reset khi override này thuộc về scope đang chọn
          const canReset = hasOverride && (
            (selectedDevice  && overrideLayer === "device") ||
            (!selectedDevice && overrideLayer === "platform") ||
            (selectedPlatform === "*" && overrideLayer === "global")
          );

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
                {renderOverrideBadge(row)}
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
                        !hasOverride ? "Không có override"
                        : !canReset   ? "Override này thuộc scope khác — chuyển tab để reset"
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
                {selectedDevice && (
                  <Badge bg="success" className="ms-2 small">
                    {selectedDevice}
                  </Badge>
                )}
              </Card.Title>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => selectedPlatform && dispatch(fetchAnalysisParams({ platform: selectedPlatform, device_name: selectedDevice }))}
                disabled={loadingParams || !selectedPlatform}
              >
                Reload
              </Button>
            </Card.Header>

            <Card.Body>
              {/* Controls */}
              <Row className="mb-3 g-2 align-items-end">
                <Col md={4}>
                  <Form.Label className="fw-bold">Platform</Form.Label>
                  <Select
                    styles={SELECT_STYLES}
                    options={platformOptions}
                    value={selectedPlatformOption}
                    onChange={(opt) => dispatch(setSelectedPlatform(opt?.value || ""))}
                    placeholder="-- Chọn platform --"
                    isClearable
                  />
                  {!isAdmin && selectedPlatform && (
                    <small className="text-muted">
                      Chế độ xem — chỉ admin trở lên mới có thể sửa
                    </small>
                  )}
                </Col>

                {selectedPlatform && selectedPlatform !== "*" && (
                  <Col md={3}>
                    <Form.Label className="fw-bold">
                      Thiết bị{" "}
                      <span className="text-muted fw-normal">(tùy chọn)</span>
                    </Form.Label>
                    <Select
                      styles={SELECT_STYLES}
                      options={deviceOptions}
                      value={selectedDeviceOption}
                      onChange={(opt) => dispatch(setSelectedDevice(opt?.value || ""))}
                      placeholder="-- Tất cả thiết bị (platform-level) --"
                      isClearable
                    />
                    {selectedDevice && (
                      <small className="text-success">
                        Override device sẽ thắng platform và global
                      </small>
                    )}
                  </Col>
                )}

                <Col md={selectedPlatform && selectedPlatform !== "*" ? 3 : 6}>
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

                <Col md="auto" className="d-flex align-items-end pb-1">
                  <Form.Check
                    type="switch"
                    id="only-overridden"
                    label={
                      <span className="small fw-semibold">
                        Chỉ hiện có override
                        {onlyOverridden && overrideCount > 0 && (
                          <Badge bg="warning" text="dark" className="ms-1">{overrideCount}</Badge>
                        )}
                      </span>
                    }
                    checked={onlyOverridden}
                    onChange={(e) => setOnlyOverridden(e.target.checked)}
                    disabled={!selectedPlatform}
                    className="mb-0"
                  />
                </Col>
              </Row>

              {/* Device Override Summary — hiển thị thiết bị có cấu hình riêng */}
              {selectedPlatform && selectedPlatform !== "*" && deviceSummary.length > 0 && (
                <div className="mb-3 p-2 border rounded bg-light">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small fw-semibold text-nowrap">
                      Thiết bị có cấu hình riêng ({deviceSummary.length}):
                    </span>
                    {deviceSummary.map((d) => {
                      const isActive = selectedDevice === d.device_name;
                      return (
                        <span
                          key={d.device_name}
                          onClick={() => dispatch(setSelectedDevice(isActive ? "" : d.device_name))}
                          style={{ cursor: "pointer" }}
                          title={`${d.count} override — click để xem chi tiết`}
                        >
                          <Badge
                            bg={isActive ? "success" : "light"}
                            text={isActive ? undefined : "success"}
                            className="small border"
                            style={{ borderColor: "#198754 !important", fontSize: "0.8rem" }}
                          >
                            {d.device_name}
                            <span className="ms-1 opacity-75">({d.count})</span>
                          </Badge>
                        </span>
                      );
                    })}
                    {selectedDevice && (
                      <Button
                        size="sm"
                        variant="link"
                        className="p-0 text-muted small"
                        onClick={() => dispatch(setSelectedDevice(""))}
                      >
                        ✕ Xem tất cả
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!selectedPlatform && (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: "2rem" }}>⚙️</div>
                  <div>Chọn platform để xem và cấu hình các ngưỡng phân tích healthcheck</div>
                  <div className="small mt-1">
                    Chọn <code>* (Global)</code> để đặt ngưỡng áp dụng cho tất cả platform.
                    Chọn thiết bị cụ thể để đặt ngưỡng riêng cho từng thiết bị.
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
                    {onlyOverridden
                      ? "Không có hàm nào đang có override" + (search ? ` khớp với "${search}"` : "")
                      : `Không tìm thấy hàm nào${search ? ` khớp với "${search}"` : " có tham số cấu hình"}`
                    }
                  </div>
                ) : (
                  <>
                    <div className="text-muted small mb-2">
                      {fnEntries.length} hàm phân tích
                      {" "}({fnEntries.filter(([, s]) => Object.keys(s.params).length > 0).length} có tham số cấu hình)
                      {search && ` — lọc từ "${search}"`}
                      {onlyOverridden && " — chỉ hiện có override"}
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
