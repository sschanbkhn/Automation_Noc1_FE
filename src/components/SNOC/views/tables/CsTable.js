// src/pages/CSCoreTable.js
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Table, Spinner, Form, Button, Pagination } from 'react-bootstrap';
import { fetchLatestHealthcheckView } from '../../redux/Healthcheck/healthcheckSlice';
import { SERVER_MEDIA } from './../../config/constant';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const statusRowClass = {
    OK: '',
    Warning: 'table-warning',
    Error: 'table-danger',
    NOK: 'table-danger',
    Unknown: 'table-secondary'
};

const CsTable = () => {
    const dispatch = useDispatch();
    const { lastestitems = [], loading = false, count = 0 } = useSelector((state) => state.pscore || {});
    const [host, setHost] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const searchHostRef = useRef('');
    const pageSize = 10;

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedHost = host.trim();
        searchHostRef.current = trimmedHost;
        setCurrentPage(1);
        dispatch(fetchLatestHealthcheckView({ host: trimmedHost, page: 1 }));
    };

    useEffect(() => {
        dispatch(fetchLatestHealthcheckView({ host: searchHostRef.current, page: currentPage, platform: ['cs'] }));
    }, [dispatch, currentPage]);

    const totalPages = Math.ceil(count / pageSize);

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort />;
        return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const sortedItems = [...lastestitems].sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const toFriendlyName = (key) => {
        switch (key) {
            case 'host':
                return 'Host';
            case 'created_at':
                return 'Thời gian';
            case 'status':
                return 'Trạng thái';
            case 'notes':
                return 'Ghi chú';
            case 'result_file':
                return 'File kết quả';
            default:
                return key;
        }
    };

    const formatDate = (value) => new Date(value).toLocaleString();

    const renderCell = (value, key) => {
        if (Array.isArray(value)) {
            return value.map((v) => v.note).join('; ');
        }
        return value;
    };

    const excludedFields = ['id'];

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
                        <Button variant="primary" type="submit">
                            Tìm kiếm
                        </Button>
                        <ExcelFile
                            element={
                                <Button variant="success" className="ms-2">
                                    Export Excel
                                </Button>
                            }
                            filename="cs_healthcheck"
                        >
                            <ExcelSheet data={sortedItems} name="Healthcheck">
                                {sortedItems.length > 0 &&
                                    Object.keys(sortedItems[0])
                                        .filter((key) => !excludedFields.includes(key))
                                        .map((key) => (
                                            <ExcelColumn
                                                key={key}
                                                label={toFriendlyName(key)}
                                                value={(row) => {
                                                    const cellValue = row[key];
                                                    return typeof cellValue === 'boolean'
                                                        ? cellValue
                                                            ? 'Yes'
                                                            : 'No'
                                                        : key.includes('date') || key.includes('time')
                                                        ? formatDate(cellValue)
                                                        : renderCell(cellValue, key);
                                                }}
                                            />
                                        ))}
                            </ExcelSheet>
                        </ExcelFile>
                    </Form>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">CS Core - Danh sách bản ghi healthcheck</Card.Title>
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
                                                <th onClick={() => handleSort('index')} style={{ cursor: 'pointer' }}>
                                                    STT
                                                </th>
                                                <th onClick={() => handleSort('host')} style={{ cursor: 'pointer' }}>
                                                    Host {getIcon('host')}
                                                </th>
                                                <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                                                    Thời gian {getIcon('created_at')}
                                                </th>
                                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                                    Trạng thái {getIcon('status')}
                                                </th>
                                                <th>Ghi chú</th>
                                                <th>File kết quả</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedItems.map((item, index) => (
                                                <tr key={item.id || index} className={statusRowClass[item.status] || ''}>
                                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                                    <td>{item.host}</td>
                                                    <td>{new Date(item.created_at).toLocaleString()}</td>
                                                    <td>{item.status}</td>
                                                    <td>
                                                        <ul className="mb-0 ps-3">
                                                            {Array.isArray(item.notes) ? (
                                                                item.notes.map((noteObj, idx) => <li key={idx}>{noteObj.note}</li>)
                                                            ) : (
                                                                <li>Không có ghi chú</li>
                                                            )}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        {item.result_file ? (
                                                            <a
                                                                href={`${SERVER_MEDIA}/download${item.result_file}`}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Download result for {item.host}
                                                            </a>
                                                        ) : (
                                                            'Không có file'
                                                        )}
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

export default CsTable;
