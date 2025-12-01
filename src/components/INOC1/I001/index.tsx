import React, { useState } from 'react';
import Tab1DashboardPolicer from './Tab1DashboardPolicer';
import Tab2AddCounter from './Tab2AddCounter';
import Tab3AdminWork from './Tab3AdminWork';
import './styles.scss';

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

      {/* Tab 1: Dashboard & Policer */}
      {activeTab === 'tab1' && <Tab1DashboardPolicer />}

      {/* Tab 2: Add Counter - Thống kê IPT */}
      {activeTab === 'tab2' && <Tab2AddCounter />}

      {/* Tab 3: Admin Work */}
      {activeTab === 'tab3' && <Tab3AdminWork />}
    </div>
  );
};

export default I001IPTransitPolicer;
