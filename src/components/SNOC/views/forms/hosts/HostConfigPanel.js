import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form, Modal, Nav, Pagination, Row, Spinner, Table, FormControl
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";

// Redux Actions
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  addHost, cloneDevice, deleteHost, fetchHosts, updateHost,
  fetchNfviHosts, addNfviHost, updateNfviHost, deleteNfviHost,
  addDeviceApp, deleteDeviceApp,
  fetchK8sClusters, addK8sCluster, deleteK8sCluster,
  fetchAllDeviceApps,
} from "../../../redux/Hosts/hostsSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import snocApi from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
const HostManager = () => {
  const dispatch = useDispatch();

  // Selectors
  const {
    devices = [], loading = false,
    nfviHosts = [], loadingNfvi = false,
    k8sClusters = [], loadingK8s = false,
    allDeviceApps = [],
  } = useSelector((state) => state.hosts || {});
  const { platforms = [] } = useSelector((state) => state.platformDevice || {});
  const { departments = [] } = useSelector((state) => state.department || {});
  const { groups = [] } = useSelector((state) => state.group || {});
  // State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneLoading, setCloneLoading] = useState(false);
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
  const [saving, setSaving] = useState(false);

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

  // ── Danh sách IP bổ sung khi thêm/sửa device ───────────────────────────
  const [newHostApps, setNewHostApps] = useState([]);
  const addNewAppRow = () =>
    setNewHostApps(prev => [...prev, { app_name: "", hostname: "", port: "22", platform: "", username: "", password: "" }]);
  const updateAppRow = (idx, field, val) =>
    setNewHostApps(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const removeAppRow = (idx) => {
    const row = newHostApps[idx];
    if (row?._existing && newHost.name) {
      if (!window.confirm(`Xóa app "${row.app_name}" khỏi thiết bị "${newHost.name}"?`)) return;
      dispatch(deleteDeviceApp({ deviceName: newHost.name, appName: row.app_name }))
        .then(() => dispatch(fetchAllDeviceApps()));
    }
    setNewHostApps(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Tab navigation ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("devices");

  // ── Thiết bị nhiều IP (DeviceApplication) ──────────────────────────────
  const [appsSearch, setAppsSearch] = useState("");
  const [appsPage, setAppsPage]     = useState(1);
  const appsPageSize = 20;
  const [showAppModal, setShowAppModal] = useState(false);
  const [appDevice, setAppDevice]       = useState(null);
  const [savingApp, setSavingApp]       = useState(false);
  const [appForm, setAppForm] = useState({ app_name: "", hostname: "", port: "22", platform: "", username: "", password: "" });
  const [editingApp, setEditingApp] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState("");
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [importingBulk, setImportingBulk] = useState(false);
  const [importResults, setImportResults] = useState([]);

  // ── NFVI Hosts ─────────────────────────────────────────────────────────
  const [nfviSearch, setNfviSearch] = useState("");
  const [nfviPage, setNfviPage]     = useState(1);
  const nfviPageSize = 20;
  const [showNfviModal, setShowNfviModal]   = useState(false);
  const [editingNfvi, setEditingNfvi]       = useState(false);
  const [savingNfvi, setSavingNfvi]         = useState(false);
  const [nfviForm, setNfviForm] = useState({
    name: "", hostname: "", oob_ip: "", host_type: "baremetal",
    port: "22", username: "", password: "", department: "", group: "",
  });

  // ── K8s / CNIS ─────────────────────────────────────────────────────────
  const [k8sSubTab, setK8sSubTab]         = useState("clusters");
  const [clusterSearch, setClusterSearch] = useState("");
  const [clusterPage, setClusterPage]     = useState(1);
  const [k8sNodeSearch, setK8sNodeSearch] = useState("");
  const [k8sNodePage, setK8sNodePage]     = useState(1);
  const k8sPageSize = 20;
  const [showK8sClusterModal, setShowK8sClusterModal] = useState(false);
  const [savingK8sCluster, setSavingK8sCluster]       = useState(false);
  const [k8sClusterForm, setK8sClusterForm] = useState({
    name: "", api_endpoint: "", namespace: "default", kubeconfig: "", department: "", group: "",
  });
  const [showK8sNodeModal, setShowK8sNodeModal] = useState(false);
  const [editingK8sNode, setEditingK8sNode]     = useState(false);
  const [savingK8sNode, setSavingK8sNode]       = useState(false);
  const [k8sNodeForm, setK8sNodeForm] = useState({
    name: "", hostname: "", oob_ip: "", port: "22", username: "", password: "",
    k8s_cluster: "", department: "", group: "",
  });

  useEffect(() => {
    dispatch(fetchHosts());
    dispatch(fetchPlatforms());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
    dispatch(fetchNfviHosts());
    dispatch(fetchK8sClusters());
    dispatch(fetchAllDeviceApps());
  }, [dispatch]);

  // 🔹 LỌC GROUP THEO DEPARTMENT (Cascading)
  const displayGroups = useMemo(() => {
    if (!newHost.department) return groups;
    return groups.filter((g) => {
      const deptId = g.department?.id || g.department;
      return String(deptId) === String(newHost.department);
    });
  }, [groups, newHost.department]);

  // ── Derived data cho 3 tab mới ─────────────────────────────────────────
  const k8sNodes = useMemo(() => nfviHosts.filter(h => h.host_type === "k8s_node"), [nfviHosts]);
  const nfviOnly = useMemo(() => nfviHosts.filter(h => h.host_type !== "k8s_node"), [nfviHosts]);

  const filteredNfvi = useMemo(() => {
    const q = nfviSearch.toLowerCase();
    return nfviOnly.filter(h =>
      h.name?.toLowerCase().includes(q) || h.hostname?.includes(q) || h.group?.toLowerCase().includes(q)
    );
  }, [nfviOnly, nfviSearch]);
  const totalNfviPages = Math.ceil(filteredNfvi.length / nfviPageSize);
  const paginatedNfvi  = filteredNfvi.slice((nfviPage - 1) * nfviPageSize, nfviPage * nfviPageSize);

  const filteredClusters = useMemo(() => {
    const q = clusterSearch.toLowerCase();
    return k8sClusters.filter(c => c.name?.toLowerCase().includes(q) || c.api_endpoint?.toLowerCase().includes(q));
  }, [k8sClusters, clusterSearch]);
  const totalClusterPages = Math.ceil(filteredClusters.length / k8sPageSize);
  const paginatedClusters = filteredClusters.slice((clusterPage - 1) * k8sPageSize, clusterPage * k8sPageSize);

  const filteredK8sNodes = useMemo(() => {
    const q = k8sNodeSearch.toLowerCase();
    return k8sNodes.filter(n => n.name?.toLowerCase().includes(q) || n.hostname?.includes(q));
  }, [k8sNodes, k8sNodeSearch]);
  const totalK8sNodePages = Math.ceil(filteredK8sNodes.length / k8sPageSize);
  const paginatedK8sNodes = filteredK8sNodes.slice((k8sNodePage - 1) * k8sPageSize, k8sNodePage * k8sPageSize);

  const appGroups = useMemo(() => {
    const q = appsSearch.toLowerCase();
    const map = {};
    for (const a of allDeviceApps) {
      if (q && !(
        a.device_name?.toLowerCase().includes(q) ||
        a.app_name?.toLowerCase().includes(q) ||
        a.hostname?.includes(q)
      )) continue;
      if (!map[a.device_name]) map[a.device_name] = [];
      map[a.device_name].push(a);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [allDeviceApps, appsSearch]);
  const totalAppsPages = Math.ceil(appGroups.length / appsPageSize);
  const paginatedGroups = appGroups.slice((appsPage - 1) * appsPageSize, appsPage * appsPageSize);

  const displayGroupsNfvi = useMemo(() => {
    if (!nfviForm.department) return groups;
    return groups.filter(g => String(g.department?.id || g.department) === String(nfviForm.department));
  }, [groups, nfviForm.department]);

  const displayGroupsK8s = useMemo(() => {
    if (!k8sNodeForm.department) return groups;
    return groups.filter(g => String(g.department?.id || g.department) === String(k8sNodeForm.department));
  }, [groups, k8sNodeForm.department]);

  // ── DeviceApplication handlers ─────────────────────────────────────────
  const handleOpenAddApp = (device) => {
    setEditingApp(false);
    setAppDevice(device);
    setAppForm({ app_name: "", hostname: "", port: "22", platform: "", username: "", password: "" });
    setShowAppModal(true);
  };

  const handleOpenEditApp = (app) => {
    setEditingApp(true);
    setAppDevice({ name: app.device_name });
    setAppForm({
      app_name: app.app_name,
      hostname: app.hostname,
      port: String(app.port ?? "22"),
      platform: app.platform_id ? String(app.platform_id) : "",
      username: app.username || "",
      password: "",
    });
    setShowAppModal(true);
  };

  const handleSaveApp = async () => {
    if (!appForm.app_name || !appForm.hostname || !appDevice) return;
    setSavingApp(true);
    try {
      await dispatch(addDeviceApp({
        deviceName: appDevice.name,
        data: { ...appForm, port: appForm.port !== "" ? Number(appForm.port) : 22 },
      })).unwrap();
      dispatch(fetchAllDeviceApps());
      setShowAppModal(false);
    } finally { setSavingApp(false); }
  };

  const handleParseCsv = (text) => {
    setImportCsvText(text);
    const lines = text.trim().split("\n").filter(l => l.trim());
    setImportPreviewRows(lines.map(line => {
      const parts = line.split(",").map(p => p.trim());
      const [device_name = "", app_name = "", hostname = "", port = "22", platform = "", username = "", password = ""] = parts;
      return { device_name, app_name, hostname, port, platform, username, password,
        _valid: !!(device_name && app_name && hostname) };
    }));
  };

  const handleBulkImport = async () => {
    const rows = importPreviewRows.filter(r => r._valid);
    setImportingBulk(true);
    const results = [];
    for (const row of rows) {
      try {
        await dispatch(addDeviceApp({
          deviceName: row.device_name,
          data: { app_name: row.app_name, hostname: row.hostname,
            port: Number(row.port) || 22, platform: row.platform,
            username: row.username, password: row.password },
        })).unwrap();
        results.push({ ...row, status: "ok" });
      } catch (err) {
        results.push({ ...row, status: "error", error: err?.message });
      }
    }
    setImportResults(results);
    setImportingBulk(false);
    dispatch(fetchAllDeviceApps());
  };

  // ── NFVI handlers ──────────────────────────────────────────────────────
  const handleNfviAddNew = () => {
    setEditingNfvi(false);
    setNfviForm({
      name: "", hostname: "", oob_ip: "", host_type: "baremetal",
      port: "22", username: "", password: "",
      department: !isAdmin ? (userClaims?.department_id ?? "") : "",
      group: !isAdmin ? (userClaims?.group_id ?? "") : "",
    });
    setShowNfviModal(true);
  };

  const handleNfviEdit = (h) => {
    const groupObj = groups.find(g => g.name === h.group);
    const deptObj  = departments.find(d => d.name === h.department);
    setEditingNfvi(true);
    setNfviForm({
      name: h.name, hostname: h.hostname, oob_ip: h.oob_ip || "",
      host_type: h.host_type || "baremetal", port: h.port ?? "22",
      username: h.username || "", password: "",
      department: deptObj?.id || "", group: groupObj?.id || "",
    });
    setShowNfviModal(true);
  };

  const handleSaveNfvi = async () => {
    const payload = {
      ...nfviForm,
      port: nfviForm.port !== "" ? Number(nfviForm.port) : 22,
    };
    setSavingNfvi(true);
    try {
      if (editingNfvi) {
        await dispatch(updateNfviHost({ name: nfviForm.name, data: payload })).unwrap();
      } else {
        await dispatch(addNfviHost(payload)).unwrap();
      }
      setShowNfviModal(false);
    } finally { setSavingNfvi(false); }
  };

  // ── K8s handlers ──────────────────────────────────────────────────────
  const handleOpenAddK8sCluster = () => {
    setK8sClusterForm({
      name: "", api_endpoint: "", namespace: "default", kubeconfig: "",
      department: !isAdmin ? (userClaims?.department_id ?? "") : "",
      group: !isAdmin ? (userClaims?.group_id ?? "") : "",
    });
    setShowK8sClusterModal(true);
  };

  const handleSaveK8sCluster = async () => {
    setSavingK8sCluster(true);
    try {
      await dispatch(addK8sCluster(k8sClusterForm)).unwrap();
      setShowK8sClusterModal(false);
    } finally { setSavingK8sCluster(false); }
  };

  const handleOpenAddK8sNode = () => {
    setEditingK8sNode(false);
    setK8sNodeForm({
      name: "", hostname: "", oob_ip: "", port: "22", username: "", password: "",
      k8s_cluster: "", department: !isAdmin ? (userClaims?.department_id ?? "") : "",
      group: !isAdmin ? (userClaims?.group_id ?? "") : "",
    });
    setShowK8sNodeModal(true);
  };

  const handleSaveK8sNode = async () => {
    const payload = { ...k8sNodeForm, host_type: "k8s_node", port: k8sNodeForm.port !== "" ? Number(k8sNodeForm.port) : 22 };
    setSavingK8sNode(true);
    try {
      if (editingK8sNode) {
        await dispatch(updateNfviHost({ name: k8sNodeForm.name, data: payload })).unwrap();
      } else {
        await dispatch(addNfviHost(payload)).unwrap();
      }
      setShowK8sNodeModal(false);
    } finally { setSavingK8sNode(false); }
  };

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

  const handleSaveHost = async () => {
    const validApps = newHostApps.filter(a => a.app_name.trim() && a.hostname.trim());
    if (!newHost.hostname?.trim() && validApps.length === 0) {
      alert("Cần có IP chính hoặc ít nhất 1 sub-IP app.");
      return;
    }

    const payload = {
      ...newHost,
      hostname: newHost.hostname?.trim() || null,
      platform: newHost.platformName ? newHost.platformName : newHost.platform,
      group: newHost.group,
      department: newHost.department,
      groups: newHost.groups ? newHost.groups.split(",").map(g => g.trim()).filter(Boolean) : [],
      apps: validApps.map(({ _existing, ...a }) => ({ ...a, port: a.port !== "" ? Number(a.port) : 22 })),
    };

    if (payload.port !== "") payload.port = Number(payload.port);
    if (payload.license_throughput !== "") payload.license_throughput = Number(payload.license_throughput);

    delete payload.platformName;

    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateHost({ name: newHost.name, data: payload })).unwrap();
      } else {
        await dispatch(addHost(payload)).unwrap();
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
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

    // Load apps hiện có của thiết bị vào form
    const existingApps = allDeviceApps
      .filter(a => a.device_name === host.name)
      .map(a => ({
        _existing: true,       // đánh dấu app đã có trong DB
        app_name: a.app_name,
        hostname: a.hostname || "",
        port: String(a.port ?? "22"),
        platform: a.platform_id ? String(a.platform_id) : "",
        username: a.username || "",
        password: "",
      }));
    setNewHostApps(existingApps);
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
    setNewHostApps([]);
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

    setCloneLoading(true);
    try {
      await dispatch(cloneDevice({
        sourceName: cloneSource.name,
        payload: {
          name: cloneForm.name.trim().toLowerCase(),
          hostname: cloneForm.hostname.trim().toLowerCase(),
          username: cloneForm.username,
          password: cloneForm.password,
          port: cloneForm.port,
        },
      })).unwrap();
      setShowCloneModal(false);
    } finally {
      setCloneLoading(false);
    }
  };



  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <Row className="m-3">
        <Col md={12}>
          <Card>
            <Card.Header className="pb-0">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title as="h5" className="mb-0">Quản lý Thiết bị</Card.Title>
                {activeTab === "devices" && (
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <Form.Control
                      type="text"
                      placeholder="Tìm theo tên, IP, platform, vendor, site..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      style={{ width: "320px" }}
                    />
                    {selectedForPing.size > 0 && (
                      <Button variant="info" onClick={runPingCheck} disabled={pingLoading}
                        title="Ping ICMP + kiểm tra TCP port cho các thiết bị đã chọn">
                        {pingLoading
                          ? <><Spinner animation="border" size="sm" className="me-1" />Đang kiểm tra...</>
                          : <>📡 Ping & Port ({selectedForPing.size})</>}
                      </Button>
                    )}
                    {selectedForPing.size > 0 && (
                      <Button variant="outline-secondary" size="sm" onClick={() => setSelectedForPing(new Set())}>
                        Bỏ chọn tất cả
                      </Button>
                    )}
                    <Button variant="success" onClick={handleAddNew}>➕ Thêm thiết bị</Button>
                  </div>
                )}
                {activeTab === "apps" && (
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Control size="sm" placeholder="Tìm thiết bị / app / IP..."
                      value={appsSearch}
                      onChange={e => { setAppsSearch(e.target.value); setAppsPage(1); }}
                      style={{ width: 260 }} />
                    <Button variant="outline-secondary" onClick={() => { setImportCsvText(""); setImportPreviewRows([]); setImportResults([]); setShowImportModal(true); }}>📥 Import CSV</Button>
                    {isAdmin && (
                      <Button variant="outline-success" onClick={handleAddNew}>➕ Thêm thiết bị</Button>
                    )}
                    <Button variant="success" onClick={() => handleOpenAddApp(null)}>➕ Thêm Sub-IP</Button>
                  </div>
                )}
                {activeTab === "nfvi" && isAdmin && (
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Control size="sm" placeholder="Tìm NFVI host..."
                      value={nfviSearch}
                      onChange={e => { setNfviSearch(e.target.value); setNfviPage(1); }}
                      style={{ width: 220 }} />
                    <Button variant="success" onClick={handleNfviAddNew}>➕ Thêm NFVI Host</Button>
                  </div>
                )}
                {activeTab === "k8s" && isAdmin && (
                  <div className="d-flex gap-2 align-items-center">
                    {k8sSubTab === "clusters" && <Button variant="success" onClick={handleOpenAddK8sCluster}>➕ Thêm Cluster</Button>}
                    {k8sSubTab === "nodes" && <Button variant="success" onClick={handleOpenAddK8sNode}>➕ Thêm Node</Button>}
                  </div>
                )}
              </div>
              <Nav variant="tabs" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                <Nav.Item><Nav.Link eventKey="devices">Thiết bị ({devices.length})</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="apps">Nhiều IP ({allDeviceApps.length})</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="nfvi">NFVI Hosts ({nfviOnly.length})</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="k8s">K8s / CNIS ({k8sNodes.length})</Nav.Link></Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {/* ── Tab: Thiết bị ─────────────────────────────────────────── */}
              {activeTab === "devices" && loading ? (
                <div className="text-center my-4"><Spinner animation="border" /></div>
              ) : activeTab === "devices" && (
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
                              <td>{d.platform ? <span className="badge bg-info text-dark">{d.platform}</span> : <span className="badge bg-secondary">Container</span>}</td>
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

              {/* ── Tab: Nhiều IP (DeviceApplication) ───────────────────────── */}
              {activeTab === "apps" && (
                <>
                  <Table bordered responsive size="sm" className="text-center align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 46 }}>STT</th>
                        <th className="text-start">Thiết bị / IP</th>
                        <th>Port</th>
                        <th>Platform</th>
                        <th>Username</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedGroups.length > 0 ? paginatedGroups.map(([devName, apps], gi) => {
                        const mainDev = devices.find(d => d.name === devName);
                        return (
                          <React.Fragment key={devName}>
                            {/* Hàng thiết bị (header group) */}
                            <tr style={{ background: "#e7f1ff", borderTop: "2px solid #9ec5fe" }}>
                              <td className="fw-semibold text-muted">{(appsPage - 1) * appsPageSize + gi + 1}</td>
                              <td className="text-start">
                                <b>{devName}</b>
                                <span className="ms-2 font-monospace text-primary" style={{ fontSize: "0.85rem" }}>
                                  {mainDev?.hostname || "—"}
                                </span>
                                <Badge bg="light" text="dark" className="ms-1 border" style={{ fontSize: "0.65rem" }}>main</Badge>
                                <Badge bg="info" className="ms-2" style={{ fontSize: "0.7rem" }}>{apps.length} IP phụ</Badge>
                              </td>
                              <td>{mainDev?.port ?? 22}</td>
                              <td>{mainDev?.platform ? <Badge bg="info" text="dark">{mainDev.platform}</Badge> : "—"}</td>
                              <td>{mainDev?.username || "—"}</td>
                              <td>
                                {isAdmin && (
                                  <Button size="sm" variant="outline-success"
                                    onClick={() => handleOpenAddApp({ name: devName })}
                                    title="Thêm IP phụ cho thiết bị này">
                                    + IP
                                  </Button>
                                )}
                              </td>
                            </tr>
                            {/* Hàng IP phụ */}
                            {apps.map((a) => (
                              <tr key={a.id} style={{ background: "#fff" }}>
                                <td></td>
                                <td className="text-start ps-4">
                                  <span className="text-muted me-1" style={{ fontSize: "0.8rem" }}>↳</span>
                                  <Badge bg="dark" className="me-2">{a.app_name}</Badge>
                                  <span className="font-monospace" style={{ fontSize: "0.85rem" }}>{a.hostname}</span>
                                </td>
                                <td>{a.port}</td>
                                <td>{a.platform ? <Badge bg="secondary">{a.platform}</Badge> : <span className="text-muted">kế thừa</span>}</td>
                                <td>{a.username || <span className="text-muted">kế thừa</span>}</td>
                                <td>
                                  {isAdmin && (
                                    <>
                                      <Button size="sm" variant="outline-primary" className="me-1"
                                        onClick={() => handleOpenEditApp(a)}>✏️</Button>
                                      <Button size="sm" variant="outline-danger"
                                        onClick={() => window.confirm(`Xóa ${a.app_name} của ${a.device_name}?`) &&
                                          dispatch(deleteDeviceApp({ deviceName: a.device_name, appName: a.app_name }))
                                            .then(() => dispatch(fetchAllDeviceApps()))
                                        }>🗑️</Button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      }) : (
                        <tr><td colSpan="6">Chưa có thiết bị nào có IP phụ.</td></tr>
                      )}
                    </tbody>
                  </Table>
                  {totalAppsPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      <Pagination.Prev onClick={() => setAppsPage(p => Math.max(p - 1, 1))} disabled={appsPage === 1} />
                      {[...Array(totalAppsPages)].map((_, i) => (
                        <Pagination.Item key={i + 1} active={i + 1 === appsPage} onClick={() => setAppsPage(i + 1)}>{i + 1}</Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => setAppsPage(p => Math.min(p + 1, totalAppsPages))} disabled={appsPage === totalAppsPages} />
                    </Pagination>
                  )}
                </>
              )}

              {/* ── Tab: NFVI Hosts ──────────────────────────────────────────── */}
              {activeTab === "nfvi" && (
                <>
                  {loadingNfvi ? <div className="text-center my-4"><Spinner animation="border" /></div> : (
                    <>
                      <Table striped bordered hover responsive size="sm" className="text-center align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th>STT</th><th>Tên</th><th>Management IP</th><th>OOB IP</th>
                            <th>Loại</th><th>Port</th><th>Username</th>
                            <th>Dept</th><th>Group</th><th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedNfvi.length > 0 ? paginatedNfvi.map((h, i) => (
                            <tr key={h.id || h.name}>
                              <td>{(nfviPage - 1) * nfviPageSize + i + 1}</td>
                              <td><b>{h.name}</b></td>
                              <td className="font-monospace">{h.hostname}</td>
                              <td className="font-monospace text-muted">{h.oob_ip || "—"}</td>
                              <td>
                                <Badge bg={h.host_type === "baremetal" ? "secondary" : "info"}>
                                  {h.host_type || "baremetal"}
                                </Badge>
                              </td>
                              <td>{h.port ?? 22}</td>
                              <td>{h.username || "—"}</td>
                              <td>{h.department || "—"}</td>
                              <td>{h.group || "—"}</td>
                              <td style={{ minWidth: 100 }}>
                                {isAdmin ? (
                                  <>
                                    <Button variant="warning" size="sm" className="me-1" onClick={() => handleNfviEdit(h)}>✏️</Button>
                                    <Button variant="danger" size="sm"
                                      onClick={() => window.confirm(`Xóa NFVI Host '${h.name}'?`) && dispatch(deleteNfviHost(h.name))}>
                                      🗑️
                                    </Button>
                                  </>
                                ) : <span className="text-muted small">Read-only</span>}
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan="10">Không có NFVI Host nào.</td></tr>
                          )}
                        </tbody>
                      </Table>
                      {totalNfviPages > 1 && (
                        <Pagination className="justify-content-center mt-3">
                          <Pagination.Prev onClick={() => setNfviPage(p => Math.max(p - 1, 1))} disabled={nfviPage === 1} />
                          {[...Array(totalNfviPages)].map((_, i) => (
                            <Pagination.Item key={i + 1} active={i + 1 === nfviPage} onClick={() => setNfviPage(i + 1)}>{i + 1}</Pagination.Item>
                          ))}
                          <Pagination.Next onClick={() => setNfviPage(p => Math.min(p + 1, totalNfviPages))} disabled={nfviPage === totalNfviPages} />
                        </Pagination>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ── Tab: K8s / CNIS ──────────────────────────────────────────── */}
              {activeTab === "k8s" && (
                <>
                  <Nav variant="pills" className="mb-3" activeKey={k8sSubTab} onSelect={setK8sSubTab}>
                    <Nav.Item><Nav.Link eventKey="clusters">Clusters ({k8sClusters.length})</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="nodes">K8s / CNIS Nodes ({k8sNodes.length})</Nav.Link></Nav.Item>
                  </Nav>

                  {k8sSubTab === "clusters" && (
                    <>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control size="sm" placeholder="Tìm cluster..."
                          value={clusterSearch}
                          onChange={e => { setClusterSearch(e.target.value); setClusterPage(1); }}
                          style={{ width: 280 }} />
                      </div>
                      {loadingK8s ? <div className="text-center"><Spinner animation="border" /></div> : (
                        <>
                          <Table striped bordered hover responsive size="sm" className="text-center align-middle">
                            <thead className="table-dark">
                              <tr>
                                <th>STT</th><th>Tên</th><th>API Endpoint</th><th>Namespace</th>
                                <th>Dept</th><th>Group</th><th>Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedClusters.length > 0 ? paginatedClusters.map((c, i) => (
                                <tr key={c.id || c.name}>
                                  <td>{(clusterPage - 1) * k8sPageSize + i + 1}</td>
                                  <td><b>{c.name}</b></td>
                                  <td className="font-monospace text-break">{c.api_endpoint}</td>
                                  <td>{c.namespace || "default"}</td>
                                  <td>{c.department || "—"}</td>
                                  <td>{c.group || "—"}</td>
                                  <td>
                                    {isAdmin && (
                                      <Button variant="danger" size="sm"
                                        onClick={() => window.confirm(`Xóa cluster '${c.name}'?`) && dispatch(deleteK8sCluster(c.name))}>
                                        🗑️
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              )) : <tr><td colSpan="7">Chưa có cluster nào.</td></tr>}
                            </tbody>
                          </Table>
                          {totalClusterPages > 1 && (
                            <Pagination className="justify-content-center mt-3">
                              <Pagination.Prev onClick={() => setClusterPage(p => Math.max(p - 1, 1))} disabled={clusterPage === 1} />
                              {[...Array(totalClusterPages)].map((_, i) => (
                                <Pagination.Item key={i + 1} active={i + 1 === clusterPage} onClick={() => setClusterPage(i + 1)}>{i + 1}</Pagination.Item>
                              ))}
                              <Pagination.Next onClick={() => setClusterPage(p => Math.min(p + 1, totalClusterPages))} disabled={clusterPage === totalClusterPages} />
                            </Pagination>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {k8sSubTab === "nodes" && (
                    <>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control size="sm" placeholder="Tìm node..."
                          value={k8sNodeSearch}
                          onChange={e => { setK8sNodeSearch(e.target.value); setK8sNodePage(1); }}
                          style={{ width: 280 }} />
                      </div>
                      {loadingNfvi ? <div className="text-center"><Spinner animation="border" /></div> : (
                        <>
                          <Table striped bordered hover responsive size="sm" className="text-center align-middle">
                            <thead className="table-dark">
                              <tr>
                                <th>STT</th><th>Tên</th><th>Mgmt IP</th><th>OOB IP</th>
                                <th>Cluster</th><th>Port</th><th>Username</th>
                                <th>Dept</th><th>Group</th><th>Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedK8sNodes.length > 0 ? paginatedK8sNodes.map((n, i) => (
                                <tr key={n.id || n.name}>
                                  <td>{(k8sNodePage - 1) * k8sPageSize + i + 1}</td>
                                  <td><b>{n.name}</b></td>
                                  <td className="font-monospace">{n.hostname}</td>
                                  <td className="font-monospace text-muted">{n.oob_ip || "—"}</td>
                                  <td>{n.k8s_cluster || "—"}</td>
                                  <td>{n.port ?? 22}</td>
                                  <td>{n.username || "—"}</td>
                                  <td>{n.department || "—"}</td>
                                  <td>{n.group || "—"}</td>
                                  <td style={{ minWidth: 100 }}>
                                    {isAdmin ? (
                                      <>
                                        <Button variant="warning" size="sm" className="me-1"
                                          onClick={() => {
                                            const groupObj = groups.find(g => g.name === n.group);
                                            const deptObj  = departments.find(d => d.name === n.department);
                                            setEditingK8sNode(true);
                                            setK8sNodeForm({
                                              name: n.name, hostname: n.hostname, oob_ip: n.oob_ip || "",
                                              port: n.port ?? "22", username: n.username || "", password: "",
                                              k8s_cluster: n.k8s_cluster || "",
                                              department: deptObj?.id || "", group: groupObj?.id || "",
                                            });
                                            setShowK8sNodeModal(true);
                                          }}>✏️</Button>
                                        <Button variant="danger" size="sm"
                                          onClick={() => window.confirm(`Xóa node '${n.name}'?`) && dispatch(deleteNfviHost(n.name))}>
                                          🗑️
                                        </Button>
                                      </>
                                    ) : <span className="text-muted small">Read-only</span>}
                                  </td>
                                </tr>
                              )) : <tr><td colSpan="10">Chưa có node nào.</td></tr>}
                            </tbody>
                          </Table>
                          {totalK8sNodePages > 1 && (
                            <Pagination className="justify-content-center mt-3">
                              <Pagination.Prev onClick={() => setK8sNodePage(p => Math.max(p - 1, 1))} disabled={k8sNodePage === 1} />
                              {[...Array(totalK8sNodePages)].map((_, i) => (
                                <Pagination.Item key={i + 1} active={i + 1 === k8sNodePage} onClick={() => setK8sNodePage(i + 1)}>{i + 1}</Pagination.Item>
                              ))}
                              <Pagination.Next onClick={() => setK8sNodePage(p => Math.min(p + 1, totalK8sNodePages))} disabled={k8sNodePage === totalK8sNodePages} />
                            </Pagination>
                          )}
                        </>
                      )}
                    </>
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
                <Form.Label className="fw-bold">
                  IP Address{" "}
                  {newHostApps.length > 0 && !newHost.hostname && (
                    <span className="ms-1 badge bg-info fw-normal" style={{ fontSize: "0.7rem" }}>
                      Thiết bị đại diện
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  value={newHost.hostname}
                  onChange={(e) =>
                    setNewHost({ ...newHost, hostname: e.target.value })
                  }
                  placeholder={newHostApps.length > 0 ? "Để trống nếu chỉ dùng sub-IP apps" : ""}
                />
                {newHostApps.length > 0 && !newHost.hostname && (
                  <Form.Text className="text-muted">
                    IP chính không bắt buộc khi đã có {newHostApps.length} sub-IP app.
                  </Form.Text>
                )}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label className="fw-bold">
                  Platform
                  {!newHost.platform && !newHost.platformName && (
                    <span className="ms-2 badge bg-secondary fw-normal">Container (không SSH)</span>
                  )}
                </Form.Label>
                <CreatableSelect
                  isClearable
                  placeholder="Chọn platform hoặc để trống (container device)..."
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

            {/* ── Danh sách IP bổ sung (blade / card / app) ─────────────── */}
            <hr className="my-3" />
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="fw-bold mb-0">
                Danh sách IP bổ sung{" "}
                <small className="text-muted fw-normal">
                  (blade / card / app — tùy chọn)
                </small>
              </Form.Label>
              <Button size="sm" variant="outline-primary" onClick={addNewAppRow}>
                + Thêm IP
              </Button>
            </div>

            {newHostApps.length > 0 && (
              <Table size="sm" bordered className="mb-1">
                <thead className="table-light">
                  <tr>
                    <th>Nhãn (App Name)</th>
                    <th>IP Address</th>
                    <th style={{ width: 80 }}>Port</th>
                    <th>Platform</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {newHostApps.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <Form.Control
                          size="sm"
                          placeholder="VD: Blade-A, MML..."
                          value={row.app_name}
                          onChange={(e) => updateAppRow(idx, "app_name", e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          placeholder="10.x.x.x"
                          value={row.hostname}
                          onChange={(e) => updateAppRow(idx, "hostname", e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={row.port}
                          onChange={(e) => updateAppRow(idx, "port", e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={row.platform || ""}
                          onChange={(e) => updateAppRow(idx, "platform", e.target.value)}
                        >
                          <option value="">-- Kế thừa --</option>
                          {platforms.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          value={row.username}
                          onChange={(e) => updateAppRow(idx, "username", e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="password"
                          value={row.password}
                          onChange={(e) => updateAppRow(idx, "password", e.target.value)}
                        />
                      </td>
                      <td className="text-center align-middle">
                        <Button
                          size="sm"
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => removeAppRow(idx)}
                        >
                          ✕
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveHost} disabled={saving}>
            {saving ? <><Spinner animation="border" size="sm" className="me-1" />Đang lưu...</> : "Lưu thay đổi"}
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
          <Button variant="success" onClick={onConfirmClone} disabled={cloneLoading}>
            {cloneLoading ? <><Spinner animation="border" size="sm" className="me-1" />Đang clone...</> : "📋 Clone"}
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

      {/* ── Modal: Thêm Sub-IP (DeviceApplication) ──────────────────────────── */}
      <Modal show={showAppModal} onHide={() => setShowAppModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingApp ? `Chỉnh sửa Sub-IP — ${appDevice?.name}` : appDevice ? `Thêm Sub-IP — ${appDevice.name}` : "Thêm Sub-IP mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            {!appDevice && (
              <Row className="g-2 mb-2">
                <Col md={12}>
                  <Form.Label className="fw-bold">Thiết bị <span className="text-danger">*</span></Form.Label>
                  <Select
                    options={devices.map(d => ({ value: d.name, label: d.name }))}
                    styles={SELECT_STYLES}
                    isClearable
                    placeholder="-- Chọn thiết bị --"
                    onChange={v => setAppDevice(v ? { name: v.value } : null)}
                  />
                </Col>
              </Row>
            )}
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="fw-bold">App Name <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="MML, OMT, NBI..."
                  value={appForm.app_name}
                  disabled={editingApp}
                  onChange={e => setAppForm({ ...appForm, app_name: e.target.value.toUpperCase() })} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">IP Address <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="10.x.x.x"
                  value={appForm.hostname}
                  onChange={e => setAppForm({ ...appForm, hostname: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Port</Form.Label>
                <Form.Control type="number" value={appForm.port}
                  onChange={e => setAppForm({ ...appForm, port: e.target.value })} />
              </Col>
              <Col md={8}>
                <Form.Label className="fw-bold">Platform <small className="text-muted fw-normal">(để trống = kế thừa từ thiết bị cha)</small></Form.Label>
                <Form.Select value={appForm.platform || ""}
                  onChange={e => setAppForm({ ...appForm, platform: e.target.value })}>
                  <option value="">-- Kế thừa platform từ thiết bị cha --</option>
                  {platforms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Username</Form.Label>
                <Form.Control placeholder="Để trống = kế thừa"
                  value={appForm.username}
                  onChange={e => setAppForm({ ...appForm, username: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Password</Form.Label>
                <Form.Control type="password" value={appForm.password} autoComplete="new-password"
                  onChange={e => setAppForm({ ...appForm, password: e.target.value })} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAppModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveApp}
            disabled={savingApp || !appForm.app_name || !appForm.hostname || !appDevice}>
            {savingApp ? <><Spinner animation="border" size="sm" className="me-1" />Đang lưu...</> : editingApp ? "Cập nhật" : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: Import Sub-IP từ CSV ─────────────────────────────────────── */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>📥 Import Sub-IP từ CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-1">
            Format mỗi dòng: <code>device_name,app_name,ip,port,platform,username,password</code><br />
            <code>port</code>, <code>platform</code>, <code>username</code>, <code>password</code> có thể để trống.
          </p>
          <Form.Control as="textarea" rows={6} placeholder={"MSS01,MML,10.1.1.1,22,,,\nMSS02,NBI,10.1.1.2,,,,"}
            value={importCsvText} onChange={e => handleParseCsv(e.target.value)} className="font-monospace mb-3" />
          {importPreviewRows.length > 0 && (
            <>
              <p className="fw-bold mb-1">Preview ({importPreviewRows.filter(r => r._valid).length} dòng hợp lệ / {importPreviewRows.length} tổng):</p>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                <Table size="sm" bordered>
                  <thead className="table-light">
                    <tr>
                      <th>#</th><th>Device</th><th>App Name</th><th>IP</th><th>Port</th><th>Platform</th><th>Username</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreviewRows.map((r, i) => {
                      const res = importResults.find(x => x.device_name === r.device_name && x.app_name === r.app_name);
                      return (
                        <tr key={i} className={!r._valid ? "table-danger" : res?.status === "ok" ? "table-success" : res?.status === "error" ? "table-danger" : ""}>
                          <td>{i + 1}</td>
                          <td>{r.device_name}</td>
                          <td>{r.app_name}</td>
                          <td className="font-monospace">{r.hostname}</td>
                          <td>{r.port || 22}</td>
                          <td>{r.platform || <span className="text-muted">kế thừa</span>}</td>
                          <td>{r.username || <span className="text-muted">kế thừa</span>}</td>
                          <td>
                            {!r._valid ? "❌ thiếu field bắt buộc"
                              : res?.status === "ok" ? "✅"
                              : res?.status === "error" ? `❌ ${res.error}`
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>Đóng</Button>
          <Button variant="primary"
            disabled={importingBulk || importPreviewRows.filter(r => r._valid).length === 0}
            onClick={handleBulkImport}>
            {importingBulk
              ? <><Spinner animation="border" size="sm" className="me-1" />Đang import...</>
              : `Import ${importPreviewRows.filter(r => r._valid).length} dòng`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: NFVI Host ─────────────────────────────────────────────────── */}
      <Modal show={showNfviModal} onHide={() => setShowNfviModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingNfvi ? "Cập nhật NFVI Host" : "Thêm NFVI Host mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Tên <span className="text-danger">*</span></Form.Label>
                <Form.Control value={nfviForm.name} disabled={editingNfvi}
                  placeholder="vd: HLR01-NODE01"
                  onChange={e => setNfviForm({ ...nfviForm, name: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Management IP <span className="text-danger">*</span></Form.Label>
                <Form.Control value={nfviForm.hostname} placeholder="10.x.x.x"
                  onChange={e => setNfviForm({ ...nfviForm, hostname: e.target.value })} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">OOB IP (IPMI/BMC)</Form.Label>
                <Form.Control value={nfviForm.oob_ip} placeholder="10.x.x.x (không bắt buộc)"
                  onChange={e => setNfviForm({ ...nfviForm, oob_ip: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Loại</Form.Label>
                <Form.Select value={nfviForm.host_type}
                  onChange={e => setNfviForm({ ...nfviForm, host_type: e.target.value })}>
                  <option value="baremetal">Baremetal</option>
                  <option value="vm_host">VM Host (Hypervisor)</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Label className="fw-bold">Port</Form.Label>
                <Form.Control type="number" value={nfviForm.port}
                  onChange={e => setNfviForm({ ...nfviForm, port: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Username</Form.Label>
                <Form.Control value={nfviForm.username}
                  onChange={e => setNfviForm({ ...nfviForm, username: e.target.value })} />
              </Col>
              <Col md={5}>
                <Form.Label className="fw-bold">Password</Form.Label>
                <Form.Control type="password" value={nfviForm.password} autoComplete="new-password"
                  onChange={e => setNfviForm({ ...nfviForm, password: e.target.value })} />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Label className="fw-bold">Department</Form.Label>
                <Form.Select value={nfviForm.department} disabled={!isAdmin}
                  onChange={e => setNfviForm({ ...nfviForm, department: e.target.value, group: "" })}>
                  <option value="">-- Chọn Dept --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Group</Form.Label>
                <Form.Select value={nfviForm.group} disabled={!isAdmin}
                  onChange={e => setNfviForm({ ...nfviForm, group: e.target.value })}>
                  <option value="">-- Chọn Group --</option>
                  {displayGroupsNfvi.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNfviModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveNfvi}
            disabled={savingNfvi || !nfviForm.name || !nfviForm.hostname}>
            {savingNfvi ? <><Spinner animation="border" size="sm" className="me-1" />Đang lưu...</> : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: K8s Cluster ───────────────────────────────────────────────── */}
      <Modal show={showK8sClusterModal} onHide={() => setShowK8sClusterModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm K8s Cluster mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Row className="g-2 mb-2">
              <Col md={5}>
                <Form.Label className="fw-bold">Tên <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="vd: cnis-cluster-01"
                  value={k8sClusterForm.name}
                  onChange={e => setK8sClusterForm({ ...k8sClusterForm, name: e.target.value })} />
              </Col>
              <Col md={7}>
                <Form.Label className="fw-bold">API Endpoint <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="https://10.x.x.x:6443"
                  value={k8sClusterForm.api_endpoint}
                  onChange={e => setK8sClusterForm({ ...k8sClusterForm, api_endpoint: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Namespace</Form.Label>
                <Form.Control value={k8sClusterForm.namespace}
                  onChange={e => setK8sClusterForm({ ...k8sClusterForm, namespace: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Department</Form.Label>
                <Form.Select value={k8sClusterForm.department} disabled={!isAdmin}
                  onChange={e => setK8sClusterForm({ ...k8sClusterForm, department: e.target.value, group: "" })}>
                  <option value="">-- Chọn Dept --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Group</Form.Label>
                <Form.Select value={k8sClusterForm.group} disabled={!isAdmin}
                  onChange={e => setK8sClusterForm({ ...k8sClusterForm, group: e.target.value })}>
                  <option value="">-- Chọn Group --</option>
                  {groups.filter(g => !k8sClusterForm.department || String(g.department?.id || g.department) === String(k8sClusterForm.department))
                    .map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-bold">Kubeconfig (YAML)</Form.Label>
                <Form.Control as="textarea" rows={6} placeholder="Dán kubeconfig YAML vào đây..."
                  value={k8sClusterForm.kubeconfig}
                  onChange={e => setK8sClusterForm({ ...k8sClusterForm, kubeconfig: e.target.value })} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowK8sClusterModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveK8sCluster}
            disabled={savingK8sCluster || !k8sClusterForm.name || !k8sClusterForm.api_endpoint}>
            {savingK8sCluster ? <><Spinner animation="border" size="sm" className="me-1" />Đang lưu...</> : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: K8s / CNIS Node ───────────────────────────────────────────── */}
      <Modal show={showK8sNodeModal} onHide={() => setShowK8sNodeModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingK8sNode ? "Cập nhật K8s Node" : "Thêm K8s / CNIS Node mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Tên <span className="text-danger">*</span></Form.Label>
                <Form.Control value={k8sNodeForm.name} disabled={editingK8sNode}
                  placeholder="vd: cnis-node-01"
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, name: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Management IP <span className="text-danger">*</span></Form.Label>
                <Form.Control value={k8sNodeForm.hostname} placeholder="10.x.x.x"
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, hostname: e.target.value })} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">OOB IP</Form.Label>
                <Form.Control value={k8sNodeForm.oob_ip} placeholder="10.x.x.x (không bắt buộc)"
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, oob_ip: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">K8s Cluster</Form.Label>
                <Form.Select value={k8sNodeForm.k8s_cluster}
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, k8s_cluster: e.target.value })}>
                  <option value="">-- Không thuộc cluster --</option>
                  {k8sClusters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Label className="fw-bold">Port</Form.Label>
                <Form.Control type="number" value={k8sNodeForm.port}
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, port: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Username</Form.Label>
                <Form.Control value={k8sNodeForm.username}
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, username: e.target.value })} />
              </Col>
              <Col md={5}>
                <Form.Label className="fw-bold">Password</Form.Label>
                <Form.Control type="password" value={k8sNodeForm.password} autoComplete="new-password"
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, password: e.target.value })} />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Label className="fw-bold">Department</Form.Label>
                <Form.Select value={k8sNodeForm.department} disabled={!isAdmin}
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, department: e.target.value, group: "" })}>
                  <option value="">-- Chọn Dept --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Group</Form.Label>
                <Form.Select value={k8sNodeForm.group} disabled={!isAdmin}
                  onChange={e => setK8sNodeForm({ ...k8sNodeForm, group: e.target.value })}>
                  <option value="">-- Chọn Group --</option>
                  {displayGroupsK8s.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowK8sNodeModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveK8sNode}
            disabled={savingK8sNode || !k8sNodeForm.name || !k8sNodeForm.hostname}>
            {savingK8sNode ? <><Spinner animation="border" size="sm" className="me-1" />Đang lưu...</> : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default HostManager;
