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
        
        {/* ZONE 1: Hero Section */}
        <Row className="g-3 mb-3">
          <Col xl={8} lg={7}>
            <Card style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              height: '180px'
            }}>
              <Card.Body className="p-3 d-flex align-items-center">
                <Row className="w-100 align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center mb-2">
                      <div className="p-2 rounded me-2" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                        <span style={{fontSize: '1.2rem'}}>📱</span>
                      </div>
                      <div>
                        <h4 className="mb-0 fw-bold">Welcome Back</h4>
                        <p className="mb-0 opacity-75 small">RNOC Engineer</p>
                      </div>
                    </div>
                    <Row>
                      <Col md={6}>
                        <p className="mb-1 opacity-75 small">Analyzed</p>
                        <h5 className="fw-bold mb-0">1,250</h5>
                      </Col>
                      <Col md={6}>
                        <p className="mb-1 opacity-75 small">Detected</p>
                        <h5 className="fw-bold mb-0">150</h5>
                      </Col>
                    </Row>
                  </Col>
                  <Col md={4} className="text-center">
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'conic-gradient(#ffffff44 0deg, #ffffff88 120deg, #ffffff44 240deg, #ffffff88 360deg)',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{fontSize: '1.5rem', color: '#667eea'}}>📊</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={4} lg={5}>
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '180px'
            }}>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="p-2 rounded-circle me-2" style={{backgroundColor: '#e3f2fd'}}>
                    <span style={{fontSize: '1rem'}}>📊</span>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">Success Rate Trend</h6>
                    <small className="text-muted">Overview of Performance</small>
                  </div>
                </div>
                <div style={{height: '100px', background: 'linear-gradient(45deg, #667eea22 0%, #764ba233 100%)', borderRadius: '8px'}} className="d-flex align-items-center justify-content-center">
                  <span className="text-muted small">Chart Area</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ZONE 2: Large KPI Cards */}
        <Row className="g-3 mb-3">
          <Col xl={6} lg={6}>
            <Card style={{
              backgroundColor: '#81ecec',
              border: 'none',
              borderRadius: '16px',
              height: '120px'
            }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="text-white mb-1">Connectivity</h6>
                    <h3 className="text-white fw-bold mb-0">142</h3>
                  </div>
                  <Badge bg="danger" className="bg-opacity-25">-5%</Badge>
                </div>
                <div style={{height: '30px', position: 'relative', overflow: 'hidden'}}>
                  <svg width="100%" height="30">
                    <path d="M0,25 Q25,15 50,20 T100,10 L100,30 L0,30 Z" fill="rgba(255,255,255,0.3)"/>
                    <path d="M0,25 Q25,15 50,20 T100,10" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={6} lg={6}>
            <Card style={{
              backgroundColor: '#fd79a8',
              border: 'none',
              borderRadius: '16px',
              height: '120px'
            }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="text-white mb-1">Auto Reset</h6>
                    <h3 className="text-white fw-bold mb-0">125</h3>
                  </div>
                  <Badge bg="success" className="bg-opacity-25">+12%</Badge>
                </div>
                <div style={{height: '30px', position: 'relative', overflow: 'hidden'}}>
                  <svg width="100%" height="30">
                    <path d="M0,20 Q25,10 50,15 T100,8 L100,30 L0,30 Z" fill="rgba(255,255,255,0.3)"/>
                    <path d="M0,20 Q25,10 50,15 T100,8" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ZONE 3: Small KPI Cards */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h6 className="fw-bold mb-0">Today's Performance</h6>
              <small className="text-muted">Sleeping Cell Summary</small>
            </div>
            <Button variant="outline-primary" size="sm">
              📊 Export
            </Button>
          </div>
          
          <div className="p-3" style={{
            backgroundColor: '#f8f9fa', 
            borderRadius: '16px',
            border: '1px solid #e9ecef'
          }}>
            <Row className="g-3">
              <Col xl={3} lg={6} md={6}>
                <div className="text-center p-3" style={{
                  backgroundColor: '#ffebf0', 
                  borderRadius: '12px'
                }}>
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                       style={{width: '50px', height: '50px', backgroundColor: '#e91e63'}}>
                    <span style={{fontSize: '1.5rem', color: '#fff'}}>📁</span>
                  </div>
                  <h4 className="fw-bold mb-1" style={{color: '#e91e63'}}>5/5</h4>
                  <p className="text-muted mb-1 small">OSS Files</p>
                  <small className="text-success fw-medium">+19%</small>
                </div>
              </Col>

              <Col xl={3} lg={6} md={6}>
                <div className="text-center p-3" style={{
                  backgroundColor: '#fff8e7', 
                  borderRadius: '12px'
                }}>
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                       style={{width: '50px', height: '50px', backgroundColor: '#ff9800'}}>
                    <span style={{fontSize: '1.5rem', color: '#fff'}}>🔍</span>
                  </div>
                  <h4 className="fw-bold mb-1" style={{color: '#ff9800'}}>1,250</h4>
                  <p className="text-muted mb-1 small">Analyzed</p>
                  <small className="text-success fw-medium">+5%</small>
                </div>
              </Col>

              <Col xl={3} lg={6} md={6}>
                <div className="text-center p-3" style={{
                  backgroundColor: '#e8f8f0', 
                  borderRadius: '12px'
                }}>
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                       style={{width: '50px', height: '50px', backgroundColor: '#4caf50'}}>
                    <span style={{fontSize: '1.5rem', color: '#fff'}}>⚠️</span>
                  </div>
                  <h4 className="fw-bold mb-1" style={{color: '#4caf50'}}>150</h4>
                  <p className="text-muted mb-1 small">Detected</p>
                  <small className="text-success fw-medium">+12%</small>
                </div>
              </Col>

              <Col xl={3} lg={6} md={6}>
                <div className="text-center p-3" style={{
                  backgroundColor: '#f3e8ff', 
                  borderRadius: '12px'
                }}>
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                       style={{width: '50px', height: '50px', backgroundColor: '#9c27b0'}}>
                    <span style={{fontSize: '1.5rem', color: '#fff'}}>❌</span>
                  </div>
                  <h4 className="fw-bold mb-1" style={{color: '#9c27b0'}}>25</h4>
                  <p className="text-muted mb-1 small">Manual Required</p>
                  <small className="text-danger fw-medium">0.5%</small>
                </div>
              </Col>
            </Row>
          </div>
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