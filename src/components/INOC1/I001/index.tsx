import React, { useState, useEffect, useRef } from 'react';
import LineChartIPT from './LineChartIPT';
import ASNTable from './ASNTable';
import LastWarningBox from './LastWarningBox';
import ApiMonitorBox from './ApiMonitorBox';
import ConfigPolicerModal from './ConfigPolicerModal';
import ConfirmModal from './ConfirmModal';
import ResultModal from './ResultModal';
import Tab2AddCounter from './Tab2AddCounter';
import Tab3AdminWork from './Tab3AdminWork';
import { mockChartData, mockASNData, mockWarningData, mockApiMonitorData } from './mockData';
import './styles.scss';

interface ASNRowData {
  id: number;
  stt: number;
  asn: string;
  asName: string;
  maxIn: string;
  maxOut: string;
  prefixes?: string[];
}

type ModalState = 'closed' | 'config' | 'confirm' | 'result';
type TabType = 'tab1' | 'tab2' | 'tab3';

const I001IPTransitPolicer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tab1');
  const [chartData, setChartData] = useState(mockChartData);
  const [asnData, setAsnData] = useState<ASNRowData[]>(mockASNData);
  const [warningData, setWarningData] = useState(mockWarningData);
  const [apiMonitorData, setApiMonitorData] = useState(mockApiMonitorData);
  
  const [selectedASN, setSelectedASN] = useState<ASNRowData | null>(null);
  const [expandedASNId, setExpandedASNId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>('closed');
  
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [configDetail, setConfigDetail] = useState<{ as: string; bandwidth: string } | null>(null);
  const [confirmDevices, setConfirmDevices] = useState<string[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  
  const refNotification = useRef<any>();

  // Handle API Monitor alert click
  const handleApiMonitorClick = () => {
    if (apiMonitorData.status >= 80) {
      setSelectedASN(asnData[0]); // Default select first ASN
      setConfigDetail({
        as: asnData[0].asn,
        bandwidth: asnData[0].maxOut
      });
      setSelectedDevices([]);
      setModalState('config');
    }
  };

  // Handle ASN row expand
  const handleASNRowClick = (row: ASNRowData) => {
    if (expandedASNId === row.id) {
      setExpandedASNId(null);
    } else {
      setExpandedASNId(row.id);
    }
  };

  // Handle device checkbox change
  const handleDeviceChange = (device: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices([...selectedDevices, device]);
    } else {
      setSelectedDevices(selectedDevices.filter(d => d !== device));
    }
  };

  // Handle select all devices
  const handleSelectAllDevices = (checked: boolean) => {
    if (checked) {
      const allDevices = [
        'SPG-POP01', 'SPG-POP02',
        'HKG-POP01', 'HKG-POP02', 'HKG-EQX-POP01', 'HKG-EQX-POP02',
        'HCM-ASBR2', 'HCM-ASBR5',
        'HNI-ASBR2', 'HNI-ASBR3',
        'DNG-ASBR2', 'DNG-ASBR3'
      ];
      setSelectedDevices(allDevices);
    } else {
      setSelectedDevices([]);
    }
  };

  // Handle Apply button in Config Modal
  const handleConfigApply = () => {
    if (selectedDevices.length === 0) {
      alert('Vui lòng chọn ít nhất một thiết bị');
      return;
    }
    setConfirmDevices(selectedDevices);
    setModalState('confirm');
  };

  // Handle Confirm Modal apply
  const handleConfirmApply = async () => {
    // Simulate API call to N8n
    setModalState('closed');
    
    // Simulate result
    const result = {
      timestamp: new Date().toLocaleString('vi-VN'),
      selectedDevices: confirmDevices,
      configDetail: configDetail,
      results: confirmDevices.map(device => ({
        device,
        status: Math.random() > 0.2 ? 'success' : 'failed',
        message: Math.random() > 0.2 ? 'Cấu hình thành công' : 'Cấu hình thất bại'
      }))
    };
    
    setResultData(result);
    setModalState('result');
  };

  // Handle Confirm Modal cancel
  const handleConfirmCancel = () => {
    setModalState('config');
  };

  // Handle Config Modal cancel
  const handleConfigCancel = () => {
    setModalState('closed');
    setSelectedASN(null);
    setSelectedDevices([]);
  };

  // Handle Result Modal close
  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setSelectedASN(null);
    setSelectedDevices([]);
    setConfirmDevices([]);
  };

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
