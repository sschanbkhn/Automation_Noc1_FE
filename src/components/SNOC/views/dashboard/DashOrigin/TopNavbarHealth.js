import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const TopNavbar = () => {
  const getLinkClass = (navData) =>
    `nav-link fw-semibold px-3 py-2 rounded ${
      navData.isActive ? "bg-white text-primary" : "text-white"
    }`;

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand className="fw-bold">
          System Health Automation
        </Navbar.Brand>
        <Nav className="ms-auto">
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
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
