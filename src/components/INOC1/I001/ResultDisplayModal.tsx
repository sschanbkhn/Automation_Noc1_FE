import React, { useMemo } from 'react';

interface ResultItem {
  device: string;
  status: 'success' | 'failed';
  message: string;
}

interface ResultData {
  timestamp: string;
  asn: string;
  asName: string;
  prefixes: string[];
  devices: string[];
  results: ResultItem[];
}

interface ResultDisplayModalProps {
  result: ResultData;
  onClose: () => void;
}

const ResultDisplayModal: React.FC<ResultDisplayModalProps> = ({
  result,
  onClose
}) => {
  const stats = useMemo(() => {
    const successCount = result.results.filter(
      (r) => r.status === 'success'
    ).length;
    const failedCount = result.results.filter(
      (r) => r.status === 'failed'
    ).length;

    return {
      success: successCount,
      failed: failedCount,
      total: result.results.length
    };
  }, [result.results]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-result-display"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Result Summary Cards */}
        <div className="result-summary-cards">
          <div className="summary-card success-card">
            <div className="card-number">{stats.success}</div>
            <div className="card-label">Thành công</div>
          </div>
          <div className="summary-card failed-card">
            <div className="card-number">{stats.failed}</div>
            <div className="card-label">Thất bại</div>
          </div>
          <div className="summary-card total-card">
            <div className="card-number">{stats.total}</div>
            <div className="card-label">Tổng cộng</div>
          </div>
        </div>

        {/* Configuration Info */}
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

        {/* Detailed Results List */}
        <div className="result-details-section">
          <h4 className="details-header">Chi tiết kết quả từng thiết bị:</h4>
          <div className="result-items-list">
            {result.results.map((item, idx) => (
              <div
                key={idx}
                className={`result-item-card ${item.status}`}
              >
                <div className="result-item-icon">
                  {item.status === 'success' ? '✓' : '✗'}
                </div>
                <div className="result-item-info">
                  <div className="result-item-device">{item.device}</div>
                  <div className="result-item-message">{item.message}</div>
                </div>
                <div className="result-item-status">
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

export default ResultDisplayModal;
