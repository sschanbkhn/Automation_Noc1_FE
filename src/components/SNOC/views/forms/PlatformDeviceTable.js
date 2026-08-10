// src/pages/PlatformDeviceTable.js
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Col, Row, Spinner, Table, Form, Pagination } from 'react-bootstrap';
import { fetchPlatforms, fetchDevicesByPlatform } from '../../redux/Healthcheck/platformDeviceSlice';
import { createRequestSortFunction, filterData, getClassNamesFor, sortData } from '../../utils/tableUtils';

const PAGE_SIZE = 20;

const PlatformDeviceTable = () => {
  const dispatch = useDispatch();
  const { platforms, devices, loading } = useSelector((state) => state.platformDevice);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const requestSort = createRequestSortFunction(setSortConfig, sortConfig);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlatform) {
      dispatch(fetchDevicesByPlatform(selectedPlatform));
    }
  }, [dispatch, selectedPlatform]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortConfig, selectedPlatform]);

  const filteredDevices = useMemo(() => filterData(devices, searchTerm, []), [devices, searchTerm]);
  const sortedDevices = useMemo(
    () => (sortConfig.key ? sortData(filteredDevices, sortConfig.key, sortConfig.direction) : filteredDevices),
    [filteredDevices, sortConfig]
  );
  const totalPages = Math.max(1, Math.ceil(sortedDevices.length / PAGE_SIZE));
  const pagedDevices = sortedDevices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

              {devices.length > 0 && (
                <Form.Control
                  size="sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm device..."
                  className="mb-3"
                  style={{ maxWidth: 320 }}
                />
              )}

              {loading ? (
                <div className="text-center my-3">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  <Table bordered hover responsive className="table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th
                          role="button"
                          onClick={() => requestSort("name")}
                          className={getClassNamesFor(sortConfig, "name")}
                        >
                          Device
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDevices.map((d, i) => (
                        <tr key={d.id || d.name}>
                          <td>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                          <td>{d.name}</td>
                        </tr>
                      ))}
                      {pagedDevices.length === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center text-muted">
                            Không có thiết bị nào được tìm thấy.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  {totalPages > 1 && (
                    <Pagination className="justify-content-center">
                      <Pagination.Prev
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PlatformDeviceTable;
