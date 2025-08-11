// import React, { useState, useEffect, useMemo } from "react";
import React, { useState, useEffect, useMemo, useRef } from "react";

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
}

const KpiMonitorTab: React.FC = () => {
  const [records, setRecords] = useState<KpiRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KpiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString("en-CA"));

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

    // ✅ Click outside để đóng dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // ✅ CHỈ đóng khi click BÊN NGOÀI dropdown
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          console.log("🔒 Clicking outside - closing dropdown");
          setIsOpen(false);
        } else {
          console.log("🔓 Clicking inside dropdown - keeping open");
        }
      };

      // ✅ CHỈ listen khi dropdown đang mở
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]); // ✅ THÊM isOpen vào dependency

    // ✅ FIXED: Cải thiện logic handle checkbox
    const handleCheckboxChange = (option: string) => {
      console.log(`🔄 Toggling option: ${option}`);
      console.log(`📋 Current selected:`, selectedValues);

      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((v) => v !== option) // Remove if exists
        : [...selectedValues, option]; // Add if not exists

      console.log(`✅ New selected:`, newSelectedValues);
      onChange(newSelectedValues);
    };

    // ✅ FIXED: Select All function
    const handleSelectAll = () => {
      console.log(`🎯 Select All clicked for ${label}`);
      onChange(filteredOptions); // Select all filtered options
    };

    // ✅ FIXED: Clear All function
    const handleClearAll = () => {
      console.log(`🗑️ Clear All clicked for ${label}`);
      onChange([]);
    };

    const displayText = selectedValues.length === 0 ? placeholder : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} selected`;

    return (
      <div className="position-relative" ref={dropdownRef}>
        {/* ✅ Dropdown Button */}
        <button
          type="button"
          className="form-select d-flex justify-content-between align-items-center"
          style={{
            borderRadius: "8px",
            textAlign: "left", // ✅ ADDED: Left align text
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🔽 Dropdown button clicked for ${label}, isOpen: ${isOpen}`);
            setIsOpen(!isOpen);
          }}
        >
          <span className={selectedValues.length === 0 ? "text-muted" : ""}>{displayText}</span>
          {/* ✅ ADDED: Dropdown arrow */}
          <span style={{ fontSize: "12px", color: "#666" }}>{isOpen ? "▲" : "▼"}</span>
        </button>

        {/* ✅ Dropdown Menu */}
        {isOpen && (
          <div
            className="position-absolute bg-white border rounded shadow-lg"
            style={{
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1050, // ✅ INCREASED: Higher z-index
              maxHeight: "400px",
              overflowY: "auto",
              minWidth: "250px", // ✅ INCREASED: Wider dropdown
            }}
            onClick={(e) => e.stopPropagation()} // ✅ ADDED: Prevent dropdown close
          >
            {/* ✅ Search Box */}
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

            {/* ✅ Select All / Clear All Options */}
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

            {/* ✅ Options List */}
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
                        backgroundColor: isSelected ? "#e3f2fd" : "transparent", // ✅ ADDED: Visual feedback
                        transition: "background-color 0.2s ease", // ✅ ADDED: Smooth transition
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`🖱️ Clicked on option: ${option}`);
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
                      {/* ✅ FIXED: Larger, more clickable checkbox */}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCheckboxChange(option);
                        }}
                      >
                        {/* ✅ ADDED: Custom checkmark */}
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

                      {/* ✅ Option Label */}
                      <label
                        className="form-check-label flex-grow-1"
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: isSelected ? "600" : "400",
                          color: isSelected ? "#0d6efd" : "#212529",
                          userSelect: "none", // ✅ ADDED: Prevent text selection
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCheckboxChange(option);
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

            {/* ✅ THÊM NÚT DONE */}
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

            {/* ✅ ADDED: Footer with selection count */}
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
  /*
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

*/

  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
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
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<KpiRecord | null>(null);
  const [noteText, setNoteText] = useState("");

  // Sort
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Load data
  useEffect(() => {
    // Chỉ auto-load lần đầu khi vào tab (dữ liệu ngày hôm trước)
    const fetchInitialData = async () => {
      setLoading(true);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toLocaleDateString("en-CA");

      console.log("🔍 Yesterday calculated:", yesterdayString); // ← THÊM LOG NÀY
      setStartDate(yesterdayString);
      setEndDate(yesterdayString);

      console.log("🖥️ PC timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
      console.log("🕐 PC time:", new Date().toString());
      console.log("🇻🇳 VN time:", new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }));
      console.log("📅 Today:", new Date().toISOString().split("T")[0]);

      try {
        const response = await fetch(`https://localhost:7232/api/monitoring/kpi-monitor/${yesterdayString}`);
        const result = await response.json();

        if (result.success) {
          setRecords(result.data.records);
          setFilteredRecords(result.data.records);
          setSelectedDate(yesterdayString); // Set date picker về ngày hôm trước
        } else {
          console.error("API Error:", result.error);
          setRecords([]);
          setFilteredRecords([]);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ chạy lần đầu khi component mount
    fetchInitialData();
  }, []); // ← Empty dependency array

  // ✅ Display Click - API mới (date range)
  const handleDisplayClick = async () => {
    setLoading(true);
    try {
      // Validate dates
      if (startDate > endDate) {
        alert("Start Date cannot be greater than End Date");
        setLoading(false);
        return;
      }

      // Validate required dates
      if (!startDate || !endDate) {
        alert("Please select both Start Date and End Date");
        setLoading(false);
        return;
      }

      // GỌI API MỚI cho date range
      const response = await fetch(`https://localhost:7232/api/monitoring/kpi-monitor-range?startDate=${startDate}&endDate=${endDate}`);
      const result = await response.json();

      if (result.success) {
        setRecords(result.data.records);
        setFilteredRecords(result.data.records);

        // Log để debug
        console.log(`📊 Loaded ${result.data.totalRecords} records from ${startDate} to ${endDate}`);
        if (result.data.dateRange) {
          console.log(`📅 Date range: ${result.data.dateRange.totalDays} days`);
        }
      } else {
        console.error("API Error:", result.error);
        setRecords([]);
        setFilteredRecords([]);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setRecords([]);
      setFilteredRecords([]);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  useEffect(() => {
    let filtered = [...records];

    if (searchText) {
      filtered = filtered.filter((record) => Object.values(record).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase())));
    }

    if (selectedProvinces.length > 0) {
      // filtered = filtered.filter((record) => record.province === selectedProvinces);
      filtered = filtered.filter((record) => selectedProvinces.includes(record.province)); // ✅ ĐÚNG
    }

    if (selectedDistricts.length > 0) {
      // filtered = filtered.filter((record) => record.district === selectedDistricts);
      filtered = filtered.filter((record) => selectedDistricts.includes(record.district));
    }

    if (selectedVendors.length > 0) {
      // filtered = filtered.filter((record) => record.vendor === selectedVendor);
      filtered = filtered.filter((record) => selectedVendors.includes(record.vendor));
    }

    if (selectedRegions.length > 0) {
      // filtered = filtered.filter((record) => record.region === selectedRegion);
      filtered = filtered.filter((record) => selectedRegions.includes(record.region));
    }
    /*
    if (startDate) {
      filtered = filtered.filter((record) => record.data_date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((record) => record.data_date <= endDate);
    }
    */

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
  }, [records, searchText, selectedProvinces, selectedDistricts, selectedVendors, startDate, selectedRegions, endDate, sortField, sortDirection]);

  // Get unique values for filters
  const uniqueProvinces = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.province)))
        .filter(Boolean)
        .sort(),
    [records]
  );

  const uniqueDistricts = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.district)))
        .filter(Boolean)
        .sort(),
    [records]
  );

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

  const handleNote = (record: KpiRecord) => {
    setSelectedRecord(record);
    setNoteText("");
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    console.log("Saving note for record:", selectedRecord?.id, "Note:", noteText);
    setShowNoteModal(false);
    setNoteText("");
  };

  const handleReset = (record: KpiRecord) => {
    if (window.confirm(`Are you sure you want to reset record ${record.id}?`)) {
      console.log("Resetting record:", record.id);
    }
  };

  const handleBlacklist = (record: KpiRecord) => {
    if (window.confirm(`Are you sure you want to add record ${record.id} to blacklist?`)) {
      console.log("Adding to blacklist:", record.id);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    console.log("Exporting to Excel...");
    // Excel export logic would go here
  };

  // Get cell availability color
  const getCellAvailColor = (availability: number) => {
    if (availability >= 95) return "#10b981"; // Green
    if (availability >= 90) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="container-fluid p-4">
      {/* ===============================================================*/}
      {/* Header */}
      {/*
      <div className="d-flex align-items-center justify-content-between mb-4">
       
        <div className="d-flex align-items-center">
          <div className="p-2 rounded-circle me-3" style={{ backgroundColor: "#d1fae5" }}>
            <span style={{ fontSize: "1.5rem" }}>📊</span>
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#1f2937" }}>
              KPI Monitor Dashboard
            </h4>
            <small className="text-muted">Archive Data Analysis</small>
          </div>
        </div>

        */}

      {/* Last Updated - Right side */}
      {/*}
        <div className="d-flex align-items-center">
          <span className="text-muted" style={{ fontSize: "0.9rem" }}>
            📅 Last Updated: {startDate && endDate ? (startDate === endDate ? new Date(startDate).toLocaleDateString("en-US") : `${new Date(startDate).toLocaleDateString("en-US")} - ${new Date(endDate).toLocaleDateString("en-US")}`) : startDate ? new Date(startDate).toLocaleDateString("en-US") : endDate ? new Date(endDate).toLocaleDateString("en-US") : "Not selected"}
          </span>
        </div>
              
      </div>
      */}

      {/*  ket thuc   Header  */}
      {/* ===============================================================*/}

      {/* Search and Filters */}
      <div className="card mb-4" style={{ borderRadius: "12px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="🔍 Search all fields..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ borderRadius: "8px" }} />
            </div>
            <div className="col-md-2">
              {/*}
              <select className="form-select" value={selectedProvinces} onChange={(e) => setSelectedProvinces(e.target.value)} style={{ borderRadius: "8px" }}>
                <option value="">All Provinces</option>
                {uniqueProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              */}
              {/*}
              <select className="form-select" value={selectedProvinces} onChange={(e) => setSelectedProvinces(e.target.value)} style={{ borderRadius: "8px" }}>
                <option value="">All Provinces</option>
                {uniqueProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              */}
              <MultiSelectDropdown label="Province" options={uniqueProvinces} selectedValues={selectedProvinces} onChange={setSelectedProvinces} placeholder="All Provinces" />
            </div>
            {/*}
            <div className="col-md-2">
              <MultiSelectDropdown label="District" options={uniqueDistricts} selectedValues={selectedDistricts} onChange={setSelectedDistricts} placeholder="All Districts" />
            </div>

            */}
            <div className="col-md-2">
              <MultiSelectDropdown label="District" options={uniqueDistricts} selectedValues={selectedDistricts} onChange={setSelectedDistricts} placeholder="All Districts" />
            </div>

            {/* ← Phải là setSelectedProvinces, không phải selectedProvinces */}
            {/*}

            <div className="col-md-2">
              <select className="form-select" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={{ borderRadius: "8px" }}>
                <option value="">All Regions</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} style={{ borderRadius: "8px" }}>
                <option value="">All Vendors</option>
                {uniqueVendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            */}
            <div className="col-md-2">
              <MultiSelectDropdown label="Region" options={uniqueRegions} selectedValues={selectedRegions} onChange={setSelectedRegions} placeholder="All Regions" />
            </div>
            <div className="col-md-2">
              <MultiSelectDropdown label="Vendor" options={uniqueVendors} selectedValues={selectedVendors} onChange={setSelectedVendors} placeholder="All Vendors" />
            </div>
          </div>

          {/*}

          <div className="row g-3 mt-2">
            <div className="col-md-2">
              <label className="form-label small text-muted">Start Date</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ borderRadius: "8px" }} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">End Date</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ borderRadius: "8px" }} />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchText("");
                  setSelectedProvince("");
                  setSelectedDistrict("");
                  setSelectedRegion("");
                  setSelectedVendor("");
                  setStartDate("");
                  setEndDate("");
                }}
                style={{ borderRadius: "8px" }}
              >
                🗑️ Clear
              </button>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-primary w-100" onClick={() => window.location.reload()} style={{ borderRadius: "8px" }}>
                🔄 Refresh
              </button>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-success w-100" onClick={handleExportExcel} style={{ borderRadius: "8px" }}>
                📊 Export Excel (All 26 Columns)
              </button>
            </div>
          </div>

*/}

          <div className="mt-2">
            {/* Row 1: Labels */}
            <div className="d-flex align-items-center gap-4 mb-2">
              <span className="text-muted" style={{ fontSize: "14px", fontWeight: "500", width: "150px" }}>
                Start Date:
              </span>
              <span className="text-muted" style={{ fontSize: "14px", fontWeight: "500", width: "150px" }}>
                End Date:
              </span>
              <span style={{ width: "170px" }}> {/* Placeholder space for alignment */}</span>
              <span className="text-muted" style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
                📅 Last Updated: {startDate && endDate ? (startDate === endDate ? new Date(startDate).toLocaleDateString("en-US") : `${new Date(startDate).toLocaleDateString("en-US")} - ${new Date(endDate).toLocaleDateString("en-US")}`) : startDate ? new Date(startDate).toLocaleDateString("en-US") : endDate ? new Date(endDate).toLocaleDateString("en-US") : "Not selected"}
              </span>
            </div>

            {/* Row 2: Inputs and Buttons */}
            <div className="d-flex align-items-center gap-3">
              {/* Start Date Input */}
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

              {/* End Date Input */}
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

              {/* Display Button */}
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={handleDisplayClick}
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

              {/* Clear Button */}
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchText("");
                  setSelectedProvinces([]);
                  setSelectedDistricts([]);
                  // setSelectedRegion("");
                  // setSelectedVendor("");
                  setSelectedVendors([]); // ✅ ĐÚNG
                  setSelectedRegions([]); // ✅ ĐÚNG
                  // setStartDate("");
                  // setEndDate("");

                  // Reset về yesterday
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const yesterdayString = yesterday.toISOString().split("T")[0];
                  setStartDate(yesterdayString);
                  setEndDate(yesterdayString);

                  // ✅ THÊM: Clear bảng data
                  // setRecords([]);
                  // setFilteredRecords([]);

                  // Gọi API để load yesterday data
                  // fetch(`https://localhost:7232/api/monitoring/kpi-monitor/${yesterdayString}`);
                }}
                style={{
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                🗑️ Clear
              </button>

              {/* Export Excel Button */}
              <button
                className="btn btn-primary"
                onClick={handleExportExcel}
                style={{
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                📊 Export Excel (All 26 Columns)
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
                    <th
                      className="fw-semibold text-muted py-3 px-2"
                      style={{
                        fontSize: "0.875rem",
                        minWidth: "60px",
                        whiteSpace: "nowrap",
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
                    <th className="fw-semibold text-muted py-3 px-2" style={{ fontSize: "0.875rem", minWidth: "200px" }}>
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
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.lncel_name}
                      </td>
                      <td className="py-3 px-2" style={{ fontSize: "0.875rem" }}>
                        {record.dn_mrbts_site}
                      </td>

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
                          {(record.cell_avail || 0).toFixed(2)}%
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

                      <td className="py-3 px-2">
                        <div className="d-flex gap-1">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => handleDetail(record)} style={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                            Detail
                          </button>
                          <button className="btn btn-outline-info btn-sm" onClick={() => handleNote(record)} style={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                            Note
                          </button>
                          <button className="btn btn-outline-warning btn-sm" onClick={() => handleReset(record)} style={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                            Reset
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleBlacklist(record)} style={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                            Blacklist
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* ===============================================================*/}
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
                let pageNum: number; // ← Fixed: Added type annotation
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
      {/* ===============================================================*/}
      {/* ===============================================================*/}

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
                <div className="row">
                  <div className="col-md-6 mt-3">
                    <div className="card" style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "none" }}>
                      <div className="card-body">
                        <h6 className="fw-bold mb-3 text-primary">📅 Time Info</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>Data Date:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.data_date}</div>
                          <div className="col-6">
                            <strong>Quarter:</strong>
                          </div>
                          <div className="col-6">Q{selectedRecord.data_quarter}</div>
                          <div className="col-6">
                            <strong>Week:</strong>
                          </div>
                          <div className="col-6">{selectedRecord.data_week}</div>
                          <div className="col-6">
                            <strong>Archived:</strong>
                          </div>
                          <div className="col-6">{new Date(selectedRecord.archived_at).toLocaleDateString()}</div>
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

      {/* Note Modal */}
      {showNoteModal && selectedRecord && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header">
                <h5 className="modal-title">📝 Add Note - Record ID: {selectedRecord.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowNoteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Cell: {selectedRecord.lncel_name}</label>
                  <small className="text-muted d-block">
                    Province: {selectedRecord.province}, District: {selectedRecord.district}
                  </small>
                </div>
                <div className="mb-3">
                  <label htmlFor="noteTextarea" className="form-label fw-semibold">
                    Note Content:
                  </label>
                  <textarea id="noteTextarea" className="form-control" rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter your note here..." style={{ borderRadius: "8px" }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveNote} disabled={!noteText.trim()}>
                  Save Note
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
