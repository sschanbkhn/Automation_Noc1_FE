// File: Schedule.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Card, Col, FormControl, Row, Table, Badge, Spinner, Modal, Form
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  createHealthcheckSchedule,
  deleteHealthcheckSchedule,
  fetchHealthcheckSchedules,
  toggleScheduleEnabled,
  updateHealthcheckSchedule,
} from "../../../redux/Healthcheck/healthcheckSlice";
import {
  fetchDevicesByPlatform,
  fetchPlatforms,
} from "../../../redux/Healthcheck/platformDeviceSlice";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import WebSocketStatusBanner from "./../../../components/WebSocketStatusBanner";
import Alert from "../../../components/Alert/Alert";

// ✅ Import hàm giải mã Token
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

const StatusBadge = ({ status }) => {
  const map = {
    success: { label: "All OK",        color: "success",  icon: "✅" },
    warning: { label: "Có NOK",        color: "warning",  icon: "⚠️" },
    failed:  { label: "Lỗi thực thi",  color: "danger",   icon: "🔴" },
    null:    { label: "Chưa chạy",     color: "secondary", icon: "⏳" },
  };
  const s = map[status] || map.null;
  return <Badge bg={s.color} className="p-1">{s.icon} {s.label}</Badge>;
};
const Schedule = () => {
  useScheduleWebSocket();
  const dispatch = useDispatch();

  // Selectors từ Store
  const { platforms = [], devices = [] } = useSelector((state) => state.platformDevice || {});
  const { scheduleCreating, scheduledTasks = [] } = useSelector((state) => state.pscore || {});
  const { departments = [] } = useSelector((state) => state.department || {});
  const { groups = [] } = useSelector((state) => state.group || {});

  // 🛡️ Bóc thông tin từ JWT Claims
  const userClaims = useMemo(() => getJwtClaims(), []);
  
  const isAdmin = useMemo(() => {
    return userClaims?.role === 'admin' || userClaims?.role === 'super' || userClaims?.is_superuser || userClaims?.is_staff;
  }, [userClaims]);

  // Local State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    node_names: [],
    cron: "",
    start_time: "",
    department: "",
    group: "",
  });

  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchHealthcheckSchedules());
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (formData.platform) {
      dispatch(fetchDevicesByPlatform(formData.platform));
    }
  }, [dispatch, formData.platform]);

  // 🔹 Lọc Group theo Dept (Cascading)
  const displayGroups = useMemo(() => {
    if (!formData.department) return groups;
    return groups.filter(g => String(g.department?.id || g.department) === String(formData.department));
  }, [groups, formData.department]);

  const deviceOptions = useMemo(() => {
    return devices.map((d) => ({
      label: `${d.name} (${d.ip || d.hostname || "no-ip"})`,
      value: d.name,
    }));
  }, [devices]);

  const combinedOptions = [{ label: "-- Chọn tất cả --", value: "__all__" }, ...deviceOptions];

  const handleDeviceChange = (selected) => {
    if (!selected) return setFormData({ ...formData, node_names: [] });
    if (selected.find((opt) => opt.value === "__all__")) {
      setFormData({ ...formData, node_names: deviceOptions });
    } else {
      setFormData({ ...formData, node_names: selected });
    }
  };

  const handleAddNew = () => {
    setEditingTask(null);
    
    // Nếu không phải admin, bóc ID từ token để set cứng
    const defDept = !isAdmin ? userClaims?.department_id : ""; 
    const defGroup = !isAdmin ? userClaims?.group_id : "";

    setFormData({
      name: "", platform: "", node_names: [], cron: "", start_time: "",
      department: defDept || "",
      group: defGroup || "",
    });
    setShowModal(true);
  };

  const handleEdit = (task) => {
    // Tìm ID từ Name trả về từ list
    const deptObj = departments.find(d => d.name === task.department);
    const groupObj = groups.find(g => g.name === task.owner_group);

    setFormData({
      name: task.name,
      platform: task.platform,
      node_names: (task.node_names || []).map(d => ({ label: d, value: d })),
      cron: task.cron,
      department: deptObj?.id || "",
      group: groupObj?.id || "",
      start_time: task.last_run_at ? new Date(task.last_run_at).toISOString().slice(0, 16) : "",
    });
    setEditingTask(task);
    setShowModal(true);
  };

  // const handleSubmit = () => {
  //   const payload = {
  //     ...formData,
  //     node_names: formData.node_names.map(d => d.value),
  //   };

  //   if (editingTask) {
  //     dispatch(updateHealthcheckSchedule({ id: editingTask.id, ...payload })).then(() => {
  //       dispatch(fetchHealthcheckSchedules());
  //       setShowModal(false);
  //     });
  //   } else {
  //     dispatch(createHealthcheckSchedule(payload)).then(() => {
  //       dispatch(fetchHealthcheckSchedules());
  //       setShowModal(false);
  //     });
  //   }
  // };

  // 🔹 Hàm kiểm tra tính hợp lệ của biểu thức Cron
  const validateCron = (expression) => {
    if (!expression) return false;
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5;
  };

