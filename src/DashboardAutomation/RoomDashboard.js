import React, { useState } from 'react';
import { roomData } from './dataDemo';
import { useParams } from 'react-router-dom';
import styles from './CenterDashboard.module.css';

const statusColor = {
  success: '#52c41a',
  failed: '#ff4d4f',
  running: '#faad14'
};
const statusIcon = {
  success: <i className="bi bi-check-circle-fill" style={{ color: '#52c41a' }}></i>,
  failed: <i className="bi bi-x-circle-fill" style={{ color: '#ff4d4f' }}></i>,
  running: <i className="bi bi-arrow-repeat spin" style={{ color: '#faad14' }}></i>
};

export default function RoomDashboard() {
  const { fieldName } = useParams();
  const [data] = useState(roomData);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardTitle}>
        Chi tiết phòng: <span style={{ color: '#1890ff' }}>{data.room}</span>
      </div>
      <div className={styles.sectionTitle}>
        Tiến trình ngày <span style={{ color: '#faad14' }}>{data.date}</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên tiến trình</th>
              <th>Trạng thái</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Thời gian chạy (giây)</th>
              <th>Lỗi</th>
            </tr>
          </thead>
          <tbody>
            {data.processes.map((p, idx) => (
              <tr key={idx}>
                <td>{p.name}</td>
                <td style={{ color: statusColor[p.status] }}>
                  {statusIcon[p.status]} {p.status}
                </td>
                <td>{p.start}</td>
                <td>{p.end || '-'}</td>
                <td>{p.duration}</td>
                <td style={{ color: p.error ? '#ff4d4f' : undefined }}>{p.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.sectionTitle}>Lịch sử tiến trình</div>
      <div className={styles.tableWrap}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {data.history.map((h, idx) => (
            <li key={idx}>
              <b>{h.date}</b>: <span style={{ color: '#52c41a' }}>Thành công {h.success}</span>, <span style={{ color: '#ff4d4f' }}>Thất bại {h.failed}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}