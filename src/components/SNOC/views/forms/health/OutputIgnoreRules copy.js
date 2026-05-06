import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  FormControl,
  InputGroup,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";

import {
  createOutputIgnoreRule,
  deleteOutputIgnoreRule,
  fetchOutputIgnoreRules,
  patchOutputIgnoreRule,
} from "../../../redux/Healthcheck/outputIgnoreSlice";

import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const MODE_OPTIONS = [
  { label: "LINE (1 dòng)", value: "LINE" },
  { label: "BLOCK (cụm)", value: "BLOCK" },
];

const OP_OPTIONS = [
  { label: "EQUALS", value: "EQUALS" },
  { label: "CONTAINS", value: "CONTAINS" },
  { label: "STARTSWITH", value: "STARTSWITH" },
  { label: "ENDSWITH", value: "ENDSWITH" },
];

const DEFAULT_FORM = {
  platform: "*",
  usecase: "healthcheck",
  command_prefix: "*",

  enabled: true,
  case_insensitive: true,
  mode: "BLOCK",

  line_op: "CONTAINS",
  line_text: "",

  block_start_op: "STARTSWITH",
  block_start_text: "",
  block_end_op: "EQUALS",
  block_end_text: "END",

  reason: "",
};

function buildPayload(form) {
  const base = {
    host: "*", // override lúc submit
    platform: form.platform || "*",
    usecase: form.usecase || "*",
    command_prefix: form.command_prefix || "*",
    enabled: !!form.enabled,
    case_insensitive: !!form.case_insensitive,
    mode: form.mode,
    reason: form.reason || "",
  };

  if (form.mode === "LINE") {
    return {
      ...base,
      line_op: form.line_op,
      line_text: (form.line_text || "").trim(),
    };
  }

  return {
    ...base,
    block_start_op: form.block_start_op,
    block_start_text: (form.block_start_text || "").trim(),
    block_end_op: form.block_end_op || "EQUALS",
    block_end_text: (form.block_end_text || "END").trim(),
  };
}

function validateForm(form) {
  if (!form.mode) return "Thiếu mode";
  if (form.mode === "LINE") {
    if (!form.line_op) return "Thiếu line_op";
    if (!form.line_text?.trim()) return "Thiếu line_text";
  } else {
    if (!form.block_start_op) return "Thiếu block_start_op";
    if (!form.block_start_text?.trim()) return "Thiếu block_start_text";
    if (!form.block_end_op) return "Thiếu block_end_op";
    if (!form.block_end_text?.trim()) return "Thiếu block_end_text";
  }
  return null;
}

// ✅ styles y hệt KPIExplorerCore để multi không “giật”
const MULTI_SELECT_STYLES = {
  valueContainer: (base) => ({
    ...base,
    maxHeight: "38px",
    overflowX: "auto",
    flexWrap: "nowrap",
  }),
  multiValue: (base) => ({ ...base, margin: "1px 2px" }),
};