const handleSubmit = () => {
    const selectedNames = formData.node_names.map((d) => d.value);

    if (!formData.name || !formData.platform || selectedNames.length === 0 || !formData.cron) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (!validateCron(formData.cron)) {
      alert("Cron không hợp lệ (cần 5 phần: phút giờ ngày tháng tuần)");
      return;
    }

    // ✅ BỔ SUNG ĐẦY ĐỦ CÁC TRƯỜNG VÀO PAYLOAD
    const payload = {
      name: formData.name,
      platform: formData.platform,
      node_names: selectedNames,
      cron: formData.cron,
      start_time: formData.start_time || null,
      department: formData.department, // Gửi Dept ID
      group: formData.group,           // Gửi Group ID
    };

    if (editingTask) {
      dispatch(updateHealthcheckSchedule({ id: editingTask.id, ...payload })).then(() => {
        dispatch(fetchHealthcheckSchedules());
        setShowModal(false);
      });
    } else {
      dispatch(createHealthcheckSchedule(payload)).then(() => {
        dispatch(fetchHealthcheckSchedules());
        setShowModal(false);
      });
    }
  };

  const checkCanAction = (task) => {
    if (isAdmin) return true;
    // So sánh tên group từ Claims với owner_group của task
    return userClaims?.group_name === task.owner_group;
  };

  const filteredTasks = useMemo(() => {
    return scheduledTasks
      .filter((s) => s.name.toLowerCase().includes(searchText.trim().toLowerCase()))
      .sort((a, b) => {
        const { key, direction } = sortConfig;
        let valA = a[key] || "";
        let valB = b[key] || "";
        return direction === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
  }, [scheduledTasks, searchText, sortConfig]);


// ── Helper format datetime ──────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── SortTh: th có thể click sort ────────────────────────────────────────────
const SortTh = ({ colKey, label, sortConfig, setSortConfig }) => (
  <th
    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
    onClick={() =>
      setSortConfig({
        key: colKey,
        direction: sortConfig.key === colKey && sortConfig.direction === "asc" ? "desc" : "asc",
      })
    }
  >
    {label}{" "}
    {sortConfig.key === colKey ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
  </th>
);

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />

      <Row className="m-2">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Quản lý lịch Healthcheck tự động</h5>
              <div className="d-flex gap-2">
                <FormControl 
                   placeholder="Tìm kiếm lịch..." 
                   value={searchText} 
                   onChange={(e) => setSearchText(e.target.value)} 
                   style={{ width: "250px" }} 
                />
                <Button variant="success" onClick={handleAddNew}>➕ Thêm lịch mới</Button>
              </div>
            </Card.Header>

            <Card.Body>

              <Table striped bordered hover responsive size="sm" className="align-middle text-center mt-2">
                <thead className="table-light">
                  <tr>
                    <SortTh colKey="name"       label="Tên"          sortConfig={sortConfig} setSortConfig={setSortConfig} />
                    <th>Platform</th>
                    <th>Cron</th>
                    <th>Thiết bị</th>
                    <th>Dept</th>
                    <th>Group</th>
                    <th>ON/OFF</th>
                    <th>Kết quả</th>
                    <SortTh colKey="last_run_at" label="Lần chạy cuối" sortConfig={sortConfig} setSortConfig={setSortConfig} />
                    {/* ── Chỉ Admin thấy 4 cột audit ── */}
                    {isAdmin && <SortTh colKey="created_at"  label="Ngày tạo"    sortConfig={sortConfig} setSortConfig={setSortConfig} />}
                    {isAdmin && <SortTh colKey="updated_at"  label="Cập nhật"    sortConfig={sortConfig} setSortConfig={setSortConfig} />}
                    {isAdmin && <th>Người tạo</th>}
                    {isAdmin && <th>Người sửa</th>}
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 13 : 9} className="text-muted py-3">
                        Không có lịch nào
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((s) => {
                      const canAct = checkCanAction(s);
                      return (
                        <tr key={s.id}>
                          {/* ── Tên ── */}
                          <td className="fw-bold text-start" style={{ minWidth: 140 }}>
                            {s.name}
                          </td>

                          {/* ── Platform ── */}
                          <td>
                            <Badge bg="info" text="dark">{s.platform}</Badge>
                          </td>

                          {/* ── Cron ── */}
                          <td><code>{s.cron}</code></td>

                          {/* ── Thiết bị ── */}
                          <td
                            className="text-truncate text-start"
                            style={{ maxWidth: 180 }}
                            title={s.node_names?.join(", ")}
                          >
                            {s.node_names?.length > 0
                              ? `${s.node_names[0]}${s.node_names.length > 1 ? ` +${s.node_names.length - 1}` : ""}`
                              : "—"}
                          </td>

                          {/* ── Dept ── */}
                          <td>{s.department || "—"}</td>

                          {/* ── Group ── */}
                          <td>
                            <Badge bg="light" text="dark" className="border">
                              {s.owner_group || "—"}
                            </Badge>
                          </td>

                          {/* ── Toggle ON/OFF ── */}
                          <td>
                            <Button
                              size="sm"
                              variant={s.enabled ? "success" : "secondary"}
                              disabled={!canAct}
                              onClick={() =>
                                dispatch(toggleScheduleEnabled({ id: s.id, enabled: !s.enabled }))
                              }
                            >
                              {s.enabled ? "ON" : "OFF"}
                            </Button>
                          </td>

                          {/* ── Kết quả ── */}
                          <td><StatusBadge status={s.last_run_status} /></td>

                          {/* ── Lần chạy cuối ── */}
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {fmtDate(s.last_run_at)}
                          </td>

                          {/* ── Audit columns (admin only) ── */}
                          {isAdmin && (
                            <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                              {fmtDate(s.created_at)}
                            </td>
                          )}
                          {isAdmin && (
                            <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                              {fmtDate(s.updated_at)}
                            </td>
                          )}
                          {isAdmin && (
                            <td style={{ fontSize: "0.82rem" }} title={s.creator_email}>
                              {s.creator_email || "—"}
                            </td>
                          )}
                          {isAdmin && (
                            <td style={{ fontSize: "0.82rem" }} title={s.updater_email}>
                              {s.updater_email || "—"}
                            </td>
                          )}

                          {/* ── Hành động ── */}
                          <td>
                            {canAct ? (
                              <div className="d-flex gap-1 justify-content-center">
                                <Button variant="warning" size="sm" onClick={() => handleEdit(s)}>
                                  ✏️
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    window.confirm(`Xóa lịch "${s.name}"?`) &&
                                    dispatch(deleteHealthcheckSchedule(s.id))
                                  }
                                >
                                  🗑️
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted small">Read-only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🔹 MODAL THÊM/SỬA LỊCH */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{editingTask ? "📝 Cập nhật lịch trình" : "⏰ Tạo lịch healthcheck mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Tên lịch trình</Form.Label>
                <Form.Control 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="VD: Daily Check Core"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Thời gian bắt đầu (Dự kiến)</Form.Label>
                <Form.Control 
                  type="datetime-local" 
                  value={formData.start_time} 
                  onChange={e => setFormData({...formData, start_time: e.target.value})} 
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Department</Form.Label>
                <Form.Select 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value, group: ""})}
                  disabled={!isAdmin} // Chỉ Admin mới được chọn Dept
                >
                  <option value="">-- Chọn Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Group sở hữu (Phân quyền)</Form.Label>
                <Form.Select 
                  value={formData.group} 
                  onChange={e => setFormData({...formData, group: e.target.value})}
                  disabled={!isAdmin} // Chỉ Admin mới được chọn Group
                >
                  <option value="">-- Chọn Group --</option>
                  {displayGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label className="fw-bold">Platform</Form.Label>
                <Form.Select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                  <option value="">-- Chọn Platform --</option>
                  {platforms.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={8}>
                <Form.Label className="fw-bold">Thiết bị</Form.Label>
                <Select 
                  isMulti 
                  options={combinedOptions} 
                  value={formData.node_names} 
                  onChange={handleDeviceChange} 
                  placeholder="Chọn thiết bị..."
                  isDisabled={!formData.platform}
                />
              </Col>
            </Row>

            <Form.Group>
              <Form.Label className="fw-bold">Biểu thức Cron</Form.Label>
              <Form.Control 
                value={formData.cron} 
                onChange={e => setFormData({...formData, cron: e.target.value})} 
                placeholder="*/5 * * * * (Phút Giờ Ngày Tháng Tuần)"
              />
              <Form.Text className="text-muted">Định dạng 5 trường chuẩn Celery Beat.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={scheduleCreating}>
            {scheduleCreating ? <Spinner size="sm" /> : "Lưu dữ liệu"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Schedule;