import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Clock from "../../../components/Clock";
import { getSnocToken, setSnocToken, snocApiNoAuth, getJwtClaims } from "../../../api/snocApiWithAutoToken";

const TopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const claims = getJwtClaims();

  const getLinkClass = (navData) =>
    `nav-link fw-semibold px-3 py-2 rounded ${
      navData.isActive ? "bg-white text-primary" : "text-white"
    }`;

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
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand className="fw-bold">
          Công Cụ Quản Lý Định Tuyến SBC
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="topnav-sbc-collapse" />
        <Navbar.Collapse id="topnav-sbc-collapse">
          <Nav className="me-auto">
            <NavLink to="/sbc/dashboard" className={getLinkClass}>
              Tổng Quan
            </NavLink>
            <NavLink to="/sbc/ListConnection" className={getLinkClass}>
              Danh Sách Kết Nối
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
          <Nav className="ms-auto align-items-center" style={{ gap: 10 }}>
            <span className="text-white fw-semibold" style={{ fontSize: "0.85rem" }}>
              <Clock />
            </span>
            {(claims?.username || claims?.email) && (
              <span
                className="text-white d-flex align-items-center"
                style={{ fontSize: "0.8rem", opacity: 0.9 }}
              >
                <i className="bi bi-person-circle me-1" />
                {claims.username || claims.email}
              </span>
            )}
            <button
              className="btn btn-outline-light d-flex align-items-center"
              onClick={handleLogout}
              title="Logout SNOC"
              style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
            >
              <i className="bi bi-box-arrow-right me-1" />
              Logout
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
