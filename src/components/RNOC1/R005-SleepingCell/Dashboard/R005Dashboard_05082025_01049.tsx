// src/components/RNOC1/R005-SleepingCell/Dashboard/Dashboard.tsx
// import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import './R005Dashboard.css'; // Import CSS file

import React, { useState, useEffect } from 'react';


interface DashboardProps {
  sidebarWidth?: number;
  isSidebarCollapsed?: boolean;
    dashboardData: any;
  loading: boolean;
}





const Dashboard: React.FC<DashboardProps> = ({ 
  sidebarWidth = 250, 
  isSidebarCollapsed = false ,
  dashboardData, 
  loading 
}) => {


/*
   const [selectedDate, setSelectedDate] = useState('2025-07-29');
  const [dashboardData, setDashboardData] = useState({
    todayAnalysis: 8250,
    sleepingCells: 150,
    executionCells: 138,
    recheckCells: 12

 });

 */

 // const [dashboardData, setDashboardData] = useState(null);
// const [loading, setLoading] = useState(false); // <-- Thêm dòng này

// const [selectedDate, setSelectedDate] = useState('2025-07-29'); // OK - giá trị mặc định

{/*}
const [dashboardData, setDashboardData] = useState(null); // ✅ Đúng
const [loading, setLoading] = useState(false);
// const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // ✅ Ngày hiện tại
const [selectedDate, setSelectedDate] = useState(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
});

*/}

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

{/*

// ✅ Chỉ gọi API một lần khi component mount (không phụ thuộc selectedDate)
useEffect(() => {
  fetchDashboardData();
}, []); // ← Empty dependency array - chỉ chạy 1 lần khi load


*/}

{/*}

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

*/}

{/*


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


*/}


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
    { name: 'HÀ NỘI', icon: '🏛️', cells: 45, resolved: 38, manual: 7, rate: 84 },
    { name: 'HẢI PHÒNG', icon: '🚢', cells: 32, resolved: 28, manual: 4, rate: 88 },
    { name: 'QUẢNG NINH', icon: '⛰️', cells: 28, resolved: 26, manual: 2, rate: 93 },
    { name: 'THÁI NGUYÊN', icon: '🌲', cells: 25, resolved: 22, manual: 3, rate: 88 },
    { name: 'HẢI DƯƠNG', icon: '🌾', cells: 20, resolved: 18, manual: 2, rate: 90 }
  ];

  const sidebarOffset = isSidebarCollapsed ? 60 : sidebarWidth;
  const dashboardClass = isSidebarCollapsed ? 'dashboard-sidebar-collapsed' : 'dashboard-no-sidebar-overlap';

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div 
      className={dashboardClass}
      style={{
        backgroundColor: '#f8f9fb',
        minHeight: '100vh',
        padding: '1rem'
      }}
    >
      <Container fluid style={{maxWidth: 'none', padding: '0', margin: '0'}}>


  
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





