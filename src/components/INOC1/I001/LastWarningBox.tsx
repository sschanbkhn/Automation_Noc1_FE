import React from 'react';

interface WarningData {
  lastWarningTime: string;
  message: string;
  asn: string;
  bandwidth: string;
  recommendation: string;
}

interface LastWarningBoxProps {
  data: WarningData;
}

const LastWarningBox: React.FC<LastWarningBoxProps> = ({ data }) => {
  return (
    <div className="warning-box">
      <div className="warning-header">
        <div className="warning-icon">⚠️</div>
        <h4>Last warning</h4>
      </div>

      <div className="warning-content">
        <div className="warning-time">
          <span className="label">Cảnh báo cuối cùng:</span>
          <span className="value">{data.message}</span>
        </div>

        <div className="warning-detail">
          <div className="detail-row">
            <span className="label">AS:</span>
            <span className="value">{data.asn}</span>
          </div>
          <div className="detail-row">
            <span className="label">Bandwidth:</span>
            <span className="value">{data.bandwidth}</span>
          </div>
        </div>

        <div className="warning-recommendation">
          <span className="label">Khuyến nghị:</span>
          <code className="recommendation-code">{data.recommendation}</code>
        </div>
      </div>

      <div className="warning-footer">
        <small>{data.lastWarningTime}</small>
      </div>
    </div>
  );
};

export default LastWarningBox;
