import React, { useEffect, useState } from 'react';
import { Table, Card, Modal, Button, Form, Spinner } from 'react-bootstrap';
import logDataJson from './DashboardMockData.json';

interface DashboardProps {
  goToTab?: (tabKey: string) => void; // function to switch tabs
}

const Dashboard: React.FC<DashboardProps> = ({ goToTab }) => {
  const [logData, setLogData] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[] | null>(null);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [loadingDevices, setLoadingDevices] = useState<number[]>([]); // track loading uploads

  useEffect(() => {
    setLogData(logDataJson);
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleOpenModal = (devices: any[], title: string, logIndex: number) => {
    setSelectedDevices([...devices]);
    setModalTitle(title);
    setSelectedLogIndex(logIndex);
    setLoadingDevices([]);
    setShowModal(true);
  };

  const handleFileUpload = (deviceIndex: number) => {
    if (!selectedDevices || selectedLogIndex === null) return;

    if (loadingDevices.includes(deviceIndex)) return; // prevent double upload

    setLoadingDevices((prev) => [...prev, deviceIndex]);

    setTimeout(() => {
      const updatedDevices = [...selectedDevices];
      updatedDevices[deviceIndex].status = 'passed';

      const updatedLogs = [...logData];
      updatedLogs[selectedLogIndex].devices = updatedDevices;

      const passedCount = updatedDevices.filter((d) => d.status === 'passed').length;
      const total = updatedDevices.length;
      updatedLogs[selectedLogIndex].completion = `${passedCount}/${total} devices`;

      if (passedCount === total) {
        updatedLogs[selectedLogIndex].status = 'Hoàn thành';
      }

      setLogData(updatedLogs);
      setSelectedDevices(updatedDevices);
      setLoadingDevices((prev) => prev.filter((i) => i !== deviceIndex));
    }, 3000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDevices(null);
    setSelectedLogIndex(null);
    setLoadingDevices([]);
  };

  return (
    <>
      <Card className="m-4 p-4">
        <h4 className="mb-4">Lịch sử Kiểm tra</h4>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {logData.map((entry, index) => (
              <tr key={index}>
                <td>{formatTime(entry.time)}</td>
                <td
                  style={{
                    color: entry.status === 'Hoàn thành' ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {entry.status}
                </td>
                <td>
                  {entry.devices ? (
                    <Button
                      variant="link"
                      onClick={() =>
                        handleOpenModal(entry.devices, `Chi tiết - ${formatTime(entry.time)}`, index)
                      }
                    >
                      {entry.completion}
                    </Button>
                  ) : (
                    entry.completion
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDevices && selectedDevices.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Tên thiết bị</th>
                  <th>Trạng thái</th>
                  <th>Import file</th>
                </tr>
              </thead>
              <tbody>
                {selectedDevices.map((device, idx) => (
                  <tr key={idx}>
                    <td>{device.name}</td>
                    <td>
                      {loadingDevices.includes(idx) ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <span style={{ color: device.status === 'passed' ? 'green' : 'red' }}>
                          {device.status === 'passed' ? 'Hoàn thành' : 'Lỗi'}
                        </span>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="file"
                        size="sm"
                        onChange={() => handleFileUpload(idx)}
                        disabled={loadingDevices.includes(idx)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Không có dữ liệu thiết bị.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;
