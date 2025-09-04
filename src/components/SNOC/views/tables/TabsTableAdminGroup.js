import React from "react";
import { Row, Col } from "react-bootstrap";
import GroupTable from "./GroupTable";
import { NavLink } from "react-router-dom";

const TabsTableAdminUser = () => {
  const navBtn = ({ isActive }) =>
    `btn btn-sm btn-light py-0 ${isActive ? "active" : ""}`;

  return (
    <React.Fragment>
      <Row>
        <Col>
          <div className="btn-group btn-group-sm" role="group" aria-label="Basic example">
            <NavLink to="/tables/tabstableadminuser" className={navBtn}>
              User
            </NavLink>
            <NavLink to="/tables/tabstableadmingroup" className={navBtn} end>
              Group
            </NavLink>
            <NavLink to="/tables/tabstableadmindepartment" className={navBtn}>
              Department
            </NavLink>
          </div>

          <GroupTable />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default TabsTableAdminUser;
