import React, { useState, useEffect, useRef } from 'react';

export default function I001() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Initialize component
  }, []);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ color: '#1890ff', fontWeight: 700, fontSize: 22, margin: 0 }}>I001 Module</h2>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'dashboard' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'dashboard' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'dashboard' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'dashboard' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('data')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'data' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'data' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'data' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'data' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Data
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
          <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Dashboard</h3>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <p style={{ fontSize: 16 }}>Dashboard content will be displayed here</p>
          </div>
        </div>
      )}
      
      {activeTab === 'data' && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
          <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Data</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 16, color: '#666' }}>Đang tải dữ liệu...</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <p style={{ fontSize: 16 }}>Data table will be displayed here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
