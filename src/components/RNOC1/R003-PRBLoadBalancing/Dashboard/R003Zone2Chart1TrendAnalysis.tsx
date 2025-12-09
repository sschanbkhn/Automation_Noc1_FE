// src/components/R003-PRBLoadBalancing/R003Zone2Chart1TrendAnalysis.tsx

import React, { useState, useEffect } from "react";
// import { Card, Alert, Spinner, Form, Row, Col } from "react-bootstrap";
// Line 2 - Check import có đầy đủ
import { Card, Alert, Spinner, Button, ButtonGroup, Row, Col } from "react-bootstrap";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { BaseChartProps, TrendDataItem, ChartState } from "./R003Zone2Types";
import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig"; // ← THÊM IMPORT

// src/components/R003-PRBLoadBalancing/R003Zone2Chart1TrendAnalysis.tsx

// import React, { useState, useEffect } from 'react';
// import { Card, Alert, Spinner, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, AreaChart, Area } from "recharts";
// import type { BaseChartProps, TrendDataItem } from './R003Zone2Types';
// import API_R003_CONFIG from './ApiR003Config';

interface ChartOption {
  id: string;
  name: string;
  icon: string;
}

// ← SỬA INTERFACE: THÊM selectedChart PROP
interface ChartProps {
  selectedDate: string;
  level: "network" | "province" | "district";
  provinceCode?: string;
  districtCode?: string;
  selectedChart: string; // ← THÊM
  height?: number;
}

