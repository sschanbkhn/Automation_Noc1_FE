import React, { useState, useEffect, useMemo, useCallback } from "react";

// Constants
const COLORS = {
  process: "#3B82F6",
  success: "#10B981",
  sleeping: "#EF4444",
  fail: "#F59E0B",
} as const;

const PROVINCE_ICONS: { [key: string]: string } = {
  SLA: "🏢",
  LSN: "🏙️",
  DBN: "🌊",
  LCU: "⚓",
  LCI: "🌾",
  CBG: "📊 ",
  HGG: "🌾",
  HNI: "🏢",
};

// Interfaces
interface DistrictDetail {
  districtName: string;
  totalCells: number;
  successCells: number;
  failCells: number;
}

interface ProvinceData {
  province: string;
  districts: number;
  totalCells: number;
  sleepingCells: number;
  processCells: number;
  successCells: number;
  failCells: number;
  successRate: number;
  districtDetails: DistrictDetail[];
}

interface Zone3CellsProgressChartProps {
  dashboardData?: any;
  loading?: boolean;
  selectedDate?: string;
}

const Zone3CellsProgressChart: React.FC<Zone3CellsProgressChartProps> = ({ dashboardData, loading, selectedDate }) => {
  const [allProvinces, setAllProvinces] = useState<ProvinceData[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [displayProvinces, setDisplayProvinces] = useState<ProvinceData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ProvinceData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch data từ Zone4 API with retry mechanism
  useEffect(() => {
    let isMounted = true;
    console.log("🎯 Zone3 selectedDate changed:", selectedDate);

    const fetchData = async (date: string) => {
      if (!isMounted) return;

      try {
        setLoadingData(true);
        const response = await fetch(`https://localhost:7232/api/dashboard/zone4-summary/${date}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📊 Zone3 data received:", result);

        if (isMounted && result.data) {
          setAllProvinces(result.data);
          setError(null);
          setRetryCount(0);
        }
      } catch (err: any) {
        console.error("Zone3 API Error:", err);
        if (isMounted) {
          setError(err.message);
          // Auto retry logic
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 2000);
          }
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    if (selectedDate) {
      fetchData(selectedDate);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedDate, retryCount]);

  // Update displayed provinces when selection changes
  const filteredProvinces = useMemo(() => {
    return allProvinces.filter((p) => selectedProvinces.includes(p.province));
  }, [selectedProvinces, allProvinces]);

  useEffect(() => {
    setDisplayProvinces(filteredProvinces);
  }, [filteredProvinces]);

  // Get province icon
  const getProvinceIcon = useCallback((province: string) => {
    return PROVINCE_ICONS[province] || "🏛️";
  }, []);

  // Handle province selection
  const handleProvinceSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value && !selectedProvinces.includes(value)) {
        setSelectedProvinces((prev) => [...prev, value]);
      }
      e.target.value = "";
    },
    [selectedProvinces]
  );

  // Remove province
  const removeProvince = useCallback((provinceToRemove: string) => {
    setSelectedProvinces((prev) => prev.filter((p) => p !== provinceToRemove));
  }, []);

  // Clear all provinces
  const clearAllProvinces = useCallback(() => {
    setSelectedProvinces([]);
  }, []);

  // Show modal with province details
  const showProvinceDetail = useCallback((province: ProvinceData) => {
    setModalData(province);
    setShowModal(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalData(null);
  }, []);

  // Terminal style progress bar renderer
  const renderTerminalProgressBar = (value: number, total: number, color: string, label: string) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const maxBarLength = 60; // Maximum bar length in characters
    const filledLength = Math.round((percentage / 100) * maxBarLength);

    // Create the bar using block characters
    const filledBar = "█".repeat(filledLength);
    const emptyBar = " ".repeat(maxBarLength - filledLength);

    return (
      <div className="mb-2" style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.5" }}>
        <div className="d-flex align-items-center">
          {/* Label */}
          <span
            style={{
              width: "80px",
              color: "#6b7280",
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {label}:
          </span>

          {/* Terminal bar */}
          <span style={{ color: "#9ca3af" }}>│</span>
          <span
            style={{
              display: "inline-block",
              width: `${maxBarLength}ch`,
              backgroundColor: "#f9fafb",
            }}
          >
            <span style={{ color }}>{filledBar}</span>
            <span style={{ color: "#e5e7eb" }}>{emptyBar}</span>
          </span>
          <span style={{ color: "#9ca3af" }}>│</span>

          {/* Count */}
          <span
            style={{
              marginLeft: "8px",
              color: "#374151",
              fontWeight: "600",
            }}
          >
            ({value.toLocaleString()})
          </span>
        </div>
      </div>
    );
  };

  // Render province card with terminal style progress bars
  const renderProvinceCard = (province: ProvinceData) => {
    return (
      <div
        key={province.province}
        className="card mb-3"
        style={{
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        }}
      >
        <div className="card-body" style={{ padding: "1.5rem" }}>
          {/* Province Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <span className="me-2" style={{ fontSize: "1.5rem" }}>
                {getProvinceIcon(province.province)}
              </span>
              <h5 className="fw-bold mb-0" style={{ color: "#1f2937" }}>
                {province.province}
              </h5>
              <span className="ms-3 text-muted">
                ({province.districts} districts • {province.totalCells.toLocaleString()} cells)
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-primary btn-sm" onClick={() => showProvinceDetail(province)} style={{ borderRadius: "8px" }} aria-label={`View details for ${province.province}`}>
                View Detail
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => removeProvince(province.province)} style={{ borderRadius: "8px" }} aria-label={`Remove ${province.province} from view`}>
                Remove
              </button>
              <span
                className="badge bg-success"
                style={{
                  fontSize: "0.875rem",
                  padding: "6px 12px",
                  borderRadius: "8px",
                }}
              >
                {province.successRate}% ✨
              </span>
            </div>
          </div>

          {/* Terminal Style Progress Bars */}
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            {renderTerminalProgressBar(province.sleepingCells, province.sleepingCells, COLORS.sleeping, "Sleeping")}
            {renderTerminalProgressBar(province.processCells, province.sleepingCells, COLORS.process, "Process")}
            {renderTerminalProgressBar(province.successCells, province.sleepingCells, COLORS.success, "Success")}

            {renderTerminalProgressBar(province.failCells, province.sleepingCells, COLORS.fail, "Manual")}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loadingData) {
    return (
      <div className="mb-4">
        <div className="card" style={{ border: "none", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div className="card-body text-center" style={{ padding: "1.5rem" }}>
            <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
              <div>
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading Zone 3 data...</p>
                {retryCount > 0 && <small className="text-warning">Retry attempt {retryCount}/3</small>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="card" style={{ border: "none", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="card-body" style={{ padding: "1.5rem" }}>
          {/* Single Row Header with Controls and Date */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <div className="p-2 rounded-circle me-3" style={{ backgroundColor: "#dbeafe" }}>
                <span style={{ fontSize: "1.5rem" }}>📊</span>
              </div>
              <h5 className="fw-bold mb-0" style={{ color: "#1f2937" }}>
                Progress Analysis
              </h5>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                {/*}
                <label htmlFor="province-select" className="fw-semibold text-muted">
                  Select Provinces:
                </label>
                */}
                <select id="province-select" className="form-select" value="" onChange={handleProvinceSelect} style={{ width: "200px", borderRadius: "8px" }} aria-label="Select province to display">
                  <option value="">Choose province...</option>
                  {allProvinces
                    .filter((p) => !selectedProvinces.includes(p.province))
                    .map((province) => (
                      <option key={province.province} value={province.province}>
                        {province.province}
                      </option>
                    ))}
                </select>

                {selectedProvinces.length > 0 && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={clearAllProvinces} style={{ borderRadius: "8px" }} aria-label="Clear all selected provinces">
                    Clear All
                  </button>
                )}
              </div>

              <div className="d-flex align-items-center text-muted">
                <span style={{ fontSize: "1rem" }} aria-hidden="true">
                  📅
                </span>
                <span className="ms-2 fw-semibold">Date: {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>

          {/* Selected Provinces Summary */}
          {selectedProvinces.length > 0 && (
            <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
              <small className="text-muted fw-semibold">Selected Provinces:</small>
              {selectedProvinces.map((province) => (
                <span
                  key={province}
                  className="badge bg-primary d-flex align-items-center gap-1"
                  style={{
                    fontSize: "0.875rem",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => removeProvince(province)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${province} from selection`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      removeProvince(province);
                    }
                  }}
                >
                  {province}
                  <span style={{ marginLeft: "4px" }} aria-hidden="true">
                    ×
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Error warning with retry */}
          {error && (
            <div className="alert alert-warning alert-dismissible mb-4" role="alert" style={{ borderRadius: "12px" }}>
              <small>
                <strong>⚠️ Warning:</strong> {error}
                {retryCount < 3 && <span className="ms-2">Retrying...</span>}
              </small>
            </div>
          )}

          {/* Province Cards */}
          <div>
            {displayProvinces.length > 0 ? (
              <div>
                {/* <h6 className="fw-bold mb-3 text-muted">Province Progress ({displayProvinces.length})</h6> */}
                {displayProvinces.map((province) => renderProvinceCard(province))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="text-muted">
                  <span style={{ fontSize: "4rem", opacity: 0.3 }} aria-hidden="true">
                    📊
                  </span>
                  <p className="mt-3 fw-semibold">No provinces selected</p>
                  <small>Choose provinces from the dropdown above to view their progress</small>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {displayProvinces.length > 0 && (
            <div className="d-flex gap-4 justify-content-center mt-4 pt-3 border-top">
              <small className="d-flex align-items-center">
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: COLORS.process,
                    borderRadius: "2px",
                    marginRight: "6px",
                  }}
                  aria-hidden="true"
                ></span>
                Process
              </small>
              <small className="d-flex align-items-center">
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: COLORS.success,
                    borderRadius: "2px",
                    marginRight: "6px",
                  }}
                  aria-hidden="true"
                ></span>
                Success
              </small>
              <small className="d-flex align-items-center">
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: COLORS.sleeping,
                    borderRadius: "2px",
                    marginRight: "6px",
                  }}
                  aria-hidden="true"
                ></span>
                Sleeping
              </small>
              <small className="d-flex align-items-center">
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: COLORS.fail,
                    borderRadius: "2px",
                    marginRight: "6px",
                  }}
                  aria-hidden="true"
                ></span>
                Manual
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Province Details */}
      {showModal && modalData && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header" style={{ borderRadius: "16px 16px 0 0" }}>
                <h5 className="modal-title" id="modal-title">
                  <span className="me-2" aria-hidden="true">
                    {getProvinceIcon(modalData.province)}
                  </span>
                  {modalData.province} Province Details
                </h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close modal"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card h-100" style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "none" }}>
                      <div className="card-body" style={{ padding: "1.5rem" }}>
                        <h6 className="fw-bold mb-3 text-primary">📊 Cell Statistics</h6>
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Total Cells:</span>
                            <strong>{modalData.totalCells.toLocaleString()}</strong>
                          </div>

                          <div className="d-flex justify-content-between">
                            <span className="text-danger">Sleeping Cells:</span>
                            <strong className="text-danger">{modalData.sleepingCells.toLocaleString()}</strong>
                          </div>

                          <div className="d-flex justify-content-between">
                            <span className="text-info">Process Cells:</span>
                            <strong className="text-info">{modalData.processCells.toLocaleString()}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-success">Success Cells:</span>
                            <strong className="text-success">{modalData.successCells.toLocaleString()}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-warning">Manual Cells:</span>
                            <strong className="text-warning">{modalData.failCells.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card h-100" style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "none" }}>
                      <div className="card-body" style={{ padding: "1.5rem" }}>
                        <h6 className="fw-bold mb-3 text-primary">📈 Performance Metrics</h6>
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Success Rate:</span>
                            <span className="badge bg-success" style={{ borderRadius: "8px" }}>
                              {modalData.successRate}%
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Districts:</span>
                            <strong>{modalData.districts}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Process Rate:</span>
                            <span>{modalData.totalCells > 0 ? Math.round((modalData.processCells / modalData.totalCells) * 100) : 0}%</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Sleeping Rate:</span>
                            <span className="text-danger">{modalData.totalCells > 0 ? Math.round((modalData.sleepingCells / modalData.totalCells) * 100) : 0}%</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Manual Rate:</span>
                            <span className="text-warning">{modalData.totalCells > 0 ? Math.round((modalData.failCells / modalData.totalCells) * 100) : 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ borderRadius: "8px" }}>
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

export default Zone3CellsProgressChart;