{/* ZONE 1: Fixed - Dynamic Data Display */}
<Row className="g-3 mb-3">
  <Col xl={3} lg={6} md={6}>
    <Card style={{
      backgroundColor: '#ffebf0', 
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '140px'
    }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-1 small">Today's Analysis</p>
            {loading ? (
              <div className="d-flex align-items-center">
                <span className="spinner-border spinner-border-sm me-2" />
                <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>Loading...</h2>
              </div>
            ) : dashboardData ? (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>
                {dashboardData.todayAnalysis?.toLocaleString() || 'N/A'}
              </h2>
            ) : (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>No Data</h2>
            )}
            <div className="d-flex align-items-center">
              <span className="badge" style={{
                backgroundColor: '#10b981', 
                color: 'white', 
                fontSize: '0.75rem',
                borderRadius: '8px',
                padding: '4px 8px'
              }}>+100%</span>
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e91e63, #ad1457)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{fontSize: '1.5rem', color: 'white'}}>📚</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>

  <Col xl={3} lg={6} md={6}>
    <Card style={{
      backgroundColor: '#fff8e8',
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '140px'
    }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-1 small">Excution Cells</p>
            {loading ? (
              <div className="d-flex align-items-center">
                <span className="spinner-border spinner-border-sm me-2" />
                <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>Loading...</h2>
              </div>
            ) : dashboardData ? (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>
                {dashboardData.sleepingCells?.toLocaleString() || 'N/A'}
              </h2>
            ) : (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>No Data</h2>
            )}
            <div className="d-flex align-items-center">
              <span className="badge" style={{
                backgroundColor: '#10b981', 
                color: 'white', 
                fontSize: '0.75rem',
                borderRadius: '8px',
                padding: '4px 8px'
              }}>+7%</span>
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ff9800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{fontSize: '1.5rem', color: 'white'}}>📱</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>

  <Col xl={3} lg={6} md={6}>
    <Card style={{
      backgroundColor: '#e8f8f0', 
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '140px'
    }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-1 small">Resolved Cells</p>
            {loading ? (
              <div className="d-flex align-items-center">
                <span className="spinner-border spinner-border-sm me-2" />
                <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>Loading...</h2>
              </div>
            ) : dashboardData ? (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>
                {dashboardData.executionCells?.toLocaleString() || 'N/A'}
              </h2>
            ) : (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>No Data</h2>
            )}
            <div className="d-flex align-items-center">
              <span className="badge" style={{
                backgroundColor: '#10b981', 
                color: 'white', 
                fontSize: '0.75rem',
                borderRadius: '8px',
                padding: '4px 8px'
              }}>+97%</span>
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4caf50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{fontSize: '1.5rem', color: 'white'}}>📊</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>

  <Col xl={3} lg={6} md={6}>
    <Card style={{
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '140px'
    }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-1 small">Recheck Cells</p>
            {loading ? (
              <div className="d-flex align-items-center">
                <span className="spinner-border spinner-border-sm me-2" />
                <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>Loading...</h2>
              </div>
            ) : dashboardData ? (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>
                {dashboardData.recheckCells?.toLocaleString() || 'N/A'}
              </h2>
            ) : (
              <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>No Data</h2>
            )}
            <div className="d-flex align-items-center">
              <span className="badge" style={{
                backgroundColor: '#10b981', 
                color: 'white', 
                fontSize: '0.75rem',
                borderRadius: '8px',
                padding: '4px 8px'
              }}>0.5%</span>
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e879f9, #d946ef)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{fontSize: '1.5rem', color: 'white'}}>⚠️</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>






{/* BEAUTIFUL PROVINCE OVERVIEW SECTION */}
<div className="mb-4">
  <Card className="border-0 shadow-sm">
    <Card.Body className="p-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e3f2fd'}}>
            <span style={{fontSize: '1.5rem'}}>🗺️</span>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Province Distribution</h5>
            <small className="text-muted">Sleeping Cell Analysis Across 6 Provinces</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="text-center">
            <h3 className="fw-bold text-primary mb-0">6</h3>
            <small className="text-muted">Provinces</small>
          </div>
          <div className="text-center">
            <h3 className="fw-bold text-warning mb-0">22</h3>
            <small className="text-muted">Districts</small>
          </div>
          <div className="text-center">
            <h3 className="fw-bold text-success mb-0">85%</h3>
            <small className="text-muted">Avg Success</small>
          </div>
        </div>
      </div>
      
      {/* Province Performance Summary - Top Section */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Province Performance Summary</h6>
        
        <Row className="g-3">
          {/* SLA Province Card */}
          <Col md={4}>
            <Card className="border-0" style={{backgroundColor: '#f0f9ff', borderRadius: '12px', minHeight: '140px'}}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{
                      backgroundColor: '#0ea5e9', 
                      color: 'white', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>SLA</span>
                    <small className="text-muted">4 districts</small>
                  </div>
                  <Badge bg="success" style={{borderRadius: '8px', padding: '4px 8px'}}>100%</Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center text-center">
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>📱</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#1f2937'}}>6</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>cells</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>😴</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#ef4444'}}>5</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>sleeping</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>✅</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#10b981'}}>6</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>recovered</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* LSN Province Card */}
          <Col md={4}>
            <Card className="border-0" style={{backgroundColor: '#fef3c7', borderRadius: '12px', minHeight: '140px'}}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{
                      backgroundColor: '#f59e0b', 
                      color: 'white', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>LSN</span>
                    <small className="text-muted">9 districts</small>
                  </div>
                  <Badge bg="warning" style={{borderRadius: '8px', padding: '4px 8px'}}>71%</Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center text-center">
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>📱</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#1f2937'}}>34</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>cells</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>😴</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#ef4444'}}>34</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>sleeping</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>✅</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#10b981'}}>24</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>recovered</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* LCU Province Card */}
          <Col md={4}>
            <Card className="border-0" style={{backgroundColor: '#ecfdf5', borderRadius: '12px', minHeight: '140px'}}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>LCU</span>
                    <small className="text-muted">4 districts</small>
                  </div>
                  <Badge bg="success" style={{borderRadius: '8px', padding: '4px 8px'}}>85%</Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center text-center">
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>📱</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#1f2937'}}>13</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>cells</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>😴</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#ef4444'}}>13</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>sleeping</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>✅</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#10b981'}}>11</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>recovered</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* LCI Province Card */}
          <Col md={4}>
            <Card className="border-0" style={{backgroundColor: '#f3e8ff', borderRadius: '12px', minHeight: '140px'}}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{
                      backgroundColor: '#8b5cf6', 
                      color: 'white', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>LCI</span>
                    <small className="text-muted">3 districts</small>
                  </div>
                  <Badge bg="info" style={{borderRadius: '8px', padding: '4px 8px'}}>78%</Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center text-center">
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>📱</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#1f2937'}}>9</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>cells</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>😴</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#ef4444'}}>9</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>sleeping</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>✅</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#10b981'}}>7</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>recovered</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* DBN Province Card */}
          <Col md={4}>
            <Card className="border-0" style={{backgroundColor: '#f0f9ff', borderRadius: '12px', minHeight: '140px'}}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{
                      backgroundColor: '#06b6d4', 
                      color: 'white', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>DBN</span>
                    <small className="text-muted">1 district</small>
                  </div>
                  <Badge bg="success" style={{borderRadius: '8px', padding: '4px 8px'}}>100%</Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center text-center">
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>📱</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#1f2937'}}>2</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>cells</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>😴</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#ef4444'}}>2</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>sleeping</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>✅</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#10b981'}}>2</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>recovered</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* CBG Province Card */}
          <Col md={4}>
            <Card className="border-0" style={{backgroundColor: '#fdf2f8', borderRadius: '12px', minHeight: '140px'}}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{
                      backgroundColor: '#ec4899', 
                      color: 'white', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>CBG</span>
                    <small className="text-muted">1 district</small>
                  </div>
                  <Badge bg="success" style={{borderRadius: '8px', padding: '4px 8px'}}>100%</Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center text-center">
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>📱</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#1f2937'}}>1</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>cell</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>😴</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#ef4444'}}>1</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>sleeping</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span style={{fontSize: '1.2rem', marginRight: '4px'}}>✅</span>
                      <span className="fw-bold" style={{fontSize: '18px', color: '#10b981'}}>1</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>recovered</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Beautiful Vertical Bar Chart - Bottom Section */}
      <div>
        <h6 className="fw-bold mb-3">Sleeping Cells Distribution</h6>
        
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="border-0" style={{backgroundColor: '#f8fafc', borderRadius: '16px'}}>
              <Card.Body className="p-4">
                {/* Chart Title */}
                <div className="text-center mb-4">
                  <h6 className="fw-bold mb-0" style={{color: '#1f2937'}}>Sleeping Cells Distribution</h6>
                </div>
                
                {/* Vertical Bars Container - All 6 Provinces */}
                <div className="d-flex align-items-end justify-content-center gap-3" style={{height: '220px', marginBottom: '20px'}}>
                  
                  {/* SLA Bar */}
                  <div className="text-center">
                    <div className="position-relative">
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#10b981'
                      }}>5</div>
                      
                      <div style={{
                        width: '50px',
                        height: '30px',
                        background: 'linear-gradient(180deg, #10b981, #059669)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '12px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}></div>
                    </div>
                    
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '2px'}}>
                      SLA
                    </div>
                    <div style={{fontSize: '11px', color: '#10b981', fontWeight: '600'}}>
                      8%
                    </div>
                  </div>
                  
                  {/* LSN Bar - Tallest */}
                  <div className="text-center">
                    <div className="position-relative">
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#6366f1'
                      }}>34</div>
                      
                      <div style={{
                        width: '50px',
                        height: '160px',
                        background: 'linear-gradient(180deg, #6366f1, #4f46e5)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '12px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                      }}></div>
                    </div>
                    
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '2px'}}>
                      LSN
                    </div>
                    <div style={{fontSize: '11px', color: '#6366f1', fontWeight: '600'}}>
                      53%
                    </div>
                  </div>
                  
                  {/* LCU Bar */}
                  <div className="text-center">
                    <div className="position-relative">
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#f59e0b'
                      }}>13</div>
                      
                      <div style={{
                        width: '50px',
                        height: '60px',
                        background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '12px',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                      }}></div>
                    </div>
                    
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '2px'}}>
                      LCU
                    </div>
                    <div style={{fontSize: '11px', color: '#f59e0b', fontWeight: '600'}}>
                      20%
                    </div>
                  </div>
                  
                  {/* LCI Bar */}
                  <div className="text-center">
                    <div className="position-relative">
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#8b5cf6'
                      }}>9</div>
                      
                      <div style={{
                        width: '50px',
                        height: '42px',
                        background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '12px',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                      }}></div>
                    </div>
                    
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '2px'}}>
                      LCI
                    </div>
                    <div style={{fontSize: '11px', color: '#8b5cf6', fontWeight: '600'}}>
                      14%
                    </div>
                  </div>
                  
                  {/* DBN Bar */}
                  <div className="text-center">
                    <div className="position-relative">
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#06b6d4'
                      }}>2</div>
                      
                      <div style={{
                        width: '50px',
                        height: '12px',
                        background: 'linear-gradient(180deg, #06b6d4, #0891b2)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '12px',
                        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)'
                      }}></div>
                    </div>
                    
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '2px'}}>
                      DBN
                    </div>
                    <div style={{fontSize: '11px', color: '#06b6d4', fontWeight: '600'}}>
                      3%
                    </div>
                  </div>
                  
                  {/* CBG Bar */}
                  <div className="text-center">
                    <div className="position-relative">
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#ec4899'
                      }}>1</div>
                      
                      <div style={{
                        width: '50px',
                        height: '8px',
                        background: 'linear-gradient(180deg, #ec4899, #db2777)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '12px',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)'
                      }}></div>
                    </div>
                    
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '2px'}}>
                      CBG
                    </div>
                    <div style={{fontSize: '11px', color: '#ec4899', fontWeight: '600'}}>
                      2%
                    </div>
                  </div>
                  
                </div>
                
                {/* Summary instead of Legend */}
                <div className="text-center pt-3 border-top">
                  <small style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>
                    Total: <span className="fw-bold">64 sleeping cells</span> across 6 provinces
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

