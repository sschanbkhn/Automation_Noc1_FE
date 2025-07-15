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
          Công Cụ Quản Lý Cấu Hình DNS Gn
        </Navbar.Brand>
        <Nav className="ms-auto">
          <NavLink to="/app/dashboard/dns" className={getLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/dns/lacracrnc" className={getLinkClass}>
            RNC
          </NavLink>
          <NavLink to="/dns/tacs" className={getLinkClass}>
            TAC
          </NavLink>
          <NavLink to="/dns/apn" className={getLinkClass}>
            Apn
          </NavLink>
          <NavLink to="/dns/vungphumme" className={getLinkClass}>
            Vùng phủ MME
          </NavLink>
          <NavLink to="/dns/vungphupgw" className={getLinkClass}>
            Vùng phủ PGW
          </NavLink>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
