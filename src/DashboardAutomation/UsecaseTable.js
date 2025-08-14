import React from 'react';
import { usecaseList } from './usecaseDemo';
import { Link } from 'react-router-dom';
import styles from './CenterDashboard.module.css';

const statusColor = {
  running: '#faad14',
  finished: '#52c41a',
  error: '#ff4d4f',
  waiting: '#1890ff'
};

const resultIcon = {
  running: <i className="bi bi-arrow-repeat spin" style={{ color: '#faad14' }}></i>,
  finished: <i className="bi bi-check-circle-fill" style={{ color: '#52c41a' }}></i>,
  error: <i className="bi bi-x-circle-fill" style={{ color: '#ff4d4f' }}></i>,
  waiting: <i className="bi bi-hourglass-split" style={{ color: '#1890ff' }}></i>
};

export default function UsecaseTable() {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.sectionTitle}>
        Danh sách Usecase đang theo dõi
        <Link to="/dashboard" style={{ float: 'right', fontWeight: 400, fontSize: 14, color: '#1890ff' }}>
          <i className="bi bi-bar-chart-fill"></i> Dashboard Tổng Quan
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hệ thống</th>
            <th>Loại Usecase</th>
            <th>Trạng thái</th>
            <th>Kết quả</th>
            <th>Ngày giờ chạy</th>
            <th>Ngày giờ kết thúc</th>
            <th>Lĩnh vực</th>
          </tr>
        </thead>
        <tbody>
          {usecaseList.map(u => (
            <tr key={u.id}>
              <td>{u.system}</td>
              <td>{u.usecaseType}</td>
              <td style={{ color: statusColor[u.status] }}>
                {resultIcon[u.status]} {u.status === 'running' ? 'Đang chạy' : u.status === 'finished' ? 'Kết thúc' : u.status === 'error' ? 'Lỗi' : 'Chờ kết quả'}
              </td>
              <td>{u.result}</td>
              <td>{u.startTime}</td>
              <td>{u.endTime || '-'}</td>
              <td>
                <Link to={`/dashboard/field/${encodeURIComponent(u.field)}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
                  {u.field}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}