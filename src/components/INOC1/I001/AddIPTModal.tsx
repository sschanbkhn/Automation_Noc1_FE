import React, { useState } from 'react';
import { IPTMonitoringItem, DEVICES_LIST } from './mockDataTab3';

interface AddIPTModalProps {
  onApply: (data: Omit<IPTMonitoringItem, 'id' | 'stt'>) => void;
  onCancel: () => void;
}

const AddIPTModal: React.FC<AddIPTModalProps> = ({ onApply, onCancel }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [interface_, setInterface] = useState<string>('');
  const [partner, setPartner] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [prtgId, setPrtgId] = useState<string>('');

  const isFormValid = selectedDevice && interface_ && partner && capacity && prtgId;

  const handleApply = () => {
    if (isFormValid) {
      onApply({
        device: selectedDevice,
        interface: interface_,
        partner: partner,
        capacity: capacity,
        prtgId: prtgId,
        dayAdded: new Date().toISOString().split('T')[0]
      });
      // Reset form
      setSelectedDevice('');
      setInterface('');
      setPartner('');
      setCapacity('');
      setPrtgId('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content add-ipt-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3>Add IPT Monitoring</h3>
            <p className="modal-subtitle">Thêm điểm theo dõi lưu lượng IPT mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Form Section */}
        <div className="modal-body">
          {/* Device Selection */}
          <div className="form-group">
            <label htmlFor="device-select">Thiết bị</label>
            <select
              id="device-select"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="form-control select-input"
            >
              <option value="">-- Chọn thiết bị --</option>
              {DEVICES_LIST.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          </div>

          {/* Interface Input */}
          <div className="form-group">
            <label htmlFor="interface-input">Interface</label>
            <input
              id="interface-input"
              type="text"
              placeholder="e.g., ge-0/0/0"
              value={interface_}
              onChange={(e) => setInterface(e.target.value)}
              className="form-control text-input"
            />
          </div>

          {/* Partner Input */}
          <div className="form-group">
            <label htmlFor="partner-input">Partner</label>
            <input
              id="partner-input"
              type="text"
              placeholder="e.g., GTT, Zenlayer, Equinix"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="form-control text-input"
            />
          </div>

          {/* Capacity Input */}
          <div className="form-group">
            <label htmlFor="capacity-input">Capacity</label>
            <input
              id="capacity-input"
              type="text"
              placeholder="e.g., 100 Gbps"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="form-control text-input"
            />
          </div>

          {/* PRTG ID Input */}
          <div className="form-group">
            <label htmlFor="prtg-input">PRTG_ID</label>
            <input
              id="prtg-input"
              type="text"
              placeholder="e.g., PRTG-001"
              value={prtgId}
              onChange={(e) => setPrtgId(e.target.value)}
              className="form-control text-input"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!isFormValid}
          >
            Add IPT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIPTModal;
