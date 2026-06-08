// src/components/SNOC/Sbc/ConnectionConfigList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Pagination,
  Row,
  Spinner,
  Table,
  Tooltip,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";

import {
  addConnectionConfig,
  addConnectionTypeQuick,
  addNodeQuick,
  addPartnerGroupQuick,
  addPartnerQuick,
  addPrefixReceiveQuick,
  addPrefixSendQuick,
  addRealmQuick,
  addServiceQuick,
  addTgrpQuick,
  assignPartnerPairs,
  deleteConnectionConfig,
  fetchConnectionConfigs,
  fetchPartnerGroups,
  fetchPartners,
  fetchSbcOptions,
  updateConnectionConfig,
} from "../../../redux/Sbc/sbcConnectionSlice";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

// Helper tìm tên
const findLabel = (list = [], id, key = "id", label = "name") =>
  list.find((x) => x[key] == id)?.[label] || "";

// Build template từ config (đang có)
const buildTemplate = (cfg, options = {}) => {
  const {
    realms = [],
    services = [],
    connectionTypes = [],
    tgrps = [],
  } = options;

  const partner = (cfg.partner_name || "").trim();
  const realmName = cfg.realm_name || findLabel(realms, cfg.realm);
  const serviceName = cfg.service_name || findLabel(services, cfg.service);
  const ctName =
    cfg.connection_type_name || findLabel(connectionTypes, cfg.connection_type);
  const tgrpName = cfg.tgrp_name || findLabel(tgrps, cfg.tgrp) || "";

  const description = [partner, realmName, serviceName, ctName]
    .filter(Boolean)
    .join("---");
  const agents = Array.isArray(cfg.session_agents) ? cfg.session_agents : [];

  if (agents.length === 0) return "# Chưa có Session-Agent nào.";

  const lines = [];

  agents.forEach((ag, idx) => {
    if (idx > 0) lines.push("");
    lines.push(
      "conf t",
      "session-router",
      "session-agent",
      "",
      `hostname ${ag.hostname}`,
      `ip-address ${ag.ip_sip}`,
      realmName && `realm-id ${realmName}`,
      description && `description "${description}"`,
      ag.max_sessions && `max-sessions ${ag.max_sessions}`,
      "",
      "ping-method OPTIONS",
      "ping-interval 20",
      "options ping-failure-count=3",
      "stop-recurse 486-487",
      "ping-response enabled",
      "in-manipulationid SIP_IN",
      "out-manipulationid SIP_TMG_OUT",
      tgrpName && `trunk-group ${tgrpName}`,
      "trigger-oos-alarm enabled",
      "",
      "done",
      "exit",
      "exit",
      "exit",
      "",
      "verify-config",
      "save-config",
      "activate-config"
    );
  });

  const hostnames = agents.map((a) => a.hostname).join(" ");
  if (hostnames.trim()) {
    lines.push(
      "",
      "conf t",
      "session-router",
      "session-group",
      "",
      tgrpName && `group-name ${tgrpName}`,
      description && `description "${description}"`,
      "strategy RoundRobin",
      `dest (${hostnames})`,
      tgrpName && `trunk-group ${tgrpName}`,
      "sag-recursion enabled",
      "",
      "done",
      "exit",
      "exit",
      "exit",
      "",
      "verify",
      "save-config",
      "activate-config"
    );
  } else {
    lines.push("# Không có Session-Agent để tạo session-group");
  }

  return lines.filter(Boolean).join("\n");
};

