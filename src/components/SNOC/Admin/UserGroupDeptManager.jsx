// src/components/Admin/UserGroupDeptManager.jsx
import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import DepartmentsTab from "./DepartmentsTab";
import GroupsTab from "./GroupsTab";
import UsersTab from "./UsersTab";

const UserGroupDeptManager = () => {
  const [activeKey, setActiveKey] = useState("users");
  return (
    <div className="container-fluid py-3">
      <h5 className="mb-3">Quản trị Người dùng / Nhóm / Phòng ban</h5>
      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k)}
        className="mb-3"
        justify
      >
        <Tab eventKey="users" title="Người dùng">
          <UsersTab />
        </Tab>
        <Tab eventKey="groups" title="Nhóm">
          <GroupsTab />
        </Tab>
        <Tab eventKey="departments" title="Phòng ban">
          <DepartmentsTab />
        </Tab>
      </Tabs>
    </div>
  );
};

export default UserGroupDeptManager;
