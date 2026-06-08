import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

import {
  addCountryDestinationQuick,
  addRoutingRule,
  deleteRoutingRule,
  fetchConnectionConfigs,
  fetchRoutingRules,
  fetchSbcOptions,
  updateRoutingRule,
} from "../../../redux/Sbc/sbcConnectionSlice";

const ITEMS_PER_PAGE = 20;

// Icon nho nhỏ
const PlusIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);

const RoutingDeclarationForm = () => {
  const dispatch = useDispatch();
  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  }, []);

  const {
    services = [],
    configs = [],
    countries = [],
    tgrps = [],
    routingRules = [],
    loadingOptions = false,
    loadingConfigs = false,
    loadingRouting = false,
    submitting = false,
  } = useSelector((state) => state.sbcConnection || {});

  const [toasts, setToasts] = useState([]);

  const addToast = (message, variant = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };

  // Filter / search / paging
  const [filterSource, setFilterSource] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Modal tạo nhanh Country/Dest
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countryForm, setCountryForm] = useState({
    country_name: "",
    destination_code: "",
    target: "create", // "create" hoặc "edit"
  });

  const openCountryModal = (target) => {
    setCountryForm({
      country_name: "",
      destination_code: "",
      target, // "create" hoặc "edit"
    });
    setShowCountryModal(true);
  };

  const handleCreateCountry = () => {
    const { country_name, destination_code, target } = countryForm;

    dispatch(
      addCountryDestinationQuick({
        country_name,
        destination_code,
      })
    )
      .unwrap()
      .then((created) => {
        // Gán luôn Country vừa tạo vào form tương ứng
        if (created?.id) {
          if (target === "create") {
            setFormData((prev) => ({
              ...prev,
              country_destination: String(created.id),
            }));
          } else if (target === "edit") {
            setEditItem((prev) =>
              prev ? { ...prev, country_destination: String(created.id) } : prev
            );
          }
        }
        setShowCountryModal(false);
      })
      .catch(() => {
        // lỗi đã show ở slice
      });
  };

  // Form tạo mới
  const [formData, setFormData] = useState({
    source_connection: "",
    service: "",
    country_destination: "",
    note: "",
    choices: [
      {
        name: "",
        ratio: "",
        hops: [{ tgrp: "", priority: 1 }],
      },
    ],
  });

  useEffect(() => {
    dispatch(fetchSbcOptions());
    dispatch(fetchConnectionConfigs());
    dispatch(fetchRoutingRules());
  }, [dispatch]);

  const isLoading = loadingOptions || loadingConfigs || loadingRouting;

  // Helper label
  const getConnectionLabel = (id) => {
    const c = configs.find((x) => String(x.id) === String(id));
    if (!c) return `Conn ID ${id}`;
    return `${c.partner_name || "?"} — ${c.realm_name || "?"}`;
  };

  const getServiceLabel = (id) => {
    const s = services.find((x) => String(x.id) === String(id));
    return s ? s.name : `Service ID ${id}`;
  };

  const getCountryLabel = (id) => {
    const c = countries.find((x) => String(x.id) === String(id));
    return c ? `${c.country_name} (${c.destination_code})` : `Country ID ${id}`;
  };

  const getTgrpLabel = (id) => {
    const t = tgrps.find((x) => String(x.id) === String(id));
    return t ? t.name : `TGRP ID ${id}`;
  };

  // ====== Các handler cho form tạo mới ======
  const handleChangeFormRoot = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Choice
  const handleChoiceChange = (index, field, value) => {
    setFormData((prev) => {
      const choices = [...prev.choices];
      choices[index] = { ...choices[index], [field]: value };
      return { ...prev, choices };
    });
  };

  const addChoice = () => {
    setFormData((prev) => ({
      ...prev,
      choices: [
        ...prev.choices,
        { name: "", ratio: "", hops: [{ tgrp: "", priority: 1 }] },
      ],
    }));
  };

  const removeChoice = (index) => {
    setFormData((prev) => {
      if (prev.choices.length <= 1) return prev;
      const choices = prev.choices.filter((_, i) => i !== index);
      return { ...prev, choices };
    });
  };

  // Hop (TGRP + priority)
  const handleHopChange = (cIndex, hIndex, field, value) => {
    setFormData((prev) => {
      const choices = [...prev.choices];
      const choice = { ...choices[cIndex] };
      const hops = [...(choice.hops || [])];
      hops[hIndex] = { ...hops[hIndex], [field]: value };
      choice.hops = hops;
      choices[cIndex] = choice;
      return { ...prev, choices };
    });
  };

  const addHop = (cIndex) => {
    setFormData((prev) => {
      const choices = [...prev.choices];
      const choice = { ...choices[cIndex] };
      const hops = [...(choice.hops || [])];

      const maxPriority =
        hops.length > 0
          ? Math.max(...hops.map((h) => Number(h.priority || 1)))
          : 0;

      hops.push({ tgrp: "", priority: maxPriority + 1 });
      choice.hops = hops;
      choices[cIndex] = choice;
      return { ...prev, choices };
    });
  };

  const removeHop = (cIndex, hIndex) => {
    setFormData((prev) => {
      const choices = [...prev.choices];
      const choice = { ...choices[cIndex] };
      const hops = [...(choice.hops || [])];
      if (hops.length <= 1) return prev;
      choice.hops = hops.filter((_, i) => i !== hIndex);
      choices[cIndex] = choice;
      return { ...prev, choices };
    });
  };

  // Validate ratio = 100
  const getTotalRatio = (choices) =>
    choices.reduce((sum, c) => sum + (Number(c.ratio || 0) || 0), 0);

  const buildRoutingPayloadFromForm = () => {
    const choices_clean = (formData.choices || [])
      .map((c) => {
        const ratio = Number(c.ratio || 0);
        if (!ratio) return null;

        const name = (c.name || "").trim();
        const hops_clean = (c.hops || [])
          .map((h) => {
            const tgrp = h.tgrp ? Number(h.tgrp) : null;
            const priority = h.priority ? Number(h.priority) : 1;
            if (!tgrp) return null;
            return { tgrp, priority };
          })
          .filter(Boolean);

        if (!hops_clean.length) return null;
        return { ratio, name, hops: hops_clean };
      })
      .filter(Boolean);

    return {
      source_connection: formData.source_connection
        ? Number(formData.source_connection)
        : null,
      service: formData.service ? Number(formData.service) : null,
      country_destination: formData.country_destination
        ? Number(formData.country_destination)
        : null,
      note: formData.note || "",
      choices_payload: choices_clean,
    };
  };

  // Submit create
  const handleCreate = (e) => {
    e.preventDefault();

    if (
      !formData.source_connection ||
      !formData.service ||
      !formData.country_destination
    ) {
      addToast("Vui lòng chọn Nguồn, Service và CountryDestination", "danger");
      return;
    }

    const totalRatio = getTotalRatio(formData.choices);
    if (totalRatio !== 100) {
      addToast(
        `Tổng tỷ lệ phải bằng 100% (hiện tại: ${totalRatio}%)`,
        "danger"
      );
      return;
    }

    const payload = buildRoutingPayloadFromForm();
    if (!payload.choices_payload || !payload.choices_payload.length) {
      addToast("Cần ít nhất 1 lựa chọn có hop hợp lệ", "danger");
      return;
    }

    dispatch(addRoutingRule(payload))
      .unwrap()
      .then(() => {
        addToast("Khai báo định tuyến thành công", "success");
        setShowCreate(false);
        // reset form
        setFormData({
          source_connection: "",
          service: "",
          country_destination: "",
          note: "",
          choices: [
            {
              name: "",
              ratio: "",
              hops: [{ tgrp: "", priority: 1 }],
            },
          ],
        });
      })
      .catch(() => {
        // error đã show alert ở slice
      });
  };

  // ====== FILTER + SEARCH + PAGING ======
  const filteredData = useMemo(() => {
    let data = [...routingRules];

    if (filterSource) {
      data = data.filter(
        (r) => String(r.source_connection) === String(filterSource)
      );
    }
    if (filterService) {
      data = data.filter((r) => String(r.service) === String(filterService));
    }
    if (filterCountry) {
      data = data.filter(
        (r) => String(r.country_destination) === String(filterCountry)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
    }

    return data.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [routingRules, filterSource, filterService, filterCountry, search]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ====== EDIT ======
  const openEdit = (rule) => {
    setEditItem({
      ...rule,
      choices: (rule.choices || []).map((c) => ({
        id: c.id,
        name: c.name || "",
        ratio: c.ratio,
        hops: (c.hops || []).map((h) => ({
          id: h.id,
          tgrp: h.tgrp,
          priority: h.priority,
        })),
      })),
    });
    setShowEdit(true);
  };

  const handleEditRootChange = (field, value) => {
    setEditItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChoiceChange = (cIndex, field, value) => {
    setEditItem((prev) => {
      const choices = [...(prev.choices || [])];
      choices[cIndex] = { ...choices[cIndex], [field]: value };
      return { ...prev, choices };
    });
  };

  const handleEditHopChange = (cIndex, hIndex, field, value) => {
    setEditItem((prev) => {
      const choices = [...(prev.choices || [])];
      const choice = { ...choices[cIndex] };
      const hops = [...(choice.hops || [])];
      hops[hIndex] = { ...hops[hIndex], [field]: value };
      choice.hops = hops;
      choices[cIndex] = choice;
      return { ...prev, choices };
    });
  };

  const addEditChoice = () => {
    setEditItem((prev) => ({
      ...prev,
      choices: [
        ...(prev.choices || []),
        { name: "", ratio: "", hops: [{ tgrp: "", priority: 1 }] },
      ],
    }));
  };

  const removeEditChoice = (cIndex) => {
    setEditItem((prev) => {
      if ((prev.choices || []).length <= 1) return prev;
      const choices = prev.choices.filter((_, i) => i !== cIndex);
      return { ...prev, choices };
    });
  };

  const addEditHop = (cIndex) => {
    setEditItem((prev) => {
      const choices = [...(prev.choices || [])];
      const choice = { ...choices[cIndex] };
      const hops = [...(choice.hops || [])];
      const maxPriority =
        hops.length > 0
          ? Math.max(...hops.map((h) => Number(h.priority || 1)))
          : 0;
      hops.push({ tgrp: "", priority: maxPriority + 1 });
      choice.hops = hops;
      choices[cIndex] = choice;
      return { ...prev, choices };
    });
  };

  const removeEditHop = (cIndex, hIndex) => {
    setEditItem((prev) => {
      const choices = [...(prev.choices || [])];
      const choice = { ...choices[cIndex] };
      const hops = [...(choice.hops || [])];
      if (hops.length <= 1) return prev;
      choice.hops = hops.filter((_, i) => i !== hIndex);
      choices[cIndex] = choice;
      return { ...prev, choices };
    });
  };

  const buildRoutingPayloadFromEdit = () => {
    const choices_clean = (editItem.choices || [])
      .map((c) => {
        const ratio = Number(c.ratio || 0);
        if (!ratio) return null;
        const name = (c.name || "").trim();
        const hops_clean = (c.hops || [])
          .map((h) => {
            const tgrp = h.tgrp ? Number(h.tgrp) : null;
            const priority = h.priority ? Number(h.priority) : 1;
            if (!tgrp) return null;
            return { tgrp, priority };
          })
          .filter(Boolean);
        if (!hops_clean.length) return null;
        return { ratio, name, hops: hops_clean };
      })
      .filter(Boolean);

    return {
      source_connection: editItem.source_connection
        ? Number(editItem.source_connection)
        : null,
      service: editItem.service ? Number(editItem.service) : null,
      country_destination: editItem.country_destination
        ? Number(editItem.country_destination)
        : null,
      note: editItem.note || "",
      choices_payload: choices_clean,
    };
  };

  const handleUpdate = () => {
    if (!editItem) return;

    const totalRatio = getTotalRatio(editItem.choices || []);
    if (totalRatio !== 100) {
      addToast(
        `Tổng tỷ lệ phải bằng 100% (hiện tại: ${totalRatio}%)`,
        "danger"
      );
      return;
    }

    const payload = buildRoutingPayloadFromEdit();
    if (!payload.choices_payload || !payload.choices_payload.length) {
      addToast("Cần ít nhất 1 lựa chọn có hop hợp lệ", "danger");
      return;
    }

    dispatch(updateRoutingRule({ id: editItem.id, data: payload }))
      .unwrap()
      .then(() => {
        addToast("Cập nhật định tuyến thành công", "success");
        setShowEdit(false);
      })
      .catch(() => {});
  };

  const handleDelete = (rule) => {
    if (
      !window.confirm(
        `Xóa định tuyến ID ${rule.id} cho ${getConnectionLabel(
          rule.source_connection
        )} / ${getCountryLabel(rule.country_destination)} ?`
      )
    )
      return;

    dispatch(deleteRoutingRule(rule.id))
      .unwrap()
      .then(() => addToast("Đã xoá định tuyến", "success"))
      .catch(() => {});
  };

  return (
    <>
      <TopNavbar />

      {/* Toast Notification */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1050 }}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            bg={t.variant === "danger" ? "danger" : "light"}
            onClose={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            delay={6000}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">
                {t.variant === "success" ? "Thành công" : "Thông báo"}
              </strong>
              <small>Vừa xong</small>
            </Toast.Header>
            <Toast.Body className={t.variant === "danger" ? "text-white" : ""}>
              {t.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      <div className="p-4 bg-light min-vh-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-primary mb-0">
            Quản Lý Định Tuyến Lưu Lượng
          </h4>
          <small className="text-muted">
            Tổng: <strong>{routingRules.length}</strong> rule
          </small>
        </div>

        {/* Thanh công cụ lọc */}
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="py-3">
            <Row className="g-3 align-items-end">
              <Col lg={3} md={6}>
                <Form.Label className="small fw-semibold mb-1">
                  Nguồn (Connection)
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterSource}
                  onChange={(e) => {
                    setFilterSource(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả nguồn</option>
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.partner_name || "?"} — {c.realm_name || "?"}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={2} md={6}>
                <Form.Label className="small fw-semibold mb-1">
                  Service
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterService}
                  onChange={(e) => {
                    setFilterService(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={3} md={6}>
                <Form.Label className="small fw-semibold mb-1">
                  Country / Destination
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterCountry}
                  onChange={(e) => {
                    setFilterCountry(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.country_name} ({c.destination_code})
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={3} md={8}>
                <Form.Label className="small fw-semibold mb-1">
                  <SearchIcon /> Tìm kiếm
                </Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <SearchIcon />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Đối tác, country, destination, note..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </Col>

              <Col lg={1} md={4} className="text-end">
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowCreate(true)}
                  >
                    <PlusIcon />{" "}
                    <span className="d-none d-sm-inline">Khai báo</span>
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Bảng rule */}
        <Card className="border-0 shadow">
          <Card.Body className="p-0">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-3">Đang tải dữ liệu định tuyến...</div>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "4rem", opacity: 0.3 }}>📡</div>
                <p className="mt-3">Chưa có định tuyến nào được khai báo</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-dark text-white text-center">
                      <tr style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        <th className="py-2">ID</th>
                        <th className="py-2">Nguồn</th>
                        <th className="py-2">Service</th>
                        <th className="py-2">Country / Dest</th>
                        <th className="py-2">Lựa chọn (ratio &amp; TGRP)</th>
                        <th className="py-2">Note</th>
                        <th className="py-2">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((r) => (
                        <tr key={r.id}>
                          <td className="text-center fw-bold text-primary">
                            {r.id}
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {getConnectionLabel(r.source_connection)}
                            </div>
                          </td>
                          <td>
                            <Badge bg="info" pill className="px-3 py-1">
                              {getServiceLabel(r.service)}
                            </Badge>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {getCountryLabel(r.country_destination)}
                            </div>
                          </td>
                          <td>
                            {(r.choices || []).map((c, idx) => (
                              <div
                                key={c.id || idx}
                                className="border rounded p-2 mb-1 bg-light small"
                              >
                                <div className="d-flex justify-content-between">
                                  <span className="fw-semibold">
                                    {c.name || `Choice #${idx + 1}`}
                                  </span>
                                  <span className="badge bg-primary">
                                    {c.ratio}%
                                  </span>
                                </div>
                                <div className="mt-1">
                                  {(c.hops || []).map((h, i2) => (
                                    <span
                                      key={h.id || i2}
                                      className="badge bg-secondary me-1"
                                    >
                                      {h.priority}. {h.tgrp_name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </td>
                          <td className="text-muted small">{r.note || "—"}</td>
                          <td className="text-center">
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline-warning"
                                className="me-1"
                                onClick={() => openEdit(r)}
                              >
                                <EditIcon />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(r)}
                              >
                                <TrashIcon />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="border-top p-3 bg-light">
                    <Pagination className="justify-content-center mb-0">
                      <Pagination.Prev
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* ========== MODAL TẠO MỚI ========== */}
      {/* ========== MODAL TẠO NHANH COUNTRY / DEST ========== */}
      <Modal
        show={showCountryModal}
        onHide={() => setShowCountryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tạo Country / Destination mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Country Name</Form.Label>
              <Form.Control
                value={countryForm.country_name}
                onChange={(e) =>
                  setCountryForm((prev) => ({
                    ...prev,
                    country_name: e.target.value,
                  }))
                }
                placeholder="VD: China Mobile"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Code</Form.Label>
              <Form.Control
                value={countryForm.destination_code}
                onChange={(e) =>
                  setCountryForm((prev) => ({
                    ...prev,
                    destination_code: e.target.value,
                  }))
                }
                placeholder="VD: 861"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCountryModal(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCreateCountry}>
            <PlusIcon /> Tạo
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <PlusIcon /> Khai báo định tuyến lưu lượng mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleCreate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="fw-bold">
                  Nguồn (Connection) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.source_connection}
                  onChange={(e) =>
                    handleChangeFormRoot("source_connection", e.target.value)
                  }
                  required
                >
                  <option value="">-- Chọn nguồn --</option>
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getConnectionLabel(c.id)}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Label className="fw-bold">
                  Service <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.service}
                  onChange={(e) =>
                    handleChangeFormRoot("service", e.target.value)
                  }
                  required
                >
                  <option value="">-- Chọn service --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Label className="fw-bold">
                  Country / Dest <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select
                    value={formData.country_destination}
                    onChange={(e) =>
                      handleChangeFormRoot(
                        "country_destination",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">-- Chọn --</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.country_name} ({c.destination_code})
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openCountryModal("create")}
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </Col>

              <Col md={12}>
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => handleChangeFormRoot("note", e.target.value)}
                />
              </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">
                Các lựa chọn định tuyến (tổng 100%)
              </h6>
              <div className="small text-muted">
                Tổng tỷ lệ hiện tại:{" "}
                <strong>{getTotalRatio(formData.choices)}%</strong>
              </div>
            </div>

            {formData.choices.map((c, idx) => (
              <Card key={idx} className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold text-primary">
                      Lựa chọn #{idx + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => removeChoice(idx)}
                      disabled={formData.choices.length <= 1}
                    >
                      <TrashIcon /> Xoá
                    </Button>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Tên (tuỳ chọn)</Form.Label>
                      <Form.Control
                        value={c.name}
                        onChange={(e) =>
                          handleChoiceChange(idx, "name", e.target.value)
                        }
                        placeholder="VD: Route chính, Route dự phòng..."
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>
                        Tỷ lệ (%) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={100}
                        value={c.ratio}
                        onChange={(e) =>
                          handleChoiceChange(idx, "ratio", e.target.value)
                        }
                      />
                    </Col>
                  </Row>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">
                      Hướng TGRP (fallback theo priority)
                    </span>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => addHop(idx)}
                    >
                      <PlusIcon /> Thêm hop
                    </Button>
                  </div>

                  {(c.hops || []).map((h, hIndex) => (
                    <Row className="g-3 align-items-end mb-2" key={hIndex}>
                      <Col md={6}>
                        <Form.Label>TGRP</Form.Label>
                        <Form.Select
                          value={h.tgrp}
                          onChange={(e) =>
                            handleHopChange(idx, hIndex, "tgrp", e.target.value)
                          }
                        >
                          <option value="">Chọn TGRP</option>
                          {tgrps.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3}>
                        <Form.Label>Priority</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          value={h.priority}
                          onChange={(e) =>
                            handleHopChange(
                              idx,
                              hIndex,
                              "priority",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col md={3} className="text-end">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeHop(idx, hIndex)}
                          disabled={(c.hops || []).length <= 1}
                        >
                          <TrashIcon /> Xoá hop
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>
            ))}

            <div className="mb-3">
              <Button variant="outline-primary" size="sm" onClick={addChoice}>
                <PlusIcon /> Thêm lựa chọn
              </Button>
            </div>

            <div className="text-end mt-3">
              <Button
                variant="light"
                className="me-2"
                onClick={() => setShowCreate(false)}
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Đang tạo...
                  </>
                ) : (
                  "Tạo rule"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ========== MODAL EDIT ========== */}
      <Modal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <EditIcon /> Sửa định tuyến #{editItem?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editItem && (
            <>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label className="fw-bold">Nguồn</Form.Label>
                  <Form.Select
                    value={editItem.source_connection || ""}
                    onChange={(e) =>
                      handleEditRootChange("source_connection", e.target.value)
                    }
                  >
                    <option value="">Chọn nguồn</option>
                    {configs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getConnectionLabel(c.id)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="fw-bold">Service</Form.Label>
                  <Form.Select
                    value={editItem.service || ""}
                    onChange={(e) =>
                      handleEditRootChange("service", e.target.value)
                    }
                  >
                    <option value="">Chọn service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="fw-bold">Country / Dest</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={editItem.country_destination || ""}
                      onChange={(e) =>
                        handleEditRootChange(
                          "country_destination",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Chọn</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.country_name} ({c.destination_code})
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openCountryModal("edit")}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </Col>

                <Col md={12}>
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editItem.note || ""}
                    onChange={(e) =>
                      handleEditRootChange("note", e.target.value)
                    }
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">Các lựa chọn (tổng 100%)</h6>
                <div className="small text-muted">
                  Tổng tỷ lệ:{" "}
                  <strong>{getTotalRatio(editItem.choices || [])}%</strong>
                </div>
              </div>

              {(editItem.choices || []).map((c, idx) => (
                <Card key={idx} className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-primary">
                        Lựa chọn #{idx + 1}
                      </span>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeEditChoice(idx)}
                        disabled={(editItem.choices || []).length <= 1}
                      >
                        <TrashIcon /> Xoá
                      </Button>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label>Tên</Form.Label>
                        <Form.Control
                          value={c.name || ""}
                          onChange={(e) =>
                            handleEditChoiceChange(idx, "name", e.target.value)
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Tỷ lệ (%)</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          max={100}
                          value={c.ratio}
                          onChange={(e) =>
                            handleEditChoiceChange(idx, "ratio", e.target.value)
                          }
                        />
                      </Col>
                    </Row>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold">Hướng TGRP (fallback)</span>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => addEditHop(idx)}
                      >
                        <PlusIcon /> Thêm hop
                      </Button>
                    </div>

                    {(c.hops || []).map((h, hIndex) => (
                      <Row key={hIndex} className="g-3 align-items-end mb-2">
                        <Col md={6}>
                          <Form.Label>TGRP</Form.Label>
                          <Form.Select
                            value={h.tgrp || ""}
                            onChange={(e) =>
                              handleEditHopChange(
                                idx,
                                hIndex,
                                "tgrp",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Chọn TGRP</option>
                            {tgrps.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={3}>
                          <Form.Label>Priority</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            value={h.priority}
                            onChange={(e) =>
                              handleEditHopChange(
                                idx,
                                hIndex,
                                "priority",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                        <Col md={3} className="text-end">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeEditHop(idx, hIndex)}
                            disabled={(c.hops || []).length <= 1}
                          >
                            <TrashIcon /> Xoá hop
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </Card.Body>
                </Card>
              ))}

              <div className="mb-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addEditChoice}
                >
                  <PlusIcon /> Thêm lựa chọn
                </Button>
              </div>

              <div className="text-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setShowEdit(false)}
                >
                  Đóng
                </Button>
                <Button
                  variant="warning"
                  disabled={submitting}
                  onClick={handleUpdate}
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RoutingDeclarationForm;
