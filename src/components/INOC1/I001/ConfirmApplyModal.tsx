import React from 'react';

interface ConfirmApplyModalProps {
  asn: string;
  asName: string;
  prefixes: string[];
  devices: string[];
  onApply: () => void;
  onCancel: () => void;
}

const ConfirmApplyModal: React.FC<ConfirmApplyModalProps> = ({
  asn,
  asName,
  prefixes,
  devices,
  onApply,
  onCancel
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content modal-confirm-apply"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Xác nhận cấu hình</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Confirmation Message */}
        <div className="confirm-message-section">
          <div className="confirm-icon">✓</div>
          <p>Bạn có chắc muốn thêm counter cho ASN này vào các thiết bị đã chọn?</p>
        </div>

        {/* Configuration Summary */}
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

        {/* Prefixes List */}
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

        {/* Devices List */}
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

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button className="btn btn-primary" onClick={onApply}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmApplyModal;
