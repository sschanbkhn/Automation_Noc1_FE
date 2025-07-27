import React, { useState } from 'react';
import { BarChart3, Eye, Settings } from 'lucide-react';

const ModernTabs = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-200/50'
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: Eye,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      shadowColor: 'shadow-emerald-200/50'
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      shadowColor: 'shadow-purple-200/50'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
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
              onClick={() => setActiveTab(tab.id)}
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
                <Icon size={20} strokeWidth={2.5} />
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
      <div className="mt-8 p-8 bg-white rounded-xl shadow-lg">
        {activeTab === 'dashboard' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl mb-6 shadow-xl">
              <BarChart3 size={32} strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Dashboard Overview</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">Comprehensive analytics and real-time metrics for your R005 Sleeping Cell Management system</p>
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-blue-600">Active Cells</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-blue-600">Uptime</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-blue-600">Alerts</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'monitor' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl mb-6 shadow-xl">
              <Eye size={32} strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Real-time Monitoring</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">24/7 surveillance and instant alerts for sleeping cell detection and recovery operations</p>
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600">● Live</div>
                <div className="text-sm text-emerald-600">System Status</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600">2.3s</div>
                <div className="text-sm text-emerald-600">Response Time</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'configuration' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl mb-6 shadow-xl">
              <Settings size={32} strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">System Configuration</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">Advanced settings and customization options for optimal sleeping cell management performance</p>
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-purple-600">Config Rules</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">●</div>
                <div className="text-sm text-purple-600">Auto Recovery</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTabs;