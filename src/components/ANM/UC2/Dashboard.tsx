import React, { useEffect, useState, useMemo } from "react";
import Card from "components/common/Card";
import MyPieChart from './MyPieChart';
import { Row, Col, Table, Modal, Button, Form } from "react-bootstrap";

// Props for tab navigation + filters
interface Filters {
    province?: string;
    vendor?: string;
}

interface UC2Props {
    goToTab?: (tabKey: string) => void;
    filters?: Filters;
}

// Province mapping
const provinceCodeMap: Record<string, string> = {
    BGG: 'Viễn thông Bắc Giang',
    BKN: 'Viễn thông Bắc Kạn',
    BNH: 'Viễn thông Bắc Ninh',
    CBG: 'Viễn thông Cao Bằng',
    DBN: 'Viễn thông Điện Biên',
    HBH: 'Viễn thông Hòa Bình',
    HDG: 'Viễn thông Hải Dương',
    HGG: 'Viễn thông Hà Giang',
    HNI: 'Viễn thông Hà Nội',
    HNM: 'Viễn thông Hà Nam',
    HPG: 'Viễn thông Hải Phòng',
    HTH: 'Viễn thông Hà Tĩnh',
    HYN: 'Viễn thông Hưng Yên',
    LCI: 'Viễn thông Lào Cai',
    LCU: 'Viễn thông Lai Châu',
    LSN: 'Viễn thông Lạng Sơn',
    NAN: 'Viễn thông Nghệ An',
    NBH: 'Viễn thông Ninh Bình',
    NDH: 'Viễn thông Nam Định',
    PTO: 'Viễn thông Phú Thọ',
    QNH: 'Viễn thông Quảng Ninh',
    SLA: 'Viễn thông Sơn La',
    TBH: 'Viễn thông Thái Bình',
    THA: 'Viễn thông Thanh Hóa',
    TNN: 'Viễn thông Thái Nguyên',
    TQG: 'Viễn thông Tuyên Quang',
    VPC: 'Viễn thông Vĩnh Phúc',
    YBI: 'Viễn thông Yên Bái',
    AGG: 'Viễn thông An Giang',
    BDG: 'Viễn thông Bình Dương',
    BLU: 'Viễn thông Bạc Liêu',
    BPC: 'Viễn thông Bình Phước',
    BTE: 'Viễn thông Bến Tre',
    BTN: 'Viễn thông Bình Thuận',
    CMU: 'Viễn thông Cà Mau',
    CTO: 'Viễn thông Cần Thơ',
    DNI: 'Viễn thông Đồng Nai',
    DTP: 'Viễn thông Đồng Tháp',
    HCM: 'Viễn thông Hồ Chí Minh',
    HGI: 'Viễn thông Hậu Giang',
    KGG: 'Viễn thông Kiên Giang',
    LAN: 'Viễn thông Long An',
    LDG: 'Viễn thông Lâm Đồng',
    NTN: 'Viễn thông Ninh Thuận',
    STG: 'Viễn thông Sóc Trăng',
    TGG: 'Viễn thông Tiền Giang',
    TNH: 'Viễn thông Tây Ninh',
    TVH: 'Viễn thông Trà Vinh',
    VLG: 'Viễn thông Vĩnh Long',
    VTU: 'Viễn thông Vũng Tàu',
    BDH: 'Viễn thông Bình Định',
    DLK: 'Viễn thông Đắk Lắk',
    DNG: 'Viễn thông Đà Nẵng',
    DNO: 'Viễn thông Đắk Nông',
    GLI: 'Viễn thông Gia Lai',
    HUE: 'Viễn thông Thừa Thiên Huế',
    KHA: 'Viễn thông Khánh Hòa',
    KTM: 'Viễn thông Kon Tum',
    PYN: 'Viễn thông Phú Yên',
    QBH: 'Viễn thông Quảng Bình',
    QNI: 'Viễn thông Quảng Ngãi',
    QNM: 'Viễn thông Quảng Nam',
    QTI: 'Viễn thông Quảng Trị'
};



