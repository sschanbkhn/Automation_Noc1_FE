// SchedulerModal.tsx - Date Picker Support
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCalendarAlt, faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import { ConfigModule } from "./ConfigTypes";
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface SchedulerModalProps {
  show: boolean;
  selectedConfig: ConfigModule | null;
  onClose: () => void;
  onEdit: (item: any) => void;
  onAdd: () => void;
}

const SchedulerModal: React.FC<SchedulerModalProps> = ({ show, selectedConfig, onClose, onEdit, onAdd }) => {
  const [schedulerData, setSchedulerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // Load scheduler data with date range
  const loadSchedulerData = async () => {
    setLoading(true);
    try {
      const url = `${API_CONFIG.BASE_URL}/configuration/get-scheduler?date=${selectedDate}&startTime=${startTime}&endTime=${endTime}`;
      console.log("Loading scheduler data from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const actualData = Array.isArray(data) ? data : data.data || data.result || [];
      setSchedulerData(actualData);
      console.log("Scheduler data loaded:", actualData);
    } catch (error) {
      console.error("Error loading scheduler data:", error);
      setSchedulerData([]);
      alert(`Failed to load scheduler data: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data when modal opens or filters change
  useEffect(() => {
    if (show) {
      loadSchedulerData();
    }
  }, [show, selectedDate, startTime, endTime]);

  const exportToExcel = async () => {
    if (!schedulerData || schedulerData.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Scheduler Configuration");

    // Headers
    const headers = Object.keys(schedulerData[0]);
    worksheet.addRow(headers);

    // Data rows
    schedulerData.forEach((item: any) => {
      const row = headers.map((header) => item[header] || "");
      worksheet.addRow(row);
    });

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `scheduler_${selectedDate}_export.xlsx`);
  };

  if (!show || !selectedConfig) return null;

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
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Schedule Management</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
              Add Schedule
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
              Export
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

        {/* Date & Time Filters */}
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
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "6px" }} />
              Select Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
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
              Start Time:
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
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
              End Time:
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
          </div>

          <button
            onClick={loadSchedulerData}
            disabled={loading}
            style={{
              background: selectedConfig.iconColor,
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : "Load Schedule"}
          </button>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, padding: "16px 24px", overflow: "auto" }}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "40px",
              }}
            >
              Loading scheduler data...
            </div>
          ) : schedulerData.length > 0 ? (
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
                  {Object.keys(schedulerData[0])
                    .filter((key) => key.toLowerCase() !== "id")
                    .map((key) => (
                      <th
                        key={key}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: selectedConfig.iconColor,
                          border: "1px solid #e5e7eb",
                          maxWidth: "200px",
                        }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
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
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedulerData.map((item: any, index: number) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f9fafb" : "white",
                    }}
                  >
                    {Object.keys(item)
                      .filter((key) => key.toLowerCase() !== "id")
                      .map((key: string) => {
                        const cellValue = String(item[key] || "N/A");
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
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        border: "1px solid #e5e7eb",
                        width: "150px",
                      }}
                    >
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          background: selectedConfig.iconColor,
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 12px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Edit Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "40px",
              }}
            >
              No scheduler data found for {selectedDate} ({startTime} - {endTime})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerModal;