{/* ZONE 4: Technical Summary - Redesigned */}
<div className="mb-3">
  <Card className="border-0 shadow-lg" style={{
    borderRadius: '16px',
    overflow: 'hidden'
  }}>
    {/* Gradient Border Effect */}
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2px',
      borderRadius: '16px'
    }}>
      <Card.Body className="p-4" style={{
        background: 'white',
        borderRadius: '14px'
      }}>
        {/* Header Section */}
        <div className="d-flex align-items-center mb-4 position-relative">
          <div className="d-flex align-items-center">
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)'
            }}>
              <span style={{fontSize: '1.8rem'}}>🔧</span>
            </div>
            <div>
              <h5 className="fw-bold mb-1" style={{color: '#1a202c'}}>
                Technical Execution Results
              </h5>
              <small className="text-muted">Automation Process Summary</small>
            </div>
          </div>
          
          {/* Success Badge */}
          <div className="ms-auto">
            <span className="badge" style={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
            }}>
              All Systems Operational
            </span>
          </div>
        </div>
        
        <Row className="g-3">
          {/* Connectivity Test Card */}
          <Col xl={6} lg={6}>
            <div className="h-100 p-3 rounded-3 position-relative" style={{
              background: '#f8fafb',
              border: '1px solid #e9ecef',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e9ecef';
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #48bb78, #38a169)',
                borderRadius: '3px 3px 0 0'
              }} />
              
              <div className="d-flex align-items-start">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(72, 187, 120, 0.2)'
                }}>
                  <span style={{fontSize: '1.3rem'}}>🔗</span>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h6 className="text-uppercase mb-2" style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    color: '#718096'
                  }}>
                    Connectivity Test
                  </h6>
                  <div className="d-flex align-items-baseline mb-2">
                    <span className="fw-bold me-2" style={{fontSize: '1.75rem', color: '#1a202c'}}>
                      142/150
                    </span>
                    <span className="text-muted" style={{fontSize: '0.875rem'}}>
                      sites (95%)
                    </span>
                  </div>
                  <div className="mb-2" style={{height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden'}}>
                    <div style={{
                      width: '95%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #48bb78, #38a169)',
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite linear'
                      }} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f56565',
                      marginRight: '6px',
                      animation: 'pulse 2s infinite'
                    }} />
                    <small className="fw-semibold" style={{color: '#f56565'}}>
                      8 ping failed
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          {/* SSH Connection Card */}
          <Col xl={6} lg={6}>
            <div className="h-100 p-3 rounded-3 position-relative" style={{
              background: '#f8fafb',
              border: '1px solid #e9ecef',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e9ecef';
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #4299e1, #3182ce)',
                borderRadius: '3px 3px 0 0'
              }} />
              
              <div className="d-flex align-items-start">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(66, 153, 225, 0.2)'
                }}>
                  <span style={{fontSize: '1.3rem'}}>🔑</span>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h6 className="text-uppercase mb-2" style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    color: '#718096'
                  }}>
                    SSH Connection
                  </h6>
                  <div className="d-flex align-items-baseline mb-2">
                    <span className="fw-bold me-2" style={{fontSize: '1.75rem', color: '#1a202c'}}>
                      138/142
                    </span>
                    <span className="text-muted" style={{fontSize: '0.875rem'}}>
                      success (97%)
                    </span>
                  </div>
                  <div className="mb-2" style={{height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden'}}>
                    <div style={{
                      width: '97%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #4299e1, #3182ce)',
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite linear'
                      }} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f56565',
                      marginRight: '6px',
                      animation: 'pulse 2s infinite'
                    }} />
                    <small className="fw-semibold" style={{color: '#f56565'}}>
                      4 SSH failed
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          {/* Reset Execution Card */}
          <Col xl={6} lg={6}>
            <div className="h-100 p-3 rounded-3 position-relative" style={{
              background: '#f8fafb',
              border: '1px solid #e9ecef',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e9ecef';
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #ed8936, #dd6b20)',
                borderRadius: '3px 3px 0 0'
              }} />
              
              <div className="d-flex align-items-start">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(237, 137, 54, 0.2)'
                }}>
                  <span style={{fontSize: '1.3rem'}}>🔄</span>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h6 className="text-uppercase mb-2" style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    color: '#718096'
                  }}>
                    Reset Execution
                  </h6>
                  <div className="d-flex align-items-baseline mb-2">
                    <span className="fw-bold me-2" style={{fontSize: '1.75rem', color: '#1a202c'}}>
                      125/138
                    </span>
                    <span className="text-muted" style={{fontSize: '0.875rem'}}>
                      success (91%)
                    </span>
                  </div>
                  <div className="mb-2" style={{height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden'}}>
                    <div style={{
                      width: '91%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #ed8936, #dd6b20)',
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite linear'
                      }} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f56565',
                      marginRight: '6px',
                      animation: 'pulse 2s infinite'
                    }} />
                    <small className="fw-semibold" style={{color: '#f56565'}}>
                      13 reset failed
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          {/* Final Verification Card */}
          <Col xl={6} lg={6}>
            <div className="h-100 p-3 rounded-3 position-relative" style={{
              background: '#f8fafb',
              border: '1px solid #e9ecef',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e9ecef';
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '3px 3px 0 0'
              }} />
              
              <div className="d-flex align-items-start">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                }}>
                  <span style={{fontSize: '1.3rem'}}>✅</span>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h6 className="text-uppercase mb-2" style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    color: '#718096'
                  }}>
                    Final Verification
                  </h6>
                  <div className="d-flex align-items-baseline mb-2">
                    <span className="fw-bold me-2" style={{fontSize: '1.75rem', color: '#1a202c'}}>
                      125/125
                    </span>
                    <span className="text-muted" style={{fontSize: '0.875rem'}}>
                      recovered (100%)
                    </span>
                  </div>
                  <div className="mb-2" style={{height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden'}}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite linear'
                      }} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#48bb78',
                      marginRight: '6px',
                      animation: 'pulse 2s infinite'
                    }} />
                    <small className="fw-semibold" style={{color: '#48bb78'}}>
                      0 still down
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </div>
  </Card>
