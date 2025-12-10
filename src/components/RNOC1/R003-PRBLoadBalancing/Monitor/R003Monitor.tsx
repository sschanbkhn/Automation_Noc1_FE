import React, { useState, useEffect, useMemo, useRef } from "react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // ← THÊM
import { faChartLine } from "@fortawesome/free-solid-svg-icons"; // ← THÊM
import { Button } from "react-bootstrap"; // ← THÊM DÒNG NÀY
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// =============================================================================
// IMPORT EXPORT UTIL
// =============================================================================

import { exportToExcel } from "../Configuration/ExportExcelFileUtils";

// =============================================================================
// INTERFACE - Dữ liệu từ filterdetailarchive
// =============================================================================

interface FilterDetailRecord {
  rawid: number;
  period_start_time: string;
  mrbts_name: string;
  lnbts_name: string;
  lncel_name: string;
  dn_mrbts_site: string;
  pdcp_sdu_volume_dl: number;
  pdcp_sdu_volume_ul: number;
  eutran_avg_prb_usage_dl: number;
  max_pdcp_thr_dl: number;
  max_pdcp_thr_ul: number;
  affected_days: number;
  total_occurrences: number;
  avg_prb: number;
  max_prb: number;
  daily_detail: string;
  created_at: string;
  province?: string;
  district?: string;
  vendor?: string; // ← THÊM
  region?: string; // ← THÊM
}

