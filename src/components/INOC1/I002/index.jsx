import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './I002_1_Dashborad';
import Report from './I002_2_Report';
import BadLink from './I002_3_BadLink';

const TabButton = ({ active, onClick, children, leftRounded }) => (
  <button
    onClick={onClick}
    className={active ? 'active' : ''}
    style={{
      padding: '10px 16px',
      border: 'none',
      background: active ? '#2563eb' : 'transparent',
      color: active ? '#fff' : '#6b7280',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      borderRadius: leftRounded ? '8px 0 0 0' : '0',
      fontSize: 14,
      transition: 'all .2s ease',
      position: 'relative'
    }}
  >
    {children}
  </button>
);

const I002 = () => {
  const [tab, setTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t && ['dashboard','badlink','report'].includes(t)) setTab(t);
  }, [location.search]);

  const changeTab = (t) => {
    setTab(t);
    const params = new URLSearchParams(location.search);
    params.set('tab', t);
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div style={{ padding: 24, background: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        I002 - Giám sát & báo cáo
      </h2>

      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: 16,
        background: '#fff',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <TabButton leftRounded active={tab === 'dashboard'} onClick={() => changeTab('dashboard')}>📊 Cảnh báo phần cứng</TabButton>
        <TabButton active={tab === 'badlink'} onClick={() => changeTab('badlink')}>🧰 Xử lý link xấu</TabButton>
        <TabButton active={tab === 'report'} onClick={() => changeTab('report')}>📄 Report</TabButton>
      </div>

      <div>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'badlink' && <BadLink />}
        {tab === 'report' && <Report />}
      </div>
    </div>
  );
};

const mapState = ({ ...state }) => ({});
export default connect(mapState)(I002);