</div>





{/*


        { ZONE 4: Technical Summary 
        <div className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e3f2fd'}}>
                  <span style={{fontSize: '1.2rem'}}>🔧</span>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Technical Execution Results</h6>
                  <small className="text-muted">Automation Process Summary</small>
                </div>
              </div>
              
              <Row className="g-3">
                <Col xl={6} lg={6}>
                  <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                    <span style={{fontSize: '1.3rem'}} className="me-3">🔗</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">Connectivity Test</h6>
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold text-success me-2 small">142/150</span>
                        <span className="text-muted small">sites (95%)</span>
                      </div>
                      <ProgressBar now={95} variant="success" style={{height: '4px'}} />
                      <small className="text-danger small">8 ping failed</small>
                    </div>
                  </div>
                </Col>
                
                <Col xl={6} lg={6}>
                  <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                    <span style={{fontSize: '1.3rem'}} className="me-3">🔑</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">SSH Connection</h6>
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold text-success me-2 small">138/142</span>
                        <span className="text-muted small">success (97%)</span>
                      </div>
                      <ProgressBar now={97} variant="info" style={{height: '4px'}} />
                      <small className="text-danger small">4 SSH failed</small>
                    </div>
                  </div>
                </Col>
                
                <Col xl={6} lg={6}>
                  <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                    <span style={{fontSize: '1.3rem'}} className="me-3">🔄</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">Reset Execution</h6>
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold text-success me-2 small">125/138</span>
                        <span className="text-muted small">success (91%)</span>
                      </div>
                      <ProgressBar now={91} variant="warning" style={{height: '4px'}} />
                      <small className="text-danger small">13 reset failed</small>
                    </div>
                  </div>
                </Col>
                
                <Col xl={6} lg={6}>
                  <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                    <span style={{fontSize: '1.3rem'}} className="me-3">✅</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">Final Verification</h6>
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold text-success me-2 small">125/125</span>
                        <span className="text-muted small">recovered (100%)</span>
                      </div>
                      <ProgressBar now={100} variant="success" style={{height: '4px'}} />
                      <small className="text-success small">0 still down</small>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>


{ ================================================ ZONE 4: Technical Summary }



*/}


