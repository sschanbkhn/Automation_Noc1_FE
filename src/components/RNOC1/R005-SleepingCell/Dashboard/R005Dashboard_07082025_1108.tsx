// src/components/RNOC1/R005-SleepingCell/Dashboard/Dashboard.tsx
// import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import "./R005Dashboard.css"; // Import CSS file

import React, { useState, useEffect } from "react";
import Zone2ProvinceDistribution from "./Zone2ProvinceDistribution";
import Zone3CellsProgressChart from "./Zone3CellsProgressChart";

interface DashboardProps {
  sidebarWidth?: number;
  isSidebarCollapsed?: boolean;
  dashboardData: any;
  loading: boolean;
  selectedDate?: string; // ← THÊM DÒNG NÀY
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarWidth = 250, isSidebarCollapsed = false, dashboardData, loading, selectedDate }) => {
  /*
   const [selectedDate, setSelectedDate] = useState('2025-07-29');
  const [dashboardData, setDashboardData] = useState({
    todayAnalysis: 8250,
    sleepingCells: 150,
    executionCells: 138,
    recheckCells: 12

 });

 */

  console.log("🏢 Dashboard received selectedDate:", selectedDate); // ← THÊM LOG

  // const [dashboardData, setDashboardData] = useState(null);
  // const [loading, setLoading] = useState(false); // <-- Thêm dòng này

  // const [selectedDate, setSelectedDate] = useState('2025-07-29'); // OK - giá trị mặc định

  {
    /*}
const [dashboardData, setDashboardData] = useState(null); // ✅ Đúng
const [loading, setLoading] = useState(false);
// const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // ✅ Ngày hiện tại
const [selectedDate, setSelectedDate] = useState(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
});

*/
  }

  /*
const [selectedDate, setSelectedDate] = useState(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}); // ✅ Ngày hôm qua

*/

  /*

// ✅ Thêm useEffect này:
useEffect(() => {
  fetchDashboardData();
}, [selectedDate]);


*/

  {
    /*

// ✅ Chỉ gọi API một lần khi component mount (không phụ thuộc selectedDate)
useEffect(() => {
  fetchDashboardData();
}, []); // ← Empty dependency array - chỉ chạy 1 lần khi load


*/
  }

  {
    /*}

const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const apiUrl = `https://localhost:7232/api/dashboard/summary/${selectedDate}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    setDashboardData(data); // ✅ Chỉ cập nhật khi bấm Refresh
  } catch (error) {
    console.error('❌ API Error:', error);
  } finally {
    setLoading(false);
  }
};

*/
  }

  {
    /*


const fetchDashboardData = async () => {
  console.log('🔄 Fetching data for date:', selectedDate);
  setLoading(true);
  try {
    const apiUrl = `https://localhost:7232/api/dashboard/summary/${selectedDate}`;
    console.log('🔗 API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('📊 API returned:', data);
    console.log('📊 Data empty?', !data || Object.keys(data).length === 0);
    
    if (data && Object.keys(data).length > 0) {
      setDashboardData(data);
      console.log('✅ Data updated successfully');
    } else {
      console.log('⚠️ API returned empty data for this date');
      // Có thể hiển thị thông báo "No data for this date"
    }
    
  } catch (error) {
    console.error('❌ API Error:', error);
  } finally {
    setLoading(false);
  }
};


*/
  }

  /*

const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const apiUrl = `https://localhost:7232/api/dashboard/summary/${selectedDate}`;
    console.log('🔍 Calling API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm headers khác nếu cần (Authorization, etc.)
      },
      // credentials: 'include', // Nếu cần cookies
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Data received:', data);
    
    setDashboardData(data);
  } catch (error) {
    console.error('❌ API Error:', error);
  } finally {
    setLoading(false);
  }
};


*/

  const provinces = [
    {
      name: "HÀ NỘI",
      icon: "🏛️",
      cells: 45,
      resolved: 38,
      manual: 7,
      rate: 84,
    },
    {
      name: "HẢI PHÒNG",
      icon: "🚢",
      cells: 32,
      resolved: 28,
      manual: 4,
      rate: 88,
    },
    {
      name: "QUẢNG NINH",
      icon: "⛰️",
      cells: 28,
      resolved: 26,
      manual: 2,
      rate: 93,
    },
    {
      name: "THÁI NGUYÊN",
      icon: "🌲",
      cells: 25,
      resolved: 22,
      manual: 3,
      rate: 88,
    },
    {
      name: "HẢI DƯƠNG",
      icon: "🌾",
      cells: 20,
      resolved: 18,
      manual: 2,
      rate: 90,
    },
  ];

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
        {/* Date Picker Controls */}
        {/*
  <Row className="mb-4">
    <Col lg={12}>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e3f2fd'}}>
                <span style={{fontSize: '1.2rem'}}>📅</span>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Dashboard Date</h6>
                <small className="text-muted">Select date to view data</small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <input 
                type="date" 
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{width: '160px'}}
              />
              <Button 
                variant="primary" 
                onClick={fetchDashboardData}
                disabled={loading}
                className="d-flex align-items-center"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <span className="me-2">🔄</span>
                    Display Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>


  */}

        {/* Existing ZONE 1 & 2: Modern 4 Cards Layout */}

        {/* ket thuc zone 1 */}
        {/* ===============================================================*/}

        {/* <Row className="g-3 mb-3"> */}
        {/* ZONE 1: 5 Cards - Same Row  */}

        <Row
          // className="g-3 mb-1"
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

        {/* ZONE 5: Technical Summary */}

        {/* ZONE 7: Quick Action Buttons */}
        <div className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-circle me-3" style={{ backgroundColor: "#e3f2fd" }}>
                  <span style={{ fontSize: "1.5rem" }}>⚡</span>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Quick Actions</h5>
                  <small className="text-muted">Frequently used operations</small>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3">
                <Button variant="primary" className="d-flex align-items-center">
                  <span className="me-2">📋</span>
                  Export Sleeping Cell
                </Button>

                <Button variant="success" className="d-flex align-items-center">
                  <span className="me-2">🔄</span>
                  Reset Manual
                </Button>

                <Button variant="info" className="d-flex align-items-center">
                  <span className="me-2">📊</span>
                  Export resolved cell
                </Button>

                <Button variant="outline-primary" className="d-flex align-items-center">
                  <span className="me-2">⚙️</span>
                  Export error cell
                </Button>

                <Button variant="outline-warning" className="d-flex align-items-center">
                  <span className="me-2">📧</span>
                  Send Email
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
