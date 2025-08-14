import React, { useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import TopNavbar from "../../dashboard/DashOrigin/TopNavbarSbc";

const mockData = [
  {
    id: "PKN-001",
    type: "Tạo Kết Nối",
    date: "2025-05-30",
    creator: "Operator A",
    status: "Hoàn Thành",
    log: "✅ Phiếu PKN-001 đã xử lý thành công.",
  },
  {
    id: "PDS-002",
    type: "Khai Báo Đầu Số",
    date: "2025-05-29",
    creator: "Operator B",
    status: "Đang Xử Lý",
    log: "⚙️ Phiếu PDS-002 đang trong quá trình xử lý.",
  },
  {
    id: "PDT-003",
    type: "Khai Báo Định Tuyến",
    date: "2025-05-28",
    creator: "Operator A",
    status: "Thất Bại",
    log: "❌ Phiếu PDT-003 gặp lỗi khi xử lý.",
  },
];

const statusBadge = {
  "Hoàn Thành": "success",
  "Đang Xử Lý": "warning",
  "Thất Bại": "danger",
};

const RequestHistoryTable = () => {
  const [selectedLog, setSelectedLog] = useState("");

  return (
    <>
      <TopNavbar />

      <div className="p-4 bg-light min-vh-100">
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold text-primary mb-2">Lịch Sử Phiếu Yêu Cầu</h5>
            <p>
              Chức năng này sẽ hiển thị lịch sử các phiếu đã được tạo và xử lý
              (dữ liệu mẫu).
            </p>
            <Table bordered hover responsive className="bg-white">
              <thead>
                <tr className="table-light">
                  <th>ID PHIẾU</th>
                  <th>LOẠI PHIẾU</th>
                  <th>NGÀY TẠO</th>
                  <th>NGƯỜI TẠO</th>
                  <th>TRẠNG THÁI</th>
                  <th>CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.type}</td>
                    <td>{row.date}</td>
                    <td>{row.creator}</td>
                    <td>
                      <Badge bg={statusBadge[row.status]}>{row.status}</Badge>
                    </td>
                    <td>
                      <span
                        className="text-primary fw-semibold"
                        role="button"
                        onClick={() => setSelectedLog(row.log)}
                      >
                        Xem
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>
            <h6 className="fw-bold text-primary mb-3">Kết Quả Xử Lý</h6>
            <p className="mb-1 fw-semibold">Log Chi Tiết:</p>
            <div
              className="bg-dark text-white p-3 rounded"
              style={{ fontFamily: "monospace" }}
            >
              {selectedLog || "Chưa có log xử lý nào được chọn."}
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default RequestHistoryTable;
