import React, { useState, useEffect } from 'react';
// Import icons từ react-icons/fi
import { FiBarChart, FiEye, FiSettings } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

interface TabContent {
  id: string;
  label: string;
  icon: any; // Simple fix - use any type
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  route: string; // Add route for navigation
}

const R005ModernTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/monitor')) return 'monitor';
    if (path.includes('/configuration')) return 'configuration';
    return 'dashboard'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const tabs: TabContent[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiBarChart,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-200/50',
      route: '/sleeping-cell'
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
      route: '/sleeping-cell/monitor'
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
      route: '/sleeping-cell/configuration'
    }
  ];

  // Handle tab click with navigation
  const handleTabClick = (tab: TabContent) => {
    setActiveTab(tab.id);
    navigate(tab.route);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Connected Tab Navigation */}
      <div className="flex bg-gray-50 p-3 rounded-2xl shadow-inner border border-gray-200">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                relative flex items-center space-x-3 min-w-[160px]
                font-semibold transition-all duration-300 ease-out
                border-2 transform
                ${isFirst ? 'rounded-l-xl' : ''}
                ${isLast ? 'rounded-r-xl' : ''}
                ${isActive 
                  ? `${tab.bgColor} ${tab.borderColor} ${tab.textColor} shadow-lg ${tab.shadowColor} scale-[1.15] z-20 px-8 py-6 -mt-2` 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md hover:scale-[1.02] px-6 py-4 scale-[0.95]'
                }
              `}
            >
              {/* Gradient overlay for active tab */}
              {isActive && (
                <div className={`
                  absolute inset-0 bg-gradient-to-r ${tab.gradient} 
                  opacity-5 ${isFirst ? 'rounded-l-xl' : ''} ${isLast ? 'rounded-r-xl' : ''}
                `} />
              )}
              
              {/* Icon with distinct styling */}
              <div className={`
                relative p-2.5 rounded-lg transition-all duration-300
                ${isActive 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-110` 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }
              `}>
                {React.createElement(Icon as any, { 
                  size: 20, 
                  style: { strokeWidth: 2.5 }
                })}
              </div>
              
              {/* Label with better typography */}
              <span className={`
                relative font-bold text-sm tracking-wide
                ${isActive ? 'text-gray-800' : 'text-gray-600'}
              `}>
                {tab.label}
              </span>
              
              {/* Color-coded bottom indicator */}
              {isActive && (
                <div className={`
                  absolute -bottom-1 left-1/2 transform -translate-x-1/2
                  w-16 h-1.5 bg-gradient-to-r ${tab.gradient} rounded-full
                  shadow-lg
                `} />
              )}

              {/* Top accent line */}
              {isActive && (
                <div className={`
                  absolute -top-1 left-1/2 transform -translate-x-1/2
                  w-12 h-1 bg-gradient-to-r ${tab.gradient} rounded-full
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6 p-6 bg-white rounded-xl shadow-lg">
        {activeTab === 'dashboard' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl mb-4 shadow-xl">
              {React.createElement(FiBarChart as any, { size: 28 })}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">R005 Dashboard</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              Comprehensive overview of sleeping cell detection and recovery metrics
            </p>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <div className="text-sm font-medium text-blue-700">Active Cells</div>
                <div className="text-xs text-blue-500 mt-1">Currently monitored</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
                <div className="text-sm font-medium text-blue-700">System Uptime</div>
                <div className="text-xs text-blue-500 mt-1">Last 30 days</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-sm font-medium text-blue-700">Active Alerts</div>
                <div className="text-xs text-blue-500 mt-1">Requires attention</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'monitor' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl mb-4 shadow-xl">
              {React.createElement(FiEye as any, { size: 28 })}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Real-time Monitoring</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              24/7 surveillance and instant alerts for sleeping cell detection
            </p>
            
            {/* Monitor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xl font-bold text-emerald-600">LIVE</span>
                </div>
                <div className="text-sm font-medium text-emerald-700">System Status</div>
                <div className="text-xs text-emerald-500 mt-1">All systems operational</div>
              </div>
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600 mb-2">1.2s</div>
                <div className="text-sm font-medium text-emerald-700">Response Time</div>
                <div className="text-xs text-emerald-500 mt-1">Average detection time</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'configuration' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl mb-4 shadow-xl">
              {React.createElement(FiSettings as any, { size: 28 })}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">System Configuration</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              Advanced settings and customization for optimal performance
            </p>
            
            {/* Configuration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">15</div>
                <div className="text-sm font-medium text-purple-700">Config Rules</div>
                <div className="text-xs text-purple-500 mt-1">Active automation rules</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-lg font-bold text-purple-600">AUTO</span>
                </div>
                <div className="text-sm font-medium text-purple-700">Recovery Mode</div>
                <div className="text-xs text-purple-500 mt-1">Automated cell recovery enabled</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default R005ModernTabs;