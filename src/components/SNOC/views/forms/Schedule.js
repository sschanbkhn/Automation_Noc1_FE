import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Form, Spinner, Button, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import { fetchPlatforms, fetchDevicesByPlatform } from '../../redux/Healthcheck/platformDeviceSlice';
import { createHealthcheckSchedule } from './../../redux/Healthcheck/healthcheckSlice';

const Schedule = () => {
    const dispatch = useDispatch();
    const { platforms, devices } = useSelector((state) => state.platformDevice);
    const { scheduleCreating } = useSelector((state) => state.pscore);

    const [name, setName] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [cronExpression, setCronExpression] = useState('');
    const [startTime, setStartTime] = useState('');

    useEffect(() => {
        dispatch(fetchPlatforms());
    }, [dispatch]);

    useEffect(() => {
        if (selectedPlatform) {
            dispatch(fetchDevicesByPlatform(selectedPlatform));
        }
        setSelectedDevices([]);
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
            setSelectedDevices(deviceOptions);
        } else {
            setSelectedDevices(selected);
        }
    };

    const validateCron = (expression) => {
        const parts = expression.trim().split(/\s+/);
        return parts.length === 5;
    };

    const handleSubmitSchedule = () => {
        const selectedNames = selectedDevices.map((d) => d.value);

        if (!name || !selectedPlatform || selectedNames.length === 0 || !cronExpression || !startTime) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (!validateCron(cronExpression)) {
            alert('Biểu thức cron không hợp lệ. Định dạng đúng: */5 * * * *');
            return;
        }

        dispatch(
            createHealthcheckSchedule({
                name,
                selectedPlatform,
                selectedDevices: selectedNames,
                cron: cronExpression,
                startTime
            })
        );
    };

    return (
        <Row>
            <Col sm={12}>
                <Card>
                    <Card.Body>
                        <Row className="align-items-center mb-3">
                            <Col md={3}>
                                <FormControl
                                    placeholder="Tên lịch (vd: Check PGW sáng)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Col>

                            <Col md={3}>
                                <FormControl type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                            </Col>

                            <Col md={3}>
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
                            </Col>

                            <Col md={3}>
                                <Select
                                    isMulti
                                    options={combinedOptions}
                                    value={selectedDevices}
                                    onChange={handleDeviceChange}
                                    isDisabled={!selectedPlatform}
                                    placeholder="-- Chọn thiết bị --"
                                />
                            </Col>
                        </Row>

                        <Row className="align-items-center">
                            <Col md={6}>
                                <FormControl
                                    placeholder="cron (vd: */5 * * * *)"
                                    value={cronExpression}
                                    onChange={(e) => setCronExpression(e.target.value)}
                                />
                            </Col>

                            <Col md={2}>
                                <Button variant="primary" onClick={handleSubmitSchedule} disabled={scheduleCreating}>
                                    {scheduleCreating ? 'Đang đặt...' : 'Đặt lịch'}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default Schedule;
