// ============================================
// R003Zone1Summary.tsx
// R003 PRBs Load Balancing - Zone 1 Summary
// ============================================

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";

import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";

import { exportToExcel } from "../Configuration/ExportExcelFileUtils"; // ← Đường dẫn tùy project bạn

// ← THÊM 3 DÒNG NÀY
import DataTableModal from "../Configuration/DataTableModal";
import { ConfigModule } from "../Configuration/ConfigTypes";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChartLine, faCheckCircle, faSync, faTable, faFileExcel, faPlus, faTimes, faChartBar } from "@fortawesome/free-solid-svg-icons";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// ← THÊM DÒNG NÀY
import KPITrendModal from "./R003KPITrendModal";

//========================================================================
// TYPES & INTERFACES
//========================================================================

interface R003SummaryData {
  date: string;
  summary: {
    totalCells: number;
    prbsCongestedCells: number;
    processingCells: number;
    blacklistCells: number;
    pendingCells: number;
    successCells: number;
    newCells: number;
    yesterday: {
      prbsCongestedCells: number;
      processingCells: number;
      pendingCells: number;
      successCells: number;
    };
  };
  //========================================================================

  comparison: {
    // ← THÊM FIELD NÀY
    totalCells: number;
    prbsCongestedCells: number;
    processingCells: number;
    blacklistCells: number;
    pendingCells: number;
    successCells: number;
    newCells: number;
  };
}

interface R003CellDetail {
  lncel_name: string;
  lnbts_name: string;
  mrbts_name?: string;
  province: string;
  district?: string;
  period_start_time: string;
  prbs_utilization?: number; // % PRBs load
  avg_prb?: number; // Average PRBs
  max_prb?: number; // Max PRBs
  created_at?: string;
}

interface R003Zone1SummaryProps {
  selectedDate: string;
}

type CellType = "total" | "congested" | "processing" | "blacklist" | "pending" | "success" | "new";

//========================================================================
// CONFIG CHO MODAL
//========================================================================

const createModalConfig = (type: string): ConfigModule => {
  // const configs: Record<string, { title: string; description: string; color: string; id: number }> = {

  const configs: Record<
    string,
    {
      title: string;
      description: string;
      color: string;
      id: number;
      icon: any; // ← THÊM icon vào type
    }
  > = {
    total: {
      title: "Tổng Cell Hệ Thống",
      description: "Danh sách tất cả cells trong hệ thống",
      color: "#2196f3",
      id: 101,
      icon: Icons.faGlobe, // ← THÊM
    },
    congested: {
      title: "Cell Nghẽn PRBs",
      description: "Danh sách cells có tải trọng PRBs cao",
      color: "#f44336",
      id: 102,
      icon: Icons.faExclamationTriangle, // ← THÊM
    },
    processing: {
      title: "Cell Đang Xử Lý",
      description: "Danh sách cells đang được xử lý tối ưu",
      color: "#ff9800",
      id: 103,
      icon: Icons.faCogs, // ← THÊM
    },
    blacklist: {
      title: "Cell Blacklist",
      description: "Danh sách cells bị loại trừ khỏi xử lý",
      color: "#9e9e9e",
      id: 104,
      icon: Icons.faBan, // ← THÊM
    },
    pending: {
      title: "Cell Tồn",
      description: "Danh sách cells tồn đọng chưa xử lý",
      color: "#ffc107",
      id: 105,
      icon: Icons.faHourglass, // ← THÊM
    },
    success: {
      title: "Cell Xử Lý Thành Công",
      description: "Danh sách cells đã xử lý thành công",
      color: "#4caf50",
      id: 106,
      icon: Icons.faCheckCircle, // ← THÊM
    },
    new: {
      title: "Cell Phát Sinh Mới",
      description: "Danh sách cells mới phát hiện nghẽn",
      color: "#2196f3",
      id: 107,
      icon: Icons.faStar, // ← THÊM
    },
  };

  const config = configs[type] || configs.total;

  return {
    id: config.id,
    title: config.title,
    description: config.description,
    // icon: faTable,
    icon: config.icon, // ← Icons.faGlobe, Icons.faCogs, etc.
    iconColor: config.color,
    status: "active",
  };
};

//========================================================================
//************************************************************************
//========================================================================
// COMPONENT
//========================================================================

