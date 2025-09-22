import React, { useState, useEffect, useMemo, useRef } from "react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";

interface KpiRecord {
  id: number;
  original_id: number;
  period_start_time: string;
  mrbts_name: string;
  lnbts_name: string;
  lncel_name: string;
  dn_mrbts_site: string;
  pdcp_volume_dl: number;
  pdcp_volume_ul: number;
  cell_avail: number;
  max_ues: number;
  max_pdcp_dl: number;
  max_pdcp_ul: number;
  original_created_at: string;
  province: string;
  district: string;
  region: string;
  data_date: string;
  data_year: number;
  data_month: number;
  data_day: number;
  data_quarter: number;
  data_week: number;
  vendor: string;
  archived_at: string;
  archived_by: string;
  execution_status?: string;
  action_blacklist: boolean;
  user_notes?: number;
  reset_permission: boolean;
  mrbts_infor_id?: number;
  last_synced_at?: string;
  reset_count: number;
  last_reset_at?: string;
  last_reset_by?: string;
  last_reset_success?: string;
  total_success_rate?: number;
  reset_enabled: boolean;
  reset_history?: number;
  execution_notes?: string;
  execution_started_at?: string;
  execution_completed_at?: string;
  execution_duration?: number;
  ssh_host?: string;
  ssh_connection_status?: string;
  execution_log?: string;
  ping_test_before?: string;
  ping_test_after?: number;
  ssh_connect_started_at?: string;
  ssh_connect_completed_at?: string;
  command_sent_at?: string;
  command_response_received_at?: string;
}

