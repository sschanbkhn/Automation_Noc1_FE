import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector, Provider } from "react-redux";
import {
  Row,
  Col,
  Form,
  Button,
  Table,
  Spinner,
  Modal,
  Card,
  Pagination,
} from "react-bootstrap";
import snocStore from "../../../store/snocStore";
import {
  fetchHosts,
  deleteHost,
  addHost,
  updateHost,
} from "../../../redux/Hosts/hostsSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import Alert from "../../../components/Alert/Alert";

const HostManagerContent = () => {
  const dispatch = useDispatch();
  const { devices = [], loading = false } = useSelector(
    (state) => state.hosts || {}
  );

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newHost, setNewHost] = useState({
    name: "",
    hostname: "",
    platform: "",
    groups: "",
    username: "",
    password: "",
  });
  const pageSize = 20;

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  useEffect(() => {
    console.log("🔍 newHost:", newHost);
  }, [newHost]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredItems = devices.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.hostname?.toLowerCase().includes(q) ||
      item.platform?.toLowerCase().includes(q) ||
      item.groups?.some((g) => g.toLowerCase().includes(q))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSaveHost = () => {
    const payload = {
      ...newHost,
      groups: newHost.groups
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g),
    };
    if (editing) {
      dispatch(updateHost({ name: newHost.name, data: payload }));
    } else {
      dispatch(addHost(payload));
    }
    setShowModal(false);
    setEditing(false);
    resetHostForm();
  };

  const handleEdit = (host) => {
    setEditing(true);
    setNewHost({
      ...host,
      groups: host.groups?.join(", ") || "",
      username: "",
      password: "",
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditing(false);
    resetHostForm();
    setTimeout(() => setShowModal(true), 0); // 👈 Đợi sau 1 tick để state cập nhật xong
  };

  const resetHostForm = () => {
    setNewHost({
      name: "",
      hostname: "",
      platform: "",
      groups: "",
      username: "",
      password: "",
    });
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title as="h5">Danh sách thiết bị</Card.Title>
              <div className="d-flex">
                <Form
                  onSubmit={(e) => e.preventDefault()}
                  className="d-flex me-2"
                  autoComplete="off"
                >
                  <Form.Control
                    type="text"
                    placeholder="Tìm theo tên, IP, platform, group"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="me-2"
                  />
                </Form>
                <Button variant="success" onClick={handleAddNew}>
                  ➕ Thêm thiết bị
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive className="table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>STT</th>
                        <th
                          onClick={() => handleSort("name")}
                          style={{ cursor: "pointer" }}
                        >
                          Tên
                        </th>
                        <th
                          onClick={() => handleSort("hostname")}
                          style={{ cursor: "pointer" }}
                        >
                          IP
                        </th>
                        <th
                          onClick={() => handleSort("platform")}
                          style={{ cursor: "pointer" }}
                        >
                          Platform
                        </th>
                        <th
                          onClick={() => handleSort("groups")}
                          style={{ cursor: "pointer" }}
                        >
                          Groups
                        </th>
                        {/* <th>Username</th> */}
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map((d, i) => (
                        <tr key={d.name}>
                          <td>{(currentPage - 1) * pageSize + i + 1}</td>
                          <td>{d.name}</td>
                          <td>{d.hostname}</td>
                          <td>{d.platform}</td>
                          <td>{d.groups?.join(", ")}</td>
                          {/* <td>{d.username || "—"}</td> */}
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(d)}
                            >
                              ✏️ Sửa
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Bạn có chắc muốn xoá thiết bị "${d.name}" không?`
                                  )
                                ) {
                                  dispatch(deleteHost(d.name));
                                }
                              }}
                            >
                              🗑️ Xoá
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      {currentPage > 1 && (
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                        />
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        )
                      )}
                      {currentPage < totalPages && (
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                        />
                      )}
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditing(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={newHost.name}
                onChange={(e) =>
                  setNewHost({ ...newHost, name: e.target.value })
                }
                disabled={editing}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>IP</Form.Label>
              <Form.Control
                type="text"
                value={newHost.hostname}
                onChange={(e) =>
                  setNewHost({ ...newHost, hostname: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Platform</Form.Label>
              <Form.Control
                type="text"
                value={newHost.platform}
                onChange={(e) =>
                  setNewHost({ ...newHost, platform: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Groups (phân cách bằng dấu phẩy)</Form.Label>
              <Form.Control
                type="text"
                value={newHost.groups}
                onChange={(e) =>
                  setNewHost({ ...newHost, groups: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="newhost_username"
                autoComplete="off"
                value={newHost.username}
                onChange={(e) =>
                  setNewHost({ ...newHost, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="newhost_password"
                autoComplete="new-password"
                value={newHost.password}
                onChange={(e) =>
                  setNewHost({ ...newHost, password: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setEditing(false);
            }}
          >
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSaveHost}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const HostManager = () => (
  <Provider store={snocStore}>
    <HostManagerContent />
  </Provider>
);

export default HostManager;
