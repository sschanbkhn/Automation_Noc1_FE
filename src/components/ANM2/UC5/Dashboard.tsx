import React, { useState, useEffect } from 'react';
import dataJsonRaw from './DashboardMockData.json';
import { Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const provinces = ['NOC1', 'NOC2', 'NOC3'];


interface DashboardProps {
  goToTab?: (tabKey: string) => void; // function to switch tabs
}

const DeviceUploadDashboard : React.FC<DashboardProps> = ({ goToTab }) => {
  const [province, setProvince] = useState<string>('');
  const [devices, setDevices] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const [devicesSent, setDevicesSent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const enriched = dataJsonRaw
      .filter(device => device.vendor === 'Huawei')
      .map((device, i) => ({
        stt: i + 1,
        hostname: device.device || 'N/A',
        ip: 'N/A',
        type: `${device.vendor || 'Unknown'} - ${device.device?.split('.')[0] || 'Unknown'}`,
      }));
    setDevices(enriched);
  }, []);

  const handleSendProvince = async () => {
    if (!province) return;

    setIsSending(true);
    setSendDone(false);
    setDevicesSent(0);

    try {
      const response = await fetch(`http://10.155.43.198:5678/webhook/e2500aeb-7466-4b54-8aee-30964a625c5frunvn2mane?folder=${province}`, {
        method: 'GET',
        
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      setDevicesSent(devices.length);
      setSendDone(true);
    } catch (error) {
      console.error('Error sending devices:', error);
      alert('Có lỗi xảy ra khi gửi dữ liệu!');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thực hiện đánh giá (đột xuất) theo đơn vị</h2>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Các tỉnh:</label>
          <select
            className="form-select"
            value={province}
            onChange={e => setProvince(e.target.value)}
          >
            <option value="">-- Chọn tỉnh --</option>
            {provinces.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4 d-flex align-items-end">
          <Button onClick={handleSendProvince} disabled={isSending || !province}>
            {isSending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang thực hiện...
              </>
            ) : (
              'Thực hiện'
            )}
          </Button>

          {sendDone && (
            <span className="ms-3 text-success fw-semibold">
              ✅ Đã bắt đầu thành công Đơn vị: {province}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceUploadDashboard;