const R003Monitor: React.FC = () => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [records, setRecords] = useState<FilterDetailRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FilterDetailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  // =============================================================================

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FilterDetailRecord | null>(null);
  // =============================================================================

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // =============================================================================

  // Filters
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]); // ← THÊM
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  // =============================================================================

  // Date Range
  const [startDate, setStartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString("en-CA");
  });
  // =============================================================================

  const [endDate, setEndDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString("en-CA");
  });
  // =============================================================================

  // Sort
  const [sortField, setSortField] = useState<string>("eutran_avg_prb_usage_dl");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  // =============================================================================
  // =============================================================================

  interface MultiSelectDropdownProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
  }
  // =============================================================================

  const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedValues, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      // =============================================================================

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      // =============================================================================

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);
    // =============================================================================

    const handleCheckboxChange = (option: string) => {
      const newSelectedValues = selectedValues.includes(option) ? selectedValues.filter((v) => v !== option) : [...selectedValues, option];
      onChange(newSelectedValues);
    };
    // =============================================================================

    const handleSelectAll = () => {
      onChange(filteredOptions);
    };
    // =============================================================================

    const handleClearAll = () => {
      onChange([]);
    };
    // =============================================================================

    const displayText = selectedValues.length === 0 ? placeholder : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} selected`;
    // phan nay giu nguyen
    // =============================================================================
    // =============================================================================

    return (
      <div className="position-relative" ref={dropdownRef}>
        <button
          type="button"
          className="form-select d-flex justify-content-between align-items-center"
          style={{
            borderRadius: "8px",
            textAlign: "left",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <span className={selectedValues.length === 0 ? "text-muted" : ""}>{displayText}</span>
        </button>

        {isOpen && (
          <div
            className="position-absolute bg-white border rounded shadow-lg"
            style={{
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1050,
              maxHeight: "400px",
              overflowY: "auto",
              minWidth: "200px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-bottom">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={(e) => {
                  e.stopPropagation();
                  setSearchTerm(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 border-bottom bg-light">
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  style={{ textDecoration: "none" }}
                >
                  Select All ({filteredOptions.length})
                </button>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  style={{ textDecoration: "none" }}
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <div
                      key={option}
                      className="d-flex align-items-center p-2"
                      style={{
                        cursor: "pointer",
                        borderRadius: "4px",
                        margin: "2px 0",
                        backgroundColor: isSelected ? "#e3f2fd" : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCheckboxChange(option);
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <div
                        className="form-check-input me-3"
                        style={{
                          width: "18px",
                          height: "18px",
                          flexShrink: 0,
                          backgroundColor: isSelected ? "#0d6efd" : "#fff",
                          borderColor: isSelected ? "#0d6efd" : "#dee2e6",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        {isSelected && (
                          <span
                            style={{
                              position: "absolute",
                              top: "1px",
                              left: "4px",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <label
                        className="form-check-label flex-grow-1"
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: isSelected ? "600" : "400",
                          color: isSelected ? "#0d6efd" : "#212529",
                          userSelect: "none",
                        }}
                      >
                        {option}
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-muted text-center">
                  <i>No options found for "{searchTerm}"</i>
                </div>
              )}
            </div>
            <div className="p-2 border-top text-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{ borderRadius: "6px" }}
              >
                ✅ Done ({selectedValues.length} selected)
              </button>
            </div>
            {selectedValues.length > 0 && (
              <div className="p-2 border-top bg-light text-center">
                <small className="text-muted">
                  {selectedValues.length} of {options.length} selected
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  // =============================================================================
  // =============================================================================

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      // setExecutionStatus("loading");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toLocaleDateString("en-CA");
      setStartDate(yesterdayString);
      setEndDate(yesterdayString);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/monitor-kpi/${yesterdayString}`);
        const result = await response.json();
        if (result.success) {
          setRecords(result.data.records);
          setFilteredRecords(result.data.records);
          // setExecutionStatus("success");
        } else {
          console.error("API Error:", result.error);
          setRecords([]);
          setFilteredRecords([]);
          // setExecutionStatus("failed");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setRecords([]);
        setFilteredRecords([]);
        // setExecutionStatus("failed");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);
  // =============================================================================
  // =============================================================================
  // FETCH DATA - Load initial data khi mount
  // =============================================================================

  const handleDisplayClick = async () => {
    setLoading(true);
    // setExecutionStatus("loading");
    try {
      if (startDate > endDate) {
        alert("Start Date cannot be greater than End Date");
        setLoading(false);
        // setExecutionStatus("failed");
        return;
      }
      // =============================================================================

      if (!startDate || !endDate) {
        alert("Please select both Start Date and End Date");
        setLoading(false);
        // setExecutionStatus("failed");
        return;
      }
      // =============================================================================

      const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/monitor-range-kpi?startDate=${startDate}&endDate=${endDate}`);
      // const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/monitor-range-kp?startDate=${startDate}&endDate=${endDate}`);
      // const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/monitor-range-kp?startDate=${startDate}&endDate=${endDate}`);
      // =============================================================================

      const result = await response.json();
      if (result.success) {
        setRecords(result.data.records);
        setFilteredRecords(result.data.records);
        // setExecutionStatus("success");
      } else {
        console.error("API Error:", result.error);
        setRecords([]);
        setFilteredRecords([]);
        // setExecutionStatus("failed");
        alert(`Error: ${result.error}`);
      }
      // =============================================================================
    } catch (error) {
      console.error("Fetch Error:", error);
      setRecords([]);
      setFilteredRecords([]);
      // setExecutionStatus("failed");
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // =============================================================================

  const uniqueProvinces = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.province)))
        .filter(Boolean)
        .sort(),
    [records]
  );
  // =============================================================================

  const uniqueDistricts = useMemo(() => {
    const filteredRecords = selectedProvinces.length > 0 ? records.filter((r) => selectedProvinces.includes(r.province)) : records;
    return Array.from(new Set(filteredRecords.map((r) => r.district)))
      .filter(Boolean)
      .sort();
  }, [records, selectedProvinces]);
  // =============================================================================

  const availableProvinces = useMemo(() => {
    if (selectedDistricts.length > 0) {
      const filteredRecords = records.filter((r) => selectedDistricts.includes(r.district));
      return Array.from(new Set(filteredRecords.map((r) => r.province)))
        .filter(Boolean)
        .sort();
    }
    return uniqueProvinces;
  }, [records, selectedDistricts, uniqueProvinces]);
  // =============================================================================

  const uniqueVendors = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.vendor)))
        .filter(Boolean)
        .sort(),
    [records]
  );
  // =============================================================================

  const uniqueRegions = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.region)))
        .filter(Boolean)
        .sort(),
    [records]
  );
  // =============================================================================
  // =============================================================================
  // FILTER LOGIC
  // =============================================================================

  useEffect(() => {
    let filtered = [...records];
    if (searchText) {
      filtered = filtered.filter((record) => Object.values(record).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase())));
    }
    // =============================================================================
    if (selectedProvinces.length > 0) {
      filtered = filtered.filter((record) => selectedProvinces.includes(record.province));
    }
    // =============================================================================
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter((record) => selectedDistricts.includes(record.district));
    }
    // =============================================================================
    if (selectedVendors.length > 0) {
      filtered = filtered.filter((record) => selectedVendors.includes(record.vendor));
    }
    // =============================================================================
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((record) => selectedRegions.includes(record.region));
    }
    // =============================================================================

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField as keyof FilterDetailRecord];
        const bVal = b[sortField as keyof FilterDetailRecord];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    // =============================================================================

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [records, searchText, selectedProvinces, selectedDistricts, selectedVendors, selectedRegions, sortField, sortDirection]);
  // =============================================================================

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);
  // =============================================================================

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  // =============================================================================

  // =============================================================================
  // EXPORT DETAIL - Dùng ExportUtils
  // =============================================================================

  const handleExportDetailExcel = async () => {
    if (!selectedRecord) {
      alert("No record selected for export");
      return;
    }

    try {
      await exportToExcel({
        data: [selectedRecord], // ← 1 record duy nhất
        sheetName: "Cell Detail",
        fileName: `PRBs_Cell_${selectedRecord.lncel_name}_${new Date().toISOString().slice(0, 10)}`,
        exportType: "single",
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  // =============================================================================
  // EXPORT ALL - Dùng ExportUtils
  // =============================================================================

  const handleExportExcel = async () => {
    if (filteredRecords.length === 0) {
      alert("No data to export");
      return;
    }

    try {
      await exportToExcel({
        data: filteredRecords, // ← Tất cả filtered records
        sheetName: "PRBs Monitor",
        fileName: `PRBs_Monitor_${startDate}_to_${endDate}`,
        exportType: "multiple",
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const getExecutionStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#10b981";
      case "failed":
      case null:
      case undefined:
      case "":
      case "unknown":
        return "#ef4444";
      case "starting_reset":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  const getExecutionStatusText = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Success";
      case "failed":
      case null:
      case undefined:
      case "":
      case "unknown":
        return "Failed";
      case "starting_reset":
        return "Starting Reset";
      default:
        return "Failed";
    }
  };

  const TruncatedCell: React.FC<{ value: string; maxWidth?: string }> = ({ value, maxWidth = "140px" }) => (
    <td
      className="py-3 px-2"
      style={{
        fontSize: "0.875rem",
        maxWidth,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "help",
      }}
      title={value}
    >
      {value}
    </td>
  );

  const handleClearAll = () => {
    setSearchText("");
    setSelectedProvinces([]);
    setSelectedDistricts([]);
    setSelectedVendors([]);
    setSelectedRegions([]);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];
    setStartDate(yesterdayString);
    setEndDate(yesterdayString);
    setRecords([]);
    setFilteredRecords([]);
    // setExecutionStatus("idle");
    setLoading(false);
  };

  const getCellAvailColor = (availability: number) => {
    if (availability >= 95) return "#10b981";
    if (availability >= 90) return "#f59e0b";
    return "#ef4444";
  };

  // Thêm function này trước return
  const parseChartData = (dailyDetail: string) => {
    if (!dailyDetail) return [];

    // Format: "2025-10-04 (16x), 2025-10-05 (15x), ..."
    const entries = dailyDetail.split(", ");

    return entries
      .map((entry) => {
        const match = entry.match(/(\d{4}-\d{2}-\d{2})\s*\((\d+)x\)/);
        if (match) {
          return {
            date: match[1],
            occurrences: parseInt(match[2]),
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <>
      <style>
        {`
          /* ===== FORCE BORDER CHO TẤT CẢ CELL ===== */
          .prbs-table-bordered {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          .prbs-table-bordered thead th {
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            padding: 10px 8px !important;
          }
          
          .prbs-table-bordered tbody td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
          }
          
          /* Màu nền dòng chẵn/lẻ */
          .prbs-table-bordered tbody tr:nth-child(even) {
            background-color: #fff7ed !important;
          }
          
          .prbs-table-bordered tbody tr:nth-child(odd) {
            background-color: #ffffff !important;
          }
          
          /* Override màu nền cho TD */
          .prbs-table-bordered tbody tr:nth-child(even) td {
            background-color: #fff7ed !important;
          }
          
          .prbs-table-bordered tbody tr:nth-child(odd) td {
            background-color: #ffffff !important;
          }
        `}
      </style>

      <div className="container-fluid p-4">
        <div className="card mb-4" style={{ borderRadius: "12px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="🔍 Search all fields..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ borderRadius: "8px" }} />
              </div>
              <div className="col-md-2">
                <MultiSelectDropdown label="Province" options={availableProvinces} selectedValues={selectedProvinces} onChange={setSelectedProvinces} placeholder="All Provinces" />
              </div>
              <div className="col-md-2">
                <MultiSelectDropdown label="District" options={uniqueDistricts} selectedValues={selectedDistricts} onChange={setSelectedDistricts} placeholder="All Districts" />
              </div>
              <div className="col-md-2">
                <MultiSelectDropdown label="Region" options={uniqueRegions} selectedValues={selectedRegions} onChange={setSelectedRegions} placeholder="All Regions" />
              </div>
              <div className="col-md-2">
                <MultiSelectDropdown label="Vendor" options={uniqueVendors} selectedValues={selectedVendors} onChange={setSelectedVendors} placeholder="All Vendors" />
              </div>
            </div>
            <div className="mt-2">
              <div className="d-flex align-items-center gap-4 mb-2">
                <span className="text-muted" style={{ fontSize: "14px", fontWeight: "500", width: "150px" }}>
                  Start Date:
                </span>
                <span className="text-muted" style={{ fontSize: "14px", fontWeight: "500", width: "150px" }}>
                  End Date:
                </span>
                <span style={{ width: "170px" }}></span>
                <div className="d-flex align-items-center gap-4">
                  <span className="text-muted" style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
                    📅 Last Updated: {startDate && endDate ? (startDate === endDate ? new Date(startDate).toLocaleDateString("en-US") : `${new Date(startDate).toLocaleDateString("en-US")} - ${new Date(endDate).toLocaleDateString("en-US")}`) : "Not selected"}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ borderRadius: "8px", fontSize: "14px", width: "150px" }} />
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ borderRadius: "8px", fontSize: "14px", width: "150px" }} />
                <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleDisplayClick} disabled={loading} style={{ backgroundColor: "#fb923c", borderRadius: "8px", padding: "6px 12px", fontWeight: "600", fontSize: "14px" }}>
                  <span>👁️</span>
                  Display
                </button>
                <button className="btn btn-outline-secondary" onClick={handleClearAll} style={{ borderRadius: "8px", padding: "6px 12px", fontSize: "14px" }}>
                  🗑️ Clear All
                </button>
                <button className="btn btn-primary" onClick={handleExportExcel} style={{ borderRadius: "8px", padding: "6px 12px", fontSize: "14px" }}>
                  📊 Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* // ============================================================================= */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
            </span>
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px", borderRadius: "6px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-muted">per page</span>
          </div>
        </div>
        <div className="card" style={{ borderRadius: "12px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading KPI data...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0" prbs-table-bordered>
                  <thead
                    style={{
                      // background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      background: "#10b981",
                      // background: "#f97316",
                      // borderBottom: "3px solid #047857",
                      borderBottom: "2px solid #047857", // ← Giảm từ 3px xuống 1px
                      boxShadow: "0 2px 8px rgba(5, 150, 105, 0.2)",
                      // background: "#f97316", // ← ĐỔI SANG CAM
                      // borderBottom: "2px solid #047857",
                    }}
                  >
                    <tr>
                      <th
                        className="py-3 px-2"
                        style={{
                          color: "white", // Hoặc dùng color: "#ffffff"
                          fontSize: "0.875rem",
                          minWidth: "60px",
                          whiteSpace: "nowrap",
                          fontWeight: "700",
                          backgroundColor: "transparent",
                          borderColor: "rgba(255,255,255,0.2)",
                          // border: "1px solid rgba(255,255,255,0.5)", // ← ĐẬM HƠN (0.2 → 0.5)
                          border: "2px solid rgba(255,255,255,0.6)", // ← THÊM
                        }}
                      >
                        STT
                      </th>
                      {[
                        { field: "period_start_time", label: "Period Start Time", width: "120px" },
                        { field: "mrbts_name", label: "MRBTS Name", width: "140px" },
                        { field: "lnbts_name", label: "LNBTS Name", width: "140px" },
                        { field: "lncel_name", label: "Cell Name", width: "140px" },
                        { field: "dn_mrbts_site", label: "Site DN", width: "120px" },
                        { field: "pdcp_sdu_volume_dl", label: "PDCP DL", width: "120px" },
                        { field: "pdcp_sdu_volume_ul", label: "PDCP UL", width: "120px" },
                        { field: "eutran_avg_prb_usage_dl", label: "PRB Usage (%)", width: "120px" },
                        { field: "max_pdcp_thr_dl", label: "Max PDCP DL", width: "130px" },
                        { field: "max_pdcp_thr_ul", label: "Max PDCP UL", width: "130px" },
                        { field: "affected_days", label: "Days", width: "80px" },
                        { field: "total_occurrences", label: "Occurrences", width: "110px" },
                        { field: "avg_prb", label: "Avg PRB", width: "100px" },
                        { field: "max_prb", label: "Max PRB", width: "100px" },
                        { field: "daily_detail", label: "Daily Detail", width: "100px" },
                        { field: "province", label: "Province", width: "100px" },
                        { field: "district", label: "District", width: "100px" },
                      ].map(({ field, label, width }) => (
                        <th
                          key={field}
                          className="py-3 px-2"
                          style={{
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: "0.875rem",
                            minWidth: width,
                            whiteSpace: "nowrap",
                            color: "#ffffff", // ← Thêm màu trắng cho tất cả
                            fontWeight: "700",
                            backgroundColor: "transparent",
                            border: "2px solid rgba(255,255,255,0.6)", // ← THÊM
                          }}
                          onClick={() => handleSort(field)}
                        >
                          {label}
                          <span className="ms-1">{sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "⇅"}</span>
                        </th>
                      ))}
                      <th
                        className="py-3 px-2"
                        style={{
                          color: "white", // Hoặc dùng color: "#ffffff"
                          fontSize: "0.875rem",
                          minWidth: "110px",
                          whiteSpace: "nowrap",
                          fontWeight: "700",
                          backgroundColor: "transparent",
                          borderColor: "rgba(255,255,255,0.2)",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, index) => {
                      //const bgColor = index % 2 === 0 ? "#f8fafc" : "#ffffff";
                      const bgColor = index % 2 === 0 ? "#fff7ed" : "#ffffff";
                      const cellStyle = {
                        fontSize: "0.875rem",
                        backgroundColor: bgColor,
                      };
                      return (
                        <tr key={record.rawid}>
                          <td
                            className="px-2"
                            style={{
                              fontWeight: "500",
                              border: "1px solid #cbd5e1",
                              borderTop: "1px solid #cbd5e1", // ← FORCE 4 CẠNH
                              borderBottom: "1px solid #cbd5e1",
                              borderLeft: "1px solid #cbd5e1",
                              borderRight: "1px solid #cbd5e1",
                              padding: "8px",
                              fontSize: "0.875rem",
                            }}
                          >
                            {startIndex + index + 1}
                          </td>
                          {/* // ============================================================================= */}

                          <td
                            className="py-3 px-2"
                            style={{
                              border: "1px solid #cbd5e1",
                              borderTop: "1px solid #cbd5e1", // ← FORCE 4 CẠNH
                              borderBottom: "1px solid #cbd5e1",
                              borderLeft: "1px solid #cbd5e1",
                              borderRight: "1px solid #cbd5e1",
                              padding: "8px",
                              fontSize: "0.875rem",
                            }}
                          >
                            {record.period_start_time}
                          </td>
                          {/* // ============================================================================= */}

                          <TruncatedCell value={record.mrbts_name} maxWidth="200px" />
                          {/* // ============================================================================= */}

                          <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                            {record.lnbts_name}
                          </td>
                          <TruncatedCell value={record.lncel_name} maxWidth="180px" />
                          <TruncatedCell value={record.dn_mrbts_site} maxWidth="200px" />
                          {/* // ============================================================================= */}

                          {/* 7. PDCP Volume DL - THÊM */}
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            {record.pdcp_sdu_volume_dl?.toFixed(2) || "0.00"}
                          </td>

                          {/* 8. PDCP Volume UL - THÊM */}
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            {record.pdcp_sdu_volume_ul?.toFixed(2) || "0.00"}
                          </td>

                          {/* // ============================================================================= */}
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            <span>{record.eutran_avg_prb_usage_dl?.toFixed(1) || "0.0"}%</span>
                          </td>
                          {/* // ============================================================================= */}

                          {/* 10. Max PDCP DL - THÊM */}
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            {record.max_pdcp_thr_dl?.toLocaleString() || "0"}
                          </td>

                          {/* 11. Max PDCP UL - THÊM */}
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            {record.max_pdcp_thr_ul?.toLocaleString() || "0"}
                          </td>

                          {/* // ============================================================================= */}

                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            {record.affected_days}
                          </td>
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", textAlign: "center" }}>
                            {record.total_occurrences}
                          </td>
                          {/* // ============================================================================= */}

                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                            <span
                              style={{
                                color: record.avg_prb >= 90 ? "#DC2626" : record.avg_prb >= 80 ? "#F59E0B" : record.avg_prb >= 70 ? "#EAB308" : "#10B981",
                              }}
                            >
                              {record.avg_prb?.toFixed(1) || "0.0"}%
                            </span>
                          </td>

                          <td className="py-3 px-2" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                            <span
                              style={{
                                color: record.max_prb >= 90 ? "#DC2626" : record.max_prb >= 80 ? "#F59E0B" : record.max_prb >= 70 ? "#EAB308" : "#10B981",
                              }}
                            >
                              {record.max_prb?.toFixed(1) || "0.0"}%
                            </span>
                          </td>
                          {/* // ============================================================================= */}

                          <TruncatedCell value={record.daily_detail} maxWidth="200px" />

                          {/* // ============================================================================= */}

                          <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                            {record.province || "-"}
                          </td>
                          <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                            {record.district || "-"}
                          </td>
                          {/* // ============================================================================= */}

                          <td className="py-3 px-2" style={{ width: "100px", textAlign: "center" }}>
                            <Button
                              size="sm"
                              variant="info"
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowDetailModal(true);
                              }}
                              title="Xem chi tiết cell"
                            >
                              <FontAwesomeIcon icon={faChartLine} /> View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* ← BỎ DẤU PHẨY, CHỈ CÓ ))} */}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* // =============================================================================*/}
        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      {/* // =============================================================================*/}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedRecord && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }} onClick={() => setShowDetailModal(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
              {/* HEADER */}
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold" style={{ color: "#1e293b" }}>
                  📊 Cell Detail: <span style={{ color: "#f97316" }}>{selectedRecord.lncel_name}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    backgroundColor: "#fee2e2",
                    borderRadius: "50%",
                    opacity: 1,
                  }}
                />
              </div>
              {/* // =============================================================================*/}

              {/* BODY */}
              <div className="modal-body p-4" style={{ backgroundColor: "#ffffff" }}>
                {/* CHART PLACEHOLDER */}
                {/*
                <div
                  className="mb-4 p-4 text-center"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "2px dashed #cbd5e1",
                    minHeight: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📈</div>
                    <p className="text-muted mb-0">Chart sẽ hiển thị ở đây</p>
                    <p className="text-muted small">Daily PRB Usage Trend</p>
                  </div>
                </div>

                */}

                {/* CHART - 21 DAYS TREND */}
                <div className="mb-4 p-4" style={{ backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <h6 className="mb-3 fw-bold" style={{ color: "#1e293b" }}>
                    📈 Daily PRB Usage Trend (21 Days)
                  </h6>

                  {selectedRecord.daily_detail ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={parseChartData(selectedRecord.daily_detail)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} angle={-45} textAnchor="end" height={80} />

                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} label={{ value: "Occurrences", angle: -90, position: "insideLeft", style: { fill: "#64748b" } }} />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          }}
                          labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                        />

                        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

                        <Line type="monotone" dataKey="occurrences" stroke="#f97316" strokeWidth={3} dot={{ fill: "#f97316", r: 5 }} activeDot={{ r: 7, fill: "#ea580c" }} name="PRB Congestion Events" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted mb-0">No data available</p>
                    </div>
                  )}
                </div>

                {/* // =============================================================================*/}
                {/* THÔNG TIN CHI TIẾT */}
              </div>

              {/* FOOTER */}
              <div
                className="modal-footer"
                style={{
                  backgroundColor: "#f8fafc",
                  borderTop: "2px solid #e2e8f0",
                  borderRadius: "0 0 12px 12px",
                }}
              >
                <button
                  className="btn"
                  onClick={handleExportDetailExcel}
                  style={{
                    backgroundColor: "#f97316",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 20px",
                    fontWeight: "600",
                  }}
                >
                  📊 Export Excel
                </button>

                <button
                  className="btn"
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    backgroundColor: "#64748b",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 20px",
                    fontWeight: "600",
                  }}
                >
                  ✖️ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
  // =============================================================================*/
};
// =============================================================================*/

export default R003Monitor;
