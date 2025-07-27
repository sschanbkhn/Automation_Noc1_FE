import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBarChart, FiEye, FiSettings } from 'react-icons/fi';

// Import real components
import Dashboard from '../Dashboard/R005Dashboard';
import Monitor from '../Monitor/R005Monitor';
import Configuration from '../Configuration/R005Configuration';

const R005Tabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/monitor')) return 'monitor';
    if (path.includes('/configuration')) return 'configuration';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiBarChart,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: FiEye,
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0'
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: FiSettings,
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      borderColor: '#c4b5fd'
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navigate to appropriate route
    switch (tabId) {
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'monitor':
        return <Monitor />;
      case 'configuration':
        return <Configuration />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* Success Banner */}
      <div style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 24px',
        marginBottom: '24px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        ✅ STEP 5: Real Components Integration! Active Tab: {activeTab} | URL: {location.pathname}
      </div>

      {/* Beautiful Modern Tabs */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '8px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '20px'
        }} />
        
        <div style={{ display: 'flex', position: 'relative', zIndex: 2 }}>
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
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: isActive ? '18px 28px' : '14px 24px',
                  backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: isFirst && isLast ? '16px' : isFirst ? '16px 0 0 16px' : isLast ? '0 16px 16px 0' : '0',
                  color: isActive ? tab.color : 'rgba(255,255,255,0.9)',
                  fontWeight: isActive ? 'bold' : '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transform: isActive ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isActive ? 10 : 1,
                  boxShadow: isActive ? '0 8px 32px rgba(0,0,0,0.2)' : 'none',
                  position: 'relative',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  margin: '0 2px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Shimmer effect for active tab */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 2s infinite',
                    borderRadius: '16px'
                  }} />
                )}

                {/* Icon with gradient background */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: isActive ? 
                    `linear-gradient(135deg, ${tab.color}20, ${tab.color}10)` : 
                    'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                  border: isActive ? `2px solid ${tab.color}30` : '2px solid rgba(255,255,255,0.2)'
                }}>
                  {React.createElement(Icon as any, { 
                    size: 20,
                    color: isActive ? tab.color : '#ffffff',
                    strokeWidth: 2.5
                  })}
                </div>

                {/* Label with better typography */}
                <span style={{
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  textShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: tab.color,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${tab.color}50`,
                    animation: 'pulse 2s infinite'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Components Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'fadeIn 0.3s ease-in-out'
      }}>
        {/* Content Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#fafbfc'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: tabs.find(t => t.id === activeTab)?.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${tabs.find(t => t.id === activeTab)?.borderColor}`
            }}>
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon as any, { 
                size: 24,
                color: tabs.find(t => t.id === activeTab)?.color
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
      `}</style>
    </div>
  );
};

export default R005Tabs;