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
          Công Cụ Quản Lý Định Tuyến SBC
        </Navbar.Brand>
        <Nav className="ms-auto">
          <NavLink to="/sbc/dashboard" className={getLinkClass}>
            Tổng Quan
          </NavLink>
          <NavLink to="/sbc/CreateConnectionForm" className={getLinkClass}>
            Tạo Kết Nối
          </NavLink>
          <NavLink to="/sbc/DeclareNumberForm" className={getLinkClass}>
            Khai Báo Đầu Số
          </NavLink>
          <NavLink to="/sbc/RoutingDeclarationForm" className={getLinkClass}>
            Khai Báo Định Tuyến
          </NavLink>
          <NavLink to="/sbc/RequestHistoryTable" className={getLinkClass}>
            Lịch Sử Phiếu
          </NavLink>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
