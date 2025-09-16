import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal, Table, Badge } from "react-bootstrap";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";

interface Zone1SleepingCellSummaryProps {
  selectedDate?: string;
  loading?: boolean;
  dashboardData?: DashboardData | null;
}

interface DashboardData {
  todayAnalysis: number;
  sleepingCells: number;
  processCells_: number;
  executionCells: number;
  recheckCells: number;
}

const Zone1SleepingCellSummary: React.FC<Zone1SleepingCellSummaryProps> = ({ selectedDate, loading: parentLoading, dashboardData }) => {
  // States
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Modern Table States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: "asc" | "desc" } | null>(null);

  const isLoading = parentLoading || false;

  // Handle card click
  const handleCardClick = async (cardType: string) => {
    console.log("Zone1 card clicked:", cardType, selectedDate);
    setModalType(cardType);
    setShowModal(true);
    setModalLoading(true);

    setSearchTerm("");
    setCurrentPage(1);
    setSortConfig(null);

    try {
      let endpoint = "";
      switch (cardType) {
        case "sleeping":
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/sleeping-cells/${selectedDate}`;
          break;
        case "process":
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/process-cells/${selectedDate}`;
          break;
        case "execution":
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/execution-cells/${selectedDate}`;
          break;
        case "recheck":
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/recheck-cells/${selectedDate}`;
          break;
      }

      console.log("Calling API:", endpoint);
      const response = await fetch(endpoint);
      const result = await response.json();
      console.log("Modal API response:", result);

      setModalData(result.data || []);
    } catch (error) {
      console.error("Error fetching detail data:", error);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Table functions
  const getFilteredData = () => {
    if (!searchTerm) return modalData;
    return modalData.filter((item) => (item.lncel_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.lnbts_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.province || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.district || "").toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const getSortedData = () => {
    const filteredData = getFilteredData();
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.column] || "";
      let bVal = b[sortConfig.column] || "";

      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const getPaginatedData = () => {
    const sortedData = getSortedData();
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, sortedData.length);
    return sortedData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getSortedData().length / entriesPerPage);
  };

  const handleSort = (column: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.column === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ column, direction });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= getTotalPages()) {
      setCurrentPage(page);
    }
  };

  const handleEntriesPerPageChange = (newEntries: number) => {
    setEntriesPerPage(newEntries);
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const totalPages = getTotalPages();
    const buttons = [];
    const maxVisible = 5;

    buttons.push(
      <button key="prev" className="btn btn-outline-primary btn-sm me-1" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
        ‹ Trước
      </button>
    );

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button key={i} className={`btn btn-sm me-1 ${i === currentPage ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handlePageChange(i)}>
          {i}
        </button>
      );
    }

    buttons.push(
      <button key="next" className="btn btn-outline-primary btn-sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}>
        Tiếp ›
      </button>
    );

    return buttons;
  };

  // Card style function
  const getCardStyle = (cardType: string, baseStyle: any) => ({
    ...baseStyle,
    cursor: "pointer",
    transform: hoveredCard === cardType ? "translateY(-4px) scale(1.02)" : "translateY(0)",
    boxShadow: hoveredCard === cardType ? "0 8px 32px rgba(0,0,0,0.15)" : baseStyle.boxShadow,
    transition: "all 0.3s ease",
  });

  // Modal titles
  const getModalTitle = () => {
    switch (modalType) {
      case "sleeping":
        return "Sleeping Cells Details";
      case "process":
        return "Process Cells Details";
      case "execution":
        return "Execution Cells Details";
      case "recheck":
        return "Recheck Cells Details";
      default:
        return "Cell Details";
    }
  };

  // Modern table component
  const renderModernTable = () => {
    const paginatedData = getPaginatedData();
    const sortedData = getSortedData();
    const startIndex = (currentPage - 1) * entriesPerPage + 1;
    const endIndex = Math.min(currentPage * entriesPerPage, sortedData.length);

    return (
      <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        {/* Modern Header */}
        <div
          style={{
            background: "#2196F3",
            color: "white",
            padding: "20px 25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>{getModalTitle()}</h4>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>{selectedDate}</div>
        </div>

        {/* Modern Controls */}
        <div
          style={{
            padding: "20px 25px",
            background: "#fafbfc",
            borderBottom: "1px solid #e1e8ed",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "8px 12px",
              minWidth: "300px",
            }}
          >
            <span style={{ color: "#666", marginRight: "8px" }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm theo Cell Name, Site Name, Province..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span>Hiển thị:</span>
              <select
                value={entriesPerPage}
                onChange={(e) => handleEntriesPerPageChange(parseInt(e.target.value))}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>bản ghi</span>
            </div>

            <div style={{ fontSize: "14px", color: "#666" }}>
              Tổng: <strong>{modalData.length}</strong> bản ghi
            </div>
          </div>
        </div>

        {/* Modern Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead>
              <tr>
                {[
                  { key: "#", field: "index" },
                  { key: "Cell Name", field: "lncel_name" },
                  { key: "Site Name", field: "lnbts_name" },
                  { key: "Province", field: "province" },
                  { key: "District", field: "district" },
                  { key: "Status", field: "period_start_time" },
                  { key: "Last Update", field: "created_at" },
                ].map((header) => (
                  <th
                    key={header.key}
                    onClick={header.field !== "index" ? () => handleSort(header.field) : undefined}
                    style={{
                      background: "#2196F3",
                      color: "white",
                      padding: "15px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: header.field !== "index" ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    {header.key}
                    {header.field !== "index" && <span style={{ opacity: 0.6, fontSize: "12px", marginLeft: "4px" }}>{sortConfig?.column === header.field ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : " ⇅"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#fafbfc" : "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e3f2fd";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fafbfc" : "white";
                      }}
                    >
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: "bold" }}>{globalIndex}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                        <span style={{ fontWeight: 600, color: "#1976D2", fontFamily: "monospace" }}>{item.lncel_name || "N/A"}</span>
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>{item.lnbts_name || "N/A"}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "white",
                            background: "#2196F3",
                          }}
                        >
                          {item.province || "N/A"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>{item.district || "N/A"}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 12px",
                            borderRadius: "15px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "#e8f5e8",
                            color: "#2e7d32",
                          }}
                        >
                          {item.period_start_time || "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", color: "#666" }}>{item.created_at || "N/A"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    {searchTerm ? "Không tìm thấy dữ liệu phù hợp" : "Không có dữ liệu"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination */}
        {sortedData.length > 0 && (
          <div
            style={{
              padding: "20px 25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fafbfc",
              borderTop: "1px solid #e1e8ed",
            }}
          >
            <div style={{ fontSize: "14px", color: "#666" }}>
              Hiển thị <strong>{sortedData.length > 0 ? startIndex : 0}</strong> - <strong>{endIndex}</strong> trong số <strong>{sortedData.length}</strong> bản ghi
            </div>
            <div style={{ display: "flex", gap: "5px" }}>{renderPaginationButtons()}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <Row className="g-3 mb-1" style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}>
        {/* Card 1: Today's Analysis */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={{
              backgroundColor: "#ffebf0",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            }}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Today's Analysis</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.todayAnalysis?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#e91e63",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Info
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #e91e63, #c2185b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>📊</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Sleeping Cells */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("sleeping", {
              backgroundColor: "#f3e8ff",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("sleeping")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("sleeping")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Sleeping Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.sleepingCells?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Critical
                    </span>
                    {hoveredCard === "sleeping" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#f44336",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Click to view →
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #f44336, #d32f2f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>😴</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Process Cells */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("process", {
              backgroundColor: "#fff3e0",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("process")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("process")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Process Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.processCells_?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#ff9800",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Active
                    </span>
                    {hoveredCard === "process" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#ff9800",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Click to view →
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #ff9800, #f57c00)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>⚡</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 4: Execution Cells */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("execution", {
              backgroundColor: "#e3f2fd",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("execution")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("execution")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Execution Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.executionCells?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Running
                    </span>
                    {hoveredCard === "execution" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#2196f3",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Click to view →
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2196f3, #1976d2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>🔧</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 5: Recheck Cells */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("recheck", {
              backgroundColor: "#e8f5e8",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("recheck")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("recheck")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Recheck Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.recheckCells?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#4caf50",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Verified
                    </span>
                    {hoveredCard === "recheck" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#4caf50",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Click to view →
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4caf50, #388e3c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>🔍</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal với Modern Design */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Body style={{ padding: "0" }}>
          {modalLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading detailed data...</p>
            </div>
          ) : modalData.length > 0 ? (
            renderModernTable()
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
              <h5 className="text-muted">No data available</h5>
              <p className="text-muted">No records found for {selectedDate}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Zone1SleepingCellSummary;
