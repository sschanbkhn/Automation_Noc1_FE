// src/components/RNOC1/R005-SleepingCell/Dashboard/Dashboard.tsx
import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import './R005Dashboard.css'; // Import CSS file

interface DashboardProps {
  sidebarWidth?: number;
  isSidebarCollapsed?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  sidebarWidth = 250, 
  isSidebarCollapsed = false 
}) => {
  const mockData = {
    ossFiles: 5,
    analyzed: 1250,
    detected: 150,
    ping: 142,
    ssh: 138,
    reset: 125,
    manual: 25
  };

  const provinces = [
    { name: 'HÀ NỘI', icon: '🏛️', cells: 45, resolved: 38, manual: 7, rate: 84 },
    { name: 'HẢI PHÒNG', icon: '🚢', cells: 32, resolved: 28, manual: 4, rate: 88 },
    { name: 'QUẢNG NINH', icon: '⛰️', cells: 28, resolved: 26, manual: 2, rate: 93 },
    { name: 'THÁI NGUYÊN', icon: '🌲', cells: 25, resolved: 22, manual: 3, rate: 88 },
    { name: 'HẢI DƯƠNG', icon: '🌾', cells: 20, resolved: 18, manual: 2, rate: 90 }
  ];

  const sidebarOffset = isSidebarCollapsed ? 60 : sidebarWidth;
  const dashboardClass = isSidebarCollapsed ? 'dashboard-sidebar-collapsed' : 'dashboard-no-sidebar-overlap';

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
        
        {/* ZONE 1 & 2: Modern 4 Cards Layout */}
<Row className="g-3 mb-3">
  <Col xl={3} lg={6} md={6}>
    <Card style={{
      // backgroundColor: 'white',
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
            <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>8,250</h2>
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
            <p className="text-muted mb-1 small">Sleeping Cells</p>
            <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>150</h2>
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
      //backgroundColor: 'white',
      backgroundColor: '#e8f8f0', 
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '140px'
    }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-1 small">Excution Cells</p>
            <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>138</h2>
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
            <h2 className="fw-bold mb-2" style={{color: '#1a202c', fontSize: '2rem'}}>12</h2>
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




{/* PROVINCE OVERVIEW SECTION - Real Data */}
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
      
      <Row className="g-4">
        {/* Province Statistics */}
        <Col lg={7}>
          <h6 className="fw-bold mb-3">Province Performance Summary</h6>
          
          <Row className="g-2">
            {/* SLA Province */}
            <Col md={6} className="mb-2">
              <div className="p-3 rounded border" style={{backgroundColor: '#f0f9ff'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{backgroundColor: '#0ea5e9', color: 'white', padding: '4px 8px'}}>SLA</span>
                    <small className="text-muted">4 districts</small>
                  </div>
                  <Badge bg="success">100%</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center text-small">
                  <span>📱 6 cells</span>
                  <span className="text-danger">😴 5 sleeping</span>
                  <span className="text-success">✅ 6 recovered</span>
                </div>
              </div>
            </Col>
            
            {/* LSN Province */}
            <Col md={6} className="mb-2">
              <div className="p-3 rounded border" style={{backgroundColor: '#fef3c7'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px'}}>LSN</span>
                    <small className="text-muted">9 districts</small>
                  </div>
                  <Badge bg="warning">71%</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center text-small">
                  <span>📱 34 cells</span>
                  <span className="text-danger">😴 34 sleeping</span>
                  <span className="text-success">✅ 24 recovered</span>
                </div>
              </div>
            </Col>
            
            {/* LCU Province */}
            <Col md={6} className="mb-2">
              <div className="p-3 rounded border" style={{backgroundColor: '#ecfdf5'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{backgroundColor: '#10b981', color: 'white', padding: '4px 8px'}}>LCU</span>
                    <small className="text-muted">4 districts</small>
                  </div>
                  <Badge bg="success">85%</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center text-small">
                  <span>📱 13 cells</span>
                  <span className="text-danger">😴 13 sleeping</span>
                  <span className="text-success">✅ 11 recovered</span>
                </div>
              </div>
            </Col>
            
            {/* LCI Province */}
            <Col md={6} className="mb-2">
              <div className="p-3 rounded border" style={{backgroundColor: '#f3e8ff'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{backgroundColor: '#8b5cf6', color: 'white', padding: '4px 8px'}}>LCI</span>
                    <small className="text-muted">3 districts</small>
                  </div>
                  <Badge bg="info">78%</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center text-small">
                  <span>📱 9 cells</span>
                  <span className="text-danger">😴 9 sleeping</span>
                  <span className="text-success">✅ 7 recovered</span>
                </div>
              </div>
            </Col>
            
            {/* DBN Province */}
            <Col md={6} className="mb-2">
              <div className="p-3 rounded border" style={{backgroundColor: '#f0f9ff'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{backgroundColor: '#06b6d4', color: 'white', padding: '4px 8px'}}>DBN</span>
                    <small className="text-muted">1 district</small>
                  </div>
                  <Badge bg="success">100%</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center text-small">
                  <span>📱 2 cells</span>
                  <span className="text-danger">😴 2 sleeping</span>
                  <span className="text-success">✅ 2 recovered</span>
                </div>
              </div>
            </Col>
            
            {/* CBG Province */}
            <Col md={6} className="mb-2">
              <div className="p-3 rounded border" style={{backgroundColor: '#fdf2f8'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge me-2" style={{backgroundColor: '#ec4899', color: 'white', padding: '4px 8px'}}>CBG</span>
                    <small className="text-muted">1 district</small>
                  </div>
                  <Badge bg="success">100%</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center text-small">
                  <span>📱 1 cell</span>
                  <span className="text-danger">😴 1 sleeping</span>
                  <span className="text-success">✅ 1 recovered</span>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        
        

              

{/* Vertical Bar Chart Section */}
<Col lg={5}>
  <h6 className="fw-bold mb-3">Sleeping Cells Distribution</h6>
  
  {/* Vertical Bar Chart */}
  <div className="position-relative" style={{
    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 
    borderRadius: '12px', 
    padding: '20px', 
    minHeight: '300px'
  }}>
    
    {/* Chart Title */}
    <div className="text-center mb-4">
      <h6 className="fw-bold mb-0">Sleeping Cells Distribution</h6>
    </div>
    
    {/* Chart Container */}
    <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '200px'}}>
      
      {/* SLA Bar */}
      <div className="text-center">
        <div className="position-relative">
          {/* Number on top */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#10b981'
          }}>
            6
          </div>
          
          {/* Bar */}
          <div style={{
            width: '80px',
            height: '60px',
            background: 'linear-gradient(180deg, #10b981, #059669)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}></div>
        </div>
        
        {/* Labels */}
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px'}}>
          SLA
        </div>
        <div style={{fontSize: '12px', color: '#10b981', fontWeight: '600'}}>
          100%
        </div>
      </div>
      
      {/* LSN Bar */}
      <div className="text-center">
        <div className="position-relative">
          {/* Number on top */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#6366f1'
          }}>
            34
          </div>
          
          {/* Bar */}
          <div style={{
            width: '80px',
            height: '170px',
            background: 'linear-gradient(180deg, #6366f1, #4f46e5)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}></div>
        </div>
        
        {/* Labels */}
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px'}}>
          LSN
        </div>
        <div style={{fontSize: '12px', color: '#6366f1', fontWeight: '600'}}>
          71%
        </div>
      </div>
      
      {/* LCU Bar */}
      <div className="text-center">
        <div className="position-relative">
          {/* Number on top */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#f59e0b'
          }}>
            13
          </div>
          
          {/* Bar */}
          <div style={{
            width: '80px',
            height: '65px',
            background: 'linear-gradient(180deg, #f59e0b, #d97706)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}></div>
        </div>
        
        {/* Labels */}
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px'}}>
          LCU
        </div>
        <div style={{fontSize: '12px', color: '#f59e0b', fontWeight: '600'}}>
          85%
        </div>
      </div>
      
      {/* LCI Bar */}
      <div className="text-center">
        <div className="position-relative">
          {/* Number on top */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#8b5cf6'
          }}>
            9
          </div>
          
          {/* Bar */}
          <div style={{
            width: '80px',
            height: '45px',
            background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}></div>
        </div>
        
        {/* Labels */}
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px'}}>
          LCI
        </div>
        <div style={{fontSize: '12px', color: '#8b5cf6', fontWeight: '600'}}>
          78%
        </div>
      </div>
      
      {/* Others (DBN + CBG) Bar */}
      <div className="text-center">
        <div className="position-relative">
          {/* Number on top */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ec4899'
          }}>
            3
          </div>
          
          {/* Bar */}
          <div style={{
            width: '80px',
            height: '15px',
            background: 'linear-gradient(180deg, #ec4899, #db2777)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
          }}></div>
        </div>
        
        {/* Labels */}
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px'}}>
          Others
        </div>
        <div style={{fontSize: '12px', color: '#ec4899', fontWeight: '600'}}>
          100%
        </div>
      </div>
    </div>
    
    {/* Legend */}
    <div className="mt-4 pt-3 border-top">
      <div className="d-flex justify-content-center gap-4">
        <div className="d-flex align-items-center">
          <div style={{
            width: '16px', 
            height: '16px', 
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            borderRadius: '4px', 
            marginRight: '6px'
          }}></div>
          <small style={{fontSize: '11px', color: '#6b7280'}}>High Success</small>
        </div>
        <div className="d-flex align-items-center">
          <div style={{
            width: '16px', 
            height: '16px', 
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
            borderRadius: '4px', 
            marginRight: '6px'
          }}></div>
          <small style={{fontSize: '11px', color: '#6b7280'}}>Need Attention</small>
        </div>
      </div>
    </div>
  </div>
</Col>


</Row>






      
      {/* Quick Summary */}
      <div className="mt-4 pt-3 border-top">
        <Row className="g-3">
          <Col md={3}>
            <div className="text-center p-2 rounded" style={{backgroundColor: '#fef3c7'}}>
              <div className="fw-bold text-warning">LSN</div>
              <small className="text-muted">Needs Attention (34 cells)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center p-2 rounded" style={{backgroundColor: '#ecfdf5'}}>
              <div className="fw-bold text-success">LCU</div>
              <small className="text-muted">Good Performance (13 cells)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center p-2 rounded" style={{backgroundColor: '#f0f9ff'}}>
              <div className="fw-bold text-info">SLA</div>
              <small className="text-muted">Perfect Score (6 cells)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center p-2 rounded" style={{backgroundColor: '#f3e8ff'}}>
              <div className="fw-bold text-primary">Others</div>
              <small className="text-muted">12 cells total</small>
            </div>
          </Col>
        </Row>
      </div>
    </Card.Body>
  </Card>
</div>




        {/* ZONE 4: Technical Summary */}
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



{/* BEAUTIFUL BREAKDOWN BY PROVINCE SECTION */}
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
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
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
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
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
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
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
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
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
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
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
        </div>
      </Card.Body>
    </Card>
  </Col>
  
{/*


<Col lg={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
          <span style={{fontSize: '1.5rem'}}>📊</span>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
          <small className="text-muted">Three Column Bar Chart</small>
        </div>
      </div>
      
      <div className="space-y-4">
      
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏛️</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LSN</span>
          </div>
          
          <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '120px'}}>
           
            <div className="text-center">
              <div style={{
                height: '100px',
                width: '32px',
                backgroundColor: '#6b7280',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>34</span>
              </div>
              <small className="text-muted" style={{fontSize: '11px', fontWeight: '500'}}>Total</small>
            </div>
            
           
            <div className="text-center">
              <div style={{
                height: '71px',
                width: '32px',
                backgroundColor: '#10b981',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>24</span>
              </div>
              <small className="text-success" style={{fontSize: '11px', fontWeight: '500'}}>Resolved</small>
            </div>
            
           
            <div className="text-center">
              <div style={{
                height: '29px',
                width: '32px',
                backgroundColor: '#ef4444',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>10</span>
              </div>
              <small className="text-danger" style={{fontSize: '11px', fontWeight: '500'}}>Manual</small>
            </div>
          </div>
        </div>
        
      
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⛰️</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCU</span>
          </div>
          
          <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '120px'}}>
            <div className="text-center">
              <div style={{
                height: '38px',
                width: '32px',
                backgroundColor: '#6b7280',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>13</span>
              </div>
              <small className="text-muted" style={{fontSize: '11px', fontWeight: '500'}}>Total</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '32px',
                width: '32px',
                backgroundColor: '#10b981',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>11</span>
              </div>
              <small className="text-success" style={{fontSize: '11px', fontWeight: '500'}}>Resolved</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '6px',
                width: '32px',
                backgroundColor: '#ef4444',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>2</span>
              </div>
              <small className="text-danger" style={{fontSize: '11px', fontWeight: '500'}}>Manual</small>
            </div>
          </div>
        </div>
        
      
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌲</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCI</span>
          </div>
          
          <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '120px'}}>
            <div className="text-center">
              <div style={{
                height: '26px',
                width: '32px',
                backgroundColor: '#6b7280',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>9</span>
              </div>
              <small className="text-muted" style={{fontSize: '11px', fontWeight: '500'}}>Total</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '21px',
                width: '32px',
                backgroundColor: '#10b981',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>7</span>
              </div>
              <small className="text-success" style={{fontSize: '11px', fontWeight: '500'}}>Resolved</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '6px',
                width: '32px',
                backgroundColor: '#ef4444',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>2</span>
              </div>
              <small className="text-danger" style={{fontSize: '11px', fontWeight: '500'}}>Manual</small>
            </div>
          </div>
        </div>
        
    
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌾</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>SLA</span>
          </div>
          
          <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '120px'}}>
            <div className="text-center">
              <div style={{
                height: '18px',
                width: '32px',
                backgroundColor: '#6b7280',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>6</span>
              </div>
              <small className="text-muted" style={{fontSize: '11px', fontWeight: '500'}}>Total</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '18px',
                width: '32px',
                backgroundColor: '#10b981',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>6</span>
              </div>
              <small className="text-success" style={{fontSize: '11px', fontWeight: '500'}}>Resolved</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '3px',
                width: '32px',
                backgroundColor: '#ef4444',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '3px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>0</span>
              </div>
              <small className="text-danger" style={{fontSize: '11px', fontWeight: '500'}}>Manual</small>
            </div>
          </div>
        </div>
        
    
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🚢</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>DBN</span>
          </div>
          
          <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '120px'}}>
            <div className="text-center">
              <div style={{
                height: '6px',
                width: '32px',
                backgroundColor: '#6b7280',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '6px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>2</span>
              </div>
              <small className="text-muted" style={{fontSize: '11px', fontWeight: '500'}}>Total</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '6px',
                width: '32px',
                backgroundColor: '#10b981',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '6px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>2</span>
              </div>
              <small className="text-success" style={{fontSize: '11px', fontWeight: '500'}}>Resolved</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '3px',
                width: '32px',
                backgroundColor: '#ef4444',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '3px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>0</span>
              </div>
              <small className="text-danger" style={{fontSize: '11px', fontWeight: '500'}}>Manual</small>
            </div>
          </div>
        </div>
        
      
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏭</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>CBG</span>
          </div>
          
          <div className="d-flex align-items-end justify-content-center gap-4" style={{height: '120px'}}>
            <div className="text-center">
              <div style={{
                height: '3px',
                width: '32px',
                backgroundColor: '#6b7280',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '3px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>1</span>
              </div>
              <small className="text-muted" style={{fontSize: '11px', fontWeight: '500'}}>Total</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '3px',
                width: '32px',
                backgroundColor: '#10b981',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '3px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>1</span>
              </div>
              <small className="text-success" style={{fontSize: '11px', fontWeight: '500'}}>Resolved</small>
            </div>
            
            <div className="text-center">
              <div style={{
                height: '3px',
                width: '32px',
                backgroundColor: '#ef4444',
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                minHeight: '3px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>0</span>
              </div>
              <small className="text-danger" style={{fontSize: '11px', fontWeight: '500'}}>Manual</small>
            </div>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>




*/}

<Col lg={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
          <span style={{fontSize: '1.5rem'}}>📊</span>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
          <small className="text-muted">Three Separate Bar Chart</small>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* LSN */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏛️</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LSN</span>
          </div>
          
          <div className="space-y-2">
            {/* Total Bar */}
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Total</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '100%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', minWidth: '20px'}}>34</span>
            </div>
            
            {/* Resolved Bar */}
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Resolved</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '71%',
                      backgroundColor: '#10b981',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', minWidth: '20px'}}>24</span>
            </div>
            
            {/* Manual Bar */}
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Manual</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '29%',
                      backgroundColor: '#ef4444',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', minWidth: '20px'}}>10</span>
            </div>
          </div>
        </div>
        
        {/* LCU */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⛰️</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCU</span>
          </div>
          
          <div className="space-y-2">
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Total</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '38%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', minWidth: '20px'}}>13</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Resolved</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '32%',
                      backgroundColor: '#10b981',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', minWidth: '20px'}}>11</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Manual</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '6%',
                      backgroundColor: '#ef4444',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', minWidth: '20px'}}>2</span>
            </div>
          </div>
        </div>
        
        {/* LCI */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌲</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCI</span>
          </div>
          
          <div className="space-y-2">
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Total</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '26%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', minWidth: '20px'}}>9</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Resolved</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '21%',
                      backgroundColor: '#10b981',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', minWidth: '20px'}}>7</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Manual</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '6%',
                      backgroundColor: '#ef4444',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', minWidth: '20px'}}>2</span>
            </div>
          </div>
        </div>
        
        {/* SLA */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌾</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>SLA</span>
          </div>
          
          <div className="space-y-2">
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Total</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '18%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', minWidth: '20px'}}>6</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Resolved</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '18%',
                      backgroundColor: '#10b981',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', minWidth: '20px'}}>6</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Manual</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '0%',
                      backgroundColor: '#ef4444',
                      borderRadius: '6px',
                      minWidth: '2px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', minWidth: '20px'}}>0</span>
            </div>
          </div>
        </div>
        
        {/* DBN */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🚢</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>DBN</span>
          </div>
          
          <div className="space-y-2">
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Total</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '6%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', minWidth: '20px'}}>2</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Resolved</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '6%',
                      backgroundColor: '#10b981',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', minWidth: '20px'}}>2</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Manual</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '0%',
                      backgroundColor: '#ef4444',
                      borderRadius: '6px',
                      minWidth: '2px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', minWidth: '20px'}}>0</span>
            </div>
          </div>
        </div>
        
        {/* CBG */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏭</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>CBG</span>
          </div>
          
          <div className="space-y-2">
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Total</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '3%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', minWidth: '20px'}}>1</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Resolved</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '3%',
                      backgroundColor: '#10b981',
                      borderRadius: '6px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', minWidth: '20px'}}>1</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div style={{width: '60px', fontSize: '11px', color: '#6b7280', fontWeight: '500'}}>Manual</div>
              <div className="flex-grow-1 me-2">
                <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: '0%',
                      backgroundColor: '#ef4444',
                      borderRadius: '6px',
                      minWidth: '2px'
                    }}
                  ></div>
                </div>
              </div>
              <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', minWidth: '20px'}}>0</span>
            </div>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>



