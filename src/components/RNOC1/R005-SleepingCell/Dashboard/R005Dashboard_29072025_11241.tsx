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


{/* ================================================ ZONE 4: Technical Summary */}




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
          <small className="text-muted">Timeline Progress Chart</small>
        </div>
      </div>
      
      <div className="space-y-4">



{/* LSN Province - Labels Closer to Icon */}
<div className="mb-4">
  <div 
    className="p-3" 
    style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}
  >
    <div className="d-flex align-items-center">
      {/* Icon Circle */}
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center me-3"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#f59e0b',
          flexShrink: 0
        }}
      >
        <div 
          style={{
            width: '20px',
            height: '15px',
            backgroundColor: '#1f2937',
            border: '2px solid #1f2937',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              right: '1px',
              bottom: '1px',
              background: 'linear-gradient(45deg, transparent 40%, #ef4444 40%, #ef4444 60%, transparent 60%)'
            }}
          ></div>
        </div>
      </div>
      
      {/* Province Name */}
      <div className="me-3" style={{ minWidth: '40px' }}>
        <h6 className="fw-bold mb-0" style={{ fontSize: '16px', color: '#1f2937' }}>LSN</h6>
      </div>
      
      {/* Labels - Moved closer to icon */}
      <div className="me-4" style={{ minWidth: '60px' }}>
        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.3' }}>
          <div style={{ marginBottom: '3px' }}>Total</div>
          <div style={{ marginBottom: '3px' }}>Resolved</div>
          <div>Manual</div>
        </div>
      </div>
      
      {/* Bars - Even More Width Available */}
      <div className="flex-grow-1 me-3">
        <div className="d-flex flex-column" style={{ gap: '3px' }}>
          {/* Total bar */}
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#f59e0b',
              width: '100%'
            }}
          ></div>
          
          {/* Resolved bar */}
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#10b981',
              width: '71%'
            }}
          ></div>
          
          {/* Manual bar */}
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#ef4444',
              width: '29%'
            }}
          ></div>
        </div>
      </div>
      
      {/* Numbers */}
      <div style={{ minWidth: '25px' }}>
        <div className="d-flex flex-column" style={{ fontSize: '12px', fontWeight: 'bold', gap: '3px', lineHeight: '1.3' }}>
          <div style={{ color: '#f59e0b', height: '8px', display: 'flex', alignItems: 'center' }}>34</div>
          <div style={{ color: '#10b981', height: '8px', display: 'flex', alignItems: 'center' }}>24</div>
          <div style={{ color: '#ef4444', height: '8px', display: 'flex', alignItems: 'center' }}>10</div>
        </div>
      </div>
    </div>
  </div>
</div>


















{/* LSN Province - With Labels */}
<div className="mb-4">
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
    
    {/* Three bars with labels - no border radius */}
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
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0b', minWidth: '25px' }}>34</span>
      </div>
      
      {/* Resolved bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Resolved</span>
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#10b981',
              width: '71%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '25px' }}>24</span>
      </div>
      
      {/* Manual bar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2" style={{ fontSize: '11px', color: '#6b7280', minWidth: '50px' }}>Manual</span>
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#ef4444',
              width: '29%'
            }}
          ></div>
        </div>
        <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '25px' }}>10</span>
      </div>
    </div>
  </div>
</div>





{/* LSN Province - Clean Version */}
<div className="mb-4">
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
    
    {/* Three bars completely touching each other */}
    <div className="flex-grow-1 me-3">
      <div className="d-flex flex-column">
        {/* Total bar */}
        <div className="d-flex justify-content-between align-items-center">
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#f59e0b',
              borderRadius: '4px 4px 0 0',
              width: '100%'
            }}
          ></div>
          <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#f59e0b', minWidth: '25px' }}>34</span>
        </div>
        
        {/* Resolved bar */}
        <div className="d-flex justify-content-between align-items-center">
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '0',
              width: '71%'
            }}
          ></div>
          <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#10b981', minWidth: '25px' }}>24</span>
        </div>
        
        {/* Manual bar */}
        <div className="d-flex justify-content-between align-items-center">
          <div 
            style={{ 
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '0 0 4px 4px',
              width: '29%'
            }}
          ></div>
          <span className="ms-2 fw-bold" style={{ fontSize: '12px', color: '#ef4444', minWidth: '25px' }}>10</span>
        </div>
      </div>
    </div>
  </div>