const ConnectionConfigList = () => {
  const dispatch = useDispatch();
  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  }, []);

  const {
    configs = [],
    loadingConfigs = false,
    realms = [],
    services = [],
    connectionTypes = [],
    tgrps = [],
    partnerGroups = [],
    partners = [],
    loadingPartners = false,
    prefixSends = [],
    prefixReceives = [],
    nodes = [],
  } = useSelector((state) => state.sbcConnection || {});

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });

  // Modal Template (cho bản ghi)
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);

  // Modal Gán VIP
  const [showPairModal, setShowPairModal] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedPairs, setSelectedPairs] = useState([]);

  // Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editConfigId, setEditConfigId] = useState(null);
  const [editForm, setEditForm] = useState({
    partner_name: "",
    connection_type: "",
    realm: "",
    service: "",
    node: "",
    tgrp: "",
    prefix_send: "",
    prefix_receive: "",
    session_agents_payload: [],
  });

  // 🔥 Modal Create (đã gộp logic từ CreateConnectionForm)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Template modal cho form create
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [createTemplateText, setCreateTemplateText] = useState("");

  const [createForm, setCreateForm] = useState({
    partner: "",
    realm: "",
    service: "",
    connection_type: "",
    node: "",
    tgrp: "",
    prefix_send: "",
    prefix_receive: "",
    // mỗi SA có nhiều RTP ranges
    sessionAgentsList: [
      {
        hostname: "",
        ip_sip: "",
        subnet_sip: "",
        max_sessions: "",
        rtp_ranges: [{ ip_rtp: "", subnet_rtp: "" }],
      },
    ],
  });

  const pageSize = 15;

  useEffect(() => {
    dispatch(fetchSbcOptions());
    dispatch(fetchConnectionConfigs());
    dispatch(fetchPartnerGroups());
    dispatch(fetchPartners());
  }, [dispatch]);

  const processedData = useMemo(() => {
    let data = [...configs];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        [
          c.partner_name,
          c.realm_name,
          c.service_name,
          c.connection_type_name,
          c.node_name,
          c.tgrp_name,
          ...(c.session_agents || []).map(
            (sa) => `${sa.hostname} ${sa.ip_sip}`
          ),
          ...(c.partner_pairs || []).map(
            (p) => `${p.partner_group?.name} ${p.partner?.name}`
          ),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (sortConfig.key) {
      data.sort((a, b) => {
        let A = a[sortConfig.key] ?? "";
        let B = b[sortConfig.key] ?? "";
        if (sortConfig.key === "id") {
          A = Number(A) || 0;
          B = Number(B) || 0;
        } else {
          A = String(A).toLowerCase();
          B = String(B).toLowerCase();
        }
        return (
          (A < B ? -1 : A > B ? 1 : 0) *
          (sortConfig.direction === "asc" ? 1 : -1)
        );
      });
    }
    return data;
  }, [configs, search, sortConfig]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const pageData = processedData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
    else if (totalPages === 0) setPage(1);
  }, [totalPages, page]);

  const totalSessions = (agents) =>
    (agents || []).reduce((s, a) => s + (Number(a.max_sessions) || 0), 0);

  // ===== VIP PAIR =====
  const openPairModal = (configId, currentPairs = []) => {
    setSelectedConfigId(configId);
    setSelectedPairs(
      (currentPairs || [])
        .map((p) => ({
          groupId: p.partner_group?.id,
          partnerId: p.partner?.id,
        }))
        .filter((p) => p.groupId && p.partnerId)
    );
    setShowPairModal(true);
  };

  const handleSavePairs = async () => {
    if (selectedPairs.length === 0) return alert("Chọn ít nhất 1 cặp!");

    const result = await dispatch(
      assignPartnerPairs({
        configId: selectedConfigId,
        pairs: selectedPairs.map((p) => ({
          partner_group: p.groupId,
          partner: p.partnerId,
        })),
      })
    );

    if (assignPartnerPairs.fulfilled.match(result)) {
      alert("Gán VIP thành công!");
      setShowPairModal(false);
    } else {
      alert("Lỗi: " + (result.payload || "Không thể gán"));
    }
  };

  // ===== TEMPLATE (record) =====
  const openTemplate = (cfg) => {
    setTemplateText(
      buildTemplate(cfg, { realms, services, connectionTypes, tgrps })
    );
    setSelectedConfig(cfg);
    setShowTemplateModal(true);
  };

  const handleDelete = (cfg) => {
    if (window.confirm(`Xóa kết nối "${cfg.partner_name || cfg.id}"?`)) {
      dispatch(deleteConnectionConfig(cfg.id));
    }
  };

  // ===== EDIT =====
  const handleEdit = (cfg) => {
    setEditConfigId(cfg.id);

    setEditForm({
      partner_name: cfg.partner_name || "",
      connection_type: cfg.connection_type || "",
      realm: cfg.realm || "",
      service: cfg.service || "",
      node: cfg.node || "",
      tgrp: cfg.tgrp || "",
      prefix_send: cfg.prefix_send || "",
      prefix_receive: cfg.prefix_receive || "",
      // Edit vẫn giữ 1 RTP range như code hiện tại (nếu muốn nâng cấp multi RTP thì mình sẽ nâng tiếp)
      session_agents_payload: (cfg.session_agents || []).map((sa) => {
        const firstRtp = sa.rtp_ranges?.[0] || {};
        return {
          hostname: sa.hostname || "",
          ip_sip: sa.ip_sip || "",
          subnet_sip: sa.subnet_sip || "",
          ip_rtp: firstRtp.ip_rtp || "",
          subnet_rtp: firstRtp.subnet_rtp || "",
          max_sessions: sa.max_sessions ?? "",
        };
      }),
    });

    setShowEditModal(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSaChange = (index, field, value) => {
    setEditForm((prev) => {
      const arr = [...(prev.session_agents_payload || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, session_agents_payload: arr };
    });
  };

  const handleAddSaRow = () => {
    setEditForm((prev) => ({
      ...prev,
      session_agents_payload: [
        ...(prev.session_agents_payload || []),
        {
          hostname: "",
          ip_sip: "",
          subnet_sip: "",
          ip_rtp: "",
          subnet_rtp: "",
          max_sessions: "",
        },
      ],
    }));
  };

  const handleRemoveSaRow = (index) => {
    setEditForm((prev) => {
      const arr = [...(prev.session_agents_payload || [])];
      arr.splice(index, 1);
      return { ...prev, session_agents_payload: arr };
    });
  };

  const handleSubmitEdit = async () => {
    if (!editConfigId) return;

    const result = await dispatch(
      updateConnectionConfig({ id: editConfigId, data: editForm })
    );
    if (updateConnectionConfig.fulfilled.match(result)) {
      setShowEditModal(false);
    } else {
      alert("Lỗi cập nhật: " + (result.payload || "Không thể cập nhật"));
    }
  };

  // ===== CREATE: options =====
  const realmOptions = realms.map((r) => ({ value: r.id, label: r.name }));
  const connectionTypeOptions = connectionTypes.map((t) => ({
    value: t.id,
    label: t.name,
  }));
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));
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

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRealmChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, realm: "" }));
    if (option.__isNew__) {
      dispatch(addRealmQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, realm: String(created.id) }))
        )
        .catch(() => {});
    } else setCreateForm((p) => ({ ...p, realm: String(option.value) }));
  };

  const handleCreateServiceChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, service: "" }));
    if (option.__isNew__) {
      dispatch(addServiceQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, service: String(created.id) }))
        )
        .catch(() => {});
    } else setCreateForm((p) => ({ ...p, service: String(option.value) }));
  };

  const handleCreateConnectionTypeChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, connection_type: "" }));
    if (option.__isNew__) {
      dispatch(addConnectionTypeQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, connection_type: String(created.id) }))
        )
        .catch(() => {});
    } else
      setCreateForm((p) => ({ ...p, connection_type: String(option.value) }));
  };

  const handleCreateNodeChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, node: "" }));
    if (option.__isNew__) {
      dispatch(addNodeQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, node: String(created.id) }))
        )
        .catch(() => {});
    } else setCreateForm((p) => ({ ...p, node: String(option.value) }));
  };

  const handleCreateTgrpChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, tgrp: "" }));
    if (option.__isNew__) {
      dispatch(addTgrpQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, tgrp: String(created.id) }))
        )
        .catch(() => {});
    } else setCreateForm((p) => ({ ...p, tgrp: String(option.value) }));
  };

  const handleCreatePrefixSendChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, prefix_send: "" }));
    if (option.__isNew__) {
      dispatch(addPrefixSendQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, prefix_send: String(created.id) }))
        )
        .catch(() => {});
    } else setCreateForm((p) => ({ ...p, prefix_send: String(option.value) }));
  };

  const handleCreatePrefixReceiveChange = (option) => {
    if (!option) return setCreateForm((p) => ({ ...p, prefix_receive: "" }));
    if (option.__isNew__) {
      dispatch(addPrefixReceiveQuick(option.label))
        .unwrap()
        .then((created) =>
          setCreateForm((p) => ({ ...p, prefix_receive: String(created.id) }))
        )
        .catch(() => {});
    } else
      setCreateForm((p) => ({ ...p, prefix_receive: String(option.value) }));
  };

  // ===== CREATE: SA handlers (gộp multi RTP) =====
  const handleCreateAgentChange = (index, field, value) => {
    setCreateForm((prev) => {
      const clone = [...prev.sessionAgentsList];
      clone[index] = { ...clone[index], [field]: value };
      return { ...prev, sessionAgentsList: clone };
    });
  };

  const addCreateAgentRow = () => {
    setCreateForm((prev) => ({
      ...prev,
      sessionAgentsList: [
        ...prev.sessionAgentsList,
        {
          hostname: "",
          ip_sip: "",
          subnet_sip: "",
          max_sessions: "",
          rtp_ranges: [{ ip_rtp: "", subnet_rtp: "" }],
        },
      ],
    }));
  };

  const removeCreateAgentRow = (index) => {
    setCreateForm((prev) => {
      const clone = [...prev.sessionAgentsList];
      if (clone.length <= 1) return prev;
      clone.splice(index, 1);
      return { ...prev, sessionAgentsList: clone };
    });
  };

  const handleCreateRtpChange = (saIndex, rIndex, field, value) => {
    setCreateForm((prev) => {
      const agents = [...prev.sessionAgentsList];
      const sa = { ...agents[saIndex] };
      const ranges = [...(sa.rtp_ranges || [])];
      ranges[rIndex] = { ...ranges[rIndex], [field]: value };
      sa.rtp_ranges = ranges;
      agents[saIndex] = sa;
      return { ...prev, sessionAgentsList: agents };
    });
  };

  const addCreateRtpRange = (saIndex) => {
    setCreateForm((prev) => {
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

  const removeCreateRtpRange = (saIndex, rIndex) => {
    setCreateForm((prev) => {
      const agents = [...prev.sessionAgentsList];
      const sa = { ...agents[saIndex] };
      if ((sa.rtp_ranges || []).length <= 1) return prev;
      sa.rtp_ranges = sa.rtp_ranges.filter((_, i) => i !== rIndex);
      agents[saIndex] = sa;
      return { ...prev, sessionAgentsList: agents };
    });
  };

  const resetCreateForm = () => {
    setCreateForm({
      partner: "",
      realm: "",
      service: "",
      connection_type: "",
      node: "",
      tgrp: "",
      prefix_send: "",
      prefix_receive: "",
      sessionAgentsList: [
        {
          hostname: "",
          ip_sip: "",
          subnet_sip: "",
          max_sessions: "",
          rtp_ranges: [{ ip_rtp: "", subnet_rtp: "" }],
        },
      ],
    });
    setCreateTemplateText("");
    setShowCreateTemplateModal(false);
  };

  // ===== CREATE: generate template from form =====
  const buildTemplateFromCreateForm = () => {
    const partner = (createForm.partner || "").trim();
    const realmName = findLabel(realms, createForm.realm, "id", "name");
    const serviceName = findLabel(services, createForm.service, "id", "name");
    const ctName = findLabel(
      connectionTypes,
      createForm.connection_type,
      "id",
      "name"
    );
    const tgrpName = findLabel(tgrps, createForm.tgrp, "id", "name");

    const description = [partner, realmName, serviceName, ctName]
      .filter(Boolean)
      .join("---");

    const agentsClean = (createForm.sessionAgentsList || [])
      .map((a) => ({
        hostname: (a.hostname || "").trim(),
        ip_sip: (a.ip_sip || "").trim(),
        subnet_sip: (a.subnet_sip || "").trim(),
        max_sessions: (a.max_sessions || "").trim(),
      }))
      .filter((a) => a.hostname);

    if (!agentsClean.length) return "# Chưa nhập Session-Agent nào.";

    const allLines = [];

    agentsClean.forEach((ag, idx) => {
      if (idx > 0) allLines.push("");
      allLines.push(
        "conf t",
        "session-router",
        "session-agent",
        "",
        `hostname ${ag.hostname}`,
        `ip-address ${ag.ip_sip}`,
        realmName && `realm-id ${realmName}`,
        description && `description "${description}"`,
        ag.max_sessions && `max-sessions ${ag.max_sessions}`,
        "",
        "ping-method OPTIONS",
        "ping-interval 20",
        "options ping-failure-count=3",
        "stop-recurse 486-487",
        "ping-response enabled",
        "in-manipulationid SIP_IN",
        "out-manipulationid SIP_TMG_OUT",
        tgrpName && `trunk-group ${tgrpName}`,
        "trigger-oos-alarm enabled",
        "",
        "done",
        "exit",
        "exit",
        "exit",
        "",
        "verify-config",
        "save-config",
        "activate-config"
      );
    });

    const saNames = agentsClean.map((a) => a.hostname);
    const destValue = saNames.length ? `(${saNames.join(" ")})` : "()";

    allLines.push(
      "",
      "conf t",
      "session-router",
      "session-group",
      "",
      tgrpName && `group-name ${tgrpName}`,
      description && `description "${description}"`,
      "strategy RoundRobin",
      `dest ${destValue}`,
      tgrpName && `trunk-group ${tgrpName}`,
      "sag-recursion enabled",
      "",
      "done",
      "exit",
      "exit",
      "exit",
      "",
      "verify",
      "save-config",
      "activate-config"
    );

    return allLines.filter(Boolean).join("\n");
  };

  const handleGenerateCreateTemplate = () => {
    const tpl = buildTemplateFromCreateForm();
    setCreateTemplateText(tpl);
    setShowCreateTemplateModal(true);
  };

  // ===== CREATE: submit =====
  const handleSubmitCreate = async (e) => {
    e.preventDefault();

    if (
      !createForm.connection_type ||
      !createForm.realm ||
      !createForm.service
    ) {
      alert("Vui lòng chọn Connection Type, Realm và Service");
      return;
    }

    const session_agents_payload = (createForm.sessionAgentsList || [])
      .map((a) => {
        const hostname = (a.hostname || "").trim();
        const ip_sip = (a.ip_sip || "").trim();
        const subnet_sip = (a.subnet_sip || "").trim();
        const max_sessions =
          a.max_sessions !== undefined &&
          a.max_sessions !== null &&
          String(a.max_sessions).trim() !== ""
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
      .filter(
        (a) =>
          a.hostname &&
          a.ip_sip &&
          a.subnet_sip &&
          a.max_sessions !== null &&
          !Number.isNaN(a.max_sessions)
      );

    if (!session_agents_payload.length) {
      alert("Vui lòng nhập ít nhất 1 Session-Agent đầy đủ thông tin");
      return;
    }

    const payload = {
      partner_name: createForm.partner,
      connection_type: createForm.connection_type
        ? Number(createForm.connection_type)
        : null,
      realm: createForm.realm ? Number(createForm.realm) : null,
      service: createForm.service ? Number(createForm.service) : null,
      node: createForm.node ? Number(createForm.node) : null,
      tgrp: createForm.tgrp ? Number(createForm.tgrp) : null,
      prefix_send: createForm.prefix_send
        ? Number(createForm.prefix_send)
        : null,
      prefix_receive: createForm.prefix_receive
        ? Number(createForm.prefix_receive)
        : null,
      session_agents_payload,
    };

    try {
      setCreating(true);
      await dispatch(addConnectionConfig(payload)).unwrap();
      alert("Tạo kết nối thành công!");
      resetCreateForm();
      setShowCreateModal(false);
      dispatch(fetchConnectionConfigs());
    } catch (err) {
      console.error(err);
      alert("Lỗi tạo kết nối: " + (err?.detail || err?.message || "UNKNOWN"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <TopNavbar />

      <Container fluid className="px-4 py-4">
        <Card className="shadow-lg border-0">
          <Card.Header className="bg-gradient bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Danh Sách Kết Nối SBC</h4>
            <div className="d-flex gap-3 align-items-center">
              <Form.Control
                type="search"
                placeholder="Tìm đối tác, hostname, IP SIP, VIP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ width: "400px" }}
              />
              {isAdmin && (
                <Button
                  variant="warning"
                  onClick={() => setShowCreateModal(true)}
                >
                  Tạo Mới
                </Button>
              )}
              <Badge bg="light" text="dark" className="fs-6">
                Tổng: <strong>{configs.length}</strong> kết nối
              </Badge>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            {loadingConfigs ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3 text-muted">Đang tải danh sách...</p>
              </div>
            ) : pageData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>Không tìm thấy kết nối nào</h5>
              </div>
            ) : (
              <Table hover className="mb-0 align-middle">
                <thead className="table-dark text-white text-center">
                  <tr style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    <th>ID</th>
                    <th>Đối Tác</th>
                    <th>Cặp VIP - Nhà mạng</th>
                    <th>Realm</th>
                    <th>Service</th>
                    <th>Type</th>
                    <th>Node</th>
                    <th>TGRP</th>
                    <th>Prefix Send</th>
                    <th>Prefix Receive</th>
                    <th>Session Agents</th>
                    <th>Tổng Kênh</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((cfg) => (
                    <tr key={cfg.id}>
                      <td className="text-center fw-bold">{cfg.id}</td>
                      <td className="fw-bold">{cfg.partner_name || "—"}</td>

                      <td>
                        {cfg.partner_pairs?.length > 0 ? (
                          <div className="d-flex flex-column gap-1">
                            {cfg.partner_pairs.map((p) => (
                              <Badge
                                key={`${p.partner_group?.id}-${p.partner?.id}`}
                                bg="info"
                                className="text-dark"
                              >
                                {p.partner_group?.name} to {p.partner?.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">Chưa gán</span>
                        )}
                      </td>

                      <td>{cfg.realm_name || "—"}</td>
                      <td>{cfg.service_name || "—"}</td>
                      <td>{cfg.connection_type_name || "—"}</td>
                      <td>{cfg.node_name || "—"}</td>
                      <td>{cfg.tgrp_name || "—"}</td>
                      <td>
                        {findLabel(
                          prefixSends,
                          cfg.prefix_send,
                          "id",
                          "value"
                        ) ||
                          cfg.prefix_send ||
                          "—"}
                      </td>
                      <td>
                        {findLabel(
                          prefixReceives,
                          cfg.prefix_receive,
                          "id",
                          "value"
                        ) ||
                          cfg.prefix_receive ||
                          "—"}
                      </td>
                      <td>
                        {cfg.session_agents?.length > 0 ? (
                          <div className="d-flex flex-column gap-2">
                            {cfg.session_agents.map((sa, i) => {
                              const rtpRanges =
                                sa.rtp_ranges || sa.rtp_ranges_payload || [];
                              return (
                                <OverlayTrigger
                                  key={i}
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      <strong>{sa.hostname}</strong>
                                      <br />
                                      SIP: {sa.ip_sip}
                                      <br />
                                      {rtpRanges.length > 0 ? (
                                        <>
                                          {rtpRanges.map((r, idx2) => (
                                            <div key={idx2}>
                                              RTP #{idx2 + 1}: {r.ip_rtp}/
                                              {r.subnet_rtp}
                                            </div>
                                          ))}
                                        </>
                                      ) : (
                                        <span>Không có dải RTP</span>
                                      )}
                                      <br />
                                      Max: <strong>{sa.max_sessions}</strong>
                                    </Tooltip>
                                  }
                                >
                                  <div
                                    className="border rounded p-2 bg-light small"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div className="fw-bold text-primary">
                                      {sa.hostname}
                                    </div>
                                    <div>
                                      <span className="me-1">SIP:</span>
                                      <code>{sa.ip_sip}</code>
                                    </div>
                                    <div className="mt-1">
                                      <span className="me-1">RTP:</span>
                                      {rtpRanges.length > 0 ? (
                                        <div className="d-flex flex-column">
                                          {rtpRanges.map((r, idx2) => (
                                            <div
                                              key={idx2}
                                              className="text-muted small"
                                            >
                                              • {r.ip_rtp} / {r.subnet_rtp}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <small className="text-muted">
                                          Không có dải RTP
                                        </small>
                                      )}
                                    </div>
                                    <Badge
                                      className="mt-1"
                                      bg={
                                        sa.max_sessions > 0
                                          ? "success"
                                          : "danger"
                                      }
                                    >
                                      {sa.max_sessions} kênh
                                    </Badge>
                                  </div>
                                </OverlayTrigger>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-danger fw-bold">
                            Không có SA
                          </span>
                        )}
                      </td>

                      <td className="text-center">
                        <h5 className="mb-0 text-success fw-bold">
                          {totalSessions(cfg.session_agents)}
                        </h5>
                      </td>

                      <td className="text-center">
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => handleEdit(cfg)}
                            className="me-1"
                          >
                            Sửa
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => openTemplate(cfg)}
                          className="me-1"
                        >
                          Template
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() =>
                              openPairModal(cfg.id, cfg.partner_pairs)
                            }
                            className="me-1"
                          >
                            Gán VIP
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(cfg)}
                          >
                            Xóa
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>

          {totalPages > 1 && (
            <Card.Footer className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Hiển thị {(page - 1) * pageSize + 1} -{" "}
                  {Math.min(page * pageSize, processedData.length)} /{" "}
                  {processedData.length}
                </div>
                <Pagination>
                  <Pagination.Prev
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === page}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  />
                </Pagination>
              </div>
            </Card.Footer>
          )}
        </Card>
      </Container>

      {/* ===================== MODAL GÁN VIP ===================== */}
      <Modal
        show={showPairModal}
        onHide={() => setShowPairModal(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            Gán VIP - Nhà mạng cho kết nối #{selectedConfigId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingPartners ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <>
              <Card className="mb-4 border-primary">
                <Card.Header className="bg-primary text-white">
                  Tạo nhóm VIP mới
                </Card.Header>
                <Card.Body>
                  <CreatableSelect
                    isClearable
                    placeholder="Nhập tên nhóm VIP mới (VD: VIP15)"
                    options={partnerGroups.map((g) => ({
                      value: g.id,
                      label: g.name,
                    }))}
                    onCreateOption={async (input) => {
                      const name = input.trim();
                      if (!name) return;
                      try {
                        await dispatch(addPartnerGroupQuick(name)).unwrap();
                        dispatch(fetchPartnerGroups());
                      } catch (err) {
                        alert("Tạo nhóm thất bại!");
                      }
                    }}
                  />
                </Card.Body>
              </Card>

              {partnerGroups.length === 0 ? (
                <Alert variant="warning">
                  Chưa có nhóm VIP nào. Hãy tạo ở trên!
                </Alert>
              ) : (
                partnerGroups.map((group) => {
                  const selectedForGroup = selectedPairs
                    .filter((p) => p.groupId === group.id)
                    .map((p) =>
                      partners.find((part) => part.id === p.partnerId)
                    )
                    .filter(Boolean);

                  return (
                    <Card key={group.id} className="mb-3 border-success">
                      <Card.Header className="bg-light">
                        <strong>{group.name}</strong>
                        <Badge bg="success" className="ms-2">
                          {selectedForGroup.length} nhà mạng
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <CreatableSelect
                          isMulti
                          isClearable
                          placeholder="Chọn hoặc tạo nhà mạng mới..."
                          options={partners.map((p) => ({
                            value: p.id,
                            label: p.name,
                          }))}
                          value={selectedForGroup.map((p) => ({
                            value: p.id,
                            label: p.name,
                          }))}
                          onChange={(opts) => {
                            const newIds = opts ? opts.map((o) => o.value) : [];
                            setSelectedPairs((prev) => [
                              ...prev.filter((p) => p.groupId !== group.id),
                              ...newIds.map((id) => ({
                                groupId: group.id,
                                partnerId: id,
                              })),
                            ]);
                          }}
                          onCreateOption={async (input) => {
                            const name = input.trim();
                            if (!name) return;
                            try {
                              const result = await dispatch(
                                addPartnerQuick(name)
                              ).unwrap();
                              const newId = result?.id || result?.data?.id;
                              if (newId) {
                                setSelectedPairs((prev) => [
                                  ...prev,
                                  { groupId: group.id, partnerId: newId },
                                ]);
                              }
                            } catch (err) {
                              alert("Tạo nhà mạng thất bại!");
                            }
                          }}
                        />
                      </Card.Body>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Badge bg="dark" className="me-auto">
            Tổng: <strong>{selectedPairs.length}</strong> cặp
          </Badge>
          <Button variant="secondary" onClick={() => setShowPairModal(false)}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={handleSavePairs}
            disabled={selectedPairs.length === 0}
          >
            Lưu gán ({selectedPairs.length})
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===================== MODAL TEMPLATE (record) ===================== */}
      <Modal
        show={showTemplateModal}
        onHide={() => setShowTemplateModal(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            Template SBC -{" "}
            {selectedConfig?.partner_name || `ID ${selectedConfig?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form.Control
            as="textarea"
            rows={35}
            value={templateText}
            readOnly
            style={{
              fontFamily: "monospace",
              fontSize: "0.95rem",
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
            }}
          />
          <div className="mt-3 text-end">
            <Button
              variant="success"
              onClick={() => {
                navigator.clipboard.writeText(templateText);
                alert("Đã copy!");
              }}
            >
              Copy Template
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ===================== MODAL EDIT (giữ nguyên) ===================== */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>Sửa cấu hình kết nối #{editConfigId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Đối tác</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.partner_name}
                    onChange={(e) =>
                      handleEditFieldChange("partner_name", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Connection Type</Form.Label>
                  <Form.Select
                    value={editForm.connection_type || ""}
                    onChange={(e) =>
                      handleEditFieldChange("connection_type", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {connectionTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Realm</Form.Label>
                  <Form.Select
                    value={editForm.realm || ""}
                    onChange={(e) =>
                      handleEditFieldChange("realm", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {realms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Service</Form.Label>
                  <Form.Select
                    value={editForm.service || ""}
                    onChange={(e) =>
                      handleEditFieldChange("service", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Node</Form.Label>
                  <Form.Select
                    value={editForm.node || ""}
                    onChange={(e) =>
                      handleEditFieldChange("node", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>TGRP</Form.Label>
                  <Form.Select
                    value={editForm.tgrp || ""}
                    onChange={(e) =>
                      handleEditFieldChange("tgrp", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {tgrps.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Prefix Send</Form.Label>
                  <Form.Select
                    value={editForm.prefix_send || ""}
                    onChange={(e) =>
                      handleEditFieldChange("prefix_send", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {prefixSends.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.value}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Prefix Receive</Form.Label>
                  <Form.Select
                    value={editForm.prefix_receive || ""}
                    onChange={(e) =>
                      handleEditFieldChange("prefix_receive", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {prefixReceives.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.value}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Session Agents</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddSaRow}
              >
                Thêm SA
              </Button>
            </div>

            {editForm.session_agents_payload?.length > 0 ? (
              <Table bordered size="sm" responsive>
                <thead className="table-light">
                  <tr>
                    <th>Hostname</th>
                    <th>IP SIP</th>
                    <th>Subnet SIP</th>
                    <th>IP RTP</th>
                    <th>Subnet RTP</th>
                    <th>Max Sessions</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {editForm.session_agents_payload.map((sa, idx) => (
                    <tr key={idx}>
                      <td>
                        <Form.Control
                          value={sa.hostname}
                          onChange={(e) =>
                            handleEditSaChange(idx, "hostname", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={sa.ip_sip}
                          onChange={(e) =>
                            handleEditSaChange(idx, "ip_sip", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={sa.subnet_sip}
                          onChange={(e) =>
                            handleEditSaChange(
                              idx,
                              "subnet_sip",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={sa.ip_rtp}
                          onChange={(e) =>
                            handleEditSaChange(idx, "ip_rtp", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={sa.subnet_rtp}
                          onChange={(e) =>
                            handleEditSaChange(
                              idx,
                              "subnet_rtp",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          value={sa.max_sessions}
                          onChange={(e) =>
                            handleEditSaChange(
                              idx,
                              "max_sessions",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleRemoveSaRow(idx)}
                        >
                          X
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted">Chưa có Session-Agent nào.</p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmitEdit}
            disabled={!editConfigId}
          >
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===================== MODAL CREATE (đã gộp) ===================== */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          resetCreateForm();
          setShowCreateModal(false);
        }}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Tạo Kết Nối Với Đối Tác Nước Ngoài</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmitCreate}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Đối tác: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="partner"
                    value={createForm.partner}
                    onChange={handleCreateChange}
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
                        (o) => String(o.value) === createForm.realm
                      ) || null
                    }
                    options={realmOptions}
                    onChange={handleCreateRealmChange}
                  />
                </Form.Group>
              </Col>
            </Row>

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
                        (o) => String(o.value) === createForm.service
                      ) || null
                    }
                    options={serviceOptions}
                    onChange={handleCreateServiceChange}
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
                        (o) => String(o.value) === createForm.connection_type
                      ) || null
                    }
                    options={connectionTypeOptions}
                    onChange={handleCreateConnectionTypeChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Node SBC:</Form.Label>
                  <CreatableSelect
                    isClearable
                    placeholder="Chọn hoặc nhập Node..."
                    value={
                      nodeOptions.find(
                        (o) => String(o.value) === createForm.node
                      ) || null
                    }
                    options={nodeOptions}
                    onChange={handleCreateNodeChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} />
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>TGRP (10 digit):</Form.Label>
                  <CreatableSelect
                    isClearable
                    placeholder="VD: SIPEZNIDDI"
                    value={
                      tgrpOptions.find(
                        (o) => String(o.value) === createForm.tgrp
                      ) || null
                    }
                    options={tgrpOptions}
                    onChange={handleCreateTgrpChange}
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
                        (o) => String(o.value) === createForm.prefix_send
                      ) || null
                    }
                    options={prefixSendOptions}
                    onChange={handleCreatePrefixSendChange}
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
                        (o) => String(o.value) === createForm.prefix_receive
                      ) || null
                    }
                    options={prefixReceiveOptions}
                    onChange={handleCreatePrefixReceiveChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Danh sách Session-Agent</h5>
              <Button
                variant="outline-success"
                size="sm"
                onClick={addCreateAgentRow}
              >
                ➕ Thêm Session-Agent
              </Button>
            </div>

            <div className="mt-3">
              {createForm.sessionAgentsList.map((sa, idx) => (
                <div key={idx} className="border rounded p-3 mb-3">
                  <Row className="mb-2">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Session Agent</Form.Label>
                        <Form.Control
                          value={sa.hostname}
                          onChange={(e) =>
                            handleCreateAgentChange(
                              idx,
                              "hostname",
                              e.target.value
                            )
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
                            handleCreateAgentChange(
                              idx,
                              "ip_sip",
                              e.target.value
                            )
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
                            handleCreateAgentChange(
                              idx,
                              "subnet_sip",
                              e.target.value
                            )
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
                            handleCreateAgentChange(
                              idx,
                              "max_sessions",
                              e.target.value
                            )
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
                        onClick={() => removeCreateAgentRow(idx)}
                        disabled={createForm.sessionAgentsList.length <= 1}
                      >
                        ✕
                      </Button>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col
                      md={12}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <strong>Dải RTP</strong>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => addCreateRtpRange(idx)}
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
                              handleCreateRtpChange(
                                idx,
                                rIndex,
                                "ip_rtp",
                                e.target.value
                              )
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
                              handleCreateRtpChange(
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
                          onClick={() => removeCreateRtpRange(idx, rIndex)}
                          disabled={(sa.rtp_ranges || []).length <= 1}
                        >
                          ✕
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              ))}
            </div>

            <div className="text-end mt-4 d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={handleGenerateCreateTemplate}
              >
                📝 Generate Template
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(false);
                }}
              >
                Hủy
              </Button>

              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang tạo kết nối...
                  </>
                ) : (
                  "Tạo Kết Nối"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ===================== MODAL TEMPLATE (create form) ===================== */}
      <Modal
        show={showCreateTemplateModal}
        onHide={() => setShowCreateTemplateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Template cấu hình SBC (từ form tạo mới)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Câu lệnh</Form.Label>
            <Form.Control
              as="textarea"
              rows={24}
              value={createTemplateText}
              readOnly
              style={{ fontFamily: "monospace" }}
            />
          </Form.Group>
          <Button
            className="mt-3"
            onClick={() => {
              if (navigator.clipboard && createTemplateText) {
                navigator.clipboard.writeText(createTemplateText);
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

export default ConnectionConfigList;
