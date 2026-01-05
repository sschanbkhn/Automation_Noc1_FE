

// export default ThietLap;
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import BangLog from "./BangLog";
import API_URL from "./apiConfig";
import ScheduleForm from "./ScheduleModule";
// Mapping card với table
const configTableMapping: { [key: number]: { table: string; api: string; title: string } } = {
  1: { table: "outlook", api: "/api/outlook", title: "Manual Trigger" },
  // 2: { table: "tablefilepath", api: `${API_URL}/thong-ke-log/`, title: "Execution Log" },
  2: { table: "objtablemrbts_infor", api: "/api/mrbts", title: "Email Configuration" },
  3: { table: "objtableresetsitecountlimits", api: "/api/resetlimits", title: "Scheduler Configuration" },
};

// //Chia loại API để vào dev hoặc production
// let ENV = "dev"; // hoặc "prod"
// // const ENV = "dev"; // hoặc "prod"
// let API_URL = "";
// if (ENV === "dev") {
//   API_URL = "http://127.0.0.1:8000/api/vpn3g4g";
// } else {
//   API_URL = "http://10.155.43.210:8000/api/vpn3g4g";
// }


const Configuration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Thêm vào đầu component
  const [showModal, setShowModal] = useState(false);
  // const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState<ConfigModule | null>(null);

  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  type ModuleStatus = "active" | "maintenance";

  const [logs, setLogs] = useState<any[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [executionLog, setExecutionLog] = useState<any[]>([]);
  const [executionLog_1, setExecutionLog_1] = useState([
    { email: "phamhaiquan@vnpt.vn", department: "Trung tâm SOC", note: "Đã gửi email số liệu thành công" },
    { email: "vietth@vnpt.vn", department: "Trung tâm SOC", note: "Đã gửi email số liệu thành công" },
    { email: "nguyenquang@vnpt.vn", department: "Trung tâm SOC", note: "Đã gửi email số liệu thành công" },
    { email: "nguyentrongphan@vnpt.vn", department: "Trung tâm SOC", note: "Đã gửi email số liệu thành công" },
    { email: "nguyenhaiphong@vnpt.vn", department: "Trung tâm SOC", note: "Đã gửi email số liệu thành công" },
    { email: "hoanganhtuan@vnpt.vn", department: "Trung tâm SOC", note: "Đã gửi email số liệu thành công" },
  ]);
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
      title: "Manual Trigger",
      description: "Activity & Change Settings",
      icon: faNetworkWired,
      iconColor: "#f59e0b",
      status: "active",
    },
    // {
    //   id: 2,
    //   title: "Execution Log",
    //   description: "Operation & Action Records",
    //   icon: faFolderOpen,
    //   iconColor: "#10b981",
    //   status: "active",
    // },
    {
      id: 2,
      title: "Email Configuration",
      description: "SMTP & Notification Settings",
      icon: faEnvelope,
      iconColor: "#3b82f6",
      status: "active",
    },
    
    // {
    //   id: 4,
    //   title: "Reset Site Limit",
    //   description: "Safety Threshold Controls",
    //   icon: faShieldAlt,
    //   iconColor: "#ef4444",
    //   status: "active",
    // },
    {
      id: 3,
      title: "Scheduler Configuration",
      description: "Automated Task Management",
      icon: faClock,
      iconColor: "#8b5cf6",
      status: "active",
    },
    // {
    //   id: 6,
    //   title: "Database Settings",
    //   description: "Connection & Backup Config",
    //   icon: faDatabase,
    //   iconColor: "#06b6d4",
    //   status: "maintenance",
    // },
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
                if (module.id === 1) {
                  const confirmRun = window.confirm("Bạn có chắc chắn muốn chạy workflow SOC-18001900 không?");
                  if (!confirmRun) {
                    setExecutionLog(prev => [
                      ...prev,
                      {
                        time: new Date().toLocaleString(),
                        workflow: "SOC-18001900",
                        status: "⚠️",
                        message: "Đã hủy thao tác bởi người dùng",
                      },
                    ]);
                    return;
                  }

                  try {
                    const response = await fetch(`${API_URL}/run-n8n/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ trigger: "from_frontend" }),
                    });

                    const result = await response.json();

                    alert(result.message || result.error || "Đã kích hoạt workflow SOC-18001900.");

                    setExecutionLog(prev => [
                      ...prev,
                      {
                        time: new Date().toLocaleString(),
                        workflow: "SOC-18001900",
                        status: result.error ? "❌" : "✅",
                        // message: result.message || result.error,
                        message: "Đã kích hoạt workflow, hệ thống đang xử lý...",
                      },
                    ]);
                  } catch (err) {
                    alert("Có lỗi kết nối tới API: " + err);

                    setExecutionLog(prev => [
                      ...prev,
                      {
                        time: new Date().toLocaleString(),
                        workflow: "SOC-18001900",
                        status: "❌",
                        message: "Lỗi kết nối API: " + err,
                      },
                    ]);
                }
                }
                else {
                  // Các card khác → load data table
                  const response = await fetch(config.api);
                  const data = await response.json();
                  setModalData(data);
                  // setShowModal(true);
                }
              } 
              catch (error) {
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
      {/* {showLog && (
        <BangLog
          title="Log thực thi tác động"
          data={logs}
          onClose={() => setShowLog(false)}
        />
      )} */}
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
                {/* {!showLog && (
                <>
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
                </>
                )} */}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowLog(false)}}
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
            {/* {!showLog && (
              
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
            )} */}
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
              
                // ==== Bảng log VPN3G4G ====
              ): selectedConfig?.id === 1 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: `${selectedConfig?.iconColor}15`,
                      borderBottom: `2px solid ${selectedConfig?.iconColor}`,
                    }}
                  >
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Time
                    </th>
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Workflow
                    </th>
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Status
                    </th>
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {executionLog?.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "12px" }}>{log.time}</td>
                      <td style={{ padding: "12px" }}>{log.workflow}</td>
                      <td
                        style={{
                          padding: "12px",
                          color: log.status === "✅" ? "green" : "red",
                        }}
                      >
                        {log.status}
                      </td>
                      <td style={{ padding: "12px" }}>{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              //Bảng cho lựa chọn thứ 2 là Email
            ): selectedConfig?.id === 2 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: `${selectedConfig?.iconColor}15`,
                      borderBottom: `2px solid ${selectedConfig?.iconColor}`,
                    }}
                  >
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      STT
                    </th>
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Địa chỉ Email
                    </th>
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Đơn vị
                    </th>
                    <th style={{ padding: "12px", color: selectedConfig?.iconColor }}>
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {executionLog_1.map((log, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{log.email}</td>
                      <td>{log.department}</td>
                      <td>{log.note}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
             ): selectedConfig?.id === 3 ? (
                <ScheduleForm/>
            ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >

                  <thead>
                    <tr
                      style={{
                        background: `${selectedConfig?.iconColor}15`,
                        borderBottom: `2px solid ${selectedConfig?.iconColor}`,
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: selectedConfig?.iconColor,
                        }}
                      >
                        ID
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: selectedConfig?.iconColor,
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: selectedConfig?.iconColor,
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: selectedConfig?.iconColor,
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "12px" }}>Sample data will load here</td>
                      <td style={{ padding: "12px" }}>when API is connected</td>
                      <td style={{ padding: "12px" }}>Active</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          style={{
                            background: selectedConfig?.iconColor,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            marginRight: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
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

