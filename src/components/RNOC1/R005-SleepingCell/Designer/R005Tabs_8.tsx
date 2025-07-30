import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBarChart, FiEye, FiSettings } from 'react-icons/fi';

// Import real components - with fallback handling
let Dashboard, Monitor, Configuration;

try {
  Dashboard = require('../Dashboard/R005Dashboard').default;
} catch {
  Dashboard = null;
}

try {
  Monitor = require('../Monitor/R005Monitor').default;
} catch {
  Monitor = null;
}

try {
  Configuration = require('../Configuration/R005Configuration').default;
} catch {
  Configuration = null;
}

const R005Tabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    console.log('🔍 Current path:', path); // DEBUG
    if (path.includes('/monitor')) return 'monitor';
    if (path.includes('/configuration')) return 'configuration';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
    console.log('🔄 Active tab updated to:', getActiveTab()); // DEBUG
  }, [location.pathname]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiBarChart,
      color: '#2563eb'
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: FiEye,
      color: '#059669'
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: FiSettings,
      color: '#7c3aed'
    }
  ];

  const handleTabClick = (tabId: string) => {
    console.log('🖱️ Tab clicked:', tabId); // DEBUG
    setActiveTab(tabId);
    
    // DISABLE NAVIGATION for testing
    // switch (tabId) {
    //   case 'dashboard':
    //     navigate('/sleeping-cell');
    //     break;
    //   case 'monitor':
    //     navigate('/sleeping-cell/monitor');
    //     break;
    //   case 'configuration':
    //     navigate('/sleeping-cell/configuration');
    //     break;
    // }
  };

  const renderContent = () => {
    console.log('🎨 Rendering content for tab:', activeTab); // DEBUG
    
    switch (activeTab) {
      case 'dashboard':
        // Always show fallback content for testing
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              borderRadius: '16px',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}>
              {React.createElement(FiBarChart as any, { size: 32, strokeWidth: 2 })}
            </div>
            <h2 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Dashboard Overview
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '18px',
              maxWidth: '448px',
              margin: '0 auto',
              lineHeight: '1.75'
            }}>
              Comprehensive analytics and real-time metrics for your R005 Sleeping Cell Management system
            </p>
            <div style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              maxWidth: '448px',
              margin: '24px auto 0 auto'
            }}>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2563eb'
                }}>
                  24
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#2563eb'
                }}>
                  Active Cells
                </div>
              </div>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2563eb'
                }}>
                  98%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#2563eb'
                }}>
                  Uptime
                </div>
              </div>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2563eb'
                }}>
                  5
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#2563eb'
                }}>
                  Alerts
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'monitor':
        // Always show fallback content for testing
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              borderRadius: '16px',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}>
              {React.createElement(FiEye as any, { size: 32, strokeWidth: 2 })}
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Real-time Monitoring
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              maxWidth: '500px',
              margin: '0 auto 40px auto',
              lineHeight: '1.6'
            }}>
              24/7 surveillance and instant alerts for sleeping cell detection and recovery operations
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{
                backgroundColor: '#ecfdf5',
                padding: '24px 32px',
                borderRadius: '16px',
                border: '1px solid #a7f3d0',
                minWidth: '140px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#059669',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%',
                    display: 'inline-block'
                  }}></span>
                  Live
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#047857',
                  fontWeight: '500'
                }}>
                  System Status
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#ecfdf5',
                padding: '24px 32px',
                borderRadius: '16px',
                border: '1px solid #a7f3d0',
                minWidth: '140px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#059669',
                  marginBottom: '4px'
                }}>
                  2.3s
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#047857',
                  fontWeight: '500'
                }}>
                  Response Time
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'configuration':
        // Always show fallback content for testing
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              borderRadius: '16px',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
            }}>
              {React.createElement(FiSettings as any, { size: 32, strokeWidth: 2 })}
            </div>
            <h2 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              System Configuration
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '18px',
              maxWidth: '448px',
              margin: '0 auto',
              lineHeight: '1.75'
            }}>
              Advanced settings and customization options for optimal sleeping cell management performance
            </p>
            <div style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              maxWidth: '384px',
              margin: '24px auto 0 auto'
            }}>
              <div style={{
                backgroundColor: '#f3e8ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #c4b5fd'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#7c3aed'
                }}>
                  12
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#7c3aed'
                }}>
                  Config Rules
                </div>
              </div>
              <div style={{
                backgroundColor: '#f3e8ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #c4b5fd'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#7c3aed'
                }}>
                  ●
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#7c3aed'
                }}>
                  Auto Recovery
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <h2>R005 Dashboard</h2>
            <p>Loading dashboard content...</p>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', margin: '0', padding: '0' }}>
      {/* Beautiful Connected Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f8fafc',
        padding: '12px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '32px'
      }}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '160px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease-out',
                border: '2px solid',
                transform: isActive ? 'scale(1.15)' : 'scale(0.95)',
                borderRadius: isFirst ? '12px 0 0 12px' : isLast ? '0 12px 12px 0' : '0',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                borderColor: isActive ? '#bfdbfe' : 'transparent',
                color: isActive ? tab.color : '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                zIndex: isActive ? 20 : 1,
                marginTop: isActive ? '-8px' : '0',
                padding: isActive ? '20px 32px' : '16px 24px',
                boxShadow: isActive ? `0 8px 25px ${tab.color}20` : 'none',
                outline: 'none'
              }}
            >
              {/* Icon */}
              <div style={{
                position: 'relative',
                padding: '10px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                background: isActive ? 
                  `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` : 
                  '#e2e8f0',
                color: isActive ? 'white' : '#64748b',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isActive ? `0 4px 12px ${tab.color}30` : 'none'
              }}>
                {React.createElement(Icon as any, { 
                  size: 20,
                  strokeWidth: 2.5
                })}
              </div>

              {/* Label */}
              <span style={{
                position: 'relative',
                fontWeight: 'bold',
                fontSize: '14px',
                letterSpacing: '0.5px',
                color: isActive ? '#1f2937' : '#64748b'
              }}>
                {tab.label}
              </span>

              {/* Bottom indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '64px',
                  height: '6px',
                  background: `linear-gradient(90deg, ${tab.color}, ${tab.color}cc)`,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: `0 0 8px ${tab.color}50`
                }} />
              )}

              {/* Top accent */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '48px',
                  height: '4px',
                  background: `linear-gradient(90deg, ${tab.color}, ${tab.color}cc)`,
                  borderRadius: '0 0 4px 4px'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Content Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${tabs.find(t => t.id === activeTab)?.color}15, ${tabs.find(t => t.id === activeTab)?.color}08)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${tabs.find(t => t.id === activeTab)?.color}25`
            }}>
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon as any, { 
                size: 28,
                color: tabs.find(t => t.id === activeTab)?.color,
                strokeWidth: 2
              })}
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1a202c'
              }}>
                R005 - {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: '#64748b',
                fontSize: '14px'
              }}>
                {activeTab === 'dashboard' && 'Sleeping cell detection and recovery overview'}
                {activeTab === 'monitor' && 'Real-time monitoring and system status'}
                {activeTab === 'configuration' && 'System settings and automation rules'}
              </p>
            </div>
          </div>
        </div>

        {/* Real Component Content */}
        <div style={{ 
          minHeight: '400px',
          position: 'relative'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default R005Tabs;