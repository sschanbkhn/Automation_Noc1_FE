// import React, { useState, useEffect } from "react";
// import { Card, Row, Col } from "react-bootstrap";

// ✅ ĐÚNG - thêm import:
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Modal, Table, Badge } from "react-bootstrap";

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
          endpoint = `https://localhost:7232/api/dashboard/sleeping-cells/${selectedDate}`;

          https: break;
        case "process":
          endpoint = `https://localhost:7232/api/dashboard/process-cells/${selectedDate}`;
          break;
        case "execution":
          endpoint = `https://localhost:7232/api/dashboard/execution-cells/${selectedDate}`;
          break;
        case "recheck":
          endpoint = `https://localhost:7232/api/dashboard/recheck-cells/${selectedDate}`;
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

  /*
  // Fetch data từ API
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (!selectedDate || !isMounted) return;

      try {
        setLoading(true);

        const response = await fetch(`https://localhost:7232/api/dashboard/summary/${selectedDate}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📊 Zone1 data:", result);

        if (result && isMounted) {
          setDashboardData({
            todayAnalysis: result.todayAnalysis || 0,
            sleepingCells: result.sleepingCells || 0,
            processCells_: result.processCells_ || 0,
            executionCells: result.executionCells || 0,
            recheckCells: result.recheckCells || 0,
          });
          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching Zone1SleepingCellSummary data:", err);
        if (isMounted) {
          setError(err.message);
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);
    
    
    */

  // const isLoading = parentLoading || loading;
  // const isLoading = parentLoading || false;

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
            {/* ... Today's Analysis content giữ nguyên ... */}
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
              <tbody>
                {modalData.map((item, index) => (
                  <tr key={index} style={{ borderLeft: `4px solid ${modalType === "sleeping" ? "#f44336" : modalType === "process" ? "#ff9800" : modalType === "execution" ? "#2196f3" : "#4caf50"}` }}>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{index + 1}</td>
                    <td style={{ padding: "12px", fontFamily: "monospace" }}>{item.lncelName || item.cellName || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{item.lnbtsName || item.siteName || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      <Badge bg="primary" style={{ fontSize: "0.75rem" }}>
                        {item.province || "N/A"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px" }}>{item.district || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      <Badge bg={item.executionStatus === "completed" ? "success" : item.executionStatus === "failed" ? "danger" : item.executionStatus === "starting_reset" ? "warning" : "secondary"}>{item.executionStatus || item.status || "Unknown"}</Badge>
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.85rem", color: "#666" }}>{item.archivedAt || item.lastUpdate || "N/A"}</td>
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
