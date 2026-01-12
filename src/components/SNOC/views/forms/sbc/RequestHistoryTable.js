// src/components/SNOC/views/forms/sbc/RequestHistoryTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequestHistory } from "../../../redux/Sbc/sbcConnectionSlice";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc";

// Map action -> loại phiếu hiển thị
const actionLabelMap = {
  CONNECTION_CREATE: "Tạo Kết Nối",
  CONNECTION_UPDATE: "Cập Nhật Kết Nối",
  CONNECTION_DELETE: "Xóa Kết Nối",
  PREFIX_CREATE: "Khai Báo Đầu Số",
  PREFIX_UPDATE: "Cập Nhật Đầu Số",
  PREFIX_DELETE: "Xóa Đầu Số",
  ROUTING_CREATE: "Khai Báo Định Tuyến",
  ROUTING_UPDATE: "Cập Nhật Định Tuyến",
  ROUTING_DELETE: "Xóa Định Tuyến",
};

// Map status -> màu badge
const statusVariant = {
  SUCCESS: "success",
  FAILED: "danger",
  INFO: "secondary",
};

const RequestHistoryTable = () => {
  const dispatch = useDispatch();
  const { requestHistory = [], loadingRequestHistory = false } = useSelector(
    (state) => state.sbcConnection || {}
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterAction, setFilterAction] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchRequestHistory());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let data = [...requestHistory];

    if (filterAction) {
      data = data.filter((h) => h.action === filterAction);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((h) =>
        [h.user, h.action, h.target_type, h.description, h.target_id]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Sort mới nhất lên trước
    data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return data;
  }, [requestHistory, filterAction, search]);

  const formatStatus = (entry) => {
    const resp = entry.response_payload || {};
    let status = "SUCCESS";

    if (resp.error || (typeof resp.status === "number" && resp.status >= 400)) {
      status = "FAILED";
    }

    const text =
      status === "SUCCESS"
        ? "Hoàn Thành"
        : status === "FAILED"
        ? "Thất Bại"
        : "Thông Tin";

    return { status, text };
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      // fallback: hiển thị raw
      return String(value);
    }
    return d.toLocaleString();
  };

  return (
    <>
      <TopNavbar />
      <Container fluid className="px-4 py-4 bg-light min-vh-100">
        <Card className="shadow-lg border-0 mb-4">
          <Card.Header className="bg-gradient bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Lịch Sử Phiếu / Hành Động SBC</h4>
            <div className="d-flex gap-3 align-items-center">
              <Form.Control
                type="search"
                placeholder="Tìm kiếm theo user, mô tả, target..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 320 }}
              />
              <Form.Select
                size="sm"
                style={{ maxWidth: 220 }}
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="">Tất cả loại hành động</option>
                {Object.entries(actionLabelMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Form.Select>
              <Badge bg="light" text="dark" className="fs-6">
                Tổng: <strong>{filteredData.length}</strong> bản ghi
              </Badge>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            {loadingRequestHistory ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3 text-muted">Đang tải lịch sử...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>Chưa có lịch sử nào được ghi nhận</h5>
              </div>
            ) : (
              <Table
                hover
                responsive
                bordered
                className="mb-0 table-sm align-middle"
              >
                <thead className="table-dark text-white text-center">
                  <tr>
                    <th>Thời gian</th>
                    <th>User</th>
                    <th>Loại Phiếu / Hành Động</th>
                    <th>Đối tượng</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((h) => {
                    const { status, text } = formatStatus(h);
                    const variant = statusVariant[status] || "secondary";
                    const typeLabel =
                      actionLabelMap[h.action] || h.action || "—";
                    const targetLabel = h.target_type
                      ? `${h.target_type} #${h.target_id ?? ""}`
                      : "—";

                    return (
                      <tr key={h.id}>
                        <td className="text-nowrap">
                          {formatDateTime(h.created_at)}
                        </td>
                        <td>{h.user || "—"}</td>
                        <td>
                          <span className="fw-semibold">{typeLabel}</span>
                        </td>
                        <td>{targetLabel}</td>
                        <td className="text-center">
                          <Badge bg={variant}>{text}</Badge>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 280 }}>
                          <span title={h.description || ""}>
                            {h.description || "—"}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className="text-primary fw-semibold"
                            role="button"
                            onClick={() => setSelectedItem(h)}
                          >
                            Xem
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Panel log chi tiết bên dưới */}
        <Card className="shadow border-0">
          <Card.Header className="fw-bold text-primary">
            Chi Tiết Log / Request - Response
          </Card.Header>
          <Card.Body>
            {selectedItem ? (
              <>
                <Row className="mb-3">
                  <Col md={4}>
                    <div className="mb-1">
                      <strong>Thời gian:</strong>{" "}
                      {formatDateTime(selectedItem.created_at)}
                    </div>
                    <div className="mb-1">
                      <strong>User:</strong> {selectedItem.user || "—"}
                    </div>
                    <div className="mb-1">
                      <strong>Hành động:</strong>{" "}
                      {actionLabelMap[selectedItem.action] ||
                        selectedItem.action ||
                        "—"}
                    </div>
                    <div className="mb-1">
                      <strong>Target:</strong>{" "}
                      {selectedItem.target_type
                        ? `${selectedItem.target_type} #${
                            selectedItem.target_id ?? ""
                          }`
                        : "—"}
                    </div>
                  </Col>
                  <Col md={8}>
                    <div className="mb-1">
                      <strong>Mô tả:</strong>
                    </div>
                    <div className="bg-light p-2 rounded border">
                      {selectedItem.description || "—"}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <p className="mb-1 fw-semibold">Request Payload:</p>
                    <div
                      className="bg-dark text-white p-3 rounded"
                      style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                    >
                      {selectedItem.request_payload ? (
                        <pre className="mb-0">
                          {JSON.stringify(
                            selectedItem.request_payload,
                            null,
                            2
                          )}
                        </pre>
                      ) : (
                        "Không có request_payload."
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1 fw-semibold">Response Payload:</p>
                    <div
                      className="bg-dark text-white p-3 rounded"
                      style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                    >
                      {selectedItem.response_payload ? (
                        <pre className="mb-0">
                          {JSON.stringify(
                            selectedItem.response_payload,
                            null,
                            2
                          )}
                        </pre>
                      ) : (
                        "Không có response_payload."
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              <div
                className="bg-dark text-white p-3 rounded"
                style={{ fontFamily: "monospace" }}
              >
                Chưa chọn bản ghi nào. Hãy bấm “Xem” ở bảng phía trên để xem chi
                tiết log.
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default RequestHistoryTable;
