import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal, Table } from "react-bootstrap";
import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChartLine, faCheckCircle, faSync, faFileExcel, faPlus, faTimes, faChartBar } from "@fortawesome/free-solid-svg-icons";
// import { faSearch, faChartLine, faCheckCircle, faSync, faFileExcel, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
// import { faChartBar } from "@fortawesome/free-solid-svg-icons";

interface SuccessfulZoneProps {
  selectedDate?: string;
  loading?: boolean;
}

interface ComparisonData {
  newCells: number; // Cells phát sinh mới
  resolvedCells: number; // Cells đã được xử lý thành công (mất đi)
  persistentCells: number; // Cells vẫn còn trong cả 2 ngày
  totalToday: number; // Tổng cells hôm nay
  totalYesterday: number; // Tổng cells hôm qua
}

// het phan 1
// ===============================================================

// phan 2
// ===============================================================
const SuccessfulZone: React.FC<SuccessfulZoneProps> = ({ selectedDate, loading: parentLoading }) => {
  // States
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  // Table states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: "asc" | "desc" } | null>(null);

  const isLoading = parentLoading || false;

  // Tính ngày hôm qua
  const getYesterdayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  // het phan 2
  // ===============================================================

  // ===============================================================
  // phan 3
  // Fetch comparison data
  useEffect(() => {
    if (selectedDate) {
      fetchComparisonData();
    }
  }, [selectedDate]);

  const fetchComparisonData = async () => {
    if (!selectedDate) return;

    try {
      const yesterdayDate = getYesterdayDate(selectedDate);

      // API calls thực tế
      const [todayResponse, yesterdayResponse] = await Promise.all([fetch(`${API_CONFIG.BASE_URL}/dashboard/sleeping-cells/${selectedDate}`), fetch(`${API_CONFIG.BASE_URL}/dashboard/sleeping-cells/${yesterdayDate}`)]);

      const todayData = await todayResponse.json();
      const yesterdayData = await yesterdayResponse.json();

      const todayCells = todayData.data || [];
      const yesterdayCells = yesterdayData.data || [];

      // Tạo Set để so sánh
      const todayIds = new Set(todayCells.map((cell: any) => cell.lncel_name));
      const yesterdayIds = new Set(yesterdayCells.map((cell: any) => cell.lncel_name));

      // Tính toán
      const newCells = todayCells.filter((cell: any) => !yesterdayIds.has(cell.lncel_name)).length;
      const resolvedCells = yesterdayCells.filter((cell: any) => !todayIds.has(cell.lncel_name)).length;
      const persistentCells = todayCells.filter((cell: any) => yesterdayIds.has(cell.lncel_name)).length;

      setComparisonData({
        newCells,
        resolvedCells,
        persistentCells,
        totalToday: todayCells.length,
        totalYesterday: yesterdayCells.length,
      });
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    }
  };

  // Handle card click
  const handleCardClick = async (cardType: string) => {
    if (!selectedDate) return;

    setModalType(cardType);
    setShowModal(true);
    setModalLoading(true);
    setSearchTerm("");
    setCurrentPage(1);
    setSortConfig(null);

    try {
      const yesterdayDate = getYesterdayDate(selectedDate);

      // API calls thực tế
      const [todayResponse, yesterdayResponse] = await Promise.all([fetch(`${API_CONFIG.BASE_URL}/dashboard/sleeping-cells/${selectedDate}`), fetch(`${API_CONFIG.BASE_URL}/dashboard/sleeping-cells/${yesterdayDate}`)]);

      const todayData = await todayResponse.json();
      const yesterdayData = await yesterdayResponse.json();

      const todayCells = todayData.data || [];
      const yesterdayCells = yesterdayData.data || [];

      let filteredData = [];

      switch (cardType) {
        case "new":
          const yesterdayIds = new Set(yesterdayCells.map((cell: any) => cell.lncel_name));
          filteredData = todayCells.filter((cell: any) => !yesterdayIds.has(cell.lncel_name));
          break;
        case "resolved":
          const todayIds = new Set(todayCells.map((cell: any) => cell.lncel_name));
          filteredData = yesterdayCells.filter((cell: any) => !todayIds.has(cell.lncel_name));
          break;
        case "persistent":
          const persistentYesterdayIds = new Set(yesterdayCells.map((cell: any) => cell.lncel_name));
          filteredData = todayCells.filter((cell: any) => persistentYesterdayIds.has(cell.lncel_name));
          break;
      }

      setModalData(filteredData);
    } catch (error) {
      console.error("Error fetching detail data:", error);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };
  // ===============================================================

  // het phan 3
  // ===============================================================

  // ===============================================================
  // phan 4
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
  // ===============================================================
  // het [phan 4]
  // ===============================================================
  // ===============================================================

  // phan 5
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
      case "new":
        return "📈 Cells phát sinh mới";
      case "resolved":
        return "✅ Cells đã được xử lý thành công";
      case "persistent":
        return "🔄 Cells vẫn còn tồn tại";
      default:
        return "Chi tiết cells";
    }
  };

  const getTableHeaders = () => [
    { key: "STT", field: "index" },
    { key: "Cell Name", field: "lncel_name" },
    { key: "Site Name", field: "lnbts_name" },
    { key: "Province", field: "province" },
    { key: "District", field: "district" },
    { key: "Period StartTime", field: "period_start_time" },
  ];

  // Export Excel function
  const exportToExcel = async () => {
    const headers = getTableHeaders();
    const exportData = getSortedData().map((item, index) => {
      const row: { [key: string]: any } = { STT: index + 1 };
      headers.forEach((header) => {
        if (header.field === "index") return;
        row[header.key] = item[header.field] || "N/A";
      });
      return row;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(modalType.toUpperCase());

    worksheet.addRows([Object.keys(exportData[0]), ...exportData.map((row) => Object.values(row))]);

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2196F3" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      cell.border = borderStyle;
    });

    // Style data rows với border
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.height = 20;

      const isEvenRow = (i - 2) % 2 === 0;
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isEvenRow ? "FFF8F9FA" : "FFFFFFFF" },
        };
        cell.alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        cell.border = borderStyle;
      });
    }

    worksheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length);
      });
      col.width = maxLength < 15 ? 15 : maxLength;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${modalType}_cells_comparison_${selectedDate}.xlsx`);
  };

  // het phan 5
  // ===============================================================
  // ===============================================================
  // phan 6
  const renderPaginationButtons = () => {
    const totalPages = getTotalPages();
    const buttons = [];

    buttons.push(
      <button key="prev" className="btn btn-outline-primary btn-sm me-1" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
        ‹ Trước
      </button>
    );

    const maxVisible = 5;
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

    buttons.push(
      <button className="btn btn-secondary ms-5" key="close" onClick={() => setShowModal(false)}>
        Close
      </button>
    );

    return buttons;
  };

  // Render Modern Table
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
            // background: modalType === "new" ? "#e8f5e8" : modalType === "resolved" ? "#ff9800" : "#f44336",
            color: "white",
            padding: "20px 25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>{getModalTitle()}</h4>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            {modalType === "resolved" ? getYesterdayDate(selectedDate || "") : selectedDate}
            {modalType === "persistent" && ` & ${getYesterdayDate(selectedDate || "")}`}
          </div>
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>bản ghi</span>
            </div>

            <div style={{ fontSize: "14px", color: "#666" }}>
              Tổng: <strong>{modalData.length}</strong> bản ghi
            </div>
            <button className="btn btn-success btn-sm" onClick={() => exportToExcel()} style={{ marginLeft: "15px" }}>
              📊 Export Excel
            </button>
          </div>
        </div>
        {/*// het phan 6 */}
        {/*// phan 7 */}
        {/* Modern Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead>
              <tr>
                {getTableHeaders().map((header) => (
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
                      border: "1px solid #1976d2",
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
                      {getTableHeaders().map((header, colIndex) => {
                        let cellContent;

                        if (header.field === "index") {
                          cellContent = globalIndex;
                        } else if (header.field === "lncel_name") {
                          cellContent = <span style={{ fontWeight: 600, color: "#1976D2", fontFamily: "monospace" }}>{item.lncel_name || "N/A"}</span>;
                        } else if (header.field === "province") {
                          cellContent = <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, color: "#9a3412", background: "#fff3cd" }}>{item.province || "N/A"}</span>;
                        } else if (header.field === "district") {
                          cellContent = <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, color: "#721c24", background: "#f8d7da" }}>{item.district || "N/A"}</span>;
                        } else {
                          cellContent = item[header.field] || "N/A";
                        }

                        return (
                          <td key={colIndex} style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", border: "1px solid #e0e0e0", fontSize: "14px" }}>
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#666",
                      fontStyle: "italic",
                      border: "1px solid #e0e0e0",
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
            <div style={{ display: "flex", gap: "5px", marginRight: "40px" }}>{renderPaginationButtons()}</div>
          </div>
        )}
      </div>
    );
  };
  // ===============================================================

  // het phan 7
  // ===============================================================
  // ===============================================================

  // phan 8
  return (
    // ← THÊM DÒNG NÀY

    <div className="mb-1">
      {/* Summary Row */}
      <Row className="mt-1" style={{ marginTop: "-100px", marginBottom: "-30px" }}>
        <Col>
          <Card style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div style={{ minWidth: "200px" }}>
                  <h5 className="mb-0" style={{ color: "#2c3e50", fontWeight: 600 }}>
                    <span style={{ fontSize: "2rem", marginRight: "4px" }}>📊</span>
                    Successful
                  </h5>
                </div>
                <div className="d-flex text-center ms-4" style={{ flex: 1 }}>
                  <div style={{ flex: 1, borderRight: "1px solid #dee2e6", paddingRight: "20px" }}>
                    <h6 className="text-muted mb-1">Tổng hôm nay</h6>
                    <h4 className="fw-bold text-primary">{comparisonData?.totalToday?.toLocaleString() || "0"}</h4>
                  </div>
                  <div style={{ flex: 1, borderRight: "1px solid #dee2e6", paddingLeft: "20px", paddingRight: "20px" }}>
                    <h6 className="text-muted mb-1">Tổng hôm qua</h6>
                    <h4 className="fw-bold text-secondary">{comparisonData?.totalYesterday?.toLocaleString() || "0"}</h4>
                  </div>
                  <div style={{ flex: 1, paddingLeft: "20px" }}>
                    <h6 className="text-muted mb-1">Tỷ lệ thành công</h6>
                    <h4 className="fw-bold text-info">{comparisonData && comparisonData.totalYesterday > 0 ? `${((comparisonData.resolvedCells / comparisonData.totalYesterday) * 100).toFixed(1)}%` : "0%"}</h4>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-1">
        {/* Card 1: Cells phát sinh mới */}
        <Col md={4}>
          <Card
            style={getCardStyle("new", {
              backgroundColor: "#e8f5e8",
              // backgroundColor: "#f3e8ff", // thay cho "#e8f5e8"
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "160px",
            })}
            onMouseEnter={() => setHoveredCard("new")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("new")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Cells phát sinh mới</p>
                  <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                    ({selectedDate} vs {selectedDate ? getYesterdayDate(selectedDate) : "N/A"})
                  </p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : comparisonData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {comparisonData.newCells?.toLocaleString() || "0"}
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
                      New
                    </span>
                    {hoveredCard === "new" && (
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
                  <span style={{ fontSize: "1.2rem", color: "white" }}>📈</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Cells đã được xử lý thành công */}
        <Col md={4}>
          <Card
            style={getCardStyle("resolved", {
              backgroundColor: "#e3f2fd",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "160px",
            })}
            onMouseEnter={() => setHoveredCard("resolved")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("resolved")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Cells đã được xử lý thành công</p>
                  <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                    (Đã mất đi từ {selectedDate ? getYesterdayDate(selectedDate) : "N/A"})
                  </p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : comparisonData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {comparisonData.resolvedCells?.toLocaleString() || "0"}
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
                      Resolved
                    </span>
                    {hoveredCard === "resolved" && (
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
                  <span style={{ fontSize: "1.2rem", color: "white" }}>✅</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Cells vẫn còn tồn tại */}
        <Col md={4}>
          <Card
            style={getCardStyle("persistent", {
              backgroundColor: "#fff3e0",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "160px",
            })}
            onMouseEnter={() => setHoveredCard("persistent")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("persistent")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Cells vẫn còn tồn tại</p>
                  <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                    (Có trong cả 2 ngày)
                  </p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : comparisonData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {comparisonData.persistentCells?.toLocaleString() || "0"}
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
                      Persistent
                    </span>
                    {hoveredCard === "persistent" && (
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
                  <span style={{ fontSize: "1.2rem", color: "white" }}>🔄</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Row */}
      {/*
      <Row className="mt-3">
        <Col>
          <Card style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <h5 className="mb-0" style={{ color: "#2c3e50", fontWeight: 600 }}>
                    📊 Successful Analysis
                  </h5>
                </div>
                <div className="col-md-9">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <div className="border-end">
                        <h6 className="text-muted mb-1">Tổng hôm nay</h6>
                        <h4 className="fw-bold text-primary">{comparisonData?.totalToday?.toLocaleString() || "0"}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border-end">
                        <h6 className="text-muted mb-1">Tổng hôm qua</h6>
                        <h4 className="fw-bold text-secondary">{comparisonData?.totalYesterday?.toLocaleString() || "0"}</h4>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Tỷ lệ giải quyết</h6>
                      <h4 className="fw-bold text-info">{comparisonData && comparisonData.totalYesterday > 0 ? `${((comparisonData.resolvedCells / comparisonData.totalYesterday) * 100).toFixed(1)}%` : "0%"}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      */}

      {/* Modal */}
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
              <p className="text-muted">No records found for the selected criteria</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};
// ===============================================================
// ===============================================================

export default SuccessfulZone;
// ===============================================================
// ===============================================================
