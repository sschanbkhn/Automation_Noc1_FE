// src/components/RNOC1/R005-SleepingCell/HomeSleepingCell.tsx
import React from 'react';
import { Container, Nav, Tab, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard/R005Dashboard';
import Monitor from './Monitor/R005Monitor';
import Configuration from './Configuration/R005Configuration';
import './R005HomeSleepingCell.module.scss';
import R005Header from './Designer/R005Header';
import R005Tabs from './Designer/R005Tabs';

const HomeSleepingCell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/monitor')) return 'monitor';
    if (path.includes('/configuration')) return 'configuration';
    return 'dashboard'; // default
  };

  const activeTab = getActiveTab();

  // Handle tab change
  const handleTabSelect = (tabKey: string | null) => {
    if (!tabKey) return;
    
    switch (tabKey) {
      case 'dashboard':
        navigate('/sleeping-cell');
        break;
      case 'monitor':
        navigate('/sleeping-cell/monitor');
        break;
      case 'configuration':
        navigate('/sleeping-cell/configuration');
        break;
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fb',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <Container fluid>

    
    
    
    
        {/* Header Section */}
       {/*
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <div 
              className="p-3 rounded-circle me-3"
              style={{
                backgroundColor: '#667eea',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <span style={{fontSize: '1.5rem', color: 'white'}}>📱</span>
            </div>
            <div>
              <h2 className="fw-bold text-dark mb-1">
                R005 - Sleeping Cell Management
              </h2>
              <p className="text-muted mb-0">
                Automated detection and recovery system for dormant cells
              </p>
            </div>
          </div>
        </div>
*/}


{/* New Modern Header */}
<R005Header />




        {/* Tab Navigation */}
        <R005Tabs />



        
        <Card className="border-0 shadow-sm">
          <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
            <Card.Header className="bg-white border-bottom">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="dashboard"
                    className="px-4 py-3 fw-medium"
                    style={{
                      color: activeTab === 'dashboard' ? '#667eea' : '#6c757d',
                      borderColor: activeTab === 'dashboard' ? '#667eea' : 'transparent',
                      backgroundColor: activeTab === 'dashboard' ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                    }}
                  >
                    <span className="me-2">📊</span>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                
                <Nav.Item>
                  <Nav.Link 
                    eventKey="monitor"
                    className="px-4 py-3 fw-medium"
                    style={{
                      color: activeTab === 'monitor' ? '#667eea' : '#6c757d',
                      borderColor: activeTab === 'monitor' ? '#667eea' : 'transparent',
                      backgroundColor: activeTab === 'monitor' ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                    }}
                  >
                    <span className="me-2">👁️</span>
                    Monitor
                  </Nav.Link>
                </Nav.Item>
                
                <Nav.Item>
                  <Nav.Link 
                    eventKey="configuration"
                    className="px-4 py-3 fw-medium"
                    style={{
                      color: activeTab === 'configuration' ? '#667eea' : '#6c757d',
                      borderColor: activeTab === 'configuration' ? '#667eea' : 'transparent',
                      backgroundColor: activeTab === 'configuration' ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                    }}
                  >
                    <span className="me-2">⚙️</span>
                    Configuration
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            {/* Tab Content  */}
            <Card.Body className="p-0">
              <Tab.Content>
                <Tab.Pane eventKey="dashboard">
                  <Dashboard />
                </Tab.Pane>
                
                <Tab.Pane eventKey="monitor">
                  <Monitor />
                </Tab.Pane>
                
                <Tab.Pane eventKey="configuration">
                  <Configuration />
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Tab.Container>
        </Card>

 











      </Container>
    </div>
  );
};

export default HomeSleepingCell;