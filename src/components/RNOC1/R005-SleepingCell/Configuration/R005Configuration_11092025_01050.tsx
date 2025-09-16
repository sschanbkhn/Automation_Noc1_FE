import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase } from "@fortawesome/free-solid-svg-icons";
// import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch, faServer, faChartLine } from "@fortawesome/free-solid-svg-icons";

import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";

// Mapping card với table
/*
const configTableMapping: { [key: number]: { table: string; api: string; title: string } } = {
  1: { table: "outlook", api: "/api/outlook", title: "Email Configuration" },
  2: { table: "tablefilepath", api: "/api/filepath", title: "File Path Management" },
  3: { table: "objtablemrbts_infor", api: "/api/mrbts", title: "MRBTS Information" },
  4: { table: "objtableresetsitecountlimits", api: "/api/resetlimits", title: "Reset Site Limits" },
  5: { table: "objtablescheduler", api: "/api/scheduler", title: "Scheduler Configuration" },
  6: { table: "objtableaccountssh", api: "/api/ssh", title: "Account SSH Settings" },
};


*/

// const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/kpi-monitor/${yesterdayString}`);

const configTableMapping: { [key: number]: { table: string; api: string; title: string } } = {
  1: { table: "outlook", api: API_CONFIG.BASE_URL + "/configuration/get-outlook", title: "Email Configuration" },
  2: { table: "tablefilepath", api: API_CONFIG.BASE_URL + "/configuration/get-filepath", title: "File Path Management" },
  3: { table: "objtablemrbts_infor", api: API_CONFIG.BASE_URL + "/configuration/get-mrbts", title: "MRBTS Information" },
  4: { table: "objtableresetsitecountlimits", api: API_CONFIG.BASE_URL + "/configuration/get-resetlimits", title: "Reset Site Limits" },
  5: { table: "objtablescheduler", api: API_CONFIG.BASE_URL + "/configuration/get-scheduler", title: "Scheduler Configuration" },
  6: { table: "objtabledatabaseinfor", api: API_CONFIG.BASE_URL + "/configuration/get-database", title: "Database Settings" },
  7: { table: "objtableaccountssh", api: API_CONFIG.BASE_URL + "/configuration/get-ssh-accounts", title: "SSH Account Settings" },
  8: { table: "archive-reports", api: API_CONFIG.BASE_URL + "/configuration/archive-reports", title: "Archive Reports" },
};

