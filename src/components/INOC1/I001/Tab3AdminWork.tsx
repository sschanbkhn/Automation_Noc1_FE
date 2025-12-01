import React, { useState, useMemo } from 'react';
import { mockIPTMonitoringData, IPTMonitoringItem, DEVICES_LIST, TRIGGER_ALARM_OPTIONS, DEFAULT_TRIGGER_ALARM, DEFAULT_ROLLBACK_TIME } from './mockDataTab3';

// ============================================
// TYPE DEFINITIONS & INTERFACES
// ============================================

/**
 * Modal state type for managing different modal views in Tab3
 * - 'closed': No modal is open
 * - 'addIPT': Add IPT Monitoring modal is open
 * - 'triggerAlarm': Set Trigger Alarm modal is open
 * - 'rollbackTime': Set Time to Rollback modal is open
 */
type ModalState = 'closed' | 'addIPT' | 'triggerAlarm' | 'rollbackTime';

// ============================================
// SUB COMPONENTS - DATA TABLES
// ============================================

/**
 * IPTMonitoringTable Component
 * Displays table of IPT monitoring points currently being tracked
 * 
 * Table columns:
 * - STT: Sequential number
 * - Device: Target network device
 * - Interface: Network interface name
 * - Partner: ISP/Partner name
 * - PRTG_ID: PRTG monitoring ID
 * - Capacity: Bandwidth capacity
 * - Day Added: When this monitoring point was added
 * - Actions: Edit/Delete buttons (placeholders for future functionality)
 * 
 * Features:
 * - Shows total number of monitoring points
 * - Action buttons for edit/delete (ready for implementation)
 * - Empty state message if no data
 * 
 * @param {Object} props - Component props
 * @param {IPTMonitoringItem[]} props.data - Array of monitoring items
 */
const IPTMonitoringTable: React.FC<{ data: IPTMonitoringItem[] }> = ({ data }) => {
  /**
   * Format date string to Vietnamese locale format
   * Converts ISO format (YYYY-MM-DD) to Vietnamese format (DD/MM/YYYY)
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="ipt-monitoring-table-container">
      <table className="ipt-monitoring-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th style={{ width: '140px' }}>Device</th>
            <th style={{ width: '140px' }}>Interface</th>
            <th style={{ width: '140px' }}>Partner</th>
            <th style={{ width: '120px' }}>PRTG_ID</th>
            <th style={{ width: '120px' }}>Capacity</th>
            <th style={{ width: '140px' }}>Day Added</th>
            <th style={{ width: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            // Data rows
            data.map((item) => (
              <tr key={item.id} className="ipt-row">
                <td className="text-center">{item.stt}</td>
                <td className="device-cell">{item.device}</td>
                {/* Interface shown in monospace font for clarity */}
                <td className="interface-cell"><code>{item.interface}</code></td>
                <td className="partner-cell">{item.partner}</td>
                {/* PRTG_ID shown in monospace for clarity */}
                <td className="prtg-id-cell"><code>{item.prtgId}</code></td>
                {/* Capacity with badge styling */}
                <td className="capacity-cell">
                  <span className="capacity-badge">{item.capacity}</span>
                </td>
                {/* Formatted date */}
                <td className="date-cell">{formatDate(item.dayAdded)}</td>
                {/* Action buttons for edit/delete (currently placeholder icons) */}
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" title="Edit">✏️</button>
                    <button className="action-btn delete-btn" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            // Empty state when no data
            <tr>
              <td colSpan={8} className="empty-state">
                <div className="empty-message">
                  <span>Không có dữ liệu IPT</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Table footer showing total count */}
      <div className="table-footer">
        <span className="total-items">Tổng cộng: {data.length} điểm theo dõi</span>
      </div>
    </div>
  );
};

// ============================================
// MODAL COMPONENTS - API POPUPS
// ============================================

/**
 * AddIPTModal Component (API Popup #1)
 * Modal for adding a new IPT monitoring point
 * 
 * Form fields:
 * - Device: Dropdown selection from 12 available devices
 * - Interface: Text input (e.g., ge-0/0/0)
 * - Partner: Text input (e.g., GTT, Zenlayer, Equinix)
 * - Capacity: Text input (e.g., 100 Gbps)
 * - PRTG_ID: Text input (e.g., PRTG-001)
 * 
 * Features:
 * - All fields required for validation
 * - Device selection from standard list
 * - Submit sends data to parent via callback
 * - Form resets after submission
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onApply - Callback with new IPT data
 * @param {Function} props.onCancel - Callback when cancelled
 */
