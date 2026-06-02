import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal, Pagination, Row, Spinner, Table, FormControl
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";

// Redux Actions
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { addHost, cloneDevice, deleteHost, fetchHosts, updateHost, } from "../../../redux/Hosts/hostsSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";

import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import snocApi from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
const HostManager = () => {
  const dispatch = useDispatch();

  // Selectors
  const { devices = [], loading = false } = useSelector(
    (state) => state.hosts || {},
  );
  const { platforms = [] } = useSelector((state) => state.platformDevice || {});
  const { departments = [] } = useSelector((state) => state.department || {});
  const { groups = [] } = useSelector((state) => state.group || {});
  // State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneForm, setCloneForm] = useState({
    name: "", hostname: "", username: "", password: "", port: "22",
  });



  // 🛡️ RBAC — đồng bộ với Schedule.js
  const userClaims = useMemo(() => getJwtClaims(), []);
  const isAdmin = useMemo(
    () =>
      userClaims?.role === "admin" ||
      userClaims?.role === "super" ||
      userClaims?.is_superuser ||
      userClaims?.is_staff,
    [userClaims],
  );
  console.log("userClaims:", userClaims);
  console.log("isAdmin:", isAdmin);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // ── Ping / Port Check ────────────────────────────────────────────────────
  const [selectedForPing, setSelectedForPing] = useState(new Set());
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResults, setPingResults] = useState(null);
  const [showPingModal, setShowPingModal] = useState(false);

  // ── Traceroute ───────────────────────────────────────────────────────────
  const [traceTarget, setTraceTarget] = useState(null);    // {name, hostname}
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceResult, setTraceResult] = useState(null);    // API response
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  const [newHost, setNewHost] = useState({
    name: "",
    hostname: "",
    platform: "",
    platformName: "",
    group: "", // ID Group chính
    department: "", // ID Department
    groups: "", // Tags phụ (chuỗi ngăn cách dấu phẩy)
    username: "",
    password: "",
    port: "22",
    site_code: "",
    vendor: "",
    license_throughput: "",
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
    return groups.filter((g) => {
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

  // ── Ping / Port helpers ─────────────────────────────────────────────────
  const togglePingSelect = (name) => {
    setSelectedForPing(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleSelectAllPing = (visibleDevices) => {
    const names = visibleDevices.map(d => d.name);
    const allSelected = names.every(n => selectedForPing.has(n));
    if (allSelected) {
      setSelectedForPing(prev => {
        const next = new Set(prev);
        names.forEach(n => next.delete(n));
        return next;
      });
    } else {
      setSelectedForPing(prev => new Set([...prev, ...names]));
    }
  };

  const runPingCheck = async () => {
    const targets = devices
      .filter(d => selectedForPing.has(d.name))
      .map(d => ({ name: d.name, hostname: d.hostname, port: d.port || 22 }));

    if (!targets.length) return;
    setPingLoading(true);
    setPingResults(null);
    setShowPingModal(true);
    try {
      const res = await snocApi.post("/nornirps/hosts/ping-check/", { targets });
      setPingResults(res.data.results || []);
    } catch (err) {
      setPingResults([{ error: err?.response?.data?.error || "Lỗi kết nối server" }]);
    } finally {
      setPingLoading(false);
    }
  };

  const runTraceroute = async (device) => {
    setTraceTarget(device);
    setTraceResult(null);
    setShowRaw(false);
    setTraceLoading(true);
    setShowTraceModal(true);
    try {
      const res = await snocApi.post("/nornirps/hosts/traceroute/", {
        name: device.name,
        hostname: device.hostname,
        port: device.port || 22,
        max_hops: 20,
      });
      setTraceResult(res.data);
    } catch (err) {
      setTraceResult({ error: err?.response?.data?.error || "Lỗi kết nối server" });
    } finally {
      setTraceLoading(false);
    }
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
      return direction === "asc"
        ? (Number(valA) || 0) - (Number(valB) || 0)
        : (Number(valB) || 0) - (Number(valA) || 0);
    }
    return direction === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // // 🔹 PAYLOAD CHUẨN GỬI XUỐNG BACKEND
  // const handleSaveHost = () => {
  //   const payload = {
  //     ...newHost,
  //     group: newHost.group,             // Ép gửi đúng ID group
  //     department: newHost.department,   // Ép gửi đúng ID department
  //     groups: newHost.groups ? newHost.groups.split(",").map(g => g.trim()).filter(Boolean) : [],
  //   };

  //   if (!payload.platform && payload.platformName) payload.platform = payload.platformName;
  //   if (payload.port !== "") payload.port = Number(payload.port);
  //   if (payload.license_throughput !== "") payload.license_throughput = Number(payload.license_throughput);

  //   // Xóa biến tạm dùng cho UI
  //   delete payload.platformName;

  //   if (editing) {
  //     dispatch(updateHost({ name: newHost.name, data: payload }));
  //   } else {
  //     dispatch(addHost(payload));
  //   }
  //   setShowModal(false);
  // };

  // // 🔹 PAYLOAD CHUẨN GỬI XUỐNG BACKEND
  // const handleSaveHost = () => {
  //   const payload = {
  //     ...newHost,
  //     group: newHost.group,             // Ép gửi đúng ID group
  //     department: newHost.department,   // Ép gửi đúng ID department
  //     groups: newHost.groups ? newHost.groups.split(",").map(g => g.trim()).filter(Boolean) : [],
  //   };

  //   if (!payload.platform && payload.platformName) payload.platform = payload.platformName;
  //   if (payload.port !== "") payload.port = Number(payload.port);
  //   if (payload.license_throughput !== "") payload.license_throughput = Number(payload.license_throughput);

  //   // Xóa biến tạm dùng cho UI
  //   delete payload.platformName;

  //   if (editing) {
  //     dispatch(updateHost({ name: newHost.name, data: payload }));
  //   } else {
  //     dispatch(addHost(payload));
  //   }
  //   setShowModal(false);
  // };

  const handleSaveHost = () => {
    const payload = {
      ...newHost,
      // ✅ Nếu có platformName (tạo mới) thì gửi chuỗi chữ, ngược lại gửi ID số
      platform: newHost.platformName ? newHost.platformName : newHost.platform,
      group: newHost.group,
      department: newHost.department,
      groups: newHost.groups ? newHost.groups.split(",").map(g => g.trim()).filter(Boolean) : [],
    };

    if (payload.port !== "") payload.port = Number(payload.port);
    if (payload.license_throughput !== "") payload.license_throughput = Number(payload.license_throughput);

    // Xóa biến tạm dùng cho UI tránh làm rối Backend
    delete payload.platformName;

    if (editing) {
      dispatch(updateHost({ name: newHost.name, data: payload }));
    } else {
      dispatch(addHost(payload));
    }
    setShowModal(false);
  };

  // const handleEdit = (host) => {
  //   setEditing(true);
  //   const platformObj = platforms.find((p) => p.name === host.platform);
  //   const groupObj    = groups.find(g => g.name === host.group);
  //   const deptObj     = departments.find(d => d.name === host.department);

  //   setNewHost({
  //     ...host,
  //     platform:           platformObj?.id || "",
  //     platformName:       platformObj ? "" : host.platform,
  //     // User thường: giữ nguyên group/dept của thiết bị (không cho đổi)
  //     group:      isAdmin ? (groupObj?.id || "")  : (userClaims?.group_id      ?? groupObj?.id ?? ""),
  //     department: isAdmin ? (deptObj?.id  || "")  : (userClaims?.department_id ?? deptObj?.id  ?? ""),
  //     groups:             host.groups?.join(", ") || "",
  //     username:           host.username === "—" ? "" : host.username,
  //     password:           "",
  //     port:               host.port ?? "22",
  //     site_code:          host.site_code ?? "",
  //     vendor:             host.vendor ?? "",
  //     license_throughput: host.license_throughput ?? "",
  //   });
  //   setShowModal(true);
  // };


  const handleEdit = (host) => {
    setEditing(true);
    const platformObj = platforms.find((p) => p.name === host.platform);
    const groupObj = groups.find(g => g.name === host.group);
    const deptObj = departments.find(d => d.name === host.department);

    setNewHost({
      ...host,
      // ✅ Nếu tìm thấy platform trong DB thì set ID, nếu không (hữu họa) thì điền vào platformName
      platform: platformObj?.id || "",
      platformName: platformObj ? "" : host.platform,
      group: isAdmin ? (groupObj?.id || "") : (userClaims?.group_id ?? groupObj?.id ?? ""),
      department: isAdmin ? (deptObj?.id || "") : (userClaims?.department_id ?? deptObj?.id ?? ""),
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
    setNewHost({
      name: "",
      hostname: "",
      platform: "",
      platformName: "",
      group: !isAdmin ? (userClaims?.group_id ?? "") : "",
      department: !isAdmin ? (userClaims?.department_id ?? "") : "",
      groups: "",
      username: "",
      password: "",
      port: "22",
      site_code: "",
      vendor: "",
      license_throughput: "",
    });
    setTimeout(() => setShowModal(true), 0);
  };

  const getPlatformLabel = (id) => {
    const p = platforms.find((pl) => pl.id === id);
    return p ? p.name : "";
  };
  // clone handle
  const handleClone = (host) => {
    setCloneSource(host);
    setCloneForm({
      name: `${host.name}_clone`,
      hostname: host.hostname,
      username: host.username !== "—" ? host.username : "",
      password: "",   // user phải nhập lại hoặc để trống = giữ nguyên từ Vault
      port: host.port ?? "22",
    });
    setShowCloneModal(true);
  };

  const onConfirmClone = async () => {
    if (!cloneForm.name?.trim())
      return alert("Tên thiết bị mới không được để trống");
    if (!cloneForm.hostname?.trim())
      return alert("Hostname/IP không được để trống");

    await dispatch(cloneDevice({
      sourceName: cloneSource.name,
      payload: {
        name: cloneForm.name.trim().toLowerCase(),
        hostname: cloneForm.hostname.trim().toLowerCase(),
        username: cloneForm.username,
        password: cloneForm.password,
        port: cloneForm.port,
      },
    }));
    setShowCloneModal(false);
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
              <Card.Title as="h5" className="mb-0">
                Quản lý Thiết bị
              </Card.Title>
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên, IP, platform, vendor, site..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: "350px" }}
                />
                {selectedForPing.size > 0 && (
                  <Button
                    variant="info"
                    onClick={runPingCheck}
                    disabled={pingLoading}
                    title="Ping ICMP + kiểm tra TCP port cho các thiết bị đã chọn"
                  >
                    {pingLoading
                      ? <><Spinner animation="border" size="sm" className="me-1" />Đang kiểm tra...</>
                      : <>📡 Ping & Port ({selectedForPing.size})</>
                    }
                  </Button>
                )}
                {selectedForPing.size > 0 && (
                  <Button variant="outline-secondary" size="sm"
                    onClick={() => setSelectedForPing(new Set())}>
                    Bỏ chọn tất cả
                  </Button>
                )}
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
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    size="sm"
                    className="text-center align-middle"
                  >
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 36 }}>
                          <Form.Check
                            type="checkbox"
                            title="Chọn/bỏ chọn tất cả trang này"
                            checked={paginatedItems.length > 0 && paginatedItems.every(d => selectedForPing.has(d.name))}
                            onChange={() => toggleSelectAllPing(paginatedItems)}
                          />
                        </th>
                        <th>STT</th>
                        <th
                          onClick={() => handleSort("name")}
                          style={{ cursor: "pointer" }}
                        >
                          Tên{" "}
                          {sortConfig.key === "name"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("hostname")}
                          style={{ cursor: "pointer" }}
                        >
                          IP{" "}
                          {sortConfig.key === "hostname"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("platform")}
                          style={{ cursor: "pointer" }}
                        >
                          Platform{" "}
                          {sortConfig.key === "platform"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("group")}
                          style={{ cursor: "pointer" }}
                        >
                          Group{" "}
                          {sortConfig.key === "group"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("department")}
                          style={{ cursor: "pointer" }}
                        >
                          Dept{" "}
                          {sortConfig.key === "department"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("port")}
                          style={{ cursor: "pointer" }}
                        >
                          Port{" "}
                          {sortConfig.key === "port"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("vendor")}
                          style={{ cursor: "pointer" }}
                        >
                          Vendor{" "}
                          {sortConfig.key === "vendor"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("site_code")}
                          style={{ cursor: "pointer" }}
                        >
                          Site{" "}
                          {sortConfig.key === "site_code"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleSort("license_throughput")}
                          style={{ cursor: "pointer" }}
                        >
                          License{" "}
                          {sortConfig.key === "license_throughput"
                            ? sortConfig.direction === "asc"
                              ? "🔼"
                              : "🔽"
                            : ""}
                        </th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.length > 0 ? (
                        paginatedItems.map((d, i) => {
                          // Logic phân quyền an toàn: Nếu ko có thông tin user, cứ hiện cho an toàn (Backend sẽ chặn nếu sai)
                          const canEdit =
                            isAdmin || userClaims?.group_name === d.group;


                          return (
                            <tr key={d.name}>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedForPing.has(d.name)}
                                  onChange={() => togglePingSelect(d.name)}
                                />
                              </td>
                              <td>{(currentPage - 1) * pageSize + i + 1}</td>
                              <td><b>{d.name}</b></td>
                              <td>{d.hostname}</td>
                              <td><span className="badge bg-info text-dark">{d.platform}</span></td>
                              <td>{d.group}</td>
                              <td>{d.department}</td>
                              <td>{d.port ?? ""}</td>
                              <td>{d.vendor ?? ""}</td>
                              <td>{d.site_code ?? ""}</td>
                              <td>{d.license_throughput ?? ""}</td>
                              <td style={{ minWidth: "160px" }}>
                                {canEdit ? (
                                  <>
                                    <Button variant="warning" size="sm" className="me-1" onClick={() => handleEdit(d)}>✏️</Button>
                                    <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleClone(d)}>📋</Button>
                                    <Button variant="danger" size="sm" className="me-1" onClick={() => window.confirm(`Xoá ${d.name}?`) && dispatch(deleteHost(d.name))}>🗑️</Button>
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      title={`Traceroute đến ${d.hostname}`}
                                      onClick={() => runTraceroute(d)}
                                    >🔍</Button>
                                  </>
                                ) : (
                                  <span className="text-muted small">Read-only</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan="12">Không tìm thấy thiết bị nào.</td></tr>
                      )}
                    </tbody>
                  </Table>

                  {/* 🔹 PHÂN TRANG HOÀN CHỈNH */}
                  {totalPages > 0 && (
                    <Pagination className="justify-content-center mt-3">
                      <Pagination.Prev
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
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
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Tên thiết bị</Form.Label>
                <Form.Control
                  value={newHost.name}
                  onChange={(e) =>
                    setNewHost({ ...newHost, name: e.target.value })
                  }
                  disabled={editing}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">IP Address</Form.Label>
                <Form.Control
                  value={newHost.hostname}
                  onChange={(e) =>
                    setNewHost({ ...newHost, hostname: e.target.value })
                  }
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label className="fw-bold">Platform</Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn hoặc gõ Platform mới..."
                  options={platforms.map(p => ({ value: p.id, label: p.name }))}

                  // ✅ SỬA TẠI ĐÂY: Logic tính toán value hiển thị trực quan
                  value={
                    newHost.platformName
                      ? { value: newHost.platformName, label: newHost.platformName }
                      : newHost.platform && !isNaN(newHost.platform) // Nếu platform là ID (số)
                        ? { value: newHost.platform, label: getPlatformLabel(newHost.platform) }
                        : null
                  }

                  // ✅ SỬA TẠI ĐÂY: Lưu tách bạch ID và Tên mới
                  onChange={(opt) => {
                    if (!opt) {
                      setNewHost({ ...newHost, platform: "", platformName: "" });
                    } else if (opt.__isNew__) {
                      // Nếu là gõ mới hoàn toàn
                      setNewHost({ ...newHost, platform: "", platformName: opt.value });
                    } else {
                      // Nếu là chọn từ danh sách có sẵn (đã có ID)
                      setNewHost({ ...newHost, platform: opt.value, platformName: "" });
                    }
                  }}
                />
              </Col>

              <Col md={4}>
                <Form.Label className="fw-bold">Department</Form.Label>
                <Form.Select
                  value={newHost.department}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    const filteredGroups = groups.filter(
                      (g) =>
                        String(g.department?.id || g.department) ===
                        String(newDept),
                    );
                    setNewHost({
                      ...newHost,
                      department: newDept,
                      // Nếu dept mới chỉ có 1 group → tự chọn luôn, không để ""
                      group:
                        filteredGroups.length === 1
                          ? String(filteredGroups[0].id)
                          : "",
                    });
                  }}
                  disabled={!isAdmin}
                >
                  {departments.length > 1 && (
                    <option value="">-- Chọn Dept --</option>
                  )}
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label className="fw-bold">
                  Device Group (Phân quyền)
                </Form.Label>
                <Form.Select
                  value={newHost.group}
                  onChange={(e) =>
                    setNewHost({ ...newHost, group: e.target.value })
                  }
                  disabled={!isAdmin}
                >
                  {/* Luôn hiện placeholder để admin có thể chọn lại */}
                  {(isAdmin || displayGroups.length > 1) && (
                    <option value="">-- Chọn Group --</option>
                  )}
                  {displayGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Tags phụ (groups - cách nhau bằng dấu phẩy)
              </Form.Label>
              <Form.Control
                value={newHost.groups}
                onChange={(e) =>
                  setNewHost({ ...newHost, groups: e.target.value })
                }
                placeholder="vd: hanoi, core, backup..."
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Username</Form.Label>
                <Form.Control
                  value={newHost.username}
                  onChange={(e) =>
                    setNewHost({ ...newHost, username: e.target.value })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newHost.password}
                  onChange={(e) =>
                    setNewHost({ ...newHost, password: e.target.value })
                  }
                />
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Label className="fw-bold">Port</Form.Label>
                <Form.Control
                  type="number"
                  value={newHost.port}
                  onChange={(e) =>
                    setNewHost({ ...newHost, port: e.target.value })
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold">Vendor</Form.Label>
                <Form.Control
                  value={newHost.vendor}
                  onChange={(e) =>
                    setNewHost({ ...newHost, vendor: e.target.value })
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold">Site Code</Form.Label>
                <Form.Control
                  value={newHost.site_code}
                  onChange={(e) =>
                    setNewHost({ ...newHost, site_code: e.target.value })
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold">License</Form.Label>
                <Form.Control
                  type="number"
                  value={newHost.license_throughput}
                  onChange={(e) =>
                    setNewHost({
                      ...newHost,
                      license_throughput: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveHost}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── CLONE MODAL ─────────────────────────────────────────────── */}
      <Modal
        show={showCloneModal}
        onHide={() => setShowCloneModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Clone thiết bị: <strong>{cloneSource?.name}</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="fw-bold">
                Tên mới <span className="text-danger">*</span>
              </Form.Label>
              <FormControl
                value={cloneForm.name}
                onChange={(e) =>
                  setCloneForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="tên_thiết_bị_mới"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">
                Hostname / IP <span className="text-danger">*</span>
              </Form.Label>
              <FormControl
                value={cloneForm.hostname}
                onChange={(e) =>
                  setCloneForm((p) => ({ ...p, hostname: e.target.value }))
                }
                placeholder="192.168.1.x"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Port</Form.Label>
              <FormControl
                value={cloneForm.port}
                onChange={(e) =>
                  setCloneForm((p) => ({ ...p, port: e.target.value }))
                }
              />
            </Col>
            <Col md={4}>
              <Form.Label>Username</Form.Label>
              <FormControl
                value={cloneForm.username}
                onChange={(e) =>
                  setCloneForm((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="Giữ nguyên nếu để trống"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Password</Form.Label>
              <FormControl
                type="password"
                value={cloneForm.password}
                onChange={(e) =>
                  setCloneForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Giữ nguyên nếu để trống"
              />
            </Col>
          </Row>
          <small className="text-muted mt-2 d-block">
            Platform, Group, Department sẽ được giữ nguyên từ thiết bị gốc.
            Username/Password để trống = copy từ Vault của thiết bị gốc.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloneModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={onConfirmClone}>
            📋 Clone
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── CLONE MODAL ─────────────────────────────────────────────── */}
      <Modal show={showCloneModal} onHide={() => setShowCloneModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Clone thiết bị: <strong>{cloneSource?.name}</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="fw-bold">
                Tên mới <span className="text-danger">*</span>
              </Form.Label>
              <FormControl
                value={cloneForm.name}
                onChange={e => setCloneForm(p => ({ ...p, name: e.target.value }))}
                placeholder="tên_thiết_bị_mới"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">
                Hostname / IP <span className="text-danger">*</span>
              </Form.Label>
              <FormControl
                value={cloneForm.hostname}
                onChange={e => setCloneForm(p => ({ ...p, hostname: e.target.value }))}
                placeholder="192.168.1.x"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Port</Form.Label>
              <FormControl
                value={cloneForm.port}
                onChange={e => setCloneForm(p => ({ ...p, port: e.target.value }))}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Username</Form.Label>
              <FormControl
                value={cloneForm.username}
                onChange={e => setCloneForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Giữ nguyên nếu để trống"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Password</Form.Label>
              <FormControl
                type="password"
                value={cloneForm.password}
                onChange={e => setCloneForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Giữ nguyên nếu để trống"
              />
            </Col>
          </Row>
          <small className="text-muted mt-2 d-block">
            Platform, Group, Department sẽ được giữ nguyên từ thiết bị gốc.
            Username/Password để trống = copy từ Vault của thiết bị gốc.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloneModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={onConfirmClone}>
            📋 Clone
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Ping / Port Check Results Modal ────────────────────────────────── */}
      <Modal
        show={showPingModal}
        onHide={() => setShowPingModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📡 Kết quả Ping & Kiểm tra Port</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <div className="alert alert-info py-1 px-2 mb-2 small">
            ℹ️ Kết quả kiểm tra <b>từ management server</b> đến thiết bị — phản ánh khả năng kết nối SSH/ICMP từ hệ thống NOC
          </div>
          {pingLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" className="me-2" />
              <span>Đang kiểm tra {selectedForPing.size} thiết bị...</span>
            </div>
          ) : pingResults && pingResults[0]?.error && !pingResults[0]?.name ? (
            <div className="text-danger text-center py-3">❌ {pingResults[0].error}</div>
          ) : (
            <Table bordered size="sm" className="text-center align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Thiết bị</th>
                  <th>IP</th>
                  <th>ICMP Ping</th>
                  <th>TCP Port</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(pingResults || []).map((r, i) => {
                  const icmpOk = r.icmp?.ok;
                  const tcpOk = r.tcp?.ok;
                  const allOk = icmpOk && tcpOk;
                  const partOk = icmpOk || tcpOk;
                  const rowCls = allOk ? "table-success" : partOk ? "table-warning" : "table-danger";
                  return (
                    <tr key={i} className={rowCls}>
                      <td><b>{r.name}</b></td>
                      <td className="font-monospace">{r.hostname}</td>
                      <td>
                        {icmpOk
                          ? <><span className="text-success fw-bold">✅ OK</span><br /><small>{r.icmp.ms} ms</small></>
                          : <><span className="text-danger fw-bold">❌ FAIL</span><br /><small className="text-muted">{r.icmp?.error || "—"}</small></>
                        }
                      </td>
                      <td>
                        {tcpOk
                          ? <><span className="text-success fw-bold">✅ {r.port}</span><br /><small>{r.tcp.ms} ms</small></>
                          : <><span className="text-danger fw-bold">❌ :{r.port}</span><br /><small className="text-muted">{r.tcp?.error || "—"}</small></>
                        }
                      </td>
                      <td>
                        {allOk
                          ? <Badge bg="success">Reachable</Badge>
                          : partOk
                            ? <Badge bg="warning" text="dark">Partial</Badge>
                            : <Badge bg="danger">Unreachable</Badge>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          {pingResults && !pingLoading && (
            <small className="text-muted">
              Tổng: {pingResults.length} |{" "}
              <span className="text-success">✅ {pingResults.filter(r => r.icmp?.ok && r.tcp?.ok).length} OK</span> |{" "}
              <span className="text-danger">❌ {pingResults.filter(r => !r.icmp?.ok || !r.tcp?.ok).length} lỗi</span>
            </small>
          )}
          <div className="d-flex gap-2">
            <Button variant="outline-info" size="sm" onClick={runPingCheck} disabled={pingLoading}>
              🔄 Chạy lại
            </Button>
            <Button variant="secondary" onClick={() => setShowPingModal(false)}>
              Đóng
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* ── Network Diagnostics Modal (Ping + Port + Traceroute) ─────── */}
      <Modal
        show={showTraceModal}
        onHide={() => setShowTraceModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            🔍 Network Diagnostics —{" "}
            <span className="font-monospace text-info">{traceTarget?.hostname}</span>
            <small className="ms-2 text-secondary">{traceTarget?.name}</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto", background: "#0d1117", padding: "1rem" }}>
          <div style={{
            color: "#58a6ff", fontSize: "0.75rem", marginBottom: 12,
            background: "#161b22", border: "1px solid #30363d",
            borderRadius: 4, padding: "4px 10px"
          }}>
            ℹ️ Kết quả từ <b>management server</b> → thiết bị
          </div>

          {traceLoading ? (
            <div className="text-center py-5 text-light">
              <Spinner animation="border" variant="info" className="me-2" />
              <span>Đang kiểm tra <b>{traceTarget?.hostname}</b>...</span>
              <div className="text-muted small mt-2">Ping + Port + Traceroute chạy song song</div>
            </div>
          ) : traceResult?.error && !traceResult?.hops ? (
            <div className="text-danger text-center py-4">❌ {traceResult.error}</div>
          ) : traceResult ? (
            <>
              {/* ── Summary: Ping + Port ─────────────────────────── */}
              <div className="d-flex gap-3 mb-3 flex-wrap">
                {/* ICMP Ping */}
                <div style={{
                  background: traceResult.ping?.ok ? "#0f2d1a" : "#2d0f0f",
                  border: `1px solid ${traceResult.ping?.ok ? "#3fb950" : "#f85149"}`,
                  borderRadius: 6, padding: "8px 16px", minWidth: 140
                }}>
                  <div style={{ color: "#8b949e", fontSize: "0.72rem", marginBottom: 2 }}>ICMP PING</div>
                  {traceResult.ping?.ok
                    ? <><span style={{ color: "#3fb950", fontSize: "1.1rem" }}>✅ OK</span>
                      <span style={{ color: "#8b949e", fontSize: "0.8rem", marginLeft: 8 }}>{traceResult.ping.ms} ms</span></>
                    : <><span style={{ color: "#f85149", fontSize: "1.1rem" }}>❌ FAIL</span>
                      <div style={{ color: "#8b949e", fontSize: "0.72rem" }}>{traceResult.ping?.error || "—"}</div></>
                  }
                </div>
                {/* TCP Port */}
                <div style={{
                  background: traceResult.tcp?.ok ? "#0f2d1a" : "#2d0f0f",
                  border: `1px solid ${traceResult.tcp?.ok ? "#3fb950" : "#f85149"}`,
                  borderRadius: 6, padding: "8px 16px", minWidth: 140
                }}>
                  <div style={{ color: "#8b949e", fontSize: "0.72rem", marginBottom: 2 }}>TCP PORT {traceResult.port}</div>
                  {traceResult.tcp?.ok
                    ? <><span style={{ color: "#3fb950", fontSize: "1.1rem" }}>✅ Open</span>
                      <span style={{ color: "#8b949e", fontSize: "0.8rem", marginLeft: 8 }}>{traceResult.tcp.ms} ms</span></>
                    : <><span style={{ color: "#f85149", fontSize: "1.1rem" }}>❌ Closed</span>
                      <div style={{ color: "#8b949e", fontSize: "0.72rem" }}>{traceResult.tcp?.error || "—"}</div></>
                  }
                </div>
                {/* Traceroute status */}
                <div style={{
                  background: "#161b22", border: "1px solid #30363d",
                  borderRadius: 6, padding: "8px 16px", minWidth: 140
                }}>
                  <div style={{ color: "#8b949e", fontSize: "0.72rem", marginBottom: 2 }}>
                    TRACEROUTE {traceResult.tool ? `(${traceResult.tool})` : ""}
                  </div>
                  {traceResult.status === "unavailable"
                    ? <span style={{ color: "#d29922" }}>⚠️ Không có tool</span>
                    : traceResult.status === "ok"
                      ? <><span style={{ color: "#3fb950" }}>✅ Reached</span>
                        <span style={{ color: "#8b949e", fontSize: "0.8rem", marginLeft: 8 }}>{traceResult.hop_count} hops</span></>
                      : <><span style={{ color: "#d29922" }}>⚠️ {traceResult.status}</span>
                        <span style={{ color: "#8b949e", fontSize: "0.8rem", marginLeft: 8 }}>{traceResult.hop_count || 0} hops</span></>
                  }
                </div>
                <Button size="sm" variant="outline-secondary" className="ms-auto align-self-center"
                  onClick={() => setShowRaw(r => !r)}>
                  {showRaw ? "📊 Bảng" : "📄 Raw"}
                </Button>
              </div>

              {/* ── Traceroute hops / raw ─────────────────────────── */}
              {traceResult.status === "unavailable" ? (
                <div style={{
                  background: "#161b22", border: "1px solid #d29922",
                  borderRadius: 6, padding: "12px 16px", color: "#d29922"
                }}>
                  ⚠️ {traceResult.error}<br />
                  <code style={{ color: "#8b949e", fontSize: "0.8rem" }}>
                    sudo apt install traceroute
                  </code>
                </div>
              ) : showRaw ? (
                <pre style={{
                  color: "#a8ff78", background: "#0d1117", fontSize: "0.78rem",
                  padding: "1rem", borderRadius: 6, overflowX: "auto", margin: 0
                }}>
                  {traceResult.raw || "(no output)"}
                </pre>
              ) : (
                <Table size="sm" style={{ color: "#e6edf3", background: "transparent" }} className="mb-0">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #30363d" }}>
                      {["#", "IP", "Hostname", "RTT 1", "RTT 2", "RTT 3", "Avg"].map(h => (
                        <th key={h} style={{
                          color: "#8b949e", background: "transparent",
                          textAlign: h.startsWith("RTT") || h === "Avg" ? "right" : "left"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(traceResult.hops || []).map((h, i) => {
                      const isLast = i === (traceResult.hops.length - 1);
                      const isStar = !h.ok;
                      const ms = v => v != null
                        ? <span style={{ color: v < 5 ? "#3fb950" : v < 50 ? "#d29922" : "#f85149" }}>{v} ms</span>
                        : <span style={{ color: "#484f58" }}>*</span>;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #21262d", opacity: isStar ? 0.45 : 1 }}>
                          <td style={{ color: "#484f58", width: 36 }}>{h.hop}</td>
                          <td className="font-monospace" style={{ fontSize: "0.82rem" }}>
                            {isStar ? <span style={{ color: "#484f58" }}>* * *</span> : h.ip}
                            {isLast && !isStar && (
                              <Badge bg="success" className="ms-1" style={{ fontSize: "0.6rem" }}>dest</Badge>
                            )}
                          </td>
                          <td style={{ color: "#8b949e", fontSize: "0.78rem" }}>
                            {h.hostname !== h.ip ? h.hostname : "—"}
                          </td>
                          <td style={{ textAlign: "right" }}>{ms(h.ms?.[0])}</td>
                          <td style={{ textAlign: "right" }}>{ms(h.ms?.[1])}</td>
                          <td style={{ textAlign: "right" }}>{ms(h.ms?.[2])}</td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {isStar ? <span style={{ color: "#484f58" }}>—</span> : ms(h.avg_ms)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer style={{ background: "#161b22", borderTop: "1px solid #30363d" }}>
          <Button variant="outline-info" size="sm"
            onClick={() => runTraceroute(traceTarget)} disabled={traceLoading}>
            🔄 Chạy lại
          </Button>
          <Button variant="secondary" onClick={() => setShowTraceModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default HostManager;
