// src/components/SNOC/views/dashboard/DashOrigin/TopNavbar.jsx
import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Clock from "../../../components/Clock";

// 🔐 helper SNOC auth
import {
  getSnocToken,
  setSnocToken,
  snocApiNoAuth,
} from "../../../api/snocApiWithAutoToken";

const TopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (navData) =>
    `nav-link fw-semibold px-3 py-2 rounded ${
      navData.isActive ? "bg-white text-primary" : "text-white"
    }`;

  const handleLogout = async () => {
    // Gọi API logout (nếu BE hỗ trợ) — best-effort, không chặn UI
    try {
      const token = getSnocToken();
      if (token) {
        await snocApiNoAuth.post(
          "/users/logout",
          {},
          {
            // BE cũ đang đọc raw token ở Authorization (không Bearer)
            headers: { Authorization: token },
          }
        );
      }
    } catch (e) {
      // ignore: nếu thất bại vẫn xóa token phía FE
    } finally {
      // Xoá token SNOC (RAM + sessionStorage) và quay về trang login
      setSnocToken(null, { persist: true });
      navigate("/snoc/login", { replace: true, state: { from: location } });
    }
  };

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

          {/* === Phải: Đồng hồ + Logout === */}
          <Nav className="ms-auto align-items-center" style={{ gap: 12 }}>
            <span
              className="text-white fw-semibold"
              style={{ fontSize: "0.9rem" }}
            >
              <Clock />
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
              title="Logout SNOC"
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
