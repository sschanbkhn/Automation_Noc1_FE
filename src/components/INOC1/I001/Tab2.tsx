import React, { useState, useMemo } from 'react';
import { mockTab2ASNData, ASNTab2Data, DEVICES_LIST } from './mockDataTab2';
import Tab2Service from 'services/Tab2Service';

// ============================================
// TYPE DEFINITIONS & INTERFACES
// ============================================

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

// ============================================
// SUB COMPONENTS - DATA TABLES
// ============================================

const TopASNTable: React.FC<{
  data: ASNTab2Data[];
  expandedASNId: number | null;
  onRowClick: (row: ASNTab2Data) => void;
}> = ({ data, expandedASNId, onRowClick }) => (
  <div className="top-asn-table-container">
    <table className="top-asn-table">
      <thead>
        <tr>
          <th style={{ width: '60px' }}>STT</th>
          <th style={{ width: '120px' }}>ASN</th>
          <th>AS Name</th>
          <th style={{ width: '160px' }}>Max In</th>
          <th style={{ width: '160px' }}>Max Out</th>
          <th style={{ width: '40px' }}>Chi tiết</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <React.Fragment key={row.id}>
            <tr className="asn-row" onClick={() => onRowClick(row)}>
              <td className="text-center">{row.stt}</td>
              <td className="font-mono">{row.asn}</td>
              <td>{row.asName}</td>
              <td className="text-right">
                <span className="badge badge-in">{row.maxIn}</span>
              </td>
              <td className="text-right">
                <span className="badge badge-out">{row.maxOut}</span>
              </td>
              <td className="text-center">
                <span className="expand-icon">
                  {expandedASNId === row.id ? '▼' : '▶'}
                </span>
              </td>
            </tr>

            {expandedASNId === row.id && row.prefixes && (
              <tr className="prefix-row">
                <td colSpan={6}>
                  <div className="prefix-container">
                    <h4>Chi tiết Prefix:</h4>
                    <div className="prefix-details-list">
                      {row.prefixes.map((prefix, idx) => (
                        <div key={idx} className="prefix-detail-item">
                          <div className="prefix-info">
                            <div className="prefix-name">
                              <span className="prefix-icon">📍</span>
                              <code>{prefix.prefix}</code>
                              {prefix.isCountered && (
                                <span className="countered-badge">Đã Counter</span>
                              )}
                            </div>
                          </div>
                          <div className="prefix-traffic">
                            <div className="traffic-item">
                              <span className="traffic-label">Max In:</span>
                              <span className="traffic-value in">{prefix.maxIn}</span>
                            </div>
                            <div className="traffic-item">
                              <span className="traffic-label">Max Out:</span>
                              <span className="traffic-value out">{prefix.maxOut}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================
// MODAL COMPONENTS - API POPUPS
// ============================================

const AddCounterModal: React.FC<{
  asnList: ASNTab2Data[];
  onApply: (data: AddCounterData) => void;
  onCancel: () => void;
}> = ({ asnList, onApply, onCancel }) => {
  const [inputASN, setInputASN] = useState('');
  const [inputASName, setInputASName] = useState('');
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const foundASN = useMemo(() => {
    if (!inputASN.trim()) return null;
    return asnList.find((a) => a.asn.toUpperCase() === inputASN.trim().toUpperCase());
  }, [inputASN, asnList]);

  const availablePrefixes = useMemo(() => {
    if (!foundASN) return [];
    return foundASN.prefixes || [];
  }, [foundASN]);

  const isFormValid = 
    inputASN.trim() !== '' && 
    inputASName.trim() !== '' && 
    selectedPrefixes.length > 0 && 
    selectedDevices.length > 0;

  const handleASNChange = (value: string) => {
    setInputASN(value);
    setInputASName('');
    setSelectedPrefixes([]);
    const found = asnList.find((a) => a.asn.toUpperCase() === value.toUpperCase());
    if (found) {
      setInputASName(found.asName);
    }
  };

  const handlePrefixChange = (prefix: string, checked: boolean) => {
    if (checked) {
      setSelectedPrefixes([...selectedPrefixes, prefix]);
    } else {
      setSelectedPrefixes(selectedPrefixes.filter((p) => p !== prefix));
    }
  };

  const handleDeviceChange = (device: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices([...selectedDevices, device]);
    } else {
      setSelectedDevices(selectedDevices.filter((d) => d !== device));
    }
  };

  const handleSelectAllDevices = (checked: boolean) => {
    if (checked) {
      setSelectedDevices([...DEVICES_LIST]);
    } else {
      setSelectedDevices([]);
    }
  };

  const isAllDevicesSelected = selectedDevices.length === DEVICES_LIST.length;

  const handleApply = () => {
    if (isFormValid) {
      onApply({
        asn: inputASN.trim(),
        asName: inputASName.trim(),
        selectedPrefixes,
        selectedDevices
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content add-counter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Add Counter</h3>
            <p className="modal-subtitle">Thêm counter cho ASN mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="add-counter-section">
          <h4 className="section-header">Thông tin ASN</h4>
          <div className="asn-input-group">
            <div className="input-field">
              <label htmlFor="asn-input">ASN</label>
              <input
                id="asn-input"
                type="text"
                placeholder="e.g., AS64512"
                value={inputASN}
                onChange={(e) => handleASNChange(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-field">
              <label htmlFor="asname-input">AS Name</label>
              <input
                id="asname-input"
                type="text"
                placeholder="e.g., TECHNET-AS"
                value={inputASName}
                onChange={(e) => setInputASName(e.target.value)}
                className="form-input"
                disabled={!!foundASN}
              />
            </div>
          </div>
        </div>

        {availablePrefixes.length > 0 && (
          <div className="add-counter-section">
            <h4 className="section-header">Chọn Prefix</h4>
            <div className="prefix-selection-list">
              {availablePrefixes.map((prefix) => {
                const isDisabled = prefix.isCountered;
                return (
                  <label key={prefix.prefix} className={`prefix-selection-item ${isDisabled ? 'disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedPrefixes.includes(prefix.prefix)}
                      onChange={(e) => !isDisabled && handlePrefixChange(prefix.prefix, e.target.checked)}
                      disabled={isDisabled}
                    />
                    <div className="prefix-selection-content">
                      <div className="prefix-text">
                        <code>{prefix.prefix}</code>
                        {isDisabled && <span className="disabled-badge">Đã được counter</span>}
                      </div>
                      <div className="prefix-traffic-info">
                        <span className="traffic-badge in">Max In: {prefix.maxIn}</span>
                        <span className="traffic-badge out">Max Out: {prefix.maxOut}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="add-counter-section">
          <div className="device-header-group">
            <h4 className="section-header">Chọn thiết bị (12 box)</h4>
            <button className="select-all-button">Chọn tất cả</button>
          </div>

          <div className="select-all-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAllDevicesSelected}
                onChange={(e) => handleSelectAllDevices(e.target.checked)}
              />
              <span className="select-all-text">Chọn tất cả thiết bị</span>
            </label>
            <span className="device-count">{selectedDevices.length}/{DEVICES_LIST.length}</span>
          </div>

          <div className="device-grid-tab2">
            {DEVICES_LIST.map((device) => (
              <label key={device} className="device-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(device)}
                  onChange={(e) => handleDeviceChange(device, e.target.checked)}
                />
                <span className="device-label-text">{device}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={!isFormValid}>Apply</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmApplyModal: React.FC<{
  asn: string;
  asName: string;
  prefixes: string[];
  devices: string[];
  onApply: () => void;
  onCancel: () => void;
}> = ({ asn, asName, prefixes, devices, onApply, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-confirm-apply" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Xác nhận cấu hình</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      <div className="confirm-message-section">
        <div className="confirm-icon">✓</div>
        <p>Bạn có chắc muốn thêm counter cho ASN này vào các thiết bị đã chọn?</p>
      </div>

      <div className="confirm-summary-section">
        <div className="summary-row">
          <span className="summary-label">ASN:</span>
          <span className="summary-value">{asn}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">AS Name:</span>
          <span className="summary-value">{asName}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Số Prefix:</span>
          <span className="summary-value">{prefixes.length}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Số thiết bị:</span>
          <span className="summary-value">{devices.length}</span>
        </div>
      </div>

      <div className="confirm-details-section">
        <h4 className="details-header">Danh sách Prefix:</h4>
        <div className="prefixes-list-confirm">
          {prefixes.map((prefix, idx) => (
            <div key={idx} className="prefix-item-confirm">
              <span className="prefix-icon">📍</span>
              <code>{prefix}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="confirm-details-section">
        <h4 className="details-header">Danh sách thiết bị:</h4>
        <div className="devices-list-confirm">
          {devices.map((device, idx) => (
            <div key={idx} className="device-item-confirm">
              <span className="device-icon">●</span>
              <span className="device-text">{device}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-primary" onClick={onApply}>Đồng ý</button>
      </div>
    </div>
  </div>
);

const ResultDisplayModal: React.FC<{
  result: ResultData;
  onClose: () => void;
}> = ({ result, onClose }) => {
  const stats = useMemo(() => {
    const successCount = result.results.filter((r) => r.status === 'success').length;
    const failedCount = result.results.filter((r) => r.status === 'failed').length;
    return {
      success: successCount,
      failed: failedCount,
      total: result.results.length
    };
  }, [result.results]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-result-display" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="result-summary-cards">
          <div className="summary-card success-card">
            <div className="card-number">{stats.success}</div>
            <div className="card-label">Thành công</div>
          </div>
          <div className="summary-card failed-card">
            <div className="card-number">{stats.failed}</div>
            <div className="card-label">Thất bại</div>
          </div>
          <div className="summary-card total-card">
            <div className="card-number">{stats.total}</div>
            <div className="card-label">Tổng cộng</div>
          </div>
        </div>

        <div className="result-config-info">
          <div className="config-row">
            <span className="config-label">ASN:</span>
            <span className="config-value">{result.asn}</span>
          </div>
          <div className="config-row">
            <span className="config-label">AS Name:</span>
            <span className="config-value">{result.asName}</span>
          </div>
          <div className="config-row">
            <span className="config-label">Thời gian:</span>
            <span className="config-value">{result.timestamp}</span>
          </div>
        </div>

        <div className="result-details-section">
          <h4 className="details-header">Chi tiết kết quả từng thiết bị:</h4>
          <div className="result-items-list">
            {result.results.map((item, idx) => (
              <div key={idx} className={`result-item-card ${item.status}`}>
                <div className="result-item-icon">
                  {item.status === 'success' ? '✓' : '✗'}
                </div>
                <div className="result-item-info">
                  <div className="result-item-device">{item.device}</div>
                  <div className="result-item-message">{item.message}</div>
                </div>
                <div className="result-item-status">
                  {item.status === 'success' ? 'Thành công' : 'Thất bại'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TAB 2 MAIN COMPONENT
// ============================================

const Tab2: React.FC = () => {
  const [asnData] = useState<ASNTab2Data[]>(mockTab2ASNData);
  const [expandedASNId, setExpandedASNId] = useState<number | null>(null);

  // Single date picker for displaying data on a specific day
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [modalState, setModalState] = useState<ModalState>('closed');
  const [addCounterData, setAddCounterData] = useState<AddCounterData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  const handleASNRowClick = (row: ASNTab2Data) => {
    setExpandedASNId(expandedASNId === row.id ? null : row.id);
  };

  const handleAddCounterClick = () => {
    setModalState('addCounter');
  };

  const handleAddCounterApply = (data: AddCounterData) => {
    setAddCounterData(data);
    setModalState('confirm');
  };

  const handleAddCounterCancel = () => {
    setModalState('closed');
    setAddCounterData(null);
  };

  const handleConfirmApply = () => {
    if (!addCounterData) return;
    
    setModalState('closed');
    
    const result: ResultData = {
      timestamp: new Date().toLocaleString('vi-VN'),
      asn: addCounterData.asn,
      asName: addCounterData.asName,
      prefixes: addCounterData.selectedPrefixes,
      devices: addCounterData.selectedDevices,
      results: addCounterData.selectedDevices.map((device) => ({
        device,
        status: Math.random() > 0.15 ? 'success' : 'failed',
        message: Math.random() > 0.15 ? 'Cấu hình thành công' : 'Cấu hình thất bại'
      }))
    };
    
    setResultData(result);
    setModalState('result');
  };

  const handleConfirmCancel = () => {
    setModalState('addCounter');
  };

  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setAddCounterData(null);
  };

  return (
    <div className="tab2-container">
      <div className="tab2-header">
        <div className="header-left">
          <h3 className="tab2-title">Thống kê IPT - TOP 20 ASN</h3>
          <p className="tab2-subtitle">Lưu lượng cao nhất theo ngày</p>
        </div>
        <div className="header-right">
          <div className="date-range-controls">
            {/* Quick Date Range Selection */}
            <div className="date-range-buttons">
              <button
                className={`range-btn ${selectedDateRange === 'today' && !useCustomRange ? 'active' : ''}`}
                onClick={() => handleDateRangeSelect('today')}
              >
                Today
              </button>
              <button
                className={`range-btn ${selectedDateRange === 'week' && !useCustomRange ? 'active' : ''}`}
                onClick={() => handleDateRangeSelect('week')}
              >
                7 Days
              </button>
              <button
                className={`range-btn ${selectedDateRange === 'month' && !useCustomRange ? 'active' : ''}`}
                onClick={() => handleDateRangeSelect('month')}
              >
                30 Days
              </button>
              <button
                className={`range-btn ${useCustomRange ? 'active' : ''}`}
                onClick={handleCustomRangeToggle}
              >
                Custom
              </button>
            </div>

            {/* Custom Date Range Picker */}
            {useCustomRange && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            )}
          </div>
          <button className="btn-add-counter" onClick={handleAddCounterClick}>
            + Add Counter
          </button>
        </div>
      </div>

      <div className="tab2-table-section">
        <TopASNTable
          data={asnData}
          expandedASNId={expandedASNId}
          onRowClick={handleASNRowClick}
        />
      </div>

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
        <ResultDisplayModal 
          result={resultData} 
          onClose={handleResultClose} 
        />
      )}
    </div>
  );
};

export default Tab2;
