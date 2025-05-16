import React, { useState, useEffect } from 'react';
import { centerData } from './dataDemo';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../assets/css/mystyle.css';
import styles from './CenterDashboard.module.css';
import UsecaseTable from './UsecaseTable';
import { Link } from 'react-router-dom';

function AnimatedNumber({ value }) {
  return <span>{value}</span>;
}

export default function CenterDashboard() {
  const [summary, setSummary] = useState({ ...centerData.summary });

  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(prev => ({
        total: prev.total + 1,
        success: prev.success + 1,
        failed: prev.failed + (Math.random() > 0.8 ? 1 : 0),
        running: Math.max(0, prev.running + (Math.random() > 0.5 ? 1 : -1)),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardTitle}>Dashboard Tổng Quan</div>
      {/* Card tổng hợp */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <i className="bi bi-bar-chart-fill card-icon" style={{ color: '#1890ff' }}></i>
          Tổng<br />
          <span style={{ fontSize: '2rem', color: '#1890ff' }}>
            <AnimatedNumber value={summary.total} />
          </span>
        </div>
        <div className={`${styles.card} ${styles.success}`}>
          <i className="bi bi-check-circle-fill card-icon" style={{ color: '#52c41a' }}></i>
          Thành công<br />
          <span style={{ fontSize: '2rem', color: '#52c41a' }}>
            <AnimatedNumber value={summary.success} />
          </span>
        </div>
        <div className={`${styles.card} ${styles.failed}`}>
          <i className="bi bi-x-circle-fill card-icon" style={{ color: '#ff4d4f' }}></i>
          Thất bại<br />
          <span style={{ fontSize: '2rem', color: '#ff4d4f' }}>
            <AnimatedNumber value={summary.failed} />
          </span>
        </div>
        <div className={`${styles.card} ${styles.running}`}>
          <i className="bi bi-arrow-repeat card-icon spin" style={{ color: '#faad14' }}></i>
          Đang chạy<br />
          <span style={{ fontSize: '2rem', color: '#faad14' }}>
            <AnimatedNumber value={summary.running} />
          </span>
        </div>
      </div>
      {/* Bảng tổng hợp theo lĩnh vực */}
      <div className={styles.sectionTitle}>Tiến trình theo lĩnh vực</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lĩnh vực</th>
              <th>Tổng</th>
              <th>Thành công</th>
              <th>Thất bại</th>
              <th>Đang chạy</th>
            </tr>
          </thead>
          <tbody>
            {centerData.byField.map(f => (
              <tr key={f.field}>
                <td>
                  <Link to={`/dashboard/field/${encodeURIComponent(f.field)}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
                    {f.field}
                  </Link>
                </td>
                <td>{f.total}</td>
                <td style={{color:'#52c41a'}}>{f.success}</td>
                <td style={{color:'#ff4d4f'}}>{f.failed}</td>
                <td style={{color:'#faad14'}}>{f.running}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UsecaseTable />
      {/* Bạn có thể thêm biểu đồ ở đây */}
    </div>
    
  );
}