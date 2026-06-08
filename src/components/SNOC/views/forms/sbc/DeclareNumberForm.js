// src/components/SNOC/views/forms/sbc/DeclareNumberForm.jsx
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
  addServicePrefix,
  deleteServicePrefix,
  fetchConnectionConfigs,
  fetchSbcOptions,
  fetchServicePrefixes,
  updateServicePrefix,
} from "../../../redux/Sbc/sbcConnectionSlice";

const ITEMS_PER_PAGE = 20;

// ====== ICON SVG INLINE (100% OFFLINE) ======
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

const DeclareNumberForm = () => {
  const dispatch = useDispatch();
  const isAdmin = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  }, []);

  const {
    services = [],
    configs = [],
    servicePrefixes = [],
    loadingOptions = false,
    loadingConfigs = false,
    loadingServicePrefixes = false,
    submitting = false,
  } = useSelector((state) => state.sbcConnection || {});

  // Form tạo mới
  const [formData, setFormData] = useState({
    connection: "",
    service: "",
    prefix: "",
    route_code: "",
    note: "",
  });

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = (message, variant = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };

  // Bộ lọc + tìm kiếm + phân trang
  const [filterConnection, setFilterConnection] = useState("");
  const [filterService, setFilterService] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    dispatch(fetchSbcOptions());
    dispatch(fetchConnectionConfigs());
    dispatch(fetchServicePrefixes());
  }, [dispatch]);

  const isLoading = loadingOptions || loadingConfigs || loadingServicePrefixes;

  // ====== XỬ LÝ TẠO MỚI ======
  const handleCreate = (e) => {
    e.preventDefault();
    if (
      !formData.connection ||
      !formData.service ||
      !formData.prefix ||
      !formData.route_code
    ) {
      addToast("Vui lòng điền đầy đủ các trường bắt buộc!", "danger");
      return;
    }

    dispatch(addServicePrefix(formData))
      .unwrap()
      .then(() => {
        addToast(`Đầu số ${formData.prefix} khai báo thành công!`, "success");
        setFormData({
          connection: "",
          service: "",
          prefix: "",
          route_code: "",
          note: "",
        });
        setShowCreate(false);
        dispatch(fetchServicePrefixes());
      })
      .catch((err) =>
        addToast(err?.message || "Lỗi khai báo đầu số", "danger")
      );
  };

  // ====== LỌC + TÌM KIẾM + PHÂN TRANG ======
  const filteredData = useMemo(() => {
    let data = [...servicePrefixes];

    if (filterConnection)
      data = data.filter((p) => String(p.connection) === filterConnection);
    if (filterService)
      data = data.filter((p) => String(p.service) === filterService);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((p) =>
        JSON.stringify(Object.values(p)).toLowerCase().includes(q)
      );
    }

    return data.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [servicePrefixes, filterConnection, filterService, search]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ====== SỬA ======
  const openEdit = (item) => {
    setEditItem({ ...item });
    setShowEdit(true);
  };

  const handleUpdate = () => {
    if (
      !editItem?.connection ||
      !editItem?.service ||
      !editItem?.prefix ||
      !editItem?.route_code
    ) {
      addToast("Vui lòng điền đầy đủ thông tin!", "danger");
      return;
    }

    dispatch(updateServicePrefix({ id: editItem.id, data: editItem }))
      .unwrap()
      .then(() => {
        addToast("Cập nhật thành công!", "success");
        setShowEdit(false);
        dispatch(fetchServicePrefixes());
      })
      .catch(() => addToast("Cập nhật thất bại", "danger"));
  };

  // ====== XÓA ======
  const handleDelete = (item) => {
    if (
      !window.confirm(
        `Xác nhận xóa đầu số ${item.prefix} (route: ${item.route_code})?`
      )
    )
      return;

    dispatch(deleteServicePrefix(item.id))
      .unwrap()
      .then(() => {
        addToast("Xóa thành công!", "success");
        dispatch(fetchServicePrefixes());
      })
      .catch(() => addToast("Xóa thất bại", "danger"));
  };

  // Helper hiển thị tên
  const getConnectionLabel = (id) => {
    const c = configs.find((x) => String(x.id) === String(id));
    return c
      ? `${c.partner_name || "Chưa đặt tên"} — ${c.realm_name || "?"}`
      : `ID ${id}`;
  };

  const getServiceLabel = (id) => {
    const s = services.find((x) => String(x.id) === String(id));
    return s ? s.name : `ID ${id}`;
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
            bg={t.variant}
            onClose={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            delay={6000}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">
                {t.variant === "success" ? "Thành công" : "Lỗi"}
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
        {/* Tiêu đề gọn gàng */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-primary mb-0">Quản Lý Đầu Số Dịch Vụ</h4>
          <small className="text-muted">
            Tổng: <strong>{servicePrefixes.length}</strong> đầu số
          </small>
        </div>

        {/* Thanh công cụ + bộ lọc */}
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="py-3">
            <Row className="g-3 align-items-end">
              <Col lg={3} md={6}>
                <Form.Label className="small fw-semibold mb-1">
                  Đối tác
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterConnection}
                  onChange={(e) => {
                    setFilterConnection(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả đối tác</option>
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.partner_name || "Chưa đặt tên"} — {c.realm_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={3} md={6}>
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

              <Col lg={4} md={8}>
                <Form.Label className="small fw-semibold mb-1">
                  <SearchIcon /> Tìm kiếm
                </Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <SearchIcon />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Đầu số, route code, đối tác, ghi chú..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </Col>

              <Col lg={2} md={4} className="text-end">
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowCreate(true)}
                  >
                    <PlusIcon />{" "}
                    <span className="d-none d-sm-inline">Khai báo mới</span>
                  </Button>
                )}
              </Col>
            </Row>

            {/* <div className="mt-2 text-muted small">
              Đang hiển thị <strong>{paginatedData.length}</strong> / {filteredData.length} đầu số
            </div> */}
          </Card.Body>
        </Card>

        {/* Bảng dữ liệu */}
        <Card className="border-0 shadow">
          <Card.Body className="p-0">
            {loadingServicePrefixes ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="lg" />
                <div className="mt-3 fw-medium">
                  Đang tải danh sách đầu số...
                </div>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "4rem", opacity: 0.3 }}>Inbox</div>
                <p className="mt-3">Chưa có đầu số dịch vụ nào được khai báo</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-dark text-white text-center">
                      <tr style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        <th className="text-center">ID</th>
                        <th>Đối tác / Realm</th>
                        <th>Service</th>
                        <th className="text-center">Đầu số</th>
                        <th className="text-center">Route Code</th>
                        <th>Ghi chú</th>
                        <th className="text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((p) => (
                        <tr key={p.id}>
                          <td className="text-center fw-bold text-primary">
                            {p.id}
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {p.connection_partner ||
                                getConnectionLabel(p.connection)}
                            </div>
                            {/* <small className="text-muted">Conn ID: {p.connection}</small> */}
                          </td>
                          <td>
                            <Badge bg="info" pill className="px-3 py-1">
                              {p.service_name || getServiceLabel(p.service)}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-success px-3 py-1">
                              {p.prefix}
                            </span>
                          </td>
                          <td className="text-center font-monospace">
                            <code className="bg-dark text-white px-3 py-1 rounded">
                              {p.route_code}
                            </code>
                          </td>
                          <td className="text-muted small">{p.note || "—"}</td>
                          <td className="text-center">
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline-warning"
                                className="me-1"
                                onClick={() => openEdit(p)}
                              >
                                <EditIcon />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(p)}
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

                {/* Phân trang */}
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

      {/* ================== MODAL TẠO MỚI ================== */}
      <Modal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <PlusIcon /> Khai báo đầu số dịch vụ mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleCreate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Đối tác <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.connection}
                    onChange={(e) =>
                      setFormData({ ...formData, connection: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Chọn đối tác --</option>
                    {configs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.partner_name || "Chưa đặt tên"} — {c.realm_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Service <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
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
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Đầu số <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    placeholder="1900, 1800, 120..."
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Mã định tuyến <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    placeholder="R1900Viettel01"
                    value={formData.route_code}
                    onChange={(e) =>
                      setFormData({ ...formData, route_code: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end mt-4">
              <Button
                variant="light"
                onClick={() => setShowCreate(false)}
                className="me-2"
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Đang tạo...
                  </>
                ) : (
                  "Tạo đầu số"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ================== MODAL SỬA ================== */}
      <Modal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <EditIcon /> Sửa đầu số dịch vụ #{editItem?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editItem && (
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="fw-bold">Đối tác</Form.Label>
                  <Form.Select
                    value={editItem.connection || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, connection: e.target.value })
                    }
                  >
                    <option value="">Chọn đối tác</option>
                    {configs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.partner_name} — {c.realm_name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label className="fw-bold">Service</Form.Label>
                  <Form.Select
                    value={editItem.service || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, service: e.target.value })
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

                <Col md={6}>
                  <Form.Label className="fw-bold">Đầu số</Form.Label>
                  <Form.Control
                    value={editItem.prefix || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, prefix: e.target.value })
                    }
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="fw-bold">Mã định tuyến</Form.Label>
                  <Form.Control
                    value={editItem.route_code || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, route_code: e.target.value })
                    }
                  />
                </Col>

                <Col md={12}>
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editItem.note || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, note: e.target.value })
                    }
                  />
                </Col>
              </Row>

              <div className="text-end mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowEdit(false)}
                  className="me-2"
                >
                  Đóng
                </Button>
                <Button
                  variant="warning"
                  onClick={handleUpdate}
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeclareNumberForm;
