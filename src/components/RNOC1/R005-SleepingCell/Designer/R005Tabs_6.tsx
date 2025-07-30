import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBarChart, FiEye, FiSettings } from 'react-icons/fi';

// Import real components - KEEP ORIGINAL CONTENT
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
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-200/50',
      color: '#2563eb'
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: FiEye,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      shadowColor: 'shadow-emerald-200/50',
      color: '#059669'
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: FiSettings,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      shadowColor: 'shadow-purple-200/50',
      color: '#7c3aed'
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navigate to appropriate route - KEEP ORIGINAL ROUTING
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
    // KEEP ORIGINAL REAL COMPONENTS
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
    <div style={{ width: '100%', maxWidth: 'none', margin: '0', padding: '0' }}>
       {/* <div style={{ width: '100%', margin: '0 auto', padding: '0px' }}></div> */}
      {/* Beautiful Connected Tabs - NEW DESIGN */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f8fafc',
        padding: '12px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid #e2e8f0',
        // marginBottom: '32px'
        
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
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Gradient overlay for active tab */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${tab.color}08, ${tab.color}03)`,
                  borderRadius: isFirst ? '12px 0 0 12px' : isLast ? '0 12px 12px 0' : '0'
                }} />
              )}

              {/* Icon with gradient background */}
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

      {/* Real Components Content - KEEP ORIGINAL */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        // margin: '0 24px'
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

        {/* Real Component Content - UNCHANGED */}
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