const Configuration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Thêm vào đầu component
  const [showModal, setShowModal] = useState(false);
  // const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState<ConfigModule | null>(null);

  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  type ModuleStatus = "active" | "maintenance";

  interface ConfigModule {
    id: number;
    title: string;
    description: string;
    icon: any;
    iconColor: string;
    status: ModuleStatus;
  }

  const configModules: ConfigModule[] = [
    {
      id: 1,
      title: "Email Configuration",
      description: "SMTP & Notification Settings",
      icon: faEnvelope,
      iconColor: "#3b82f6",
      status: "active",
    },
    {
      id: 2,
      title: "File Path Management",
      description: "Storage & Directory Config",
      icon: faFolderOpen,
      iconColor: "#10b981",
      status: "active",
    },
    {
      id: 3,
      title: "MRBTS Information",
      description: "Network & Topology Settings",
      icon: faNetworkWired,
      iconColor: "#f59e0b",
      status: "active",
    },
    {
      id: 4,
      title: "Reset Site Limit",
      description: "Safety Threshold Controls",
      icon: faShieldAlt,
      iconColor: "#ef4444",
      status: "active",
    },
    {
      id: 5,
      title: "Scheduler Configuration",
      description: "Automated Task Management",
      icon: faClock,
      iconColor: "#8b5cf6",
      status: "active",
    },
    {
      id: 6,
      title: "Database Settings",
      description: "Connection & Backup Config",
      icon: faDatabase,
      iconColor: "#06b6d4",
      status: "maintenance",
    },

    {
      id: 7,
      title: "SSH Account Settings",
      description: "Remote Access & Authentication",
      icon: faServer,
      iconColor: "#ff6b35",
      status: "active",
    },
    {
      id: 8,
      title: "Archive Reports",
      description: "Historical Data & Analytics",
      icon: faChartLine,
      iconColor: "#8e44ad",
      status: "active",
    },
  ];

  const renderDynamicHeaders = () => {
    if (!modalData || modalData.length === 0) {
      return <th>Loading...</th>;
    }

    // Lấy keys từ object đầu tiên
    const sampleItem = modalData[0];
    const keys = Object.keys(sampleItem);

    return (
      <tr style={{ background: `${selectedConfig?.iconColor}15` }}>
        {keys.map((key) => (
          <th key={key} style={{ padding: "12px", textAlign: "left" }}>
            {formatHeaderName(key)}
          </th>
        ))}
        <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
      </tr>
    );
  };

  const renderDynamicRows = () => {
    if (!modalData || modalData.length === 0) {
      return (
        <tr>
          <td style={{ padding: "12px", textAlign: "center" }}>No data available</td>
        </tr>
      );
    }

    const keys = Object.keys(modalData[0]);

    return modalData.map((item: any, index: number) => (
      <tr key={item.id || index}>
        {keys.map((key) => (
          <td key={key} style={{ padding: "12px" }}>
            {formatCellValue(item[key], key)}
          </td>
        ))}
        <td style={{ padding: "12px", textAlign: "center" }}>
          <button>Edit</button>
          <button>Delete</button>
        </td>
      </tr>
    ));
  };

  // Làm đẹp tên header
  const formatHeaderName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1") // camelCase -> spaces
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  // Format cell values
  const formatCellValue = (value: any, key: string) => {
    if (key.toLowerCase().includes("password")) return "••••••••";
    if (typeof value === "boolean") return value ? "Active" : "Inactive";
    if (value === null || value === undefined) return "N/A";
    return String(value);
  };

  const filteredModules = configModules.filter((module) => module.title.toLowerCase().includes(searchTerm.toLowerCase()) || module.description.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusBadge = (status: ModuleStatus) => {
    const config = status === "active" ? { bg: "#d4edda", color: "#155724", text: "Active", border: "#c3e6cb" } : { bg: "#fff3cd", color: "#856404", text: "Maintenance", border: "#ffeaa7" };

    return (
      <div
        style={{
          background: config.bg,
          color: config.color,
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "8px",
          fontWeight: "600",
          border: `1px solid ${config.border}`,
        }}
      >
        {config.text}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "500px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Search Bar */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="🔍 Search configurations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "min(400px, 100%)",
            padding: "12px 20px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
        />
      </div>

      {/* Results Count */}
      {/*
      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "#64748b", fontSize: "14px", margin: "0" }}>
          Showing {filteredModules.length} of {configModules.length} configuration modules
        </p>
      </div>

      */}

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {filteredModules.map((module) => (
          <div
            key={module.id}
            style={{
              position: "relative",
              background: "white",
              border: "2px solid #f1f5f9",
              borderRadius: "16px",
              padding: "20px 16px 16px 16px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              minHeight: "160px",
              maxWidth: "280px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            onClick={async () => {
              setSelectedConfig(module);
              setShowModal(true);
              setModalLoading(true);

              try {
                const config = configTableMapping[module.id];

                const response = await fetch(config.api);
                const data = await response.json();
                setModalData(data);

                console.log("Response status:", response.status);
                console.log("Response headers:", response.headers.get("content-type"));
              } catch (error) {
                console.error("Error:", error);
              } finally {
                setModalLoading(false);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = module.iconColor;
              e.currentTarget.style.background = `linear-gradient(135deg, ${module.iconColor}15, ${module.iconColor}10)`;
              // chinh do dam nhat
              // e.currentTarget.style.background = `linear-gradient(135deg, ${module.iconColor}15, ${module.iconColor}10)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = "#f1f5f9";
              e.currentTarget.style.background = "white";
            }}
          >
            {/* Status Dot */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "8px",
                height: "8px",
                background: module.status === "active" ? "#10b981" : "#f59e0b",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />

            {/* Content */}
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* FontAwesome Icon */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: module.iconColor,
                  borderRadius: "16px",
                  boxShadow: `0 8px 25px ${module.iconColor}40`,
                }}
              >
                <FontAwesomeIcon icon={module.icon} style={{ fontSize: "24px", color: "white" }} />
              </div>

              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0 0 6px 0",
                  lineHeight: "1.2",
                  textAlign: "center",
                }}
              >
                {module.title}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: "0",
                  lineHeight: "1.3",
                  textAlign: "center",
                }}
              >
                {module.description}
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              {getStatusBadge(module.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}

      {filteredModules.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "2px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ color: "#64748b", fontSize: "18px", margin: "0 0 8px 0" }}>No configurations found</h3>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 20px 0" }}>Try adjusting your search terms</p>
          <button
            onClick={() => setSearchTerm("")}
            style={{
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "90vw",
              maxWidth: "1200px",
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: selectedConfig?.iconColor || "#7c3aed",
                color: "white",
                padding: "20px 24px",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedConfig && <FontAwesomeIcon icon={selectedConfig.icon} style={{ fontSize: "20px" }} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{selectedConfig ? configTableMapping[selectedConfig.id]?.title : ""}</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Configuration Management</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
                  Add New
                </button>
                <button
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Export Excel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search records..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <button
                style={{
                  background: selectedConfig?.iconColor || "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: "6px" }} />
                Search
              </button>
            </div>

            {/* Table Content */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "16px 24px",
              }}
            >
              {modalLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                  }}
                >
                  <div>Loading data...</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: `${selectedConfig?.iconColor}15`, borderBottom: `2px solid ${selectedConfig?.iconColor}` }}>
                      {modalData && modalData.length > 0 ? (
                        Object.keys(modalData[0]).map((key) => (
                          <th key={key} style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: selectedConfig?.iconColor }}>
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                          </th>
                        ))
                      ) : (
                        <th style={{ padding: "12px", textAlign: "left" }}>Loading...</th>
                      )}
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: selectedConfig?.iconColor }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData && modalData.length > 0 ? (
                      modalData.map((item: any, index: number) => (
                        <tr key={item.id || index}>
                          {Object.keys(item).map((key) => (
                            <td key={key} style={{ padding: "12px" }}>
                              {key.toLowerCase().includes("password") ? "••••••••" : typeof item[key] === "boolean" ? (item[key] ? "Active" : "Inactive") : item[key] || "N/A"}
                            </td>
                          ))}
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button style={{ background: selectedConfig?.iconColor, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", marginRight: "4px", cursor: "pointer" }}>Edit</button>
                            <button style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={100} style={{ padding: "12px", textAlign: "center" }}>
                          {modalLoading ? "Loading..." : "No data available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuration;