</div>














        
        {/* LCU */}
        <div className="mb-5">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-4"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#06b6d4',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '20px', color: 'white' }}>⛰️</span>
            </div>
            
            <div className="me-4" style={{ minWidth: '80px' }}>
              <h4 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1f2937' }}>LCU</h4>
            </div>
            
            <div className="flex-grow-1 me-4">
              <div className="d-flex gap-1">
                <div style={{ height: '24px', backgroundColor: '#3b82f6', borderRadius: '12px', width: '60%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#f59e0b', borderRadius: '12px', width: '25%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#10b981', borderRadius: '12px', width: '15%' }}></div>
              </div>
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Total</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#f59e0b' }}>13</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Resolved</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#10b981' }}>11</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '14px' }}>Manual</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#ef4444' }}>2</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* LCI */}
        <div className="mb-5">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-4"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#8b5cf6',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '20px', color: 'white' }}>🌲</span>
            </div>
            
            <div className="me-4" style={{ minWidth: '80px' }}>
              <h4 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1f2937' }}>LCI</h4>
            </div>
            
            <div className="flex-grow-1 me-4">
              <div className="d-flex gap-1">
                <div style={{ height: '24px', backgroundColor: '#3b82f6', borderRadius: '12px', width: '50%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#f59e0b', borderRadius: '12px', width: '30%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#10b981', borderRadius: '12px', width: '20%' }}></div>
              </div>
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Total</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#f59e0b' }}>9</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Resolved</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#10b981' }}>7</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '14px' }}>Manual</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#ef4444' }}>2</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* SLA */}
        <div className="mb-5">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-4"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#10b981',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '20px', color: 'white' }}>🌾</span>
            </div>
            
            <div className="me-4" style={{ minWidth: '80px' }}>
              <h4 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1f2937' }}>SLA</h4>
            </div>
            
            <div className="flex-grow-1 me-4">
              <div className="d-flex gap-1">
                <div style={{ height: '24px', backgroundColor: '#3b82f6', borderRadius: '12px', width: '30%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#f59e0b', borderRadius: '12px', width: '20%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#10b981', borderRadius: '12px', width: '50%' }}></div>
              </div>
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Total</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#f59e0b' }}>6</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Resolved</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#10b981' }}>6</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '14px' }}>Manual</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#ef4444' }}>0</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* DBN */}
        <div className="mb-5">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-4"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#0ea5e9',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '20px', color: 'white' }}>🚢</span>
            </div>
            
            <div className="me-4" style={{ minWidth: '80px' }}>
              <h4 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1f2937' }}>DBN</h4>
            </div>
            
            <div className="flex-grow-1 me-4">
              <div 
                className="position-relative d-flex"
                style={{ 
                  height: '24px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ width: '40%', height: '100%', backgroundColor: '#3b82f6' }}></div>
                <div style={{ width: '10%', height: '100%', backgroundColor: '#f59e0b' }}></div>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Total</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#f59e0b' }}>2</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Resolved</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#10b981' }}>2</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '14px' }}>Manual</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#ef4444' }}>0</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* CBG */}
        <div className="mb-5">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-4"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#ec4899',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '20px', color: 'white' }}>🏭</span>
            </div>
            
            <div className="me-4" style={{ minWidth: '80px' }}>
              <h4 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1f2937' }}>CBG</h4>
            </div>
            
            <div className="flex-grow-1 me-4">
              <div 
                className="position-relative d-flex"
                style={{ 
                  height: '24px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ width: '60%', height: '100%', backgroundColor: '#3b82f6' }}></div>
                <div style={{ width: '20%', height: '100%', backgroundColor: '#f59e0b' }}></div>
                <div style={{ width: '20%', height: '100%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Total</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#f59e0b' }}>1</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted" style={{ fontSize: '14px' }}>Resolved</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#10b981' }}>1</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '14px' }}>Manual</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: '#ef4444' }}>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-top">
        <div className="d-flex justify-content-center gap-4">
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Detection</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#f59e0b',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Processing</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Resolution</small>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>












<Col lg={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
          <span style={{fontSize: '1.5rem'}}>📊</span>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
          <small className="text-muted">Timeline Progress Chart</small>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* LSN - Highest */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏛️</span>
              <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LSN</span>
            </div>
            <span className="fw-bold" style={{fontSize: '14px', color: '#1f2937'}}>34</span>
          </div>
          
          {/* Single Timeline Bar with 3 segments */}
          <div 
            className="position-relative d-flex"
            style={{ 
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Detection Phase - Blue */}
            <div style={{
              width: '41%', // 14/34
              height: '100%',
              backgroundColor: '#3b82f6'
            }}></div>
            
            {/* Processing Phase - Orange */}
            <div style={{
              width: '29%', // 10/34
              height: '100%',
              backgroundColor: '#f59e0b'
            }}></div>
            
            {/* Resolution Phase - Green */}
            <div style={{
              width: '30%', // 10/34
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>
        
        {/* LCU */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⛰️</span>
              <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCU</span>
            </div>
            <span className="fw-bold" style={{fontSize: '14px', color: '#1f2937'}}>13</span>
          </div>
          
          <div 
            className="position-relative d-flex"
            style={{ 
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{
              width: '46%', // 6/13
              height: '100%',
              backgroundColor: '#3b82f6'
            }}></div>
            <div style={{
              width: '23%', // 3/13
              height: '100%',
              backgroundColor: '#f59e0b'
            }}></div>
            <div style={{
              width: '31%', // 4/13
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>
        
        {/* LCI */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌲</span>
              <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>LCI</span>
            </div>
            <span className="fw-bold" style={{fontSize: '14px', color: '#1f2937'}}>9</span>
          </div>
          
          <div 
            className="position-relative d-flex"
            style={{ 
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{
              width: '44%', // 4/9
              height: '100%',
              backgroundColor: '#3b82f6'
            }}></div>
            <div style={{
              width: '22%', // 2/9
              height: '100%',
              backgroundColor: '#f59e0b'
            }}></div>
            <div style={{
              width: '34%', // 3/9
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>
        
        {/* SLA */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🌾</span>
              <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>SLA</span>
            </div>
            <span className="fw-bold" style={{fontSize: '14px', color: '#1f2937'}}>6</span>
          </div>
          
          <div 
            className="position-relative d-flex"
            style={{ 
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{
              width: '33%', // 2/6
              height: '100%',
              backgroundColor: '#3b82f6'
            }}></div>
            <div style={{
              width: '17%', // 1/6
              height: '100%',
              backgroundColor: '#f59e0b'
            }}></div>
            <div style={{
              width: '50%', // 3/6
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>
        
        {/* DBN */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🚢</span>
              <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>DBN</span>
            </div>
            <span className="fw-bold" style={{fontSize: '14px', color: '#1f2937'}}>2</span>
          </div>
          
          <div 
            className="position-relative d-flex"
            style={{ 
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{
              width: '50%', // 1/2
              height: '100%',
              backgroundColor: '#3b82f6'
            }}></div>
            <div style={{
              width: '0%', // 0/2
              height: '100%',
              backgroundColor: '#f59e0b'
            }}></div>
            <div style={{
              width: '50%', // 1/2
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>
        
        {/* CBG */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>🏭</span>
              <span className="fw-bold" style={{fontSize: '16px', color: '#1f2937'}}>CBG</span>
            </div>
            <span className="fw-bold" style={{fontSize: '14px', color: '#1f2937'}}>1</span>
          </div>
          
          <div 
            className="position-relative d-flex"
            style={{ 
              height: '20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{
              width: '100%', // 1/1
              height: '100%',
              backgroundColor: '#3b82f6'
            }}></div>
            <div style={{
              width: '0%',
              height: '100%',
              backgroundColor: '#f59e0b'
            }}></div>
            <div style={{
              width: '0%',
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-top">
        <div className="d-flex justify-content-center gap-4">
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Detection</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#f59e0b',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Processing</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '2px',
                marginRight: '6px'
              }}
            ></div>
            <small className="text-muted">Resolution</small>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>









  
  <Col lg={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
            <span style={{fontSize: '1.5rem'}}>📊</span>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
            <small className="text-muted">Three Bar Chart</small>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* SLA */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#0ea5e9', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>📊</span>
              </div>
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">

                  <div style={{minWidth: '60px', marginRight: '12px'}}>
                      <h6 className="mb-0 fw-bold">SLA</h6>
                  </div>
              </div>
              
              {/* Three Bars - Adjusted for container height */}
              <div className="d-flex flex-column" style={{gap: '0px !important'}}>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '18%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>6</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '18%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>6</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '0%',
                    minWidth: '4px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* LSN - Highest */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#f59e0b', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>📈</span>
              </div>
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LSN</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>71%</Badge>
              </div>
              
              <div className="d-flex flex-column" style={{gap: '4px'}}>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '100%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>34</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '71%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>24</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '29%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>10</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* LCU */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#10b981', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>📉</span>
              </div>
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LCU</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>85%</Badge>
              </div>
              
              <div className="d-flex flex-column" style={{gap: '4px'}}>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '38%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>13</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '32%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>11</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>2</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* LCI */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#8b5cf6', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>📋</span>
              </div>
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LCI</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>78%</Badge>
              </div>
              
              <div className="d-flex flex-column" style={{gap: '4px'}}>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '26%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>9</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '21%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>7</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>2</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* DBN */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#06b6d4', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>📌</span>
              </div>
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">DBN</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              
              <div className="d-flex flex-column" style={{gap: '4px'}}>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>2</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>2</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '0%',
                    minWidth: '4px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CBG */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px', minHeight: '88px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#ec4899', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🏢</span>
              </div>
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">CBG</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              
              <div className="d-flex flex-column" style={{gap: '4px'}}>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '3%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>1</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '3%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>1</span>
                </div>
                <div className="d-flex align-items-center" style={{gap: '8px'}}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '0%',
                    minWidth: '4px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '40px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-center gap-4">
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '6px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Total</small>
            </div>
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '6px', 
                backgroundColor: '#10b981', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Resolved</small>
            </div>
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '6px', 
                backgroundColor: '#ef4444', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Manual</small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>









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
          
          {/* CBG Province */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
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
  
  <Col lg={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
            <span style={{fontSize: '1.5rem'}}>📊</span>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
            <small className="text-muted">Three Bar Chart</small>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* SLA */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#0ea5e9', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🏛️</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">SLA</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              
              {/* Three Bars inside container */}
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '18%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>6</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '18%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>6</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '0%',
                    minWidth: '4px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* LSN - Highest */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#f59e0b', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🚢</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LSN</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>71%</Badge>
              </div>
              
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '100%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>34</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '71%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>24</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '29%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>10</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* LCU */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#10b981', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>⛰️</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LCU</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>85%</Badge>
              </div>
              
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '38%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>13</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '32%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>11</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>2</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* LCI */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#8b5cf6', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🌲</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">LCI</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>78%</Badge>
              </div>
              
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '26%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>9</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '21%'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>7</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>2</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* DBN */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#06b6d4', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🌾</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">DBN</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>2</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '6%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>2</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '0%',
                    minWidth: '4px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CBG */}
          <div className="d-flex align-items-center p-3 rounded" style={{backgroundColor: '#f8f9fa', marginBottom: '16px'}}>
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '48px', height: '48px', backgroundColor: '#ec4899', color: 'white'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>🏭</span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">CBG</h6>
                <Badge style={{backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', padding: '4px 12px'}}>100%</Badge>
              </div>
              
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    width: '3%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Total</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#f59e0b', marginLeft: 'auto'}}>1</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    width: '3%',
                    minWidth: '8px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Resolved</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#10b981', marginLeft: 'auto'}}>1</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '20px',
                    width: '0%',
                    minWidth: '4px'
                  }}></div>
                  <small className="text-muted" style={{fontSize: '11px', minWidth: '35px'}}>Manual</small>
                  <span className="fw-bold" style={{fontSize: '12px', color: '#ef4444', marginLeft: 'auto'}}>0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-center gap-4">
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '8px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Total</small>
            </div>
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '8px', 
                backgroundColor: '#10b981', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Resolved</small>
            </div>
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '8px', 
                backgroundColor: '#ef4444', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Manual</small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>













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
  




{/* Three Column Province Chart - Improved Version */}
<Col lg={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#fff3e0'}}>
          <span style={{fontSize: '1.5rem'}}>📊</span>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Provinces with Sleeping Cells</h5>
          <small className="text-muted">Three Bar Chart with Better Alignment</small>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* LSN - Highest */}
        <div className="d-flex align-items-center gap-3 mb-4">
          {/* Icon + Province Name - Fixed Width */}
          <div className="d-flex align-items-center" style={{minWidth: '80px', width: '80px'}}>
            <span style={{fontSize: '1.5rem', marginRight: '6px'}}>🏛️</span>
            <span className="fw-bold" style={{fontSize: '15px', color: '#1f2937'}}>LSN</span>
          </div>
          
          {/* Three Bars - Improved Spacing */}
          <div className="flex-grow-1 d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                width: '100%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#f59e0b', minWidth: '25px', textAlign: 'right'}}>34</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                width: '71%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#10b981', minWidth: '25px', textAlign: 'right'}}>24</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '20px',
                width: '29%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#ef4444', minWidth: '25px', textAlign: 'right'}}>10</span>
            </div>
          </div>
        </div>
        
        {/* LCU */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center" style={{minWidth: '80px', width: '80px'}}>
            <span style={{fontSize: '1.5rem', marginRight: '6px'}}>⛰️</span>
            <span className="fw-bold" style={{fontSize: '15px', color: '#1f2937'}}>LCU</span>
          </div>
          
          <div className="flex-grow-1 d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                width: '38%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#f59e0b', minWidth: '25px', textAlign: 'right'}}>13</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                width: '32%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#10b981', minWidth: '25px', textAlign: 'right'}}>11</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '20px',
                width: '6%',
                minWidth: '8px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#ef4444', minWidth: '25px', textAlign: 'right'}}>2</span>
            </div>
          </div>
        </div>
        
        {/* LCI */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center" style={{minWidth: '80px', width: '80px'}}>
            <span style={{fontSize: '1.5rem', marginRight: '6px'}}>🌲</span>
            <span className="fw-bold" style={{fontSize: '15px', color: '#1f2937'}}>LCI</span>
          </div>
          
          <div className="flex-grow-1 d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                width: '26%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#f59e0b', minWidth: '25px', textAlign: 'right'}}>9</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                width: '21%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#10b981', minWidth: '25px', textAlign: 'right'}}>7</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '20px',
                width: '6%',
                minWidth: '8px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#ef4444', minWidth: '25px', textAlign: 'right'}}>2</span>
            </div>
          </div>
        </div>
        
        {/* SLA */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center" style={{minWidth: '80px', width: '80px'}}>
            <span style={{fontSize: '1.5rem', marginRight: '6px'}}>🌾</span>
            <span className="fw-bold" style={{fontSize: '15px', color: '#1f2937'}}>SLA</span>
          </div>
          
          <div className="flex-grow-1 d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                width: '18%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#f59e0b', minWidth: '25px', textAlign: 'right'}}>6</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                width: '18%'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#10b981', minWidth: '25px', textAlign: 'right'}}>6</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '20px',
                width: '0%',
                minWidth: '4px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#ef4444', minWidth: '25px', textAlign: 'right'}}>0</span>
            </div>
          </div>
        </div>
        
        {/* DBN */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center" style={{minWidth: '80px', width: '80px'}}>
            <span style={{fontSize: '1.5rem', marginRight: '6px'}}>🚢</span>
            <span className="fw-bold" style={{fontSize: '15px', color: '#1f2937'}}>DBN</span>
          </div>
          
          <div className="flex-grow-1 d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                width: '6%',
                minWidth: '8px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#f59e0b', minWidth: '25px', textAlign: 'right'}}>2</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                width: '6%',
                minWidth: '8px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#10b981', minWidth: '25px', textAlign: 'right'}}>2</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '20px',
                width: '0%',
                minWidth: '4px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#ef4444', minWidth: '25px', textAlign: 'right'}}>0</span>
            </div>
          </div>
        </div>
        
        {/* CBG */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center" style={{minWidth: '80px', width: '80px'}}>
            <span style={{fontSize: '1.5rem', marginRight: '6px'}}>🏭</span>
            <span className="fw-bold" style={{fontSize: '15px', color: '#1f2937'}}>CBG</span>
          </div>
          
          <div className="flex-grow-1 d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                width: '3%',
                minWidth: '8px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#f59e0b', minWidth: '25px', textAlign: 'right'}}>1</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                width: '3%',
                minWidth: '8px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#10b981', minWidth: '25px', textAlign: 'right'}}>1</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '20px',
                width: '0%',
                minWidth: '4px'
              }}></div>
              <span className="fw-bold" style={{fontSize: '13px', color: '#ef4444', minWidth: '25px', textAlign: 'right'}}>0</span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-center gap-4">
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '8px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Total</small>
            </div>
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '8px', 
                backgroundColor: '#10b981', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Resolved</small>
            </div>
            <div className="d-flex align-items-center">
              <div style={{
                width: '16px', 
                height: '8px', 
                backgroundColor: '#ef4444', 
                borderRadius: '4px', 
                marginRight: '6px'
              }}></div>
              <small style={{fontSize: '11px', color: '#6b7280'}}>Manual</small>
            </div>
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>













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