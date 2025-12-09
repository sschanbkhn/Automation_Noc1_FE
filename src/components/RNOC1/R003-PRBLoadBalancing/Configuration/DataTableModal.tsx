// DataTableModal.tsx - Improved Version
import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPlus, faTimes, faEdit, faTrash, faChartLine, faDownload } from "@fortawesome/free-solid-svg-icons";
import { ConfigModule } from "./ConfigTypes";
import { shouldHideColumn, formatCellValue } from "./ConfigUtilsR005";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Modal, Table, Button } from "react-bootstrap"; // ← THÊM DÒNG NÀY
import { faPlus, faTimes, faEdit, faTrash, faDownload, faChartLine, faSearch, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import * as Icons from "@fortawesome/free-solid-svg-icons";

import { exportToExcel } from "./ExportExcelFileUtils"; // ← Thêm dòng này

interface DataTableModalProps {
  show: boolean;
  selectedConfig: ConfigModule | null;
  modalData: any[];
  modalLoading: boolean;

  onSearch: (term: string) => void;
  onClose: () => void;
  onView?: (item: any) => void; // ← THÊM DÒNG NÀY
}
//========================================================================

const DataTableModal: React.FC<DataTableModalProps> = ({ show, selectedConfig, modalData, modalLoading, onSearch, onView, onClose }) => {
  // Hooks phải ở đầu
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5, // de la 5 cho de nhin
    total: 0,
  });
  //========================================================================

  const [searchTerm, setSearchTerm] = useState<string>(""); // ← THÊM DÒNG NÀY
  //========================================================================

  // ← THÊM useMemo NÀY TRƯỚC sortedData
  const filteredData = useMemo(() => {
    if (!searchTerm) return modalData || [];

    return (modalData || []).filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())));
  }, [modalData, searchTerm]);

  // SỬA: Thay filteredData thành modalData
  const sortedData = useMemo(() => {
    // if (!sortField) return modalData || [];
    if (!sortField) return filteredData; // ← ĐỔI modalData → filteredData

    // return [...(modalData || [])].sort((a, b) => {
    return [...filteredData].sort((a, b) => {
      // ← ĐỔI modalData → filteredData
      let aVal = a[sortField];
      let bVal = b[sortField];
      //========================================================================

      // Nếu field là STT hoặc số, convert sang number
      if (sortField.toLowerCase().includes("stt") || sortField.toLowerCase().includes("no") || !isNaN(Number(aVal))) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      //========================================================================
      else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredData, sortField, sortDirection]); // ← ĐỔI modalData → filteredData
  // }, [modalData, sortField, sortDirection]);
  //========================================================================

  const paginatedData = useMemo(() => {
    if (!sortedData) return [];
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination.currentPage, pagination.pageSize]);

  const totalPages = useMemo(() => Math.ceil((sortedData?.length || 0) / pagination.pageSize), [sortedData?.length, pagination.pageSize]);
  //========================================================================

  if (!show || !selectedConfig) return null;

  const handleSort = (field: string) => {
    let newDirection: "asc" | "desc";

    if (sortField === field) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      newDirection = "asc";
    }

    setSortField(field);
    setSortDirection(newDirection);
  };
  //========================================================================

  const handleExportExcel = async () => {
    if (!modalData || modalData.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    try {
      await exportToExcel({
        data: modalData,
        sheetName: selectedConfig?.title || "Data",
        fileName: selectedConfig?.title || "export",
        exportType: "multiple",
      });
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi khi export Excel!");
    }
  };

  /*
  const exportToExcel = async () => {
    if (!modalData || modalData.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(selectedConfig.title || "Data");

    // Headers
    const headers = Object.keys(modalData[0]).filter((key) => !shouldHideColumn(key, selectedConfig.id));
    worksheet.addRow(headers);
    //========================================================================

    // Data rows
    modalData.forEach((item: any) => {
      const row = headers.map((header) => item[header] || "");
      worksheet.addRow(row);
    });
    //========================================================================

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${selectedConfig.title || "data"}_export.xlsx`);
  };
  */
  //========================================================================

  const visibleColumns = modalData.length > 0 ? Object.keys(modalData[0]).filter((key) => !shouldHideColumn(key, selectedConfig.id)) : [];
  //========================================================================

  // 2. ← THÊM handleViewTrend Ở ĐÂY
  const handleViewTrend = (item: any) => {
    if (onView) {
      onView(item);
    }
  };
  //========================================================================

  // ket thuc khai bao cac bien
  //========================================================================
  //************************************************************************
  //========================================================================

  return (
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
        {/* Header */}
        <div
          style={{
            background: selectedConfig.iconColor,
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
              <FontAwesomeIcon icon={selectedConfig.icon} style={{ fontSize: "20px" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{selectedConfig.title}</h3>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Configuration Management</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              /* onClick={exportToExcel} */
              onClick={handleExportExcel} // ← ĐỔI TÊN
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
              <FontAwesomeIcon icon={faDownload} style={{ marginRight: "6px" }} />
              Export Excel
            </button>
            <button
              onClick={onClose}
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
          {/* ← THÊM PHẦN NÀY */}
          <div style={{ flex: 1, maxWidth: "400px" }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                background: `${selectedConfig.iconColor}15`,
                color: selectedConfig.iconColor,
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                border: `1px solid ${selectedConfig.iconColor}30`,
              }}
            >
              {sortedData.length} records
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
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
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
            <>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb", // Thêm border cho table
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: `${selectedConfig.iconColor}15`,
                      borderBottom: `2px solid ${selectedConfig.iconColor}`,
                    }}
                  >
                    {visibleColumns.map((key) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          textAlign: "left",
                          fontWeight: "600",
                          color: selectedConfig.iconColor,
                          border: "1px solid #e5e7eb", // Thêm border cho header cells
                          maxWidth: "300px",
                          minWidth: "60px",
                          // ← CHỈNH ĐỘNG THEO TÊN CỘT
                          // minWidth: key.toLowerCase().includes("name") || key.toLowerCase().includes("dn") ? "200px" : key.toLowerCase().includes("id") || key.toLowerCase().includes("stt") ? "80px" : key.toLowerCase().includes("date") || key.toLowerCase().includes("time") ? "150px" : key.toLowerCase().includes("prb") || key.toLowerCase().includes("percent") ? "100px" : "120px",
                          // maxWidth: key.toLowerCase().includes("name") || key.toLowerCase().includes("dn") ? "350px" : key.toLowerCase().includes("id") || key.toLowerCase().includes("stt") ? "100px" : "250px",
                        }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                        {sortField === key && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: selectedConfig.iconColor,
                        border: "1px solid #e5e7eb", // Thêm border
                        width: "150px", // Cố định độ rộng cho cột Actions
                        minWidth: "150px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item: any, index: number) => (
                      <tr
                        key={item.id || index}
                        style={{
                          // Màu xen kẽ cho các dòng
                          backgroundColor: index % 2 === 0 ? "#f9fafb" : "white",
                        }}
                      >
                        {visibleColumns.map((key: string) => {
                          const cellValue = formatCellValue(item[key], key);
                          const shouldShowTooltip = cellValue.length > 30;
                          const displayValue = shouldShowTooltip ? `${cellValue.substring(0, 30)}...` : cellValue;

                          return (
                            <td
                              key={key}
                              style={{
                                padding: "12px",
                                maxWidth: "300px", // Giới hạn độ rộng
                                minWidth: "80px",
                                // ← CHỈNH ĐỘNG GIỐNG <th>
                                // minWidth: key.toLowerCase().includes("mrbts_name") || key.toLowerCase().includes("dn") ? "200px" : key.toLowerCase().includes("id") || key.toLowerCase().includes("stt") ? "80px" : key.toLowerCase().includes("date") || key.toLowerCase().includes("time") ? "150px" : key.toLowerCase().includes("prb") || key.toLowerCase().includes("percent") ? "100px" : "100px",
                                // maxWidth: key.toLowerCase().includes("mrbts_name") || key.toLowerCase().includes("dn") ? "500px" : key.toLowerCase().includes("id") || key.toLowerCase().includes("stt") ? "100px" : "250px",
                                verticalAlign: "top",
                                border: "1px solid #e5e7eb", // Thêm border cho cells
                              }}
                            >
                              <div
                                title={shouldShowTooltip ? cellValue : undefined} // Tooltip
                                style={{
                                  maxWidth: "202px", // Giới hạn width của content
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: shouldShowTooltip ? "help" : "default",
                                }}
                              >
                                {displayValue}
                              </div>
                            </td>
                          );
                        })}

                        {/* ← THÊM CỘT NÀY */}
                        <td style={{ textAlign: "center" }}>
                          <Button size="sm" variant="info" onClick={() => handleViewTrend(item)} title="Xem trend KPI theo giờ">
                            <FontAwesomeIcon icon={faChartLine} /> View
                          </Button>
                        </td>

                        {/*

                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            border: "1px solid #e5e7eb",
                            width: "150px",
                          }}
                        >
                          {/* Sắp xếp Edit và Delete trên cùng một dòng 
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          ></div>
                        </td>

                        */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={visibleColumns.length + 1}
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {modalLoading ? "Loading..." : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {sortedData.length > 0 && totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    padding: "12px 0",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, sortedData.length)} of {sortedData.length} records
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        background: pagination.currentPage === 1 ? "#f9fafb" : "white",
                        cursor: pagination.currentPage === 1 ? "not-allowed" : "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination((prev) => ({ ...prev, currentPage: pageNum }))}
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            background: pagination.currentPage === pageNum ? selectedConfig.iconColor : "white",
                            color: pagination.currentPage === pageNum ? "white" : "#374151",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: pagination.currentPage === pageNum ? "600" : "400",
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === totalPages}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        background: pagination.currentPage === totalPages ? "#f9fafb" : "white",
                        cursor: pagination.currentPage === totalPages ? "not-allowed" : "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTableModal;
