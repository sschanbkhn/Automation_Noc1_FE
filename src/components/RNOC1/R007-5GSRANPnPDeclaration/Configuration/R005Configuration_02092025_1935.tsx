import React, { useState } from "react";

const Configuration = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Thêm type definitions
  type ModuleStatus = "active" | "maintenance";

  interface ConfigModule {
    id: number;
    title: string;
    description: string;
    icon: string;
    status: ModuleStatus;
  }

  /*

  const configModules: ConfigModule[] = [
    {
      id: 1,
      title: "Email Configuration",
      description: "SMTP & Notification Settings",
      icon: "✉️",
      status: "active",
    },
    {
      id: 2,
      title: "File Path Management",
      description: "Storage & Directory Config",
      icon: "🗂️",
      status: "active",
    },
    {
      id: 3,
      title: "MRBTS Information",
      description: "Network & Topology Settings",
      icon: "📶",
      status: "active",
    },
    {
      id: 4,
      title: "Reset Site Limit",
      description: "Safety Threshold Controls",
      icon: "⚖️",
      status: "active",
    },
    {
      id: 5,
      title: "Scheduler Configuration",
      description: "Automated Task Management",
      icon: "🕐",
      status: "active",
    },
    {
      id: 6,
      title: "Database Settings",
      description: "Connection & Backup Config",
      icon: "💾",
      status: "maintenance",
    },
  ];

  */

  const configModules: ConfigModule[] = [
    {
      id: 1,
      title: "Email Configuration",
      description: "SMTP & Notification Settings",
      icon: "📮", // Thay vì ✉️
      status: "active",
    },
    {
      id: 2,
      title: "File Path Management",
      description: "Storage & Directory Config",
      icon: "📋", // Thay vì 🗂️
      status: "active",
    },
    {
      id: 3,
      title: "MRBTS Information",
      description: "Network & Topology Settings",
      icon: "🌐", // Thay vì 📶
      status: "active",
    },
    {
      id: 4,
      title: "Reset Site Limit",
      description: "Safety Threshold Controls",
      icon: "🔒", // Thay vì ⚖️
      status: "active",
    },
    {
      id: 5,
      title: "Scheduler Configuration",
      description: "Automated Task Management",
      icon: "⚡", // Thay vì 🕐
      status: "active",
    },
    {
      id: 6,
      title: "Database Settings",
      description: "Connection & Backup Config",
      icon: "💾", // Thay vì 💾
      status: "maintenance",
    },
  ];

  /*

const configModules: ConfigModule[] = [
  {
    id: 1,
    title: "Email Configuration",
    description: "SMTP & Notification Settings",
    svgPath: "M3 8L10.89 13.26C11.2 13.45 11.6 13.45 11.91 13.26L20 8M4 6H20C21.1 6 22 6.9 22 8V16C22 17.1 21.1 18 20 18H4C2.9 18 2 17.1 2 16V8C2 6.9 2.9 6 4 6Z",
    status: "active",
  },
  {
    id: 2,
    title: "File Path Management",
    description: "Storage & Directory Config",
    svgPath: "M13 2L3 14H12L11 22L21 10H12L13 2Z",
    status: "active",
  },
  {
    id: 3,
    title: "MRBTS Information",
    description: "Network & Topology Settings",
    svgPath: "M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM21 8V16L18 14L15 16V8C15 6.9 15.9 6 17 6H19C20.1 6 21 6.9 21 8Z",
    status: "active",
  },
  {
    id: 4,
    title: "Reset Site Limit",
    description: "Safety Threshold Controls",
    svgPath: "M12 22S8 18 8 13V7L12 3L16 7V13C16 18 12 22 12 22Z",
    status: "active",
  },
  {
    id: 5,
    title: "Scheduler Configuration",
    description: "Automated Task Management",
    svgPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    status: "active",
  },
  {
    id: 6,
    title: "Database Settings",
    description: "Connection & Backup Config",
    svgPath: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4",
    status: "maintenance",
  },
];
  
  */

  const filteredModules = configModules.filter((module) => module.title.toLowerCase().includes(searchTerm.toLowerCase()) || module.description.toLowerCase().includes(searchTerm.toLowerCase()));

  // Fix function với proper typing
  const getStatusBadge = (status: ModuleStatus) => {
    const config = status === "active" ? { bg: "#d4edda", color: "#155724", text: "Active" } : { bg: "#fff3cd", color: "#856404", text: "Maintenance" };

    return (
      <div
        style={{
          background: config.bg,
          color: config.color,
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "8px",
          fontWeight: "600",
          border: `1px solid ${config.color}30`,
        }}
      >
        {config.text}
      </div>
    );
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "white", minHeight: "500px" }}>
      {/* Search Bar - Căn trái */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="🔍 Search configurations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "400px",
            padding: "12px 20px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />

        {/* Results Count */}
        {/*
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0" }}>
            Showing {filteredModules.length} of {configModules.length} configuration modules
          </p>
        </div>

        */}
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          maxWidth: "1000px",
        }}
      >
        {filteredModules.map((module) => (
          <div
            key={module.id}
            style={{
              position: "relative",
              background: "white",
              border: "2px solid #7c3aed",
              borderRadius: "12px",
              padding: "20px 16px 16px 16px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              height: "160px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(124, 58, 237, 0.2)";
              e.currentTarget.style.background = "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
              e.currentTarget.style.background = "white";
            }}
          >
            {/* Folder Tab */}
            <div
              style={{
                position: "absolute",
                top: "-2px",
                left: "20px",
                width: "40px",
                height: "12px",
                background: "#7c3aed",
                borderRadius: "4px 4px 0 0",
              }}
            />

            {/* Status Dot */}
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
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
              <div
                style={{
                  fontSize: "48px",
                  margin: "0 0 8px 0",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              >
                {module.icon}
              </div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1a202c",
                  margin: "0 0 4px 0",
                  lineHeight: "1.2",
                  textAlign: "center",
                }}
              >
                {module.title}
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "0",
                  lineHeight: "1.3",
                  textAlign: "center",
                  fontWeight: "500",
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
                marginTop: "4px",
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
