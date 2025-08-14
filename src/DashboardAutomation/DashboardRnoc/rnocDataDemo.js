import React from 'react';
import { Link } from 'react-router-dom';

export const rnocSummary = {
  date: "2024-06-12",
  rooms: [
    {
      room: "Tổ 1",
      total: 12,
      success: 10,
      failed: 1,
      running: 1
    },
    {
      room: "Tổ 2",
      total: 15,
      success: 13,
      failed: 2,
      running: 0
    }
  ],
  usecaseTypes: [
    { type: "Backup DB", total: 10, success: 9, failed: 1 },
    { type: "Sync Data", total: 8, success: 7, failed: 1 },
    { type: "Update Firmware", total: 9, success: 8, failed: 1 }
  ]
};

export const rnocRoomDetail = {
  room: "Tổ 1",
  date: "2024-06-12",
  usecases: [
    {
      name: "Backup DB",
      status: "success",
      start: "2024-06-12T08:00:00",
      end: "2024-06-12T08:10:00",
      duration: 600,
      error: ""
    },
    {
      name: "Sync Data",
      status: "failed",
      start: "2024-06-12T09:00:00",
      end: "2024-06-12T09:05:00",
      duration: 300,
      error: "Timeout"
    },
    {
      name: "Update Firmware",
      status: "running",
      start: "2024-06-12T10:00:00",
      end: "",
      duration: 0,
      error: ""
    }
  ]
};

export default function DashboardRnocSummary() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#1890ff' }}>Tổng hợp tiến trình RNOC ngày {rnocSummary.date}</h2>
      <h3>Tiến trình theo phòng</h3>
      <table border="1" cellPadding={8} style={{ background: '#fff', borderRadius: 8, marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Phòng</th>
            <th>Tổng</th>
            <th>Thành công</th>
            <th>Thất bại</th>
            <th>Đang chạy</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {rnocSummary.rooms.map(r => (
            <tr key={r.room}>
              <td>{r.room}</td>
              <td>{r.total}</td>
              <td style={{ color: '#52c41a' }}>{r.success}</td>
              <td style={{ color: '#ff4d4f' }}>{r.failed}</td>
              <td style={{ color: '#faad14' }}>{r.running}</td>
              <td>
                <Link to={`/dashboard/rnoc/room/${encodeURIComponent(r.room)}`} style={{ color: '#1890ff' }}>
                  Xem chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Tiến trình theo loại Usecase</h3>
      <table border="1" cellPadding={8} style={{ background: '#fff', borderRadius: 8 }}>
        <thead>
          <tr>
            <th>Loại Usecase</th>
            <th>Tổng</th>
            <th>Thành công</th>
            <th>Thất bại</th>
          </tr>
        </thead>
        <tbody>
          {rnocSummary.usecaseTypes.map(u => (
            <tr key={u.type}>
              <td>{u.type}</td>
              <td>{u.total}</td>
              <td style={{ color: '#52c41a' }}>{u.success}</td>
              <td style={{ color: '#ff4d4f' }}>{u.failed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