{/* 

  <Col lg={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
            <span style={{fontSize: '1.5rem'}}>📊</span>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
            <small className="text-muted">Horizontal Bar Chart</small>
          </div>
        </div>
        
        <div className="space-y-3">
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏛️</span>
                <span className="fw-medium text-muted">LSN</span>
              </div>
              <span className="fw-bold" style={{fontSize: '16px'}}>34</span>
            </div>
            <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#e5e7eb'}}>
              <div 
                className="progress-bar" 
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                  borderRadius: '6px'
                }}
              ></div>
            </div>
          </div>
          
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🚢</span>
                <span className="fw-medium text-muted">LCU</span>
              </div>
              <span className="fw-bold" style={{fontSize: '16px'}}>13</span>
            </div>
            <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#e5e7eb'}}>
              <div 
                className="progress-bar" 
                style={{
                  width: '38%',
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  borderRadius: '6px'
                }}
              ></div>
            </div>
          </div>
          
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⛰️</span>
                <span className="fw-medium text-muted">LCI</span>
              </div>
              <span className="fw-bold" style={{fontSize: '16px'}}>9</span>
            </div>
            <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#e5e7eb'}}>
              <div 
                className="progress-bar" 
                style={{
                  width: '26%',
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  borderRadius: '6px'
                }}
              ></div>
            </div>
          </div>
          
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌲</span>
                <span className="fw-medium text-muted">SLA</span>
              </div>
              <span className="fw-bold" style={{fontSize: '16px'}}>6</span>
            </div>
            <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#e5e7eb'}}>
              <div 
                className="progress-bar" 
                style={{
                  width: '18%',
                  background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
                  borderRadius: '6px'
                }}
              ></div>
            </div>
          </div>
          
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌾</span>
                <span className="fw-medium text-muted">DBN</span>
              </div>
              <span className="fw-bold" style={{fontSize: '16px'}}>2</span>
            </div>
            <div className="progress" style={{height: '12px', borderRadius: '6px', backgroundColor: '#e5e7eb'}}>
              <div 
                className="progress-bar" 
                style={{
                  width: '6%',
                  background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                  borderRadius: '6px'
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>




*/}








