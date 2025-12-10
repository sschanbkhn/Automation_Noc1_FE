import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase } from "@fortawesome/free-solid-svg-icons";

const Configuration = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
  ];

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
      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "#64748b", fontSize: "14px", margin: "0" }}>
          Showing {filteredModules.length} of {configModules.length} configuration modules
        </p>
      </div>

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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = module.iconColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = "#f1f5f9";
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
    </div>
  );
};

export default Configuration;
