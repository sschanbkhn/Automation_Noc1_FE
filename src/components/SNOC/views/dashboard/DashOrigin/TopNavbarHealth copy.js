import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Clock from "../../../components/Clock";
import { getSnocToken, setSnocToken, snocApiNoAuth } from "../../../api/snocApiWithAutoToken";

const LINK_BASE  = "fw-semibold px-2 py-1 mx-1 rounded text-decoration-none";
const LINK_ACTIVE = `${LINK_BASE} bg-white text-primary`;
const LINK_IDLE   = `${LINK_BASE} text-white`;

const TopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const getLinkClass = ({ isActive }) => isActive ? LINK_ACTIVE : LINK_IDLE;

  const dropdownActive = (paths) => paths.some((p) => pathname.startsWith(p));

  const ddClass = (paths) =>
    `${dropdownActive(paths) ? "bg-white rounded" : ""} fw-semibold mx-1`;

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

  // Style cho title của dropdown — đồng bộ với NavLink
  const ddTitleStyle = (paths) => ({
    color: dropdownActive(paths) ? "#0d6efd" : "white",
    fontSize: "0.85rem",
    padding: "0.25rem 0.5rem",
  });

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="px-3 py-1 shadow-sm">
      <Container fluid>
        <Navbar.Brand className="fw-bold me-0" style={{ fontSize: "1rem" }}>
          System Health Automation
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="topnav-collapse" />

        <Navbar.Collapse id="topnav-collapse" className="w-100">
          <Nav
            className="mx-auto align-items-center"
            style={{ fontSize: "0.85rem", gap: "2px" }}
          >
            {/* ── Dashboard ── */}
            <NavLink to="/app/dashboard/origin" className={getLinkClass}>
              Dashboard
            </NavLink>

            {/* ── Devices ── */}
            <NavLink to="/healthcheck/devices" className={getLinkClass}>
              Devices
            </NavLink>

            {/* ── Precheck ▾ ── */}
            <NavDropdown
              title={
                <span style={ddTitleStyle([
                  "/healthcheck/checks",
                  "/healthcheck/schedule",
                  "/healthcheck/history",
                  "/healthcheck/OutputIgnoreRules",
                ])}>
                  Precheck
                </span>
              }
              id="dd-precheck"
              menuVariant="light"
              className={ddClass([
                "/healthcheck/checks",
                "/healthcheck/schedule",
                "/healthcheck/history",
                "/healthcheck/OutputIgnoreRules",
              ])}
            >
              <NavDropdown.Item as={NavLink} to="/healthcheck/checks">
                🔍 Manual Check
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/schedule">
                📅 Schedule
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/history">
                📋 History
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={NavLink} to="/healthcheck/OutputIgnoreRulesV2">
                🚫 Ignore Rules
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/blackout">
                ⏸️ Blackout Config
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── Bảo Dưỡng ▾ ── */}
            <NavDropdown
              title={
                <span style={ddTitleStyle([
                  "/healthcheck/kpischedule",
                  "/dhtt/history",
                  "/dhtt/manual",
                ])}>
                  Bảo Dưỡng
                </span>
              }
              id="dd-baoduong"
              menuVariant="light"
              className={ddClass([
                "/healthcheck/kpischedule",
                "/dhtt/history",
                "/dhtt/manual",
              ])}
            >
              <NavDropdown.Item as={NavLink} to="/dhtt/manual">
                🛠️ Manual
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/kpischedule">
                📅 Schedule
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/dhtt/history">
                📋 History
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── KPI ── */}
            <NavLink to="/healthcheck/kpi" className={getLinkClass}>
              KPI
            </NavLink>
          </Nav>

          <Nav className="ms-auto align-items-center" style={{ gap: 10 }}>
            <span className="text-white fw-semibold" style={{ fontSize: "0.85rem" }}>
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