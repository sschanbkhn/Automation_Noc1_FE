import React, { useEffect, useState } from 'react';
import Card from 'components/common/Card';
import { Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

interface DashboardProps {
  goToTab?: (tabKey: string) => void; // function to switch tabs
}

const DeviceUploadDashboard: React.FC<DashboardProps> = ({ goToTab }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [globalFile, setGlobalFile] = useState<File | null>(null);
  const location = useLocation();

  const criteriaFieldMap: Record<string, string[]> = {
    tc_telnet_status: ['telnet_status'],
    tc_ssh_sec: ['ssh_sec'],
    tc_ssh_version: ['ssh_version'],
    tc_ssh_root: ['ssh_root'],
    tc_remote_access: ['remote_access'],
    tc_ssh_timeout: ['ssh_timeout'],
    tc_snmp_version: ['snmp_version'],
    tc_snmp_access: ['snmp_access'],
    tc_snmp_community: ['snmp_community'],
    tc_ntp_sec: ['ntp_sec'],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          'http://10.147.50.118:5678/webhook/7bd100c2-3a64-4242-928a-b5ecda899f60'
        );
        const json = await res.json();
        const array: any[] = Array.isArray(json) ? json : [];

        const enriched = array.map((d, i) => ({
          stt: i + 1,
          hostname: d.device,
          ip: 'N/A',
          type: `${d.vendor || 'Unknown'} - ${d.device?.split('.')[0] || 'Unknown'}`,
          file: null,
        }));

        setDevices(enriched);
      } catch (err) {
        console.error('Failed to load data:', err);
        setDevices([]);
      }
    };

    fetchData();
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const filterType = queryParams.get('type')?.toLowerCase();
  const filterVendor = queryParams.get('vendor')?.toLowerCase();

  const filteredDevices = devices.filter(device => {
    const matchType = !filterType || device.type?.toLowerCase().includes(filterType);
    const matchVendor = !filterVendor || device.type?.toLowerCase().includes(filterVendor);
    return matchType && matchVendor;
  });

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...devices];
    updated[index].file = file;
    setDevices(updated);
  };

  const handleSend = async (index: number) => {
    const device = devices[index];

    if (!device.file) {
      alert(`Please select a file for device ${device.hostname}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result;

      if (typeof fileContent === 'string') {
        const payload = {
          hostname: device.hostname,
          ip: device.ip,
          type: device.type,
          content: fileContent,
        };

        try {
          const res = await fetch(
            'http://10.147.50.118:5678/webhook/423eb42f-6b98-4d8a-99d3-7302fc96c0da',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (res.ok) {
            const result = await res.json();
            setSelectedDevice({
              hostname: result.test_details?.[1]?.tc_hostname || device.hostname,
              test_result: result.test_details?.[1],
              test_result_details: result.test_details,
            });
          } else {
            alert(`Failed to send file for device ${device.hostname}`);
          }
        } catch (err) {
          console.error(err);
          alert(`Error sending file for device ${device.hostname}`);
        }
      }
    };

    reader.readAsText(device.file);
  };

  const handleGlobalSend = async () => {
    if (!globalFile) {
      alert('Please select a global file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result;

      if (typeof fileContent === 'string') {
        const payload = { content: fileContent };

        try {
          const res = await fetch(
            'http://10.147.50.118:5678/webhook/423eb42f-6b98-4d8a-99d3-7302fc96c0dchuawei',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (res.ok) {
            const result = await res.json();
            setSelectedDevice({
              hostname: result.test_details?.[1]?.tc_hostname || 'Unknown',
              test_result: result.test_details?.[1],
              test_result_details: result.test_details,
            });
          } else {
            alert('Failed to upload global file');
          }
        } catch (err) {
          console.error(err);
          alert('Error uploading global file');
        }
      }
    };

    reader.readAsText(globalFile);
  };

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

    // Define required configuration template
  const requiredConfig: Record<string, any> = {
    tc_telnet_status: 'Tắt tính năng truy cập vào thiết bị qua giao thức Telnet.',
    tc_ssh_sec: 'Giới hạn số lượng phiên kết nối SSH đồng thời (khuyến nghị dưới 10).',
    tc_ssh_version: 'Chỉ sử dụng giao thức SSHv2 trở lên.',
    tc_ssh_root: 'Vô hiệu hoá truy cập từ xa thông qua tài khoản root.',
    tc_remote_access: 'Giới hạn các địa chỉ truy cập từ xa, chỉ cho phép truy cập từ phân vùng quản trị.',
    tc_ssh_timeout: 'Kích hoạt tính năng thời gian chờ (timeout) tự đăng xuất phiên quản trị sau khoảng thời gian chờ không nhận được hành động cấu hình',
    tc_snmp_version: 'Sử dụng giao thức quản lý mạng SNMP version 2c, 3.',
    tc_snmp_access: 'Giới hạn danh sách địa chỉ được phép truy vấn SNMP, chỉ cho phép truy vấn từ phân vùng quản trị, giám sát.',
    tc_snmp_community: 'Không khai báo các community read-write, chỉ sử dụng quyền read-only.',
    tc_ntp_sec: 'Sử dụng giao thức đồng bộ thời gian NTP version 4 trở lên',
  };

  const toggleDetail = (deviceId: string, criteria: string) => {
    const key = `${deviceId}_${criteria}`;
    setExpandedCriteria(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container">
      <Row className="mb-4">
        <Col>
          <Card className="p-3 text-center bg-light">
            <div className="fs-4 fw-bold text-primary">Thực hiện đột xuất</div>
          </Card>
        </Col>
      </Row>

      {/* Global Upload */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="file"
            size="sm"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGlobalFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </Col>
        <Col md="auto">
          <Button size="sm" onClick={handleGlobalSend}>
            Gửi
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Hostname</th>
            <th>IP Address</th>
            <th>Loại thiết bị</th>
            <th>Import File</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device, index) => (
              <tr key={index}>
                <td>{device.stt}</td>
                <td>{device.hostname}</td>
                <td>{device.ip || ''}</td>
                <td>{device.type}</td>
                <td>
                  <Form.Control
                    type="file"
                    size="sm"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileChange(index, e.target.files ? e.target.files[0] : null)
                    }
                  />
                </td>
                <td>
                  <Button size="sm" onClick={() => handleSend(index)}>
                    Gửi
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                Không có dữ liệu để hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for device details */}
      <Modal
        show={!!selectedDevice}
        onHide={() => setSelectedDevice(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thiết bị</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  {selectedDevice &&
    Object.entries(selectedDevice.test_result || {}).map(([key, value]) => {
      const isHostname = key === 'tc_hostname';
      const isFail = !isHostname && value === 'Fail';
      const deviceId = selectedDevice.hostname;
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
                {criteriaFieldMap[key]?.map((field) => (
                  <div key={field}>
                    {selectedDevice.test_result_details?.[0][field] || 'N/A'}
                  </div>
                ))}
              </div>
              <div className="mt-1">
                <strong>Cấu hình yêu cầu:</strong>
                <br />
                {criteriaFieldMap[key]?.map((field) => (
                  // <div key={field}>{field}: {selectedDevice.test_result_details?.[1][key] || 'N/A'}</div>
                  // <div key={field}>{selectedDevice.test_result_details?.[1][key] || 'N/A'}</div>
                  <div key={field}>
                    {requiredConfig[key] || 'N/A'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    })}
</Modal.Body>

      </Modal>
    </div>
  );
};

export default DeviceUploadDashboard;
