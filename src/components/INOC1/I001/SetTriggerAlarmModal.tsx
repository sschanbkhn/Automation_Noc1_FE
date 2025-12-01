import React, { useState } from 'react';
import { TRIGGER_ALARM_OPTIONS } from './mockDataTab3';

interface SetTriggerAlarmModalProps {
  currentAlarm: number;
  onApply: (alarmLevel: number) => void;
  onCancel: () => void;
}

const SetTriggerAlarmModal: React.FC<SetTriggerAlarmModalProps> = ({
  currentAlarm,
  onApply,
  onCancel
}) => {
  const [selectedAlarm, setSelectedAlarm] = useState<number>(currentAlarm);

  const handleApply = () => {
    onApply(selectedAlarm);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content set-trigger-alarm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Set Trigger Alarm</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Alert Message */}
        <div className="alarm-message">
          <div className="alarm-message-title">Chọn ngưỡng % để báo động</div>
          <div className="alarm-current">
            <span className="current-label">Ngưỡng hiện tại là:</span>
            <span className="current-value">{currentAlarm}%</span>
          </div>
        </div>

        {/* Trigger Options */}
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

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-trigger-alarm-action" onClick={handleApply}>
            Set Trigger
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetTriggerAlarmModal;
