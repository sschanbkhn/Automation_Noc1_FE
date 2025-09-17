// ArchiveModal.tsx - Fixed Hooks Order
import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTimes, faEdit, faTrash, faDownload, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ArchiveFilters, DropdownOptions } from "./ConfigTypes";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Thay đổi imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faTrash, faDownload, faPlus, faSearch, faFilter, faArchive, faCalendarAlt, faMapMarkerAlt, faIndustry } from "@fortawesome/free-solid-svg-icons";

interface ArchiveModalProps {
  show: boolean;
  onClose: () => void;
  onEdit?: (item: any) => void;
  onAdd?: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ show, onClose, onEdit, onAdd }) => {
  // ✅ TẤT CẢ HOOKS PHẢI Ở ĐẦU - TRƯỚC EARLY RETURN
  const [archiveData, setArchiveData] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  const [archiveFilters, setArchiveFilters] = useState<ArchiveFilters>({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    province: "",
    district: "",
    vendor: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    provinces: [],
    districts: [],
    vendors: [],
  });

  // ✅ useCallback để fix dependency warning
  const loadArchiveData = useCallback(async () => {
    setArchiveLoading(true);
    try {
      const params = new URLSearchParams();
      if (archiveFilters.startDate) params.append("startDate", archiveFilters.startDate);
      if (archiveFilters.endDate) params.append("endDate", archiveFilters.endDate);
      if (archiveFilters.province) params.append("province", archiveFilters.province);
      if (archiveFilters.district) params.append("district", archiveFilters.district);
      if (archiveFilters.vendor) params.append("vendor", archiveFilters.vendor);

      const response = await fetch(`${API_CONFIG.BASE_URL}/configuration/archive-reports?page=1&pageSize=50&${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;
      setArchiveData(data);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));

      console.log("Archive data loaded:", data);
    } catch (error) {
      console.error("Error loading archive data:", error);
      setArchiveData([]);
    } finally {
      setArchiveLoading(false);
    }
  }, [archiveFilters.startDate, archiveFilters.endDate, archiveFilters.province, archiveFilters.district, archiveFilters.vendor]);

  const loadDropdownOptions = useCallback(async () => {
    try {
      const [provincesRes, districtsRes, vendorsRes] = await Promise.all([fetch(`${API_CONFIG.BASE_URL}/configuration/get-archive-provinces`), fetch(`${API_CONFIG.BASE_URL}/configuration/get-archive-districts`), fetch(`${API_CONFIG.BASE_URL}/configuration/get-archive-vendors`)]);

      const [provincesData, districtsData, vendorsData] = await Promise.all([provincesRes.json(), districtsRes.json(), vendorsRes.json()]);

      setDropdownOptions({
        provinces: provincesData || [],
        districts: districtsData || [],
        vendors: vendorsData || [],
      });
    } catch (error) {
      console.error("Error loading dropdown options:", error);
      setDropdownOptions({
        provinces: [],
        districts: [],
        vendors: [],
      });
    }
  }, []);

  // ✅ useEffect with proper dependencies
  useEffect(() => {
    if (show) {
      loadDropdownOptions();
      loadArchiveData();
    }
  }, [show, loadDropdownOptions, loadArchiveData]);

  const handleFiltersChange = (newFilters: Partial<ArchiveFilters>) => {
    setArchiveFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // ✅ useMemo hooks
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return archiveData;
    return archiveData.filter((item: any) =>
      Object.values(item).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [archiveData, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortField]).toLowerCase();
      const bVal = String(b[sortField]).toLowerCase();

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination.currentPage, pagination.pageSize]);

  const totalPages = useMemo(() => Math.ceil(sortedData.length / pagination.pageSize), [sortedData.length, pagination.pageSize]);

  const visibleColumns = useMemo(() => (archiveData.length > 0 ? Object.keys(archiveData[0]).filter((key) => key.toLowerCase() !== "id") : []), [archiveData]);

  // ✅ EARLY RETURN SAU KHI TẤT CẢ HOOKS
  if (!show) return null;

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

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/configuration/delete-archive-report/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Xóa thành công!");
        loadArchiveData();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Xóa thất bại!");
    }
  };

  const exportToExcel = async () => {
    if (!sortedData || sortedData.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Archive Reports");

    const headers = Object.keys(sortedData[0]).filter((key) => key.toLowerCase() !== "id");
    worksheet.addRow(headers);

    sortedData.forEach((item: any) => {
      const row = headers.map((header) => item[header] || "");
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `archive_reports_${archiveFilters.startDate}_to_${archiveFilters.endDate}.xlsx`);
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
          width: "95vw",
          maxWidth: "1400px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#8e44ad",
            color: "white",
            padding: "20px 24px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Detail Archive Reports</h3>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {onAdd && (
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
                Add Report
              </button>
            )}
            <button
              onClick={exportToExcel}
              disabled={sortedData.length === 0}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "white",
                fontSize: "12px",
                cursor: sortedData.length === 0 ? "not-allowed" : "pointer",
                opacity: sortedData.length === 0 ? 0.5 : 1,
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

        {/* Filters */}
        {/*
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              From Date:
            </label>
            <input
              type="date"
              value={archiveFilters.startDate}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              To Date:
            </label>
            <input
              type="date"
              value={archiveFilters.endDate}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              Province:
            </label>
            <select
              value={archiveFilters.province}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  province: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value="">All Provinces ({dropdownOptions.provinces.length})</option>
              {dropdownOptions.provinces.map((province: string) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadArchiveData}
            disabled={archiveLoading}
            style={{
              background: "#8e44ad",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              cursor: archiveLoading ? "not-allowed" : "pointer",
              opacity: archiveLoading ? 0.7 : 1,
            }}
          >
            {archiveLoading ? "Loading..." : "Display"}
          </button>
        </div>

        */}

        {/* Filters - Tất cả trên 1 dòng */}

        {/* Filters - Compact trên 1 dòng */}
        <div
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input type="date" value={archiveFilters.startDate} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, startDate: e.target.value }))} style={{ width: "120px", padding: "4px 6px", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px" }} />
          <input type="date" value={archiveFilters.endDate} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, endDate: e.target.value }))} style={{ width: "120px", padding: "4px 6px", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px" }} />
          <select value={archiveFilters.province} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, province: e.target.value }))} style={{ width: "100px", padding: "4px 6px", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px" }}>
            <option value="">Province</option>
            {dropdownOptions.provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select value={archiveFilters.district} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, district: e.target.value }))} style={{ width: "100px", padding: "4px 6px", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px" }}>
            <option value="">District</option>
            {dropdownOptions.districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select value={archiveFilters.vendor} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, vendor: e.target.value }))} style={{ width: "100px", padding: "4px 6px", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px" }}>
            <option value="">Vendor</option>
            {dropdownOptions.vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search in results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "300px",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          <button onClick={loadArchiveData} disabled={archiveLoading} style={{ padding: "6px 12px", fontSize: "12px", background: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: archiveLoading ? "not-allowed" : "pointer" }}>
            {archiveLoading ? "Loading..." : "Display"}
          </button>
        </div>

        {/*}
        <div
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: "8px",
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: "110px" }}>
            <input type="date" value={archiveFilters.startDate} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, startDate: e.target.value }))} style={{ width: "100%", padding: "4px", fontSize: "11px" }} />
          </div>

          <div style={{ minWidth: "110px" }}>
            <input type="date" value={archiveFilters.endDate} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, endDate: e.target.value }))} style={{ width: "100%", padding: "4px", fontSize: "11px" }} />
          </div>

          <div style={{ minWidth: "80px" }}>
            <select value={archiveFilters.province} onChange={(e) => setArchiveFilters((prev) => ({ ...prev, province: e.target.value }))} style={{ width: "100%", padding: "4px", fontSize: "11px" }}>
              <option value="">All</option>
              {dropdownOptions.provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: "150px" }}>
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "4px", fontSize: "11px" }} />
          </div>

          <button onClick={loadArchiveData} style={{ padding: "4px 8px", fontSize: "11px", background: "#8e44ad", color: "white", border: "none" }}>
            Display
          </button>
        </div>


        */}

        {/* Search Bar */}
        {/*
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}>
          <input
            type="text"
            placeholder="Search in results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "300px",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          <span style={{ marginLeft: "16px", fontSize: "14px", color: "#6b7280" }}>{sortedData.length} records found</span>
        </div>
*/}
        {/* Table Content */}
        <div style={{ flex: 1, padding: "16px 24px", overflow: "auto" }}>
          {archiveLoading ? (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "40px",
              }}
            >
              Loading archive data...
            </div>
          ) : paginatedData.length > 0 ? (
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
                      background: "#8e44ad15",
                      borderBottom: "2px solid #8e44ad",
                    }}
                  >
                    {visibleColumns.map((key) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#8e44ad",
                          border: "1px solid #e5e7eb",
                          maxWidth: "200px",
                          cursor: "pointer",
                        }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                        {sortField === key && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                    {(onEdit || onAdd) && (
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#8e44ad",
                          border: "1px solid #e5e7eb",
                          width: "150px",
                        }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item: any, index: number) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#f9fafb" : "white",
                      }}
                    >
                      {visibleColumns.map((key: string) => {
                        // const cellValue = String(item[key] || "N/A");
                        const cellValue = String(item[key] || "");
                        const shouldShowTooltip = cellValue.length > 30;
                        const displayValue = shouldShowTooltip ? `${cellValue.substring(0, 30)}...` : cellValue;

                        return (
                          <td
                            key={key}
                            style={{
                              padding: "12px",
                              maxWidth: "200px",
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
                      {(onEdit || onAdd) && (
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
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                style={{
                                  background: "#8e44ad",
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
                            )}

                            <button
                              onClick={() => handleDelete(item.id)}
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
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

                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
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
                        padding: "4px 6px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginRight: "8px",
                      }}
                    >
                      <option value={10}>10/page</option>
                      <option value={20}>20/page</option>
                      <option value={50}>50/page</option>
                      <option value={100}>100/page</option>
                    </select>

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
                            background: pagination.currentPage === pageNum ? "#8e44ad" : "white",
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
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "40px",
              }}
            >
              No archive data found for the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
