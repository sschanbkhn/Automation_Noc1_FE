import React, { useState } from 'react';
import { mockChartData, mockASNData, mockWarningData, mockApiMonitorData } from './mockData';

// ============================================
// TYPE DEFINITIONS & INTERFACES
// ============================================

/**
 * Represents a single ASN (Autonomous System Number) row in the table
 * Contains traffic statistics (Max In/Out) and associated prefix information
 */
interface ASNRowData {
  id: number;
  stt: number;
  asn: string;
  asName: string;
  maxIn: string;
  maxOut: string;
  prefixes?: string[];
}

/**
 * Modal state type for managing different modal views in Tab1
 * - 'closed': No modal is open
 * - 'config': Configuration modal (Config Policer) is open
 * - 'confirm': Confirmation modal for applying config is open
 * - 'result': Result modal showing config results is open
 */
type ModalState = 'closed' | 'config' | 'confirm' | 'result';

// ============================================
// SUB COMPONENTS - LINE CHART & STATISTICS
// ============================================

/**
 * LineChartIPT Component
 * Displays throughput vs capacity statistics for IPT (IP Transit)
 * Features:
 * - Period selection buttons (1h, 6h, 24h)
 * - Legend showing Throughput, Capacity, and Efficiency
 * - Chart placeholder ready for ApexCharts integration
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data points
 */
const LineChartIPT: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="linechart-container">
    <div className="linechart-header">
      <h3 className="linechart-title">Thống kê lưu lượng IPT (Throughput vs Capacity)</h3>
      <div className="linechart-controls">
        <div className="period-buttons">
          <button className="period-btn active">1h</button>
          <button className="period-btn">6h</button>
          <button className="period-btn">24h</button>
        </div>
      </div>
    </div>
    {/* Legend showing different traffic metrics */}
    <div className="linechart-legend">
      <div className="legend-item">
        <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
        Throughput
      </div>
      <div className="legend-item">
        <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
        Capacity
      </div>
      <div className="legend-item">
        <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
        Efficiency
      </div>
    </div>
    {/* Chart placeholder - will be replaced with ApexCharts */}
    <div style={{ height: '300px', background: '#f9fafb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9ca3af' }}>📊 Chart placeholder - Ready for ApexCharts integration</p>
    </div>
    {/* Footer showing last update time and status */}
    <div className="linechart-footer">
      <span>Data updated: 2 minutes ago</span>
      <span>Status: Normal</span>
    </div>
  </div>
);

// ============================================
// SUB COMPONENTS - DATA TABLES
// ============================================

/**
 * ASNTable Component
 * Displays table of ASNs (Autonomous System Numbers) with traffic information
 * Features:
 * - Shows ASN details: STT (number), ASN, AS Name, Max In, Max Out
 * - Expandable rows showing associated prefixes
 * - Click to expand/collapse prefix details
 * 
 * @param {Object} props - Component props
 * @param {ASNRowData[]} props.data - Array of ASN data rows
 * @param {number | null} props.expandedASNId - ID of currently expanded row
 * @param {Function} props.onRowClick - Callback when row is clicked
 */
