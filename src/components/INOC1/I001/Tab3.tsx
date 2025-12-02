import React, { useState, useMemo } from 'react';
import { mockIPTMonitoringData, IPTMonitoringItem, DEVICES_LIST, TRIGGER_ALARM_OPTIONS, DEFAULT_TRIGGER_ALARM, DEFAULT_ROLLBACK_TIME } from './mockDataTab3';
import Tab3Service from 'services/Tab3Service';

// ============================================
// TYPE DEFINITIONS & INTERFACES
// ============================================

type ModalState = 'closed' | 'addIPT' | 'triggerAlarm' | 'rollbackTime';

// ============================================
// SUB COMPONENTS - DATA TABLES
// ============================================

const IPTMonitoringTable: React.FC<{ data: IPTMonitoringItem[] }> = ({ data }) => {
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
            data.map((item) => (
              <tr key={item.id} className="ipt-row">
                <td className="text-center">{item.stt}</td>
                <td className="device-cell">{item.device}</td>
                <td className="interface-cell"><code>{item.interface}</code></td>
                <td className="partner-cell">{item.partner}</td>
                <td className="prtg-id-cell"><code>{item.prtgId}</code></td>
                <td className="capacity-cell">
                  <span className="capacity-badge">{item.capacity}</span>
                </td>
                <td className="date-cell">{formatDate(item.dayAdded)}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" title="Edit">✏️</button>
                    <button className="action-btn delete-btn" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
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
      <div className="table-footer">
        <span className="total-items">Tổng cộng: {data.length} điểm theo dõi</span>
      </div>
    </div>
  );
};

// ============================================
// MODAL COMPONENTS - API POPUPS
// ============================================

const AddIPTModal: React.FC<{
  onApply: (data: Omit<IPTMonitoringItem, 'id' | 'stt'>) => void;
  onCancel: () => void;
}> = ({ onApply, onCancel }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [interface_, setInterface] = useState<string>('');
  const [partner, setPartner] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [prtgId, setPrtgId] = useState<string>('');

  const isFormValid = selectedDevice && interface_ && partner && capacity && prtgId;

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
      setSelectedDevice('');
      setInterface('');
      setPartner('');
      setCapacity('');
      setPrtgId('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content add-ipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Add IPT Monitoring</h3>
            <p className="modal-subtitle">Thêm điểm theo dõi lưu lượng IPT mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
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

const SetTriggerAlarmModal: React.FC<{
  currentAlarm: number;
  onApply: (alarmLevel: number) => void;
  onCancel: () => void;
}> = ({ currentAlarm, onApply, onCancel }) => {
  const [selectedAlarm, setSelectedAlarm] = useState<number>(currentAlarm);

  const handleApply = () => {
    onApply(selectedAlarm);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content set-trigger-alarm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Set Trigger Alarm</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="alarm-message">
          <div className="alarm-message-title">Chọn ngưỡng % để báo động</div>
          <div className="alarm-current">
            <span className="current-label">Ngưỡng hiện tại là:</span>
            <span className="current-value">{currentAlarm}%</span>
          </div>
        </div>

        <div className="alarm-options">
          <div className="options-label">Chọn mức trigger mới:</div>
          <div className="alarm-options-list">
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

const SetTimeToRollbackModal: React.FC<{
  currentTime: string;
  onApply: (time: string) => void;
  onCancel: () => void;
}> = ({ currentTime, onApply, onCancel }) => {
  const [selectedTime, setSelectedTime] = useState<string>(currentTime);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const handleTimeChange = (hours: string, mins: string) => {
    setSelectedTime(`${hours}:${mins}`);
  };

  const [selectedHour, selectedMin] = selectedTime.split(':');

  const handleApply = () => {
    onApply(selectedTime);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content set-rollback-time-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Set Time to Rollback</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="rollback-message">
          <div className="rollback-message-title">Đặt giờ tự động rollback hàng ngày</div>
          <div className="rollback-current">
            <span className="current-label">Thời gian hiện tại là:</span>
            <span className="current-value">{currentTime}</span>
          </div>
        </div>

        <div className="time-picker-section">
          <div className="time-picker-label">Chọn giờ (24h format)</div>
          <div className="time-picker-container">
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

            <div className="time-separator">:</div>

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

          <div className="time-display">
            <span className="display-label">Thời gian được chọn:</span>
            <span className="display-value">{selectedTime} SA</span>
          </div>
        </div>

        <div className="rollback-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">
            Hệ thống sẽ tự động thực hiện rollback toàn bộ cấu hình vào thời gian này mỗi ngày
          </span>
        </div>

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

const Tab3: React.FC = () => {
  const [iptData, setIptData] = useState<IPTMonitoringItem[]>(mockIPTMonitoringData);
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [currentTriggerAlarm, setCurrentTriggerAlarm] = useState<number>(DEFAULT_TRIGGER_ALARM);
  const [currentRollbackTime, setCurrentRollbackTime] = useState<string>(DEFAULT_ROLLBACK_TIME);

  // Date filter state for monitoring table
  const [filterStartDate, setFilterStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [filterEndDate, setFilterEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter monitoring data by date range
  const filteredIptData = iptData.filter(item => {
    if (!showDateFilter) return true;
    const itemDate = item.dayAdded;
    return itemDate >= filterStartDate && itemDate <= filterEndDate;
  });

  const handleAddIPT = (newIPT: Omit<IPTMonitoringItem, 'id' | 'stt'>) => {
    const newItem: IPTMonitoringItem = {
      ...newIPT,
      id: Math.max(...iptData.map(item => item.id), 0) + 1,
      stt: iptData.length + 1
    };
    setIptData([...iptData, newItem]);
    setModalState('closed');
  };

  const handleSetTriggerAlarm = (alarmLevel: number) => {
    setCurrentTriggerAlarm(alarmLevel);
    setModalState('closed');
  };

  const handleSetTimeToRollback = (time: string) => {
    setCurrentRollbackTime(time);
    setModalState('closed');
  };

  return (
    <div className="tab3-container">
      <div className="tab3-header">
        <div className="header-left">
          <h3 className="tab3-title">Admin Work - Quản lý theo dõi IPT</h3>
          <p className="tab3-subtitle">Thêm, cấu hình và quản lý các điểm theo dõi lưu lượng IPT</p>
        </div>

        <div className="header-right">
          <button 
            className="btn btn-add-ipt" 
            onClick={() => setModalState('addIPT')}
          >
            + Add IPT
          </button>

          <button 
            className="btn btn-trigger-alarm" 
            onClick={() => setModalState('triggerAlarm')}
          >
            ⚠ Set Trigger Alarm
          </button>

          <button 
            className="btn btn-rollback-time" 
            onClick={() => setModalState('rollbackTime')}
          >
            ⏱ Set Time to Rollback
          </button>
        </div>
      </div>

      <div className="tab3-alert-boxes">
        <div className="alert-box trigger-alarm-box">
          <div className="alert-label">Ngưỡng Trigger Alarm hiện tại</div>
          <div className="alert-value">{currentTriggerAlarm}%</div>
        </div>

        <div className="alert-box rollback-time-box">
          <div className="alert-label">Thời gian Rollback hệ thống sẽ từng</div>
          <div className="alert-value">{currentRollbackTime}</div>
        </div>
      </div>

      <div className="tab3-table-section">
        <div className="table-header">
          <h4 className="table-title">Danh sách IPT đang được theo dõi ({filteredIptData.length})</h4>
          <button
            className="filter-toggle-btn"
            onClick={() => setShowDateFilter(!showDateFilter)}
          >
            {showDateFilter ? '✕ Hide Filter' : '⏱ Filter by Date'}
          </button>
        </div>

        {showDateFilter && (
          <div className="date-filter-controls">
            <div className="filter-group">
              <label>From:</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="filter-date-input"
              />
            </div>
            <div className="filter-group">
              <label>To:</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="filter-date-input"
              />
            </div>
          </div>
        )}

        <IPTMonitoringTable data={filteredIptData} />
      </div>

      {modalState === 'addIPT' && (
        <AddIPTModal
          onApply={handleAddIPT}
          onCancel={() => setModalState('closed')}
        />
      )}

      {modalState === 'triggerAlarm' && (
        <SetTriggerAlarmModal
          currentAlarm={currentTriggerAlarm}
          onApply={handleSetTriggerAlarm}
          onCancel={() => setModalState('closed')}
        />
      )}

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

export default Tab3;
