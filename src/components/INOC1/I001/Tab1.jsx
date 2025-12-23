import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockChartData, mockASNData, mockWarningData, mockApiMonitorData, mockLastPolicerData } from './mockData';
import Tab1Service from 'services/Tab1Service';

// LineChartIPT Component - Displays traffic monitoring line chart with 3 metrics
// Features: Period selection (1d, 7d, 1m, Custom), day/time range picker, legend with traffic/capacity/efficiency, realtime auto-refresh for 1d
// X-axis: Shows hourly (HH:mm) for 1d, daily (DD/MM) for 7d/1m/custom
const LineChartIPT = ({ data, onPeriodChange, currentPeriod, lastUpdateTime }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1d');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  // Determine which field to use for X-axis based on period
  const xAxisDataKey = currentPeriod === '1d' ? 'time' : 'date';
  const xAxisLabel = currentPeriod === '1d' ? 'Thời gian (Giờ)' : 'Thời gian (Ngày)';

  // Handle period button clicks to switch between predefined time ranges
  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    setUseCustomRange(false);
    
    // Calculate date range based on period
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start;
    
    switch(period) {
      case '1d':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '1m':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        start = end;
    }
    
    console.log(`📅 Period changed to ${period}: ${start} to ${end}`);
    if (onPeriodChange) {
      onPeriodChange(start, end, period);
    }
  };

  // Toggle custom date/time range picker visibility
  const handleCustomRangeToggle = () => {
    setUseCustomRange(!useCustomRange);
    if (!useCustomRange) {
      setSelectedPeriod('custom');
    }
  };
  
  // Apply custom date range
  const handleApplyCustomRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Determine period based on date range: 1 day = hourly, else = daily
    const period = daysDiff <= 1 ? '1d' : 'custom';
    
    console.log(`📅 Custom range: ${startDate} to ${endDate}, period: ${period}`);
    if (onPeriodChange) {
      onPeriodChange(startDate, endDate, period);
    }
  };

  return (
    <div className="linechart-container">
      <div className="linechart-header">
        <h3 className="linechart-title">
          Lưu lượng IPT - Traffic Monitoring
          {currentPeriod === '1d' && lastUpdateTime && (
            <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '12px', fontWeight: 'normal' }}>
              <span style={{ fontSize: '10px' }}>●</span> Realtime - Cập nhật: {lastUpdateTime}
            </span>
          )}
        </h3>
        <p className="linechart-subtitle">Lưu lượng cao nhất theo ngày - Traffic monitoring (Gbps) - 5 phút/lần</p>
        <div className="linechart-controls">
          <div className="period-buttons">
            <button className={`period-btn ${selectedPeriod === '1d' && !useCustomRange ? 'active' : ''}`} onClick={() => handlePeriodClick('1d')}>1 ngày <span style={{ fontSize: '10px', color: '#10b981' }}>●</span> Realtime</button>
            <button className={`period-btn ${selectedPeriod === '7d' && !useCustomRange ? 'active' : ''}`} onClick={() => handlePeriodClick('7d')}>7 ngày</button>
            <button className={`period-btn ${selectedPeriod === '1m' && !useCustomRange ? 'active' : ''}`} onClick={() => handlePeriodClick('1m')}>1 tháng</button>
            <button className={`period-btn ${useCustomRange ? 'active' : ''}`} onClick={handleCustomRangeToggle}>Custom</button>
          </div>
          {useCustomRange && (
            <div className="custom-range-picker">
              <div className="range-group">
                <label className="range-label">Từ</label>
                <div className="range-inputs">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="range-input date-input" />
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="range-input time-input" />
                </div>
              </div>
              <div className="range-group">
                <label className="range-label">Đến</label>
                <div className="range-inputs">
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="range-input date-input" />
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="range-input time-input" />
                </div>
              </div>
              <button className="range-apply-btn" onClick={handleApplyCustomRange}>Áp dụng</button>
            </div>
          )}
        </div>
      </div>
      <div className="linechart-legend">
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>Lưu lượng (Throughput - Gbps)</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>Độ khả dung (Capacity - Gbps)</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>Hiệu suất (Efficiency - %)</div>
      </div>
      <div style={{ height: '400px', background: 'white', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xAxisDataKey}
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -5, style: { fontSize: '11px', fill: '#6b7280' } }}
                angle={currentPeriod !== '1d' ? -45 : 0}
                textAnchor={currentPeriod !== '1d' ? 'end' : 'middle'}
                height={currentPeriod !== '1d' ? 80 : 30}
                interval={currentPeriod === '1d' ? Math.max(0, Math.floor(data.length / 24) - 1) : Math.max(0, Math.floor(data.length / 15) - 1)}
                tickFormatter={(value, index) => {
                  // For 1-day view: Show only hourly times (HH:00 format)
                  if (currentPeriod === '1d') {
                    // value is the time string from dataKey (e.g., "09:30", "10:00")
                    if (typeof value === 'string' && value.includes(':')) {
                      const timeParts = value.split(':');
                      // Only show times where minute is "00" (hourly: 09:00, 10:00, 11:00...)
                      if (timeParts.length === 2 && timeParts[1] === '00') {
                        return value;
                      }
                      // For non-hourly times, still return the value but it won't be shown due to interval
                    }
                    return value;
                  }
                  
                  // For multi-day view (7d, 1m, custom): Show date in DD/MM format
                  // value is already the date string from dataKey (e.g., "16/12", "17/12")
                  return value;
                }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 1500]}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Gbps', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
                label={{ value: '%', angle: 90, position: 'insideRight', style: { fill: '#f59e0b' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(label, payload) => {
                  // payload[0]?.payload contains the full data point
                  if (payload && payload[0] && payload[0].payload) {
                    return `Thời gian: ${payload[0].payload.fullTime}`;
                  }
                  return `Thời gian: ${label}`;
                }}
                formatter={(value, name) => {
                  if (name === 'Efficiency (%)') {
                    return value.toFixed(2) + '%';
                  }
                  return value.toFixed(2) + ' Gbps';
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="throughput"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Throughput (Gbps)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="capacity"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Capacity (Gbps)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Efficiency (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#9ca3af' }}>📊 Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ASNTable Component - Displays list of ASNs being countered with expandable prefix details
// Features: STT/ASN/AS Name/PRTG-ID columns, expandable rows showing prefixes, delete action button with confirmation
const ASNTable = ({ data, expandedASNId, onRowClick, onDeleteClick }) => {
  console.log('🔍 ASNTable RENDER - received data:', data);
  console.log('🔍 ASNTable - data type:', typeof data);
  console.log('🔍 ASNTable - data is array:', Array.isArray(data));
  console.log('🔍 ASNTable - data length:', data?.length);
  console.log('🔍 ASNTable - condition check (!data || data.length === 0):', !data || data.length === 0);
  
  return (
    <div className="asn-table-container">
      {!data || data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Không có ASN nào được counter</p>
          <p style={{ fontSize: '14px' }}>Chưa có dữ liệu ASN từ API</p>
        </div>
      ) : (
        <table className="asn-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>STT</th>
              <th style={{ width: '120px' }}>ASN</th>
              <th>AS Name</th>
              <th style={{ width: '150px' }}>PRTG-ID</th>
              <th style={{ width: '120px' }}>User add</th>
              <th style={{ width: '180px' }}>Time added</th>
              <th style={{ width: '100px' }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="asn-row">
                  <td className="text-center">{row.stt}</td>
                  <td className="font-mono">{row.asn}</td>
                  <td className="text-left">{row.asName}</td>
                  <td className="text-center">{row.prtgId}</td>
                  <td className="text-center">{row.userUpdate || 'N/A'}</td>
                  <td className="text-center">{row.timeAdded || 'N/A'}</td>
                  <td className="text-center">
                    <button className="action-btn delete-btn" onClick={() => onDeleteClick(row)} title="Xóa" style={{ cursor: 'pointer' }}>🗑️</button>
                    {row.prefixes && row.prefixes.length > 0 && (
                      <button className="action-btn expand-btn" onClick={() => onRowClick(row)} title="Mở rộng">
                        {expandedASNId === row.id ? '▼' : '▶'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedASNId === row.id && row.prefixes && (
                  <tr className="prefix-row">
                    <td colSpan={7}>
                      <div className="prefix-container">
                        <h4>Các Prefix được thêm counter:</h4>
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
      )}
    </div>
  );
};

// ApiMonitorBox Component - Displays API/Performance monitoring with alert status
// Features: Alert when status >= 80%, flashing red animation, progress bar visualization, clickable for config
const ApiMonitorBox = ({ data, onClick }) => {
  const isAlert = data.status >= data.threshold;
  return (
    <div className={`api-monitor-box ${isAlert ? 'alert-mode blink' : ''}`} onClick={onClick} style={{ cursor: isAlert ? 'pointer' : 'default' }}>
      <div className="monitor-header">
        <div className="monitor-title-group">
          <span className="monitor-icon">⚠️</span>
          <h4>API Monitor</h4>
        </div>
        {isAlert && <span className="alert-badge">ALERT</span>}
      </div>
      <div className="monitor-status">
        <div className="status-percentage" style={{ color: isAlert ? '#dc2626' : '#10b981' }}>
          <span className="percentage-value">{data.status}%</span>
          <span className="percentage-label">Hiệu suất sử dụng</span>
        </div>
      </div>
      <div className="monitor-progress">
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${data.status}%`, background: isAlert ? '#dc2626' : '#10b981' }}></div>
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span className={isAlert ? 'threshold-mark' : ''}>{data.threshold}%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="monitor-threshold">
        <span className="label">Ngưỡng cảnh báo:</span>
        <span className="value">{data.threshold}%</span>
      </div>
      <div className="monitor-footer">
        <span className="timestamp">{data.timestamp}</span>
        <span className="note">{data.note}</span>
      </div>
      {isAlert && <div className="alert-message">⚠️ Hiệu suất vượt ngưỡng! Nhấp để cấu hình.</div>}
    </div>
  );
};

// LastWarningBox Component - Displays most recent warning/alert information
// Features: Shows warning timestamp, affected ASN, bandwidth info, and recommended configuration command
const LastWarningBox = ({ data }) => {
  if (!data) {
    return (
      <div className="warning-box">
        <div className="warning-header">
          <span className="warning-icon">🔔</span>
          <h4>Last warning</h4>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <p style={{ fontSize: '14px' }}>Không có dữ liệu cảnh báo từ API</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="warning-box">
      <div className="warning-header">
        <span className="warning-icon">🔔</span>
        <h4>Last warning</h4>
      </div>
      <div className="warning-content">
        <div className="warning-time">
          <span className="label">Thời gian cuối cùng:</span>
          <span className="value">{data.lastWarningTime}</span>
        </div>
        <div className="warning-detail">
          <div className="detail-row"><span className="label">Lần cảnh báo:</span><span className="value">{data.message}</span></div>
          <div className="detail-row"><span className="label">ASN:</span><span className="value">{data.asn}</span></div>
          <div className="detail-row"><span className="label">Bandwidth:</span><span className="value">{data.bandwidth}</span></div>
        </div>
        <div className="warning-recommendation">
          <span className="label">Cấu hình khuyến nghị:</span>
          <code className="recommendation-code">{data.recommendation}</code>
        </div>
      </div>
    </div>
  );
};

// LastPolicerBox Component - Displays most recent policer configuration applied
// Features: Shows timestamp of last policer application, number of devices configured, configuration details
// Clickable to open detailed modal with device-by-device status information
const LastPolicerBox = ({ data, onClick }) => (
  <div
    className="policer-box"
    style={{ backgroundColor: '#f3e8ff', borderLeft: '4px solid #a855f7', cursor: 'pointer' }}
    onClick={onClick}
  >
    <div className="policer-header">
      <span className="policer-icon">✓</span>
      <h4>Lasted Policer</h4>
    </div>
    <div className="policer-content">
      <div className="policer-info">
        <div className="detail-row"><span className="label">Lần thực hiện gần nhất:</span><span className="value">{data.lastPolicerTime}</span></div>
        <div className="detail-row"><span className="label">ASN:</span><span className="value">{data.asn}</span></div>
        <div className="detail-row"><span className="label">Bandwidth:</span><span className="value">{data.bandwidth}</span></div>
      </div>
      <div className="policer-devices">
        <span className="label">Số thiết bị đã apply:</span>
        <div style={{ marginTop: '8px' }}>
          <span className="badge" style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: '500' }}>{data.deviceCount} thiết bị</span>
        </div>
      </div>
      <div className="policer-status">
        <span className="label">Trạng thái:</span>
        <span className="value" style={{ color: '#10b981', fontWeight: '600' }}>✓ {data.status}</span>
      </div>
    </div>
    <div className="policer-footer" style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>Bấm để xem chi tiết apply history</div>
  </div>
);

// LastPolicerDetailModal Component - Shows detailed information about last applied policer configuration
// Features: Displays ASN/Bandwidth, configuration details, device statistics, and per-device status list
const LastPolicerDetailModal = ({ data, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content modal-policer-detail" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div>
          <h3>Chi tiết Policer đã cấu hình</h3>
          <p className="modal-subtitle">Thông tin cấu hình Policer gần nhất</p>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="policer-detail-content">
        {/* Configuration Info Section */}
        <div className="detail-section config-section">
          <div className="config-header">
            <h4>{data.asn} ({data.bandwidth})</h4>
          </div>

          <div className="config-info-grid">
            <div className="info-item">
              <span className="info-label">Lần thực hiện gần nhất</span>
              <span className="info-value">{data.timeSinceExecution}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái</span>
              <span className="info-value" style={{ color: '#10b981', fontWeight: '600' }}>✓ {data.status}</span>
            </div>
          </div>

          <div className="config-code-section">
            <span className="code-label">Cấu hình được áp dụng:</span>
            <code className="code-block">{data.configCommand}</code>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="detail-section stats-section">
          <h4 className="section-title">Thống kê thiết bị</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{data.devicesApplied}</div>
              <div className="stat-label">Thiết bị đã apply</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totalDevices}</div>
              <div className="stat-label">Tổng thiết bị</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.successRate}%</div>
              <div className="stat-label">Tỉ lệ thành công</div>
            </div>
          </div>
        </div>

        {/* Devices List Section */}
        <div className="detail-section devices-section">
          <h4 className="section-title">Thiết bị đã áp dụng cấu hình ({data.devices.length})</h4>
          <div className="devices-list">
            {data.devices.map((device, idx) => (
              <div key={idx} className="device-status-item">
                <div className="device-info">
                  <span className="device-icon" style={{ color: device.statusColor }}>●</span>
                  <span className="device-name">{device.name}</span>
                </div>
                <span className="device-status-badge" style={{ backgroundColor: device.statusColor + '1A', color: device.statusColor }}>
                  ✓ {device.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Đóng</button>
      </div>
    </div>
  </div>
);

// ConfigPolicerModal Component - Modal for configuring policer on selected devices
// Features: Shows recommended config command, device selection (6 POPs), select all checkbox, Apply/Cancel buttons
const ConfigPolicerModal = ({ asn, bandwidth, selectedDevices, onDeviceChange, onSelectAll, onApply, onCancel }) => {
  const allDevices = ['HKG-EQX-POP01', 'HKG-EQX-POP02', 'HKG-MEGA-POP01', 'HKG-MEGA-POP02', 'SGP-EQX-POP01', 'SGP-GLS-POP01'];
  const isAllSelected = selectedDevices.length === allDevices.length;
  const configCommand = `set firewall filter Protect-VN2-from-Upstream-Transit term Policer-${asn} then policer ${bandwidth}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cấu hình Khuyến nghị</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="config-info">
          <div className="config-description"><strong>Cấu hình được khuyến nghị:</strong></div>
          <div className="config-detail-box">
            <div className="config-item"><span className="label">AS:</span><span className="value">{asn}</span></div>
            <div className="config-item"><span className="label">Bandwidth:</span><span className="value">{bandwidth}</span></div>
          </div>
          <div className="config-code">
            <div className="code-label">Lệnh cấu hình mẫu:</div>
            <code className="code-block">{configCommand}</code>
          </div>
        </div>

        <div className="device-selection">
          <div className="device-header"><strong>Chọn thiết bị POP/Peering (6 thiết bị)</strong></div>
          <div className="select-all-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={isAllSelected} onChange={(e) => onSelectAll(e.target.checked)} />
              <span className="select-all-text">Chọn tất cả thiết bị</span>
            </label>
            <span className="device-count">Đã chọn {selectedDevices.length}/{allDevices.length} thiết bị</span>
          </div>
          <div className="device-grid">
            {allDevices.map((device) => (
              <label key={device} className="device-checkbox">
                <input type="checkbox" checked={selectedDevices.includes(device)} onChange={(e) => onDeviceChange(device, e.target.checked)} />
                <span className="device-name">{device}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
          <button className="btn btn-primary" onClick={onApply} disabled={selectedDevices.length === 0}>Áp dụng</button>
        </div>
      </div>
    </div>
  );
};

// ConfirmModal Component - Confirmation dialog before applying configuration to devices
// Features: Shows ASN/Bandwidth/Device count summary, lists selected devices, warning message, Apply/Cancel
const ConfirmModal = ({ devices, configDetail, onApply, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Xác nhận cấu hình</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      <div className="confirm-message">
        <p>Bạn có chắc muốn áp dụng cấu hình này vào {devices.length} thiết bị đã chọn không?</p>
      </div>

      <div className="confirm-summary">
        <div className="summary-item"><span className="label">ASN:</span><span className="value">{configDetail.as}</span></div>
        <div className="summary-item"><span className="label">Bandwidth:</span><span className="value">{configDetail.bandwidth}</span></div>
        <div className="summary-item"><span className="label">Số thiết bị:</span><span className="value">{devices.length}</span></div>
      </div>

      <div className="selected-devices">
        <div className="devices-title">Danh sách thiết bị được chọn:</div>
        <div className="devices-list">
          {devices.map((device) => (
            <div key={device} className="device-item">
              <span className="device-icon">●</span>
              <span className="device-text">{device}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="confirm-warning">
        <strong>⚠️ Lưu ý quan trọng</strong>
        <p>Cấu hình sẽ được áp dụng ngay lập tức trên các thiết bị. Không thể hoàn tác sau khi xác nhận.</p>
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-primary" onClick={onApply}>Xác nhận áp dụng</button>
      </div>
    </div>
  </div>
);

// DeleteConfirmModal Component - Confirmation dialog before deleting an ASN counter
// Features: Shows ASN/Name/Group ID to be deleted, warning message, Confirm/Cancel buttons
const DeleteConfirmModal = ({ asn, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-delete-confirm" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
      <div className="modal-header">
        <h3>Xác nhận xóa ASN</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      <div className="confirm-message" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', color: '#dc2626' }}>⚠️</div>
        <p style={{ fontWeight: '500', marginBottom: '8px' }}>Bạn chắc chắn muốn xóa ASN này khỏi danh sách counter?</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Hành động này không thể hoàn tác.</p>
      </div>

      <div className="delete-summary" style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
        <div className="detail-row" style={{ marginBottom: '8px' }}>
          <span className="label" style={{ fontWeight: '600' }}>ASN:</span>
          <span className="value" style={{ color: '#dc2626', fontWeight: '600' }}>{asn.asn}</span>
        </div>
        <div className="detail-row" style={{ marginBottom: '8px' }}>
          <span className="label" style={{ fontWeight: '600' }}>AS Name:</span>
          <span className="value">{asn.asName}</span>
        </div>
        <div className="detail-row">
          <span className="label" style={{ fontWeight: '600' }}>Group ID (PRTG):</span>
          <span className="value" style={{ color: '#7c3aed', fontWeight: '500' }}>{asn.prtgId}</span>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-danger" onClick={onConfirm} style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>Xóa</button>
      </div>
    </div>
  </div>
);

// ResultModal Component - Displays configuration results showing success/failure per device
// Features: Summary cards (success/failed/total counts), config details, per-device status details
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
          <div className="summary-card success"><div className="summary-number">{successCount}</div><div className="summary-label">Thành công</div></div>
          <div className="summary-card failed"><div className="summary-number">{failedCount}</div><div className="summary-label">Thất bại</div></div>
          <div className="summary-card total"><div className="summary-number">{result.selectedDevices.length}</div><div className="summary-label">Tổng cộng</div></div>
        </div>

        <div className="result-config">
          <div className="config-row"><span className="label">ASN:</span><span className="value">{result.configDetail.as}</span></div>
          <div className="config-row"><span className="label">Bandwidth:</span><span className="value">{result.configDetail.bandwidth}</span></div>
          <div className="config-row"><span className="label">Thời gian thực hiện:</span><span className="value">{result.timestamp}</span></div>
        </div>

        <div className="result-details">
          <h4>Chi tiết cấu hình từng thiết bị:</h4>
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

// Tab1 Component - Main IPT Policer Dashboard with monitoring and configuration
// Features:
//   - LineChart: 3-line traffic monitoring (Throughput/Capacity/Efficiency) with time period selector
//   - ASN Table: List of countered ASNs with expandable prefix details and delete action
//   - API Monitor: Shows API/performance status, alerts when >= 80% (flashing red), clickable for config
//   - Last Warning Box: Shows most recent warning with recommendation config
//   - Last Policer Box: Shows most recent policer applied, clickable to view detailed device status
//   - Config Flow: Alert click → Config modal → Confirm modal → Result modal
function Tab1() {
  // State management for chart data and ASN list
  const [chartData, setChartData] = useState(mockChartData);
  const [asnData, setAsnData] = useState([]);
  const [warningData, setWarningData] = useState(null);
  const [apiMonitorData, setApiMonitorData] = useState(null);
  const [lastPolicerData, setLastPolicerData] = useState(mockLastPolicerData);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState('1d'); // Track current time period for X-axis formatting
  const [lastUpdateTime, setLastUpdateTime] = useState(null); // Track last data update time for realtime indicator
  const [alertThreshold, setAlertThreshold] = useState(80); // Track alert threshold from API

  // State for UI interactions
  const [expandedASNId, setExpandedASNId] = useState(null); // Track which ASN row is expanded
  const [modalState, setModalState] = useState('closed'); // Track modal state: 'closed', 'config', 'confirm', 'result', 'deleteConfirm', 'policerDetail'
  const [selectedASN, setSelectedASN] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]); // Array of selected device names
  const [configDetail, setConfigDetail] = useState(null); // {as: string, bandwidth: string}
  const [confirmDevices, setConfirmDevices] = useState([]); // Copy of selectedDevices for confirmation
  const [resultData, setResultData] = useState(null); // Result data from N8n call
  const [deleteConfirmASN, setDeleteConfirmASN] = useState(null); // ASN to be deleted
  const [showPolicerDetail, setShowPolicerDetail] = useState(false); // Track if policer detail modal is open

  // Fetch traffic data with optional date range
  const fetchTrafficData = async (startDate, endDate) => {
    try {
      console.log('🔄 Fetching traffic data from API...', { startDate, endDate });
      const trafficRes = await Tab1Service.GetTrafficData(startDate, endDate);
      console.log('📦 GetTrafficData full response:', trafficRes);
        
        if (trafficRes?.success && Array.isArray(trafficRes.data) && trafficRes.data.length > 0) {
          // Backend sorts data from OLD to NEW (ascending by date)
          // So: data[0] = oldest, data[last] = newest
          console.log('✅ GetTrafficData SUCCESS - Data count:', trafficRes.data.length);
          console.log('📊 FIRST record (OLDEST from backend):', trafficRes.data[0]);
          console.log('📊 LAST record (NEWEST from backend):', trafficRes.data[trafficRes.data.length - 1]);
          console.log('GetTrafficData raw response (first 3):', trafficRes.data.slice(0, 3));
          
          // Backend sorts OLD → NEW, so LAST item is the latest
          const latestDataDate = new Date(trafficRes.data[trafficRes.data.length - 1].updatedAt);
          const oldestDataDate = new Date(trafficRes.data[0].updatedAt);
          const now = new Date();
          const hoursDiff = (now - latestDataDate) / (1000 * 60 * 60);
          const daysDiff = Math.floor(hoursDiff / 24);
          
          console.log('📅 LATEST data date (last item):', latestDataDate.toLocaleString('vi-VN'));
          console.log('📅 OLDEST data date (first item):', oldestDataDate.toLocaleString('vi-VN'));
          console.log('📅 TODAY:', now.toLocaleString('vi-VN'));
          console.log('📅 Days difference from today:', daysDiff);
          
          if (hoursDiff > 24) {
            console.warn(`⚠️ Dữ liệu traffic đã cũ ${daysDiff} ngày (ngày cuối: ${latestDataDate.toLocaleDateString('vi-VN')})`);
            console.warn(`⚠️ Hôm nay: ${now.toLocaleDateString('vi-VN')} - Dữ liệu: ${latestDataDate.toLocaleDateString('vi-VN')}`);
          }
          
          // Transform API data format to chart format
          // API format: {trafficInTotal (Gbps), capacityTotal (Gbps), utilizationPercent (%), updatedAt}
          // Chart format: {time (HH:mm), date (DD/MM), fullTime (HH:mm DD/MM/YYYY), throughput, capacity, efficiency}
          // API already returns data in Gbps, no conversion needed
          const allTransformedData = trafficRes.data.map((item) => {
            const date = new Date(item.updatedAt);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return {
              time: `${hours}:${minutes}`,  // For 1-day view (hourly)
              date: `${day}/${month}`,      // For 7-day/1-month view (daily)
              fullTime: `${hours}:${minutes} ${day}/${month}/${year}`, // Full timestamp for tooltip
              throughput: Number(item.trafficInTotal) || 0,  // Already in Gbps
              capacity: Number(item.capacityTotal) || 0,      // Already in Gbps
              efficiency: Number(item.utilizationPercent) || 0, // Already in %
              isOldData: hoursDiff > 24, // Flag for old data
              rawDate: item.updatedAt, // Keep raw date for debugging
              timestamp: date.getTime() // Add timestamp for sorting/grouping
            };
          });
          
          // Sort data by timestamp (oldest to newest for chart display)
          // Show ALL data points to see hourly variations within each day
          const transformedData = allTransformedData.sort((a, b) => a.timestamp - b.timestamp);
          
          // Calculate date range for logging
          const reqStartDate = startDate ? new Date(startDate) : null;
          const reqEndDate = endDate ? new Date(endDate) : null;
          const dateRange = reqStartDate && reqEndDate ? 
            Math.ceil((reqEndDate - reqStartDate) / (1000 * 60 * 60 * 24)) : 1;
          
          console.log(`📊 Date range: ${dateRange} days (from ${startDate} to ${endDate})`);
          console.log(`📊 Total data points: ${transformedData.length} (showing all hourly variations)`);
          console.log(`📊 X-axis will use: ${dateRange > 1 ? 'date (DD/MM) with time in tooltip' : 'time (HH:mm)'}`)
          
          console.log('Transformed chart data (first 3):', transformedData.slice(0, 3));
          console.log('Transformed chart data (last 3):', transformedData.slice(-3));
          console.log('🔄 Setting chartData with', transformedData.length, 'records');
          console.log(`📅 Data date range: ${oldestDataDate.toLocaleDateString('vi-VN')} to ${latestDataDate.toLocaleDateString('vi-VN')}`);
          setChartData(transformedData);
          console.log('✅ chartData state updated to:', transformedData.length, 'records');
        } else {
          // API returned error or no data - keep mockChartData
          console.error('❌ GetTrafficData FAILED');
          console.error('Response:', trafficRes);
          console.error('Success:', trafficRes?.success);
          console.error('Data is array:', Array.isArray(trafficRes?.data));
          console.error('Data length:', trafficRes?.data?.length);
          console.warn('⚠️ Keeping mockChartData as fallback');
          // Don't set to empty - keep initial mockChartData
        }
    } catch (err) {
      console.error('❌ Fetch traffic data ERROR:', err);
      console.warn('⚠️ Keeping existing chartData on error');
    }
  };

  // Fetch traffic data and ASN list from API on component mount
  React.useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // STEP 1: Fetch threshold FIRST (phải fetch trước để có giá trị đúng)
        console.log('🔄 Fetching Threshold from /api/set-threshold...');
        const thresholdRes = await Tab1Service.GetThresholdConfig();
        console.log('📦 GetThresholdConfig response:', thresholdRes);
        
        let fetchedThreshold = 80; // Default fallback
        
        if (thresholdRes?.status === 'success' && thresholdRes.data) {
          console.log('✅ GetThresholdConfig SUCCESS');
          
          // Extract threshold from API response
          // API returns: {id, cdn_traffic_trigger_threshold: "(1,70,hieunt,\"2025-11-27 10:04:09\")", user_updated, updated_at}
          // Threshold is PostgreSQL tuple format, need to parse 2nd element
          if (thresholdRes.data.cdn_traffic_trigger_threshold) {
            const rawValue = thresholdRes.data.cdn_traffic_trigger_threshold;
            console.log('📦 Raw threshold value:', rawValue);
            
            // Parse tuple string to extract threshold value (2nd element)
            if (typeof rawValue === 'string' && rawValue.startsWith('(') && rawValue.endsWith(')')) {
              // Remove parentheses and split by comma
              const cleaned = rawValue.slice(1, -1); // Remove "(" and ")"
              const parts = cleaned.split(',');
              console.log('📦 Tuple parts:', parts);
              
              if (parts.length >= 2) {
                // Extract 2nd element (index 1) which is the threshold
                const thresholdStr = parts[1].trim();
                const parsedThreshold = Number(thresholdStr);
                
                if (!isNaN(parsedThreshold) && parsedThreshold > 0 && parsedThreshold <= 100) {
                  fetchedThreshold = parsedThreshold;
                  setAlertThreshold(parsedThreshold);
                  console.log('✅ Alert threshold parsed from tuple:', parsedThreshold);
                } else {
                  console.warn('⚠️ Invalid threshold value in tuple:', thresholdStr);
                  console.log('⚠️ Using default threshold: 80');
                }
              } else {
                console.warn('⚠️ Tuple format unexpected, parts:', parts);
                console.log('⚠️ Using default threshold: 80');
              }
            } else if (typeof rawValue === 'number') {
              // Direct number format (fallback)
              fetchedThreshold = Number(rawValue);
              setAlertThreshold(fetchedThreshold);
              console.log('✅ Alert threshold (direct number):', fetchedThreshold);
            } else {
              console.warn('⚠️ Unexpected threshold format:', rawValue);
              console.log('⚠️ Using default threshold: 80');
            }
          }
        } else {
          console.warn('⚠️ GetThresholdConfig failed, using default threshold: 80');
        }
        
        console.log('✅ Final fetchedThreshold for API Monitor:', fetchedThreshold);

        if (!mounted) return;

        // STEP 2: Fetch traffic data - default load all data (no date filter)
        await fetchTrafficData();
        
        if (!mounted) return;

        // STEP 3: Fetch ASN shortlist data
        console.log('🔄 Fetching ASN shortlist from API...');
        const asnRes = await Tab1Service.GetASNShortlist();
        console.log('📦 GetASNShortlist full response:', JSON.stringify(asnRes, null, 2));
        console.log('📦 asnRes.success:', asnRes?.success);
        console.log('📦 asnRes.data:', asnRes?.data);
        console.log('📦 asnRes.data is Array:', Array.isArray(asnRes?.data));
        console.log('📦 asnRes.data.length:', asnRes?.data?.length);
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, skipping ASN data update');
          return;
        }
        
        // Check if API response has data
        if (asnRes && asnRes.success === true && asnRes.data && Array.isArray(asnRes.data) && asnRes.data.length > 0) {
          console.log('✅ GetASNShortlist SUCCESS - Data count:', asnRes.data.length);
          console.log('✅ First item:', asnRes.data[0]);
          
          // Transform API data to ASNTable format - Simplified
          // API returns: {id, asn, asName, groupId, updatedAt, userUpdate}
          // Just add STT and map field names
          const transformedASN = asnRes.data.map((item, index) => ({
            ...item,
            stt: index + 1,
            prtgId: item.groupId,
            timeAdded: item.updatedAt,
            prefixes: []
          }));
          
          console.log('✅ Simplified ASN data:', transformedASN);
          setAsnData(transformedASN);
        } else {
          console.error('❌ GetASNShortlist FAILED or empty');
          console.error('Full Response:', asnRes);
          console.error('Check - success:', asnRes?.success);
          console.error('Check - data exists:', !!asnRes?.data);
          console.error('Check - data is array:', Array.isArray(asnRes?.data));
          console.error('Check - data length:', asnRes?.data?.length);
          console.warn('⚠️ Keeping empty asnData to show error state');
          // Don't set mockData - keep empty [] to show no data message
        }

        // Fetch warning data (separate API for LastWarningBox)
        console.log('🔄 Fetching Last Warning from API...');
        const warningRes = await Tab1Service.GetLastWarning();
        console.log('📦 GetLastWarning response:', warningRes);
        
        if (warningRes?.status === 'success' && warningRes.data) {
          console.log('✅ GetLastWarning SUCCESS');
          
          // Check if API has old format (with policer data) for LastWarningBox
          if (warningRes.data.max_as_shortlist_traffic) {
            // Transform API response to LastWarningBox format
            // API returns: {id, max_as_shortlist_traffic, total_traffic_ipt, total_capacity, policer_bw, policer_template, updated_at, as_shortlist}
            // Component expects: {lastWarningTime, message, asn, bandwidth, recommendation}
            const date = new Date(warningRes.data.updated_at);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;
            
            // Calculate utilization percentage
            const utilizationPercent = ((warningRes.data.total_traffic_ipt / warningRes.data.total_capacity) * 100).toFixed(2);
            
            const transformedWarning = {
              lastWarningTime: formattedTime,
              message: `Traffic IPT đạt ${warningRes.data.total_traffic_ipt} Gbps (${utilizationPercent}% capacity)`,
              asn: `AS${warningRes.data.as_shortlist}`,
              bandwidth: `${warningRes.data.policer_bw}g`,
              recommendation: warningRes.data.policer_template
            };
            
            console.log('✅ Transformed warning data:', transformedWarning);
            setWarningData(transformedWarning);
          } else {
            console.log('⚠️ API response only contains threshold, no warning detail data');
            setWarningData(null);
          }
        } else {
          console.warn('⚠️ GetLastWarning failed:', warningRes?.message || 'No data');
          console.warn('⚠️ Setting warningData to null to show error state');
          setWarningData(null);
        }

        // STEP 4: Fetch API monitor status from traffic API (real-time utilization)
        // NOTE: This uses fetchedThreshold (local variable) to avoid React state delay
        console.log('🔄 Fetching API Monitor data from /api/traffic...');
        const monitorRes = await Tab1Service.GetTrafficData();
        if (monitorRes?.success && Array.isArray(monitorRes.data) && monitorRes.data.length > 0) {
          // Get latest traffic data (last item in array)
          const latestTraffic = monitorRes.data[monitorRes.data.length - 1];
          const utilizationPercent = Number(latestTraffic.utilizationPercent) || 0;
          
          // Transform to ApiMonitorBox format
          const date = new Date(latestTraffic.updatedAt);
          const formattedTime = date.toLocaleString('vi-VN');
          
          const transformedMonitorData = {
            status: Number(utilizationPercent.toFixed(2)), // Keep 2 decimal places
            threshold: fetchedThreshold, // Use fetchedThreshold from STEP 1 (not state)
            timestamp: formattedTime,
            note: `Traffic: ${latestTraffic.trafficInTotal} Gbps / ${latestTraffic.capacityTotal} Gbps`
          };
          
          console.log('✅ API Monitor data created with threshold:', fetchedThreshold);
          console.log('✅ API Monitor data:', transformedMonitorData);
          setApiMonitorData(transformedMonitorData);
        } else {
          console.warn('⚠️ Failed to fetch API Monitor data from traffic API');
          // Keep apiMonitorData as null to show no data state
        }

        // STEP 5: Fetch last policer config data
        console.log('🔄 Fetching Last Policer Config from /api/Lasted-config-policer...');
        const policerRes = await Tab1Service.GetLastedConfigPolicer();
        console.log('📦 GetLastedConfigPolicer response:', policerRes);
        
        if (policerRes?.status === 'success' && policerRes.data) {
          console.log('✅ GetLastedConfigPolicer SUCCESS');
          
          // Transform API response to LastPolicerBox format
          // API returns: {status, data: {...}, updated_at, asn, policer_bw, device_list: [{name, hostname}], config_commands}
          // Component expects: {lastPolicerTime, asn, bandwidth, deviceCount, status, ...detailFields}
          
          const date = new Date(policerRes.updated_at);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;
          
          // Calculate time since execution
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          let timeSinceExecution = '';
          if (diffDays > 0) {
            timeSinceExecution = `${diffDays} ngày trước`;
          } else if (diffHours > 0) {
            timeSinceExecution = `${diffHours} giờ trước`;
          } else {
            timeSinceExecution = `${diffMins} phút trước`;
          }
          
          // Transform device_list to devices array for detail modal
          const transformedDevices = (policerRes.device_list || []).map(device => ({
            name: device.name,
            hostname: device.hostname,
            status: 'Applied successfully',
            statusColor: '#10b981'
          }));
          
          // Generate config command from policer_bw and asn
          const configCommand = policerRes.config_commands && policerRes.config_commands.length > 0 
            ? policerRes.config_commands[0] 
            : `set firewall filter Protect-VN2-from-Upstream-Transit term Policer-AS${policerRes.asn} then policer ${policerRes.policer_bw}g`;
          
          const transformedPolicerData = {
            lastPolicerTime: formattedTime,
            asn: `AS${policerRes.asn}`,
            bandwidth: `${policerRes.policer_bw}g`,
            deviceCount: (policerRes.device_list || []).length,
            status: 'Applied successfully',
            // For detail modal
            timeSinceExecution: timeSinceExecution,
            configCommand: configCommand,
            devicesApplied: (policerRes.device_list || []).length,
            totalDevices: (policerRes.device_list || []).length,
            successRate: 100,
            devices: transformedDevices
          };
          
          console.log('✅ Transformed policer data:', transformedPolicerData);
          setLastPolicerData(transformedPolicerData);
        } else {
          console.warn('⚠️ GetLastedConfigPolicer failed:', policerRes?.message || 'No data');
          console.warn('⚠️ Using mockLastPolicerData as fallback');
          setLastPolicerData(mockLastPolicerData);
        }
      } catch (err) {
        console.error('❌ Fetch data ERROR:', err);
        console.error('Error message:', err?.message);
        console.error('Error stack:', err?.stack);
        console.warn('⚠️ Keeping mockChartData, empty asnData on error');
        // Don't set chartData - keep initial mockChartData
        // Don't set asnData - keep empty [] to show error state
        // Don't set warningData - keep null to show error state
        // Don't set apiMonitorData - keep null to show error state
        setLastPolicerData(mockLastPolicerData);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Auto-refresh effect: Only active when currentPeriod is '1d' (Realtime mode)
  // Refreshes data every 5 minutes to keep chart up-to-date
  React.useEffect(() => {
    let intervalId = null;
    
    if (currentPeriod === '1d') {
      console.log('🔄 Auto-refresh ENABLED for 1-day period (every 5 minutes)');
      
      // Fetch immediately when entering realtime mode
      const fetchRealtime = async () => {
        console.log('🔄 Fetching realtime traffic data (immediate)...');
        const now = new Date();
        const end = now.toISOString().split('T')[0];
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        await fetchTrafficData(start, end);
        setLastUpdateTime(new Date().toLocaleTimeString('vi-VN'));
      };
      
      // Fetch immediately (don't wait for interval)
      fetchRealtime();
      
      // Set up interval to refresh every 5 minutes
      intervalId = setInterval(fetchRealtime, 300000); // 5 minutes (300 seconds)
    } else {
      console.log('⏸️ Auto-refresh DISABLED (period is not 1d)');
    }
    
    // Cleanup interval on period change or unmount
    return () => {
      if (intervalId) {
        console.log('🛑 Clearing auto-refresh interval');
        clearInterval(intervalId);
      }
    };
  }, [currentPeriod]);

  // Auto-refresh API Monitor data every 60 seconds (always active for real-time monitoring)
  React.useEffect(() => {
    console.log('🔄 Auto-refresh ENABLED for API Monitor (every 60s)');
    
    const fetchApiMonitorData = async () => {
      try {
        console.log('🔄 Auto-refreshing API Monitor data...');
        const monitorRes = await Tab1Service.GetTrafficData();
        
        if (monitorRes?.success && Array.isArray(monitorRes.data) && monitorRes.data.length > 0) {
          const latestTraffic = monitorRes.data[monitorRes.data.length - 1];
          const utilizationPercent = Number(latestTraffic.utilizationPercent) || 0;
          
          const date = new Date(latestTraffic.updatedAt);
          const formattedTime = date.toLocaleString('vi-VN');
          
          const transformedMonitorData = {
            status: Number(utilizationPercent.toFixed(2)), // Keep 2 decimal places
            threshold: alertThreshold, // Use threshold from state (fetched from API)
            timestamp: formattedTime,
            note: `Traffic: ${latestTraffic.trafficInTotal} Gbps / ${latestTraffic.capacityTotal} Gbps`
          };
          
          console.log('✅ API Monitor auto-refresh updated:', transformedMonitorData);
          setApiMonitorData(transformedMonitorData);
        }
      } catch (err) {
        console.error('❌ Auto-refresh API Monitor error:', err);
      }
    };
    
    // Fetch immediately on mount (don't wait for interval)
    fetchApiMonitorData();
    
    // Set up interval to refresh every 60 seconds
    const intervalId = setInterval(fetchApiMonitorData, 60000);
    
    // Cleanup interval on unmount
    return () => {
      console.log('🛑 Clearing API Monitor auto-refresh interval');
      clearInterval(intervalId);
    };
  }, [alertThreshold]);

  // Handler: Period change from LineChart component
  const handlePeriodChange = async (startDate, endDate, period) => {
    console.log('📅 Period change requested:', { startDate, endDate, period });
    setCurrentPeriod(period || '1d'); // Update period for X-axis formatting
    setLoading(true);
    await fetchTrafficData(startDate, endDate);
    setLastUpdateTime(new Date().toLocaleTimeString('vi-VN'));
    setLoading(false);
  };

  // Handler: Open Last Policer detail modal when box is clicked
  const handleLastPolicerClick = () => {
    setShowPolicerDetail(true);
  };

  // Handler: Close Last Policer detail modal
  const handlePolicerDetailClose = () => {
    setShowPolicerDetail(false);
  };

  // Handler: Open config modal when API Monitor alert is clicked
  // Only opens if status >= threshold (alert condition from API)
  const handleApiMonitorClick = () => {
    if (apiMonitorData && apiMonitorData.status >= apiMonitorData.threshold) {
      console.log('⚠️ Alert clicked! Status:', apiMonitorData.status, 'Threshold:', apiMonitorData.threshold);
      
      if (!asnData || asnData.length === 0) {
        alert('Không có dữ liệu ASN để cấu hình');
        return;
      }
      
      setSelectedASN(asnData[0]);
      setConfigDetail({ as: asnData[0].asn, bandwidth: '29 Gbps' });
      setSelectedDevices([]);
      setModalState('config');
    } else {
      console.log('ℹ️ API Monitor clicked but not in alert state. Status:', apiMonitorData?.status, 'Threshold:', apiMonitorData?.threshold);
    }
  };

  // Handler: Open delete confirmation modal
  const handleDeleteClick = (asn) => {
    setDeleteConfirmASN(asn);
    setModalState('deleteConfirm');
  };

  // Handler: Confirm deletion of ASN from the table
  const handleConfirmDelete = async () => {
    if (deleteConfirmASN) {
      console.log('🗑️ Deleting ASN:', deleteConfirmASN);
      
      try {
        // Call API to delete ASN from database
        const result = await Tab1Service.DeleteASN(deleteConfirmASN.id);
        
        if (result?.success) {
          console.log('✅ ASN deleted successfully from database');
          // Remove from UI state after successful deletion
          setAsnData(asnData.filter(row => row.id !== deleteConfirmASN.id));
          setModalState('closed');
          setDeleteConfirmASN(null);
        } else {
          console.error('❌ Delete ASN failed:', result?.message);
          alert('Lỗi khi xóa ASN: ' + (result?.message || 'Không thể xóa ASN khỏi database'));
          setModalState('closed');
          setDeleteConfirmASN(null);
        }
      } catch (err) {
        console.error('❌ Delete ASN error:', err);
        alert('Lỗi khi xóa ASN: ' + err.message);
        setModalState('closed');
        setDeleteConfirmASN(null);
      }
    }
  };

  // Handler: Cancel deletion and close modal
  const handleDeleteCancel = () => {
    setModalState('closed');
    setDeleteConfirmASN(null);
  };

  // Handler: Toggle ASN row expansion to show/hide prefix details
  const handleASNRowClick = (row) => {
    setExpandedASNId(expandedASNId === row.id ? null : row.id);
  };

  // Handler: Add or remove device from selected devices list
  const handleDeviceChange = (device, checked) => {
    setSelectedDevices(checked ? [...selectedDevices, device] : selectedDevices.filter(d => d !== device));
  };

  // Handler: Select all or deselect all devices (6 POPs)
  const handleSelectAllDevices = (checked) => {
    if (checked) {
      setSelectedDevices(['HKG-EQX-POP01', 'HKG-EQX-POP02', 'HKG-MEGA-POP01', 'HKG-MEGA-POP02', 'SGP-EQX-POP01', 'SGP-GLS-POP01']);
    } else {
      setSelectedDevices([]);
    }
  };

  // Handler: Validate device selection and move to confirm modal
  const handleConfigApply = () => {
    if (selectedDevices.length === 0) {
      alert('Vui lòng chọn ít nhất một thiết bị');
      return;
    }
    setConfirmDevices(selectedDevices);
    setModalState('confirm');
  };

  // Handler: Close config modal and reset selections
  const handleConfigCancel = () => {
    setModalState('closed');
    setSelectedASN(null);
    setSelectedDevices([]);
  };

  // Handler: Confirm and apply configuration - Calls API to apply policer config
  // Sends request to backend with ASN, bandwidth, and selected devices
  const handleConfirmApply = async () => {
    setModalState('closed');
    try {
      // Call real API to apply policer configuration
      const res = await Tab1Service.ApplyPolicerConfig(
        configDetail.as,
        configDetail.bandwidth,
        confirmDevices
      );

      // Process API response
      let resultData;
      if (res?.success && res.data?.results && Array.isArray(res.data.results)) {
        // Backend returned detailed results for each device
        resultData = {
          timestamp: new Date().toLocaleString('vi-VN'),
          selectedDevices: confirmDevices,
          configDetail: configDetail,
          results: res.data.results
        };
      } else if (res?.success) {
        // Backend returned success but no detailed results
        // Show success for all devices (data from API, not random)
        resultData = {
          timestamp: new Date().toLocaleString('vi-VN'),
          selectedDevices: confirmDevices,
          configDetail: configDetail,
          results: confirmDevices.map(device => ({
            device,
            status: 'success',
            message: 'Cấu hình thành công'
          }))
        };
      } else {
        // API returned error or unexpected response
        const errorMsg = res?.message || 'Không thể áp dụng cấu hình';
        alert('Lỗi: ' + errorMsg);
        return;
      }

      setResultData(resultData);
      setModalState('result');
    } catch (err) {
      console.error('ApplyPolicerConfig error:', err);
      alert('Lỗi khi áp dụng cấu hình: ' + err.message);
    }
  };

  // Handler: Go back from confirm modal to config modal
  const handleConfirmCancel = () => {
    setModalState('config');
  };

  // Handler: Close result modal and reset all state
  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setSelectedASN(null);
    setSelectedDevices([]);
    setConfirmDevices([]);
  };

  // Debug: Log chartData whenever it changes
  React.useEffect(() => {
    console.log('📊 chartData STATE CHANGED, length:', chartData?.length, 'first item:', chartData?.[0]);
  }, [chartData]);

  // Debug: Log asnData whenever it changes
  React.useEffect(() => {
    console.log('📋 asnData STATE CHANGED!');
    console.log('📋 asnData length:', asnData?.length);
    console.log('📋 asnData full:', JSON.stringify(asnData, null, 2));
  }, [asnData]);

  // Render layout with 2-column grid: left (LineChart + ASN Table), right (API Monitor + Last Warning)
  return (
    <div className="i001-container tab1-content">
      <div className="i001-header">
        <h2>IP Transit Policer - Monitoring System</h2>
        <p className="i001-header-subtitle">Quản lý lưu lượng IPTransit - Policer</p>
      </div>

      <div className="i001-content">
        {/* Loading indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', gridColumn: '1/-1' }}>
            ⏳ Đang tải dữ liệu từ API...
          </div>
        )}
        
        {/* Left Column: Line Chart and ASN Table */}
        <div className="i001-left">
          <div className="i001-section">
            <LineChartIPT data={chartData} onPeriodChange={handlePeriodChange} currentPeriod={currentPeriod} lastUpdateTime={lastUpdateTime} />
          </div>
          <div className="i001-section">
            <h3 className="section-title">Các ASN được counter</h3>
            <ASNTable data={asnData} expandedASNId={expandedASNId} onRowClick={handleASNRowClick} onDeleteClick={handleDeleteClick} />
          </div>
        </div>

        {/* Right Column: API Monitor Box, Last Warning Box, and Last Policer Box */}
        <div className="i001-right">
          <div className="i001-info-box">
            {apiMonitorData ? (
              <ApiMonitorBox data={apiMonitorData} onClick={handleApiMonitorClick} />
            ) : (
              <div className="api-monitor-box" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div className="monitor-header">
                  <div className="monitor-title-group">
                    <span className="monitor-icon">⚠️</span>
                    <h4>API Monitor</h4>
                  </div>
                </div>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                <p style={{ fontSize: '14px' }}>Đang tải dữ liệu realtime từ API...</p>
              </div>
            )}
          </div>
          <div className="i001-info-box">
            <LastWarningBox data={warningData} />
          </div>
          <div className="i001-info-box">
            <LastPolicerBox data={lastPolicerData} onClick={handleLastPolicerClick} />
          </div>
        </div>
      </div>

      {/* Modal Dialogs - config/confirm/result flow */}
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
        <ResultModal result={resultData} onClose={handleResultClose} />
      )}

      {/* Modal: Delete Confirmation */}
      {modalState === 'deleteConfirm' && deleteConfirmASN && (
        <DeleteConfirmModal
          asn={deleteConfirmASN}
          onConfirm={handleConfirmDelete}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Modal: Last Policer Detail */}
      {showPolicerDetail && (
        <LastPolicerDetailModal
          data={lastPolicerData}
          onClose={handlePolicerDetailClose}
        />
      )}
    </div>
  );
}

export default Tab1;
