// ============================================
// R003Zone1Summary.tsx
// R003 PRBs Load Balancing - Zone 1 Summary
// ============================================

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";

// ============================================
// TYPES & INTERFACES
// ============================================

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

// ============================================
// COMPONENT
// ============================================

const R003Zone1Summary: React.FC<R003Zone1SummaryProps> = ({ selectedDate }) => {
  // ============================================
  // STATE
  // ============================================

  const [summaryData, setSummaryData] = useState<R003SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<CellType>("total");
  const [modalData, setModalData] = useState<R003CellDetail[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Table state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Hover state for cards
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // ============================================
  // API BASE URL
  // ============================================

  // const API_BASE_URL = "https://your-api-url.com/api/r003/dashboard"; // ← BẠN SỬA URL
  // const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/province-summary/${selectedDate}`);
  // ============================================
  // API FUNCTIONS
  // ============================================

  // Fetch Summary Data
  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/summary/${selectedDate}`);
      // await fetch(`${API_CONFIG.BASE_URL}/dashboard/province-summary/${selectedDate}`);

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

  // Fetch Cell Details (for Modal)
  const fetchCellDetails = async (type: CellType) => {
    setModalLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/cells/${type}/${selectedDate}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setModalData(result.data || []);
    } catch (err) {
      console.error("❌ Error fetching cell details:", err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  // Fetch summary when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchSummaryData();
    }
  }, [selectedDate]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Calculate normal cells (for Donut)
  const calculateNormalCells = (): number => {
    if (!summaryData) return 0;

    const { totalCells, prbsCongestedCells, processingCells, pendingCells, successCells, newCells } = summaryData.summary;

    return totalCells - (prbsCongestedCells + processingCells + pendingCells + successCells + newCells);
  };

  // Calculate comparison with yesterday
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

  // Calculate Gauge metrics
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

  // Handle card click
  const handleCardClick = (type: CellType) => {
    setModalType(type);
    setShowModal(true);
    setSearchTerm("");
    setCurrentPage(1);
    fetchCellDetails(type);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // ============================================
  // RENDER
  // ============================================

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

  if (!summaryData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>No data available</p>
      </div>
    );
  }

  const gaugeMetrics = calculateGaugeMetrics();

  return (
    <div className="r003-zone1-summary" style={{ padding: "20px" }}>
      {/* ============================================ */}
      {/* HÀNG 1: 4 CARDS */}
      {/* ============================================ */}

      <Row className="g-3 mb-3">
        {/* Card 1: Tổng Cell */}
        <Col xs={12} sm={6} md={3}>
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
      </Row>
    </div>
  );
};

export default R003Zone1Summary;
