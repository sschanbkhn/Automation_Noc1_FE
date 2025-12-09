// ============================================
// R003Zone1Summary.tsx
// R003 PRBs Load Balancing - Zone 1 Summary
// ============================================

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal } from "react-bootstrap";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
  RadialBarChart, // ← THÊM
  RadialBar, // ← THÊM
  PolarAngleAxis, // ← THÊM
} from "recharts";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";

import { exportToExcel } from "../Configuration/ExportExcelFileUtils"; // ← Đường dẫn tùy project bạn

// ← THÊM 3 DÒNG NÀY
import DataTableModal from "../Configuration/DataTableModal";
import { ConfigModule } from "../Configuration/ConfigTypes";
// @ts-ignore
import GaugeChart from "react-gauge-chart";
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
    <div className="r003-zone1-summary" style={{ padding: "20px 0px" }}>
      {/* //======================================================================== */}
      {/* HÀNG 1: 4 CARDS */}
      {/* //======================================================================== */}

      {/* <Row className="g-3 mb-3"> */}
      <Row className="g-3 mb-2">
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
                    {/* GAUGE 1: Resolution Speed */}

                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      {/* <Card.Body className="text-center"> */}
                      {/* Title với icon */}
                      <Card.Body className="text-center">
                        {" "}
                        {/* ← THÊM p-0 */}
                        {/* Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>🔴</span>
                          <span>Resolution Speed</span>
                        </div>
                        {/* GaugeChart */}
                        <div
                          style={{
                            width: "250px", // ← ĐỔI: 250px → 100%
                            // maxWidth: "220px", // ← THÊM: giới hạn max
                            height: "110px",
                            margin: "0 auto", // ← ĐỔI: căn giữa
                            padding: "0",

                            // margin: "0 auto 0 0", // ← THÊM: margin-right: auto → đẩy sang TRÁI
                            // padding: "0 0px", // ← Padding nhỏ 2 bên

                            display: "flex",
                            justifyContent: "flex-start", // ← Căn TRÁI
                            alignItems: "center",
                            marginLeft: "-50px", // ← THÊM dòng này - đẩy SANG TRÁI
                          }}
                        >
                          <GaugeChart id="gauge-congestion-rate" nrOfLevels={4} colors={["#f59e0b", "#2196f3", "#10b981", "#ef4444"]} arcWidth={0.3} percent={parseFloat(gauges.congestionRate) / 100} textColor="#1f2937" needleColor="#374151" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.02} cornerRadius={3} animate={true} animateDuration={800} />
                        </div>
                        {/* Số % bên dưới vòng tròn */}
                        <div
                          style={{
                            fontSize: "48px", // ← Chữ to
                            fontWeight: "bold",
                            color: getGaugeColor(parseFloat(gauges.resolutionSpeed), "resolutionSpeed"),
                            marginTop: "-10px",
                          }}
                        >
                          {gauges.resolutionSpeed}%
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 2: Congestion Rate */}
                  {/*
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

                  */}

                  {/* GAUGE 2: Congestion Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center">
                        {/* Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>🔴 </span>
                          <span>Congestion Rate</span>
                        </div>

                        {/* GaugeChart */}
                        <div
                          style={{
                            width: "250px",
                            height: "110px",
                            margin: "0 auto 0 0", // ← THÊM: margin-right: auto → đẩy sang TRÁI
                            padding: "0 0px", // ← Padding nhỏ 2 bên

                            display: "flex",
                            justifyContent: "flex-start", // ← Căn TRÁI
                            alignItems: "center",
                            marginLeft: "-50px", // ← THÊM dòng này - đẩy SANG TRÁI
                          }}
                        >
                          <GaugeChart id="gauge-congestion-rate" nrOfLevels={3} colors={["#ef4444", "#f59e0b", "#10b981"]} arcWidth={0.3} percent={parseFloat(gauges.congestionRate) / 100} textColor="#1f2937" needleColor="#374151" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.02} cornerRadius={3} animate={true} animateDuration={800} />
                        </div>

                        {/* Value */}
                        <div
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: "#1f2937",
                            marginTop: "-10px",
                          }}
                        >
                          {gauges.congestionRate}%
                        </div>

                        {/* Subtitle */}
                        {/* <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Tỷ lệ nghẽn hệ thống</div> */}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginBottom: "4px",
                            marginTop: "8px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>✅</span>
                          <span>Success Rate</span>
                        </div>

                        {/* Outer Label (như hình 2) */}
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#16a34a",
                            marginBottom: "4px",
                          }}
                        >
                          {Math.round(parseFloat(gauges.successRate))}/100
                        </div>

                        {/* GaugeChart - 6 màu */}
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "220px",
                            height: "110px",
                            margin: "0 auto",
                            padding: "0",
                          }}
                        >
                          <GaugeChart id="gauge-success-rate" nrOfLevels={6} colors={["#dc2626", "#f97316", "#fbbf24", "#84cc16", "#22c55e", "#16a34a"]} arcWidth={0.3} percent={parseFloat(gauges.successRate) / 100} textColor="#1f2937" needleColor="#16a34a" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.01} cornerRadius={3} animate={true} animateDuration={800} />
                        </div>

                        {/* Value */}
                        <div
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: "#1f2937",
                            marginTop: "-10px",
                          }}
                        >
                          {gauges.successRate}%
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>✅</span>
                          <span>Success Rate</span>
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "200px", height: "140px", margin: "0 auto" }}>
                          {/* SVG Gauge - NGHIÊNG 60° */}
                          <svg width="200" height="140" viewBox="0 0 200 140" style={{ display: "block" }}>
                            <defs>
                              {/* Gradient với offset tùy chỉnh để các đoạn tăng dần */}
                              <linearGradient id="gaugeGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#dc2626" />
                                <stop offset="10%" stopColor="#f97316" />
                                <stop offset="25%" stopColor="#fbbf24" />
                                <stop offset="50%" stopColor="#84cc16" />
                                <stop offset="75%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#16a34a" />
                              </linearGradient>
                            </defs>

                            {/* Background arc - Từ 240° đến 60° (180° total, nghiêng 60°) */}
                            <path d="M 15,85 A 75,75 0 1,1 185,85" fill="none" stroke="#e5e7eb" strokeWidth="22" strokeLinecap="round" />

                            {/* Progress arc với gradient */}
                            <path d="M 15,85 A 75,75 0 1,1 185,85" fill="none" stroke="url(#gaugeGrad3)" strokeWidth="22" strokeLinecap="round" strokeDasharray={`${(parseFloat(gauges.successRate) / 100) * 235.6} 235.6`} />

                            {/* Vòng tròn trắng giữa */}
                            <circle cx="100" cy="85" r="53" fill="white" />

                            {/* Kim chỉ - xoay từ -120° (trái dưới) đến +60° (phải trên) */}
                            <g transform={`rotate(${-120 + (parseFloat(gauges.successRate) / 100) * 180}, 100, 85)`}>
                              <path d="M 100,85 L 97,32 L 100,28 L 103,32 Z" fill="#16a34a" />
                              <circle cx="100" cy="85" r="7" fill="#16a34a" />
                            </g>
                          </svg>

                          {/* Label - BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "15px",
                              bottom: "20px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>✅</span>
                          <span>Success Rate</span>
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "200px", height: "140px", margin: "0 auto" }}>
                          {/* SVG Gauge - NGHIÊNG 60° */}
                          <div
                            style={{
                              transform: "rotate(60deg) translateY(15px)",
                              transformOrigin: "center",
                            }}
                          >
                            <svg width="200" height="140" viewBox="0 0 200 140" style={{ display: "block" }}>
                              <defs>
                                <linearGradient id="gaugeGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#dc2626" />
                                  <stop offset="10%" stopColor="#f97316" />
                                  <stop offset="25%" stopColor="#fbbf24" />
                                  <stop offset="50%" stopColor="#84cc16" />
                                  <stop offset="75%" stopColor="#22c55e" />
                                  <stop offset="100%" stopColor="#16a34a" />
                                </linearGradient>
                              </defs>

                              {/* Background arc */}
                              <path d="M 15,85 A 75,75 0 1,1 185,85" fill="none" stroke="#e5e7eb" strokeWidth="22" strokeLinecap="round" />

                              {/* Progress arc */}
                              <path d="M 15,85 A 75,75 0 1,1 185,85" fill="none" stroke="url(#gaugeGrad3)" strokeWidth="22" strokeLinecap="round" strokeDasharray={`${(parseFloat(gauges.successRate) / 100) * 235.6} 235.6`} />

                              {/* White center */}
                              <circle cx="100" cy="85" r="53" fill="white" />

                              {/* Needle */}
                              <g transform={`rotate(${-120 + (parseFloat(gauges.successRate) / 100) * 180}, 100, 85)`}>
                                <path d="M 100,85 L 97,32 L 100,28 L 103,32 Z" fill="#16a34a" />
                                <circle cx="100" cy="85" r="7" fill="#16a34a" />
                              </g>
                            </svg>
                          </div>

                          {/* Label - BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "15px",
                              bottom: "20px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "4px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "220px", height: "140px", margin: "0 auto" }}>
                          {/* SVG Gauge */}
                          <svg width="220" height="140" viewBox="0 0 220 140">
                            {/* CÁC ĐOẠN MÀU - 5 đoạn BẰNG NHAU */}

                            {/* Đoạn 1: Xanh lá (0-20) */}
                            <path d="M 30,110 A 80,80 0 0,1 56,58" fill="none" stroke="#22c55e" strokeWidth="24" strokeLinecap="round" />

                            {/* Đoạn 2: Xanh lục (20-40) */}
                            <path d="M 58,56 A 80,80 0 0,1 95,38" fill="none" stroke="#10b981" strokeWidth="24" strokeLinecap="round" />

                            {/* Đoạn 3: Vàng (40-60) */}
                            <path d="M 97,37 A 80,80 0 0,1 123,37" fill="none" stroke="#fbbf24" strokeWidth="24" strokeLinecap="round" />

                            {/* Đoạn 4: Cam (60-80) */}
                            <path d="M 125,38 A 80,80 0 0,1 162,56" fill="none" stroke="#f97316" strokeWidth="24" strokeLinecap="round" />

                            {/* Đoạn 5: Đỏ (80-100) */}
                            <path d="M 164,58 A 80,80 0 0,1 190,110" fill="none" stroke="#dc2626" strokeWidth="24" strokeLinecap="round" />

                            {/* ĐƯỜNG CHIA TRẮNG (Ticks) */}
                            <line x1="56" y1="58" x2="62" y2="64" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <line x1="95" y1="38" x2="95" y2="46" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <line x1="125" y1="38" x2="125" y2="46" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <line x1="164" y1="58" x2="158" y2="64" stroke="white" strokeWidth="4" strokeLinecap="round" />

                            {/* Vòng tròn trắng giữa */}
                            <circle cx="110" cy="110" r="55" fill="white" />

                            {/* Icon ở giữa - Icon users */}
                            <text x="110" y="120" fontSize="32" textAnchor="middle" fill="#6b7280">
                              👥
                            </text>

                            {/* Kim chỉ - TAM GIÁC */}
                            <g transform={`rotate(${-90 + (parseFloat(gauges.successRate) / 100) * 180}, 110, 110)`}>
                              <path d="M 110,110 L 105,50 L 110,45 L 115,50 Z" fill="#0891b2" stroke="#0891b2" strokeWidth="2" />
                              <circle cx="110" cy="110" r="8" fill="#0891b2" />
                            </g>
                          </svg>

                          {/* Labels: 0, 50, 100 */}
                          <div style={{ position: "absolute", left: "5px", bottom: "35px", fontSize: "16px", fontWeight: "700", color: "#22c55e" }}>0</div>
                          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "5px", fontSize: "16px", fontWeight: "700", color: "#fbbf24" }}>50</div>
                          <div style={{ position: "absolute", right: "5px", bottom: "35px", fontSize: "16px", fontWeight: "700", color: "#dc2626" }}>100</div>
                        </div>

                        {/* Value bên dưới */}
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "#16a34a",
                            textAlign: "center",
                            marginTop: "5px",
                          }}
                        >
                          {Math.round(parseFloat(gauges.successRate))}/100
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginBottom: "8px",
                            marginTop: "8px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>✅</span>
                          <span>Success Rate</span>
                        </div>

                        {/* Label 8/10 (như hình 2) */}
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#16a34a",
                            marginBottom: "8px",
                          }}
                        >
                          {Math.round(parseFloat(gauges.successRate))}/100
                        </div>

                        {/* GaugeChart - 6 màu */}
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "220px",
                            height: "110px",
                            margin: "0 auto",
                            padding: "0",
                          }}
                        >
                          <GaugeChart id="gauge-success-rate" nrOfLevels={6} colors={["#dc2626", "#f97316", "#fbbf24", "#84cc16", "#22c55e", "#16a34a"]} arcWidth={0.3} percent={parseFloat(gauges.successRate) / 100} textColor="#1f2937" needleColor="#16a34a" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.01} cornerRadius={3} animate={true} animateDuration={800} />
                        </div>

                        {/* ❌ BỎ đoạn này - KHÔNG CÓ % Ở DƯỚI */}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginBottom: "8px",
                            marginTop: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container: Gauge + Label bên phải */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            height: "110px",
                          }}
                        >
                          {/* GaugeChart */}
                          <div
                            style={{
                              width: "180px",
                              height: "110px",
                            }}
                          >
                            <GaugeChart id="gauge-success-rate" nrOfLevels={5} colors={["#dc2626", "#f97316", "#fbbf24", "#22c55e", "#16a34a"]} arcWidth={0.3} percent={parseFloat(gauges.successRate) / 100} textColor="#1f2937" needleColor="#16a34a" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.01} cornerRadius={3} animate={true} animateDuration={800} />
                          </div>

                          {/* Label 8/10 - BÊN PHẢI */}
                          <div
                            style={{
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#16a34a",
                              marginLeft: "10px",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Gauge + Label BÊN PHẢI */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0px",
                            paddingLeft: "20px",
                          }}
                        >
                          {/* GaugeChart */}
                          <div style={{ width: "140px", height: "100px" }}>
                            <GaugeChart id="gauge-success-rate" nrOfLevels={5} colors={["#dc2626", "#f97316", "#fbbf24", "#22c55e", "#16a34a"]} arcWidth={0.3} percent={parseFloat(gauges.successRate) / 100} needleColor="#16a34a" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.01} cornerRadius={3} animate={true} animateDuration={800} />
                          </div>

                          {/* Label 8/10 - BÊN PHẢI */}
                          <div
                            style={{
                              fontSize: "36px",
                              fontWeight: "700",
                              color: "#16a34a",
                              marginLeft: "-10px",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container cho Gauge + Label */}
                        <div
                          style={{
                            position: "relative",
                            width: "200px",
                            height: "130px",
                            margin: "0 auto",
                          }}
                        >
                          {/* GaugeChart */}
                          <GaugeChart id="gauge-success-rate" nrOfLevels={5} colors={["#dc2626", "#f97316", "#fbbf24", "#22c55e", "#16a34a"]} arcWidth={0.3} percent={parseFloat(gauges.successRate) / 100} needleColor="#16a34a" needleBaseColor="#9ca3af" hideText={true} arcPadding={0.01} cornerRadius={3} animate={true} animateDuration={800} />

                          {/* Label 8/10 - BÊN PHẢI DƯỚI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "10px",
                              bottom: "20px",
                              fontSize: "36px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Tiêu đề */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container cho Gauge + Label */}
                        <div
                          style={{
                            position: "relative",
                            width: "200px",
                            height: "130px",
                            margin: "0 auto",
                          }}
                        >
                          {/* Biểu đồ Gauge */}
                          <GaugeChart id="gauge-success-rate" nrOfLevels={5} colors={["#dc2626", "#f97316", "#fbbf24", "#22c55e", "#16a34a"]} arcWidth={0.3} percent={parseFloat(gauges.successRate) / 100} needleColor="#0d9488" needleBaseColor="#0d9488" hideText={true} arcPadding={0.01} cornerRadius={3} animate={true} animateDuration={800} />

                          {/* Giá trị hiển thị */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-8px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#0d9488",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate) / 10)}/10
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "100%", height: "140px" }}>
                          {/* Recharts Gauge */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                              cx="50%"
                              cy="70%"
                              innerRadius="60%"
                              outerRadius="90%"
                              startAngle={180}
                              endAngle={0}
                              data={[
                                {
                                  value: parseFloat(gauges.successRate),
                                  fill: parseFloat(gauges.successRate) >= 80 ? "#16a34a" : parseFloat(gauges.successRate) >= 60 ? "#22c55e" : parseFloat(gauges.successRate) >= 40 ? "#fbbf24" : parseFloat(gauges.successRate) >= 20 ? "#f97316" : "#dc2626",
                                },
                              ]}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                              <RadialBar background={{ fill: "#e5e7eb" }} dataKey="value" cornerRadius={10} fill="#8884d8" />
                            </RadialBarChart>
                          </ResponsiveContainer>

                          {/* Label 87/100 - BÊN PHẢI    */}
                          <div
                            style={{
                              position: "absolute",
                              right: "20px",
                              bottom: "20px",
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "100%", height: "140px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                              cx="50%"
                              cy="100%" // dịch xuống đáy
                              innerRadius="60%"
                              outerRadius="90%"
                              startAngle={180}
                              endAngle={0}
                              data={[
                                {
                                  name: "Success",
                                  value: parseFloat(gauges.successRate),
                                  fill: parseFloat(gauges.successRate) >= 80 ? "#16a34a" : parseFloat(gauges.successRate) >= 60 ? "#22c55e" : parseFloat(gauges.successRate) >= 40 ? "#fbbf24" : parseFloat(gauges.successRate) >= 20 ? "#f97316" : "#dc2626",
                                },
                              ]}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
                              <RadialBar background={{ fill: "#e5e7eb" }} dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                          </ResponsiveContainer>

                          {/* Label */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-5px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate) / 10)}/10
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Gauge Container */}
                        <div
                          style={{
                            position: "relative",
                            width: "200px",
                            height: "130px",
                            margin: "0 auto",
                          }}
                        >
                          {/* Gauge chart (Pie + 5 vùng màu) */}
                          <PieChart width={200} height={100}>
                            <Pie
                              data={[
                                { value: 1, color: "#dc2626" },
                                { value: 1, color: "#f97316" },
                                { value: 1, color: "#fbbf24" },
                                { value: 1, color: "#22c55e" },
                                { value: 1, color: "#16a34a" },
                              ]}
                              dataKey="value"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={60}
                              outerRadius={80}
                              stroke="none"
                            >
                              {["#dc2626", "#f97316", "#fbbf24", "#22c55e", "#16a34a"].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                          </PieChart>

                          {/* Needle */}
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: "0",
                              width: "3px",
                              height: "60px",
                              backgroundColor: "#0d9488",
                              borderRadius: "3px",
                              transformOrigin: "bottom center",
                              transform: `translateX(-50%) rotate(${180 * (1 - parseFloat(gauges.successRate) / 100) - 90}deg)`,
                              transition: "transform 0.8s ease-out",
                            }}
                          ></div>

                          {/* Label */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-4px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#0d9488",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate) / 10)}/10
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "100%", height: "140px" }}>
                          {/* Recharts Gauge */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                              cx="50%"
                              cy="75%"
                              innerRadius="60%"
                              outerRadius="90%"
                              startAngle={180}
                              endAngle={0}
                              barSize={12}
                              data={[
                                { value: 20, fill: "#dc2626" },
                                { value: 20, fill: "#f97316" },
                                { value: 20, fill: "#fbbf24" },
                                { value: 20, fill: "#22c55e" },
                                { value: 20, fill: "#16a34a" },
                              ]}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            </RadialBarChart>
                          </ResponsiveContainer>

                          {/* Kim */}
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: "30px",
                              width: "4px",
                              height: "60px",
                              backgroundColor: "#0d9488",
                              borderRadius: "4px",
                              transformOrigin: "bottom center",
                              transform: `translateX(-50%) rotate(${180 * (1 - parseFloat(gauges.successRate) / 100)}deg)`,
                              transition: "transform 0.8s ease-out",
                            }}
                          ></div>

                          {/* Label 87/100 - BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "20px",
                              bottom: "20px",
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#0d9488",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate) / 10)}/10
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "4px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "100%", height: "160px" }}>
                          {/* Recharts Gauge ĐỨNG */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                              cx="50%"
                              cy="60%"
                              innerRadius="50%"
                              outerRadius="85%"
                              startAngle={180} // ← BẮT ĐẦU TỪ DƯỚI TRÁI
                              endAngle={0} // ← KẾT THÚC Ở DƯỚI PHẢI
                              data={[
                                {
                                  value: parseFloat(gauges.successRate),
                                  fill: parseFloat(gauges.successRate) >= 80 ? "#16a34a" : parseFloat(gauges.successRate) >= 60 ? "#22c55e" : parseFloat(gauges.successRate) >= 40 ? "#fbbf24" : parseFloat(gauges.successRate) >= 20 ? "#f97316" : "#dc2626",
                                },
                              ]}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                              <RadialBar background={{ fill: "#e5e7eb" }} dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                          </ResponsiveContainer>

                          {/* Label 87/100 - DƯỚI BÊN PHẢI -- */}
                          <div
                            style={{
                              position: "absolute",
                              right: "30px",
                              bottom: "10px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "180px", height: "130px", margin: "0 auto" }}>
                          {/* CircularProgressbar */}
                          <CircularProgressbar
                            value={parseFloat(gauges.successRate)}
                            strokeWidth={12}
                            styles={buildStyles({
                              rotation: 0.625,
                              strokeLinecap: "round",
                              pathColor: parseFloat(gauges.successRate) >= 80 ? "#16a34a" : parseFloat(gauges.successRate) >= 60 ? "#22c55e" : parseFloat(gauges.successRate) >= 40 ? "#fbbf24" : parseFloat(gauges.successRate) >= 20 ? "#f97316" : "#dc2626",
                              trailColor: "#e5e7eb",
                              pathTransitionDuration: 0.5,
                            })}
                          />

                          {/* Label 87/100 - DƯỚI BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "10px",
                              bottom: "0px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "100%", height: "140px" }}>
                          {/* Gauge Chart */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                              cx="50%"
                              cy="100%"
                              innerRadius="70%"
                              outerRadius="100%"
                              startAngle={180}
                              endAngle={0}
                              barSize={14}
                              data={[
                                { value: 20, fill: "#dc2626" },
                                { value: 20, fill: "#f97316" },
                                { value: 20, fill: "#fbbf24" },
                                { value: 20, fill: "#22c55e" },
                                { value: 20, fill: "#16a34a" },
                              ]}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                            </RadialBarChart>
                          </ResponsiveContainer>

                          {/* Kim */}
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: "0px",
                              width: "4px",
                              height: "65px",
                              backgroundColor: "#0d9488",
                              borderRadius: "4px",
                              transformOrigin: "bottom center",
                              transform: `translateX(-50%) rotate(${180 * (parseFloat(gauges.successRate) / 100) - 90}deg)`,
                              transition: "transform 0.8s ease-out",
                            }}
                          ></div>

                          {/* Label 8/10 */}
                          <div
                            style={{
                              position: "absolute",
                              right: "30px",
                              bottom: "20px",
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#0d9488",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate) / 10)}/10
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "200px", height: "140px", margin: "0 auto" }}>
                          {/* SVG Gauge */}
                          <svg width="200" height="140" viewBox="0 0 200 140">
                            <defs>
                              {/* Gradient 5 màu */}
                              <linearGradient id="gaugeGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#dc2626" />
                                <stop offset="25%" stopColor="#f97316" />
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="75%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#16a34a" />
                              </linearGradient>
                            </defs>

                            {/* Background arc (xám) */}
                            <path d="M 30,110 A 70,70 0 0,1 170,110" fill="none" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" />

                            {/* Progress arc (màu gradient) */}
                            <path d="M 30,110 A 70,70 0 0,1 170,110" fill="none" stroke="url(#gaugeGradient3)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${(parseFloat(gauges.successRate) / 100) * 220} 220`} />

                            {/* Vòng tròn trắng ở giữa */}
                            <circle cx="100" cy="110" r="50" fill="white" />

                            {/* Kim chỉ */}
                            <g transform={`rotate(${(parseFloat(gauges.successRate) / 100) * 180 - 90}, 100, 110)`}>
                              <path d="M 100,110 L 95,60 L 100,55 L 105,60 Z" fill="#16a34a" />
                              <circle cx="100" cy="110" r="8" fill="#16a34a" />
                            </g>
                          </svg>

                          {/* Label 87/100 - DƯỚI BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "20px",
                              bottom: "10px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "180px", height: "140px", margin: "0 auto" }}>
                          {/* SVG Gauge - ĐỨNG THẲNG */}
                          <svg width="180" height="140" viewBox="0 0 180 140" style={{ display: "block" }}>
                            <defs>
                              {/* Gradient 5 màu */}
                              <linearGradient id="gaugeGradient3">
                                <stop offset="0%" stopColor="#dc2626" />
                                <stop offset="25%" stopColor="#f97316" />
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="75%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#16a34a" />
                              </linearGradient>
                            </defs>

                            {/* Background arc (xám) - BÁN NGUYỆT ĐỨNG */}
                            <path d="M 30,120 A 60,60 0 0,1 150,120" fill="none" stroke="#e5e7eb" strokeWidth="18" strokeLinecap="round" />

                            {/* Progress arc (màu gradient) */}
                            <path d="M 30,120 A 60,60 0 0,1 150,120" fill="none" stroke="url(#gaugeGradient3)" strokeWidth="18" strokeLinecap="round" strokeDasharray={`${(parseFloat(gauges.successRate) / 100) * 188.5} 188.5`} />

                            {/* Vòng tròn trắng ở giữa */}
                            <circle cx="90" cy="120" r="45" fill="white" />

                            {/* Kim chỉ - XOAY ĐÚNG */}
                            <g transform={`rotate(${-90 + (parseFloat(gauges.successRate) / 100) * 180}, 90, 120)`}>
                              <line x1="90" y1="120" x2="90" y2="65" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
                              <circle cx="90" cy="120" r="6" fill="#16a34a" />
                            </g>
                          </svg>

                          {/* Label 87/100 - DƯỚI BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "15px",
                              bottom: "5px",
                              fontSize: "26px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "200px", height: "150px", margin: "0 auto" }}>
                          {/* SVG Gauge - NGHIÊNG 45° */}
                          <svg width="200" height="150" viewBox="0 0 200 150" style={{ display: "block" }}>
                            <defs>
                              {/* Gradient tuyến tính */}
                              <linearGradient id="gaugeGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#dc2626" />
                                <stop offset="20%" stopColor="#f97316" />
                                <stop offset="40%" stopColor="#fbbf24" />
                                <stop offset="70%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#16a34a" />
                              </linearGradient>
                            </defs>

                            {/* Background arc - NGHIÊNG 225° đến 45° */}
                            <path d="M 44,127 A 65,65 0 1,1 156,127" fill="none" stroke="#e5e7eb" strokeWidth="22" strokeLinecap="round" />

                            {/* CÁC ĐOẠN MÀU TĂNG DẦN */}
                            {/* Đoạn 1: Đỏ (nhỏ nhất) */}
                            <path d="M 44,127 A 65,65 0 0,1 60,95" fill="none" stroke="#dc2626" strokeWidth="22" strokeLinecap="round" />

                            {/* Đoạn 2: Cam */}
                            <path d="M 60,95 A 65,65 0 0,1 85,68" fill="none" stroke="#f97316" strokeWidth="22" strokeLinecap="round" />

                            {/* Đoạn 3: Vàng */}
                            <path d="M 85,68 A 65,65 0 0,1 115,55" fill="none" stroke="#fbbf24" strokeWidth="22" strokeLinecap="round" />

                            {/* Đoạn 4: Xanh lá nhạt (to hơn) */}
                            <path d="M 115,55 A 65,65 0 0,1 140,68" fill="none" stroke="#22c55e" strokeWidth="22" strokeLinecap="round" />

                            {/* Đoạn 5: Xanh đậm (to nhất) */}
                            <path d="M 140,68 A 65,65 0 0,1 156,95" fill="none" stroke="#16a34a" strokeWidth="22" strokeLinecap="round" />

                            {/* Vòng tròn trắng giữa */}
                            <circle cx="100" cy="100" r="48" fill="white" />

                            {/* Kim chỉ - Xoay theo giá trị */}
                            <g transform={`rotate(${-135 + (parseFloat(gauges.successRate) / 100) * 270}, 100, 100)`}>
                              <path d="M 100,100 L 97,52 L 100,48 L 103,52 Z" fill="#16a34a" />
                              <circle cx="100" cy="100" r="7" fill="#16a34a" />
                            </g>
                          </svg>

                          {/* Label 87/100 - BÊN PHẢI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "25px",
                              bottom: "30px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* GAUGE 3: Success Rate */}
                  <Col xs={12} sm={6}>
                    <Card
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "8px 4px",
                      }}
                    >
                      <Card.Body className="text-center p-0">
                        {/* Title */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            fontWeight: "600",
                            marginTop: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          ✅ Success Rate
                        </div>

                        {/* Container */}
                        <div style={{ position: "relative", width: "200px", height: "140px", margin: "0 auto" }}>
                          {/* SVG Gauge */}
                          <svg width="200" height="140" viewBox="0 0 200 140" style={{ display: "block" }}>
                            {/* Background arc (xám) - 225° đến 315° (90° total, góc dưới bên trái) */}
                            <path d="M 29,99 A 70,70 0 1,1 171,99" fill="none" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" />

                            {/* Progress arc - Gradient 5 màu, các đoạn TĂNG DẦN */}
                            <defs>
                              <linearGradient id="gaugeGrad3" gradientTransform="rotate(45)">
                                <stop offset="0%" stopColor="#dc2626" />
                                <stop offset="15%" stopColor="#f97316" />
                                <stop offset="35%" stopColor="#fbbf24" />
                                <stop offset="65%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#16a34a" />
                              </linearGradient>
                            </defs>

                            {/* Arc với gradient */}
                            <path d="M 29,99 A 70,70 0 1,1 171,99" fill="none" stroke="url(#gaugeGrad3)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${(parseFloat(gauges.successRate) / 100) * 220} 220`} />

                            {/* Vòng tròn trắng giữa */}
                            <circle cx="100" cy="99" r="50" fill="white" />

                            {/* Kim chỉ */}
                            <g transform={`rotate(${-90 + (parseFloat(gauges.successRate) / 100) * 180}, 100, 99)`}>
                              <path d="M 100,99 L 97,47 L 100,43 L 103,47 Z" fill="#16a34a" />
                              <circle cx="100" cy="99" r="7" fill="#16a34a" />
                            </g>
                          </svg>

                          {/* Label 87/100 - BÊN PHẢI NGOÀI */}
                          <div
                            style={{
                              position: "absolute",
                              right: "10px",
                              bottom: "25px",
                              fontSize: "28px",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            {Math.round(parseFloat(gauges.successRate))}/100
                          </div>
                        </div>
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
