import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, AreaChart, Area } from "recharts";
import { Card, Row, Col } from "react-bootstrap";

interface Zone3CellsProgressChartProps {
  dashboardData?: any;
  loading?: boolean;
  selectedDate?: string;
}

const Zone3CellsProgressChart: React.FC<Zone3CellsProgressChartProps> = ({ dashboardData, loading, selectedDate }) => {
  // States for provinces data
  const [provincesData, setProvincesData] = useState(null);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesError, setProvincesError] = useState<string | null>(null);

  // Fetch provinces data
  useEffect(() => {
    let isMounted = true;
    console.log("🎯 selectedDate changed:", selectedDate);

    const fetchProvincesData = async (date: string) => {
      if (!isMounted) return;
      try {
        console.log("🔄 fetchProvincesData called with date:", date);
        setProvincesLoading(true);
        const response = await fetch(`https://localhost:7232/api/dashboard/zone4-summary/${date}`);

        console.log("📥 API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log("📊 Provinces data received:", result);

        if (isMounted) {
          setProvincesData(result);
          setProvincesError(null);
        }
      } catch (err: any) {
        console.error("Provinces API Error:", err);
        if (isMounted) {
          setProvincesError(err.message);
        }
      } finally {
        if (isMounted) {
          setProvincesLoading(false);
        }
      }
    };

    if (selectedDate) {
      console.log("📞 Calling fetchProvincesData...");
      fetchProvincesData(selectedDate);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Helper function to convert date to day name
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  const renderProvinceBar = (province: any, index: number) => {
    const total = province.total || 0;
    const resolved = province.resolved || 0;
    const manual = province.manual || 0;
    const resolvedPercent = total > 0 ? (resolved / total) * 100 : 0;
    const manualPercent = total > 0 ? (manual / total) * 100 : 0;

    return (
      <div key={province.province || index} className="mb-3">
        <div
          className="p-3 d-flex align-items-center"
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          {/* Icon Circle */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: "#f59e0b",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "25px",
                height: "18px",
                backgroundColor: "#1f2937",
                border: "2px solid #1f2937",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "2px",
                  right: "2px",
                  bottom: "2px",
                  background: "linear-gradient(45deg, transparent 40%, #ef4444 40%, #ef4444 60%, transparent 60%)",
                }}
              ></div>
            </div>
          </div>

          {/* Province Name */}
          <div className="me-3" style={{ minWidth: "60px" }}>
            <h5 className="fw-bold mb-0" style={{ fontSize: "18px", color: "#1f2937" }}>
              {province.province || "N/A"}
            </h5>
          </div>

          {/* Three bars with labels */}
          <div className="flex-grow-1">
            {/* Total bar */}
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="d-flex align-items-center flex-grow-1">
                <span
                  className="me-2"
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    minWidth: "50px",
                  }}
                >
                  Total
                </span>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "#f59e0b",
                    width: "100%",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
              <span
                className="ms-2 fw-bold"
                style={{
                  fontSize: "12px",
                  color: "#f59e0b",
                  minWidth: "25px",
                }}
              >
                {total}
              </span>
            </div>

            {/* Resolved bar */}
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="d-flex align-items-center flex-grow-1">
                <span
                  className="me-2"
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    minWidth: "50px",
                  }}
                >
                  Resolved
                </span>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "#10b981",
                    width: `${resolvedPercent}%`,
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
              <span
                className="ms-2 fw-bold"
                style={{
                  fontSize: "12px",
                  color: "#10b981",
                  minWidth: "25px",
                }}
              >
                {resolved}
              </span>
            </div>

            {/* Manual bar */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center flex-grow-1">
                <span
                  className="me-2"
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    minWidth: "50px",
                  }}
                >
                  Manual
                </span>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "#ef4444",
                    width: `${manualPercent}%`,
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
              <span
                className="ms-2 fw-bold"
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  minWidth: "25px",
                }}
              >
                {manual}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (provincesLoading) {
    return (
      <div className="mb-4" style={{ marginTop: "-20px" }}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 text-center">
            <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
              <div>
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Đang tải dữ liệu Zone 3 Cells Progress...</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-4" style={{ marginTop: "-20px" }}>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          {/* Header */}
          {/*}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="p-2 rounded-circle me-3" style={{ backgroundColor: "#fff3cd" }}>
                <span style={{ fontSize: "1.5rem" }}>🏢</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0">Zone 3 Analysis</h5>
                <small className="text-muted">Province-wise Cell Management Dashboard</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div className="text-center">
                <h3 className="fw-bold text-primary mb-0">3</h3>
                <small className="text-muted">Provinces</small>
              </div>
              <div className="text-center">
                <h3 className="fw-bold text-warning mb-0">15</h3>
                <small className="text-muted">Districts</small>
              </div>
              <div className="text-center">
                <h3 className="fw-bold text-success mb-0">78%</h3>
                <small className="text-muted">Avg Success</small>
              </div>
            </div>
          </div>

          */}

          {/* Error warning */}
          {provincesError && (
            <div className="alert alert-warning alert-dismissible" role="alert">
              <small>
                <strong>⚠️ Warning:</strong> {provincesError}
              </small>
            </div>
          )}

          {/* Provinces Progress Display */}
          <div>
            {/*
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">Provinces Progress</h6>
              <small className="text-muted">📅 Cập nhật: {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}</small>
            </div>
            */}

            <Row className="justify-content-center">
              <Col lg={10}>
                <Card className="border-0" style={{ backgroundColor: "#f8fafc", borderRadius: "16px" }}>
                  <Card.Body className="p-4">
                    <div className="text-center mb-4">
                      <h6 className="fw-bold mb-0" style={{ color: "#1f2937" }}>
                        Zone 3 Provinces Summary
                      </h6>
                    </div>

                    {provincesError ? (
                      <div className="text-center text-danger">
                        <p>Error: {provincesError}</p>
                      </div>
                    ) : provincesData?.data ? (
                      <div>{provincesData.data.map((province: any, index: number) => renderProvinceBar(province, index))}</div>
                    ) : (
                      <div className="text-center text-muted">
                        <p>No provinces data available</p>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="text-center pt-3 border-top">
                      <small
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "500",
                        }}
                      >
                        Zone 3 Summary for {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : "Today"}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// export default Zone3CellsProgressChart;

export default Zone3CellsProgressChart;
