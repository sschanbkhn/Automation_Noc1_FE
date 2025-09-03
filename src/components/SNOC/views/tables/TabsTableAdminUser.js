import React from "react";
import { Col, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Alert from "../../components/Alert/Alert";
import UserTable from "./UserTable";
const TabsTableAdminUser = () => {
  const navBtn = ({ isActive }) =>
    `btn btn-sm btn-light py-0 ${isActive ? "active" : ""}`;

  return (
    // <React.Fragment>
    <>
      {/* <TopNavbarHealth /> */}
      {/* <WebSocketStatusBanner /> */}
      <Alert />
      <Row>
        <Col>
          <div
            className="btn-group btn-group-sm"
            role="group"
            aria-label="Basic example"
          >
            <NavLink to="/tables/tabstableadminuser" className={navBtn} end>
              User
            </NavLink>
            {/* <NavLink to="/tables/tabstableadmingroup" className={navBtn}>
              Group
            </NavLink>
            <NavLink to="/tables/tabstableadmindepartment" className={navBtn}>
              Department
            </NavLink> */}
          </div>

          <UserTable />
        </Col>
      </Row>
    </>

    // </React.Fragment>
  );
};

export default TabsTableAdminUser;
