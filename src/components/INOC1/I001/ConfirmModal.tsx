import React from 'react';

interface ConfirmModalProps {
  devices: string[];
  configDetail: { as: string; bandwidth: string };
  onApply: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  devices,
  configDetail,
  onApply,
  onCancel
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Xác nhận cấu hình</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Confirmation Message */}
        <div className="confirm-message">
          <div className="confirm-icon">⚠️</div>
          <p>Bạn sắp cấu hình Policer cho các thiết bị sau. Vui lòng xác nhận:</p>
        </div>

        {/* Config Summary */}
        <div className="confirm-summary">
          <div className="summary-item">
            <span className="label">AS:</span>
            <span className="value">{configDetail.as}</span>
          </div>
          <div className="summary-item">
            <span className="label">Bandwidth:</span>
            <span className="value">{configDetail.bandwidth}</span>
          </div>
        </div>

        {/* Selected Devices List */}
        <div className="selected-devices">
          <div className="devices-title">
            <strong>Danh sách thiết bị sẽ được cấu hình ({devices.length}/12):</strong>
          </div>

          <div className="devices-list">
            {devices.map((device, idx) => (
              <div key={idx} className="device-item">
                <span className="device-icon">✓</span>
                <span className="device-text">{device}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="confirm-warning">
          <strong>⚠️ Lưu ý:</strong>
          <p>Cấu hình này sẽ được áp dụng vào tất cả các thiết bị được chọn. Quá trình này không thể được hoàn tác ngay lập tức.</p>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn btn-danger" onClick={onApply}>
            Xác nhận cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
