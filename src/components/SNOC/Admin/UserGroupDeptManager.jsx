// UserGroupDeptManager.jsx  — THAY THẾ
import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { getJwtClaims } from "../api/snocApiWithAutoToken";
import AccessScopeTab from "./AccessScopeTab";
import DepartmentsTab  from "./DepartmentsTab";
import GroupsTab        from "./GroupsTab";
import UsersTab         from "./UsersTab";

const UserGroupDeptManager = () => {
  const [activeKey, setActiveKey] = useState("users");
  const claims  = getJwtClaims();
  const isSuper = claims?.is_superuser || claims?.role === "super";

  return (
    <div className="container-fluid py-3">
      <h5 className="mb-3 fw-semibold">Quản trị Tổ chức & Phân quyền</h5>
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