const AddIPTModal: React.FC<{
  onApply: (data: Omit<IPTMonitoringItem, 'id' | 'stt'>) => void;
  onCancel: () => void;
}> = ({ onApply, onCancel }) => {
  // ============================================
  // FORM STATE
  // ============================================

  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [interface_, setInterface] = useState<string>('');
  const [partner, setPartner] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [prtgId, setPrtgId] = useState<string>('');

  // ============================================
  // FORM VALIDATION
  // ============================================

  /**
   * Check if all required fields are filled
   * Form can only be submitted when valid
   */
  const isFormValid = selectedDevice && interface_ && partner && capacity && prtgId;

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle Apply button
   * Validate and submit form data
   */
  const handleApply = () => {
    if (isFormValid) {
      onApply({
        device: selectedDevice,
        interface: interface_,
        partner: partner,
        capacity: capacity,
        prtgId: prtgId,
        dayAdded: new Date().toISOString().split('T')[0]
      });
      // Reset form after submission
      setSelectedDevice('');
      setInterface('');
      setPartner('');
      setCapacity('');
      setPrtgId('');
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content add-ipt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <div>
            <h3>Add IPT Monitoring</h3>
            <p className="modal-subtitle">Thêm điểm theo dõi lưu lượng IPT mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Form section */}
        <div className="modal-body">
          {/* Device Selection Field */}
          <div className="form-group">
            <label htmlFor="device-select">Thiết bị</label>
            <select
              id="device-select"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="form-control select-input"
            >
              <option value="">-- Chọn thiết bị --</option>
              {DEVICES_LIST.map((device) => (
                <option key={device} value={device}>{device}</option>
              ))}
            </select>
          </div>

          {/* Interface Field */}
          <div className="form-group">
            <label htmlFor="interface-input">Interface</label>
            <input
              id="interface-input"
              type="text"
              placeholder="e.g., ge-0/0/0"
              value={interface_}
              onChange={(e) => setInterface(e.target.value)}
              className="form-control text-input"
            />
          </div>

          {/* Partner Field */}
          <div className="form-group">
            <label htmlFor="partner-input">Partner</label>
            <input
              id="partner-input"
              type="text"
              placeholder="e.g., GTT, Zenlayer, Equinix"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="form-control text-input"
            />
          </div>

          {/* Capacity Field */}
          <div className="form-group">
            <label htmlFor="capacity-input">Capacity</label>
            <input
              id="capacity-input"
              type="text"
              placeholder="e.g., 100 Gbps"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="form-control text-input"
            />
          </div>

          {/* PRTG_ID Field */}
          <div className="form-group">
            <label htmlFor="prtg-input">PRTG_ID</label>
            <input
              id="prtg-input"
              type="text"
              placeholder="e.g., PRTG-001"
              value={prtgId}
              onChange={(e) => setPrtgId(e.target.value)}
              className="form-control text-input"
            />
          </div>
        </div>

        {/* Modal footer with action buttons */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleApply} 
            disabled={!isFormValid}
          >
            Add IPT
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * SetTriggerAlarmModal Component (API Popup #2)
 * Modal for setting the trigger alarm threshold percentage
 * 
 * Features:
 * - Shows current alarm level
 * - Radio buttons for selecting new alarm threshold
 * - Available thresholds: 70%, 75%, 80%, 85%, 90%, 95%, 100%
 * - Submit sends selected value to parent
 * 
 * When API usage exceeds this threshold, the system triggers alerts
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentAlarm - Current alarm threshold percentage
 * @param {Function} props.onApply - Callback with selected alarm level
 * @param {Function} props.onCancel - Callback when cancelled
 */
const SetTriggerAlarmModal: React.FC<{
  currentAlarm: number;
  onApply: (alarmLevel: number) => void;
  onCancel: () => void;
}> = ({ currentAlarm, onApply, onCancel }) => {
  // ============================================
  // STATE
  // ============================================

  const [selectedAlarm, setSelectedAlarm] = useState<number>(currentAlarm);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle Apply button
   * Send selected alarm level to parent
   */
  const handleApply = () => {
    onApply(selectedAlarm);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content set-trigger-alarm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <h3>Set Trigger Alarm</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Current alarm level display */}
        <div className="alarm-message">
          <div className="alarm-message-title">Chọn ngưỡng % để báo động</div>
          <div className="alarm-current">
            <span className="current-label">Ngưỡng hiện tại là:</span>
            <span className="current-value">{currentAlarm}%</span>
          </div>
        </div>

        {/* Alarm threshold options */}
        <div className="alarm-options">
          <div className="options-label">Chọn mức trigger mới:</div>
          <div className="alarm-options-list">
            {/* Radio buttons for each threshold option */}
            {TRIGGER_ALARM_OPTIONS.map((option) => (
              <label key={option} className="alarm-radio-option">
                <input
                  type="radio"
                  name="trigger-alarm"
                  value={option}
                  checked={selectedAlarm === option}
                  onChange={() => setSelectedAlarm(option)}
                />
                <span className="option-text">{option}%</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modal footer with action buttons */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-trigger-alarm-action" onClick={handleApply}>
            Set Trigger
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * SetTimeToRollbackModal Component (API Popup #3)
 * Modal for setting the automatic daily rollback time
 * 
 * Purpose: Configure what time each day the system will automatically
 * rollback all configuration changes back to default state
 * 
 * Features:
 * - 24-hour time format (HH:MM)
 * - Separate dropdowns for hours (00-23) and minutes (00-59)
 * - Shows selected time in display format
 * - Informational message about rollback behavior
 * - Submit sends time in HH:MM format to parent (crontab compatible)
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentTime - Current rollback time (HH:MM format)
 * @param {Function} props.onApply - Callback with selected time
 * @param {Function} props.onCancel - Callback when cancelled
 */
const SetTimeToRollbackModal: React.FC<{
  currentTime: string;
  onApply: (time: string) => void;
  onCancel: () => void;
}> = ({ currentTime, onApply, onCancel }) => {
  // ============================================
  // STATE
  // ============================================

  const [selectedTime, setSelectedTime] = useState<string>(currentTime);

  // ============================================
  // COMPUTED VALUES - TIME ARRAYS
  // ============================================

  /**
   * Generate array of hours (00-23)
   * Memoized to avoid recreation on every render
   */
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  /**
   * Generate array of minutes (00-59)
   * Memoized to avoid recreation on every render
   */
  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Update selected time when hours or minutes change
   */
  const handleTimeChange = (hours: string, mins: string) => {
    setSelectedTime(`${hours}:${mins}`);
  };

  /**
   * Parse current selected time into hours and minutes
   */
  const [selectedHour, selectedMin] = selectedTime.split(':');

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle Apply button
   * Send selected time to parent
   */
  const handleApply = () => {
    onApply(selectedTime);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content set-rollback-time-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <h3>Set Time to Rollback</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Current time display */}
        <div className="rollback-message">
          <div className="rollback-message-title">Đặt giờ tự động rollback hàng ngày</div>
          <div className="rollback-current">
            <span className="current-label">Thời gian hiện tại là:</span>
            <span className="current-value">{currentTime}</span>
          </div>
        </div>

        {/* Time picker section */}
        <div className="time-picker-section">
          <div className="time-picker-label">Chọn giờ (24h format)</div>
          <div className="time-picker-container">
            {/* Hours dropdown */}
            <div className="time-input-group">
              <label className="time-label">Hours</label>
              <select
                value={selectedHour}
                onChange={(e) => handleTimeChange(e.target.value, selectedMin)}
                className="time-select"
              >
                {hours.map((hour) => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>

            {/* Time separator */}
            <div className="time-separator">:</div>

            {/* Minutes dropdown */}
            <div className="time-input-group">
              <label className="time-label">Minutes</label>
              <select
                value={selectedMin}
                onChange={(e) => handleTimeChange(selectedHour, e.target.value)}
                className="time-select"
              >
                {minutes.map((minute) => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Display selected time */}
          <div className="time-display">
            <span className="display-label">Thời gian được chọn:</span>
            <span className="display-value">{selectedTime} SA</span>
          </div>
        </div>

        {/* Information about rollback behavior */}
        <div className="rollback-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">
            Hệ thống sẽ tự động thực hiện rollback toàn bộ cấu hình vào thời gian này mỗi ngày
          </span>
        </div>

        {/* Modal footer with action buttons */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-rollback-time-action" onClick={handleApply}>
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TAB 3 MAIN COMPONENT
// ============================================

/**
 * Tab3AdminWork Component
 * Main component for Tab 3: Admin Work - IPT Monitoring Management
 * 
 * Purpose: Allow administrators to manage IPT monitoring points and system settings
 * 
 * Main Features:
 * 1. IPT Monitoring Table: View all current monitoring points
 * 2. Add IPT Button: Add new monitoring points
 * 3. Set Trigger Alarm Button: Configure alarm threshold
 * 4. Set Time to Rollback Button: Configure daily automatic rollback
 * 
 * Workflow:
 * 1. Admin can view current monitoring points in the table
 * 2. Admin can click "Add IPT" to add new monitoring point
 * 3. Admin can click "Set Trigger Alarm" to configure when alerts trigger
 * 4. Admin can click "Set Time to Rollback" to configure automatic rollback time
 * 
 * State Management:
 * - iptData: Array of current monitoring points
 * - modalState: Which modal is currently open
 * - currentTriggerAlarm: Current alarm threshold (default: 80%)
 * - currentRollbackTime: Current rollback time (default: 00:00)
 */
const Tab3AdminWork: React.FC = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Data state
  const [iptData, setIptData] = useState<IPTMonitoringItem[]>(mockIPTMonitoringData);
  
  // UI state
  const [modalState, setModalState] = useState<ModalState>('closed');
  
  // Configuration state
  const [currentTriggerAlarm, setCurrentTriggerAlarm] = useState<number>(DEFAULT_TRIGGER_ALARM);
  const [currentRollbackTime, setCurrentRollbackTime] = useState<string>(DEFAULT_ROLLBACK_TIME);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle new IPT monitoring point addition
   * Adds new item to table with auto-generated ID and STT
   * 
   * @param {Omit<IPTMonitoringItem, 'id' | 'stt'>} newIPT - New monitoring point data
   */
  const handleAddIPT = (newIPT: Omit<IPTMonitoringItem, 'id' | 'stt'>) => {
    // Generate new ID (max existing ID + 1)
    const newItem: IPTMonitoringItem = {
      ...newIPT,
      id: Math.max(...iptData.map(item => item.id), 0) + 1,
      stt: iptData.length + 1
    };
    // Add to table
    setIptData([...iptData, newItem]);
    // Close modal
    setModalState('closed');
  };

  /**
   * Handle trigger alarm threshold change
   * Updates the percentage at which system triggers alerts
   * 
   * @param {number} alarmLevel - New alarm threshold (70-100%)
   */
  const handleSetTriggerAlarm = (alarmLevel: number) => {
    setCurrentTriggerAlarm(alarmLevel);
    setModalState('closed');
  };

  /**
   * Handle rollback time change
   * Updates the time when system automatically rolls back all configs
   * 
   * @param {string} time - New rollback time (HH:MM format, crontab compatible)
   */
  const handleSetTimeToRollback = (time: string) => {
    setCurrentRollbackTime(time);
    setModalState('closed');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="tab3-container">
      {/* Header section with title and action buttons */}
      <div className="tab3-header">
        {/* Left section: Title and subtitle */}
        <div className="header-left">
          <h3 className="tab3-title">Admin Work - Quản lý theo dõi IPT</h3>
          <p className="tab3-subtitle">Thêm, cấu hình và quản lý các điểm theo dõi lưu lượng IPT</p>
        </div>

        {/* Right section: Action buttons */}
        <div className="header-right">
          {/* Add IPT Button - opens modal to add new monitoring point */}
          <button 
            className="btn btn-add-ipt" 
            onClick={() => setModalState('addIPT')}
          >
            + Add IPT
          </button>

          {/* Set Trigger Alarm Button - opens modal to set alarm threshold */}
          <button 
            className="btn btn-trigger-alarm" 
            onClick={() => setModalState('triggerAlarm')}
          >
            ⚠ Set Trigger Alarm
          </button>

          {/* Set Time to Rollback Button - opens modal to set rollback time */}
          <button 
            className="btn btn-rollback-time" 
            onClick={() => setModalState('rollbackTime')}
          >
            ⏱ Set Time to Rollback
          </button>
        </div>
      </div>

      {/* Alert boxes showing current settings */}
      <div className="tab3-alert-boxes">
        {/* Current trigger alarm threshold display */}
        <div className="alert-box trigger-alarm-box">
          <div className="alert-label">Ngưỡng Trigger Alarm hiện tại</div>
          <div className="alert-value">{currentTriggerAlarm}%</div>
        </div>

        {/* Current rollback time display */}
        <div className="alert-box rollback-time-box">
          <div className="alert-label">Thời gian Rollback hệ thống sẽ từng</div>
          <div className="alert-value">{currentRollbackTime}</div>
        </div>
      </div>

      {/* IPT Monitoring table section */}
      <div className="tab3-table-section">
        <h4 className="table-title">Danh sách IPT đang được theo dõi</h4>
        <IPTMonitoringTable data={iptData} />
      </div>

      {/* ============================================
          MODAL WORKFLOW
          ============================================ */}

      {/* MODAL 1: Add IPT - allows adding new monitoring points */}
      {modalState === 'addIPT' && (
        <AddIPTModal
          onApply={handleAddIPT}
          onCancel={() => setModalState('closed')}
        />
      )}

      {/* MODAL 2: Set Trigger Alarm - allows configuring alarm threshold */}
      {modalState === 'triggerAlarm' && (
        <SetTriggerAlarmModal
          currentAlarm={currentTriggerAlarm}
          onApply={handleSetTriggerAlarm}
          onCancel={() => setModalState('closed')}
        />
      )}

      {/* MODAL 3: Set Time to Rollback - allows configuring rollback time */}
      {modalState === 'rollbackTime' && (
        <SetTimeToRollbackModal
          currentTime={currentRollbackTime}
          onApply={handleSetTimeToRollback}
          onCancel={() => setModalState('closed')}
        />
      )}
    </div>
  );
};

export default Tab3AdminWork;
