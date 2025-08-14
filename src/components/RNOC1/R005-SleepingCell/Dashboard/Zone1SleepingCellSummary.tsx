// import React, { useState, useEffect } from "react";
// import { Card, Row, Col } from "react-bootstrap";
// check code

// ✅ ĐÚNG - thêm import:
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal, Table, Badge } from "react-bootstrap";
// import API_CONFIG from "./Designer/ApiR005SleepingCellConfig"; // Điều chỉnh đường dẫn cho đúng
import API_CONFIG from "../Designer/ApiR005SleepingCellConfig";
// import R005Tabs from "./Designer/R005Tabs";

interface Zone1SleepingCellSummaryProps {
  selectedDate?: string;
  loading?: boolean;
  dashboardData?: DashboardData | null; // ← THÊM DÒNG NÀY
}

interface DashboardData {
  todayAnalysis: number;
  sleepingCells: number;
  processCells_: number;
  executionCells: number;
  recheckCells: number;
}

// const Zone1SleepingCellSummary: React.FC<Zone1SleepingCellSummaryProps> = ({ selectedDate, loading: parentLoading }) => {
const Zone1SleepingCellSummary: React.FC<Zone1SleepingCellSummaryProps> = ({
  selectedDate,
  loading: parentLoading,
  dashboardData, // ← THÊM PROP NÀY
}) => {
  // const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // ✅ THÊM STATES:
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [modalData, setModalData] = useState<any[]>([]);

  const [modalLoading, setModalLoading] = useState(false); // ← THÊM DÒNG NÀY

  const isLoading = parentLoading || false;

  const handleCardClick = async (cardType: string) => {
    console.log("🔥 Zone1 card clicked:", cardType, selectedDate);
    setModalType(cardType);
    setShowModal(true);
    setModalLoading(true);
    // const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/province-summary/${selectedDate}`);
    // const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/trend?endDate=${endDate}`);
    // const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/province-summary/${date}`);

    // ? "https://localhost:7232/api" // Local development
    // : "http://10.155.43.202:8081/api", // Production server

    try {
      let endpoint = "";
      switch (cardType) {
        case "sleeping":
          // endpoint = `http://10.155.43.202:8081/api/dashboard/sleeping-cells/${selectedDate}`;
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/sleeping-cells/${selectedDate}`;

          break; // ✅ FIX: Bỏ "https:" trước break
        case "process":
          // endpoint = `http://10.155.43.202:8081/api/dashboard/process-cells/${selectedDate}`;
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/process-cells/${selectedDate}`;
          break;
        case "execution":
          // endpoint = `http://10.155.43.202:8081/api/dashboard/execution-cells/${selectedDate}`;
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/execution-cells/${selectedDate}`;
          break;
        case "recheck":
          // endpoint = `http://10.155.43.202:8081/api/dashboard/recheck-cells/${selectedDate}`;
          endpoint = `${API_CONFIG.BASE_URL}/dashboard/recheck-cells/${selectedDate}`;
          break;
      }

      console.log("📡 Calling API:", endpoint);
      const response = await fetch(endpoint);
      const result = await response.json();
      console.log("📊 Modal API response:", result);

      // ✅ FIX: Dùng snake_case từ API response
      setModalData(result.data || []);
    } catch (error) {
      console.error("❌ Error fetching detail data:", error);
      setModalData([]);
    } finally {
      // ✅ CRITICAL: Set loading to false
      setModalLoading(false);
    }
  };

  /*
  // ✅ THÊM CLICK HANDLERS:
  const handleCardClick = async (cardType: string) => {
    setModalType(cardType);
    setShowModal(true);
    setModalLoading(true); // ← THÊM

    // Fetch detailed data based on card type
    try {
      let endpoint = "";
      switch (cardType) {
        case "sleeping":
          endpoint = `http://10.155.43.202:8081/api/dashboard/sleeping-cells/${selectedDate}`;

          break;
        case "process":
          endpoint = `http://10.155.43.202:8081/api/dashboard/process-cells/${selectedDate}`;
          break;
        case "execution":
          endpoint = `http://10.155.43.202:8081/api/dashboard/execution-cells/${selectedDate}`;
          break;
        case "recheck":
          endpoint = `http://10.155.43.202:8081/api/dashboard/recheck-cells/${selectedDate}`;
          break;
      }

      const response = await fetch(endpoint);
      const result = await response.json();
      setModalData(result.data || []);
    } catch (error) {
      console.error("Error fetching detail data:", error);
      setModalData([]);
    }
  };

*/

  // ✅ CARD STYLE FUNCTION:
  const getCardStyle = (cardType: string, baseStyle: any) => ({
    ...baseStyle,
    cursor: "pointer",
    transform: hoveredCard === cardType ? "translateY(-4px) scale(1.02)" : "translateY(0)",
    boxShadow: hoveredCard === cardType ? "0 8px 32px rgba(0,0,0,0.15)" : baseStyle.boxShadow,
    transition: "all 0.3s ease",
  });

  // ✅ MODAL TITLES:
  const getModalTitle = () => {
    switch (modalType) {
      case "sleeping":
        return "😴 Sleeping Cells Details";
      case "process":
        return "⚡ Process Cells Details";
      case "execution":
        return "🔧 Execution Cells Details";
      case "recheck":
        return "🔍 Recheck Cells Details";
      default:
        return "Cell Details";
    }
  };

  return (
    <div className="mb-4">
      <Row className="g-3 mb-1" style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}>
        {/* Card 1: Today's Analysis - NO CLICK */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={{
              backgroundColor: "#ffebf0",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            }}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Today's Analysis</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.todayAnalysis?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#e91e63",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
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
                    background: "linear-gradient(135deg, #e91e63, #c2185b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>📊</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Sleeping Cells - CLICKABLE */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("sleeping", {
              backgroundColor: "#f3e8ff",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("sleeping")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("sleeping")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Sleeping Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.sleepingCells?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Critical
                    </span>
                    {hoveredCard === "sleeping" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#f44336",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
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
                    background: "linear-gradient(135deg, #f44336, #d32f2f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>😴</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Process Cells - CLICKABLE */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("process", {
              backgroundColor: "#fff3e0",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("process")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("process")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Process Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.processCells_?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#ff9800",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Active
                    </span>
                    {hoveredCard === "process" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#ff9800",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
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
                    background: "linear-gradient(135deg, #ff9800, #f57c00)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>⚡</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 4: Execution Cells - CLICKABLE */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("execution", {
              backgroundColor: "#e3f2fd",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("execution")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("execution")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Execution Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.executionCells?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Running
                    </span>
                    {hoveredCard === "execution" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#2196f3",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
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
                  <span style={{ fontSize: "1.2rem", color: "white" }}>🔧</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 5: Recheck Cells - CLICKABLE */}
        <Col style={{ flex: "1 1 0", minWidth: "160px", maxWidth: "none" }}>
          <Card
            style={getCardStyle("recheck", {
              backgroundColor: "#e8f5e8",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "140px",
            })}
            onMouseEnter={() => setHoveredCard("recheck")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("recheck")}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1 small">Recheck Cells</p>
                  {isLoading ? (
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                        Loading...
                      </h3>
                    </div>
                  ) : dashboardData ? (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      {dashboardData.recheckCells?.toLocaleString() || "N/A"}
                    </h3>
                  ) : (
                    <h3 className="fw-bold mb-2" style={{ color: "#1a202c", fontSize: "1.8rem" }}>
                      No Data
                    </h3>
                  )}
                  <div className="d-flex align-items-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#4caf50",
                        color: "white",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        padding: "3px 6px",
                      }}
                    >
                      Verified
                    </span>
                    {hoveredCard === "recheck" && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#fff",
                          color: "#4caf50",
                          fontSize: "0.6rem",
                          transition: "all 0.3s ease",
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
                    background: "linear-gradient(135deg, #4caf50, #388e3c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", color: "white" }}>🔍</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ MODAL HIỂN THỊ DANH SÁCH: */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
          <Modal.Title className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: "1.5rem" }}>
              {modalType === "sleeping" && "😴"}
              {modalType === "process" && "⚡"}
              {modalType === "execution" && "🔧"}
              {modalType === "recheck" && "🔍"}
            </span>
            {getModalTitle()}
            <Badge bg="secondary" className="ms-2">
              {selectedDate}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", padding: "0" }}>
          {modalLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading detailed data...</p>
            </div>
          ) : modalData.length > 0 ? (
            <Table striped hover className="mb-0">
              <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "12px" }}>#</th>
                  <th style={{ padding: "12px" }}>Cell Name</th>
                  <th style={{ padding: "12px" }}>Site Name</th>
                  <th style={{ padding: "12px" }}>Province</th>
                  <th style={{ padding: "12px" }}>District</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Last Update</th>
                </tr>
              </thead>

              {/* ✅ THAY THẾ PHẦN NÀY: */}
              <tbody>
                {modalData.map((item, index) => (
                  <tr key={index} style={{ borderLeft: `4px solid ${modalType === "sleeping" ? "#f44336" : modalType === "process" ? "#ff9800" : modalType === "execution" ? "#2196f3" : "#4caf50"}` }}>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{index + 1}</td>
                    <td style={{ padding: "12px", fontFamily: "monospace" }}>{item.lncel_name || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{item.lnbts_name || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      <Badge bg="primary" style={{ fontSize: "0.75rem" }}>
                        {item.province || "N/A"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px" }}>{item.district || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      <Badge bg="secondary">{item.period_start_time || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.85rem", color: "#666" }}>{item.created_at || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
              <h5 className="text-muted">No data available</h5>
              <p className="text-muted">No records found for {selectedDate}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #e9ecef" }}>
          <div className="d-flex justify-content-between w-100 align-items-center">
            <small className="text-muted">{modalData.length > 0 ? `Showing ${modalData.length} records` : "No records found"}</small>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Zone1SleepingCellSummary;
