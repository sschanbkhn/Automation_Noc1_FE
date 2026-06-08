import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";

import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

// ⚠️ chỉnh lại path nếu khác
import {
  addConnectionConfig,
  addConnectionTypeQuick,
  addNodeQuick,
  addPrefixReceiveQuick,
  addPrefixSendQuick,
  addRealmQuick,
  addServiceQuick,
  addTgrpQuick,
  fetchSbcOptions,
} from "../../../redux/Sbc/sbcConnectionSlice";

const CreateConnectionForm = () => {
  const dispatch = useDispatch();
  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  }, []);

  const {
    connectionTypes = [],
    services = [],
    realms = [],
    nodes = [],
    tgrps = [],
    prefixSends = [],
    prefixReceives = [],
    loadingOptions = false,
    submitting = false,
  } = useSelector((state) => state.sbcConnection || {});

  const [formData, setFormData] = useState({
    partner: "",
    realm: "",
    service: "",
    connection_type: "",
    node: "",
    tgrp: "",
    prefix_send: "",
    prefix_receive: "",
    // Danh sách nhiều Session-Agent, mỗi SA có nhiều dải RTP
    sessionAgentsList: [
      {
        hostname: "",
        ip_sip: "",
        subnet_sip: "",
        max_sessions: "",
        rtp_ranges: [
          {
            ip_rtp: "",
            subnet_rtp: "",
          },
        ],
      },
    ],
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateText, setTemplateText] = useState("");

  useEffect(() => {
    dispatch(fetchSbcOptions());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ========== Helpers ==========
  const findLabel = (list, id, idKey = "id", labelKey = "name") => {
    if (!id) return "";
    const item = list.find((x) => String(x[idKey]) === String(id));
    return item ? item[labelKey] : "";
  };

  // ========== options ==========
  const realmOptions = realms.map((r) => ({ value: r.id, label: r.name }));
  const connectionTypeOptions = connectionTypes.map((t) => ({
    value: t.id,
    label: t.name,
  }));
  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const nodeOptions = nodes.map((n) => ({ value: n.id, label: n.name }));

  const tgrpOptions = tgrps.map((t) => ({ value: t.id, label: t.name }));
  const prefixSendOptions = prefixSends.map((p) => ({
    value: p.id,
    label: p.value,
  }));
  const prefixReceiveOptions = prefixReceives.map((p) => ({
    value: p.id,
    label: p.value,
  }));

  // ========== Creatable handlers ==========
  const handleRealmChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, realm: "" }));
      return;
    }
    if (option.__isNew__) {
      dispatch(addRealmQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, realm: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, realm: String(option.value) }));
    }
  };

  const handleConnectionTypeChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, connection_type: "" }));
    } else if (option.__isNew__) {
      dispatch(addConnectionTypeQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, connection_type: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, connection_type: String(option.value) }));
    }
  };

  const handleServiceChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, service: "" }));
    } else if (option.__isNew__) {
      dispatch(addServiceQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, service: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, service: String(option.value) }));
    }
  };

  const handleNodeChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, node: "" }));
    } else if (option.__isNew__) {
      dispatch(addNodeQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, node: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, node: String(option.value) }));
    }
  };

  const handleTgrpChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, tgrp: "" }));
    } else if (option.__isNew__) {
      dispatch(addTgrpQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, tgrp: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, tgrp: String(option.value) }));
    }
  };

  const handlePrefixSendChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, prefix_send: "" }));
    } else if (option.__isNew__) {
      dispatch(addPrefixSendQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, prefix_send: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, prefix_send: String(option.value) }));
    }
  };

  const handlePrefixReceiveChange = (option) => {
    if (!option) {
      setFormData((p) => ({ ...p, prefix_receive: "" }));
    } else if (option.__isNew__) {
      dispatch(addPrefixReceiveQuick(option.label))
        .unwrap()
        .then((created) =>
          setFormData((p) => ({ ...p, prefix_receive: String(created.id) }))
        )
        .catch(() => {});
    } else {
      setFormData((p) => ({ ...p, prefix_receive: String(option.value) }));
    }
  };

  // ========== Session Agents list handlers (SA-level) ==========
  const handleAgentChange = (index, field, value) => {
    setFormData((prev) => {
      const clone = [...prev.sessionAgentsList];
      clone[index] = { ...clone[index], [field]: value };
      return { ...prev, sessionAgentsList: clone };
    });
  };

  const addAgentRow = () => {
    setFormData((prev) => ({
      ...prev,
      sessionAgentsList: [
        ...prev.sessionAgentsList,
        {
          hostname: "",
          ip_sip: "",
          subnet_sip: "",
          max_sessions: "",
          rtp_ranges: [
            {
              ip_rtp: "",
              subnet_rtp: "",
            },
          ],
        },
      ],
    }));
  };

  const removeAgentRow = (index) => {
    setFormData((prev) => {
      const clone = [...prev.sessionAgentsList];
      if (clone.length <= 1) return prev; // ít nhất 1 SA
      clone.splice(index, 1);
      return { ...prev, sessionAgentsList: clone };
    });
  };

  // ========== RTP ranges handlers (theo từng SA) ==========
  const handleRtpChange = (saIndex, rIndex, field, value) => {
    setFormData((prev) => {
      const agents = [...prev.sessionAgentsList];
      const sa = { ...agents[saIndex] };
      const ranges = [...(sa.rtp_ranges || [])];
      ranges[rIndex] = { ...ranges[rIndex], [field]: value };
      sa.rtp_ranges = ranges;
      agents[saIndex] = sa;
      return { ...prev, sessionAgentsList: agents };
    });
  };

  const addRtpRange = (saIndex) => {
    setFormData((prev) => {
      const agents = [...prev.sessionAgentsList];
      const sa = { ...agents[saIndex] };
      sa.rtp_ranges = [
        ...(sa.rtp_ranges || []),
        { ip_rtp: "", subnet_rtp: "" },
      ];
      agents[saIndex] = sa;
      return { ...prev, sessionAgentsList: agents };
    });
  };

  const removeRtpRange = (saIndex, rIndex) => {
    setFormData((prev) => {
      const agents = [...prev.sessionAgentsList];
      const sa = { ...agents[saIndex] };
      if ((sa.rtp_ranges || []).length <= 1) return prev; // ít nhất 1 dải RTP
      sa.rtp_ranges = sa.rtp_ranges.filter((_, i) => i !== rIndex);
      agents[saIndex] = sa;
      return { ...prev, sessionAgentsList: agents };
    });
  };

  // ========== Build template trực tiếp từ form ==========
  const buildTemplateFromForm = () => {
    const partner = (formData.partner || "").trim();
    const realmName = findLabel(realms, formData.realm, "id", "name");
    const serviceName = findLabel(services, formData.service, "id", "name");
    const ctName = findLabel(
      connectionTypes,
      formData.connection_type,
      "id",
      "name"
    );
    const tgrpName = findLabel(tgrps, formData.tgrp, "id", "name");

    const descParts = [];
    if (partner) descParts.push(partner);
    if (realmName) descParts.push(realmName);
    if (serviceName) descParts.push(serviceName);
    if (ctName) descParts.push(ctName);
    const description = descParts.join("---");

    const agentsClean = formData.sessionAgentsList
      .map((a) => ({
        hostname: (a.hostname || "").trim(),
        ip_sip: (a.ip_sip || "").trim(),
        subnet_sip: (a.subnet_sip || "").trim(),
        max_sessions: (a.max_sessions || "").trim(),
      }))
      .filter((a) => a.hostname);

    if (!agentsClean.length) {
      return "# Chưa nhập Session-Agent nào.";
    }

    const allLines = [];

    // --------- SESSION-AGENT blocks ----------
    agentsClean.forEach((ag, idx) => {
      if (idx > 0) allLines.push("");
      allLines.push("conf t");
      allLines.push("session-router");
      allLines.push("session-agent");
      allLines.push("");
      allLines.push(`hostname ${ag.hostname}`);
      allLines.push(`ip-address ${ag.ip_sip}`);
      if (realmName) allLines.push(`realm-id ${realmName}`);
      if (description) allLines.push(`description ${description}`);
      if (ag.max_sessions) allLines.push(`max-sessions ${ag.max_sessions}`);
      allLines.push("");
      allLines.push("ping-method OPTIONS");
      allLines.push("ping-interval 20");
      allLines.push("options ping-failure-count=3");
      allLines.push("stop-recurse 486-487");
      allLines.push("ping-response enabled");
      allLines.push("in-manipulationid SIP_IN");
      allLines.push("out-manipulationid SIP_TMG_OUT");
      if (tgrpName) allLines.push(`trunk-group ${tgrpName}`);
      allLines.push("trigger-oos-alarm enabled");
      allLines.push("");
      allLines.push("done");
      allLines.push("exit");
      allLines.push("exit");
      allLines.push("exit");
      allLines.push("");
      allLines.push("verify-config");
      allLines.push("save-config");
      allLines.push("activate-config");
    });

    // --------- SESSION-GROUP block ----------
    const saNames = agentsClean.map((a) => a.hostname);
    const destValue = saNames.length ? `(${saNames.join(" ")})` : "()";

    allLines.push("");
    allLines.push("conf t");
    allLines.push("session-router");
    allLines.push("session-group");
    allLines.push("");

    if (tgrpName) allLines.push(`group-name ${tgrpName}`);
    if (description) allLines.push(`description ${description}`);
    allLines.push("strategy RoundRobin");
    allLines.push(`dest ${destValue}`);
    if (tgrpName) allLines.push(`trunk-group ${tgrpName}`);
    allLines.push("sag-recursion enabled");
    allLines.push("");
    allLines.push("done");
    allLines.push("exit");
    allLines.push("exit");
    allLines.push("exit");
    allLines.push("");
    allLines.push("verify");
    allLines.push("save-config");
    allLines.push("activate-config");

    return allLines.join("\n");
  };

  const handleGenerateTemplate = () => {
    const tpl = buildTemplateFromForm();
    setTemplateText(tpl);
    setShowTemplateModal(true);
  };

  // ========== Submit: build payload đúng schema backend ==========
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.connection_type || !formData.realm || !formData.service) {
      alert("Vui lòng chọn Connection Type, Realm và Service");
      return;
    }

    const rawAgents = formData.sessionAgentsList || [];

    // DEBUG: xem dữ liệu trước khi build payload
    console.log("DEBUG SA list raw:", rawAgents);

    const session_agents_payload = rawAgents
      .map((a) => {
        const hostname = (a.hostname || "").trim();
        const ip_sip = (a.ip_sip || "").trim();
        const subnet_sip = (a.subnet_sip || "").trim();
        const max_sessions =
          a.max_sessions !== undefined && a.max_sessions !== null
            ? Number(a.max_sessions)
            : null;

        const rtp_ranges_payload = (a.rtp_ranges || [])
          .map((r) => {
            const ip_rtp = (r.ip_rtp || "").trim();
            const subnet_rtp = (r.subnet_rtp || "").trim();
            if (!ip_rtp || !subnet_rtp) return null;
            return { ip_rtp, subnet_rtp };
          })
          .filter(Boolean);

        return {
          hostname,
          ip_sip,
          subnet_sip,
          max_sessions,
          rtp_ranges_payload,
        };
      })
      // ❗ Nới lỏng điều kiện: chỉ cần SA đủ thông tin cơ bản, còn RTP để backend check tiếp
      .filter(
        (a) =>
          a.hostname &&
          a.ip_sip &&
          a.subnet_sip &&
          a.max_sessions !== null &&
          !Number.isNaN(a.max_sessions)
      );

    console.log("DEBUG SA payload gửi lên:", session_agents_payload);

    if (!session_agents_payload.length) {
      alert("Vui lòng nhập ít nhất 1 Session-Agent đầy đủ thông tin");
      return;
    }

    const payload = {
      partner_name: formData.partner,
      connection_type: formData.connection_type
        ? Number(formData.connection_type)
        : null,
      realm: formData.realm ? Number(formData.realm) : null,
      service: formData.service ? Number(formData.service) : null,
      node: formData.node ? Number(formData.node) : null,
      tgrp: formData.tgrp ? Number(formData.tgrp) : null,
      prefix_send: formData.prefix_send ? Number(formData.prefix_send) : null,
      prefix_receive: formData.prefix_receive
        ? Number(formData.prefix_receive)
        : null,
      session_agents_payload,
    };

    console.log("DEBUG payload cuối cùng:", payload);

    dispatch(addConnectionConfig(payload));
  };

  // ========== Render ==========
  return (
    <>
      <TopNavbar />
      <Container
        className="my-5 bg-white p-4 rounded shadow"
        style={{ maxWidth: 1200 }}
      >
        <h4 className="fw-bold text-primary mb-4">
          Phiếu Tạo Kết Nối Với Đối Tác Nước Ngoài
        </h4>

        {loadingOptions && (
          <div className="mb-3 text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Đang tải danh mục kết nối...
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Partner + Realm */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Đối tác: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="partner"
                  value={formData.partner}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  REALM: <span className="text-danger">*</span>
                </Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn hoặc nhập Realm..."
                  value={
                    realmOptions.find(
                      (o) => String(o.value) === formData.realm
                    ) || null
                  }
                  options={realmOptions}
                  onChange={handleRealmChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Service + ConnectionType */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Service: <span className="text-danger">*</span>
                </Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn hoặc nhập Service..."
                  value={
                    serviceOptions.find(
                      (o) => String(o.value) === formData.service
                    ) || null
                  }
                  options={serviceOptions}
                  onChange={handleServiceChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Connection Type:</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn hoặc nhập Connection Type..."
                  value={
                    connectionTypeOptions.find(
                      (o) => String(o.value) === formData.connection_type
                    ) || null
                  }
                  options={connectionTypeOptions}
                  onChange={handleConnectionTypeChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Node */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Node SBC:</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn hoặc nhập Node..."
                  value={
                    nodeOptions.find(
                      (o) => String(o.value) === formData.node
                    ) || null
                  }
                  options={nodeOptions}
                  onChange={handleNodeChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>{/* reserved */}</Col>
          </Row>

          {/* TGRP + Prefix */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>TGRP (10 digit):</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="VD: SIPEZNIDDI"
                  value={
                    tgrpOptions.find(
                      (o) => String(o.value) === formData.tgrp
                    ) || null
                  }
                  options={tgrpOptions}
                  onChange={handleTgrpChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Prefix gửi đối tác:</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="VD: +CC+AC+SUB"
                  value={
                    prefixSendOptions.find(
                      (o) => String(o.value) === formData.prefix_send
                    ) || null
                  }
                  options={prefixSendOptions}
                  onChange={handlePrefixSendChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Prefix đối tác gửi:</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="VD: +CC+AC+SUB"
                  value={
                    prefixReceiveOptions.find(
                      (o) => String(o.value) === formData.prefix_receive
                    ) || null
                  }
                  options={prefixReceiveOptions}
                  onChange={handlePrefixReceiveChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Danh sách Session-Agent */}
          <Row className="mb-3">
            <Col md={12}>
              <h5 className="mt-3 mb-2">Danh sách Session-Agent</h5>
            </Col>
          </Row>

          {formData.sessionAgentsList.map((sa, idx) => (
            <div key={idx} className="border rounded p-3 mb-3">
              <Row className="mb-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Session Agent</Form.Label>
                    <Form.Control
                      value={sa.hostname}
                      onChange={(e) =>
                        handleAgentChange(idx, "hostname", e.target.value)
                      }
                      placeholder="VD: OREIDDBP21"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>IP SIP</Form.Label>
                    <Form.Control
                      value={sa.ip_sip}
                      onChange={(e) =>
                        handleAgentChange(idx, "ip_sip", e.target.value)
                      }
                      placeholder="VD: 193.251.159.33"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Subnet SIP</Form.Label>
                    <Form.Control
                      value={sa.subnet_sip}
                      onChange={(e) =>
                        handleAgentChange(idx, "subnet_sip", e.target.value)
                      }
                      placeholder="VD: 255.255.255.255"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Max sess</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      value={sa.max_sessions}
                      onChange={(e) =>
                        handleAgentChange(idx, "max_sessions", e.target.value)
                      }
                      placeholder="VD: 90"
                    />
                  </Form.Group>
                </Col>
                <Col
                  md={1}
                  className="d-flex align-items-end justify-content-center"
                >
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeAgentRow(idx)}
                    disabled={formData.sessionAgentsList.length <= 1}
                  >
                    ✕
                  </Button>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={12} className="d-flex justify-content-between">
                  <strong>Dải RTP</strong>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => addRtpRange(idx)}
                  >
                    ➕ Thêm dải RTP
                  </Button>
                </Col>
              </Row>

              {(sa.rtp_ranges || []).map((r, rIndex) => (
                <Row className="mb-2" key={rIndex}>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>IP RTP</Form.Label>
                      <Form.Control
                        value={r.ip_rtp}
                        onChange={(e) =>
                          handleRtpChange(idx, rIndex, "ip_rtp", e.target.value)
                        }
                        placeholder="VD: 193.251.159.34"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Subnet RTP</Form.Label>
                      <Form.Control
                        value={r.subnet_rtp}
                        onChange={(e) =>
                          handleRtpChange(
                            idx,
                            rIndex,
                            "subnet_rtp",
                            e.target.value
                          )
                        }
                        placeholder="VD: 255.255.255.255"
                      />
                    </Form.Group>
                  </Col>
                  <Col
                    md={2}
                    className="d-flex align-items-end justify-content-start"
                  >
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeRtpRange(idx, rIndex)}
                      disabled={(sa.rtp_ranges || []).length <= 1}
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          ))}

          <Row className="mb-3">
            <Col md={12}>
              <Button variant="outline-success" size="sm" onClick={addAgentRow}>
                ➕ Thêm Session-Agent
              </Button>
            </Col>
          </Row>

          <div className="text-end mt-4 d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="outline-secondary"
              className="me-2"
              onClick={handleGenerateTemplate}
            >
              📝 Generate Template
            </Button>

            {isAdmin && (
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang tạo kết nối...
                  </>
                ) : (
                  "Tạo Kết Nối"
                )}
              </Button>
            )}
          </div>
        </Form>
      </Container>

      {/* Modal hiển thị template */}
      <Modal
        show={showTemplateModal}
        onHide={() => setShowTemplateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Template cấu hình SBC</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Câu lệnh</Form.Label>
            <Form.Control
              as="textarea"
              rows={24}
              value={templateText}
              readOnly
              style={{ fontFamily: "monospace" }}
            />
          </Form.Group>
          <Button
            className="mt-3"
            onClick={() => {
              if (navigator.clipboard && templateText) {
                navigator.clipboard.writeText(templateText);
                alert("Đã copy template vào clipboard");
              }
            }}
          >
            📋 Copy Template
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateConnectionForm;
