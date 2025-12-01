import React, { useState, useMemo } from 'react';
import { ASNTab2Data, DEVICES_LIST } from './mockDataTab2';

interface AddCounterModalProps {
  asnList: ASNTab2Data[];
  onApply: (data: {
    asn: string;
    asName: string;
    selectedPrefixes: string[];
    selectedDevices: string[];
  }) => void;
  onCancel: () => void;
}

const AddCounterModal: React.FC<AddCounterModalProps> = ({
  asnList,
  onApply,
  onCancel
}) => {
  const [inputASN, setInputASN] = useState('');
  const [inputASName, setInputASName] = useState('');
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // Find ASN data based on input
  const foundASN = useMemo(() => {
    if (!inputASN.trim()) return null;
    return asnList.find(
      (a) => a.asn.toUpperCase() === inputASN.trim().toUpperCase()
    );
  }, [inputASN, asnList]);

  // Get available prefixes for the selected ASN
  const availablePrefixes = useMemo(() => {
    if (!foundASN) return [];
    return foundASN.prefixes || [];
  }, [foundASN]);

  // Handle ASN input change
  const handleASNChange = (value: string) => {
    setInputASN(value);
    setInputASName('');
    setSelectedPrefixes([]);
    
    // Auto-fill AS Name if ASN is found
    const found = asnList.find(
      (a) => a.asn.toUpperCase() === value.toUpperCase()
    );
    if (found) {
      setInputASName(found.asName);
    }
  };

  // Handle prefix selection
  const handlePrefixChange = (prefix: string, checked: boolean) => {
    if (checked) {
      setSelectedPrefixes([...selectedPrefixes, prefix]);
    } else {
      setSelectedPrefixes(
        selectedPrefixes.filter((p) => p !== prefix)
      );
    }
  };

  // Handle device selection
  const handleDeviceChange = (device: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices([...selectedDevices, device]);
    } else {
      setSelectedDevices(
        selectedDevices.filter((d) => d !== device)
      );
    }
  };

  // Handle select all devices
  const handleSelectAllDevices = (checked: boolean) => {
    if (checked) {
      setSelectedDevices([...DEVICES_LIST]);
    } else {
      setSelectedDevices([]);
    }
  };

  const isAllDevicesSelected = selectedDevices.length === DEVICES_LIST.length;
  const isFormValid =
    inputASN.trim() !== '' &&
    inputASName.trim() !== '' &&
    selectedPrefixes.length > 0 &&
    selectedDevices.length > 0;

  const handleApply = () => {
    if (isFormValid) {
      onApply({
        asn: inputASN.trim(),
        asName: inputASName.trim(),
        selectedPrefixes,
        selectedDevices
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content add-counter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3>Add Counter</h3>
            <p className="modal-subtitle">Thêm counter cho ASN mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* ASN Information Section */}
        <div className="add-counter-section">
          <h4 className="section-header">Thông tin ASN</h4>
          <div className="asn-input-group">
            <div className="input-field">
              <label htmlFor="asn-input">ASN</label>
              <input
                id="asn-input"
                type="text"
                placeholder="e.g., AS64512"
                value={inputASN}
                onChange={(e) => handleASNChange(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-field">
              <label htmlFor="asname-input">AS Name</label>
              <input
                id="asname-input"
                type="text"
                placeholder="e.g., TECHNET-AS"
                value={inputASName}
                onChange={(e) => setInputASName(e.target.value)}
                className="form-input"
                disabled={!!foundASN}
              />
            </div>
          </div>
        </div>

        {/* Prefix Selection Section */}
        {availablePrefixes.length > 0 && (
          <div className="add-counter-section">
            <h4 className="section-header">Chọn Prefix</h4>
            <div className="prefix-selection-list">
              {availablePrefixes.map((prefix) => {
                const isDisabled = prefix.isCountered;
                return (
                  <label
                    key={prefix.prefix}
                    className={`prefix-selection-item ${isDisabled ? 'disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrefixes.includes(prefix.prefix)}
                      onChange={(e) =>
                        !isDisabled &&
                        handlePrefixChange(prefix.prefix, e.target.checked)
                      }
                      disabled={isDisabled}
                    />
                    <div className="prefix-selection-content">
                      <div className="prefix-text">
                        <code>{prefix.prefix}</code>
                        {isDisabled && (
                          <span className="disabled-badge">Đã được counter</span>
                        )}
                      </div>
                      <div className="prefix-traffic-info">
                        <span className="traffic-badge in">
                          Max In: {prefix.maxIn}
                        </span>
                        <span className="traffic-badge out">
                          Max Out: {prefix.maxOut}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Device Selection Section */}
        <div className="add-counter-section">
          <div className="device-header-group">
            <h4 className="section-header">Chọn thiết bị (12 box)</h4>
            <button className="select-all-button">Chọn tất cả</button>
          </div>

          {/* Select All Checkbox */}
          <div className="select-all-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAllDevicesSelected}
                onChange={(e) => handleSelectAllDevices(e.target.checked)}
              />
              <span className="select-all-text">Chọn tất cả thiết bị</span>
            </label>
            <span className="device-count">
              {selectedDevices.length}/{DEVICES_LIST.length}
            </span>
          </div>

          {/* Device Grid */}
          <div className="device-grid-tab2">
            {DEVICES_LIST.map((device) => (
              <label key={device} className="device-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(device)}
                  onChange={(e) => handleDeviceChange(device, e.target.checked)}
                />
                <span className="device-label-text">{device}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!isFormValid}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCounterModal;
