import React, { useState, useEffect, useMemo, useRef } from "react";
// import ReactExport from "react-excel-export";
// declare module "react-excel-export";
// import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
  // execution_status?: "success" | "failed" | "pending"; // Thêm execution status
  execution_status?: string; // ← SỬA: từ "success" | "failed" | "pending" thành string
}

const KpiMonitorTab: React.FC = () => {
  const [records, setRecords] = useState<KpiRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KpiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");

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
            {/* Search Box */}
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

            {/* Select All / Clear All */}
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

            {/* Options List */}
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
                      {/* Custom Checkbox */}
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

            {/* Done Button */}
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

            {/* Selection Count */}
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
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

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<KpiRecord | null>(null);

  // Sort
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Load initial data
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
        const response = await fetch(`https://localhost:7232/api/monitoring/kpi-monitor/${yesterdayString}`);
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

  // Display data with date range
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

      const response = await fetch(`https://localhost:7232/api/monitoring/kpi-monitor-range?startDate=${startDate}&endDate=${endDate}`);
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

  // Get unique values for filters - IMPROVED: Dynamic filtering
  const uniqueProvinces = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.province)))
        .filter(Boolean)
        .sort(),
    [records]
  );

  // Districts based on selected provinces (nếu có tỉnh được chọn thì chỉ hiện huyện của tỉnh đó)
  const uniqueDistricts = useMemo(() => {
    const filteredRecords = selectedProvinces.length > 0 ? records.filter((r) => selectedProvinces.includes(r.province)) : records;

    return Array.from(new Set(filteredRecords.map((r) => r.district)))
      .filter(Boolean)
      .sort();
  }, [records, selectedProvinces]);

  // Provinces based on selected districts (nếu có huyện được chọn thì chỉ hiện tỉnh của huyện đó)
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

  // Filter data
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

    // Sort
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

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Action handlers
  const handleDetail = (record: KpiRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // Export to Excel
  // const handleExportExcel = () => {
  // console.log("Exporting to Excel...");
  // Excel export logic would go here
  // };

  const getExecutionStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#10b981"; // Green
      case "failed":
      case null:
      case undefined:
      case "":
      case "unknown":
        return "#ef4444"; // Red - tất cả null/empty/unknown đều là failed
      case "starting_reset":
        return "#f59e0b"; // Yellow
      default:
        return "#ef4444"; // Red - default cũng là failed
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
        return "Failed"; // ← SỬA: tất cả null/empty/unknown đều hiển thị "Failed"
      case "starting_reset":
        return "Starting Reset";
      default:
        return "Failed"; // ← SỬA: default cũng là "Failed"
    }
  };

  /*

  // Thêm vào phần helper functions
  const getExecutionStatusColor = (status?: string) => {
    switch (status) {
      // case " completed":
      case "completed":
        return "#10b981"; // Green
      case "failed":
        return "#ef4444"; // Red
      case "pending":
        return "#f59e0b"; // Yellow
      default:
        return "#6b7280"; // Gray
    }
  };

  const getExecutionStatusText = (status?: string) => {
    switch (status) {
      case "completed":
        return "Success";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };


*/

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

  // Sử dụng:
  // <TruncatedCell value={record.lncel_name} />
  // <TruncatedCell value={record.dn_mrbts_site} maxWidth="200px" />

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("KPI Monitor Data");

      // Định nghĩa columns
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

      // Thêm data và style
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

        // ✅ Thêm dòng này để đảm bảo chiều cao cho từng dòng data
        row.height = 20;

        // 🎨 Alternate row colors (zebra striping)
        const isEvenRow = (index + 1) % 2 === 0;
        const rowFillColor = isEvenRow ? "F8F9FA" : "FFFFFF"; // Light gray cho even rows

        // Apply background color to all cells in row
        row.eachCell((cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: rowFillColor },
          };

          // 🔲 Add borders to all cells
          cell.border = {
            top: { style: "thin", color: { argb: "D1D5DB" } },
            left: { style: "thin", color: { argb: "D1D5DB" } },
            bottom: { style: "thin", color: { argb: "D1D5DB" } },
            right: { style: "thin", color: { argb: "D1D5DB" } },
          };

          // 📊 Style Cell Availability column based on value
          if (colNumber === 10) {
            // Cell Avail column
            const cellAvail = record.cell_avail || 0;
            if (cellAvail >= 95) {
              cell.font = { color: { argb: "10B981" }, bold: true }; // Green
            } else if (cellAvail >= 90) {
              cell.font = { color: { argb: "F59E0B" }, bold: true }; // Yellow
            } else {
              cell.font = { color: { argb: "EF4444" }, bold: true }; // Red
            }
          }

          // 🏷️ Style Execution Status column
          if (colNumber === 14) {
            // Execution Status column
            const status = record.execution_status?.toLowerCase();
            switch (status) {
              case "completed":
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "D1FAE5" }, // Light green background
                };
                cell.font = { color: { argb: "10B981" }, bold: true };
                break;
              case "failed":
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FEE2E2" }, // Light red background
                };
                cell.font = { color: { argb: "EF4444" }, bold: true };
                break;
              case "starting_reset":
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FEF3C7" }, // Light yellow background
                };
                cell.font = { color: { argb: "F59E0B" }, bold: true };
                break;
              default:
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "F3F4F6" }, // Light gray background
                };
                cell.font = { color: { argb: "6B7280" }, bold: true };
            }
          }

          // 📝 Center align number columns
          if ([1, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else {
            cell.alignment = { horizontal: "left", vertical: "middle" };
          }
        });
      });

      // 🏆 Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        bold: true,
        color: { argb: "FFFFFF" },
        // color: { argb: "366092" },
        size: 12,
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        // fgColor: { argb: "1F2937" }, // Dark gray header
        fgColor: { argb: "366092" }, // Dark gray header
      };
      headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      headerRow.height = 25; // Taller header

      // Add borders to header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: { argb: "111827" } },
          left: { style: "medium", color: { argb: "111827" } },
          bottom: { style: "medium", color: { argb: "111827" } },
          right: { style: "medium", color: { argb: "111827" } },
        };
      });

      // 📐 Set default row height
      worksheet.properties.defaultRowHeight = 20;

      // 🔒 Freeze header row
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `KPI_Monitor_${startDate}_to_${endDate}_${timestamp}.xlsx`;

      // Download file
      saveAs(new Blob([buffer]), filename);

      alert(`✅ Exported ${filteredRecords.length} records to Excel successfully!`);
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  // Clear all filters and data
  const handleClearAll = () => {
    setSearchText("");
    setSelectedProvinces([]);
    setSelectedDistricts([]);
    setSelectedVendors([]);
    setSelectedRegions([]);

    // Reset dates
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];
    setStartDate(yesterdayString);
    setEndDate(yesterdayString);

    // Clear data and reset status
    setRecords([]);
    setFilteredRecords([]);
    setExecutionStatus("idle");

    // Stop loading
    setLoading(false);
  };

  // Get cell availability color
  const getCellAvailColor = (availability: number) => {
    if (availability >= 95) return "#10b981"; // Green
    if (availability >= 90) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  // Get execution status display
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
      {/* Search and Filters */}
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
            {/* Row 1: Labels and Status */}
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
                {/*}
                <div style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
                  <strong>Status: </strong>
                  {getExecutionStatusDisplay()}
                </div>
                */}
              </div>
            </div>

            {/* Row 2: Inputs and Buttons */}
            <div className="d-flex align-items-center gap-3">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  width: "150px",
                }}
              />

              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  width: "150px",
                }}
              />

              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={handleDisplayClick}
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <span>👁️</span>
                Display
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={handleClearAll}
                style={{
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                🗑️ Clear All
              </button>

              <button
                className="btn btn-primary"
                onClick={handleExportExcel}
                style={{
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                📊 Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records count and pagination controls */}
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
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-muted">per page</span>
        </div>
      </div>

      {/* Table */}
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
                <thead style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                  <tr>
                    <th className="fw-semibold text-muted py-3 px-2" style={{ fontSize: "0.875rem", minWidth: "60px", whiteSpace: "nowrap" }}>
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
                        className="fw-semibold text-muted py-3 px-2"
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                          fontSize: "0.875rem",
                          minWidth: width,
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => handleSort(field)}
                      >
                        {label}
                        {sortField === field && <span className="ms-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                      </th>
                    ))}
                    <th className="fw-semibold text-muted py-3 px-2" style={{ fontSize: "0.875rem", minWidth: "100px" }}>
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
                      {/*}
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.lncel_name}
                      </td>
                      */}
                      <TruncatedCell value={record.lncel_name} maxWidth="180px" />
                      {/*}
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.dn_mrbts_site}
                      </td>
                      */}
                      <TruncatedCell value={record.dn_mrbts_site} maxWidth="200px" />
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.pdcp_volume_dl || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {(record.pdcp_volume_ul || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-2">
                        <span
                          className="fw-semibold"
                          style={{
                            color: getCellAvailColor(record.cell_avail || 0),
                            fontSize: "0.875rem",
                          }}
                        >
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

      {/* Pagination */}
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

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header">
                <h5 className="modal-title">📊 Record Detail - ID: {selectedRecord.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Basic Information */}
                  <div className="col-md-6">
                    <div className="card" style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "none" }}>
                      <div className="card-body">
                        <h6 className="fw-bold mb-3 text-primary">📍 Basic Information</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>Original ID:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.original_id}</div>
                          <div className="col-6">
                            <strong>Province:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.province}</div>
                          <div className="col-6">
                            <strong>District:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.district}</div>
                          <div className="col-6">
                            <strong>Region:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.region}</div>
                          <div className="col-6">
                            <strong>Vendor:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.vendor}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Information */}
                  <div className="col-md-6">
                    <div className="card" style={{ backgroundColor: "#f0f9ff", borderRadius: "12px", border: "none" }}>
                      <div className="card-body">
                        <h6 className="fw-bold mb-3 text-info">🏗️ Network Information</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>MRBTS Name:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.mrbts_name}</div>
                          <div className="col-6">
                            <strong>LNBTS Name:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.lnbts_name}</div>
                          <div className="col-6">
                            <strong>Cell Name:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.lncel_name}</div>
                          <div className="col-6">
                            <strong>Site DN:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.dn_mrbts_site}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="col-md-6">
                    <div className="card" style={{ backgroundColor: "#f0fdf4", borderRadius: "12px", border: "none" }}>
                      <div className="card-body">
                        <h6 className="fw-bold mb-3 text-success">📊 Performance Metrics</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>PDCP Volume DL:</strong>
                          </div>
                          <div className="col-6">{(selectedRecord.pdcp_volume_dl || 0).toLocaleString()}</div>
                          <div className="col-6">
                            <strong>PDCP Volume UL:</strong>
                          </div>
                          <div className="col-6">{(selectedRecord.pdcp_volume_ul || 0).toLocaleString()}</div>
                          <div className="col-6">
                            <strong>Cell Availability:</strong>
                          </div>
                          <div className="col-6">
                            <span style={{ color: getCellAvailColor(selectedRecord.cell_avail || 0), fontWeight: "bold" }}>{(selectedRecord.cell_avail || 0).toFixed(2)}%</span>
                          </div>
                          <div className="col-6">
                            <strong>Max UEs:</strong>
                          </div>
                          <div className="col-6">{(selectedRecord.max_ues || 0).toLocaleString()}</div>
                          <div className="col-6">
                            <strong>Max PDCP DL:</strong>
                          </div>
                          <div className="col-6">{(selectedRecord.max_pdcp_dl || 0).toLocaleString()}</div>
                          <div className="col-6">
                            <strong>Max PDCP UL:</strong>
                          </div>
                          <div className="col-6">{(selectedRecord.max_pdcp_ul || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Information */}
                  <div className="col-md-6">
                    <div className="card" style={{ backgroundColor: "#fef3c7", borderRadius: "12px", border: "none" }}>
                      <div className="card-body">
                        <h6 className="fw-bold mb-3 text-warning">📅 Time Information</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>Period Start:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.period_start_time}</div>
                          <div className="col-6">
                            <strong>Data Date:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.data_date}</div>
                          <div className="col-6">
                            <strong>Year:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.data_year}</div>
                          <div className="col-6">
                            <strong>Month:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.data_month}</div>
                          <div className="col-6">
                            <strong>Quarter:</strong>
                          </div>
                          <div className="col-6">Q{selectedRecord.data_quarter}</div>
                          <div className="col-6">
                            <strong>Week:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.data_week}</div>
                          <div className="col-6">
                            <strong>Archived At:</strong>
                          </div>
                          <div className="col-6">{new Date(selectedRecord.archived_at).toLocaleString()}</div>
                          <div className="col-6">
                            <strong>Archived By:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.archived_by}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
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
