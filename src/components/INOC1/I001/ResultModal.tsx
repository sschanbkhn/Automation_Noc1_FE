import React from 'react';

interface ResultItem {
  device: string;
  status: 'success' | 'failed';
  message: string;
}

interface ResultData {
  timestamp: string;
  selectedDevices: string[];
  configDetail: { as: string; bandwidth: string };
  results: ResultItem[];
}

interface ResultModalProps {
  result: ResultData;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const successCount = result.results.filter(r => r.status === 'success').length;
  const failedCount = result.results.filter(r => r.status === 'failed').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-result" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Result Summary */}
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
            <div className="summary-number">{result.results.length}</div>
            <div className="summary-label">Tổng cộng</div>
          </div>
        </div>

        {/* Config Info */}
        <div className="result-config">
          <div className="config-row">
            <span className="label">AS:</span>
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

        {/* Detailed Results */}
        <div className="result-details">
          <h4>Chi tiết từng thiết bị:</h4>
          <div className="result-list">
            {result.results.map((item, idx) => (
              <div
                key={idx}
                className={`result-item ${item.status}`}
              >
                <div className="result-icon">
                  {item.status === 'success' ? '✓' : '✕'}
                </div>
                <div className="result-info">
                  <div className="result-device">{item.device}</div>
                  <div className="result-message">{item.message}</div>
                </div>
                <div className={`result-status ${item.status}`}>
                  {item.status === 'success' ? 'Thành công' : 'Thất bại'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
