import React, { useState, useEffect } from 'react';
import dataJsonRaw from './DashboardMockData.json';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Table } from 'react-bootstrap';

const provinces = [
  'Viễn thông An Giang', 'Viễn thông Bà Rịa - Vũng Tàu', 'Viễn thông Bắc Giang',
  'Viễn thông Bắc Ninh', 'Viễn thông Bến Tre', 'Viễn thông Bình Dương',
  'Viễn thông Bình Thuận', 'Viễn thông Cà Mau', 'Viễn thông Cao Bằng',
  'Viễn thông Đắk Lắk', 'Viễn thông Điện Biên', 'Viễn thông Gia Lai',
  'Viễn thông Hà Nam', 'Viễn thông Hà Nội', 'Viễn thông Hà Tĩnh',
  'Viễn thông Hưng Yên', 'Viễn thông Kiên Giang', 'Viễn thông Khánh Hòa',
  'Viễn thông Lào Cai', 'Viễn thông Lâm Đồng', 'Viễn thông Long An',
  'Viễn thông Nam Định', 'Viễn thông Ninh Bình', 'Viễn thông Nghệ An',
  'Viễn thông Quảng Nam', 'Viễn thông Sóc Trăng', 'Viễn thông Tây Ninh',
  'Viễn thông Tiền Giang', 'Viễn thông Thái Bình', 'Viễn thông Thanh Hóa',
  'Viễn thông Trà Vinh', 'Viễn thông Vĩnh Long'
];

const DeviceUploadDashboard = () => {
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

  const filteredDevices = province
    ? devices
    : [];

  const handleSendProvince = () => {
    const count = devices.length;
    setIsSending(true);
    setSendDone(false);
    setDevicesSent(0);

    setTimeout(() => {
      setIsSending(false);
      setSendDone(true);
      setDevicesSent(count);
    }, 5000);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thực hiện đánh giá (đột xuất) theo đơn vị</h2>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Các tỉnh:</label>
          <select className="form-select" value={province} onChange={e => setProvince(e.target.value)}>
            <option value="">-- Chọn tỉnh --</option>
            {provinces.map((p, i) => (
              <option key={i} value={p}>{p}</option>
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
              'Gửi toàn bộ'
            )}
          </Button>

          {sendDone && (
            <span className="ms-3 text-success fw-semibold">
              ✅ {devicesSent}/{devicesSent} Đã đánh giá xong
            </span>
          )}
        </div>
      </div>

      {province && (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>STT</th>
              <th>Hostname</th>
              <th>IP Address</th>
              <th>Loại thiết bị</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index}>
                <td>{device.stt}</td>
                <td>{device.hostname}</td>
                <td>{device.ip}</td>
                <td>{device.type}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default DeviceUploadDashboard;
