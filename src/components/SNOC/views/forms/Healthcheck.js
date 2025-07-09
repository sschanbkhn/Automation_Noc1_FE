import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Spinner, Button, InputGroup, FormControl, Table } from 'react-bootstrap';
import Select from 'react-select';

import { fetchPlatforms, fetchDevicesByPlatform } from '../../redux/Healthcheck/platformDeviceSlice';
import { GenericHealthCheckView } from '../../redux/Healthcheck/healthcheckSlice';
import { SERVER_MEDIA } from './../../config/constant';

const Healthcheck = () => {
    const dispatch = useDispatch();
    const { platforms, devices, loadingDevices } = useSelector((state) => state.platformDevice);
    const { healthchecknodes = [], loading = false } = useSelector((state) => state.pscore ?? {});

    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [selectedDevices, setSelectedDevices] = useState([]);

    useEffect(() => {
        dispatch(fetchPlatforms());
    }, [dispatch]);

    useEffect(() => {
        if (selectedPlatform) {
            dispatch(fetchDevicesByPlatform(selectedPlatform));
        }
        setSelectedDevices([]); // reset khi đổi platform
    }, [dispatch, selectedPlatform]);

    const deviceOptions = useMemo(() => {
        return devices.map((d) => ({
            label: `${d.name} (${d.ip || 'no-ip'})`,
            value: d.name
        }));
    }, [devices]);

    const allOption = { label: '-- Chọn tất cả thiết bị --', value: '__all__' };
    const combinedOptions = [allOption, ...deviceOptions];

    const handleDeviceChange = (selected) => {
        if (!selected) return setSelectedDevices([]);
        if (selected.find((opt) => opt.value === '__all__')) {
            setSelectedDevices(deviceOptions); // Chọn tất cả
        } else {
            setSelectedDevices(selected);
        }
    };

    const handleHealthcheck = () => {
        const selectedNames = selectedDevices.map((d) => d.value);
        if (selectedPlatform && selectedNames.length > 0) {
            dispatch(GenericHealthCheckView({ selectedPlatform, selectedDevice: selectedNames }));
        } else {
            console.log('Vui lòng chọn platform và thiết bị.');
        }
    };

    const statusRowClass = {
        OK: '',
        Warning: 'table-warning',
        Error: 'table-danger',
        NOK: 'table-danger',
        Unknown: 'table-secondary'
    };

    return (
        <>
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={3}>
                                    <InputGroup>
                                        <FormControl
                                            as="select"
                                            value={selectedPlatform}
                                            onChange={(e) => setSelectedPlatform(e.target.value)}
                                            className="custom-select"
                                        >
                                            <option value="">-- Chọn platform --</option>
                                            {platforms.map((p, idx) => (
                                                <option key={idx} value={p?.name}>
                                                    {p?.name} ({p?.device_count ?? 0})
                                                </option>
                                            ))}
                                        </FormControl>
                                    </InputGroup>
                                </Col>

                                <Col md={5}>
                                    <Select
                                        isMulti
                                        options={combinedOptions}
                                        value={selectedDevices}
                                        onChange={handleDeviceChange}
                                        isDisabled={!selectedPlatform}
                                        placeholder="-- Chọn thiết bị --"
                                    />
                                </Col>

                                <Col md={2}>
                                    <Button variant="primary" size="lg" className="w-100" onClick={handleHealthcheck}>
                                        Healthcheck ngay
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
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
                                <Table responsive hover bordered className="table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Host</th>
                                            <th>Thời gian</th>
                                            <th>Trạng thái</th>
                                            <th>Ghi chú</th>
                                            <th>File kết quả</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {healthchecknodes.map((item, index) => (
                                            <tr key={item.id || index} className={statusRowClass[item.status] || ''}>
                                                <td>{item.host}</td>
                                                <td>{new Date(item.endtime).toLocaleString()}</td>
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
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default Healthcheck;
