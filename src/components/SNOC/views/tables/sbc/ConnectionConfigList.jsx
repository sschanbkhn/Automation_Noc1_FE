// src/components/SNOC/Sbc/ConnectionConfigList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card, // ⬅️ THÊM
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
import { useNavigate } from "react-router-dom"; // THÊM DÒNG NÀY
import CreatableSelect from "react-select/creatable";
import {
  addPartnerGroupQuick,
  addPartnerQuick,
  assignPartnerPairs,
  deleteConnectionConfig,
  fetchConnectionConfigs,
  fetchPartnerGroups,
  fetchPartners,
  fetchSbcOptions,
  updateConnectionConfig,
} from "../../../redux/Sbc/sbcConnectionSlice";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc";

// Helper tìm tên
const findLabel = (list = [], id, key = "id", label = "name") =>
  list.find((x) => x[key] == id)?.[label] || "";

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
  const navigate = useNavigate(); // THÊM DÒNG NÀY ĐỂ CHUYỂN TRANG EDIT

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

  // Modal Template
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);

  // Modal Gán VIP
  const [showPairModal, setShowPairModal] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedPairs, setSelectedPairs] = useState([]);

  // 🔧 Modal Edit
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

  // MỞ MODAL GÁN VIP
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

  // LƯU GÁN VIP – ĐÃ SỬA LẠI ĐÚNG ENDPOINT (giả sử backend dùng PUT hoặc POST đúng)
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

  // 🔧 MỞ MODAL EDIT
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
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSaChange = (index, field, value) => {
    setEditForm((prev) => {
      const arr = [...(prev.session_agents_payload || [])];
      arr[index] = {
        ...arr[index],
        [field]: value,
      };
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
      updateConnectionConfig({
        id: editConfigId,
        data: editForm,
      })
    );

    if (updateConnectionConfig.fulfilled.match(result)) {
      setShowEditModal(false);
    } else {
      alert("Lỗi cập nhật: " + (result.payload || "Không thể cập nhật"));
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
              <Button
                variant="warning"
                onClick={() => navigate("/sbc/CreateConnectionForm")}
              >
                Tạo Mới
              </Button>
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
              <Table
                hover
                responsive
                bordered
                className="mb-0 table-sm align-middle"
              >
                <thead className="table-dark text-white text-center">
                  <tr>
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
                              // Lấy danh sách dải RTP từ backend (rtp_ranges hoặc rtp_ranges_payload)
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
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => handleEdit(cfg)}
                          className="me-1"
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => openTemplate(cfg)}
                          className="me-1"
                        >
                          Template
                        </Button>
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
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(cfg)}
                        >
                          Xóa
                        </Button>
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

      {/* Modal Gán VIP – đã thêm xử lý lỗi */}
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

      {/* Modal Template */}
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

      {/* Modal Edit ConnectionConfig */}
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
    </>
  );
};

export default ConnectionConfigList;