const OutputIgnoreRules = () => {
  const dispatch = useDispatch();

  const {
    platforms = [],
    devices = [],
    loadingDevices = false,
  } = useSelector((state) => state.platformDevice || {});

  const {
    items = [],
    loading = false,
    saving = false,
  } = useSelector((state) => state.outputIgnore || {});

  // Filters + Search
  const [filterEnabled, setFilterEnabled] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [search, setSearch] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState("id"); // id | enabled | host | platform | usecase | command_prefix | mode
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortBy !== field) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  // Form create/edit
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);

  // Platform string (theo Healthcheck)
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // Multi devices (theo KPIExplorerCore)
  const [selectedDevices, setSelectedDevices] = useState([]);

  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchOutputIgnoreRules());
  }, [dispatch]);

  // load devices when platform chosen
  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
    setSelectedDevices([]); // reset devices khi đổi platform
  }, [dispatch, selectedPlatform]);

  // sync form.platform
  useEffect(() => {
    setForm((p) => ({ ...p, platform: selectedPlatform || "*" }));
  }, [selectedPlatform]);

  // device options + __all__
  const deviceOptions = useMemo(() => {
    return devices.map((d) => ({
      label: `${d.name} (${d.ip || "no-ip"})`,
      value: d.name,
    }));
  }, [devices]);

  const combinedDeviceOptions = useMemo(() => {
    return [
      { label: "-- Chọn tất cả thiết bị --", value: "__all__" },
      ...deviceOptions,
    ];
  }, [deviceOptions]);

  const handleDeviceChange = (selected) => {
    if (!selected) return setSelectedDevices([]);
    if (selected.find((opt) => opt.value === "__all__")) {
      setSelectedDevices(deviceOptions); // ✅ chọn tất cả
    } else {
      setSelectedDevices(selected);
    }
  };

  // FILTER + SORT
  const filteredAndSortedItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    // 1) Filter
    let arr = (items || []).filter((r) => {
      if (filterMode && r.mode !== filterMode) return false;
      if (filterEnabled === "1" && !r.enabled) return false;
      if (filterEnabled === "0" && r.enabled) return false;

      if (!q) return true;

      const hay = [
        r.id,
        r.host,
        r.platform,
        r.usecase,
        r.command_prefix,
        r.mode,
        r.line_op,
        r.line_text,
        r.block_start_op,
        r.block_start_text,
        r.block_end_op,
        r.block_end_text,
        r.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });

    // 2) Sort
    const dir = sortDir === "asc" ? 1 : -1;

    const getVal = (r) => {
      switch (sortBy) {
        case "id":
          return Number(r.id) || 0;
        case "enabled":
          return r.enabled ? 1 : 0;
        case "host":
          return (r.host || "").toLowerCase();
        case "platform":
          return (r.platform || "").toLowerCase();
        case "usecase":
          return (r.usecase || "").toLowerCase();
        case "command_prefix":
          return (r.command_prefix || "").toLowerCase();
        case "mode":
          return (r.mode || "").toLowerCase();
        default:
          return (r[sortBy] || "").toLowerCase();
      }
    };

    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return arr;
  }, [items, filterEnabled, filterMode, search, sortBy, sortDir]);

  const onReload = () => dispatch(fetchOutputIgnoreRules());

  const onSubmit = async () => {
    const err = validateForm(form);
    if (err) return alert(err);

    if (!selectedPlatform) return alert("Vui lòng chọn platform");
    if (!selectedDevices || selectedDevices.length === 0)
      return alert("Vui lòng chọn ít nhất 1 host");

    const basePayload = buildPayload(form);

    // UPDATE: chỉ update 1 rule (host đầu tiên)
    if (editingId) {
      const firstHost = selectedDevices[0]?.value;
      await dispatch(
        patchOutputIgnoreRule({
          id: editingId,
          patch: { ...basePayload, host: firstHost },
        })
      );

      setEditingId(null);
      setForm(DEFAULT_FORM);
      setSelectedPlatform("");
      setSelectedDevices([]);
      return;
    }

    // CREATE: bulk create N rules (song song nhanh hơn)
    await Promise.all(
      selectedDevices.map((d) =>
        dispatch(createOutputIgnoreRule({ ...basePayload, host: d.value }))
      )
    );

    setEditingId(null);
    setForm(DEFAULT_FORM);
    setSelectedPlatform("");
    setSelectedDevices([]);
  };

  const onEdit = (r) => {
    setEditingId(r.id);

    setForm({
      platform: r.platform ?? "*",
      usecase: r.usecase ?? "healthcheck",
      command_prefix: r.command_prefix ?? "*",
      enabled: !!r.enabled,
      case_insensitive: !!r.case_insensitive,
      mode: r.mode ?? "BLOCK",

      line_op: r.line_op ?? "CONTAINS",
      line_text: r.line_text ?? "",

      block_start_op: r.block_start_op ?? "STARTSWITH",
      block_start_text: r.block_start_text ?? "",
      block_end_op: r.block_end_op ?? "EQUALS",
      block_end_text: r.block_end_text ?? "END",

      reason: r.reason ?? "",
    });

    // platform string
    setSelectedPlatform(r.platform && r.platform !== "*" ? r.platform : "");

    // chọn device list = 1 host hiện tại
    setSelectedDevices(
      r.host && r.host !== "*" ? [{ label: r.host, value: r.host }] : []
    );

    if (r.platform && r.platform !== "*") {
      dispatch(fetchDevicesByPlatform(r.platform));
    }
  };

  const onCancel = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setSelectedPlatform("");
    setSelectedDevices([]);
  };

  const onToggleEnabled = async (r) => {
    await dispatch(
      patchOutputIgnoreRule({ id: r.id, patch: { enabled: !r.enabled } })
    );
  };

  const onDelete = async (r) => {
    if (!window.confirm(`Xoá rule #${r.id}?`)) return;
    await dispatch(deleteOutputIgnoreRule(r.id));
  };

  const modeValue =
    MODE_OPTIONS.find((x) => x.value === form.mode) || MODE_OPTIONS[1];
  const lineOpValue =
    OP_OPTIONS.find((x) => x.value === form.line_op) || OP_OPTIONS[1];
  const bsOpValue =
    OP_OPTIONS.find((x) => x.value === form.block_start_op) || OP_OPTIONS[2];
  const beOpValue =
    OP_OPTIONS.find((x) => x.value === form.block_end_op) || OP_OPTIONS[0];

  return (
    <>
      <TopNavbarHealth />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <Card.Title as="h5" className="mb-0">
                Output Ignore Rules (CRUD)
              </Card.Title>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={onReload}
                  disabled={loading || saving}
                >
                  Reload
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {/* CREATE / EDIT */}
              <Card className="mb-3">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Form.Label>Mode</Form.Label>
                      <Select
                        options={MODE_OPTIONS}
                        value={modeValue}
                        onChange={(opt) =>
                          setForm((p) => ({ ...p, mode: opt.value }))
                        }
                      />
                    </Col>

                    {/* Platform dropdown theo Healthcheck */}
                    <Col md={3}>
                      <Form.Label>Platform</Form.Label>
                      <InputGroup>
                        <FormControl
                          as="select"
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="custom-select"
                        >
                          <option value="">-- Chọn platform --</option>
                          {platforms.map((p, idx) => (
                            <option key={idx} value={p?.name}>
                              {p?.name} ({p?.device_count ?? 0})
                            </option>
                          ))}
                        </FormControl>
                      </InputGroup>
                    </Col>

                    {/* Devices dropdown theo KPIExplorerCore */}
                    <Col md={5}>
                      <Form.Label>Host (node)</Form.Label>
                      <Select
                        isMulti
                        isSearchable
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        options={combinedDeviceOptions}
                        value={selectedDevices}
                        onChange={handleDeviceChange}
                        placeholder="-- Chọn thiết bị --"
                        isDisabled={!selectedPlatform}
                        isLoading={loadingDevices}
                        styles={MULTI_SELECT_STYLES}
                      />
                      {editingId ? (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          * Update chỉ áp cho <b>host đầu tiên</b> trong list.
                        </div>
                      ) : null}
                    </Col>

                    <Col md={2}>
                      <Form.Label>Usecase</Form.Label>
                      <FormControl
                        value={form.usecase}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, usecase: e.target.value }))
                        }
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={2}>
                      <Form.Label>Cmd prefix</Form.Label>
                      <FormControl
                        value={form.command_prefix}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            command_prefix: e.target.value,
                          }))
                        }
                        placeholder="allip / strsp / *"
                      />
                    </Col>

                    <Col md={3}>
                      <Form.Label>Flags</Form.Label>
                      <div className="d-flex gap-3">
                        <Form.Check
                          type="checkbox"
                          label="Enabled"
                          checked={!!form.enabled}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              enabled: e.target.checked,
                            }))
                          }
                        />
                        <Form.Check
                          type="checkbox"
                          label="CI"
                          checked={!!form.case_insensitive}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              case_insensitive: e.target.checked,
                            }))
                          }
                        />
                      </div>
                    </Col>

                    {form.mode === "LINE" ? (
                      <>
                        <Col md={2}>
                          <Form.Label>line_op</Form.Label>
                          <Select
                            options={OP_OPTIONS}
                            value={lineOpValue}
                            onChange={(opt) =>
                              setForm((p) => ({ ...p, line_op: opt.value }))
                            }
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>line_text</Form.Label>
                          <FormControl
                            value={form.line_text}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                line_text: e.target.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>Reason</Form.Label>
                          <FormControl
                            value={form.reason}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, reason: e.target.value }))
                            }
                          />
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col md={2}>
                          <Form.Label>start_op</Form.Label>
                          <Select
                            options={OP_OPTIONS}
                            value={bsOpValue}
                            onChange={(opt) =>
                              setForm((p) => ({
                                ...p,
                                block_start_op: opt.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>start_text</Form.Label>
                          <FormControl
                            value={form.block_start_text}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                block_start_text: e.target.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>end_op</Form.Label>
                          <Select
                            options={OP_OPTIONS}
                            value={beOpValue}
                            onChange={(opt) =>
                              setForm((p) => ({
                                ...p,
                                block_end_op: opt.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>end_text</Form.Label>
                          <FormControl
                            value={form.block_end_text}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                block_end_text: e.target.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>Reason</Form.Label>
                          <FormControl
                            value={form.reason}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, reason: e.target.value }))
                            }
                          />
                        </Col>
                      </>
                    )}
                  </Row>

                  <Row className="mt-3">
                    <Col className="d-flex gap-2">
                      <Button
                        variant={editingId ? "warning" : "primary"}
                        onClick={onSubmit}
                        disabled={saving}
                      >
                        {saving ? (
                          <Spinner size="sm" animation="border" />
                        ) : editingId ? (
                          "Update"
                        ) : (
                          "Create"
                        )}
                      </Button>

                      {editingId ? (
                        <Button
                          variant="outline-secondary"
                          onClick={onCancel}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* FILTERS + SEARCH */}
              <Row className="mb-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Search</InputGroup.Text>
                    <FormControl
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="gõ để lọc theo host/platform/cmd/text/reason..."
                    />
                  </InputGroup>
                </Col>

                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Enabled</InputGroup.Text>
                    <FormControl
                      as="select"
                      value={filterEnabled}
                      onChange={(e) => setFilterEnabled(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </FormControl>
                  </InputGroup>
                </Col>

                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Mode</InputGroup.Text>
                    <FormControl
                      as="select"
                      value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="LINE">LINE</option>
                      <option value="BLOCK">BLOCK</option>
                    </FormControl>
                  </InputGroup>
                </Col>
              </Row>

              {/* TABLE */}
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table responsive hover bordered className="table-sm">
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("id")}
                      >
                        ID <span className="text-muted">{sortIcon("id")}</span>
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("enabled")}
                      >
                        Status{" "}
                        <span className="text-muted">
                          {sortIcon("enabled")}
                        </span>
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("host")}
                      >
                        Host{" "}
                        <span className="text-muted">{sortIcon("host")}</span>
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("platform")}
                      >
                        Platform{" "}
                        <span className="text-muted">
                          {sortIcon("platform")}
                        </span>
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("usecase")}
                      >
                        Usecase{" "}
                        <span className="text-muted">
                          {sortIcon("usecase")}
                        </span>
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("command_prefix")}
                      >
                        Cmd{" "}
                        <span className="text-muted">
                          {sortIcon("command_prefix")}
                        </span>
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort("mode")}
                      >
                        Mode{" "}
                        <span className="text-muted">{sortIcon("mode")}</span>
                      </th>

                      <th>Rule</th>
                      <th>Reason</th>
                      <th style={{ width: 240 }}>URD</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedItems.map((r) => (
                      <tr
                        key={r.id}
                        className={!r.enabled ? "table-secondary" : ""}
                      >
                        <td>{r.id}</td>

                        <td>
                          {r.enabled ? (
                            <Badge bg="success">ON</Badge>
                          ) : (
                            <Badge bg="secondary">OFF</Badge>
                          )}
                        </td>

                        <td>{r.host}</td>
                        <td>{r.platform}</td>
                        <td>{r.usecase}</td>

                        <td>{r.command_prefix}</td>
                        <td>{r.mode}</td>

                        <td style={{ whiteSpace: "pre-line" }}>
                          {r.mode === "LINE"
                            ? `${r.line_op} | ${r.line_text}`
                            : `${r.block_start_op} | ${r.block_start_text}\n...\n${r.block_end_op} | ${r.block_end_text}`}
                        </td>

                        <td>{r.reason || ""}</td>

                        <td className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => onEdit(r)}
                            disabled={saving}
                          >
                            Update
                          </Button>

                          <Button
                            size="sm"
                            variant={
                              r.enabled
                                ? "outline-secondary"
                                : "outline-success"
                            }
                            onClick={() => onToggleEnabled(r)}
                            disabled={saving}
                          >
                            {r.enabled ? "Disable" : "Enable"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => onDelete(r)}
                            disabled={saving}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {filteredAndSortedItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted">
                          No rules
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OutputIgnoreRules;
