import React from 'react';
import { rnocRoomDetail } from './rnocDataDemo';
import { useParams, Link } from 'react-router-dom';
import styles from './DashboardRnoc.module.css';

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

export default function DashboardRnocRoom() {
  const { roomName } = useParams();
  // Nếu muốn động, lọc data theo roomName, ở đây demo cứng
  const data = rnocRoomDetail;

  return (
    <div className={styles.rnocContainer}>
      <div className={styles.rnocTitle}>
        Chi tiết phòng RNOC: {roomName || data.room}
        <Link to="/dashboard/rnoc" style={{ marginLeft: 24, fontSize: 16, color: '#1890ff' }}>
          ← Quay lại tổng hợp
        </Link>
      </div>
      <div className={styles.sectionTitle}>Tiến trình ngày {data.date}</div>
      <div className={styles.rnocTableWrap}>
        <table className={styles.rnocTable}>
          <thead>
            <tr>
              <th>Tên Usecase</th>
              <th>Trạng thái</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Thời gian chạy (giây)</th>
              <th>Lỗi</th>
            </tr>
          </thead>
          <tbody>
            {data.usecases.map((u, idx) => (
              <tr key={idx}>
                <td>{u.name}</td>
                <td style={{ color: statusColor[u.status] }}>
                  {statusIcon[u.status]} {u.status}
                </td>
                <td>{u.start}</td>
                <td>{u.end || '-'}</td>
                <td>{u.duration}</td>
                <td style={{ color: u.error ? '#ff4d4f' : undefined }}>{u.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
