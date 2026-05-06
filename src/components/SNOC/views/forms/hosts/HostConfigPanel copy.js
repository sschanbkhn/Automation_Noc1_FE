import React, { useEffect, useState, useMemo } from "react";
import {
  Button, Card, Col, Form, Modal, Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";

// Redux Actions
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
import {
  addHost,
  deleteHost,
  fetchHosts,
  updateHost,
} from "../../../redux/Hosts/hostsSlice";

import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const HostManager = () => {
  const dispatch = useDispatch();

  // Selectors
  const { devices = [], loading = false } = useSelector((state) => state.hosts || {});
  const { platforms = [] } = useSelector((state) => state.platformDevice || {});
  const { departments = [] } = useSelector((state) => state.department || {});
  const { groups = [] } = useSelector((state) => state.group || {});
  const { user } = useSelector((state) => state.auth || {});

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  const [newHost, setNewHost] = useState({
    name: "", hostname: "", platform: "", platformName: "",
    group: "",        // ID Group chính
    department: "",   // ID Department
    groups: "",       // Tags phụ (chuỗi ngăn cách dấu phẩy)
    username: "", password: "", port: "22", site_code: "", vendor: "", license_throughput: "",
  });

  const pageSize = 20;

  useEffect(() => {
    dispatch(fetchHosts());
    dispatch(fetchPlatforms());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  // 🔹 LỌC GROUP THEO DEPARTMENT (Cascading)
  const displayGroups = useMemo(() => {
    if (!newHost.department) return groups;
    return groups.filter(g => {
      const deptId = g.department?.id || g.department;
      return String(deptId) === String(newHost.department);
    });
  }, [groups, newHost.department]);

  // 🔹 TÍNH NĂNG SORT (SẮP XẾP BẢNG)
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 🔹 TÍNH NĂNG SEARCH (TÌM KIẾM TOÀN DIỆN)
  const filteredItems = devices.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.hostname?.toLowerCase().includes(q) ||
      item.platform?.toLowerCase().includes(q) ||
      item.group?.toLowerCase().includes(q) ||
      item.department?.toLowerCase().includes(q) ||
      item.vendor?.toLowerCase().includes(q) ||
      item.site_code?.toLowerCase().includes(q) ||
      item.groups?.some((g) => g.toLowerCase().includes(q))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    const valA = Array.isArray(a[key]) ? a[key].join(", ") : (a[key] ?? "");
    const valB = Array.isArray(b[key]) ? b[key].join(", ") : (b[key] ?? "");

    if (new Set(["port", "license_throughput"]).has(key)) {
      return direction === "asc" ? (Number(valA) || 0) - (Number(valB) || 0) : (Number(valB) || 0) - (Number(valA) || 0);
    }
    return direction === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 🔹 PAYLOAD CHUẨN GỬI XUỐNG BACKEND
  const handleSaveHost = () => {
    const payload = {
      ...newHost,
      group: newHost.group,             // Ép gửi đúng ID group
      department: newHost.department,   // Ép gửi đúng ID department
      groups: newHost.groups ? newHost.groups.split(",").map(g => g.trim()).filter(Boolean) : [],
    };

    if (!payload.platform && payload.platformName) payload.platform = payload.platformName;
    if (payload.port !== "") payload.port = Number(payload.port);
    if (payload.license_throughput !== "") payload.license_throughput = Number(payload.license_throughput);

    // Xóa biến tạm dùng cho UI
    delete payload.platformName;

    if (editing) {
      dispatch(updateHost({ name: newHost.name, data: payload }));
    } else {
      dispatch(addHost(payload));
    }
    setShowModal(false);
  };

  const handleEdit = (host) => {
    setEditing(true);
    const platformObj = platforms.find((p) => p.name === host.platform);
    const groupObj = groups.find(g => g.name === host.group);
    const deptObj = departments.find(d => d.name === host.department);

    setNewHost({
      ...host,
      platform: platformObj?.id || "",
      platformName: platformObj ? "" : host.platform,
      group: groupObj?.id || "",       
      department: deptObj?.id || "",   
      groups: host.groups?.join(", ") || "", 
      username: host.username === "—" ? "" : host.username,
      password: "",
      port: host.port ?? "22",
      site_code: host.site_code ?? "",
      vendor: host.vendor ?? "",
      license_throughput: host.license_throughput ?? "",
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditing(false);
    
    // Tự động gán nếu Backend chỉ trả về 1 lựa chọn
    const defDept = departments.length === 1 ? departments[0].id : "";
    const validGroups = defDept ? groups.filter(g => String(g.department?.id || g.department) === String(defDept)) : groups;
    const defGroup = validGroups.length === 1 ? validGroups[0].id : "";

    setNewHost({
      name: "", hostname: "", platform: "", platformName: "",
      group: defGroup, department: defDept, groups: "",
      username: "", password: "", port: "22", site_code: "", vendor: "", license_throughput: "",
    });
    setTimeout(() => setShowModal(true), 0);
  };

  const getPlatformLabel = (id) => {
    const p = platforms.find((pl) => pl.id === id);
    return p ? p.name : "";
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <Row className="m-3">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title as="h5" className="mb-0">Quản lý Thiết bị</Card.Title>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên, IP, platform, vendor..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ width: "320px" }}
                />
                <Button variant="success" onClick={handleAddNew}>➕ Thêm thiết bị</Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? <div className="text-center my-4"><Spinner animation="border" /></div> : (
                <>
                  <Table striped bordered hover responsive size="sm" className="text-center align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>STT</th>
                        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                          Tên {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
                        </th>
                        <th onClick={() => handleSort("hostname")} style={{ cursor: "pointer" }}>
                          IP {sortConfig.key === "hostname" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
                        </th>
                        <th onClick={() => handleSort("platform")} style={{ cursor: "pointer" }}>
                          Platform {sortConfig.key === "platform" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
                        </th>
                        <th onClick={() => handleSort("group")} style={{ cursor: "pointer" }}>
                          Group {sortConfig.key === "group" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
                        </th>
                        <th onClick={() => handleSort("department")} style={{ cursor: "pointer" }}>
                          Dept {sortConfig.key === "department" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
                        </th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.length > 0 ? paginatedItems.map((d, i) => {
                        // Logic phân quyền an toàn: Nếu ko có thông tin user, cứ hiện cho an toàn (Backend sẽ chặn nếu sai)
                        const isSuper = user?.is_superuser || user?.is_staff;
                        const isOwner = user?.group_name === d.group;
                        const canEdit = !user || isSuper || isOwner;

                        return (
                          <tr key={d.name}>
                            <td>{(currentPage - 1) * pageSize + i + 1}</td>
                            <td><b>{d.name}</b></td>
                            <td>{d.hostname}</td>
                            <td><span className="badge bg-info text-dark">{d.platform}</span></td>
                            <td>{d.group}</td>
                            <td>{d.department}</td>
                            <td>
                              {canEdit ? (
                                <>
                                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(d)}>✏️</Button>
                                  <Button variant="danger" size="sm" onClick={() => window.confirm(`Xoá ${d.name}?`) && dispatch(deleteHost(d.name))}>🗑️</Button>
                                </>
                              ) : (
                                <span className="text-muted small">Read-only</span>
                              )}
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="7">Không tìm thấy thiết bị nào.</td></tr>
                      )}
                    </tbody>
                  </Table>

                  {/* 🔹 PHÂN TRANG HOÀN CHỈNH */}
                  {totalPages > 0 && (
                    <Pagination className="justify-content-center mt-3">
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages} 
                      />
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Row className="mb-3">
              <Col md={6}><Form.Label className="fw-bold">Tên thiết bị</Form.Label><Form.Control value={newHost.name} onChange={e => setNewHost({...newHost, name: e.target.value})} disabled={editing} /></Col>
              <Col md={6}><Form.Label className="fw-bold">IP Address</Form.Label><Form.Control value={newHost.hostname} onChange={e => setNewHost({...newHost, hostname: e.target.value})} /></Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label className="fw-bold">Platform</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn Platform..."
                  options={platforms.map(p => ({ value: p.id, label: p.name }))}
                  value={newHost.platform ? { value: newHost.platform, label: getPlatformLabel(newHost.platform) } : (newHost.platformName ? {label: newHost.platformName, value: newHost.platformName} : null)}
                  onChange={(opt) => setNewHost({ ...newHost, platform: opt ? opt.value : "", platformName: opt?.__isNew__ ? opt.label : "" })}
                />
              </Col>

              <Col md={4}>
                <Form.Label className="fw-bold">Department</Form.Label>
                <Form.Select 
                  value={newHost.department} 
                  onChange={e => setNewHost({...newHost, department: e.target.value, group: ""})}
                  disabled={departments.length === 1}
                >
                  {departments.length > 1 && <option value="">-- Chọn Dept --</option>}
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label className="fw-bold">Device Group (Phân quyền)</Form.Label>
                <Form.Select 
                  value={newHost.group} 
                  onChange={e => setNewHost({...newHost, group: e.target.value})}
                  disabled={displayGroups.length === 1 && !editing}
                >
                  {displayGroups.length > 1 && <option value="">-- Chọn Group --</option>}
                  {displayGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tags phụ (groups - cách nhau bằng dấu phẩy)</Form.Label>
              <Form.Control value={newHost.groups} onChange={e => setNewHost({...newHost, groups: e.target.value})} placeholder="vd: hanoi, core, backup..." />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}><Form.Label className="fw-bold">Username</Form.Label><Form.Control value={newHost.username} onChange={e => setNewHost({...newHost, username: e.target.value})}/></Col>
              <Col md={6}><Form.Label className="fw-bold">Password</Form.Label><Form.Control type="password" value={newHost.password} onChange={e => setNewHost({...newHost, password: e.target.value})}/></Col>
            </Row>
            
            <Row>
              <Col md={3}><Form.Label className="fw-bold">Port</Form.Label><Form.Control type="number" value={newHost.port} onChange={e => setNewHost({...newHost, port: e.target.value})}/></Col>
              <Col md={3}><Form.Label className="fw-bold">Vendor</Form.Label><Form.Control value={newHost.vendor} onChange={e => setNewHost({...newHost, vendor: e.target.value})}/></Col>
              <Col md={3}><Form.Label className="fw-bold">Site Code</Form.Label><Form.Control value={newHost.site_code} onChange={e => setNewHost({...newHost, site_code: e.target.value})}/></Col>
              <Col md={3}><Form.Label className="fw-bold">License</Form.Label><Form.Control type="number" value={newHost.license_throughput} onChange={e => setNewHost({...newHost, license_throughput: e.target.value})}/></Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveHost}>Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HostManager;