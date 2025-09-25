import React, { useEffect, useMemo, useState } from "react";
import Card from "components/common/Card";
import { Row, Col, Table, Modal, Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

type TestResult = {
  test_id: string;
  test_name: string;
  solution: string;
  device_type: string;   // vendor
  hostname: string;
  failed: string;        // "true" | "false"
  result: string;
  filename: string;
  version: string;
  department: string;
  status: string;
  total_failed: string;
};

type ApiResponse = { data: TestResult[] } | TestResult[];

const API_URL =
  "http://10.155.43.198:5678/webhook/0ccdc9e0-f2fb-448f-9661-9fd3ef11c049?datamode=test_results";

const isTrue = (v?: string) => v?.toLowerCase() === "true";
const lines = (s?: string) => (s ? s.split(/\r?\n/) : []);

interface Filters {
  vendor?: string;
  department?: string;
}

interface UC2Props {
  goToTab?: (tabKey: string) => void;
  filters?: Filters;
  setFilters?: (filters: Filters) => void;
}

export default function Dashboard({ goToTab, filters, setFilters }: UC2Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [data, setData] = useState<TestResult[]>([]);
  const [selectedHost, setSelectedHost] = useState<TestResult[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Initialize from filters prop, URL params, or empty
  const [filterVendor, setFilterVendor] = useState(
    filters?.vendor || queryParams.get("vendor") || ""
  );
  const [filterDepartment, setFilterDepartment] = useState(
    filters?.department || queryParams.get("department") || ""
  );

  // sync incoming filters
  useEffect(() => {
    if (filters) {
      if (filters.vendor !== undefined) setFilterVendor(filters.vendor);
      if (filters.department !== undefined) setFilterDepartment(filters.department);
    }
  }, [filters]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(API_URL);
      const json: ApiResponse = await res.json();
      setData(Array.isArray(json) ? json : json.data);
    };
    fetchData();
  }, []);

  // update URL & parent filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterVendor) params.set("vendor", filterVendor);
    if (filterDepartment) params.set("department", filterDepartment);
    navigate({ search: params.toString() }, { replace: true });

    if (setFilters) {
      setFilters({ vendor: filterVendor, department: filterDepartment });
    }
  }, [filterVendor, filterDepartment, navigate, setFilters]);

  // vendor options depend on department
  const vendorOptions = useMemo(() => {
    const filtered = filterDepartment
      ? data.filter((d) => d.department === filterDepartment)
      : data;
    return Array.from(new Set(filtered.map((d) => d.device_type))).sort();
  }, [data, filterDepartment]);

  // filter data by vendor + department
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (filterVendor && d.device_type !== filterVendor) return false;
      if (filterDepartment && d.department !== filterDepartment) return false;
      return true;
    });
  }, [data, filterVendor, filterDepartment]);

  // group tests by hostname
  const groupedByHost = useMemo(() => {
    const map = new Map<string, TestResult[]>();
    filteredData.forEach((item) => {
      if (!map.has(item.hostname)) map.set(item.hostname, []);
      map.get(item.hostname)!.push(item);
    });
    return Array.from(map.entries());
  }, [filteredData]);

  const toggleDetail = (hostname: string, testId: string) => {
    const key = `${hostname}_${testId}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
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

      {/* Filters */}
      <Row className="mb-3">
        <Col>
          <Form.Select
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value);
              setFilterVendor("");
            }}
          >
            <option value="">Tất cả phòng ban</option>
            {Array.from(new Set(data.map((d) => d.department))).map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col>
          <Form.Select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            disabled={!filterDepartment}
          >
            <option value="">Tất cả vendor</option>
            {vendorOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Main Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Hostname</th>
            <th>IP</th>
            <th>Vendor</th>
            <th>Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {groupedByHost.length > 0 ? (
            groupedByHost.map(([host, tests], index) => {
              const hasFail = tests.some((t) => isTrue(t.failed));
              if (!hasFail) return null;

              return (
                <tr key={host}>
                  <td>{index + 1}</td>
                  <td>{host}</td>
                  <td>N/A</td>
                  <td>{tests[0].device_type}</td>
                  <td className="text-danger">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedHost(tests);
                        setShowModal(true);
                      }}
                    >
                      Fail
                    </Button>
                  </td>
                </tr>
              );
            })
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thiết bị</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHost.map((t) => {
            const isFail = isTrue(t.failed);
            const key = `${t.hostname}_${t.test_id}`;
            const isExpanded = expanded[key];
            return (
              <div
                key={t.test_id}
                className="p-2 mb-2"
                style={{
                  backgroundColor: isFail ? "#fdecea" : "#e9f7ef",
                  borderRadius: 6,
                }}
              >
                <strong>{t.test_name}:</strong> {isFail ? "Fail" : "Pass"}
                {isFail && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="ms-2"
                    onClick={() => toggleDetail(t.hostname, t.test_id)}
                  >
                    Chi tiết
                  </Button>
                )}

                {isFail && isExpanded && (
                  <div className="mt-2 ps-3">
                    <div className="mb-2">
                      <strong>Cấu hình hiện tại:</strong>
                      <pre className="bg-light p-2 rounded mb-0">{lines(t.result).join("\n")}</pre>
                    </div>
                    <div>
                      <strong>Cấu hình yêu cầu:</strong>
                      <pre className="bg-light p-2 rounded mb-0">{lines(t.solution).join("\n")}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-center">
            <Button variant="primary" className="mt-3">
              Gửi phiếu xử lý tuân thủ
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
