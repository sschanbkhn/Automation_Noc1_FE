// 

// src/pages/PSCoreTable.js
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Table, Spinner, Form, Button, Pagination } from 'react-bootstrap';
import { fetchPSCoreStatus } from '../../redux/Healthcheck/psCoreSlice';

const statusRowClass = {
  OK: '',
  Warning: 'table-warning',
  Error: 'table-danger',
  NOK: 'table-danger',
  Unknown: 'table-secondary'
};

const PSCoreTable = () => {
  const dispatch = useDispatch();
  const { items = [], loading = false, count = 0 } = useSelector((state) => state.pscore || {});
  const [host, setHost] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const searchHostRef = useRef('');
  const pageSize = 10;

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedHost = host.trim();
    searchHostRef.current = trimmedHost;
    setCurrentPage(1);
    dispatch(fetchPSCoreStatus({ host: trimmedHost, page: 1 }));
  };

  useEffect(() => {
    dispatch(fetchPSCoreStatus({ host: searchHostRef.current, page: currentPage }));
  }, [dispatch, currentPage]);

  const totalPages = Math.ceil(count / pageSize);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <React.Fragment>
      <Row>
        <Col md={12} className="mb-3">
          <Form onSubmit={handleSearch} className="d-flex">
            <Form.Control
              type="text"
              placeholder="Nhập tên node (host)"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="me-2"
            />
            <Button variant="primary" type="submit">Tìm kiếm</Button>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">PS Core - Danh sách bản ghi healthcheck</Card.Title>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <>
                  <Table responsive hover bordered className="table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>STT</th>
                        <th>Host</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                        <th>File kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id || index} className={statusRowClass[item.status] || ''}>
                          <td>{(currentPage - 1) * pageSize + index + 1}</td>
                          <td>{item.host}</td>
                          <td>{new Date(item.created_at).toLocaleString()}</td>
                          <td>{item.status}</td>
                          <td>
                            <ul className="mb-0 ps-3">
                              {Array.isArray(item.notes) ? (
                                item.notes.map((noteObj, idx) => (
                                  <li key={idx}>{noteObj.note}</li>
                                ))
                              ) : (
                                <li>Không có ghi chú</li>
                              )}
                            </ul>
                          </td>
                          <td>
                            <a href={item.result_file} target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item
                          key={idx + 1}
                          active={currentPage === idx + 1}
                          onClick={() => handlePageChange(idx + 1)}
                        >
                          {idx + 1}
                        </Pagination.Item>
                      ))}
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

export default PSCoreTable;
