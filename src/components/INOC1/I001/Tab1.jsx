import React, { useState } from 'react';
import { mockChartData, mockASNData, mockWarningData, mockApiMonitorData } from './mockData';
import Tab1Service from 'services/Tab1Service';

const LineChartIPT = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1h');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    setUseCustomRange(false);
  };

  const handleCustomRangeToggle = () => {
    setUseCustomRange(!useCustomRange);
  };

  return (
    <div className="linechart-container">
      <div className="linechart-header">
        <h3 className="linechart-title">Thống kê lưu lượng IPT (Throughput vs Capacity)</h3>
        <div className="linechart-controls">
          <div className="period-buttons">
            <button
              className={`period-btn ${selectedPeriod === '1h' && !useCustomRange ? 'active' : ''}`}
              onClick={() => handlePeriodClick('1h')}
            >
              1h
            </button>
            <button
              className={`period-btn ${selectedPeriod === '6h' && !useCustomRange ? 'active' : ''}`}
              onClick={() => handlePeriodClick('6h')}
            >
              6h
            </button>
            <button
              className={`period-btn ${selectedPeriod === '24h' && !useCustomRange ? 'active' : ''}`}
              onClick={() => handlePeriodClick('24h')}
            >
              24h
            </button>
            <button
              className={`period-btn ${useCustomRange ? 'active' : ''}`}
              onClick={handleCustomRangeToggle}
            >
              Custom
            </button>
          </div>

          {useCustomRange && (
            <div className="custom-range-picker">
              <div className="range-group">
                <label className="range-label">From</label>
                <div className="range-inputs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="range-input date-input"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="range-input time-input"
                  />
                </div>
              </div>

              <div className="range-group">
                <label className="range-label">To</label>
                <div className="range-inputs">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="range-input date-input"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="range-input time-input"
                  />
                </div>
              </div>

              <button className="range-apply-btn">Apply Range</button>
            </div>
          )}
        </div>
      </div>

      <div className="linechart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
          Throughput (Gbps)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          Capacity (Gbps)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          Efficiency (%)
        </div>
      </div>

      <div style={{ height: '300px', background: '#f9fafb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>
          📊 Chart Data: {useCustomRange ? `${startDate} ${startTime} to ${endDate} ${endTime}` : `Last ${selectedPeriod}`}
        </p>
      </div>

      <div className="linechart-footer">
        <span>Data updated: 2 minutes ago</span>
        <span>Interval: 1 minute/data point</span>
        <span>Status: Normal</span>
      </div>
    </div>
  );
};

const ASNTable = ({ data, expandedASNId, onRowClick }) => (
  <div className="asn-table-container">
    <table className="asn-table">
      <thead>
        <tr>
          <th style={{ width: '50px' }}>STT</th>
          <th style={{ width: '120px' }}>ASN</th>
          <th>AS Name</th>
          <th style={{ width: '150px' }}>Max In</th>
          <th style={{ width: '150px' }}>Max Out</th>
          <th style={{ width: '30px' }}></th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <React.Fragment key={row.id}>
            <tr className="asn-row" onClick={() => onRowClick(row)}>
              <td className="text-center">{row.stt}</td>
              <td className="font-mono">{row.asn}</td>
              <td className="text-left">{row.asName}</td>
              <td className="text-right">
                <span className="badge badge-in">{row.maxIn}</span>
              </td>
              <td className="text-right">
                <span className="badge badge-out">{row.maxOut}</span>
              </td>
              <td className="text-center">
                {row.prefixes && row.prefixes.length > 0 && (
                  <span className="expand-icon">
                    {expandedASNId === row.id ? '▼' : '▶'}
                  </span>
                )}
              </td>
            </tr>

            {expandedASNId === row.id && row.prefixes && (
              <tr className="prefix-row">
                <td colSpan={6}>
                  <div className="prefix-container">
                    <h4>Các Prefix được add counter:</h4>
                    <div className="prefix-list">
                      {row.prefixes.map((prefix, idx) => (
                        <div key={idx} className="prefix-item">
                          <span className="prefix-icon">📍</span>
                          <code>{prefix}</code>
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

const ApiMonitorBox = ({ data, onClick }) => {
  const isAlert = data.status >= data.threshold;
  
  return (
    <div className={`api-monitor-box ${isAlert ? 'alert-mode blink' : ''}`} onClick={onClick}>
      <div className="monitor-header">
        <div className="monitor-title-group">
          <span className="monitor-icon">📡</span>
          <h4>API Monitor Status</h4>
        </div>
        {isAlert && <span className="alert-badge">ALERT</span>}
      </div>

      <div className="monitor-status">
        <div className="status-percentage">
          <span className="percentage-value">{data.status}%</span>
          <span className="percentage-label">API Usage</span>
        </div>
      </div>

      <div className="monitor-progress">
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${data.status}%`, 
              background: isAlert ? '#dc2626' : '#10b981'
            }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span className={isAlert ? 'threshold-mark' : ''}>{data.threshold}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="monitor-threshold">
        <span className="label">Threshold:</span>
        <span className="value">{data.threshold}%</span>
      </div>

      <div className="monitor-footer">
        <span className="timestamp">{data.timestamp}</span>
        <span className="note">{data.note}</span>
      </div>

      {isAlert && <div className="alert-message">⚠️ API usage is above threshold! Click to configure.</div>}
    </div>
  );
};

const LastWarningBox = ({ data }) => (
  <div className="warning-box">
    <div className="warning-header">
      <span className="warning-icon">⚠️</span>
      <h4>Cảnh báo gần đây nhất</h4>
    </div>

    <div className="warning-content">
      <div className="warning-time">
        <span className="label">Thời gian:</span>
        <span className="value">{data.lastWarningTime}</span>
      </div>

      <div className="warning-detail">
        <div className="detail-row">
          <span className="label">Lần trước:</span>
          <span className="value">{data.message}</span>
        </div>
        <div className="detail-row">
          <span className="label">ASN:</span>
          <span className="value">{data.asn}</span>
        </div>
        <div className="detail-row">
          <span className="label">Bandwidth:</span>
          <span className="value">{data.bandwidth}</span>
        </div>
      </div>

      <div className="warning-recommendation">
        <span className="label">Khuyến nghị:</span>
        <code className="recommendation-code">{data.recommendation}</code>
      </div>
    </div>

    <div className="warning-footer">Bấm để xem chi tiết</div>
  </div>
);

const ConfigPolicerModal = ({ asn, bandwidth, selectedDevices, onDeviceChange, onSelectAll, onApply, onCancel }) => {
  const allDevices = [
    'SPG-POP01', 'SPG-POP02',
    'HKG-POP01', 'HKG-POP02', 'HKG-EQX-POP01', 'HKG-EQX-POP02',
    'HCM-ASBR2', 'HCM-ASBR5',
    'HNI-ASBR2', 'HNI-ASBR3',
    'DNG-ASBR2', 'DNG-ASBR3'
  ];
  
  const isAllSelected = selectedDevices.length === allDevices.length;
  const configCommand = `set firewall filter Protect-VN2-from-Upstream-Transit term Policer-${asn} then policer ${bandwidth}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Config Khuyến nghị</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="config-info">
          <div className="config-description"><strong>Cấu hình được khuyến nghị:</strong></div>
          <div className="config-detail-box">
            <div className="config-item">
              <span className="label">AS:</span>
              <span className="value">{asn}</span>
            </div>
            <div className="config-item">
              <span className="label">Bandwidth:</span>
              <span className="value">{bandwidth}</span>
            </div>
          </div>

          <div className="config-code">
            <div className="code-label">Lệnh cấu hình:</div>
            <code className="code-block">{configCommand}</code>
          </div>
        </div>

        <div className="device-selection">
          <div className="device-header"><strong>Chọn thiết bị POP/Peering (12 thiết bị)</strong></div>

          <div className="select-all-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
              <span className="select-all-text">Chọn tất cả</span>
            </label>
            <span className="device-count">({selectedDevices.length}/{allDevices.length} được chọn)</span>
          </div>

          <div className="device-grid">
            {allDevices.map((device) => (
              <label key={device} className="device-checkbox">
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(device)}
                  onChange={(e) => onDeviceChange(device, e.target.checked)}
                />
                <span className="device-name">{device}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Hủy</button>
          <button className="btn btn-primary" onClick={onApply} disabled={selectedDevices.length === 0}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ devices, configDetail, onApply, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Xác nhận cấu hình</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      <div className="confirm-message">
        <p>Bạn có chắc muốn áp dụng cấu hình này vào {devices.length} thiết bị đã chọn?</p>
      </div>

      <div className="confirm-summary">
        <div className="summary-item">
          <span className="label">ASN:</span>
          <span className="value">{configDetail.as}</span>
        </div>
        <div className="summary-item">
          <span className="label">Bandwidth:</span>
          <span className="value">{configDetail.bandwidth}</span>
        </div>
        <div className="summary-item">
          <span className="label">Số thiết bị:</span>
          <span className="value">{devices.length}</span>
        </div>
      </div>

      <div className="selected-devices">
        <div className="devices-title">Thiết bị được chọn:</div>
        <div className="devices-list">
          {devices.map((device) => (
            <div key={device} className="device-item">
              <span className="device-icon">✓</span>
              <span className="device-text">{device}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="confirm-warning">
        <strong>⚠️ Lưu ý quan trọng</strong>
        <p>Cấu hình sẽ được áp dụng ngay lập tức. Không thể hoàn tác sau khi xác nhận.</p>
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-primary" onClick={onApply}>Xác nhận</button>
      </div>
    </div>
  );
);

const ResultModal = ({ result, onClose }) => {
  const successCount = result.results.filter(r => r.status === 'success').length;
  const failedCount = result.results.filter(r => r.status === 'failed').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-result" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="result-summary">
          <div className="summary-card success">
            <div className="summary-number">{successCount}</div>
            <div className="summary-label">Thành công</div>
          </div>
          <div className="summary-card failed">
            <div className="summary-number">{failedCount}</div>
            <div className="summary-label">Thất bại</div>
          </div>
          <div className="summary-card total">
            <div className="summary-number">{result.selectedDevices.length}</div>
            <div className="summary-label">Tổng cộng</div>
          </div>
        </div>

        <div className="result-config">
          <div className="config-row">
            <span className="label">ASN:</span>
            <span className="value">{result.configDetail.as}</span>
          </div>
          <div className="config-row">
            <span className="label">Bandwidth:</span>
            <span className="value">{result.configDetail.bandwidth}</span>
          </div>
          <div className="config-row">
            <span className="label">Thời gian:</span>
            <span className="value">{result.timestamp}</span>
          </div>
        </div>

        <div className="result-details">
          <h4>Chi tiết từng thiết bị:</h4>
          <div className="result-list">
            {result.results.map((item, idx) => (
              <div key={idx} className={`result-item ${item.status}`}>
                <div className="result-icon">{item.status === 'success' ? '✓' : '✗'}</div>
                <div className="result-info">
                  <div className="result-device">{item.device}</div>
                  <div className="result-message">{item.message}</div>
                </div>
                <div className="result-status">{item.status === 'success' ? 'Thành công' : 'Thất bại'}</div>
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

function Tab1() {
  const [chartData] = useState(mockChartData);
  const [asnData] = useState(mockASNData);
  const [warningData] = useState(mockWarningData);
  const [apiMonitorData] = useState(mockApiMonitorData);

  const [expandedASNId, setExpandedASNId] = useState(null);
  const [modalState, setModalState] = useState('closed');

  const [selectedASN, setSelectedASN] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [configDetail, setConfigDetail] = useState(null);
  const [confirmDevices, setConfirmDevices] = useState([]);
  const [resultData, setResultData] = useState(null);

  const handleApiMonitorClick = () => {
    if (apiMonitorData.status >= 80) {
      setSelectedASN(asnData[0]);
      setConfigDetail({
        as: asnData[0].asn,
        bandwidth: asnData[0].maxOut
      });
      setSelectedDevices([]);
      setModalState('config');
    }
  };

  const handleASNRowClick = (row) => {
    setExpandedASNId(expandedASNId === row.id ? null : row.id);
  };

  const handleDeviceChange = (device, checked) => {
    setSelectedDevices(
      checked 
        ? [...selectedDevices, device] 
        : selectedDevices.filter(d => d !== device)
    );
  };

  const handleSelectAllDevices = (checked) => {
    if (checked) {
      setSelectedDevices([
        'SPG-POP01', 'SPG-POP02', 
        'HKG-POP01', 'HKG-POP02', 'HKG-EQX-POP01', 'HKG-EQX-POP02', 
        'HCM-ASBR2', 'HCM-ASBR5', 
        'HNI-ASBR2', 'HNI-ASBR3', 
        'DNG-ASBR2', 'DNG-ASBR3'
      ]);
    } else {
      setSelectedDevices([]);
    }
  };

  const handleConfigApply = () => {
    if (selectedDevices.length === 0) {
      alert('Vui lòng chọn ít nhất một thiết bị');
      return;
    }
    setConfirmDevices(selectedDevices);
    setModalState('confirm');
  };

  const handleConfigCancel = () => {
    setModalState('closed');
    setSelectedASN(null);
    setSelectedDevices([]);
  };

  const handleConfirmApply = () => {
    setModalState('closed');
    
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

  const handleConfirmCancel = () => {
    setModalState('config');
  };

  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setSelectedASN(null);
    setSelectedDevices([]);
    setConfirmDevices([]);
  };

  return (
    <div className="i001-container tab1-content">
      <div className="i001-header">
        <h2>Quản lý lưu lượng IPTransit - Policer</h2>
      </div>

      <div className="i001-content">
        <div className="i001-left">
          <div className="i001-section">
            <LineChartIPT data={chartData} />
          </div>

          <div className="i001-section">
            <h3 className="section-title">Các ASN được counter</h3>
            <ASNTable
              data={asnData}
              expandedASNId={expandedASNId}
              onRowClick={handleASNRowClick}
            />
          </div>
        </div>

        <div className="i001-right">
          <div className="i001-info-box">
            <ApiMonitorBox
              data={apiMonitorData}
              onClick={handleApiMonitorClick}
            />
          </div>

          <div className="i001-info-box">
            <LastWarningBox data={warningData} />
          </div>
        </div>
      </div>

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
  );
}

export default Tab1;