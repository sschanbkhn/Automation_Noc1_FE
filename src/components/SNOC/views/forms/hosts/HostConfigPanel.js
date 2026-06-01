import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Card, Col, Form, Modal, Pagination, Row, Spinner, Table, FormControl 
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
        name:     device.name,
        hostname: device.hostname,
        port:     device.port || 22,
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
              <div className="d-flex gap-2">
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
                            <td style={{ minWidth: "130px" }}>
                              {canEdit ? (
                                <>
                                  <Button variant="warning"       size="sm" className="me-1" onClick={() => handleEdit(d)}>✏️</Button>
                                  <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleClone(d)}>📋</Button>
                                  <Button variant="danger"        size="sm" onClick={() => window.confirm(`Xoá ${d.name}?`) && dispatch(deleteHost(d.name))}>🗑️</Button>
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

    </>
  );
};

export default HostManager;