const ASNTable: React.FC<{ data: ASNRowData[]; expandedASNId: number | null; onRowClick: (row: ASNRowData) => void }> = ({
  data,
  expandedASNId,
  onRowClick
}) => (
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
            {/* Main row - clickable to expand */}
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
                {/* Expand/collapse icon */}
                {row.prefixes && row.prefixes.length > 0 && (
                  <span className="expand-icon">
                    {expandedASNId === row.id ? '▼' : '▶'}
                  </span>
                )}
              </td>
            </tr>

            {/* Expanded row - shows associated prefixes */}
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

// ============================================
// SUB COMPONENTS - STATUS BOXES
// ============================================

/**
 * ApiMonitorBox Component
 * Displays API usage status with progress bar and alert capabilities
 * Features:
 * - Shows current API usage percentage
 * - Visual progress bar with threshold marking
 * - Alert mode when usage exceeds threshold
 * - Clickable to open configuration modal
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Monitor data including status, threshold
 * @param {Function} props.onClick - Callback when box is clicked
 */
const ApiMonitorBox: React.FC<{ data: any; onClick: () => void }> = ({ data, onClick }) => {
  // Determine if alert state is active (when usage >= threshold)
  const isAlert = data.status >= data.threshold;
  
  return (
    <div className={`api-monitor-box ${isAlert ? 'alert-mode blink' : ''}`} onClick={onClick}>
      {/* Header section with title and alert badge */}
      <div className="monitor-header">
        <div className="monitor-title-group">
          <span className="monitor-icon">📡</span>
          <h4>API Monitor Status</h4>
        </div>
        {isAlert && <span className="alert-badge">ALERT</span>}
      </div>

      {/* Main status display - shows current percentage */}
      <div className="monitor-status">
        <div className="status-percentage">
          <span className="percentage-value">{data.status}%</span>
          <span className="percentage-label">API Usage</span>
        </div>
      </div>

      {/* Progress bar visualization */}
      <div className="monitor-progress">
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${data.status}%`, 
              background: isAlert ? '#dc2626' : '#10b981' // Red if alert, green if normal
            }}
          ></div>
        </div>
        {/* Progress scale labels */}
        <div className="progress-labels">
          <span>0%</span>
          <span className={isAlert ? 'threshold-mark' : ''}>{data.threshold}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Threshold information */}
      <div className="monitor-threshold">
        <span className="label">Threshold:</span>
        <span className="value">{data.threshold}%</span>
      </div>

      {/* Footer with timestamp and status note */}
      <div className="monitor-footer">
        <span className="timestamp">{data.timestamp}</span>
        <span className="note">{data.note}</span>
      </div>

      {/* Alert message when threshold is exceeded */}
      {isAlert && <div className="alert-message">⚠️ API usage is above threshold! Click to configure.</div>}
    </div>
  );
};

/**
 * LastWarningBox Component
 * Displays the most recent warning/alarm information
 * Shows: warning time, ASN, bandwidth, and system recommendation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Warning data including message, ASN, bandwidth
 */
const LastWarningBox: React.FC<{ data: any }> = ({ data }) => (
  <div className="warning-box">
    {/* Header with warning icon */}
    <div className="warning-header">
      <span className="warning-icon">⚠️</span>
      <h4>Cảnh báo gần đây nhất</h4>
    </div>

    {/* Warning details section */}
    <div className="warning-content">
      <div className="warning-time">
        <span className="label">Thời gian:</span>
        <span className="value">{data.lastWarningTime}</span>
      </div>

      {/* Warning details: message, ASN, and bandwidth info */}
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

      {/* System recommendation in code format */}
      <div className="warning-recommendation">
        <span className="label">Khuyến nghị:</span>
        <code className="recommendation-code">{data.recommendation}</code>
      </div>
    </div>

    {/* Footer hint */}
    <div className="warning-footer">Bấm để xem chi tiết</div>
  </div>
);

// ============================================
// MODAL COMPONENTS - API POPUPS
// ============================================

/**
 * ConfigPolicerModal Component (API Popup #1)
 * Modal for configuring policer rules for a specific ASN
 * Features:
 * - Displays recommended configuration with ASN and bandwidth
 * - Shows generated firewall configuration command
 * - Device selection checkbox grid (12 devices)
 * - Select all/deselect all functionality
 * - Apply and Cancel buttons
 * 
 * @param {Object} props - Component props
 * @param {string} props.asn - ASN number to configure
 * @param {string} props.bandwidth - Bandwidth limit
 * @param {string[]} props.selectedDevices - Currently selected devices
 * @param {Function} props.onDeviceChange - Callback when device selection changes
 * @param {Function} props.onSelectAll - Callback when select all is toggled
 * @param {Function} props.onApply - Callback when Apply is clicked
 * @param {Function} props.onCancel - Callback when Cancel is clicked
 */
const ConfigPolicerModal: React.FC<{
  asn: string;
  bandwidth: string;
  selectedDevices: string[];
  onDeviceChange: (device: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
}> = ({ asn, bandwidth, selectedDevices, onDeviceChange, onSelectAll, onApply, onCancel }) => {
  // List of all available devices (POPs and ASBRs)
  const allDevices = [
    'SPG-POP01', 'SPG-POP02',
    'HKG-POP01', 'HKG-POP02', 'HKG-EQX-POP01', 'HKG-EQX-POP02',
    'HCM-ASBR2', 'HCM-ASBR5',
    'HNI-ASBR2', 'HNI-ASBR3',
    'DNG-ASBR2', 'DNG-ASBR3'
  ];
  
  // Check if all devices are selected
  const isAllSelected = selectedDevices.length === allDevices.length;
  
  // Generate firewall configuration command
  const configCommand = `set firewall filter Protect-VN2-from-Upstream-Transit term Policer-${asn} then policer ${bandwidth}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal header with title and close button */}
        <div className="modal-header">
          <h3>Config Khuyến nghị</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Configuration information section */}
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

          {/* Generated firewall command (can be copied to clipboard) */}
          <div className="config-code">
            <div className="code-label">Lệnh cấu hình:</div>
            <code className="code-block">{configCommand}</code>
          </div>
        </div>

        {/* Device selection section */}
        <div className="device-selection">
          <div className="device-header"><strong>Chọn thiết bị POP/Peering (12 thiết bị)</strong></div>

          {/* Select all checkbox */}
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

          {/* Device checkbox grid */}
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

        {/* Modal footer with action buttons */}
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

/**
 * ConfirmModal Component (API Popup #2)
 * Confirmation modal before applying configuration to devices
 * Shows summary of devices and configuration details
 * User must confirm before configuration is actually applied
 * 
 * @param {Object} props - Component props
 * @param {string[]} props.devices - List of devices to apply config to
 * @param {Object} props.configDetail - Configuration details (AS, bandwidth)
 * @param {Function} props.onApply - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 */
const ConfirmModal: React.FC<{
  devices: string[];
  configDetail: { as: string; bandwidth: string };
  onApply: () => void;
  onCancel: () => void;
}> = ({ devices, configDetail, onApply, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
      {/* Modal header */}
      <div className="modal-header">
        <h3>Xác nhận cấu hình</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      {/* Confirmation message */}
      <div className="confirm-message">
        <p>Bạn có chắc muốn áp dụng cấu hình này vào {devices.length} thiết bị đã chọn?</p>
      </div>

      {/* Configuration summary */}
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

      {/* List of selected devices */}
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

      {/* Important warning about configuration */}
      <div className="confirm-warning">
        <strong>⚠️ Lưu ý quan trọng</strong>
        <p>Cấu hình sẽ được áp dụng ngay lập tức. Không thể hoàn tác sau khi xác nhận.</p>
      </div>

      {/* Modal footer with action buttons */}
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-primary" onClick={onApply}>Xác nhận</button>
      </div>
    </div>
  </div>
);

/**
 * ResultModal Component (API Popup #3)
 * Displays configuration result summary after applying configuration to devices
 * Shows success/failure count and details for each device
 * 
 * @param {Object} props - Component props
 * @param {Object} props.result - Result data with success/failed counts and details
 * @param {Function} props.onClose - Callback when modal is closed
 */
const ResultModal: React.FC<{
  result: any;
  onClose: () => void;
}> = ({ result, onClose }) => {
  // Calculate success and failed counts from results
  const successCount = result.results.filter((r: any) => r.status === 'success').length;
  const failedCount = result.results.filter((r: any) => r.status === 'failed').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-result" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Result summary cards showing success/failure statistics */}
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

        {/* Configuration details */}
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

        {/* Detailed results for each device */}
        <div className="result-details">
          <h4>Chi tiết từng thiết bị:</h4>
          <div className="result-list">
            {result.results.map((item: any, idx: number) => (
              <div key={idx} className={`result-item ${item.status}`}>
                {/* Status icon */}
                <div className="result-icon">{item.status === 'success' ? '✓' : '✗'}</div>
                {/* Device name and result message */}
                <div className="result-info">
                  <div className="result-device">{item.device}</div>
                  <div className="result-message">{item.message}</div>
                </div>
                {/* Status label */}
                <div className="result-status">
                  {item.status === 'success' ? 'Thành công' : 'Thất bại'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal footer with close button */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TAB 1 MAIN COMPONENT
// ============================================

/**
 * Tab1DashboardPolicer Component
 * Main component for Tab 1: Dashboard & Policer Management
 * 
 * Workflow:
 * 1. User views API Monitor Box - shows API usage percentage
 * 2. If API usage is high, user clicks API Monitor Box
 * 3. Config Policer Modal appears (user selects devices)
 * 4. Confirm Modal appears (user confirms selection)
 * 5. System applies configuration
 * 6. Result Modal shows success/failure for each device
 * 
 * Features:
 * - Line chart showing throughput vs capacity
 * - ASN table with expandable prefix details
 * - API monitor status with alert capability
 * - Last warning information box
 * - Three-step modal workflow for configuration
 */
const Tab1DashboardPolicer: React.FC = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Mock data
  const [chartData] = useState(mockChartData);
  const [asnData] = useState<ASNRowData[]>(mockASNData);
  const [warningData] = useState(mockWarningData);
  const [apiMonitorData] = useState(mockApiMonitorData);

  // UI state
  const [expandedASNId, setExpandedASNId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>('closed');

  // Configuration data
  const [selectedASN, setSelectedASN] = useState<ASNRowData | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [configDetail, setConfigDetail] = useState<{ as: string; bandwidth: string } | null>(null);
  const [confirmDevices, setConfirmDevices] = useState<string[]>([]);
  const [resultData, setResultData] = useState<any>(null);

  // ============================================
  // EVENT HANDLERS - WORKFLOW STEP 1
  // ============================================

  /**
   * Handle API Monitor Box click
   * If API usage is above 80%, open Config Policer Modal
   * Initializes configuration with first ASN from data
   */
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

  /**
   * Handle ASN row click in table
   * Toggle expand/collapse for prefix details
   */
  const handleASNRowClick = (row: ASNRowData) => {
    setExpandedASNId(expandedASNId === row.id ? null : row.id);
  };

  // ============================================
  // EVENT HANDLERS - WORKFLOW STEP 2 (Config Modal)
  // ============================================

  /**
   * Handle individual device checkbox change in Config Modal
   * Add/remove device from selectedDevices array
   */
  const handleDeviceChange = (device: string, checked: boolean) => {
    setSelectedDevices(
      checked 
        ? [...selectedDevices, device] 
        : selectedDevices.filter(d => d !== device)
    );
  };

  /**
   * Handle "Select All" checkbox in Config Modal
   * Select or deselect all 12 devices
   */
  const handleSelectAllDevices = (checked: boolean) => {
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

  /**
   * Handle Apply button in Config Modal
   * Validate device selection and move to Confirm Modal
   */
  const handleConfigApply = () => {
    if (selectedDevices.length === 0) {
      alert('Vui lòng chọn ít nhất một thiết bị');
      return;
    }
    setConfirmDevices(selectedDevices);
    setModalState('confirm');
  };

  /**
   * Handle Cancel button in Config Modal
   * Close modal and reset state
   */
  const handleConfigCancel = () => {
    setModalState('closed');
    setSelectedASN(null);
    setSelectedDevices([]);
  };

  // ============================================
  // EVENT HANDLERS - WORKFLOW STEP 3 (Confirm Modal)
  // ============================================

  /**
   * Handle Apply button in Confirm Modal
   * Send configuration to devices and generate result
   * In real scenario, this would call N8n API
   */
  const handleConfirmApply = () => {
    setModalState('closed');
    
    // Generate mock result (in real scenario, call N8n API here)
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

  /**
   * Handle Cancel button in Confirm Modal
   * Go back to Config Modal
   */
  const handleConfirmCancel = () => {
    setModalState('config');
  };

  // ============================================
  // EVENT HANDLERS - WORKFLOW STEP 4 (Result Modal)
  // ============================================

  /**
   * Handle Close button in Result Modal
   * Close all modals and reset configuration state
   */
  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setSelectedASN(null);
    setSelectedDevices([]);
    setConfirmDevices([]);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="i001-container tab1-content">
      {/* Page header */}
      <div className="i001-header">
        <h2>Quản lý lưu lượng IPTransit - Policer</h2>
      </div>

      {/* Main content layout: left side (chart + table), right side (info boxes) */}
      <div className="i001-content">
        {/* LEFT SECTION: Charts and Tables */}
        <div className="i001-left">
          {/* Throughput vs Capacity Chart */}
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

        {/* RIGHT SECTION: Info Boxes */}
        <div className="i001-right">
          {/* API Monitor Box - clickable to start configuration workflow */}
          <div className="i001-info-box">
            <ApiMonitorBox
              data={apiMonitorData}
              onClick={handleApiMonitorClick}
            />
          </div>

          {/* Last Warning Box - shows latest warning info */}
          <div className="i001-info-box">
            <LastWarningBox data={warningData} />
          </div>
        </div>
      </div>

      {/* ============================================
          MODAL WORKFLOW
          ============================================ */}

      {/* STEP 1: Configuration Modal - User selects devices */}
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

      {/* STEP 2: Confirmation Modal - User confirms selection */}
      {modalState === 'confirm' && configDetail && (
        <ConfirmModal
          devices={confirmDevices}
          configDetail={configDetail}
          onApply={handleConfirmApply}
          onCancel={handleConfirmCancel}
        />
      )}

      {/* STEP 3: Result Modal - Shows configuration results */}
      {modalState === 'result' && resultData && (
        <ResultModal
          result={resultData}
          onClose={handleResultClose}
        />
      )}
    </div>
  );
};

export default Tab1DashboardPolicer;
