import React from "react";
import { Breadcrumb, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Clock from "../../../components/Clock";
import { getSnocToken, setSnocToken, snocApiNoAuth, getJwtClaims } from "../../../api/snocApiWithAutoToken";


const LINK_BASE   = "fw-semibold px-2 py-1 mx-1 rounded text-decoration-none";
const LINK_ACTIVE = `${LINK_BASE} bg-white text-primary`;
const LINK_IDLE   = `${LINK_BASE} text-white`;

// ── Breadcrumb config ──────────────────────────────────────────────────────
const BREADCRUMB_MAP = {
  "/app/dashboard/origin":             { section: "Healthcheck", label: "Dashboard" },
  "/healthcheck/checks":               { section: "Healthcheck", label: "Manual Check" },
  "/healthcheck/healthcheck-external": { section: "Healthcheck", label: "Manual External" },
  "/healthcheck/schedule":             { section: "Healthcheck", label: "Schedule" },
  "/healthcheck/history":              { section: "Healthcheck", label: "History" },
  "/healthcheck/OutputIgnoreRulesV2":  { section: "Healthcheck", label: "Ignore Rules" },
  "/healthcheck/blackout":             { section: "Healthcheck", label: "Blackout Config" },
  "/healthcheck/analysis-params":      { section: "Healthcheck", label: "Analysis Params" },
  "/healthcheck/alert-config":         { section: "Healthcheck", label: "Alert Config" },
  "/healthcheck/external/stats":       { label: "External Stats" },
  "/hc-simple/dashboard":              { section: "HC Simple",  label: "Dashboard" },
  "/hc-simple/manual":                 { section: "HC Simple",  label: "Manual" },
  "/hc-simple/schedule":               { section: "HC Simple",  label: "Schedule" },
  "/hc-simple/history":                { section: "HC Simple",  label: "History" },
  "/precheck":                         { section: "Precheck",   label: "Dashboard" },
  "/precheck/manual":                  { section: "Precheck",   label: "Manual" },
  "/healthcheck/precheck-external":    { section: "Precheck",   label: "Manual External" },
  "/precheck/schedule":                { section: "Precheck",   label: "Schedule" },
  "/precheck/history":                 { section: "Precheck",   label: "History" },
  "/fcp":                              { section: "FCP",        label: "Trigger" },
  "/fcp/history":                      { section: "FCP",        label: "History" },
  "/dhtt/dashboard":                   { section: "Bảo Dưỡng", label: "Dashboard" },
  "/dhtt/manual":                      { section: "Bảo Dưỡng", label: "Manual" },
  "/healthcheck/kpischedule":          { section: "Bảo Dưỡng", label: "Schedule" },
  "/dhtt/history":                     { section: "Bảo Dưỡng", label: "History" },
  "/healthcheck/devices":              { label: "Devices" },
  "/healthcheck/monitor":              { section: "System",     label: "System Monitor" },
  "/config-email-sms":                 { section: "System",     label: "Kênh thông báo" },
  "/healthcheck/retention-config":     { section: "System",     label: "Cấu hình lưu giữ" },
  "/healthcheck/platform-mapping":            { section: "Platform Config", label: "Platform Mapping" },
  "/healthcheck/group-schema-permissions":    { section: "Platform Config", label: "Phân quyền theo Group" },
  "/healthcheck/platform-taxonomy":           { section: "Platform Config", label: "Group / Subsystem" },
  "/healthcheck/config-sync":                 { section: "Platform Config", label: "Đồng bộ File ⇄ DB" },
  "/healthcheck/kpi":                  { section: "KPI",        label: "KPI Explorer" },
  "/kpi/dashboard":                    { section: "KPI",        label: "KPI Dashboard" },
  "/kpi/schedule":                     { section: "KPI",        label: "Quản lý Schedule" },
};

const SECTION_URLS = {
  "Healthcheck": "/app/dashboard/origin",
  "HC Simple":   "/hc-simple/dashboard",
  "Precheck":    "/precheck",
  "FCP":         "/fcp",
  "Bảo Dưỡng":  "/dhtt/dashboard",
  "System":      "/healthcheck/monitor",
  "KPI":         "/kpi/dashboard",
  "Platform Config": "/healthcheck/platform-mapping",
};

const getBreadcrumb = (pathname) => {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  // /healthcheck/:group/:subsystem
  const hcSub = pathname.match(/^\/healthcheck\/([^/]+)\/(.+)$/);
  if (hcSub) return { section: "Healthcheck", label: "Dashboard", extra: `${hcSub[1]} › ${hcSub[2]}` };
  // /healthcheck/:group  (only if not matching a known key above)
  const hcGrp = pathname.match(/^\/healthcheck\/([^/]+)$/);
  if (hcGrp) return { section: "Healthcheck", label: `Dashboard — ${hcGrp[1]}` };
  // /kpi/:system/:subsystem
  const kpiSub = pathname.match(/^\/kpi\/([^/]+)\/(.+)$/);
  if (kpiSub) return { section: "KPI", label: "KPI Explorer", extra: `${kpiSub[1]} › ${kpiSub[2]}` };
  return null;
};

const TopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const claims  = getJwtClaims();
  const isAdmin = claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  const getLinkClass = ({ isActive }) => isActive ? LINK_ACTIVE : LINK_IDLE;
  
  const isActive     = (paths) => paths.some(p => pathname.startsWith(p));
  const ddClass = (paths) =>
    `${isActive(paths) ? "bg-white rounded" : ""} fw-semibold mx-1`;

  const ddTitleStyle = (paths) => ({
    color:    isActive(paths) ? "#0d6efd" : "white",
    fontSize: "0.85rem",
    padding:  "0.25rem 0.5rem",
  });

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

  // ── Path groups ───────────────────────────────────────────────────────
  
  // Healthcheck bao gồm Dashboard và các chức năng của Precheck cũ
  const HC_PATHS = [
    "/app/dashboard/origin",
    "/healthcheck/checks",
    "/healthcheck/schedule",
    "/healthcheck/history",
    "/healthcheck/OutputIgnoreRulesV2",
    "/healthcheck/blackout",
    "/healthcheck/analysis-params",
    "/healthcheck/alert-config",
  ];
  const PRECHECK_PATHS = [            // ← thêm
    "/precheck",
    "/precheck/manual",
    "/precheck/schedule",
    "/precheck/history",
  ];
  const FCP_PATHS = [
    "/fcp",
    "/fcp/history",
  ];
  const HC_SIMPLE_PATHS = [
    "/hc-simple/dashboard",
    "/hc-simple/manual",
    "/hc-simple/schedule",
    "/hc-simple/history",
  ];
  const BAODUONG_PATHS = [
    "/dhtt/dashboard",
    "/dhtt/manual",
    "/dhtt/history",
    "/healthcheck/kpischedule",
  ];
  const KPI_PATHS = [
    "/healthcheck/kpi",
    "/kpi/",
  ];
  const PLATFORM_CONFIG_PATHS = [
    "/healthcheck/platform-mapping",
    "/healthcheck/group-schema-permissions",
    "/healthcheck/platform-taxonomy",
    "/healthcheck/config-sync",
  ];

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <>
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

            {/* ── 1. HEALTHCHECK ▾ ─────────────────────────────────── */}
            <NavDropdown
              title={<span style={ddTitleStyle(HC_PATHS)}>Healthcheck</span>}
              id="dd-healthcheck"
              menuVariant="light"
              className={ddClass(HC_PATHS)}
            >
              <NavDropdown.Item as={NavLink} to="/app/dashboard/origin">
                📊 Dashboard
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={NavLink} to="/healthcheck/checks">
                🔍 Manual Check
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/healthcheck-external">
                🔍 Manual External
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
              <NavDropdown.Item as={NavLink} to="/healthcheck/analysis-params">
                ⚙️ Analysis Params
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/alert-config">
                🔔 Alert Config
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── 2. PRECHECK ▾ ────────────────────────────────────── */}
            <NavDropdown
              title={<span style={ddTitleStyle(PRECHECK_PATHS)}>Precheck</span>}
              id="dd-precheck"
              menuVariant="light"
              className={ddClass(PRECHECK_PATHS)}
            >
              <NavDropdown.Item as={NavLink} to="/precheck">
                📊 Dashboard
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/precheck/manual">
                🔍 Manual
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/healthcheck/precheck-external">
                🔍 Manual external
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/precheck/schedule">
                📅 Schedule
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/precheck/history">
                📋 History
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── 2b. FCP ▾ ──────────────────────────────────────── */}
            <NavDropdown
              title={<span style={ddTitleStyle(FCP_PATHS)}>⚡ FCP</span>}
              id="dd-fcp"
              menuVariant="light"
              className={ddClass(FCP_PATHS)}
            >
              <NavDropdown.Item as={NavLink} to="/fcp">
                🔍 Trigger
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/fcp/history">
                📋 History
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── 3. HC SIMPLE ▾ ───────────────────────────────────── */}
            <NavDropdown
              title={<span style={ddTitleStyle(HC_SIMPLE_PATHS)}>HC Simple</span>}
              id="dd-hc-simple"
              menuVariant="light"
              className={ddClass(HC_SIMPLE_PATHS)}
            >
              <NavDropdown.Item as={NavLink} to="/hc-simple/dashboard">
                📊 Dashboard
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={NavLink} to="/hc-simple/manual">
                🛠️ Manual
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/hc-simple/schedule">
                📅 Schedule
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/hc-simple/history">
                📋 History
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── 4. BẢO DƯỠNG ▾ ───────────────────────────────────── */}
            <NavDropdown
              title={<span style={ddTitleStyle(BAODUONG_PATHS)}>Bảo Dưỡng</span>}
              id="dd-baoduong"
              menuVariant="light"
              className={ddClass(BAODUONG_PATHS)}
            >
              <NavDropdown.Item as={NavLink} to="/dhtt/dashboard">
                📊 Dashboard
              </NavDropdown.Item>
              <NavDropdown.Divider />
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
            {/* ── 5. DEVICES ───────────────────────────────────────── */}

            <NavLink to="/healthcheck/devices" className={getLinkClass}>
              Devices
            </NavLink>

            {/* ── 6. EXTERNAL STATS ────────────────────────────────── */}
            <NavLink to="/healthcheck/external/stats" className={getLinkClass}>
              📊 External Stats
            </NavLink>

            {/* ── Admin Monitor (admin only) ── */}
            {isAdmin && (
              <NavDropdown
                title={
                  <span style={ddTitleStyle(["/healthcheck/monitor", "/admin/monitor", "/config-email-sms", "/healthcheck/retention-config"])}>
                    ⚙️ System
                  </span>
                }
                id="dd-monitor"
                menuVariant="light"
                className={ddClass(["/healthcheck/monitor", "/admin/monitor", "/config-email-sms", "/healthcheck/retention-config"])}
              >
                <NavDropdown.Item as={NavLink} to="/healthcheck/monitor">
                  🖥️ System Monitor
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/config-email-sms">
                  📣 Cấu hình kênh thông báo
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/healthcheck/retention-config">
                  🗂️ Cấu Hình Lưu Giữ
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {/* ── Platform Config (admin only) ── */}
            {isAdmin && (
              <NavDropdown
                title={<span style={ddTitleStyle(PLATFORM_CONFIG_PATHS)}>🔌 Platform Config</span>}
                id="dd-platform-config"
                menuVariant="light"
                className={ddClass(PLATFORM_CONFIG_PATHS)}
              >
                <NavDropdown.Item as={NavLink} to="/healthcheck/platform-mapping">
                  🔗 Platform Mapping
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/healthcheck/group-schema-permissions">
                  🛡️ Phân quyền theo Group
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/healthcheck/platform-taxonomy">
                  🗂️ Group / Subsystem
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/healthcheck/config-sync">
                  🔄 Đồng bộ File ⇄ DB
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {/* ── 7. KPI ▾ ─────────────────────────────────────────── */}
            <NavDropdown
              title={<span style={ddTitleStyle(KPI_PATHS)}>KPI</span>}
              id="dd-kpi"
              menuVariant="light"
              className={ddClass(KPI_PATHS)}
            >
              <NavDropdown.Item as={NavLink} to="/healthcheck/kpi">
                📊 KPI Explorer
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/kpi/dashboard">
                📌 KPI Dashboard
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/kpi/schedule">
                📅 Quản lý Schedule
              </NavDropdown.Item>
            </NavDropdown>

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
    {breadcrumb && (
      <nav aria-label="breadcrumb" style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6", padding: "4px 16px" }}>
        <Breadcrumb className="mb-0" style={{ fontSize: "0.8rem" }}>
          <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/app/dashboard/origin" }}>
            Automation Healthcheck
          </Breadcrumb.Item>
          {breadcrumb.section && (
            <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: SECTION_URLS[breadcrumb.section] || "/app/dashboard/origin" }}>
              {breadcrumb.section}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{breadcrumb.label}</Breadcrumb.Item>
          {breadcrumb.extra && (
            <Breadcrumb.Item active>{breadcrumb.extra}</Breadcrumb.Item>
          )}
        </Breadcrumb>
      </nav>
    )}
    </>
  );
};

export default TopNavbar;