const KpiMonitorTab: React.FC = () => {
  const [records, setRecords] = useState<KpiRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KpiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<KpiRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString("en-CA");
  });
  const [endDate, setEndDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString("en-CA");
  });
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  interface MultiSelectDropdownProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
  }

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

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleCheckboxChange = (option: string) => {
      const newSelectedValues = selectedValues.includes(option) ? selectedValues.filter((v) => v !== option) : [...selectedValues, option];
      onChange(newSelectedValues);
    };

    const handleSelectAll = () => {
      onChange(filteredOptions);
    };

    const handleClearAll = () => {
      onChange([]);
    };

    const displayText = selectedValues.length === 0 ? placeholder : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} selected`;

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

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setExecutionStatus("loading");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toLocaleDateString("en-CA");
      setStartDate(yesterdayString);
      setEndDate(yesterdayString);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/kpi-monitor/${yesterdayString}`);
        const result = await response.json();
        if (result.success) {
          setRecords(result.data.records);
          setFilteredRecords(result.data.records);
          setExecutionStatus("success");
        } else {
          console.error("API Error:", result.error);
          setRecords([]);
          setFilteredRecords([]);
          setExecutionStatus("failed");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setRecords([]);
        setFilteredRecords([]);
        setExecutionStatus("failed");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDisplayClick = async () => {
    setLoading(true);
    setExecutionStatus("loading");
    try {
      if (startDate > endDate) {
        alert("Start Date cannot be greater than End Date");
        setLoading(false);
        setExecutionStatus("failed");
        return;
      }
      if (!startDate || !endDate) {
        alert("Please select both Start Date and End Date");
        setLoading(false);
        setExecutionStatus("failed");
        return;
      }
      const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/kpi-monitor-range?startDate=${startDate}&endDate=${endDate}`);
      const result = await response.json();
      if (result.success) {
        setRecords(result.data.records);
        setFilteredRecords(result.data.records);
        setExecutionStatus("success");
      } else {
        console.error("API Error:", result.error);
        setRecords([]);
        setFilteredRecords([]);
        setExecutionStatus("failed");
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setRecords([]);
      setFilteredRecords([]);
      setExecutionStatus("failed");
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueProvinces = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.province)))
        .filter(Boolean)
        .sort(),
    [records]
  );

  const uniqueDistricts = useMemo(() => {
    const filteredRecords = selectedProvinces.length > 0 ? records.filter((r) => selectedProvinces.includes(r.province)) : records;
    return Array.from(new Set(filteredRecords.map((r) => r.district)))
      .filter(Boolean)
      .sort();
  }, [records, selectedProvinces]);

  const availableProvinces = useMemo(() => {
    if (selectedDistricts.length > 0) {
      const filteredRecords = records.filter((r) => selectedDistricts.includes(r.district));
      return Array.from(new Set(filteredRecords.map((r) => r.province)))
        .filter(Boolean)
        .sort();
    }
    return uniqueProvinces;
  }, [records, selectedDistricts, uniqueProvinces]);

  const uniqueVendors = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.vendor)))
        .filter(Boolean)
        .sort(),
    [records]
  );

  const uniqueRegions = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.region)))
        .filter(Boolean)
        .sort(),
    [records]
  );

  useEffect(() => {
    let filtered = [...records];
    if (searchText) {
      filtered = filtered.filter((record) => Object.values(record).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase())));
    }
    if (selectedProvinces.length > 0) {
      filtered = filtered.filter((record) => selectedProvinces.includes(record.province));
    }
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter((record) => selectedDistricts.includes(record.district));
    }
    if (selectedVendors.length > 0) {
      filtered = filtered.filter((record) => selectedVendors.includes(record.vendor));
    }
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((record) => selectedRegions.includes(record.region));
    }
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField as keyof KpiRecord];
        const bVal = b[sortField as keyof KpiRecord];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [records, searchText, selectedProvinces, selectedDistricts, selectedVendors, selectedRegions, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDetail = async (record: KpiRecord) => {
    setSelectedRecord(null);
    setShowDetailModal(true);
    try {
      const params = new URLSearchParams();
      params.append("date", record.data_date);
      const response = await fetch(`${API_CONFIG.BASE_URL}/monitoring/kpi-monitor/cell-detail/${encodeURIComponent(record.lncel_name)}?${params}`);
      const result = await response.json();
      console.log("API Response for cell detail:", result); // Ghi log để kiểm tra dữ liệu API
      if (result.success && result.data && result.data[0]) {
        setSelectedRecord(result.data[0]);
      } else {
        console.error("API Error:", result.error || "No data returned");
        alert("Failed to load cell details");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Network error while loading details");
    }
  };

  const handleExportDetailExcel = async () => {
    if (!selectedRecord) {
      alert("No record selected for export");
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("KPI Detail");

      console.log(" handleExportDetailExcel All keys:", Object.keys(selectedRecord));

      // Tạo header row từ keys
      const headers = Object.keys(selectedRecord);
      const headerRow = worksheet.addRow(headers);

      // Tạo data row từ values
      const values = Object.values(selectedRecord).map((value) => (value !== null && value !== undefined ? String(value) : "N/A"));
      const dataRow = worksheet.addRow(values);

      // Style header row
      headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "10b981" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Style data row với màu theo field
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        const key = headers[colNumber - 1];
        let bgColor = "FFFFFF"; // default

        // Áp dụng màu theo key như trong modal
        if (key === "pdcp_volume_dl") bgColor = "e8f5e9";
        else if (key === "pdcp_volume_ul") bgColor = "e0f2f1";
        else if (key === "cell_avail") bgColor = "c8e6c9";
        else if (key === "max_ues") bgColor = "a5d6a7";
        else if (key === "period_start_time") bgColor = "fff8e1";
        else if (key === "data_date") bgColor = "fff3e0";
        else if (key === "execution_status") bgColor = "e8eaf6";
        else if (key === "ssh_host") bgColor = "f3e5f5";
        else if (key === "province") bgColor = "cce5ff";
        else if (key === "district") bgColor = "ffe6cc";
        else if (key.includes("archived_by")) bgColor = "e8f5e9";
        else if (key === "action_blacklist") bgColor = "ffe0b2";
        else if (key === "user_notes") bgColor = "cce5ff";
        else if (key === "reset_permission") bgColor = "ffcc02";
        else if (key === "last_reset_by") bgColor = "e3f2fd";
        else if (key === "ping_test_before") bgColor = "ede7f6";
        else if (key === "max_pdcp_dl") bgColor = "ffcc02";
        else if (key === "max_pdcp_ul") bgColor = "f1f8e9";
        else if (key === "execution_status") bgColor = "d4edda";
        else if (key === "ssh_connection_status") bgColor = "d4edda";

        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border = {
          top: { style: "thin", color: { argb: "D1D5DB" } },
          left: { style: "thin", color: { argb: "D1D5DB" } },
          bottom: { style: "thin", color: { argb: "D1D5DB" } },
          right: { style: "thin", color: { argb: "D1D5DB" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      // Border cho header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: { argb: "2e5082" } },
          left: { style: "medium", color: { argb: "2e5082" } },
          bottom: { style: "medium", color: { argb: "2e5082" } },
          right: { style: "medium", color: { argb: "2e5082" } },
        };
      });

      // Set column widths
      worksheet.columns = headers.map((header) => ({ width: 20 }));

      // Export file
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `KPI_Detail_${selectedRecord.lncel_name || "Unknown"}_${timestamp}.xlsx`;

      saveAs(new Blob([buffer]), filename);

      alert(`✅ Exported detail for ${selectedRecord.lncel_name || "record"} successfully!`);
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

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("KPI Monitor Data");
      worksheet.columns = [
        { header: "STT", key: "stt", width: 10 },
        { header: "Province", key: "province", width: 15 },
        { header: "Period Start Time", key: "period_start_time", width: 20 },
        { header: "MRBTS Name", key: "mrbts_name", width: 20 },
        { header: "LNBTS Name", key: "lnbts_name", width: 20 },
        { header: "Cell Name", key: "lncel_name", width: 25 },
        { header: "Site DN", key: "dn_mrbts_site", width: 30 },
        { header: "PDCP DL", key: "pdcp_volume_dl", width: 15 },
        { header: "PDCP UL", key: "pdcp_volume_ul", width: 15 },
        { header: "Cell Avail (%)", key: "cell_avail", width: 15 },
        { header: "Max UEs", key: "max_ues", width: 15 },
        { header: "Max PDCP DL", key: "max_pdcp_dl", width: 15 },
        { header: "Max PDCP UL", key: "max_pdcp_ul", width: 15 },
        { header: "Execution Status", key: "execution_status", width: 15 },
        { header: "District", key: "district", width: 15 },
        { header: "Region", key: "region", width: 15 },
        { header: "Vendor", key: "vendor", width: 15 },
        { header: "Data Date", key: "data_date", width: 15 },
      ];
      filteredRecords.forEach((record, index) => {
        const row = worksheet.addRow({
          stt: index + 1,
          province: record.province,
          period_start_time: record.period_start_time,
          mrbts_name: record.mrbts_name,
          lnbts_name: record.lnbts_name,
          lncel_name: record.lncel_name,
          dn_mrbts_site: record.dn_mrbts_site,
          pdcp_volume_dl: record.pdcp_volume_dl,
          pdcp_volume_ul: record.pdcp_volume_ul,
          cell_avail: record.cell_avail,
          max_ues: record.max_ues,
          max_pdcp_dl: record.max_pdcp_dl,
          max_pdcp_ul: record.max_pdcp_ul,
          execution_status: record.execution_status || "Unknown",
          district: record.district,
          region: record.region,
          vendor: record.vendor,
          data_date: record.data_date,
        });
        row.height = 20;
        const isEvenRow = (index + 1) % 2 === 0;
        const rowFillColor = isEvenRow ? "F8F9FA" : "FFFFFF";
        row.eachCell((cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: rowFillColor },
          };
          cell.border = {
            top: { style: "thin", color: { argb: "D1D5DB" } },
            left: { style: "thin", color: { argb: "D1D5DB" } },
            bottom: { style: "thin", color: { argb: "D1D5DB" } },
            right: { style: "thin", color: { argb: "D1D5DB" } },
          };
          if (colNumber === 10) {
            const cellAvail = record.cell_avail || 0;
            if (cellAvail >= 95) {
              cell.font = { color: { argb: "10B981" }, bold: true };
            } else if (cellAvail >= 90) {
              cell.font = { color: { argb: "F59E0B" }, bold: true };
            } else {
              cell.font = { color: { argb: "EF4444" }, bold: true };
            }
          }
          if (colNumber === 14) {
            const status = record.execution_status?.toLowerCase();
            switch (status) {
              case "completed":
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D1FAE5" } };
                cell.font = { color: { argb: "10B981" }, bold: true };
                break;
              case "failed":
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEE2E2" } };
                cell.font = { color: { argb: "EF4444" }, bold: true };
                break;
              case "starting_reset":
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF3C7" } };
                cell.font = { color: { argb: "F59E0B" }, bold: true };
                break;
              default:
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F3F4F6" } };
                cell.font = { color: { argb: "6B7280" }, bold: true };
            }
          }
          if ([1, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else {
            cell.alignment = { horizontal: "left", vertical: "middle" };
          }
        });
      });
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "366092" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: { argb: "111827" } },
          left: { style: "medium", color: { argb: "111827" } },
          bottom: { style: "medium", color: { argb: "111827" } },
          right: { style: "medium", color: { argb: "111827" } },
        };
      });
      worksheet.properties.defaultRowHeight = 20;
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `KPI_Monitor_${startDate}_to_${endDate}_${timestamp}.xlsx`;
      saveAs(new Blob([buffer]), filename);
      alert(`✅ Exported ${filteredRecords.length} records to Excel successfully!`);
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

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
    setExecutionStatus("idle");
    setLoading(false);
  };

  const getCellAvailColor = (availability: number) => {
    if (availability >= 95) return "#10b981";
    if (availability >= 90) return "#f59e0b";
    return "#ef4444";
  };

  const getExecutionStatusDisplay = () => {
    switch (executionStatus) {
      case "loading":
        return (
          <span className="d-flex align-items-center text-primary">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading...
          </span>
        );
      case "success":
        return (
          <span className="d-flex align-items-center text-success">
            <span className="me-2">✅</span>
            Success
          </span>
        );
      case "failed":
        return (
          <span className="d-flex align-items-center text-danger">
            <span className="me-2">❌</span>
            Failed
          </span>
        );
      default:
        return (
          <span className="text-muted">
            <span className="me-2">⏸️</span>
            Ready
          </span>
        );
    }
  };

  return (
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
              <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleDisplayClick} disabled={loading} style={{ borderRadius: "8px", padding: "6px 12px", fontWeight: "600", fontSize: "14px" }}>
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
              <table className="table table-hover mb-0">
                <thead
                  style={{
                    // background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    background: "#10b981",
                    // borderBottom: "3px solid #047857",
                    borderBottom: "1px solid #047857", // ← Giảm từ 3px xuống 1px
                    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.2)",
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
                      }}
                    >
                      STT
                    </th>
                    {[
                      { field: "province", label: "Province", width: "100px" },
                      { field: "period_start_time", label: "Period Start Time", width: "120px" },
                      { field: "mrbts_name", label: "MRBTS Name", width: "140px" },
                      { field: "lnbts_name", label: "LNBTS Name", width: "140px" },
                      { field: "lncel_name", label: "Cell Name", width: "140px" },
                      { field: "dn_mrbts_site", label: "Site DN", width: "120px" },
                      { field: "pdcp_volume_dl", label: "PDCP DL", width: "120px" },
                      { field: "pdcp_volume_ul", label: "PDCP UL", width: "120px" },
                      { field: "cell_avail", label: "Cell Avail (%)", width: "120px" },
                      { field: "max_ues", label: "Max UEs", width: "100px" },
                      { field: "max_pdcp_dl", label: "Max PDCP DL", width: "130px" },
                      { field: "max_pdcp_ul", label: "Max PDCP UL", width: "130px" },
                      { field: "execution_status", label: "Execution Status", width: "130px" },
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
                        minWidth: "60px",
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
                  {currentRecords.map((record, index) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.province}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.period_start_time}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.mrbts_name}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.lnbts_name}
                      </td>
                      <TruncatedCell value={record.lncel_name} maxWidth="180px" />
                      <TruncatedCell value={record.dn_mrbts_site} maxWidth="200px" />
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.pdcp_volume_dl || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.pdcp_volume_ul || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <span className="fw-semibold" style={{ color: getCellAvailColor(record.cell_avail || 0), fontSize: "0.875rem" }}>
                          {record.cell_avail !== null && record.cell_avail !== undefined ? record.cell_avail.toFixed(2) + "%" : "0%"}
                        </span>
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.max_ues || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.max_pdcp_dl || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.max_pdcp_ul || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getExecutionStatusColor(record.execution_status),
                            color: "white",
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {getExecutionStatusText(record.execution_status)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleDetail(record)} style={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
      {showDetailModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header">
                <h5 className="modal-title">📊 Record Detail - LNCEL Name: {selectedRecord?.lncel_name || "Loading..."}</h5>
                {selectedRecord && console.log("All keys Record Detail:", Object.keys(selectedRecord))}
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: "0" }}>
                {selectedRecord ? (
                  <div style={{ overflowX: "auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                      <thead>
                        <tr style={{ background: "#10b981", color: "white" }}>
                          {Object.keys(selectedRecord).map((key, index) => (
                            <th
                              key={index}
                              style={{
                                padding: "10px 8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                minWidth: "150px",
                                whiteSpace: "nowrap",
                                border: "1px solid #2e5082",
                                textAlign: "center",
                              }}
                            >
                              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </th>
                          ))}
                          {/*}
                          <th
                            style={{
                              padding: "10px 8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              minWidth: "150px",
                              border: "1px solid #2e5082",
                              textAlign: "center",
                            }}
                          >
                            Reset Permission
                          </th>
                          <th
                            style={{
                              padding: "10px 8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              minWidth: "120px",
                              border: "1px solid #2e5082",
                              textAlign: "center",
                            }}
                          >
                            Blacklist
                          </th>
                          */}
                          <th
                            style={{
                              padding: "10px 8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              minWidth: "120px",
                              border: "1px solid #2e5082",
                              textAlign: "center",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: "#fafbfc" }}>
                          {Object.entries(selectedRecord).map(([key, value], index) => {
                            let maxWidth = "200px";
                            if (key.includes("log") || key.includes("note") || key.includes("dn_")) maxWidth = "300px";
                            if (key === "id" || key.includes("count")) maxWidth = "80px";
                            let badgeColor = "#f8f9fa";
                            let textColor = "#333";

                            // console.log("All keys:", Object.keys(selectedRecord));
                            // 'commandSentAt', 'commandResponseReceivedAt'

                            if (key === "execution_status") {
                              if (value === "completed") {
                                badgeColor = "#d4edda";
                                textColor = "#155724";
                              } else if (value === "failed") {
                                badgeColor = "#f8d7da";
                                textColor = "#721c24";
                              } else {
                                badgeColor = "#fff3cd";
                                textColor = "#856404";
                              }
                            }
                            if (key === "ssh_connection_status") {
                              badgeColor = value === "connected" ? "#d4edda" : "#f8d7da";
                              textColor = value === "connected" ? "#155724" : "#721c24";
                            }
                            if (key.includes("province")) {
                              badgeColor = "#cce5ff";
                              textColor = "#0056b3";
                            }
                            if (key.includes("district")) {
                              badgeColor = "#ffe6cc";
                              textColor = "#cc5500";
                            }

                            // Nhóm KPI - màu xanh lá
                            if (key.includes("pdcp_volume_dl")) {
                              badgeColor = "#e8f5e9";
                              textColor = "#2e7d32";
                            } else if (key.includes("pdcp_volume_ul")) {
                              badgeColor = "#cce5ff";
                              textColor = "#0056b3";
                            } else if (key.includes("cell_avail")) {
                              badgeColor = "#c8e6c9";
                              textColor = "#388e3c";
                            } else if (key.includes("max_ues")) {
                              badgeColor = "#f3e5f5";
                              textColor = "#7b1fa2";
                            } else if (key.includes("max_pdcp_dl")) {
                              badgeColor = "#ffcc02";
                              textColor = "#ff6f00";
                            } else if (key.includes("max_pdcp_ul")) {
                              badgeColor = "#f1f8e9";
                              textColor = "#558b2f";
                            }

                            // Nhóm Time/Info - màu vàng cam
                            else if (key.includes("period_start_time")) {
                              badgeColor = "#fff8e1";
                              textColor = "#f57f17";
                            } else if (key.includes("data_date")) {
                              badgeColor = "#fff3e0";
                              textColor = "#ef6c00";
                            } else if (key.includes("archived_by")) {
                              badgeColor = "#e8f5e9";
                              textColor = "#2e7d32";
                            } else if (key.includes("action_blacklist")) {
                              badgeColor = "#ffe0b2";
                              textColor = "#f57c00";
                            } else if (key.includes("user_notes")) {
                              badgeColor = "#cce5ff";
                              textColor = "#0056b3";
                            } else if (key.includes("reset_permission")) {
                              badgeColor = "#ffcc02";
                              textColor = "#ff6f00";
                            }

                            // Nhóm Execution/SSH - màu xanh dương tím
                            else if (key.includes("last_reset_by")) {
                              badgeColor = "#e3f2fd";
                              textColor = "#1976d2";
                            } else if (key.includes("ssh_host")) {
                              badgeColor = "#f3e5f5";
                              textColor = "#7b1fa2";
                            } else if (key.includes("ping_test_before")) {
                              badgeColor = "#ede7f6";
                              textColor = "#673ab7";
                            }

                            return (
                              <td
                                key={index}
                                style={{
                                  padding: "12px 8px",
                                  fontSize: "14px",
                                  border: "1px solid #e9ecef",
                                  maxWidth,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "help",
                                  position: "relative",
                                }}
                                title={value ? String(value) : "N/A"}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    backgroundColor: badgeColor,
                                    color: textColor,
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {value !== null && value !== undefined ? (typeof value === "number" && value > 1000 ? value.toLocaleString() : String(value)) : "N/A"}
                                </span>
                              </td>
                            );
                          })}
                          {/*}
                          <td style={{ padding: "12px 8px", fontSize: "14px", border: "1px solid #e9ecef", textAlign: "center" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                backgroundColor: selectedRecord.reset_permission ? "#d4edda" : "#f8d7da",
                                color: selectedRecord.reset_permission ? "#155724" : "#721c24",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              {selectedRecord.reset_permission ? "Denied" : "Allowed"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: "14px", border: "1px solid #e9ecef", textAlign: "center" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                backgroundColor: selectedRecord.action_blacklist ? "#f8d7da" : "#d4edda",
                                color: selectedRecord.action_blacklist ? "#721c24" : "#155724",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              {selectedRecord.action_blacklist ? "Yes" : "No"}
                            </span>
                          </td>

                          */}
                          <td style={{ padding: "12px 8px", fontSize: "14px", border: "1px solid #e9ecef", textAlign: "center" }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "14px",
                                fontWeight: "600",
                              }}
                              onClick={() => {
                                if (confirm(`Reset cell ${selectedRecord.lncel_name}?`)) {
                                  alert("Manual reset initiated");
                                }
                              }}
                            >
                              Reset Manual
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading cell details...</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={handleExportDetailExcel} disabled={!selectedRecord} style={{ borderRadius: "8px", padding: "6px 12px", fontSize: "14px" }}>
                  📊 Export Excel
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)} style={{ borderRadius: "8px", padding: "6px 12px", fontSize: "14px" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiMonitorTab;
