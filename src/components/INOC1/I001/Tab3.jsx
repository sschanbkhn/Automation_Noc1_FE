import React, { useState, useMemo, useEffect } from 'react';
// import { mockIPTMonitoringData } from './mockDataTab3'; // Không dùng mockdata nữa - chỉ dùng API thật
import { DEVICES_LIST, TRIGGER_ALARM_OPTIONS, DEFAULT_TRIGGER_ALARM, DEFAULT_ROLLBACK_TIME } from './mockDataTab3';
import Tab3Service from 'services/Tab3Service';

const IPTMonitoringTable = ({ data, onDeleteClick }) => {
  const formatDate = (dateString) => {
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
            <th style={{ width: '100px' }}>Actions</th>
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
                  <span className="capacity-badge">
                    {typeof item.capacity === 'number' ? `${item.capacity} Gbps` : item.capacity}
                  </span>
                </td>
                <td className="date-cell">{formatDate(item.dayAdded)}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn delete-btn"
                      title="Delete"
                      onClick={() => onDeleteClick(item)}
                    >
                      🗑️
                    </button>
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

const AddIPTModal = ({
  onApply,
  onCancel
}) => {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [interface_, setInterface] = useState('');
  const [partner, setPartner] = useState('');
  const [capacity, setCapacity] = useState('');
  const [prtgId, setPrtgId] = useState('');

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
            <label htmlFor="capacity-input">Capacity (Gbps)</label>
            <input
              id="capacity-input"
              type="number"
              placeholder="e.g., 100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="form-control text-input"
              min="0"
              step="1"
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Chỉ nhập số (đơn vị: Gbps)
            </small>
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

const SetTriggerAlarmModal = ({
  currentAlarm,
  onApply,
  onCancel
}) => {
  const [selectedAlarm, setSelectedAlarm] = useState(currentAlarm);

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

const SetTimeToRollbackModal = ({
  currentTime,
  onApply,
  onCancel
}) => {
  const [selectedTime, setSelectedTime] = useState(currentTime);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const handleTimeChange = (hours, mins) => {
    setSelectedTime(`${hours}:${mins}`);
  };

  const [selectedHour, selectedMin] = (selectedTime || '02:00').split(':');

  const handleApply = () => {
    if (selectedTime && selectedTime.includes(':')) {
      onApply(selectedTime);
    }
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

const DeleteIPTConfirmModal = ({ ipt, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-delete-confirm" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
      <div className="modal-header">
        <h3>Xác nhận xóa IPT</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>

      <div className="confirm-message" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', color: '#dc2626' }}>⚠️</div>
        <p style={{ fontWeight: '500', marginBottom: '8px' }}>Bạn chắc chắn muốn xóa điểm theo dõi IPT này?</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Hành động này không thể hoàn tác.</p>
      </div>

      <div className="delete-summary" style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
        <div className="detail-row" style={{ marginBottom: '8px' }}>
          <span className="label" style={{ fontWeight: '600' }}>Device:</span>
          <span className="value" style={{ color: '#dc2626', fontWeight: '600' }}>{ipt.device}</span>
        </div>
        <div className="detail-row" style={{ marginBottom: '8px' }}>
          <span className="label" style={{ fontWeight: '600' }}>Interface:</span>
          <span className="value"><code>{ipt.interface}</code></span>
        </div>
        <div className="detail-row" style={{ marginBottom: '8px' }}>
          <span className="label" style={{ fontWeight: '600' }}>Partner:</span>
          <span className="value">{ipt.partner}</span>
        </div>
        <div className="detail-row">
          <span className="label" style={{ fontWeight: '600' }}>PRTG_ID:</span>
          <span className="value" style={{ color: '#7c3aed', fontWeight: '500' }}>{ipt.prtgId}</span>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-danger" onClick={onConfirm} style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>Xóa</button>
      </div>
    </div>
  </div>
);

function Tab3() {
  // State khởi tạo với empty array - dữ liệu sẽ được load từ API
  const [iptData, setIptData] = useState([]);
  const [modalState, setModalState] = useState('closed');
  const [currentTriggerAlarm, setCurrentTriggerAlarm] = useState(DEFAULT_TRIGGER_ALARM);
  const [currentRollbackTime, setCurrentRollbackTime] = useState(DEFAULT_ROLLBACK_TIME);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [deleteConfirmIPT, setDeleteConfirmIPT] = useState(null);
  const [loadingCronSetting, setLoadingCronSetting] = useState(false);
  const [loadingTriggerAlarm, setLoadingTriggerAlarm] = useState(false);
  const [loadingIPTData, setLoadingIPTData] = useState(false);

  // Fetch trigger alarm level from database on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchTriggerAlarm = async () => {
      setLoadingTriggerAlarm(true);
      try {
        const response = await Tab3Service.GetTriggerAlarmLevel();
        if (isMounted && response?.status === 'success' && response.data?.trigger_threshold) {
          setCurrentTriggerAlarm(response.data.trigger_threshold);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching trigger alarm:', error);
        }
      } finally {
        if (isMounted) {
          setLoadingTriggerAlarm(false);
        }
      }
    };
    fetchTriggerAlarm();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch cron setting (rollback time) from database on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchCronSetting = async () => {
      setLoadingCronSetting(true);
      try {
        const response = await Tab3Service.GetCronSetting();
        if (isMounted && response?.status === 'success' && response.data?.cron_expression) {
          const cronParts = response.data.cron_expression.split(' ');
          if (cronParts.length >= 2) {
            const hours = cronParts[1].padStart(2, '0');
            const minutes = cronParts[0].padStart(2, '0');
            setCurrentRollbackTime(`${hours}:${minutes}`);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching cron setting:', error);
        }
      } finally {
        if (isMounted) {
          setLoadingCronSetting(false);
        }
      }
    };
    fetchCronSetting();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch IPT monitoring list from database on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchIPTData = async () => {
      setLoadingIPTData(true);
      try {
        const response = await Tab3Service.GetIPTMonitoringList();
        if (isMounted && response?.status === 'success' && Array.isArray(response.data)) {
          // Transform backend data to frontend format
          const transformedData = response.data.map((item, index) => ({
            id: item.id,
            stt: index + 1,
            device: item.device,
            interface: item.interface,
            partner: item.partner,
            capacity: item.capacity,
            prtgId: item.prtg_id,
            dayAdded: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          }));
          setIptData(transformedData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching IPT data:', error);
          // Không set mockdata nữa - để empty array khi có lỗi
          setIptData([]);
        }
      } finally {
        if (isMounted) {
          setLoadingIPTData(false);
        }
      }
    };
    fetchIPTData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredIptData = iptData.filter(item => {
    if (!showDateFilter) return true;
    return item.dayAdded === selectedDate;
  });

  const handleAddIPT = async (newIPT) => {
    try {
      const response = await Tab3Service.AddIPTMonitoring(
        newIPT.device,
        newIPT.interface,
        newIPT.partner,
        newIPT.capacity,
        newIPT.prtgId
      );
      
      if (response?.status === 'success') {
        setModalState('addIPTResult');
        
        // Refresh IPT list from database
        const listResponse = await Tab3Service.GetIPTMonitoringList();
        if (listResponse?.status === 'success' && Array.isArray(listResponse.data)) {
          const transformedData = listResponse.data.map((item, index) => ({
            id: item.id,
            stt: index + 1,
            device: item.device,
            interface: item.interface,
            partner: item.partner,
            capacity: item.capacity,
            prtgId: item.prtg_id,
            dayAdded: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          }));
          setIptData(transformedData);
        }
      } else {
        setModalState('error');
      }
    } catch (error) {
      console.error('Error adding IPT:', error);
      setModalState('error');
    }
  };

  const handleSetTriggerAlarm = async (alarmLevel) => {
    try {
      const response = await Tab3Service.SetTriggerAlarmLevel(alarmLevel);
      
      if (response?.status === 'success') {
        setCurrentTriggerAlarm(alarmLevel);
        setModalState('triggerAlarmResult');
        
        // Fetch latest data from database to confirm
        const latestData = await Tab3Service.GetTriggerAlarmLevel();
        if (latestData?.status === 'success' && latestData.data?.trigger_threshold) {
          setCurrentTriggerAlarm(latestData.data.trigger_threshold);
        }
      } else {
        setModalState('error');
      }
    } catch (error) {
      console.error('Error updating trigger alarm:', error);
      setModalState('error');
    }
  };

  const handleSetTimeToRollback = async (time) => {
    try {
      const response = await Tab3Service.UpdateCronSetting(time);
      
      if (response?.status === 'success') {
        setCurrentRollbackTime(time);
        setModalState('rollbackTimeResult');
        
        // Fetch latest data from database to confirm
        const latestData = await Tab3Service.GetCronSetting();
        if (latestData?.status === 'success' && latestData.data?.cron_expression) {
          const cronParts = latestData.data.cron_expression.split(' ');
          if (cronParts.length >= 2) {
            const hours = cronParts[1].padStart(2, '0');
            const minutes = cronParts[0].padStart(2, '0');
            const confirmedTime = `${hours}:${minutes}`;
            setCurrentRollbackTime(confirmedTime);
          }
        }
      } else {
        setModalState('error');
      }
    } catch (error) {
      console.error('Error updating rollback time:', error);
      setModalState('error');
    }
  };

  const handleDeleteClick = (ipt) => {
    setDeleteConfirmIPT(ipt);
    setModalState('deleteConfirm');
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmIPT) {
      try {
        const response = await Tab3Service.DeleteIPTMonitoring(deleteConfirmIPT.id);
        
        if (response?.status === 'success') {
          setModalState('deleteIPTResult');
          setDeleteConfirmIPT(null);
          
          // Refresh IPT list from database after delete
          const listResponse = await Tab3Service.GetIPTMonitoringList();
          if (listResponse?.status === 'success' && Array.isArray(listResponse.data)) {
            const transformedData = listResponse.data.map((item, index) => ({
              id: item.id,
              stt: index + 1,
              device: item.device,
              interface: item.interface,
              partner: item.partner,
              capacity: item.capacity,
              prtgId: item.prtg_id,
              dayAdded: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
            }));
            setIptData(transformedData);
          }
        } else {
          setModalState('error');
        }
      } catch (error) {
        console.error('Error deleting IPT:', error);
        setModalState('error');
      }
    }
  };

  const handleDeleteCancel = () => {
    setModalState('closed');
    setDeleteConfirmIPT(null);
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
          <div className="alert-value">
            {loadingTriggerAlarm ? '⏳ Loading...' : `${currentTriggerAlarm}%`}
          </div>
        </div>

        <div className="alert-box rollback-time-box">
          <div className="alert-label">Thời gian Rollback hệ thống tự động</div>
          <div className="alert-value">
            {loadingCronSetting ? '⏳ Loading...' : currentRollbackTime}
          </div>
        </div>
      </div>

      <div className="tab3-table-section">
        <div className="table-header">
          <h4 className="table-title">
            Danh sách IPT đang được theo dõi ({filteredIptData.length})
            {loadingIPTData && <span style={{marginLeft: '10px', fontSize: '14px', color: '#6b7280'}}>⏳ Loading...</span>}
          </h4>
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
              <label htmlFor="tab3-date-picker">Chọn ngày:</label>
              <input
                id="tab3-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="filter-date-input"
              />
            </div>
          </div>
        )}

        <IPTMonitoringTable data={filteredIptData} onDeleteClick={handleDeleteClick} />
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

      {modalState === 'triggerAlarmResult' && (
        <div className="modal-overlay" onClick={() => setModalState('closed')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Cập nhật thành công</h3>
              <button className="modal-close" onClick={() => setModalState('closed')}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>Đã cập nhật ngưỡng trigger alarm</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Ngưỡng mới: <strong>{currentTriggerAlarm}%</strong></p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setModalState('closed')}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'rollbackTimeResult' && (
        <div className="modal-overlay" onClick={() => setModalState('closed')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Cập nhật thành công</h3>
              <button className="modal-close" onClick={() => setModalState('closed')}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>Đã cập nhật thời gian rollback</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Thời gian mới: <strong>{currentRollbackTime}</strong></p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setModalState('closed')}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'addIPTResult' && (
        <div className="modal-overlay" onClick={() => setModalState('closed')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Thêm IPT thành công</h3>
              <button className="modal-close" onClick={() => setModalState('closed')}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>Đã thêm điểm theo dõi IPT mới</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Danh sách đã được cập nhật</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setModalState('closed')}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'deleteIPTResult' && (
        <div className="modal-overlay" onClick={() => setModalState('closed')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Xóa IPT thành công</h3>
              <button className="modal-close" onClick={() => setModalState('closed')}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>Đã xóa điểm theo dõi IPT</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Danh sách đã được cập nhật</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setModalState('closed')}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'error' && (
        <div className="modal-overlay" onClick={() => setModalState('closed')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Lỗi</h3>
              <button className="modal-close" onClick={() => setModalState('closed')}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: '#dc2626' }}>❌</div>
              <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>Không thể cập nhật thời gian rollback</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Vui lòng thử lại sau</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalState('closed')}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'deleteConfirm' && deleteConfirmIPT && (
        <DeleteIPTConfirmModal
          ipt={deleteConfirmIPT}
          onConfirm={handleConfirmDelete}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default Tab3;
