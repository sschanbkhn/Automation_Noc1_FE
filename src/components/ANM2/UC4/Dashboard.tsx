import React, { useEffect, useState } from 'react';
import Card from 'components/common/Card';
import { Row, Col, Table, Button, Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';


interface DashboardProps {
  goToTab?: (tabKey: string) => void; // function to switch tabs
}

const DeviceUploadDashboard : React.FC<DashboardProps> = ({ goToTab }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://10.155.43.198:5678/webhook/0ccdc9e0-f2fb-448f-9661-9fd3ef11c049?datamode=test_results');
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
          const res = await fetch('http://10.155.43.198:5678/webhook/423eb42f-6b98-4d8a-99d3-7302fc96c0da', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            alert(`File content sent for device ${device.hostname}`);
          } else {
            alert(`Failed to send file for device ${device.hostname}`);
          }
        } catch (err) {
          console.error(err);
          alert(`Error sending file for device ${device.hostname}`);
        }
      } else {
        alert(`Could not read file content for ${device.hostname}`);
      }
    };

    reader.onerror = () => {
      alert(`Failed to read file for ${device.hostname}`);
    };

    reader.readAsText(device.file);
  };

  return (
    <div className="container">
      <Row className="mb-4">
        <Col>
          <Card className="p-3 text-center bg-light">
            <div className="fs-4 fw-bold text-primary">
              Thực hiện đột xuất
            </div>
          </Card>
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
    </div>
  );
};

export default DeviceUploadDashboard;
