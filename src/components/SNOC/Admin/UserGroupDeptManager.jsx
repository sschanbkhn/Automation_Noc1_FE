// UserGroupDeptManager.jsx  — THAY THẾ
import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { getJwtClaims, getSnocToken, setSnocToken, snocApiNoAuth } from "../api/snocApiWithAutoToken";
import AccessScopeTab from "./AccessScopeTab";
import DepartmentsTab  from "./DepartmentsTab";
import GroupsTab        from "./GroupsTab";
import UsersTab         from "./UsersTab";

const UserGroupDeptManager = () => {
  const [activeKey, setActiveKey] = useState("users");
  const navigate   = useNavigate();
  const location   = useLocation();
  const claims     = getJwtClaims();
  const isSuper    = claims?.is_superuser || claims?.role === "super";
  const displayName = claims?.username || claims?.email || "";

  const handleLogout = async () => {
    try {
      const token = getSnocToken();
      if (token) {
        await snocApiNoAuth.post("/users/logout", {}, {
          headers: { Authorization: token },
        });
      }
    } catch (_) {}
    finally {
      setSnocToken(null, { persist: true });
      navigate("/snoc/login", { replace: true, state: { from: location } });
    }
  };

  return (
    <div className="container-fluid py-3">
      {/* Header bar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0 fw-semibold">Quản trị Tổ chức &amp; Phân quyền</h5>
        <div className="d-flex align-items-center gap-3">
          {displayName && (
            <span className="text-muted d-flex align-items-center" style={{ fontSize: 13 }}>
              <i className="bi bi-person-circle me-1" />
              {displayName}
            </span>
          )}
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center"
            onClick={handleLogout}
            title="Đăng xuất SNOC"
          >
            <i className="bi bi-box-arrow-right me-1" />
            Đăng xuất
          </button>
        </div>
      </div>

      <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="mb-3" justify>
        <Tab eventKey="users"   title="👤 Người dùng"><UsersTab /></Tab>
        <Tab eventKey="groups"  title="👥 Nhóm"><GroupsTab /></Tab>
        <Tab eventKey="depts"   title="🏢 Phòng ban"><DepartmentsTab /></Tab>
        {isSuper && (
          <Tab eventKey="scopes" title="🔐 Phạm vi truy cập"><AccessScopeTab /></Tab>
        )}
      </Tabs>
    </div>
  );
};

export default UserGroupDeptManager;
