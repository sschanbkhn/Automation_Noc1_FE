import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockChartData, mockASNData, mockWarningData, mockApiMonitorData, mockLastPolicerData } from './mockData';
import Tab1Service from 'services/Tab1Service';

// LineChartIPT Component - Displays traffic monitoring line chart with 3 metrics
// Features: Period selection (1h, 6h, 24h, Custom), day/time range picker, legend with traffic/capacity/efficiency
const LineChartIPT = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1h');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  // Handle period button clicks to switch between predefined time ranges
  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    setUseCustomRange(false);
  };

  // Toggle custom date/time range picker visibility
  const handleCustomRangeToggle = () => {
    setUseCustomRange(!useCustomRange);
  };

  return (
    <div className="linechart-container">
      <div className="linechart-header">
        <h3 className="linechart-title">Lưu lượng IPT - Traffic Monitoring</h3>
        <p className="linechart-subtitle">Lưu lượng cao nhất theo ngày - Traffic monitoring (Gbps) - 1 phút/lần</p>
        <div className="linechart-controls">
          <div className="period-buttons">
            <button className={`period-btn ${selectedPeriod === '1h' && !useCustomRange ? 'active' : ''}`} onClick={() => handlePeriodClick('1h')}>1 ngày</button>
            <button className={`period-btn ${selectedPeriod === '6h' && !useCustomRange ? 'active' : ''}`} onClick={() => handlePeriodClick('6h')}>7 ngày</button>
            <button className={`period-btn ${selectedPeriod === '24h' && !useCustomRange ? 'active' : ''}`} onClick={() => handlePeriodClick('24h')}>1 tháng</button>
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
              <button className="range-apply-btn">Áp dụng</button>
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
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Gbps / %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => value.toFixed(2)}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Throughput (Gbps)"
              />
              <Line
                type="monotone"
                dataKey="capacity"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Capacity (Gbps)"
              />
              <Line
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
      <div className="linechart-footer">
        <span>Cập nhật lần cuối: 2 phút trước</span>
        <span>Khoảng thời gian: 1 phút/lần</span>
        <span>Trạng thái: Bình thường</span>
      </div>
    </div>
  );
};

// ASNTable Component - Displays list of ASNs being countered with expandable prefix details
// Features: STT/ASN/AS Name/PRTG-ID columns, expandable rows showing prefixes, delete action button with confirmation
const ASNTable = ({ data, expandedASNId, onRowClick, onDeleteClick }) => (
  <div className="asn-table-container">
    <table className="asn-table">
      <thead>
        <tr>
          <th style={{ width: '50px' }}>STT</th>
          <th style={{ width: '120px' }}>ASN</th>
          <th>AS Name</th>
          <th style={{ width: '150px' }}>PRTG-ID</th>
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
                <td colSpan={5}>
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
  </div>
);

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
const LastWarningBox = ({ data }) => (
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
  const [chartData] = useState(mockChartData);
  const [asnData, setAsnData] = useState(mockASNData);
  const [warningData] = useState(mockWarningData);
  const [apiMonitorData] = useState(mockApiMonitorData);
  const [lastPolicerData] = useState(mockLastPolicerData);

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

  // Handler: Open Last Policer detail modal when box is clicked
  const handleLastPolicerClick = () => {
    setShowPolicerDetail(true);
  };

  // Handler: Close Last Policer detail modal
  const handlePolicerDetailClose = () => {
    setShowPolicerDetail(false);
  };

  // Handler: Open config modal when API Monitor alert is clicked
  // Only opens if status >= 80% (alert condition)
  const handleApiMonitorClick = () => {
    if (apiMonitorData.status >= 80) {
      setSelectedASN(asnData[0]);
      setConfigDetail({ as: asnData[0].asn, bandwidth: '29 Gbps' });
      setSelectedDevices([]);
      setModalState('config');
    }
  };

  // Handler: Open delete confirmation modal
  const handleDeleteClick = (asn) => {
    setDeleteConfirmASN(asn);
    setModalState('deleteConfirm');
  };

  // Handler: Confirm deletion of ASN from the table
  const handleConfirmDelete = () => {
    if (deleteConfirmASN) {
      setAsnData(asnData.filter(row => row.id !== deleteConfirmASN.id));
      setModalState('closed');
      setDeleteConfirmASN(null);
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

  // Handler: Confirm and apply configuration - Calls N8n, shows result modal
  // Simulates API call with mock success/failure results (80% success rate)
  const handleConfirmApply = () => {
    setModalState('closed');
    // Mock N8n response - in production, would call Tab1Service.ApplyPolicer()
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

  // Render layout with 2-column grid: left (LineChart + ASN Table), right (API Monitor + Last Warning)
  return (
    <div className="i001-container tab1-content">
      <div className="i001-header">
        <h2>IP Transit Policer - Monitoring System</h2>
        <p className="i001-header-subtitle">Quản lý lưu lượng IPTransit - Policer</p>
      </div>

      <div className="i001-content">
        {/* Left Column: Line Chart and ASN Table */}
        <div className="i001-left">
          <div className="i001-section">
            <LineChartIPT data={chartData} />
          </div>
          <div className="i001-section">
            <h3 className="section-title">Các ASN được counter</h3>
            <ASNTable data={asnData} expandedASNId={expandedASNId} onRowClick={handleASNRowClick} onDeleteClick={handleDeleteClick} />
          </div>
        </div>

        {/* Right Column: API Monitor Box, Last Warning Box, and Last Policer Box */}
        <div className="i001-right">
          <div className="i001-info-box">
            <ApiMonitorBox data={apiMonitorData} onClick={handleApiMonitorClick} />
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
