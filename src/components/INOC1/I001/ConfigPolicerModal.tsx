import React, { useState } from 'react';

interface ConfigPolicerModalProps {
  asn: string;
  bandwidth: string;
  selectedDevices: string[];
  onDeviceChange: (device: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
}

const ConfigPolicerModal: React.FC<ConfigPolicerModalProps> = ({
  asn,
  bandwidth,
  selectedDevices,
  onDeviceChange,
  onSelectAll,
  onApply,
  onCancel
}) => {
  const allDevices = [
    'SPG-POP01', 'SPG-POP02',
    'HKG-POP01', 'HKG-POP02', 'HKG-EQX-POP01', 'HKG-EQX-POP02',
    'HCM-ASBR2', 'HCM-ASBR5',
    'HNI-ASBR2', 'HNI-ASBR3',
    'DNG-ASBR2', 'DNG-ASBR3'
  ];

  const isAllSelected = selectedDevices.length === allDevices.length;
  const configCommand = `set firewall filter Protect-VN2-from-Upstream-Transit term Policer-${asn} then policer ${bandwidth}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Config Khuyến nghị</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Config Info */}
        <div className="config-info">
          <div className="config-description">
            <strong>Cấu hình được khuyến nghị:</strong>
          </div>
          <div className="config-detail-box">
            <div className="config-item">
              <span className="label">AS:</span>
              <span className="value">{asn}</span>
            </div>
            <div className="config-item">
              <span className="label">Bandwidth:</span>
              <span className="value">{bandwidth}</span>
            </div>
          </div>

          <div className="config-code">
            <div className="code-label">Lệnh cấu hình:</div>
            <code className="code-block">{configCommand}</code>
          </div>
        </div>

        {/* Device Selection */}
        <div className="device-selection">
          <div className="device-header">
            <strong>Chọn thiết bị POP/Peering (12 thiết bị)</strong>
          </div>

          {/* Select All */}
          <div className="select-all-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
              <span className="select-all-text">Chọn tất cả</span>
            </label>
            <span className="device-count">
              ({selectedDevices.length}/{allDevices.length} được chọn)
            </span>
          </div>

          {/* Device Grid */}
          <div className="device-grid">
            {allDevices.map((device) => (
              <label key={device} className="device-checkbox">
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(device)}
                  onChange={(e) => onDeviceChange(device, e.target.checked)}
                />
                <span className="device-name">{device}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={onApply}
            disabled={selectedDevices.length === 0}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPolicerModal;
