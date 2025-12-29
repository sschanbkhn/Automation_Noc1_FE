// import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
// import { useLocation, useNavigate } from 'react-router-dom';
import API_CONFIG from "./ApiR0075GSRANPnPDeclarationConfig";

// Import icons using require to avoid type issues
const FiBarChart = require("react-icons/fi").FiBarChart;
const FiEye = require("react-icons/fi").FiEye;
const FiSettings = require("react-icons/fi").FiSettings;

// Dynamic component imports with fallback
let Dashboard: any = null;
let Generator: any = null;
let Configuration: any = null;

try {
  Dashboard = require("../Dashboard/R007Dashboard").default;
} catch {
  Dashboard = null;
}

try {
  Generator = require("../Generator/R007Generator").default;
  console.log("✅ Generator loaded successfully!");
} catch (error) {  // ← THÊM (error)
  console.error("❌ Generator load failed:", error);
  Generator = null;
}

console.log("🧪 Generator loaded?", Generator);
console.log("🧪 Generator type:", typeof Generator);

try {
  Configuration = require("../Configuration/R007Configuration").default;
} catch {
  Configuration = null;
}

// Types
interface ApiResponse {
  date: string;
  todayAnalysis: number;
  sleepingCells: number;
  executionCells: number;
  recheckCells: number;
}