</Row>
















        {/* ZONE 5: Geographic Analysis */}
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
                
                {provinces.map((province, index) => (
                  <div key={index} className="d-flex align-items-center mb-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                    <span style={{fontSize: '1.5rem'}} className="me-3">{province.icon}</span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0">{province.name}: {province.cells} cells</h6>
                        <Badge bg="primary">{province.rate}%</Badge>
                      </div>
                      <div className="d-flex align-items-center text-small">
                        <span className="text-success me-3">✅ {province.resolved} resolved</span>
                        <span className="text-danger">❌ {province.manual} manual</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>



{/* Three Column Province Chart */}

<Col lg={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
          <span style={{fontSize: '1.5rem'}}>📊</span>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
          <small className="text-muted">Three Column Bar Chart</small>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* LSN - Highest */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏛️</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LSN</span>
          </div>
          
          {/* Three bars for LSN */}
          <div className="d-flex gap-2 mb-2">
            {/* Total Cells */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Total</small>
                <small className="fw-bold" style={{fontSize: '12px'}}>34</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '100%',
                    backgroundColor: '#6b7280',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Resolved Cells */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Resolved</small>
                <small className="fw-bold text-success" style={{fontSize: '12px'}}>24</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '71%',
                    backgroundColor: '#10b981',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Manual Cells */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Manual</small>
                <small className="fw-bold text-danger" style={{fontSize: '12px'}}>10</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '29%',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* LCU */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⛰️</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCU</span>
          </div>
          
          <div className="d-flex gap-2 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Total</small>
                <small className="fw-bold" style={{fontSize: '12px'}}>13</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '38%',
                    backgroundColor: '#6b7280',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Resolved</small>
                <small className="fw-bold text-success" style={{fontSize: '12px'}}>11</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '32%',
                    backgroundColor: '#10b981',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Manual</small>
                <small className="fw-bold text-danger" style={{fontSize: '12px'}}>2</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '6%',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* LCI */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌲</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCI</span>
          </div>
          
          <div className="d-flex gap-2 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Total</small>
                <small className="fw-bold" style={{fontSize: '12px'}}>9</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '26%',
                    backgroundColor: '#6b7280',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Resolved</small>
                <small className="fw-bold text-success" style={{fontSize: '12px'}}>7</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '21%',
                    backgroundColor: '#10b981',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Manual</small>
                <small className="fw-bold text-danger" style={{fontSize: '12px'}}>2</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '6%',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SLA */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌾</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>SLA</span>
          </div>
          
          <div className="d-flex gap-2 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Total</small>
                <small className="fw-bold" style={{fontSize: '12px'}}>6</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '18%',
                    backgroundColor: '#6b7280',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Resolved</small>
                <small className="fw-bold text-success" style={{fontSize: '12px'}}>6</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '18%',
                    backgroundColor: '#10b981',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Manual</small>
                <small className="fw-bold text-danger" style={{fontSize: '12px'}}>0</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '0%',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* DBN */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🚢</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>DBN</span>
          </div>
          
          <div className="d-flex gap-2 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Total</small>
                <small className="fw-bold" style={{fontSize: '12px'}}>2</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '6%',
                    backgroundColor: '#6b7280',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Resolved</small>
                <small className="fw-bold text-success" style={{fontSize: '12px'}}>2</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '6%',
                    backgroundColor: '#10b981',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Manual</small>
                <small className="fw-bold text-danger" style={{fontSize: '12px'}}>0</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '0%',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CBG */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏭</span>
            <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>CBG</span>
          </div>
          
          <div className="d-flex gap-2 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Total</small>
                <small className="fw-bold" style={{fontSize: '12px'}}>1</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '3%',
                    backgroundColor: '#6b7280',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Resolved</small>
                <small className="fw-bold text-success" style={{fontSize: '12px'}}>1</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '3%',
                    backgroundColor: '#10b981',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted" style={{fontSize: '11px'}}>Manual</small>
                <small className="fw-bold text-danger" style={{fontSize: '12px'}}>0</small>
              </div>
              <div className="progress" style={{height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb'}}>
                <div 
                  className="progress-bar" 
                  style={{
                    width: '0%',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>



{/*}

          
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
                    <span style={{fontSize: '1.5rem'}}>📊</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
                    <small className="text-muted">Horizontal Bar Chart</small>
                  </div>
                </div>
                
                {provinces.map((province, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted small">{province.icon} {province.name}</span>
                      <span className="fw-bold">{province.cells}</span>
                    </div>
                    <div className="progress" style={{height: '12px', borderRadius: '6px'}}>
                      <div 
                        className="progress-bar" 
                        style={{
                          width: `${(province.cells / 45) * 100}%`,
                          background: `hsl(${index * 60}, 70%, 60%)`,
                          borderRadius: '6px'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>




*/}









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
                  View Fail Cells
                </Button>
                
                <Button variant="success" className="d-flex align-items-center">
                  <span className="me-2">🔄</span>
                  Reset Manual
                </Button>
                
                <Button variant="info" className="d-flex align-items-center">
                  <span className="me-2">📊</span>
                  Export All Sleeping
                </Button>
                
                <Button variant="secondary" className="d-flex align-items-center">
                  <span className="me-2">🔍</span>
                  View Logs
                </Button>
                
                <Button variant="outline-primary" className="d-flex align-items-center">
                  <span className="me-2">⚙️</span>
                  Configuration
                </Button>
                
                <Button variant="outline-warning" className="d-flex align-items-center">
                  <span className="me-2">📧</span>
                  Send Report
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