const Anm_uc2: React.FC<UC2Props> = ({ goToTab, filters }) => {
    const [devices, setDevices] = useState<any[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
    const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [provinceFilter, setProvinceFilter] = useState<string | undefined>(filters?.province);
    const [vendorFilter, setVendorFilter] = useState<string | undefined>(filters?.vendor);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "http://10.147.50.118:5678/webhook/7bd100c2-3a64-4242-928a-b5ecda899f60"
                );
                const json = await response.json();
                const array: any[] = Array.isArray(json) ? json : [];

                const enriched = array.map((device) => {
                    let provinceName = device.province;
                    if (!provinceName || provinceName.toLowerCase() === "không rõ") {
                        const hostname = device.test_result?.tc_hostname || "";
                        const match = hostname.trim().match(/([A-Z]{3})\./);
                        const code = match ? match[1] : "";
                        provinceName = provinceCodeMap[code] || "Không rõ";
                    }
                    return { ...device, province: provinceName };
                });

                setDevices(enriched);
            } catch (err) {
                console.error("Failed to fetch data from API:", err);
                setDevices([]);
            }
        };
        fetchData();
    }, []);

    const vendorsForProvince = useMemo(() => {
        const filtered = provinceFilter
            ? devices.filter((d) => d.province === provinceFilter)
            : devices;
        return Array.from(new Set(filtered.map((d) => d.vendor || "N/A")));
    }, [provinceFilter, devices]);

    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            const matchProvince = !provinceFilter || device.province === provinceFilter;
            const matchVendor = !vendorFilter || device.vendor === vendorFilter;
            const hasFail = Object.values(device.test_result || {}).some((v: any) => v === "Fail");
            return matchProvince && matchVendor && hasFail;
        });
    }, [provinceFilter, vendorFilter, devices]);

    const totalDevices = devices.filter(d => !provinceFilter || d.province === provinceFilter).length;
    const totalFails = filteredDevices.length;

    const toggleDetail = (deviceId: string, criteria: string) => {
        const key = `${deviceId}_${criteria}`;
        setExpandedCriteria((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSend = () => {
        setSending(true);
        setShowSuccess(false);
        setTimeout(() => {
            setSending(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 2000);
    };

    const availableProvinces = useMemo(() => {
        return Array.from(
            new Set(
                devices.map((device) => {
                    let provinceName = device.province;
                    if (!provinceName || provinceName.toLowerCase() === "không rõ") {
                        const hostname = device.test_result?.tc_hostname || '';
                        const match = hostname.trim().match(/([A-Z]{3})\./);
                        const code = match ? match[1] : '';
                        provinceName = provinceCodeMap[code] || "Không rõ";
                    }
                    return provinceName;
                }).filter((p) => p && p !== "Không rõ")
            )
        );
    }, [devices]);

    const requiredConfig: Record<string, any> = {
        tc_telnet_status: "Tắt tính năng truy cập vào thiết bị qua giao thức Telnet.",
        tc_ssh_sec:
            "Giới hạn số lượng phiên kết nối SSH đồng thời (khuyến nghị dưới 10).",
        tc_ssh_version: "Chỉ sử dụng giao thức SSHv2 trở lên.",
        tc_ssh_root: "Vô hiệu hoá truy cập từ xa thông qua tài khoản root.",
        tc_remote_access:
            "Giới hạn các địa chỉ truy cập từ xa, chỉ cho phép truy cập từ phân vùng quản trị.",
        tc_ssh_timeout:
            "Kích hoạt tính năng thời gian chờ (timeout) tự đăng xuất phiên quản trị sau khoảng thời gian chờ không nhận được hành động cấu hình",
        tc_snmp_version: "Sử dụng giao thức quản lý mạng SNMP version 2c, 3.",
        tc_snmp_access:
            "Giới hạn danh sách địa chỉ được phép truy vấn SNMP, chỉ cho phép truy vấn từ phân vùng quản trị, giám sát.",
        tc_snmp_community:
            "Không khai báo các community read-write, chỉ sử dụng quyền read-only.",
        tc_ntp_sec: "Sử dụng giao thức đồng bộ thời gian NTP version 4 trở lên",
    };

    const criteriaMap: Record<string, string> = {
        tc_hostname: "Kiểm tra hostname",
        tc_patch_info: "Kiểm tra bản vá",
        tc_telnet_status: "Trạng thái Telnet",
        tc_ssh_sec: "SSH bảo mật",
        tc_ssh_version: "Phiên bản SSH",
        tc_ssh_root: "Truy cập root SSH",
        tc_remote_access: "Truy cập từ xa",
        tc_ssh_timeout: "SSH timeout",
        tc_snmp_version: "Phiên bản SNMP",
        tc_snmp_access: "Quyền SNMP",
        tc_snmp_community: "Cộng đồng SNMP",
        tc_ntp_sec: "Bảo mật NTP",
    };

    const criteriaFieldMap: Record<string, string[]> = {
        tc_telnet_status: ["telnet_status"],
        tc_ssh_sec: ["ssh_sec"],
        tc_ssh_version: ["ssh_version"],
        tc_ssh_root: ["ssh_root"],
        tc_remote_access: ["remote_access"],
        tc_ssh_timeout: ["ssh_timeout"],
        tc_snmp_version: ["snmp_version"],
        tc_snmp_access: ["snmp_access"],
        tc_snmp_community: ["snmp_community"],
        tc_ntp_sec: ["ntp_sec"],
    };

    const getDeviceStatusChart = () => {
        let pass = 0,
            fail = 0;
        filteredDevices.forEach((device) => {
            const results = Object.entries(device.test_result || {})
                .filter(([k, v]) => k !== 'tc_hostname' && v !== 'n/a')
                .map(([, v]) => v);
            if (results.length && results.some((r) => r === 'Fail')) fail++;
            else pass++;
        });
        return [
            { label: 'Pass', value: pass, color: '#4CAF50' },
            { label: 'Fail', value: fail, color: '#F44336' }
        ];
    };

    const getCriteriaFailChart = () => {
        const failCounts: Record<string, number> = {};
        filteredDevices.forEach((device) => {
            Object.entries(device.test_result || {}).forEach(([k, v]) => {
                if (v === 'Fail') {
                    failCounts[k] = (failCounts[k] || 0) + 1;
                }
            });
        });
        const palette = [
            '#F44336', '#FF9800', '#FFEB3B', '#4FC3F7', '#2196F3',
            '#9C27B0', '#795548', '#00BCD4', '#8BC34A', '#CDDC39',
            '#E91E63', '#607D8B'
        ];
        return Object.entries(failCounts).map(([k, v], i) => ({
            label: criteriaMap[k] || k,
            value: v,
            color: palette[i % palette.length]
        }));
    };

    return (
        <div className="container">
            <Row className="mb-4">
                <Col>
                    <Card className="p-3 text-center bg-light">
                        <div className="fs-4 fw-bold text-primary">
                            Dashboard quản trị tuân thủ cấu hình an toàn bảo mật
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Filter Row */}
            <Row className="mb-3 g-2">
                <Col md={6}>
                    <Form.Select
                        value={provinceFilter}
                        onChange={(e) => {
                            setProvinceFilter(e.target.value || undefined);
                            setVendorFilter(undefined);
                        }}
                    >
                        <option value="">-- Tất cả tỉnh --</option>
                        {availableProvinces.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                <Col md={6}>
                    <Form.Select
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value || undefined)}
                    >
                        <option value="">-- Tất cả nhà cung cấp --</option>
                        {vendorsForProvince.map((vendor) => (
                            <option key={vendor} value={vendor}>{vendor}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
            <Row className="mb-3 g-2">
                
                    <div className="row">
                        <div className="col-md-6">
                            <MyPieChart
                                title="1️⃣ Tổng kết thiết bị (Đạt/ không đạt)"
                                data={getDeviceStatusChart()}
                
                            />
                        </div>
                        <div className="col-md-6">
                            <MyPieChart
                                title="2️⃣ Tổng kết tiêu chí không đạt"
                                data={getCriteriaFailChart()}
                            />
                        </div>
                    </div>
           
            </Row>
            {/* Totals */}
            <Row className="mb-3 text-center">
                <Col>
                    <Card className="p-3">
                        <div className="fs-5 fw-bold">Tổng số thiết bị</div>
                        <div className="fs-4 text-primary">{totalDevices}</div>
                    </Card>
                </Col>
                <Col>
                    <Card className="p-3">
                        <div className="fs-5 fw-bold">Tổng số thiết bị vi phạm tuân thủ</div>
                        <div className="fs-4 text-danger">{totalFails}</div>
                    </Card>
                </Col>
            </Row>

            {/* Devices Table */}
            <Table bordered hover responsive>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Hostname</th>
                        <th>IP</th>
                        <th>Loại thiết bị</th>
                        <th>Kết quả</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDevices.length > 0 ? (
                        filteredDevices.map((device, index) => (
                            <tr key={device.device}>
                                <td>{index + 1}</td>
                                <td>{device.device || "N/A"}</td>
                                <td>N/A</td>
                                <td>{device.vendor || "N/A"}</td>
                                <td className="text-danger">
                                    <Button variant="danger" size="sm" onClick={() => setSelectedDevice(device)}>
                                        Fail
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center text-muted">
                                Không có dữ liệu để hiển thị
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal */}
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
                            const isHostname = key === "tc_hostname";
                            const isFail = !isHostname && value === "Fail";
                            const deviceId = selectedDevice.device;
                            const isExpanded = expandedCriteria[`${deviceId}_${key}`];

                            return (
                                <div
                                    key={key}
                                    className="p-2 mb-2"
                                    style={{
                                        backgroundColor: isFail ? "#fdecea" : "#e9f7ef",
                                        borderRadius: "4px",
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
                                                        {selectedDevice[field] || "N/A"}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-2">
                                                <strong>Cấu hình yêu cầu:</strong>
                                                <br />
                                                {criteriaFieldMap[key]?.map((field) => (
                                                    <div key={field}>{requiredConfig[key] || "N/A"}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    <div className="text-center">
                        <button
                            className="btn btn-primary mt-3"
                            onClick={handleSend}
                            disabled={sending}
                        >
                            {sending && (
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            )}
                            Gửi phiếu xử lý tuân thủ
                        </button>
                        {showSuccess && (
                            <div
                                className="mt-3 alert alert-success py-2 px-3 mb-0"
                                role="alert"
                            >
                                Gửi thành công!
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Anm_uc2;
