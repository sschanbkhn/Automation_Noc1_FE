import React, { useState } from 'react';
import Tab1DashboardPolicer from './Tab1DashboardPolicer';
import Tab2AddCounter from './Tab2AddCounterNew';
import Tab3AdminWork from './Tab3AdminWorkNew';
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
      {activeTab === 'tab1' && (
        <div className="i001-container tab1-content">
          {/* Header */}
          <div className="i001-header">
            <h2>Quản lý lưu lượng IPTransit - Policer</h2>
          </div>

          {/* Main Content */}
          <div className="i001-content">
            {/* Left Column - Main Chart and Table */}
            <div className="i001-left">
              {/* Line Chart */}
              <div className="i001-section">
                <LineChartIPT data={chartData} />
              </div>

              {/* ASN Table */}
              <div className="i001-section">
                <h3 className="section-title">Các ASN được counter</h3>
                <ASNTable 
                  data={asnData}
                  expandedASNId={expandedASNId}
                  onRowClick={handleASNRowClick}
                />
              </div>
            </div>

            {/* Right Column - Info Boxes */}
            <div className="i001-right">
              {/* API Monitor Box */}
              <div className="i001-info-box">
                <ApiMonitorBox 
                  data={apiMonitorData}
                  onClick={handleApiMonitorClick}
                />
              </div>

              {/* Last Warning Box */}
              <div className="i001-info-box">
                <LastWarningBox data={warningData} />
              </div>
            </div>
          </div>

          {/* Modals */}
          {modalState === 'config' && selectedASN && configDetail && (
            <ConfigPolicerModal
              asn={configDetail.as}
              bandwidth={configDetail.bandwidth}
              selectedDevices={selectedDevices}
              onDeviceChange={handleDeviceChange}
              onSelectAll={handleSelectAllDevices}
              onApply={handleConfigApply}
              onCancel={handleConfigCancel}
            />
          )}

          {modalState === 'confirm' && configDetail && (
            <ConfirmModal
              devices={confirmDevices}
              configDetail={configDetail}
              onApply={handleConfirmApply}
              onCancel={handleConfirmCancel}
            />
          )}

          {modalState === 'result' && resultData && (
            <ResultModal
              result={resultData}
              onClose={handleResultClose}
            />
          )}
        </div>
      )}

      {/* Tab 2: Add Counter - Thống kê IPT */}
      {activeTab === 'tab2' && (
        <div className="i001-container tab2-content">
          <Tab2AddCounter />
        </div>
      )}

      {/* Tab 3: Admin Work */}
      {activeTab === 'tab3' && (
        <div className="i001-container tab3-content">
          <Tab3AdminWork />
        </div>
      )}
    </div>
  );
};

export default I001IPTransitPolicer;