// const R003Zone2Chart1TrendAnalysis: React.FC<BaseChartProps> = ({ selectedDate, level, provinceCode, districtCode, height = 400 }) => {
const R003Zone2Chart1TrendAnalysis: React.FC<ChartProps> = ({
  selectedDate,
  level,
  provinceCode,
  districtCode,
  selectedChart, // ← NHẬN TỪ PARENT
  height = 400,
}) => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  // const [selectedChart, setSelectedChart] = useState<string>("combined");
  const [data, setData] = useState<TrendDataItem[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // CHART OPTIONS
  // ==========================================================================

  const chartOptions: ChartOption[] = [
    { id: "combined", name: "📊 Combined", icon: "📊" },
    { id: "performance", name: "⚡ Performance", icon: "⚡" },
    { id: "breakdown", name: "📊 Breakdown", icon: "📊" },
    { id: "congested", name: "🔴 Congested", icon: "🔴" },
    { id: "processing", name: "⚡ Processing", icon: "⚡" },
    { id: "existing", name: "📦 Existing", icon: "📦" },
    { id: "blacklist", name: "🚫 Blacklist", icon: "🚫" },
    { id: "resolved", name: "✅ Resolved", icon: "✅" },
    { id: "new", name: "🆕 New", icon: "🆕" },
    { id: "comparison", name: "🔍 Comparison", icon: "🔍" },
  ];

  // ==========================================================================
  // FETCH DATA
  // ==========================================================================

  useEffect(() => {
    let isMounted = true;

    const fetchTrendData = async () => {
      try {
        if (!isMounted) return;

        setChartLoading(true);
        setError(null);

        // Validate selections
        if (level === "province" && !provinceCode) {
          if (isMounted) {
            setError("Please select a province");
            setChartLoading(false);
          }
          return;
        }

        if (level === "district" && !districtCode) {
          if (isMounted) {
            setError("Please select a district");
            setChartLoading(false);
          }
          return;
        }

        // Build URL
        let url = "";
        if (level === "network") {
          url = `${API_CONFIG.BASE_URL}/dashboard/trend-network?endDate=${selectedDate}`;
        } else if (level === "province") {
          url = `${API_CONFIG.BASE_URL}/dashboard/trend-province?endDate=${selectedDate}&provinceCode=${provinceCode}`;
        } else if (level === "district") {
          url = `${API_CONFIG.BASE_URL}/dashboard/trend-district?endDate=${selectedDate}&districtCode=${districtCode}`;
        }

        console.log("🔍 Fetching trend data:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && isMounted) {
          setData(result.data || []);
        } else {
          if (isMounted) {
            setError("Failed to fetch data");
          }
        }
      } catch (err: any) {
        console.error("❌ Error fetching trend data:", err);
        if (isMounted) {
          setError("Error loading data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setChartLoading(false);
        }
      }
    };

    fetchTrendData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, level, provinceCode, districtCode]);

  // ==========================================================================
  // CUSTOM TOOLTIP
  // ==========================================================================

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-secondary rounded p-3 shadow">
          <p className="fw-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="mb-1 small">
              <strong>{entry.name}:</strong> {entry.value}
              {entry.name.includes("%") ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ==========================================================================
  // RENDER CHARTS
  // ==========================================================================

  const renderChart = () => {
    // ← THU HẸP MARGIN: top, right, left, bottom

    switch (selectedChart) {
      // ====================================================================
      // CHART 1: COMBINED (6 Bars + 1 Line)
      // ====================================================================
      case "combined":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="congestedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc3545" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="processingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="existingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fd7e14" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fd7e14" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="blacklistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c757d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6c757d" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0dcaf0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0dcaf0" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />

              <YAxis yAxisId="left" label={{ value: "Số lượng cells", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "% Thành công", angle: 90, position: "insideRight" }} domain={[0, 100]} />

              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* 6 BARS */}
              <Bar yAxisId="left" dataKey="congestedCells" fill="url(#congestedGradient)" name="🔴 Congested" />
              <Bar yAxisId="left" dataKey="processingCells" fill="url(#processingGradient)" name="⚡ Processing" />
              <Bar yAxisId="left" dataKey="existingCells" fill="url(#existingGradient)" name="📦 Existing" />
              <Bar yAxisId="left" dataKey="blacklistCells" fill="url(#blacklistGradient)" name="🚫 Blacklist" />
              <Bar yAxisId="left" dataKey="resolvedCells" fill="url(#resolvedGradient)" name="✅ Resolved" />
              <Bar yAxisId="left" dataKey="newCells" fill="url(#newGradient)" name="🆕 New" />

              {/* 1 LINE - Success Rate */}
              <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#6f42c1" strokeWidth={3} name="📈 Success Rate (%)" dot={{ fill: "#6f42c1", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 2: PERFORMANCE (2 Bars + 1 Line)
      // ====================================================================
      case "performance":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />

              <YAxis yAxisId="left" label={{ value: "Số lượng", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "% Success", angle: 90, position: "insideRight" }} domain={[0, 100]} />

              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar yAxisId="left" dataKey="newCells" fill="#0dcaf0" name="🆕 New Cells" />
              <Bar yAxisId="left" dataKey="resolvedCells" fill="#198754" name="✅ Resolved Cells" />

              <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#6f42c1" strokeWidth={3} name="📈 Success Rate (%)" dot={{ fill: "#6f42c1", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 3: BREAKDOWN - SỬA: BỎ BLACKLIST, THÊM PROCESSING
      // ====================================================================
      case "breakdown":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: "Cells", angle: -90, position: "insideLeft" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Area type="monotone" dataKey="existingCells" stackId="1" stroke="#fd7e14" fill="#fd7e14" name="📦 Existing" />
              <Area type="monotone" dataKey="newCells" stackId="1" stroke="#0dcaf0" fill="#0dcaf0" name="🆕 New" />
              {/* ← SỬA: BỎ BLACKLIST, THÊM PROCESSING */}
              <Area type="monotone" dataKey="processingCells" stackId="1" stroke="#0d6efd" fill="#0d6efd" name="⚡ Processing" />
            </AreaChart>
          </ResponsiveContainer>
        );
      // ====================================================================

      // ====================================================================
      // CHART 4: CONGESTED (Area)
      // ====================================================================
      case "congested":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="congestedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc3545" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="congestedCells" stroke="#dc3545" fill="url(#congestedAreaGradient)" strokeWidth={3} name="🔴 Congested Cells" />
            </AreaChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 5: PROCESSING (Area)
      // ====================================================================
      case "processing":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="processingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="processingCells" stroke="#0d6efd" fill="url(#processingAreaGradient)" strokeWidth={3} name="⚡ Processing Cells" />
            </AreaChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 6: EXISTING - SỬA: ĐỔI THÀNH LINE CHART
      // ====================================================================
      case "existing":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="existingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fd7e14" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fd7e14" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="existingCells" stroke="#fd7e14" fill="url(#existingAreaGradient)" strokeWidth={3} name="📦 Existing Cells" />
            </AreaChart>
          </ResponsiveContainer>
        );
      // ====================================================================

      // ====================================================================
      // CHART 7: BLACKLIST - SỬA: ĐỔI THÀNH AREA CHART
      // ====================================================================
      case "blacklist":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="blacklistAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c757d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6c757d" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="blacklistCells" stroke="#6c757d" fill="url(#blacklistAreaGradient)" strokeWidth={3} name="🚫 Blacklist Cells" />
            </AreaChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 8: RESOLVED - SỬA: ĐỔI THÀNH AREA CHART
      // ====================================================================
      case "resolved":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="resolvedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="resolvedCells" stroke="#198754" fill="url(#resolvedAreaGradient)" strokeWidth={3} name="✅ Resolved Cells" />
            </AreaChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 9: NEW - SỬA: ĐỔI THÀNH AREA CHART
      // ====================================================================
      case "new":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="newAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0dcaf0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0dcaf0" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="newCells" stroke="#0dcaf0" fill="url(#newAreaGradient)" strokeWidth={3} name="🆕 New Cells" />
            </AreaChart>
          </ResponsiveContainer>
        );

      // ====================================================================
      // CHART 10: COMPARISON (Dynamic)
      // ====================================================================
      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar dataKey="totalCells" fill="#6c757d" name="Total Cells" />
              <Bar dataKey="congestedCells" fill="#dc3545" name="Congested" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Select a chart</div>;
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card className="mb-4 shadow-sm">
      {/* ← BỎ CARD.HEADER */}

      <Card.Body className="p-2">
        {/* ← THU HẸP PADDING */}
        {/* BUTTON GROUP */}
        {/* LOADING */}
        {chartLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading chart data...</p>
          </div>
        )}
        {/* ERROR */}
        {error && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
        {/* CHART */}
        {!chartLoading && !error && data && data.length > 0 && (
          <div>
            {renderChart()}
            {/*}
            <div className="mt-3 text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Showing {data.length} days of data
            </div>
            */}
          </div>
        )}
        {/* NO DATA */}
        {!chartLoading && !error && data && data.length === 0 && (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            No data available for the selected period.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default R003Zone2Chart1TrendAnalysis;

/*


1. Toggle Controls:
typescriptconst [visibleLines, setVisibleLines] = useState({
  congested: true,    // Mặc định hiển thị
  processing: true,
  existing: true,
  blacklist: true,
  resolved: true,
  newCells: true
});

User có thể uncheck để ẩn line
State lưu trạng thái mỗi line

2. Conditional Rendering Lines:
typescript{visibleLines.congested && (
  <Line dataKey="congestedCells" ... />
)}

Chỉ render line nếu toggle = true

3. 6 Colors:

🔴 Congested: #dc3545 (red)
⚡ Processing: #0d6efd (blue)
📦 Existing: #fd7e14 (orange)
🚫 Blacklist: #6c757d (gray)
✅ Resolved: #198754 (green)
🆕 New: #0dcaf0 (cyan)

4. API Call Logic:

Network → trend-network
Province → trend-province (cần provinceCode)
District → trend-district (cần districtCode

*/
