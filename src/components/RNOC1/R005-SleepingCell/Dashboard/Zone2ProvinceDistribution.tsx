import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, AreaChart, Area } from "recharts";
import { Card, Row, Col } from "react-bootstrap";

interface Zone2TrendChartProps {
  dashboardData?: any;
  loading?: boolean;
  selectedDate?: string; // ← THÊM DÒNG NÀY
}

const Zone2TrendChart: React.FC<Zone2TrendChartProps> = ({ dashboardData, loading, selectedDate }) => {
  const [selectedChart, setSelectedChart] = useState("combined");
  const [data, setData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ĐÚNG (số liệu thực tế):
  const [headerStats, setHeaderStats] = useState({
    totalProvinces: 0,
    totalDistricts: 0,
    avgSuccessRate: 0,
  });
  const [headerLoading, setHeaderLoading] = useState(true);

  // ✅ Fetch header stats từ distribution API
  useEffect(() => {
    let isMounted = true;

    const fetchHeaderStats = async () => {
      if (!selectedDate || !isMounted) return;

      try {
        setHeaderLoading(true);
        const response = await fetch(`https://localhost:7232/api/dashboard/province-summary/${selectedDate}`);
        const result = await response.json();

        if (result.success && isMounted) {
          setHeaderStats({
            totalProvinces: result.totalProvinces || 0,
            totalDistricts: result.totalDistricts || 0,
            avgSuccessRate: Math.round(result.avgSuccessRate || 0),
          });
        }
      } catch (err) {
        console.error("Error fetching header stats:", err);
        if (isMounted) {
          // Fallback values nếu API lỗi
          setHeaderStats({
            totalProvinces: 0,
            totalDistricts: 0,
            avgSuccessRate: 0,
          });
        }
      } finally {
        if (isMounted) {
          setHeaderLoading(false);
        }
      }
    };

    fetchHeaderStats();
  }, [selectedDate]);

  // ← THÊM CÁC STATE MỚI TẠI ĐÂY:
  const [distributionData, setDistributionData] = useState(null);
  const [distributionLoading, setDistributionLoading] = useState(true);
  const [distributionError, setDistributionError] = useState<string | null>(null);

  // Fetch 14 days trend data
  useEffect(() => {
    let isMounted = true; // ← THÊM FLAG
    const fetchTrendData = async () => {
      try {
        if (!isMounted) return; // ← THÊM CHECK

        setChartLoading(true);
        // ✅ Tính toán endDate từ selectedDate
        const endDate = selectedDate || new Date().toISOString().split("T")[0];

        // ✅ Gọi API với endDate parameter
        const response = await fetch(`https://localhost:7232/api/dashboard/trend?endDate=${endDate}`);

        // const response = await fetch("https://localhost:7232/api/dashboard/trend");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!isMounted) return; // ← THÊM CHECK

        if (result.success && result.data && result.data.length > 0) {
          // Transform API data to match chart format
          const transformedData = result.data.map((item: any) => ({
            date: item.date.split("-")[2] + "/" + item.date.split("-")[1], // "06/08"
            day: getDayName(item.date),
            detected: item.sleepingCells || 0,
            processed: item.processCells_ || 0,
            success: item.executionCells || 0,
            failed: item.recheckCells || 0,
            successRate: item.successRate || 0,
          }));

          setData(transformedData);
          setError(null);
        } else {
          setData([]);
          setError("API returned no data for the selected period");
        }
      } catch (err: any) {
        console.error("Error fetching trend data:", err);
        // setData([]);
        // setError(`API Error: ${err.message}`);
        if (isMounted) {
          // ← THÊM CHECK
          setData([]);
          setError(`API Error: ${err.message}`);
        }
      } finally {
        // setChartLoading(false);
        if (isMounted) {
          // ← THÊM CHECK
          setChartLoading(false);
        }
      }
    };

    fetchTrendData();

    // ← THIẾU CLEANUP NÀY:
    return () => {
      isMounted = false;
    };
  }, [selectedDate]); // ← Thêm selectedDate vào dependency array

  // ← THÊM useEffect MỚI TẠI ĐÂY:
  useEffect(() => {
    let isMounted = true;
    console.log("🎯 selectedDate changed:", selectedDate); // ← THÊM LOG

    // ← THÊM FUNCTION MỚI TẠI ĐÂY:
    const fetchDistributionData = async (date: string) => {
      if (!isMounted) return; // ← CHECK TRƯỚC KHI BẮT ĐẦU
      try {
        console.log("🔄 fetchDistributionData called with date:", date); // ← THÊM LOG
        setDistributionLoading(true);
        // const response = await fetch(`https://localhost:7232/api/dashboard/distribution/${date}`);
        // https://localhost:7232/api/dashboard/province-summary/2025-08-04
        // ← SỬA DÒNG NÀY:
        const response = await fetch(`https://localhost:7232/api/dashboard/province-summary/${date}`);

        console.log("📥 API Response status:", response.status); // ← THÊM LOG

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log("📊 Distribution data received:", result); // ← THÊM LOG

        if (isMounted) {
          // ← CHECK TRƯỚC SET STATE
          setDistributionData(result);
          setDistributionError(null);
        }
      } catch (err: any) {
        console.error("Distribution API Error:", err);
        // setDistributionError(err.message);
        if (isMounted) {
          // ← CHECK TRƯỚC SET STATE
          setDistributionError(err.message);
        }
      } finally {
        if (isMounted) {
          setDistributionLoading(false);
        }
      }
    };

    if (selectedDate) {
      console.log("📞 Calling fetchDistributionData..."); // ← THÊM LOG
      fetchDistributionData(selectedDate);
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

  // Helper to calculate bar height based on data
  const calculateBarHeight = (value: number, maxValue: number, maxHeight: number = 160) => {
    if (maxValue === 0) return 8;
    return Math.max(8, (value / maxValue) * maxHeight);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold text-dark mb-2">{`${data.day} - ${label}`}</p>
          <div className="d-flex flex-column gap-1">
            <div className="d-flex justify-content-between">
              <span className="text-primary">Phát hiện:</span>
              <span className="fw-semibold">{data.detected} cells</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-warning">Xử lý:</span>
              <span className="fw-semibold">{data.processed} cells</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-success">Thành công:</span>
              <span className="fw-semibold">{data.success} cells</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-danger">Thất bại:</span>
              <span className="fw-semibold">{data.failed} cells</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1">
              <span className="text-info">Tỷ lệ thành công:</span>
              <span className="fw-bold">{data.successRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Helper to get province color
  const getProvinceColor = (index: number) => {
    const colors = ["#10b981", "#6366f1", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];
    return colors[index % colors.length];
  };

  const chartOptions = [
    { id: "combined", name: "📊 Total", icon: "📊" },
    { id: "detected", name: "🔍 Detected", icon: "🔍" },
    { id: "processed", name: "⚙️ Process", icon: "⚙️" },
    { id: "success", name: "✅ Success", icon: "✅" },
    { id: "failed", name: "❌ Faults", icon: "❌" },
    { id: "successRate", name: "📈 Success Rate", icon: "📈" },
    { id: "sleepingDistribution", name: "🗺️ Distribution", icon: "🗺️" }, // ← Thêm này doan moi do
    // ← Thêm này doan moi do
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case "detected":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="detectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="detected" stroke="#0d6efd" fill="url(#detectedGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );
        {
          /* ======================================================= */
        }

      case "processed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="processedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fd7e14" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#fd7e14" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="processed" stroke="#fd7e14" fill="url(#processedGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      // =======================================================

      case "success":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="success" stroke="#198754" fill="url(#successGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      // =======================================================

      case "failed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc3545" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="failed" stroke="#dc3545" fill="url(#failedGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      // =======================================================

      case "successRate":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              {/* <YAxis domain={[80, 100]} />  */}
              <YAxis domain={[0, 100]} /> {/* ✅ Bắt đầu từ 0% */}
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="successRate" stroke="#6f42c1" strokeWidth={4} dot={{ fill: "#6f42c1", strokeWidth: 2, r: 6 }} activeDot={{ r: 8, fill: "#6f42c1" }} />
            </LineChart>
          </ResponsiveContainer>
        );
      // =======================================================

      case "sleepingDistribution":
        // Switch to province view and return empty
        // setViewType("provinces");
        return (
          <ResponsiveContainer width="100%" height={400}>
            <div>
              {/* <h6 className="fw-bold mb-3">Sleeping Cells Distribution</h6> */}
              <Row className="justify-content-center">
                <Col lg={10}>
                  <Card className="border-0" style={{ backgroundColor: "#f8fafc", borderRadius: "16px" }}>
                    <Card.Body className="p-4">
                      {/* Chart Title */}

                      <div className="text-center mb-4">
                        <h6 className="fw-bold mb-0" style={{ color: "#1f2937" }}>
                          Sleeping Cells Distribution
                        </h6>
                      </div>

                      {/* Vertical Bars Container - Dynamic Data */}
                      <div className="d-flex align-items-end justify-content-center gap-3" style={{ height: "220px", marginBottom: "20px" }}>
                        {distributionLoading ? (
                          <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading distribution...</p>
                          </div>
                        ) : distributionError ? (
                          <div className="text-center text-danger">
                            <p>Error: {distributionError}</p>
                          </div>
                        ) : distributionData?.data ? (
                          distributionData.data.map((province: any, index: number) => {
                            const maxValue = Math.max(...distributionData.data.map((p: any) => p.totalCells));
                            const barHeight = calculateBarHeight(province.totalCells, maxValue);
                            const color = getProvinceColor(index);
                            const percentage = maxValue > 0 ? Math.round((province.totalCells / distributionData.data.reduce((sum: number, p: any) => sum + p.totalCells, 0)) * 100) : 0;

                            return (
                              <div key={province.province} className="text-center">
                                <div className="position-relative">
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "-25px",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      fontSize: "14px",
                                      fontWeight: "bold",
                                      color: color,
                                    }}
                                  >
                                    {province.totalCells}
                                  </div>

                                  <div
                                    style={{
                                      width: "50px",
                                      height: `${barHeight}px`,
                                      background: `linear-gradient(180deg, ${color}, ${color}dd)`,
                                      borderRadius: "8px 8px 0 0",
                                      marginBottom: "12px",
                                      boxShadow: `0 4px 12px ${color}33`,
                                    }}
                                  ></div>
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: "#374151",
                                    marginBottom: "2px",
                                  }}
                                >
                                  {province.province}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: color,
                                    fontWeight: "600",
                                  }}
                                >
                                  {percentage}%
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-muted">
                            <p>No data available</p>
                          </div>
                        )}
                      </div>

                      {/* Summary instead of Legend */}
                      <div className="text-center pt-3 border-top">
                        <small
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: "500",
                          }}
                        >
                          Total: <span className="fw-bold">64 sleeping cells</span> across 6 provinces
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </ResponsiveContainer>
        );

      default: // combined
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="detectedGradientCombined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="successGradientCombined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="failedGradientCombined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc3545" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar yAxisId="left" dataKey="detected" fill="url(#detectedGradientCombined)" name="🔍 Phát hiện" />
              <Bar yAxisId="left" dataKey="processed" fill="#fd7e14" name="⚙️ Xử lý" />
              <Bar yAxisId="left" dataKey="success" fill="url(#successGradientCombined)" name="✅ Thành công" />
              <Bar yAxisId="left" dataKey="failed" fill="url(#failedGradientCombined)" name="❌ Thất bại" />

              <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#6f42c1" strokeWidth={3} name="📈 Tỷ lệ thành công (%)" dot={{ fill: "#6f42c1", strokeWidth: 2, r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      // =======================================================
    }
  };

  // Loading state
  if (chartLoading) {
    return (
      <div className="mb-4" style={{ marginTop: "-20px" }}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 text-center">
            <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
              <div>
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Đang tải dữ liệu xu hướng...</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }
  // =======================================================

  return (
    <div className="mb-4" style={{ marginTop: "-20px" }}>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          {/* ======================================================= */}
          {/* Header */}
          {/* <div className="d-flex align-items-center justify-content-between mb-4"> */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="p-2 rounded-circle me-3" style={{ backgroundColor: "#e3f2fd" }}>
                <span style={{ fontSize: "1.5rem" }}>🗺️</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0">Province Distribution</h5>
                <small className="text-muted">Sleeping Cell Analysis Across 6 Provinces</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div className="text-center">
                {/* <h3 className="fw-bold text-primary mb-0">6</h3> */}
                <h3 className="fw-bold text-primary mb-0">{headerStats.totalProvinces}</h3>
                <small className="text-muted">Provinces</small>
              </div>
              <div className="text-center">
                {/*<h3 className="fw-bold text-warning mb-0">22</h3> */}
                <h3 className="fw-bold text-warning mb-0">{headerStats.totalDistricts}</h3>
                <small className="text-muted">Districts</small>
              </div>
              <div className="text-center">
                {/*<h3 className="fw-bold text-success mb-0">85%</h3>  */}
                <h3 className="fw-bold text-success mb-0">{headerStats.avgSuccessRate}%</h3>
                <small className="text-muted">Avg Success</small>
              </div>
            </div>
          </div>
          {/* phan header */}
          {/* ======================================================= */}
          {/* canh bao neu ko co du lieu */}
          {/* ========================================================================*/}
          {error && (
            <div className="alert alert-warning alert-dismissible" role="alert">
              <small>
                <strong>⚠️ Warning:</strong> {error}
              </small>
            </div>
          )}
          {/* ket thuc canh bao neu ko co du lieu */}
          {/* ========================================================================*/}
          {/* Chart Selection Buttons */}
          <div className="bg-light rounded p-3 mb-4">
            <h6 className="fw-semibold mb-3">Chọn biểu đồ hiển thị:</h6>
            {/* <div className="d-flex flex-wrap gap-2"> */}
            <div className="d-flex gap-1 gap-md-2 w-100 overflow-x-auto" style={{ minWidth: "100%" }}>
              {chartOptions.map((option) => (
                <button key={option.id} onClick={() => setSelectedChart(option.id)} className={`btn btn-sm d-flex align-items-center justify-content-center gap-2 flex-fill ${selectedChart === option.id ? "btn-primary" : "btn-outline-secondary"}`}>
                  {/*
                  className={`btn btn-xs btn-sm-md btn-md-lg d-flex align-items-center gap-md-2 gap-2 flex-shrink-0 ${selectedChart === option.id ? "btn-primary" : "btn-outline-secondary"}`}
                  style={{
                    fontSize: "clamp(0.7rem, 2vw, 0.9rem)",
                    padding: "clamp(0.2rem, 1vw, 0.5rem) clamp(0.4rem, 2vw, 1rem)",
                  }}
                  /*}
                >
                  {/* className={`btn btn-sm d-flex align-items-center gap-2 flex-shrink-0 ${selectedChart === option.id ? "btn-primary" : "btn-outline-secondary"}`}> */}
                  {/* className={`btn btn-sm d-flex align-items-center gap-2 ${selectedChart === option.id ? "btn-primary" : "btn-outline-secondary"}`}> */}
                  {/* <span>{option.icon}</span> */}
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* ========================================================================*/}
          {/* Chart Display */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">{chartOptions.find((opt) => opt.id === selectedChart)?.name}</h6>
              <small className="text-muted">
                {/* 📅 Cập nhật: {new Date().toLocaleDateString('vi-VN')} */}
                {/* 📅 Cập nhật: {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")} */}
                {/* 📅 Cập nhật: {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")} */}
                {/* 📅 Cập nhật: {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")} */}
                {/* // ❌ SAI (hardcode yesterday): 📅 Cập nhật: {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")} */}
                📅 Cập nhật: {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : "Chưa chọn ngày"}
              </small>
            </div>

            {data.length > 0 ? (
              renderChart()
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Không có dữ liệu để hiển thị</p>
              </div>
            )}
          </div>
          {/* ========================================================================*/}
          {/* ========================================================================*/}
        </Card.Body>
        {/* ========================================================================*/}
      </Card>
      {/* ========================================================================*/}
    </div>
  );
};

export default Zone2TrendChart;
