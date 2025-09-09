import React, { useEffect, useState } from 'react';
import Card from 'components/common/Card';
import { Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://10.155.43.198:5678/webhook/7bd100c2-3a64-4242-928a-b5ecda899f60'); // Replace with real API
        const json = await response.json();
        const array: any[] = Array.isArray(json) ? json : [];
        setDevices(array);
      } catch (err) {
        console.error('Failed to fetch data from API:', err);
        setDevices([]);
      }
    };

    fetchData();
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const filterType = queryParams.get('type')?.toLowerCase();
  const filterVendor = queryParams.get('vendor')?.toLowerCase();
  const filterProvince = queryParams.get('province')?.toLowerCase();

  const filteredDevices = devices.filter(device => {
    // const matchType = !filterType || device.device_type?.toLowerCase().includes(filterType);
    const matchVendor = !filterVendor || device.vendor?.toLowerCase().includes(filterVendor);
    const matchProvince = !filterProvince || device.province?.toLowerCase() === filterProvince;
    return matchVendor && matchProvince;
  });
console.log(filteredDevices);
  const criteriaMap: Record<string, string> = {
    tc_hostname: 'Kiểm tra hostname',
    tc_patch_info: 'Kiểm tra bản vá',
    tc_telnet_status: 'Trạng thái Telnet',
    tc_ssh_sec: 'SSH bảo mật',
    tc_ssh_version: 'Phiên bản SSH',
    tc_ssh_root: 'Truy cập root SSH',
    tc_remote_access: 'Truy cập từ xa',
    tc_ssh_timeout: 'SSH timeout',
    tc_snmp_version: 'Phiên bản SNMP',
    tc_snmp_access: 'Quyền SNMP',
    tc_snmp_community: 'Cộng đồng SNMP',
    tc_ntp_sec: 'Bảo mật NTP',
  };

  const handleSend = () => {
    setSending(true);
    setShowSuccess(false);
    setTimeout(() => {
      setSending(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const toggleDetail = (deviceId: string, criteria: string) => {
    const key = `${deviceId}_${criteria}`;
    setExpandedCriteria(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container">
      <Row className="mb-4">
        <Col>
          <Card className="p-3 text-center bg-light">
            <div className="fs-4 fw-bold text-primary">
              Dashboard quản trị tuân thủ cấu hình an toàn bảo mật
            </div>
          </Card>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Hostname</th>
            <th>IP</th>
            <th>Loại thiết bị</th>
            <th>Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device, index) => {
              const results = Object.entries(device.test_result || {});
              const hasFail = results.some(([key, value]) => key !== 'tc_hostname' && value === 'Fail');
              if (!hasFail) return null;

              return (
                <tr key={device.device}>
                  <td>{index + 1}</td>
                  <td>{device.device || 'N/A'}</td>
                  <td>N/A</td>
                  <td>{device.vendor || 'N/A'}</td>
                  <td className="text-danger">
                    <Button variant="danger" size="sm" onClick={() => setSelectedDevice(device)}>
                      Fail
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                Không có dữ liệu để hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={!!selectedDevice} onHide={() => setSelectedDevice(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thiết bị</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDevice &&
            Object.entries(selectedDevice.test_result || {}).map(([key, value]) => {
              const isHostname = key === 'tc_hostname';
              const isFail = !isHostname && value === 'Fail';
              const isPass = isHostname || value === 'Pass';
              const deviceId = selectedDevice.device;
              const isExpanded = expandedCriteria[`${deviceId}_${key}`];
              return (
                <div
                  key={key}
                  className="p-2 mb-2"
                  style={{
                    backgroundColor: isFail ? '#fdecea' : '#e9f7ef',
                    borderRadius: '4px',
                  }}
                >
                  <strong>{criteriaMap[key] || key}:</strong> {value}
                  {isFail && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => toggleDetail(deviceId, key)}
                    >
                      Chi tiết
                    </Button>
                  )}
                  {isFail && isExpanded && (
                    <div className="mt-2 ps-3">
                      <div>
                        <strong>Cấu hình hiện tại:</strong>
                        <br />
                        snmp-agent sys-info version v1 v2c
                      </div>
                      <div>
                        <strong>Cấu hình yêu cầu:</strong>
                        <br />
                        Sử dụng giao thức quản lý mạng SNMP version 2c, 3.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          <div className="text-center">
            <button className="btn btn-primary mt-3" onClick={handleSend} disabled={sending}>
              {sending ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Gửi phiếu xử lý tuân thủ
            </button>
            {showSuccess && (
              <div className="mt-3 alert alert-success py-2 px-3 mb-0" role="alert">
                Gửi thành công!
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
