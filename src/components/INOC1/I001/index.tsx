import React, { useState } from 'react';
import Tab1 from './Tab1.jsx';
import Tab2 from './Tab2.jsx';
import Tab3 from './Tab3.jsx';
import './styles.scss';

/**
 * I001IPTransitPolicer - Main component for IP Transit Policer module
 * Manages three tabs:
 * - Tab1: Dashboard & Policer
 * - Tab2: Add Counter - IPT Statistics
 * - Tab3: Admin Work - IPT Monitoring Management
 */
type TabType = 'tab1' | 'tab2' | 'tab3';

const I001IPTransitPolicer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tab1');

  return (
    <div className="i001-wrapper">
      {/* Tab Navigation */}
      <div className="i001-tabs-nav">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'tab1' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab1')}
          >
            Tab 1: Dashboard & Policer
          </button>
          <button
            className={`tab-button ${activeTab === 'tab2' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab2')}
          >
            Tab 2: Add Counter - Thống kê IPT
          </button>
          <button
            className={`tab-button ${activeTab === 'tab3' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab3')}
          >
            Tab 3: Admin Work
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tab1' && <Tab1 />}
      {activeTab === 'tab2' && <Tab2 />}
      {activeTab === 'tab3' && <Tab3 />}
    </div>
  );
};

export default I001IPTransitPolicer;
