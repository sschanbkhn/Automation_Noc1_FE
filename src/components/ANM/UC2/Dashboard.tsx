import React, { useEffect, useState } from "react";
import Card from "components/common/Card";
import { Row, Col, Table, Modal, Button } from "react-bootstrap";

// Props for tab navigation + filters
interface Filters {
  province?: string;
  olt?: string;
  vendor?: string;
}


interface UC2Props {
  goToTab?: (tabKey: string) => void;
  filters?: Filters;
}

const Anm_uc2: React.FC<UC2Props> = ({ goToTab, filters }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://10.147.50.118:5678/webhook/7bd100c2-3a64-4242-928a-b5ecda899f60"
        );
        const json = await response.json();
        const array: any[] = Array.isArray(json) ? json : [];
        setDevices(array);
      } catch (err) {
        console.error("Failed to fetch data from API:", err);
        setDevices([]);
      }
    };
    fetchData();
  }, []);

  // Apply filters from props (instead of URL query params)
  // Apply filters from props
  const filteredDevices = devices.filter((device) => {
    const matchProvince = !filters?.province || (device.province || '').toLowerCase() === filters.province?.toLowerCase();
    const matchOlt = !filters?.olt || (device.olt || device.test_result?.device_type || '').toLowerCase() === filters.olt?.toLowerCase();
    const matchVendor = !filters?.vendor || (device.vendor || device.test_result?.vendor || '').toLowerCase() === filters.vendor?.toLowerCase();
    return matchProvince && matchOlt && matchVendor;
  }).filter((device) => {
    // Optional: only show devices with Fail
    const results = Object.values(device.test_result || {});
    return results.some((v: any) => v === 'Fail');
  });

  const requiredConfig: Record<string, any> = {
    tc_telnet_status: 'Tắt tính năng truy cập vào thiết bị qua giao thức Telnet.',
    tc_ssh_sec: 'Giới hạn số lượng phiên kết nối SSH đồng thời (khuyến nghị dưới 10).',
    tc_ssh_version: 'Chỉ sử dụng giao thức SSHv2 trở lên.',
    tc_ssh_root: 'Vô hiệu hoá truy cập từ xa thông qua tài khoản root.',
    tc_remote_access: 'Giới hạn các địa chỉ truy cập từ xa, chỉ cho phép truy cập từ phân vùng quản trị.',
    tc_ssh_timeout: 'Kích hoạt tính năng thời gian chờ (timeout) tự đăng xuất phiên quản trị sau khoảng thời gian chờ không nhận được hành động cấu hình',
    tc_snmp_version: 'Sử dụng giao thức quản lý mạng SNMP version 2c, 3.',
    tc_snmp_access: 'Giới hạn danh sách địa chỉ được phép truy vấn SNMP, chỉ cho phép truy vấn từ phân vùng quản trị, giám sát.',
    tc_snmp_community: 'Không khai báo các community read-write, chỉ sử dụng quyền read-only.',
    tc_ntp_sec: 'Sử dụng giao thức đồng bộ thời gian NTP version 4 trở lên',
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

  const handleSend = () => {
    setSending(true);
    setShowSuccess(false);
    setTimeout(() => {
      setSending(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const toggleDetail = (deviceId: string, criteria: string) => {
    const key = `${deviceId}_${criteria}`;
    setExpandedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
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
            filteredDevices.map((device, index) => {
              const results = Object.entries(device.test_result || {});
              const hasFail = results.some(
                ([key, value]) => key !== "tc_hostname" && value === "Fail"
              );
              if (!hasFail) return null;

              return (
                <tr key={device.device}>
                  <td>{index + 1}</td>
                  <td>{device.device || "N/A"}</td>
                  <td>N/A</td>
                  <td>{device.vendor || "N/A"}</td>
                  <td className="text-danger">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setSelectedDevice(device)}
                    >
                      Fail
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                Không có dữ liệu để hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
                  // <div key={field}>{field}: {selectedDevice.test_result_details?.[1][key] || 'N/A'}</div>
                  // <div key={field}>{selectedDevice.test_result_details?.[1][key] || 'N/A'}</div>
                  <div key={field}>
                    {requiredConfig[key] || 'N/A'}
                  </div>
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
