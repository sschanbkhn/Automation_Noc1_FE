import React from 'react';
import { rnocSummary } from './rnocDataDemo';
import { Link } from 'react-router-dom';
import styles from './DashboardRnoc.module.css';

export default function DashboardRnocSummary() {
  return (
    <div className={styles.rnocContainer}>
      <div className={styles.rnocTitle}>
        Tổng hợp tiến trình RNOC ngày {rnocSummary.date}
      </div>
      <div className={styles.sectionTitle}>Tiến trình theo phòng</div>
      <div className={styles.rnocTableWrap}>
        <table className={styles.rnocTable}>
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
                <td className="success">{r.success}</td>
                <td className="failed">{r.failed}</td>
                <td className="running">{r.running}</td>
                <td>
                  <Link to={`/dashboard/rnoc/room/${encodeURIComponent(r.room)}`}>Xem chi tiết</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.sectionTitle}>Tiến trình theo loại Usecase</div>
      <div className={styles.rnocTableWrap}>
        <table className={styles.rnocTable}>
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
                <td className="success">{u.success}</td>
                <td className="failed">{u.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}