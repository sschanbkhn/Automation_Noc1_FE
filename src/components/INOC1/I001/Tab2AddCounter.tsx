import React, { useState } from 'react';
import { mockTab2ASNData, ASNTab2Data } from './mockDataTab2';
import TopASNTable from './TopASNTable';
import AddCounterModal from './AddCounterModal';
import ConfirmApplyModal from './ConfirmApplyModal';
import ResultDisplayModal from './ResultDisplayModal';

type ModalState = 'closed' | 'addCounter' | 'confirm' | 'result';

interface AddCounterData {
  asn: string;
  asName: string;
  selectedPrefixes: string[];
  selectedDevices: string[];
}

interface ResultData {
  timestamp: string;
  asn: string;
  asName: string;
  prefixes: string[];
  devices: string[];
  results: Array<{
    device: string;
    status: 'success' | 'failed';
    message: string;
  }>;
}

const Tab2AddCounter: React.FC = () => {
  const [asnData, setAsnData] = useState<ASNTab2Data[]>(mockTab2ASNData);
  const [expandedASNId, setExpandedASNId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [addCounterData, setAddCounterData] = useState<AddCounterData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handle ASN row expand
  const handleASNRowClick = (row: ASNTab2Data) => {
    if (expandedASNId === row.id) {
      setExpandedASNId(null);
    } else {
      setExpandedASNId(row.id);
    }
  };

  // Handle Add Counter button click
  const handleAddCounterClick = () => {
    setModalState('addCounter');
  };

  // Handle Add Counter Modal apply
  const handleAddCounterApply = (data: AddCounterData) => {
    setAddCounterData(data);
    setModalState('confirm');
  };

  // Handle Add Counter Modal cancel
  const handleAddCounterCancel = () => {
    setModalState('closed');
    setAddCounterData(null);
  };

  // Handle Confirm Apply Modal apply
  const handleConfirmApply = async () => {
    if (!addCounterData) return;

    // Simulate API call to N8n
    setModalState('closed');

    // Simulate result
    const result: ResultData = {
      timestamp: new Date().toLocaleString('vi-VN'),
      asn: addCounterData.asn,
      asName: addCounterData.asName,
      prefixes: addCounterData.selectedPrefixes,
      devices: addCounterData.selectedDevices,
      results: addCounterData.selectedDevices.map((device) => ({
        device,
        status: Math.random() > 0.15 ? 'success' : 'failed',
        message:
          Math.random() > 0.15 ? 'Cấu hình thành công' : 'Cấu hình thất bại'
      }))
    };

    setResultData(result);
    setModalState('result');
  };

  // Handle Confirm Apply Modal cancel
  const handleConfirmCancel = () => {
    setModalState('addCounter');
  };

  // Handle Result Modal close
  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setAddCounterData(null);
  };

  return (
    <div className="tab2-container">
      {/* Header Section */}
      <div className="tab2-header">
        <div className="header-left">
          <h3 className="tab2-title">Thống kê IPT - TOP 20 ASN</h3>
          <p className="tab2-subtitle">Lưu lượng cao nhất theo ngày</p>
        </div>
        <div className="header-right">
          <div className="date-picker-group">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-picker-input"
            />
          </div>
          <button className="btn-add-counter" onClick={handleAddCounterClick}>
            + Add Counter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="tab2-table-section">
        <TopASNTable
          data={asnData}
          expandedASNId={expandedASNId}
          onRowClick={handleASNRowClick}
        />
      </div>

      {/* Modals */}
      {modalState === 'addCounter' && (
        <AddCounterModal
          asnList={asnData}
          onApply={handleAddCounterApply}
          onCancel={handleAddCounterCancel}
        />
      )}

      {modalState === 'confirm' && addCounterData && (
        <ConfirmApplyModal
          asn={addCounterData.asn}
          asName={addCounterData.asName}
          prefixes={addCounterData.selectedPrefixes}
          devices={addCounterData.selectedDevices}
          onApply={handleConfirmApply}
          onCancel={handleConfirmCancel}
        />
      )}

      {modalState === 'result' && resultData && (
        <ResultDisplayModal result={resultData} onClose={handleResultClose} />
      )}
    </div>
  );
};

export default Tab2AddCounter;
