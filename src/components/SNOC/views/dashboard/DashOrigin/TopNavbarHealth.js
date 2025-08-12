import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Clock from "../../../components/Clock"; // ✅ import clock

const TopNavbar = () => {
  const getLinkClass = (navData) =>
    `nav-link fw-semibold px-3 py-2 rounded ${
      navData.isActive ? "bg-white text-primary" : "text-white"
    }`;

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
      <Container fluid>
        {/* === Trái: Brand === */}
        <Navbar.Brand className="fw-bold me-0">
          System Health Automation
        </Navbar.Brand>

        {/* Toggle cho mobile */}
        <Navbar.Toggle aria-controls="topnav-collapse" />

        <Navbar.Collapse id="topnav-collapse" className="w-100">
          {/* === Giữa: Menu === */}
          <Nav className="mx-auto align-items-center">
            <NavLink to="/app/dashboard/origin" className={getLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/healthcheck/devices" className={getLinkClass}>
              Devices
            </NavLink>
            <NavLink to="/healthcheck/schedule" className={getLinkClass}>
              Schedule
            </NavLink>
            <NavLink to="/healthcheck/checks" className={getLinkClass}>
              Health Checks
            </NavLink>
            <NavLink to="/healthcheck/history" className={getLinkClass}>
              Historical Reporting
            </NavLink>
            <NavLink to="/healthcheck/kpi" className={getLinkClass}>
              KPI
            </NavLink>
            <NavLink to="/healthcheck/kpischedule" className={getLinkClass}>
              KPI Schedule
            </NavLink>
          </Nav>

          {/* === Phải: Đồng hồ / user / trạng thái (đẩy sát phải) === */}
          <Nav className="ms-auto align-items-center">
            <span
              className="text-white fw-semibold"
              style={{ fontSize: "0.9rem" }}
            >
              <Clock />
            </span>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
