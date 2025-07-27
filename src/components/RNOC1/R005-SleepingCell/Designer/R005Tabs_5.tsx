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
      {/*
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
      */}

      {/* Modern Connected Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f8fafc',
        padding: '12px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: isActive ? '20px 32px' : '16px 24px',
                backgroundColor: isActive ? 'white' : 'transparent',
                border: isActive ? `2px solid ${tab.borderColor}` : '2px solid transparent',
                borderRadius: isFirst ? '12px 0 0 12px' : isLast ? '0 12px 12px 0' : '0',
                color: isActive ? tab.color : '#64748b',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                transform: isActive ? 'scale(1.08)' : 'scale(0.98)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isActive ? 20 : 1,
                marginTop: isActive ? '-4px' : '0',
                boxShadow: isActive ? `0 8px 25px ${tab.color}20` : 'none',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = tab.bgColor;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
            >
              {/* Top indicator for active tab */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '3px',
                  backgroundColor: tab.color,
                  borderRadius: '0 0 4px 4px'
                }} />
              )}

              {/* Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isActive ? `${tab.color}15` : 'transparent',
                transition: 'all 0.3s ease'
              }}>
                {React.createElement(Icon as any, { 
                  size: 18,
                  color: isActive ? tab.color : '#64748b'
                })}
              </div>

              {/* Label */}
              <span style={{
                fontWeight: isActive ? 'bold' : '600',
                fontSize: '14px'
              }}>
                {tab.label}
              </span>

              {/* Bottom indicator for active tab */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '3px',
                  backgroundColor: tab.color,
                  borderRadius: '4px 4px 0 0'
                }} />
              )}
            </button>
          );
        })}
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
      `}</style>
    </div>
  );
};

export default R005Tabs;