import React, { useState, useEffect } from 'react';

interface ApiMonitorData {
  status: number;
  threshold: number;
  timestamp: string;
  note: string;
}

interface ApiMonitorBoxProps {
  data: ApiMonitorData;
  onClick: () => void;
}

const ApiMonitorBox: React.FC<ApiMonitorBoxProps> = ({ data, onClick }) => {
  const [isAlert, setIsAlert] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (data.status >= data.threshold) {
      setIsAlert(true);
      // Blinking effect
      const interval = setInterval(() => {
        setBlink(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setIsAlert(false);
      setBlink(false);
    }
  }, [data.status, data.threshold]);

  const getStatusColor = () => {
    if (data.status >= 80) return '#DC2626'; // Red
    if (data.status >= 60) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  };

  const getProgressBarColor = () => {
    if (data.status >= 80) return 'linear-gradient(90deg, #DC2626, #991B1B)';
    if (data.status >= 60) return 'linear-gradient(90deg, #F59E0B, #D97706)';
    return 'linear-gradient(90deg, #10B981, #059669)';
  };

  return (
    <div
      className={`api-monitor-box ${isAlert ? 'alert-mode' : ''} ${blink ? 'blink' : ''}`}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderColor: isAlert ? '#DC2626' : '#E5E7EB',
        backgroundColor: isAlert && blink ? '#FEE2E2' : '#FFFFFF'
      }}
    >
      <div className="monitor-header">
        <div className="monitor-title-group">
          <span className="monitor-icon">🔔</span>
          <h4>API Monitor</h4>
        </div>
        {isAlert && (
          <span className="alert-badge">ALERT</span>
        )}
      </div>

      <div className="monitor-status">
        <div className="status-percentage">
          <span className="percentage-value" style={{ color: getStatusColor() }}>
            {data.status.toFixed(1)}%
          </span>
          <span className="percentage-label">Hiệu suất</span>
        </div>
      </div>

      <div className="monitor-progress">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(data.status, 100)}%`,
              background: getProgressBarColor()
            }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span className="threshold-mark">80%</span>
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

      {isAlert && (
        <div className="alert-message">
          <strong>⚠️ Vui lòng cấu hình Policer</strong>
        </div>
      )}
    </div>
  );
};

export default ApiMonitorBox;
