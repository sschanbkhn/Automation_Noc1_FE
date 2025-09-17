// MRBTSModal.tsx - Complete Version
import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faEdit, faTrash, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ConfigModule } from "./ConfigTypes";
import { shouldHideColumn, formatCellValue } from "./ConfigUtilsR005";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";

import { exportMrbtsConfigs } from "./ExportExcelFileUtils";

interface MRBTSModalProps {
  show: boolean;
  selectedConfig: ConfigModule | null;
  modalData: any[];
  modalLoading: boolean;
  modalSearchTerm: string;
  onSearch: (term: string) => void;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

const MRBTSModal: React.FC<MRBTSModalProps> = ({ show, selectedConfig, modalData, modalLoading, modalSearchTerm, onSearch, onClose, onAdd, onEdit, onDelete, onRefresh }) => {
  // Hooks phải ở đầu
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortField) return modalData || [];

    return [...(modalData || [])].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

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
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [modalData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    if (!sortedData) return [];
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination.currentPage, pagination.pageSize]);

  const totalPages = useMemo(() => Math.ceil((sortedData?.length || 0) / pagination.pageSize), [sortedData?.length, pagination.pageSize]);

  const visibleColumns = modalData.length > 0 ? Object.keys(modalData[0]).filter((key) => !shouldHideColumn(key, selectedConfig?.id || 0)) : [];

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

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      const jsonData: any[] = [];

      // Get headers from first row
      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || `Column${colNumber}`);
      });

      // Process data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            rowData[header] = cell.value;
          }
        });

        if (Object.keys(rowData).length > 0) {
          jsonData.push(rowData);
        }
      });

      console.log("Imported data:", jsonData);

      // Send to API
      const response = await fetch(`${API_CONFIG.BASE_URL}/configuration/import-mrbts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: jsonData }),
      });

      if (response.ok) {
        alert(`Import thành công ${jsonData.length} records!`);
        onRefresh();
      } else {
        throw new Error(`Import failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert(`Import thất bại: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const exportToExcel = async () => {
    try {
      if (!modalData || modalData.length === 0) {
        alert("No data to export");
        return;
      }

      await exportMrbtsConfigs(modalData);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }

    /*
    if (!modalData || modalData.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MRBTS Information");

    // Headers
    const headers = Object.keys(modalData[0]).filter((key) => !shouldHideColumn(key, selectedConfig.id));
    worksheet.addRow(headers);

    // Data rows
    modalData.forEach((item: any) => {
      const row = headers.map((header) => item[header] || "");
      worksheet.addRow(row);
    });

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `MRBTS_Information_export.xlsx`);
    */
  };

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
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>MRBTS Information</h3>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Network Management</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelImport} style={{ display: "none" }} ref={(ref) => setFileInputRef(ref)} />
            <button
              onClick={() => fileInputRef?.click()}
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
              <FontAwesomeIcon icon={faUpload} style={{ marginRight: "6px" }} />
              Import Excel
            </button>
            <button
              onClick={onAdd}
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
          <input
            type="text"
            value={modalSearchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search MRBTS records..."
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
                  border: "1px solid #e5e7eb",
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
                          border: "1px solid #e5e7eb",
                          maxWidth: "200px",
                          minWidth: "100px",
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
                        border: "1px solid #e5e7eb",
                        width: "150px",
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
                                maxWidth: "200px",
                                minWidth: "80px",
                                verticalAlign: "top",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              <div
                                title={shouldShowTooltip ? cellValue : undefined}
                                style={{
                                  maxWidth: "180px",
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

                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            border: "1px solid #e5e7eb",
                            width: "150px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <button
                              onClick={() => onEdit(item)}
                              style={{
                                background: selectedConfig.iconColor,
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "6px 8px",
                                fontSize: "11px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} style={{ fontSize: "10px" }} />
                              Edit
                            </button>

                            <button
                              onClick={() => onDelete(item.id)}
                              style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "6px 8px",
                                fontSize: "11px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "10px" }} />
                              Delete
                            </button>
                          </div>
                        </td>
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

export default MRBTSModal;
