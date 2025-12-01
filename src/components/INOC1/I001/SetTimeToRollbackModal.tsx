import React, { useState, useMemo } from 'react';

interface SetTimeToRollbackModalProps {
  currentTime: string;
  onApply: (time: string) => void;
  onCancel: () => void;
}

const SetTimeToRollbackModal: React.FC<SetTimeToRollbackModalProps> = ({
  currentTime,
  onApply,
  onCancel
}) => {
  const [selectedTime, setSelectedTime] = useState<string>(currentTime);

  // Generate hours and minutes for the time picker
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
      <div
        className="modal-content set-rollback-time-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Set Time to Rollback</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Rollback Message */}
        <div className="rollback-message">
          <div className="rollback-message-title">Đặt giờ tự động rollback hàng ngày</div>
          <div className="rollback-current">
            <span className="current-label">Thời gian hiện tại là:</span>
            <span className="current-value">{currentTime}</span>
          </div>
        </div>

        {/* Time Picker Section */}
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
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
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
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Display */}
          <div className="time-display">
            <span className="display-label">Thời gian được chọn:</span>
            <span className="display-value">{selectedTime} SA</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="rollback-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">
            Hệ thống sẽ tự động thực hiện rollback toàn bộ cấu hình vào thời gian này mỗi ngày
          </span>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-rollback-time-action" onClick={handleApply}>
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetTimeToRollbackModal;
