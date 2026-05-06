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

  // Thu nhỏ padding và margin để các nút trên menu gọn gàng hơn
  const getLinkClass = (navData) =>
    `nav-link fw-semibold px-2 py-1 mx-1 rounded ${
      navData.isActive ? "bg-white text-primary" : "text-white"
    }`;

  const handleLogout = async () => {
    try {
      const token = getSnocToken();
      if (token) {
        await snocApiNoAuth.post(
          "/users/logout",
          {},
          {
            headers: { Authorization: token },
          },
        );
      }
    } catch (e) {
      // ignore
    } finally {
      setSnocToken(null, { persist: true });
      navigate("/snoc/login", { replace: true, state: { from: location } });
    }
  };

  return (
    <Navbar
      bg="primary"
      variant="dark"
      expand="lg"
      className="px-3 py-1 shadow-sm"
    >
      <Container fluid>
        <Navbar.Brand className="fw-bold me-0" style={{ fontSize: "1rem" }}>
          System Health Automation
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="topnav-collapse" />

        <Navbar.Collapse id="topnav-collapse" className="w-100">
          <Nav
            className="mx-auto align-items-center"
            style={{ fontSize: "0.85rem" }}
          >
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
            {/* <NavLink
              to="/healthcheck/OutputIgnoreRules"
              className={getLinkClass}
            >
              Healthcheck Ignore Rules
            </NavLink> */}

            <NavLink
              to="/healthcheck/OutputIgnoreRulesV2"
              className={getLinkClass}
            >
              Ignore Rules
            </NavLink>



            <NavLink to="/healthcheck/kpi" className={getLinkClass}>
              KPI
            </NavLink>
            <NavLink to="/healthcheck/kpischedule" className={getLinkClass}>
              Other Schedule
            </NavLink>          
            <NavLink to="/dhtt/history" className={getLinkClass}>
              Other Schedule History
            </NavLink>

          </Nav>

          <Nav className="ms-auto align-items-center" style={{ gap: 10 }}>
            <span
              className="text-white fw-semibold"
              style={{ fontSize: "0.85rem" }}
            >
              <Clock />
            </span>
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