const R007Tabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Thêm state cho selectedDate
  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false); // ← THÊM DÒNG NÀY

  // const [selectedDate, setSelectedDate] = useState('2025-07-29'); // OK - giá trị mặc định
  const [dashboardData, setDashboardData] = useState(null); // ✅ Đúng
  // const [loading, setLoading] = useState(false);
  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // ✅ Ngày hiện tại
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // return yesterday.toISOString().split("T")[0];
    return yesterday.toLocaleDateString("en-CA");
  });

  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // const [loading, setLoading] = useState(false);
  // const [dashboardData, setDashboardData] = useState(null); // ← THÊM STATE NÀY

  // Memoized function to get active tab
  const getActiveTab = useCallback(() => {
    const path = location.pathname;
    if (path.includes("/generator")) return "generator";
    if (path.includes("/configuration")) return "configuration";
    return "dashboard";
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Optimized fetchDashboardData with better error handling
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}/dashboard/summary/${selectedDate}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("❌ API Error:", error);
      // You could add toast notification here
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Effects
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [getActiveTab]);

  useEffect(() => {
    if (selectedDate) {
      fetchDashboardData();
    }
  }, [selectedDate, fetchDashboardData]); // ← Thêm selectedDate vào dependency

  // Tab configuration with beautiful styling
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "FiBarChart",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      shadowColor: "shadow-blue-200/50",
      color: "#2563eb",
    },
    {
      id: "generator",
      label: "Generator",
      icon: "FiEye",
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      shadowColor: "shadow-emerald-200/50",
      color: "#059669",
    },
    {
      id: "configuration",
      label: "Configuration",
      icon: "FiSettings",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      shadowColor: "shadow-purple-200/50",
      color: "#7c3aed",
    },
  ];

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    // Add navigation logic when ready
  }, []);

  // Helper to get icon component safely
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "FiBarChart":
        return FiBarChart;
      case "FiEye":
        return FiEye;
      case "FiSettings":
        return FiSettings;
      default:
        return FiBarChart;
    }
  };

  // Helper to create icon element safely
  const createIcon = (IconComponent: any, props: any = {}) => {
    if (!IconComponent) return null;
    return React.createElement(IconComponent, {
      size: props.size || 20,
      strokeWidth: props.strokeWidth || 2,
      color: props.color,
      ...props,
    });
  };

  // Improved fallback content with real data
  const renderFallbackDashboard = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "white",
          borderRadius: "20px",
          marginBottom: "24px",
          boxShadow: "0 10px 40px rgba(37, 99, 235, 0.3)",
        }}
      >
        {createIcon(FiBarChart, { size: 32 })}
      </div>

      <h2
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#1a202c",
          marginBottom: "12px",
        }}
      >
        Dashboard Overview
      </h2>

      <p
        style={{
          color: "#64748b",
          fontSize: "18px",
          maxWidth: "500px",
          margin: "0 auto 32px auto",
          lineHeight: "1.6",
        }}
      >
        Comprehensive analytics and real-time metrics for R005 Sleeping Cell Management
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
            padding: "24px",
            borderRadius: "16px",
            border: "2px solid #bfdbfe",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2563eb",
              marginBottom: "8px",
            }}
          >
            {dashboardData?.sleepingCells || "0"}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#1d4ed8",
              fontWeight: "600",
            }}
          >
            Sleeping Cells
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
            padding: "24px",
            borderRadius: "16px",
            border: "2px solid #bfdbfe",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2563eb",
              marginBottom: "8px",
            }}
          >
            {dashboardData?.executionCells || "0"}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#1d4ed8",
              fontWeight: "600",
            }}
          >
            Execution Cells
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
            padding: "24px",
            borderRadius: "16px",
            border: "2px solid #bfdbfe",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2563eb",
              marginBottom: "8px",
            }}
          >
            {dashboardData?.recheckCells || "0"}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#1d4ed8",
              fontWeight: "600",
            }}
          >
            Recheck Cells
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
            padding: "24px",
            borderRadius: "16px",
            border: "2px solid #bfdbfe",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2563eb",
              marginBottom: "8px",
            }}
          >
            {dashboardData?.todayAnalysis || "0"}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#1d4ed8",
              fontWeight: "600",
            }}
          >
            Today Analysis
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    console.log("🎨 Rendering content for tab:", activeTab);

    switch (activeTab) {
      case "dashboard":
        // Use real Dashboard component if available, otherwise show fallback
        // return Dashboard ? React.createElement(Dashboard) : (
        console.log("🔍 R005Tabs selectedDate before passing:", selectedDate); // ← THÊM LOG

        return Dashboard ? (
          React.createElement(Dashboard, {
            dashboardData, // ← THÊM PROPS
            loading, // ← THÊM PROPS
            selectedDate, // ← THÊM PROP NÀY
          })
        ) : (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white",
                borderRadius: "20px",
                marginBottom: "24px",
                boxShadow: "0 10px 40px rgba(37, 99, 235, 0.3)",
              }}
            >
              {createIcon(FiBarChart, { size: 32 })}
            </div>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1a202c",
                marginBottom: "12px",
              }}
            >
              Dashboard Overview
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                maxWidth: "500px",
                margin: "0 auto 32px auto",
                lineHeight: "1.6",
              }}
            >
              Comprehensive analytics and real-time metrics for your R005 Sleeping Cell Management system
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "20px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #bfdbfe",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#2563eb",
                    marginBottom: "8px",
                  }}
                >
                  24
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1d4ed8",
                    fontWeight: "600",
                  }}
                >
                  Active Cells
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #bfdbfe",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#2563eb",
                    marginBottom: "8px",
                  }}
                >
                  98%
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1d4ed8",
                    fontWeight: "600",
                  }}
                >
                  Uptime
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #bfdbfe",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#2563eb",
                    marginBottom: "8px",
                  }}
                >
                  5
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1d4ed8",
                    fontWeight: "600",
                  }}
                >
                  Alerts
                </div>
              </div>
            </div>
          </div>
        );

      case "generator":
        return Generator ? (
          React.createElement(Generator)
        ) : (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "white",
                borderRadius: "20px",
                marginBottom: "24px",
                boxShadow: "0 10px 40px rgba(5, 150, 105, 0.3)",
              }}
            >
              {createIcon(FiEye, { size: 32 })}
            </div>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1a202c",
                marginBottom: "12px",
              }}
            >
              Real-time Monitoring
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                maxWidth: "500px",
                margin: "0 auto 32px auto",
                lineHeight: "1.6",
              }}
            >
              24/7 surveillance and instant alerts for sleeping cell detection and recovery operations
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #a7f3d0",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#059669",
                    marginBottom: "8px",
                  }}
                >
                  ● Live
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#047857",
                    fontWeight: "600",
                  }}
                >
                  System Status
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #a7f3d0",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#059669",
                    marginBottom: "8px",
                  }}
                >
                  2.3s
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#047857",
                    fontWeight: "600",
                  }}
                >
                  Response Time
                </div>
              </div>
            </div>
          </div>
        );

      case "configuration":
        return Configuration ? (
          React.createElement(Configuration)
        ) : (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white",
                borderRadius: "20px",
                marginBottom: "24px",
                boxShadow: "0 10px 40px rgba(124, 58, 237, 0.3)",
              }}
            >
              {createIcon(FiSettings, { size: 32 })}
            </div>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1a202c",
                marginBottom: "12px",
              }}
            >
              System Configuration
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                maxWidth: "500px",
                margin: "0 auto 32px auto",
                lineHeight: "1.6",
              }}
            >
              Advanced settings and customization options for optimal sleeping cell management performance
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #f3e8ff, #faf5ff)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #c4b5fd",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#7c3aed",
                    marginBottom: "8px",
                  }}
                >
                  12
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6d28d9",
                    fontWeight: "600",
                  }}
                >
                  Config Rules
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #f3e8ff, #faf5ff)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #c4b5fd",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#7c3aed",
                    marginBottom: "8px",
                  }}
                >
                  ●
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6d28d9",
                    fontWeight: "600",
                  }}
                >
                  Auto Recovery
                </div>
              </div>
            </div>
          </div>
        );

      default:
        {
        }
        return renderFallbackDashboard();
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "none", margin: "0", padding: "0" }}>
      {/* Beautiful Connected Tabs with Amazing Effects */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#f8fafc",
          padding: "12px",
          // padding: '4px', // ← CHỈNH: từ '6px' xuống '4px'
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
          border: "1px solid #e2e8f0",
          // marginBottom: '32px'
          height: "80px", // ← THÊM VÀO: Chiều cao cố định của khung
          marginBottom: "10px", // ← KHOẢNG CÁCH từ khung đến content bên dưới
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          const IconComponent = getIconComponent(tab.icon);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                // gap: '12px',
                gap: "6px", // ← CHỈNH: từ '8px' xuống '6px'
                minWidth: "160px",
                // minWidth: '100px', // ← CHỈNH: từ '120px' xuống '100px'
                fontWeight: "bold",
                transition: "all 0.3s ease-out",
                border: "2px solid",
                transform: isActive ? "scale(1.15)" : "scale(0.95)",
                borderRadius: isFirst ? "12px 0 0 12px" : isLast ? "0 12px 12px 0" : "0",
                backgroundColor: isActive ? "#ffffff" : "transparent",
                borderColor: isActive ? "#bfdbfe" : "transparent",
                color: isActive ? tab.color : "#64748b",
                fontSize: "14px",
                // fontSize: '12px', // ← CHỈNH: từ '13px' xuống '12px'
                cursor: "pointer",
                zIndex: isActive ? 20 : 1,
                marginTop: isActive ? "-8px" : "0",
                padding: isActive ? "20px 32px" : "16px 24px",
                boxShadow: isActive ? `0 8px 25px ${tab.color}20` : "none",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "scale(0.95)";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {/* Gradient overlay for active tab */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${tab.color}08, ${tab.color}03)`,
                    borderRadius: isFirst ? "12px 0 0 12px" : isLast ? "0 12px 12px 0" : "0",
                  }}
                />
              )}

              {/* Icon with gradient background */}
              <div
                style={{
                  position: "relative",
                  padding: "10px",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  background: isActive ? `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` : "#e2e8f0",
                  color: isActive ? "white" : "#64748b",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  boxShadow: isActive ? `0 4px 12px ${tab.color}30` : "none",
                }}
              >
                {createIcon(IconComponent, {
                  size: 20,
                  strokeWidth: 2.5,
                })}
              </div>

              {/* Label */}
              <span
                style={{
                  position: "relative",
                  fontWeight: "bold",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  color: isActive ? "#1f2937" : "#64748b",
                }}
              >
                {tab.label}
              </span>

              {/* Bottom indicator */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "64px",
                    height: "6px",
                    background: `linear-gradient(90deg, ${tab.color}, ${tab.color}cc)`,
                    borderRadius: "4px 4px 0 0",
                    boxShadow: `0 0 8px ${tab.color}50`,
                  }}
                />
              )}

              {/* Top accent */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "48px",
                    height: "4px",
                    background: `linear-gradient(90deg, ${tab.color}, ${tab.color}cc)`,
                    borderRadius: "0 0 4px 4px",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Content Header with Date Picker */}
        <div
          style={{
            // padding: '24px 32px',
            // padding: '12px 16px', // ← CHỈNH: từ '16px 20px' xuống '12px 16px'
            padding: "16px 20px", // ← CHỈNH: từ '16px 20px' xuống '12px 16px'
            borderBottom: "1px solid #e2e8f0",
            // background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)'
            background: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // ← THÊM DÒNG NÀY
            }}
          >
            {/* Left side - Title and Icon */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                // justifyContent: 'space-between', // ← THÊM DÒNG NÀY
                gap: "16px",
                // gap: '8px' // ← CHỈNH: từ '12px' xuống '8px'
              }}
            >
              {/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */}
              {/* ===============================================================*/}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: activeTab === "dashboard" ? "#2563eb" : activeTab === "generator" ? "#059669" : "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: activeTab === "dashboard" ? "0 4px 12px rgba(37, 99, 235, 0.25)" : activeTab === "generator" ? "0 4px 12px rgba(5, 150, 105, 0.25)" : "0 4px 12px rgba(124, 58, 237, 0.25)",
                }}
              >
                {createIcon(activeTab === "dashboard" ? FiBarChart : activeTab === "generator" ? FiEye : FiSettings, {
                  size: 24,
                  color: "white",
                  strokeWidth: 2.5,
                })}
              </div>

              <div>
                {/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */}
                {/* ===============================================================*/}
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1a202c",
                  }}
                >
                  {activeTab === "dashboard" ? "5G SRAN PnP Declaration" : activeTab === "generator" ? "5G SRAN PnP - Generator" : "5G SRAN PnP - Configuration  "}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  {activeTab === "dashboard" ? "Monitor and track 5G site commissioning progress" : activeTab === "generator" ? "Generate XML configuration files for 5G site commissioning" : "System settings and parameters"}
                </p>

                {/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
                {/* ===============================================================*/}
              </div>
            </div>

            {/* Right side - Date Picker Controls */}
            {activeTab === "dashboard" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  // gap: '8px'
                  // gap: '10px'
                  gap: "10px", // ← CHỈNH: từ '8px' lên '10px' (khoảng cách giữa các element)
                  marginRight: "20px", // ← THÊM: đẩy sang trái 20px
                }}
              >
                <div
                  style={{
                    // padding: '6px',
                    // borderRadius: '6px',
                    padding: "8px", // ← CHỈNH: từ '6px' lên '8px' (icon to hơn)
                    borderRadius: "8px", // ← CHỈNH: từ '6px' lên '8px'
                    backgroundColor: "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📅</span>
                </div>

                <input
                  type="date"
                  style={{
                    // width: '140px',
                    // padding: '6px 8px',
                    width: "160px", // ← CHỈNH: từ '140px' lên '160px' (input to hơn)
                    padding: "8px 10px", // ← CHỈNH: từ '6px 8px' lên '8px 10px'
                    border: "1px solid #d1d5db",
                    // borderRadius: '6px',
                    // fontSize: '12px',
                    borderRadius: "8px", // ← CHỈNH: từ '6px' lên '8px'
                    fontSize: "13px", // ← CHỈNH: từ '12px' lên '13px'
                    outline: "none",
                  }}
                  // defaultValue={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-control"
                />
                <button
                  style={{
                    // padding: '6px 12px',
                    padding: "8px 16px", // ← CHỈNH: từ '6px 12px' lên '8px 16px' (button to hơn)
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",

                    borderRadius: "8px", // ← CHỈNH: từ '6px' lên '8px'
                    fontSize: "13px", // ← CHỈNH: từ '12px' lên '13px'
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    // gap: '4px',
                    gap: "6px", // ← CHỈNH: từ '4px' lên '6px'
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      {/* // <span className="me-2">🔄</span> */}
                      {/* // Display Data*/}
                      <span>🔄</span>
                      Display
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real Component Content */}
        <div
          style={{
            minHeight: "400px",
            position: "relative",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default R007Tabs;
