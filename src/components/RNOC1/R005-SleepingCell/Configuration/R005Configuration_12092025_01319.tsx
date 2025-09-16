// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase } from "@fortawesome/free-solid-svg-icons";
// import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

// import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch, faServer, faChartLine } from "@fortawesome/free-solid-svg-icons";

// import * as ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";

import React, { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch, faServer, faChartLine, faEdit, faTrash, faDownload, faSpinner, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";

// ===== TYPES =====
type ModuleStatus = "active" | "maintenance";
type SortDirection = "asc" | "desc";

interface ApiError {
  message: string;
  status?: number;
}

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
  8: { table: "archive-reports", api: API_CONFIG.BASE_URL + "/configuration/archive-reports?page=1&pageSize=50", title: "Detail Archive Reports" },
};

const Configuration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Thêm vào đầu component
  const [originalModalData, setOriginalModalData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  // const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState<ConfigModule | null>(null);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  // const [modalSearchTerm, setModalSearchTerm] = useState("");

  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // type ModuleStatus = "active" | "maintenance";

  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Search function
  const handleModalSearch = (searchValue: string) => {
    // setSearchTerm(searchValue);
    setModalSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setModalData(originalModalData);
      return;
    }

    const filtered = originalModalData.filter((item: any) => Object.values(item).some((value) => String(value).toLowerCase().includes(searchValue.toLowerCase())));
    setModalData(filtered);
  };
  //========================================================================

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
      title: "Detail Archive Reports",
      description: "Historical Data & Analytics",
      icon: faChartLine,
      iconColor: "#8e44ad",
      status: "active",
    },
  ];
  // ket thuc const configModules: ConfigModule[] = [
  //========================================================================

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
  //========================================================================

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
  // const renderDynamicRows = () => {
  //========================================================================

  // Làm đẹp tên header
  const formatHeaderName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1") // camelCase -> spaces
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };
  //========================================================================

  // Format cell values
  const formatCellValue = (value: any, key: string) => {
    if (key.toLowerCase().includes("password")) return "••••••••";
    if (typeof value === "boolean") return value ? "Active" : "Inactive";
    if (value === null || value === undefined) return "N/A";
    return String(value);
  };
  //========================================================================

  const filteredModules = configModules.filter((module) => module.title.toLowerCase().includes(searchTerm.toLowerCase()) || module.description.toLowerCase().includes(searchTerm.toLowerCase()));

  // Add button
  const handleAdd = () => {
    setEditingItem(null);
    setShowEditForm(true);
  };
  //========================================================================

  // Edit button
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowEditForm(true);
  };
  //========================================================================

  // Delete button
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const config = configTableMapping[selectedConfig.id];
      const response = await fetch(`${config.api.replace("get-", "delete-")}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh data
        const newData = await fetch(config.api).then((r) => r.json());
        setModalData(newData);
        setOriginalModalData(newData);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  //========================================================================

  // Save function
  const handleSave = async (formData: any) => {
    try {
      const config = configTableMapping[selectedConfig.id];
      const url = editingItem ? `${config.api.replace("get-", "update-")}/${editingItem.id}` : config.api.replace("get-", "add-");

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh data
        const newData = await fetch(config.api).then((r) => r.json());
        setModalData(newData);
        setOriginalModalData(newData);
        setShowEditForm(false);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };
  //========================================================================

  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  //========================================================================

  // Thêm functions
  const handleAddNew = () => {
    setEditingItem(null);

    // Tạo form từ keys của dữ liệu hiện tại, loại bỏ id
    if (modalData && modalData.length > 0) {
      const sampleItem = modalData[0];
      const emptyForm = Object.keys(sampleItem)
        .filter((key) => key.toLowerCase() !== "id") // Loại bỏ id
        .reduce((acc, key) => {
          // Ẩn trường đặc biệt cho MRBTS
          if (selectedConfig?.id === 3 && key.toLowerCase().includes("objtable4gkpireportresultdetails")) {
            return acc;
          }
          acc[key] = typeof sampleItem[key] === "boolean" ? false : "";
          return acc;
        }, {} as any);
      setFormData(emptyForm);
    }
    setShowAddEditModal(true);
  };
  //========================================================================

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddEditModal(true);
  };
  //========================================================================

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    //========================================================================

    const sorted = [...modalData].sort((a, b) => {
      const aVal = String(a[field]).toLowerCase();
      const bVal = String(b[field]).toLowerCase();
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    setModalData(sorted);
  };
  //========================================================================

  // Thêm state cho pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  // Computed values cho pagination
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return modalData.slice(start, end);
  }, [modalData, pagination.currentPage, pagination.pageSize]);

  const totalPages = useMemo(() => Math.ceil(modalData.length / pagination.pageSize), [modalData.length, pagination.pageSize]);

  const handleSaveForm = async () => {
    try {
      const config = configTableMapping[selectedConfig!.id];
      const url = editingItem ? `${config.api.replace("get-", "update-")}/${editingItem.id}` : config.api.replace("get-", "add-");

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newData = await fetch(config.api).then((r) => r.json());
        setModalData(newData);
        setOriginalModalData(newData);
        setShowAddEditModal(false);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };
  //========================================================================

  //========================================================================

  const renderCellWithTooltip = (value: any, key: string) => {
    const stringValue = String(value || "N/A");
    const isLong = stringValue.length > 20;

    if (isLong) {
      return (
        <div
          title={stringValue}
          style={{
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "help",
          }}
        >
          {stringValue}
        </div>
      );
    }

    return stringValue;
  };
  //========================================================================

  // phan excel
  //========================================================================
  const exportToExcel = async () => {
    if (!modalData || modalData.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(selectedConfig?.title || "Data");

    // Headers
    const headers = Object.keys(modalData[0]);
    worksheet.addRow(headers);

    // Data rows
    modalData.forEach((item: any) => {
      const row = headers.map((header) => item[header] || "");
      worksheet.addRow(row);
    });

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${selectedConfig?.title || "data"}_export.xlsx`);
  };
  //========================================================================

  //========================================================================
  //========================================================================
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

  //========================================================================
  //========================================================================

  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "500px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Search Bar */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="🔍 Search configurations..."
          value={searchTerm}
          // onChange={(e) => setSearchTerm(e.target.value)}
          // onChange={(e) => handleModalSearch(e.target.value)}
          // Giữ nguyên onChange cũ
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

                console.log("API URL:", config.api); // THÊM DÒNG NÀY

                const response = await fetch(config.api);
                const data = await response.json();
                setModalData(data);
                setOriginalModalData(data); // THÊM DÒNG NÀY

                console.log("API Response data:", data); // THÊM DÒNG NÀY
                console.log("Data type:", typeof data, "Length:", data?.length); // THÊM DÒNG NÀY

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
                  onClick={handleAddNew}
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
                  onClick={exportToExcel}
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
            {/*}
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
                value={modalSearchTerm}
                onChange={(e) => {
                  setModalSearchTerm(e.target.value);
                  handleModalSearch(e.target.value);
                }}
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

            */}

            {/* Search & Info Bar */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={modalSearchTerm}
                onChange={(e) => {
                  setModalSearchTerm(e.target.value);
                  handleModalSearch(e.target.value);
                }}
                placeholder="Search records..."
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    background: `${selectedConfig?.iconColor}15`,
                    color: selectedConfig?.iconColor,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: `1px solid ${selectedConfig?.iconColor}30`,
                  }}
                >
                  {modalData.length} records
                </div>

                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      currentPage: 1,
                    }))
                  }
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  <option value={5}>5/page</option>
                  <option value={10}>10/page</option>
                  <option value={20}>20/page</option>
                  <option value={50}>50/page</option>
                </select>
              </div>
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
                        Object.keys(modalData[0])
                          .filter((key) => key.toLowerCase() !== "id")
                          .map((key) => (
                            <th key={key} onClick={() => handleSort(key)} style={{ padding: "12px", cursor: "pointer", textAlign: "left", fontWeight: "600", color: selectedConfig?.iconColor }}>
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                              {sortField === key && (sortDirection === "asc" ? " ↑" : " ↓")}
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
                      paginatedData.map((item: any, index: number) => (
                        // modalData.map((item: any, index: number) => (
                        <tr key={item.id || index}>
                          {Object.keys(item)
                            .filter((key) => key.toLowerCase() !== "id")
                            .map((key) => (
                              <td key={key} style={{ padding: "12px", maxWidth: "200px", minWidth: "80px" }}>
                                {/* </td><td key={key} style={{ padding: "12px" }}>  */}
                                {(() => {
                                  let value = item[key];
                                  if (key.toLowerCase().includes("password")) value = "••••••••";
                                  else if (typeof value === "boolean") value = value ? "Active" : "Inactive";
                                  else if (value === null || value === undefined) value = "N/A";
                                  else value = String(value);
                                  if (String(value).length > 20) {
                                    return (
                                      <div
                                        title={String(value)}
                                        style={{
                                          maxWidth: "150px",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          cursor: "help",
                                        }}
                                      >
                                        {value}
                                      </div>
                                    );
                                  }
                                  return value;
                                })()}
                              </td>
                            ))}
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button
                              // onClick={() => handleEdit(item)}
                              onClick={() => handleEditItem(item)}
                              style={{ background: selectedConfig?.iconColor, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", marginRight: "4px", cursor: "pointer" }}
                            >
                              Edit
                            </button>

                            <button onClick={() => handleDelete(item.id)} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", cursor: "pointer" }}>
                              Delete
                            </button>
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

          {/* Add/Edit Modal */}
          {showAddEditModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                zIndex: 1001,
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
                  maxWidth: "600px",
                  maxHeight: "80vh",
                  overflow: "auto",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  style={{
                    background: selectedConfig?.iconColor || "#7c3aed",
                    color: "white",
                    padding: "20px",
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    {editingItem ? "Edit" : "Add New"} {selectedConfig?.title}
                  </h3>
                </div>
                <div style={{ padding: "20px" }}>
                  {Object.keys(formData)
                    .filter((key) => {
                      // Ẩn trường đặc biệt id
                      if (key.toLowerCase() === "id") return false;
                      // Ẩn trường đặc biệt cho MRBTS
                      if (selectedConfig?.id === 3 && key.toLowerCase().includes("objtable4gkpireportresultdetails")) {
                        return false;
                      }
                      return true;
                    })
                    .map((key) => (
                      <div key={key} style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</label>
                        {typeof formData[key] === "boolean" ? (
                          <input type="checkbox" checked={formData[key] || false} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />
                        ) : (
                          <input
                            type="text"
                            value={formData[key] || ""}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button
                      onClick={handleSaveForm}
                      style={{
                        background: selectedConfig?.iconColor || "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddEditModal(false)}
                      style={{
                        background: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ket thuc */}
        </div>
      )}
    </div>
  );
};

export default Configuration;
