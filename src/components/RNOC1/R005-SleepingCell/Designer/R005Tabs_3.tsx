import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Use react-icons instead of lucide-react for compatibility
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
    return 'dashboard'; // default
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
  const handleTabClick = (tab: any) => {
    setActiveTab(tab.id);
    navigate(tab.route);
  };

  return (
    <div className="w-full mx-auto">
      {/* Modern Connected Tab Navigation */}
      <div className="flex bg-gray-50 p-3 rounded-2xl shadow-inner border border-gray-200 mb-6">
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
                {React.createElement(Icon as any, { size: 20 })}
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

      {/* Tab Content with Real Components */}
      <div className="bg-white rounded-xl shadow-lg">
        {activeTab === 'dashboard' && (
          <div className="p-0">
            <Dashboard />
          </div>
        )}
        
        {activeTab === 'monitor' && (
          <div className="p-0">
            <Monitor />
          </div>
        )}
        
        {activeTab === 'configuration' && (
          <div className="p-0">
            <Configuration />
          </div>
        )}
      </div>
    </div>
  );
};

export default R005Tabs;