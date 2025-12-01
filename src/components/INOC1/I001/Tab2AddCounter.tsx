import React, { useState, useMemo } from 'react';
import { mockTab2ASNData, ASNTab2Data, DEVICES_LIST } from './mockDataTab2';

// ============================================
// TYPE DEFINITIONS & INTERFACES
// ============================================

/**
 * Modal state type for managing different modal views in Tab2
 * - 'closed': No modal is open
 * - 'addCounter': Add Counter modal is open
 * - 'confirm': Confirmation modal is open
 * - 'result': Result display modal is open
 */
type ModalState = 'closed' | 'addCounter' | 'confirm' | 'result';

/**
 * Data structure for adding counter to ASN
 * Contains ASN info, selected prefixes, and target devices
 */
interface AddCounterData {
  asn: string;
  asName: string;
  selectedPrefixes: string[];
  selectedDevices: string[];
}

/**
 * Result data structure showing configuration results
 * Contains statistics (success/failure counts) and per-device details
 */
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

/**
 * TopASNTable Component
 * Displays TOP 20 ASNs with highest traffic
 * Features:
 * - Shows ASN details: STT, ASN, AS Name, Max In, Max Out
 * - Expandable rows showing detailed prefix information
 * - Prefixes show traffic statistics and whether already countered
 * 
 * @param {Object} props - Component props
 * @param {ASNTab2Data[]} props.data - Array of ASN data
 * @param {number | null} props.expandedASNId - ID of expanded row
 * @param {Function} props.onRowClick - Callback when row is clicked
 */
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
            {/* Main row - clickable to expand and see prefix details */}
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
                {/* Expand/collapse icon */}
                <span className="expand-icon">
                  {expandedASNId === row.id ? '▼' : '▶'}
                </span>
              </td>
            </tr>

            {/* Expanded row - shows detailed prefix information */}
            {expandedASNId === row.id && row.prefixes && (
              <tr className="prefix-row">
                <td colSpan={6}>
                  <div className="prefix-container">
                    <h4>Chi tiết Prefix:</h4>
                    <div className="prefix-details-list">
                      {row.prefixes.map((prefix, idx) => (
                        <div key={idx} className="prefix-detail-item">
                          {/* Prefix network and counter status */}
                          <div className="prefix-info">
                            <div className="prefix-name">
                              <span className="prefix-icon">📍</span>
                              <code>{prefix.prefix}</code>
                              {/* Badge indicating if prefix is already countered */}
                              {prefix.isCountered && (
                                <span className="countered-badge">Đã Counter</span>
                              )}
                            </div>
                          </div>
                          {/* Traffic statistics for this prefix */}
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

/**
 * AddCounterModal Component (API Popup #1)
 * Modal for adding traffic counter to an ASN and its prefixes
 * 
 * Workflow:
 * 1. User enters ASN (with autocomplete from list)
 * 2. AS Name is auto-filled if ASN is found
 * 3. User selects prefixes (disabled ones are already countered)
 * 4. User selects target devices (12 devices available)
 * 5. User clicks Apply to proceed to confirmation
 * 
 * Features:
 * - ASN input with autocomplete
 * - Prefix selection from available prefixes
 * - Device checkbox grid
 * - Select all/deselect all for devices
 * - Form validation before allowing Apply
 * 
 * @param {Object} props - Component props
 * @param {ASNTab2Data[]} props.asnList - List of all available ASNs
 * @param {Function} props.onApply - Callback with form data when Apply is clicked
 * @param {Function} props.onCancel - Callback when Cancel is clicked
 */
const AddCounterModal: React.FC<{
  asnList: ASNTab2Data[];
  onApply: (data: AddCounterData) => void;
  onCancel: () => void;
}> = ({ asnList, onApply, onCancel }) => {
  // ============================================
  // FORM STATE
  // ============================================

  const [inputASN, setInputASN] = useState('');
  const [inputASName, setInputASName] = useState('');
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // ============================================
  // COMPUTED VALUES - AUTOCOMPLETE & VALIDATION
  // ============================================

  /**
   * Find ASN in list (case-insensitive)
   * Used for autocomplete and validation
   */
  const foundASN = useMemo(() => {
    if (!inputASN.trim()) return null;
    return asnList.find((a) => a.asn.toUpperCase() === inputASN.trim().toUpperCase());
  }, [inputASN, asnList]);

  /**
   * Get available prefixes from found ASN
   * Empty if no ASN is found
   */
  const availablePrefixes = useMemo(() => {
    if (!foundASN) return [];
    return foundASN.prefixes || [];
  }, [foundASN]);

  /**
   * Validate form - all fields must be filled
   */
  const isFormValid = 
    inputASN.trim() !== '' && 
    inputASName.trim() !== '' && 
    selectedPrefixes.length > 0 && 
    selectedDevices.length > 0;

  // ============================================
  // EVENT HANDLERS - FORM INPUT
  // ============================================

  /**
   * Handle ASN input change
   * Auto-fill AS Name if ASN is found in list
   */
  const handleASNChange = (value: string) => {
    setInputASN(value);
    setInputASName('');
    setSelectedPrefixes([]);
    
    // Auto-fill AS Name if ASN matches
    const found = asnList.find((a) => a.asn.toUpperCase() === value.toUpperCase());
    if (found) {
      setInputASName(found.asName);
    }
  };

  /**
   * Handle prefix checkbox change
   * Add or remove prefix from selection
   * (Disabled prefixes cannot be selected - they're already countered)
   */
  const handlePrefixChange = (prefix: string, checked: boolean) => {
    if (checked) {
      setSelectedPrefixes([...selectedPrefixes, prefix]);
    } else {
      setSelectedPrefixes(selectedPrefixes.filter((p) => p !== prefix));
    }
  };

  /**
   * Handle device checkbox change
   * Add or remove device from selection
   */
  const handleDeviceChange = (device: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices([...selectedDevices, device]);
    } else {
      setSelectedDevices(selectedDevices.filter((d) => d !== device));
    }
  };

  /**
   * Handle "Select All Devices" checkbox
   * Select or deselect all 12 devices
   */
  const handleSelectAllDevices = (checked: boolean) => {
    if (checked) {
      setSelectedDevices([...DEVICES_LIST]);
    } else {
      setSelectedDevices([]);
    }
  };

  // ============================================
  // COMPUTED VALUES - UI STATE
  // ============================================

  const isAllDevicesSelected = selectedDevices.length === DEVICES_LIST.length;

  // ============================================
  // EVENT HANDLERS - MODAL ACTIONS
  // ============================================

  /**
   * Handle Apply button
   * Validate form and send data to parent component
   */
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

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content add-counter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <div>
            <h3>Add Counter</h3>
            <p className="modal-subtitle">Thêm counter cho ASN mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* ============================================
            SECTION 1: ASN INPUT
            ============================================ */}
        <div className="add-counter-section">
          <h4 className="section-header">Thông tin ASN</h4>
          <div className="asn-input-group">
            {/* ASN input field with autocomplete */}
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
            {/* AS Name field - auto-filled when ASN is found, can be manually edited */}
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

        {/* ============================================
            SECTION 2: PREFIX SELECTION
            ============================================ */}
        {availablePrefixes.length > 0 && (
          <div className="add-counter-section">
            <h4 className="section-header">Chọn Prefix</h4>
            <div className="prefix-selection-list">
              {availablePrefixes.map((prefix) => {
                // Check if prefix is already countered (disabled)
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
                      {/* Prefix network address and counter status */}
                      <div className="prefix-text">
                        <code>{prefix.prefix}</code>
                        {isDisabled && <span className="disabled-badge">Đã được counter</span>}
                      </div>
                      {/* Traffic information for this prefix */}
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

        {/* ============================================
            SECTION 3: DEVICE SELECTION
            ============================================ */}
        <div className="add-counter-section">
          <div className="device-header-group">
            <h4 className="section-header">Chọn thiết bị (12 box)</h4>
            <button className="select-all-button">Chọn tất cả</button>
          </div>

          {/* Select All control */}
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

          {/* Device checkbox grid */}
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

        {/* Modal footer with action buttons */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={!isFormValid}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ConfirmApplyModal Component (API Popup #2)
 * Confirmation modal before applying counter to ASN prefixes on devices
 * Displays summary of:
 * - ASN and AS Name
 * - Number of prefixes
 * - Number of devices
 * - List of all selected prefixes
 * - List of all selected devices
 * 
 * User must confirm before actual configuration is applied
 * 
 * @param {Object} props - Component props
 * @param {string} props.asn - ASN number
 * @param {string} props.asName - AS name
 * @param {string[]} props.prefixes - List of prefixes to counter
 * @param {string[]} props.devices - List of target devices
 * @param {Function} props.onApply - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 */
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
      {/* Modal header */}
      <div className="modal-header">
        <h3>Xác nhận cấu hình</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      {/* Confirmation message */}
      <div className="confirm-message-section">
        <div className="confirm-icon">✓</div>
        <p>Bạn có chắc muốn thêm counter cho ASN này vào các thiết bị đã chọn?</p>
      </div>

      {/* Configuration summary - quick overview */}
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

      {/* Detailed list of prefixes */}
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

      {/* Detailed list of devices */}
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

      {/* Modal footer with action buttons */}
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-primary" onClick={onApply}>Đồng ý</button>
      </div>
    </div>
  </div>
);

/**
 * ResultDisplayModal Component (API Popup #3)
 * Displays configuration result summary after applying counter to devices
 * Shows:
 * - Success/failure statistics
 * - Configuration details (ASN, AS Name, timestamp)
 * - Per-device results (success/failure with messages)
 * 
 * @param {Object} props - Component props
 * @param {ResultData} props.result - Complete result data
 * @param {Function} props.onClose - Callback when modal is closed
 */
const ResultDisplayModal: React.FC<{
  result: ResultData;
  onClose: () => void;
}> = ({ result, onClose }) => {
  // ============================================
  // COMPUTED VALUES - STATISTICS
  // ============================================

  /**
   * Calculate success/failure statistics
   * Counts how many devices succeeded vs failed
   */
  const stats = useMemo(() => {
    const successCount = result.results.filter((r) => r.status === 'success').length;
    const failedCount = result.results.filter((r) => r.status === 'failed').length;
    return {
      success: successCount,
      failed: failedCount,
      total: result.results.length
    };
  }, [result.results]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-result-display" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ============================================
            SECTION 1: STATISTICS CARDS
            ============================================ */}
        <div className="result-summary-cards">
          {/* Success count */}
          <div className="summary-card success-card">
            <div className="card-number">{stats.success}</div>
            <div className="card-label">Thành công</div>
          </div>
          {/* Failure count */}
          <div className="summary-card failed-card">
            <div className="card-number">{stats.failed}</div>
            <div className="card-label">Thất bại</div>
          </div>
          {/* Total count */}
          <div className="summary-card total-card">
            <div className="card-number">{stats.total}</div>
            <div className="card-label">Tổng cộng</div>
          </div>
        </div>

        {/* ============================================
            SECTION 2: CONFIGURATION INFO
            ============================================ */}
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

        {/* ============================================
            SECTION 3: PER-DEVICE RESULTS
            ============================================ */}
        <div className="result-details-section">
          <h4 className="details-header">Chi tiết kết quả từng thiết bị:</h4>
          <div className="result-items-list">
            {result.results.map((item, idx) => (
              <div key={idx} className={`result-item-card ${item.status}`}>
                {/* Status icon (✓ or ✗) */}
                <div className="result-item-icon">
                  {item.status === 'success' ? '✓' : '✗'}
                </div>
                {/* Device name and status message */}
                <div className="result-item-info">
                  <div className="result-item-device">{item.device}</div>
                  <div className="result-item-message">{item.message}</div>
                </div>
                {/* Status label */}
                <div className="result-item-status">
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
// TAB 2 MAIN COMPONENT
// ============================================

/**
 * Tab2AddCounter Component
 * Main component for Tab 2: Add Counter - IPT Statistics
 * 
 * Purpose: Allow users to add traffic counters to ASNs and their prefixes
 * 
 * Workflow:
 * 1. User views TOP 20 ASNs table (can expand for prefix details)
 * 2. User clicks "Add Counter" button
 * 3. Add Counter Modal appears (user enters ASN, selects prefixes and devices)
 * 4. Confirm Modal appears (user confirms selection)
 * 5. Configuration is applied (in real scenario, calls N8n API)
 * 6. Result Modal shows success/failure for each device
 * 
 * Features:
 * - Date picker for viewing stats by date
 * - Expandable ASN table with prefix details
 * - Three-step modal workflow for adding counters
 */
const Tab2AddCounter: React.FC = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Mock data
  const [asnData] = useState<ASNTab2Data[]>(mockTab2ASNData);
  
  // UI state
  const [expandedASNId, setExpandedASNId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [modalState, setModalState] = useState<ModalState>('closed');
  
  // Configuration data
  const [addCounterData, setAddCounterData] = useState<AddCounterData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle date picker change
   * Updates the selected date for viewing statistics
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  /**
   * Handle ASN row click
   * Toggle expand/collapse for prefix details
   */
  const handleASNRowClick = (row: ASNTab2Data) => {
    setExpandedASNId(expandedASNId === row.id ? null : row.id);
  };

  /**
   * Handle "Add Counter" button click
   * Open Add Counter Modal
   */
  const handleAddCounterClick = () => {
    setModalState('addCounter');
  };

  /**
   * Handle Apply in Add Counter Modal
   * Validate and move to Confirm Modal
   */
  const handleAddCounterApply = (data: AddCounterData) => {
    setAddCounterData(data);
    setModalState('confirm');
  };

  /**
   * Handle Cancel in Add Counter Modal
   * Close modal and reset state
   */
  const handleAddCounterCancel = () => {
    setModalState('closed');
    setAddCounterData(null);
  };

  /**
   * Handle Apply in Confirm Modal
   * Apply configuration and show results
   * In real scenario, this would call N8n API
   */
  const handleConfirmApply = () => {
    if (!addCounterData) return;
    
    setModalState('closed');
    
    // Generate mock result (in real scenario, call N8n API here)
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

  /**
   * Handle Cancel in Confirm Modal
   * Go back to Add Counter Modal
   */
  const handleConfirmCancel = () => {
    setModalState('addCounter');
  };

  /**
   * Handle Close in Result Modal
   * Close all modals and reset state
   */
  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setAddCounterData(null);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="tab2-container">
      {/* Header section with title, date picker, and Add Counter button */}
      <div className="tab2-header">
        <div className="header-left">
          <h3 className="tab2-title">Thống kê IPT - TOP 20 ASN</h3>
          <p className="tab2-subtitle">Lưu lượng cao nhất theo ngày</p>
        </div>
        <div className="header-right">
          {/* Date picker for selecting statistics date */}
          <div className="date-picker-group">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-picker-input"
            />
          </div>
          {/* Button to open Add Counter Modal */}
          <button className="btn-add-counter" onClick={handleAddCounterClick}>
            + Add Counter
          </button>
        </div>
      </div>

      {/* ASN table section with expandable prefix details */}
      <div className="tab2-table-section">
        <TopASNTable
          data={asnData}
          expandedASNId={expandedASNId}
          onRowClick={handleASNRowClick}
        />
      </div>

      {/* ============================================
          MODAL WORKFLOW
          ============================================ */}

      {/* STEP 1: Add Counter Modal - User enters ASN, selects prefixes and devices */}
      {modalState === 'addCounter' && (
        <AddCounterModal
          asnList={asnData}
          onApply={handleAddCounterApply}
          onCancel={handleAddCounterCancel}
        />
      )}

      {/* STEP 2: Confirm Modal - User confirms selection */}
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

      {/* STEP 3: Result Modal - Shows configuration results */}
      {modalState === 'result' && resultData && (
        <ResultDisplayModal 
          result={resultData} 
          onClose={handleResultClose} 
        />
      )}
    </div>
  );
};

export default Tab2AddCounter;
