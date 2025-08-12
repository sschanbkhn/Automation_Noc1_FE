// src/pages/DeviceHealthcheckPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Col, Row, Spinner, Form, Button } from 'react-bootstrap';
import { fetchPlatforms, fetchDevicesByPlatform } from '../../redux/Healthcheck/platformDeviceSlice';

const DeviceHealthcheckPage = () => {
  const dispatch = useDispatch();
  const { platforms, devices, loadingDevices } = useSelector((state) => state.platformDevice);

  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
  }, [dispatch, selectedPlatform]);

  console.log('Platforms:', platforms);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlatform || !selectedDevice) return;

    try {
      setSubmitting(true);
      setResult(null);

      const response = await fetch(`/api/nornirps/healthcheck/device/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('Token') || '',
        },
        body: JSON.stringify({ platform: selectedPlatform, host: selectedDevice }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Healthcheck error:', error);
      setResult({ error: 'Lỗi khi thực hiện healthcheck' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className="p-3">
      <Col md={12}>
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn Platform</Form.Label>
                    <Form.Select
                      value={selectedPlatform}
                      onChange={(e) => {
                        setSelectedPlatform(e.target.value);
                        setSelectedDevice('');
                      }}
                    >
                      <option value="">-- Chọn platform --</option>
                      {platforms.map((p, idx) => (
                        <option key={idx} value={p?.name}>
                          {p?.name} ({p?.device_count ?? 0})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn Thiết bị</Form.Label>
                    <Form.Select
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      disabled={!selectedPlatform}
                    >
                      <option value="">-- Chọn thiết bị --</option>
                      {devices.map((d, idx) => (
                        <option key={idx} value={d?.name}>
                          {d?.name} ({d?.ip || 'no-ip'})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Button type="submit" variant="primary" disabled={!selectedDevice || submitting}>
                    {submitting ? 'Đang kiểm tra...' : 'Healthcheck ngay'}
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* {loadingDevices && (
              <div className="text-center mt-3">
                <Spinner animation="border" />
              </div>
            )}

            {result && (
              <div className="mt-4">
                <h5>Kết quả:</h5>
                <pre className="bg-light p-2 rounded border">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )} */}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DeviceHealthcheckPage;