{/* ZONE 5: Technical Summary */}

<Row className="g-4 mb-4">
  <Col lg={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e8f5e8'}}>
            <span style={{fontSize: '1.5rem'}}>📍</span>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Breakdown by Province</h5>
            <small className="text-muted">Geographic Distribution</small>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* SLA Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#0ea5e9', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🏛️</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">SLA: 6 cells</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              <div className="d-flex align-items-center text-small">
                <span className="text-success me-3">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>✅</span>
                  <span className="fw-medium">6 resolved</span>
                </span>
                <span className="text-danger">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>❌</span>
                  <span className="fw-medium">0 manual</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* LSN Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#f59e0b', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🚢</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LSN: 34 cells</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>71%</Badge>
              </div>
              <div className="d-flex align-items-center text-small">
                <span className="text-success me-3">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>✅</span>
                  <span className="fw-medium">24 resolved</span>
                </span>
                <span className="text-danger">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>❌</span>
                  <span className="fw-medium">10 manual</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* LCU Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#10b981', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>⛰️</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LCU: 13 cells</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>85%</Badge>
              </div>
              <div className="d-flex align-items-center text-small">
                <span className="text-success me-3">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>✅</span>
                  <span className="fw-medium">11 resolved</span>
                </span>
                <span className="text-danger">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>❌</span>
                  <span className="fw-medium">2 manual</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* LCI Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#8b5cf6', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🌲</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LCI: 9 cells</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>78%</Badge>
              </div>
              <div className="d-flex align-items-center text-small">
                <span className="text-success me-3">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>✅</span>
                  <span className="fw-medium">7 resolved</span>
                </span>
                <span className="text-danger">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>❌</span>
                  <span className="fw-medium">2 manual</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* DBN Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#06b6d4', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🌾</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">DBN: 2 cells</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              <div className="d-flex align-items-center text-small">
                <span className="text-success me-3">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>✅</span>
                  <span className="fw-medium">2 resolved</span>
                </span>
                <span className="text-danger">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>❌</span>
                  <span className="fw-medium">0 manual</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* CBG Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#ec4899', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🏭</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">CBG: 1 cell</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              <div className="d-flex align-items-center text-small">
                <span className="text-success me-3">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>✅</span>
                  <span className="fw-medium">1 resolved</span>
                </span>
                <span className="text-danger">
                  <span style={{fontSize: '1rem', marginRight: '4px'}}>❌</span>
                  <span className="fw-medium">0 manual</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>




{/* Three Column Province Chart - Updated to Timeline Style */}

<Col lg={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
          <span style={{fontSize: '1.5rem'}}>📊</span>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
          <small className="text-muted">Sleeping Cells Progress Chart</small>
        </div>
      </div>
      
      <div className="space-y-4">





{/* All Provinces - With Labels */}




{/* LSN Province */}
<div className="mb-3">
  <div 
    className="p-3 d-flex align-items-center" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    {/* Icon Circle */}
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center me-3"
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#f59e0b',
        flexShrink: 0
      }}
    >
      <div 
        style={{
          width: '25px',
          height: '18px',
          backgroundColor: '#1f2937',
          border: '2px solid #1f2937',
          position: 'relative'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(45deg, transparent 40%, #ef4444 40%, #ef4444 60%, transparent 60%)'
          }}
        ></div>
      </div>
    </div>
    
    {/* Province Name */}
    <div className="me-3" style={{ minWidth: '60px' }}>
      <h5 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#1f2937' }}>LSN</h5>
    </div>
    
    {/* Three bars with labels */}
    <div className="flex-grow-1">
      {/* Total bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Total</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f59e01',
              width: '100%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e01', minWidth: '25px' }}>34</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{
              height: '8px',
    backgroundColor: '#10b983', 
    width: '50%',
            }}



          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b983', minWidth: '50px' }}>24</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#ef4444',
              width: '50%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '50px' }}>10</span>
      </div>
    </div>
  </div>
</div>




{/* LCU Province */}
<div className="mb-2">  {/* // chinh khoang cach giua cac container */}
  <div 
    className="p-3 d-flex align-items-center" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    {/* Icon Circle */}
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center me-3"
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#06b6d4',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: '24px', color: 'white' }}>⛰️</span>
    </div>
    
    {/* Province Name */}
    <div className="me-3" style={{ minWidth: '60px' }}>
      <h5 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#1f2937' }}>LCU</h5>
    </div>
    
    {/* Three bars with labels */}
    <div className="flex-grow-1">
      {/* Total bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Total</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f59e0a',
              width: '100%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0a', minWidth: '25px' }}>13</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{
              height: '8px',
    backgroundColor: '#10b981', 
    width: '85%',
            }}



          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '50px' }}>11</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#ef4444',
              width: '15%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '50px' }}>2</span>
      </div>
    </div>
  </div>
</div>

{/* LCI Province */}
<div className="mb-2">
  <div 
    className="p-3 d-flex align-items-center" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    {/* Icon Circle */}
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center me-3"
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#8b5cf6',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: '24px', color: 'white' }}>🌲</span>
    </div>
    
    {/* Province Name */}
    <div className="me-3" style={{ minWidth: '60px' }}>
      <h5 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#1f2937' }}>LCI</h5>
    </div>
    
    {/* Three bars with labels */}
    <div className="flex-grow-1">
      {/* Total bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Total</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f59e0b',
              width: '100%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0b', minWidth: '25px' }}>9</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#10b981',
              width: '78%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '25px' }}>7</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#ef4444',
              width: '22%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '25px' }}>2</span>
      </div>
    </div>
  </div>
</div>

{/* SLA Province */}
<div className="mb-3">
  <div 
    className="p-3 d-flex align-items-center" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    {/* Icon Circle */}
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center me-3"
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#10b981',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: '24px', color: 'white' }}>🌾</span>
    </div>
    
    {/* Province Name */}
    <div className="me-3" style={{ minWidth: '60px' }}>
      <h5 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#1f2937' }}>SLA</h5>
    </div>
    
    {/* Three bars with labels */}
    <div className="flex-grow-1">
      {/* Total bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Total</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f59e0b',
              width: '18%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0b', minWidth: '25px' }}>6</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#10b981',
              width: '100%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '25px' }}>6</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#ef4444',
              width: '0%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '25px' }}>0</span>
      </div>
    </div>
  </div>
</div>

{/* DBN Province */}
<div className="mb-2">
  <div 
    className="p-3 d-flex align-items-center" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    {/* Icon Circle */}
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center me-3"
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#0ea5e9',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: '24px', color: 'white' }}>🚢</span>
    </div>
    
    {/* Province Name */}
    <div className="me-3" style={{ minWidth: '60px' }}>
      <h5 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#1f2937' }}>DBN</h5>
    </div>
    
    {/* Three bars with labels */}
    <div className="flex-grow-1">
      {/* Total bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Total</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f59e0b',
              width: '6%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0b', minWidth: '25px' }}>2</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#10b981',
              width: '100%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '25px' }}>2</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#ef4444',
              width: '0%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '25px' }}>0</span>
      </div>
    </div>
  </div>
</div>

{/* CBG Province */}
<div className="mb-2">
  <div 
    className="p-3 d-flex align-items-center" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    {/* Icon Circle */}
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center me-3"
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#ec4899',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: '24px', color: 'white' }}>🏭</span>
    </div>
    
    {/* Province Name */}
    <div className="me-3" style={{ minWidth: '60px' }}>
      <h5 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#1f2937' }}>CBG</h5>
    </div>
    
    {/* Three bars with labels */}
    <div className="flex-grow-1">
      {/* Total bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Total</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f59e0b',
              width: '3%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0b', minWidth: '25px' }}>1</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#10b981',
              width: '100%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '25px' }}>1</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{
              height: '8px',
              backgroundColor: '#ef4444',
              width: '0%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '25px' }}>0</span>
      </div>
    </div>
  </div>
</div>


{/* ======================================== ket thuc test ==========}






















      {/* Legend */}
      <div className="mt-4 pt-3 border-top">
        <div className="d-flex justify-content-center gap-4">
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                // backgroundColor: '#3b82f6',
                backgroundColor: '#f59e0b',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Total</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                // backgroundColor: '#f59e0b',
                backgroundColor: '#10b981',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Resolved</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                // backgroundColor: '#10b981',
                backgroundColor: '#ef4444',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Error</small>
          </div>
        </div>
      </div>

</div>





    </Card.Body>
  </Card>
</Col>




</Row>




        {/* ZONE 6: Actions & Alerts */}
        <div className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#ffebee'}}>
                  <span style={{fontSize: '1.5rem'}}>🚨</span>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Actions Required</h5>
                  <small className="text-muted">Items need manual intervention</small>
                </div>
              </div>
              
              <Row className="g-3">
                <Col md={4}>
                  <div className="p-3 rounded border-start border-danger border-4" style={{backgroundColor: '#fff5f5'}}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-danger mb-1">8 sites: Ping failed</h6>
                        <small className="text-muted">Network connectivity issue</small>
                      </div>
                      <Button variant="outline-danger" size="sm">View Details</Button>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="p-3 rounded border-start border-warning border-4" style={{backgroundColor: '#fffbf0'}}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-warning mb-1">4 sites: SSH failed</h6>
                        <small className="text-muted">Access credential problem</small>
                      </div>
                      <Button variant="outline-warning" size="sm">View Details</Button>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="p-3 rounded border-start border-info border-4" style={{backgroundColor: '#f0f9ff'}}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-info mb-1">13 cells: Reset failed</h6>
                        <small className="text-muted">Manual intervention needed</small>
                      </div>
                      <Button variant="outline-info" size="sm">View Details</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>




{/* ===================================================}


        {/* ZONE 7: Quick Action Buttons */}
        <div className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e3f2fd'}}>
                  <span style={{fontSize: '1.5rem'}}>⚡</span>
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