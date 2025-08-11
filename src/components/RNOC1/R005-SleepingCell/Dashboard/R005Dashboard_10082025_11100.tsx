// src/components/RNOC1/R005-SleepingCell/Dashboard/Dashboard.tsx
// import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import "./R005Dashboard.css"; // Import CSS file

import React, { useState, useEffect } from "react";
import Zone2ProvinceDistribution from "./Zone2ProvinceDistribution";
import Zone3CellsProgressChart from "./Zone3CellsProgressChart";
import Zone4TableCells_DistributionChart from "./zone4TableCellsDistribution";

interface DashboardProps {
  sidebarWidth?: number;
  isSidebarCollapsed?: boolean;
  dashboardData: any;
  loading: boolean;
  selectedDate?: string; // ← THÊM DÒNG NÀY
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarWidth = 250, isSidebarCollapsed = false, dashboardData, loading, selectedDate }) => {
  console.log("🏢 Dashboard received selectedDate:", selectedDate); // ← THÊM LOG

  const sidebarOffset = isSidebarCollapsed ? 60 : sidebarWidth;
  const dashboardClass = isSidebarCollapsed ? "dashboard-sidebar-collapsed" : "dashboard-no-sidebar-overlap";

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div
      className={dashboardClass}
      style={{
        backgroundColor: "#f8f9fb",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <Container fluid style={{ maxWidth: "none", padding: "0", margin: "0" }}>
        {/* bat dau zone 1 */}
        {/* ===============================================================*/}

        {/* ZONE 1: 5 Cards - Same Row  */}

        <Row
          className="g-3 mb-1"
          style={{
            display: "flex",
            flexWrap: "nowrap", // Không cho phép xuống dòng
            overflowX: "auto", // Scroll ngang nếu cần
          }}
        >
          {/* Card 1: Today's Analysis */}
          {/* <Col xl={2} lg={4} md={6} sm={6}> */}

          <Col
            style={{
              flex: "1 1 0", // Chia đều kích thước
              minWidth: "160px", // Giảm minWidth
              maxWidth: "none", // Không giới hạn maxWidth
            }}
          >
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
                    {loading ? (
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
                        Daily
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #e91e63, #ad1457)",
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

          {/* Card 2: Sleeping Cells */}
          {/* <Col xl={2} lg={4} md={6} sm={6}> */}
          <Col
            style={{
              flex: "1 1 0", // Chia đều kích thước
              minWidth: "160px", // Giảm minWidth
              maxWidth: "none", // Không giới hạn maxWidth
            }}
          >
            <Card
              style={{
                // backgroundColor: '#ffebee',
                // backgroundColor: '#ffebee'    // Màu cũ (hồng nhạt)
                // backgroundColor: '#f3e5f5',    // Thay bằng màu khác (tím nhạt)
                backgroundColor: "#f3e8ff",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "140px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1 small">Sleeping Cells</p>
                    {loading ? (
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

          {/* Card 3: Process Cells */}

          {/* <Col xl={2} lg={4} md={6} sm={6}> */}
          <Col
            style={{
              flex: "1 1 0", // Chia đều kích thước
              minWidth: "160px", // Giảm minWidth
              maxWidth: "none", // Không giới hạn maxWidth
            }}
          >
            <Card
              style={{
                backgroundColor: "#fff3e0",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "140px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1 small">Process Cells</p>
                    {loading ? (
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

          {/* Card 4: Execution Cells */}
          {/* <Col xl={2} lg={4} md={6} sm={6}> */}
          <Col
            style={{
              flex: "1 1 0", // Chia đều kích thước
              minWidth: "160px", // Giảm minWidth
              maxWidth: "none", // Không giới hạn maxWidth
            }}
          >
            <Card
              style={{
                backgroundColor: "#e3f2fd",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "140px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1 small">Execution Cells</p>
                    {loading ? (
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

          {/* Card 5: Recheck Cells */}
          {/* <Col xl={2} lg={4} md={6} sm={6}> */}
          {/* <Col style={{ flex: '0 0 20%', minWidth: '180px' }}> */}
          <Col
            style={{
              flex: "1 1 0", // Chia đều kích thước
              minWidth: "160px", // Giảm minWidth
              maxWidth: "none", // Không giới hạn maxWidth
            }}
          >
            <Card
              style={{
                backgroundColor: "#e8f5e8",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "140px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1 small">Recheck Cells</p>
                    {loading ? (
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

        {/* ket thuc zone 1 */}
        {/* ===============================================================*/}

        {/*  bat dau zone 2 */}
        {/* ===============================================================*/}
        {/* <Zone2ProvinceDistribution /> */}

        {/*  bat dau zone 2 */}
        {/* ===============================================================*/}
        <Zone2ProvinceDistribution dashboardData={dashboardData} loading={loading} selectedDate={selectedDate} />

        {/*  ket thuc zone 2 */}
        {/* ===============================================================*/}

        {/*  bat dau zone 3 */}
        {/* ===============================================================*/}
        <Zone3CellsProgressChart dashboardData={dashboardData} loading={loading} selectedDate={selectedDate} />
        {/*  ket thuc  zone 3 */}
        {/* ===============================================================*/}

        {/*  bat dau zone 4 */}
        {/* ===============================================================*/}

        <Zone4TableCells_DistributionChart dashboardData={dashboardData} loading={loading} selectedDate={selectedDate} />
        {/*  ket thuc  zone 4 */}
        {/* ===============================================================*/}

        {/* ZONE 5: Technical Summary */}
        {/* ===============================================================*/}

        {/*  ket thuc  zone 5 */}
        {/* ===============================================================*/}

        {/* ZONE 6: Quick Action Buttons */}
        {/* ===============================================================*/}

        {/*  ket thuc  zone 6 */}
        {/* ===============================================================*/}

        {/* ===============================================================*/}

        {/*  ket thuc  Dash */}
        {/* ===============================================================*/}
      </Container>
    </div>
  );
};

export default Dashboard;