const R003Zone1Summary: React.FC<R003Zone1SummaryProps> = ({ selectedDate }) => {
  //========================================================================
  // STATE
  //========================================================================

  const [summaryData, setSummaryData] = useState<R003SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //========================================================================

  // ← THÊM STATE CHO TREND MODAL
  const [showTrendModal, setShowTrendModal] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<CellType>("total");
  const [modalData, setModalData] = useState<R003CellDetail[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  // States
  //========================================================================

  // Table state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  //========================================================================

  // Hover state for cards
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  //========================================================================

  // phan nay dung de cho hover cho
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeOuterIndex, setActiveOuterIndex] = useState<number | null>(null);
  const [activeInnerIndex, setActiveInnerIndex] = useState<number | null>(null);
  //========================================================================

  //========================================================================
  // API BASE URL
  //========================================================================

  // const API_BASE_URL = "https://your-api-url.com/api/r003/dashboard"; // ← BẠN SỬA URL
  // const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/province-summary/${selectedDate}`);
  //========================================================================
  // API FUNCTIONS
  //========================================================================

  // Fetch Summary Data
  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/summary/${selectedDate}`);
      // await fetch(`${API_CONFIG.BASE_URL}/dashboard/province-summary/${selectedDate}`);
      //========================================================================

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: R003SummaryData = await response.json();
      setSummaryData(data);
    } catch (err) {
      console.error("❌ Error fetching summary:", err);
      setError("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  };
  //========================================================================

  // Fetch Cell Details (for Modal)
  const fetchCellDetails = async (type: CellType) => {
    setModalLoading(true);
    console.log("🔄 Fetching cell details for type:", type);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/cells-detail/${type}/${selectedDate}`);
      const url = `${API_CONFIG.BASE_URL}/dashboard/cells-detail/${type}/${selectedDate}`;
      console.log("📡 API URL:", url); // ← Xem URL này in ra gì?

      console.log("📊 Response status:", response.status);
      //========================================================================

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Data received:", result);
      setModalData(result.data || []);
    } catch (err) {
      console.error("❌ Error fetching cell details:", err);
      setModalData([]);
      alert("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  //========================================================================
  // EFFECTS
  //========================================================================

  // Fetch summary when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchSummaryData();
    }
  }, [selectedDate]);

  //========================================================================
  // HELPER FUNCTIONS
  //========================================================================

  // Calculate normal cells (for Donut)
  /*
  const calculateNormalCells = (): number => {
    if (!summaryData) return 0;

    const { totalCells, prbsCongestedCells, processingCells, pendingCells, successCells, newCells } = summaryData.summary;

    return totalCells - (prbsCongestedCells + processingCells + pendingCells + successCells + newCells);
  };
  */
  //========================================================================

  // Calculate normal cells (for Donut)
  const calculateNormalCells = (): number => {
    if (!summaryData) return 0;

    const { totalCells, prbsCongestedCells, processingCells, blacklistCells, pendingCells, successCells, newCells } = summaryData.summary;

    // Normal = Total - (all problem cells)
    const problemCells = prbsCongestedCells + processingCells + blacklistCells + pendingCells + newCells;
    const normalCells = totalCells - problemCells - successCells;

    return normalCells > 0 ? normalCells : 0;
  };
  //========================================================================

  // Calculate comparison with yesterday
  /*
  const getComparison = (today: number, yesterday: number) => {
    const diff = today - yesterday;
    const diffPercent = yesterday > 0 ? ((diff / yesterday) * 100).toFixed(1) : "0.0";

    return {
      diff,
      diffPercent,
      isIncrease: diff > 0,
      isDecrease: diff < 0,
      arrow: diff > 0 ? "↑" : diff < 0 ? "↓" : "→",
    };
  };
  */
  const getComparison = (today: number, yesterday: number) => {
    const diff = today - yesterday;

    // Tính % thay đổi rõ ràng hơn
    let diffPercent = "0.0";
    if (yesterday === 0 && today > 0) {
      diffPercent = "100.0"; // Tăng từ 0
    } else if (yesterday > 0) {
      diffPercent = Math.abs((diff / yesterday) * 100).toFixed(1);
    }

    return {
      diff: Math.abs(diff), // Luôn hiển thị số dương
      diffPercent,
      isIncrease: diff > 0,
      isDecrease: diff < 0,
      isEqual: diff === 0,
      arrow: diff > 0 ? "↑" : diff < 0 ? "↓" : "→",
      sign: diff > 0 ? "+" : diff < 0 ? "-" : "", // Dấu +/-
    };
  };
  //========================================================================

  // Calculate Gauge metrics
  /*
  const calculateGaugeMetrics = () => {
    if (!summaryData) return null;

    const { totalCells, prbsCongestedCells, processingCells, pendingCells, successCells } = summaryData.summary;

    const totalProcessed = successCells + pendingCells + processingCells;

    return {
      congestionRate: totalCells > 0 ? ((prbsCongestedCells / totalCells) * 100).toFixed(1) : "0.0",
      successRate: totalProcessed > 0 ? ((successCells / totalProcessed) * 100).toFixed(1) : "0.0",
      pendingRate: totalProcessed > 0 ? ((pendingCells / totalProcessed) * 100).toFixed(1) : "0.0",
    };
  };
  */
  //========================================================================

  // Calculate Gauge metrics
  // const calculateGaugeMetrics = () => {

  /*
  const calculateGaugeMetrics = () => {
    // ← THÊM CHECK NÀY
    if (!summaryData || !summaryData.summary || !summaryData.comparison) {
      return null;
    }

    if (!summaryData) return null;

    const { totalCells, prbsCongestedCells, processingCells, pendingCells, successCells, blacklistCells } = summaryData.summary;

    const { totalCells: yesterdayTotal, prbsCongestedCells: yesterdayCongested, processingCells: yesterdayProcessing, pendingCells: yesterdayPending } = summaryData.comparison;

    // Total processed cells
    const totalProcessed = successCells + pendingCells + processingCells + blacklistCells;
    const yesterdayProblems = yesterdayCongested + yesterdayProcessing + yesterdayPending;
    const todayProblems = prbsCongestedCells + processingCells + pendingCells;

    // Gauge 1: System Health Score
    const healthScore = totalCells > 0 ? (100 - ((prbsCongestedCells * 5 + pendingCells * 2 + processingCells * 1) / totalCells) * 100).toFixed(1) : "100.0";

    // Gauge 2: Processing Efficiency
    const efficiency = totalProcessed > 0 ? ((successCells / totalProcessed) * 100).toFixed(1) : "0.0";

    // Gauge 3: Daily Trend (% change)
    const trend = yesterdayProblems > 0 ? (((todayProblems - yesterdayProblems) / yesterdayProblems) * 100).toFixed(1) : "0.0";

    return {
      healthScore,
      efficiency,
      trend,
      trendIsPositive: parseFloat(trend) < 0, // Negative = Good (problems decreased)
    };
  };
  //========================================================================
*/

  const calculateGaugeMetrics = () => {
    if (!summaryData) return null;

    const {
      totalCells,
      prbsCongestedCells,
      processingCells,
      pendingCells,
      successCells,
      blacklistCells, // ← THÊM
    } = summaryData.summary;

    const totalProcessed = successCells + pendingCells + processingCells;

    return {
      // GAUGE 1: Resolution Speed
      resolutionSpeed: successCells + pendingCells > 0 ? ((successCells / (successCells + pendingCells)) * 100).toFixed(1) : "0.0",

      // GAUGE 2: Congestion Rate
      congestionRate: totalCells > 0 ? ((prbsCongestedCells / totalCells) * 100).toFixed(1) : "0.0",

      // GAUGE 3: Success Rate
      successRate: totalProcessed > 0 ? ((successCells / totalProcessed) * 100).toFixed(1) : "0.0",

      // GAUGE 4: Blacklist Impact
      blacklistImpact: prbsCongestedCells > 0 ? ((blacklistCells / prbsCongestedCells) * 100).toFixed(1) : "0.0",
    };
  };
  //========================================================================

  // Helper function để lấy màu gauge
  const getGaugeColor = (value: number, type: string): string => {
    const numValue = parseFloat(value.toString());

    switch (type) {
      case "resolutionSpeed":
        if (numValue >= 90) return "#4caf50"; // Green
        if (numValue >= 75) return "#ffc107"; // Yellow
        return "#f44336"; // Red

      case "congestionRate":
        if (numValue < 2) return "#4caf50";
        if (numValue <= 5) return "#ffc107";
        return "#f44336";

      case "successRate":
        if (numValue >= 80) return "#4caf50";
        if (numValue >= 60) return "#ffc107";
        return "#f44336";

      case "blacklistImpact":
        if (numValue < 10) return "#4caf50";
        if (numValue <= 20) return "#ffc107";
        return "#f44336";

      default:
        return "#2196f3";
    }
  };

  //========================================================================
  // HANDLE FUNCTIONS
  //========================================================================

  const handleViewTrend = (item: any) => {
    console.log("View trend for cell:", item);
    setSelectedCell(item);
    setShowTrendModal(true);
  };
  //========================================================================

  const handleCloseTrendModal = () => {
    setShowTrendModal(false);
    setSelectedCell(null);
  };
  //========================================================================

  //========================================================================
  // Handle card click
  const handleCardClick = (type: CellType) => {
    setModalType(type);
    setShowModal(true);
    setSearchTerm("");
    setCurrentPage(1);
    fetchCellDetails(type);
  };
  //========================================================================

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalData([]);
    setModalType(null);
  };
  //========================================================================

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  //========================================================================

  // Prepare data for Donut Chart
  const prepareDonutData = () => {
    if (!summaryData) return null;

    const normalCells = calculateNormalCells();
    const { totalCells, prbsCongestedCells, processingCells, pendingCells, successCells, newCells, blacklistCells } = summaryData.summary;

    // Outer ring data
    const outerData = [
      { name: "CellNormal", value: normalCells, color: "#a855f7" },
      // { name: "Thành công", value: successCells, color: "#2196f3" },
      // { name: "Cần xử lý", value: prbsCongestedCells + processingCells + pendingCells, color: "#ff9800" },
      { name: "Nghẽn PRBs", value: prbsCongestedCells, color: "#f44336" },
    ];

    // Inner ring data (breakdown of "Cần xử lý")
    const innerData = [
      // { name: "Nghẽn PRBs", value: prbsCongestedCells, color: "#f44336" },
      { name: "Success", value: successCells, color: "#4caf50" },
      { name: "Processing", value: processingCells, color: "#2196f3" },
      { name: "Existing", value: pendingCells, color: "#ffc107" },
      // { name: "Blacklist", value: blacklistCells, color: "#ef9a9a" },
      { name: "Blacklist", value: blacklistCells, color: "#e57373" },
    ];

    return { outerData, innerData, totalCells };
  };
  //========================================================================

  const getStartDate = (): string => {
    // ← THÊM
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 21);
    return date.toISOString().split("T")[0];
  };

  //========================================================================

  // phan donut
  // Function xử lý khi hover vào

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  //========================================================================

  // Function xử lý khi hover ra
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  //========================================================================

  // Handler cho Outer Ring
  const onOuterPieEnter = (_: any, index: number) => {
    setActiveOuterIndex(index);
  };

  const onOuterPieLeave = () => {
    setActiveOuterIndex(null);
  };

  // Handler cho Inner Ring
  const onInnerPieEnter = (_: any, index: number) => {
    console.log("🟢 Inner hover:", index); // ← THÊM dòng này
    setActiveInnerIndex(index);
  };

  const onInnerPieLeave = () => {
    console.log("🔴 Inner leave"); // ← THÊM dòng này
    setActiveInnerIndex(null);
  };

  // Handle export Excel
  const handleExportExcel = async () => {
    if (modalData.length === 0) {
      alert("Không có dữ liệu để export!");
      return;
    }

    try {
      // Tạo fileName động
      const typeNames: Record<string, string> = {
        total: "Total_Cells",
        congested: "Congested_Cells",
        processing: "Processing_Cells",
        blacklist: "Blacklist_Cells",
        pending: "Pending_Cells",
        success: "Success_Cells",
        new: "New_Cells",
      };

      const fileName = `R003_${typeNames[modalType || "data"]}_${selectedDate}`;
      const sheetName = typeNames[modalType || "Data"];
      //========================================================================

      // Gọi hàm export - TỰ ĐỘNG đọc columns từ modalData
      await exportToExcel({
        data: modalData, // ← Data từ API
        sheetName: sheetName, // ← Sheet name động
        fileName: fileName, // ← File name động
        exportType: "multiple", // ← Multiple rows
      });
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi khi export Excel!");
    }
  };
  //========================================================================

  //========================================================================
  // RENDER
  //========================================================================

  if (loading && !summaryData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading summary data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
        <h4>{error}</h4>
        <button className="btn btn-primary mt-3" onClick={fetchSummaryData}>
          Retry
        </button>
      </div>
    );
  }
  //========================================================================

  if (!summaryData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>No data available</p>
      </div>
    );
  }
  //========================================================================

  //========================================================================

  // const gaugeMetrics = summaryData ? calculateGaugeMetrics() : null;
  // const gaugeMetrics = calculateGaugeMetrics();
  //========================================================================

  // Custom shape khi hover - phần này sẽ phóng to
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;

    return (
      <g>
        {/* Sector phóng to khi hover */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 15} // Phóng to thêm 15px
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            cursor: "pointer",
          }}
        />
      </g>
    );
  };
  //========================================================================

  // Render cho Outer Ring
  const renderActiveOuterShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 15}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            cursor: "pointer",
          }}
        />
      </g>
    );
  };

  // Render cho Inner Ring
  const renderActiveInnerShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    console.log("🎨 Inner shape rendering:", props); // ← THÊM debug
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 40}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            cursor: "pointer",
          }}
        />
      </g>
    );
  };

  //
  //========================================================================
  // ket thuc phan khai bao
  //========================================================================

  return (
    <div className="r003-zone1-summary" style={{ padding: "20px" }}>
      {/* //======================================================================== */}
      {/* HÀNG 1: 4 CARDS */}
      {/* //======================================================================== */}

      {/* <Row className="g-3 mb-3"> */}
      <Row className="g-2 mb-2">
        {/* ← g-3 → g-2, mb-3 → mb-2 */}
        {/* //======================================================================== */}
        {/* Card 1: Tổng Cell */}
        {/* <Col xs={12} sm={6} md={3}> */}
        {/* borderRadius: "12px",  {/* ← 16px → 12px */}
        <Col xs={12} sm={6} md={6} lg={3}>
          {/* ← Responsive: mobile 12, tablet 6, desktop 3 */}
          <Card
            style={{
              backgroundColor: "#e3f2fd",
              border: "none",
              borderRadius: "16px",

              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "total" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("total")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("total")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Tổng Cell Hệ Thống
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.totalCells)}
                  </h3>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      Info
                    </span>
                    {/* ← THÊM HINT KHI HOVER */}
                    {hoveredCard === "total" && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "0.7rem",
                          color: "#2196f3",
                          fontWeight: "600",
                        }}
                      >
                        Click to view →
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2196f3, #1976d2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>📊</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* //======================================================================== */}
        {/* Card 2: Cell Nghẽn PRBs */}
        <Col xs={12} sm={6} md={3}>
          <Card
            style={{
              backgroundColor: "#ffebee",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "congested" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("congested")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("congested")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Cell Nghẽn PRBs
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.prbsCongestedCells)}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "4px" }}>
                    {(() => {
                      const comp = getComparison(summaryData.summary.prbsCongestedCells, summaryData.summary.yesterday.prbsCongestedCells);
                      return (
                        <span style={{ color: comp.isDecrease ? "#4caf50" : comp.isIncrease ? "#f44336" : "#666" }}>
                          {comp.arrow} {Math.abs(comp.diff)} ({comp.isDecrease ? "-" : comp.isIncrease ? "+" : ""}
                          {comp.diffPercent}%)
                        </span>
                      );
                    })()}
                  </div>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      Critical
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #f44336, #d32f2f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🔴</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* //======================================================================== */}
        {/* Card 3: Cell Đang Xử Lý */}
        <Col xs={12} sm={6} md={3}>
          <Card
            style={{
              backgroundColor: "#fff3e0",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "processing" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("processing")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("processing")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Cell Đang Xử Lý
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.processingCells)}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "4px" }}>
                    {(() => {
                      const comp = getComparison(summaryData.summary.processingCells, summaryData.summary.yesterday.processingCells);
                      return (
                        <span style={{ color: comp.isIncrease ? "#4caf50" : comp.isDecrease ? "#f44336" : "#666" }}>
                          {comp.arrow} {Math.abs(comp.diff)} ({comp.isIncrease ? "+" : comp.isDecrease ? "-" : ""}
                          {comp.diffPercent}%)
                        </span>
                      );
                    })()}
                  </div>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#ff9800",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      Processing
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #ff9800, #f57c00)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>⚡</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* //======================================================================== */}
        {/* Card 4: Cell Blacklist */}
        <Col xs={12} sm={6} md={3}>
          <Card
            style={{
              backgroundColor: "#f5f5f5",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "blacklist" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("blacklist")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("blacklist")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Cell Blacklist (3 days)
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.blacklistCells)}
                  </h3>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#9e9e9e",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      Blocked
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #9e9e9e, #757575)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🚫</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* //======================================================================== */}
      </Row>
      {/* ket thuc hang 1, gom co 4 card*/}
      {/* //======================================================================== */}
      {/* ======================================================================== */}
      {/* HÀNG 2: 3 CARDS */}
      {/* ======================================================================== */}

      {/* <Row className="g-3 mb-3"> */}
      <Row className="g-2 mb-2">
        {/* Card 5: Cell Tồn */}
        {/* ======================================================================== */}
        <Col xs={12} sm={6} md={6} lg={3}>
          <Card
            style={{
              backgroundColor: "#fffde7",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "pending" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("pending")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("pending")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Cell Tồn
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.pendingCells)}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "4px" }}>
                    {(() => {
                      const comp = getComparison(summaryData.summary.pendingCells, summaryData.summary.yesterday.pendingCells);
                      return (
                        <span style={{ color: comp.isDecrease ? "#4caf50" : comp.isIncrease ? "#f44336" : "#666" }}>
                          {comp.arrow} {Math.abs(comp.diff)} ({comp.isDecrease ? "-" : comp.isIncrease ? "+" : ""}
                          {comp.diffPercent}%)
                        </span>
                      );
                    })()}
                  </div>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#ffc107",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      Warning
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #ffc107, #ffa000)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>📦</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* ======================================================================== */}

        {/* Card 6: Cell Thành Công */}
        {/* ======================================================================== */}
        <Col xs={12} sm={6} md={6} lg={3}>
          <Card
            style={{
              backgroundColor: "#e8f5e9",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "success" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("success")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("success")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Cell Xử Lý Thành Công
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.successCells)}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "4px" }}>
                    {(() => {
                      const comp = getComparison(summaryData.summary.successCells, summaryData.summary.yesterday.successCells);
                      return (
                        <span style={{ color: comp.isIncrease ? "#4caf50" : comp.isDecrease ? "#f44336" : "#666" }}>
                          {comp.arrow} {Math.abs(comp.diff)} ({comp.isIncrease ? "+" : comp.isDecrease ? "-" : ""}
                          {comp.diffPercent}%)
                        </span>
                      );
                    })()}
                  </div>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#4caf50",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      Success
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4caf50, #388e3c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>✅</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* ======================================================================== */}

        {/* Card 7: Cell Mới */}
        {/* ======================================================================== */}
        <Col xs={12} sm={6} md={6} lg={3}>
          <Card
            style={{
              backgroundColor: "#bbdefb",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
              cursor: "pointer",
              transform: hoveredCard === "new" ? "translateY(-4px) scale(1.02)" : "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHoveredCard("new")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("new")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    Cell Phát Sinh Mới
                  </p>
                  <h3 className="fw-bold mb-1" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                    {formatNumber(summaryData.summary.newCells)}
                  </h3>
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      New
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2196f3, #1976d2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🆕</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* ======================================================================== */}

        {/* Card 8: DONUT CHART */}
        {/* ======================================================================== */}
        {/* Card 8: DONUT CHART */}
        {/*
        <Col xs={12} sm={6} md={6} lg={3}>
          <Card
            style={{
              backgroundColor: "#f9fafb",
              border: "2px dashed #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "155px",
            }}
          >
            <Card.Body className="p-3 d-flex align-items-center justify-content-center">
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "2.5rem" }}>🍩</span>
                <p className="mt-2 mb-0" style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>
                  Cell Status
                </p>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Donut Chart</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
*/}

        {/* ======================================================================== */}
      </Row>
      {/* ======================================================================== */}
      {/* ket thuc hang*/}
      {/* ======================================================================== */}

      <Row className="g-3 mb-3">
        {/* 4 Gauges sẽ render ở đây */}

        <Col xs={12} md={6}>
          {/* 4 GAUGES */}
          {summaryData &&
            (() => {
              const gauges = calculateGaugeMetrics();
              if (!gauges) return null;

              return (
                <Row className="g-3">
                  {/* GAUGE 1: Resolution Speed */}
                  <Col xs={12} sm={6}>
                    {/* DIV 1: GAUGES BÊN TRÁI */}
                    <Card
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        height: "180px",
                      }}
                    >
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>📈 Resolution Speed</div>
                        <div
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: getGaugeColor(parseFloat(gauges.resolutionSpeed), "resolutionSpeed"),
                          }}
                        >
                          {gauges.resolutionSpeed}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Tốc độ giải quyết</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 2: Congestion Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        height: "180px",
                      }}
                    >
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>🔴 Congestion Rate</div>
                        <div
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: getGaugeColor(parseFloat(gauges.congestionRate), "congestionRate"),
                          }}
                        >
                          {gauges.congestionRate}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Tỷ lệ nghẽn hệ thống</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        height: "180px",
                      }}
                    >
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>✅ Success Rate</div>
                        <div
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: getGaugeColor(parseFloat(gauges.successRate), "successRate"),
                          }}
                        >
                          {gauges.successRate}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Tỷ lệ thành công</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 4: Blacklist Impact */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        height: "180px",
                      }}
                    >
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>🚫 Blacklist Impact</div>
                        <div
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: getGaugeColor(parseFloat(gauges.blacklistImpact), "blacklistImpact"),
                          }}
                        >
                          {gauges.blacklistImpact}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Ảnh hưởng blacklist</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              );
            })()}
        </Col>

        {/* ======================================================================== */}

        {/* phan donut */}
        {/* ======================================================================== */}
        <Col xs={12} md={6}>
          <Card style={{ overflow: "visible" }}>
            {" "}
            {/* ← THÊM style này */}
            <Card.Body style={{ overflow: "visible" }}>
              {" "}
              {/* ← THÊM style này */}
              <h5 className="mb-3">📊 Phân bố Cell theo trạng thái</h5>
              {summaryData &&
                (() => {
                  const donutData = prepareDonutData();
                  if (!donutData) return null;
                  {
                    /* ======================================================================== */
                  }

                  return (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        {/* Outer Ring */}
                        {/* <Pie data={donutData.outerData} cx="50%" cy="50%" innerRadius={120} outerRadius={160} paddingAngle={2} dataKey="value" label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}> */}
                        <Pie
                          data={donutData.outerData}
                          cx="50%"
                          cy="50%"
                          innerRadius={120}
                          outerRadius={160}
                          paddingAngle={2}
                          dataKey="value"
                          activeIndex={activeIndex} // ← THÊM
                          activeShape={renderActiveShape} // ← THÊM
                          onMouseEnter={onPieEnter} // ← THÊM
                          onMouseLeave={onPieLeave} // ← THÊM
                        >
                          {donutData.outerData.map((entry, index) => (
                            <Cell key={`outer-${index}`} fill={entry.color} />
                          ))}
                        </Pie>

                        {/* Inner Ring */}
                        {/* <Pie data={donutData.innerData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}> */}
                        <Pie
                          data={donutData.innerData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                          activeIndex={activeIndex} // ← ĐỔI
                          activeShape={renderActiveShape} // ← THÊM dòng 2
                          onMouseEnter={onPieEnter} // ← THÊM dòng 3
                          onMouseLeave={onPieLeave} // ← THÊM dòng 4
                        >
                          {donutData.innerData.map((entry, index) => (
                            <Cell key={`inner-${index}`} fill={entry.color} />
                          ))}
                        </Pie>

                        {/* Center Text */}
                        <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "32px", fontWeight: "bold", fill: "#333" }}>
                          {donutData.totalCells.toLocaleString()}
                        </text>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "14px", fill: "#666" }}>
                          Tổng Cells
                          {/* chinh y de can chinh text trong vong tron */}
                        </text>

                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload; // ← Lấy payload.payload

                              // ← Xác định đang hover outer hay inner
                              const isOuter = donutData.outerData.some((d) => d.name === item.name);

                              // Tính total tương ứng
                              const total = isOuter ? donutData.outerData.reduce((sum, d) => sum + d.value, 0) : donutData.innerData.reduce((sum, d) => sum + d.value, 0);

                              // const percent = (item.value / total) * 100;

                              // Tính percent
                              // const total = donutData.innerData.reduce((sum, d) => sum + d.value, 0);
                              const percent = (item.value / total) * 100;

                              return (
                                <div
                                  style={{
                                    backgroundColor: "white",
                                    padding: "12px 16px",
                                    border: `2px solid ${item.color}`,
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontWeight: "bold",
                                      color: item.color,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {item.name}
                                  </p>
                                  <p
                                    style={{
                                      margin: "5px 0 0 0",
                                      fontSize: "13px",
                                      color: "#333",
                                    }}
                                  >
                                    Số lượng: <strong>{item.value.toLocaleString()}</strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: "5px 0 0 0",
                                      fontSize: "13px",
                                      color: "#666",
                                    }}
                                  >
                                    Tỷ lệ: <strong>{percent.toFixed(1)}%</strong>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ============================================ */}
      {/* MODAL HIỂN THỊ CHI TIẾT */}
      {/* ============================================ */}

      {/*}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <span style={{ fontSize: "1.5rem", marginRight: "10px" }}>
                {modalType === "total" && "📊"}
                {modalType === "congested" && "🔴"}
                {modalType === "processing" && "⚡"}
                {modalType === "blacklist" && "🚫"}
                {modalType === "pending" && "📦"}
                {modalType === "success" && "✅"}
                {modalType === "new" && "🆕"}
              </span>
              <div>
                <h5 className="mb-0">
                  {modalType === "total" && "Tổng Cell Hệ Thống"}
                  {modalType === "congested" && "Cell Nghẽn PRBs"}
                  {modalType === "processing" && "Cell Đang Xử Lý"}
                  {modalType === "blacklist" && "Cell Blacklist"}
                  {modalType === "pending" && "Cell Tồn"}
                  {modalType === "success" && "Cell Xử Lý Thành Công"}
                  {modalType === "new" && "Cell Phát Sinh Mới"}
                </h5>
                <small className="text-muted">
                  Ngày: {selectedDate} | Tổng: {modalData.length} cells
                </small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "600px", overflowY: "auto", padding: "20px" }}>
          {modalLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : modalData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <span style={{ fontSize: "3rem" }}>📭</span>
              <p className="mt-3 text-muted">Không có dữ liệu</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered">
                <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ fontSize: "0.85rem" }}>STT</th>
                    <th style={{ fontSize: "0.85rem" }}>Cell Name</th>
                    <th style={{ fontSize: "0.85rem" }}>Site Name</th>
                    <th style={{ fontSize: "0.85rem" }}>MRBTS</th>
                    <th style={{ fontSize: "0.85rem" }}>Province</th>
                    <th style={{ fontSize: "0.85rem" }}>PRBs (%)</th>
                    <th style={{ fontSize: "0.85rem" }}>Avg PRB</th>
                    <th style={{ fontSize: "0.85rem" }}>Max PRB</th>
                    <th style={{ fontSize: "0.85rem" }}>Period</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((cell: any, index: number) => (
                    <tr key={index}>
                      <td style={{ fontSize: "0.8rem" }}>{index + 1}</td>
                      <td style={{ fontSize: "0.8rem", fontWeight: "600" }}>{cell.lncel_name || "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{cell.lnbts_name || "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{cell.mrbts_name || "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{cell.dn_mrbts_site || cell.province || "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            backgroundColor: cell.prbs_utilization >= 80 ? "#ffebee" : cell.prbs_utilization >= 60 ? "#fff3e0" : "#e8f5e9",
                            color: cell.prbs_utilization >= 80 ? "#c62828" : cell.prbs_utilization >= 60 ? "#ef6c00" : "#2e7d32",
                            fontWeight: "600",
                          }}
                        >
                          {cell.prbs_utilization !== null && cell.prbs_utilization !== undefined ? cell.prbs_utilization.toFixed(1) : "-"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{cell.avg_prb !== null && cell.avg_prb !== undefined ? cell.avg_prb.toFixed(1) : "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{cell.max_prb !== null && cell.max_prb !== undefined ? cell.max_prb.toFixed(1) : "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{cell.period_start_time ? new Date(cell.period_start_time).toLocaleString("vi-VN") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #dee2e6" }}>
          <button
            className="btn btn-success"
            onClick={handleExportExcel}
            style={{
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: "600",
            }}
          >
            📥 Export Excel
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleCloseModal}
            style={{
              borderRadius: "8px",
              padding: "8px 20px",
            }}
          >
            Đóng
          </button>
        </Modal.Footer>
      </Modal>

      


      */}

      {/* DataTableModal - MODAL CŨ */}
      <DataTableModal show={showModal} selectedConfig={createModalConfig(modalType || "total")} modalData={modalData} modalLoading={modalLoading} onSearch={() => {}} onClose={handleCloseModal} onView={handleViewTrend} />

      {/* ======================================================================== */}
      {/* ← THÊM ĐOẠN NÀY VÀO ĐÂY */}
      {/* ======================================================================== */}
      {showTrendModal && selectedCell && <KPITrendModal show={showTrendModal} onClose={handleCloseTrendModal} cellData={selectedCell} startDate={getStartDate()} endDate={selectedDate} />}
      {/* ======================================================================== */}
    </div>
    //======================================================================== */}
  );

  //======================================================================== */
};

export default R003Zone1Summary;
