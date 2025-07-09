// src/pages/PlatformDeviceTable.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Col, Row, Spinner, Table, Form } from 'react-bootstrap';
import { fetchPlatforms, fetchDevicesByPlatform } from '../../redux/Healthcheck/platformDeviceSlice';

const PlatformDeviceTable = () => {
  const dispatch = useDispatch();
  const { platforms, devices, loading } = useSelector((state) => state.platformDevice);
  const [selectedPlatform, setSelectedPlatform] = useState('');

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
  }, [dispatch, selectedPlatform]);

  return (
    <React.Fragment>
      <Row className="p-3">
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Quản lý Platform và Device</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Chọn Platform</Form.Label>
                <Form.Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                  <option value="">-- Chọn platform --</option>
                  {platforms.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {loading ? (
                <div className="text-center my-3">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table bordered hover responsive className="table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{d.name}</td>
                      </tr>
                    ))}
                    {devices.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center text-muted">
                          Không có thiết bị nào được tìm thấy.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PlatformDeviceTable;
