import React, { useState } from 'react';
import Tab1Dashboard from './Tab1Dashboard';
import Tab2ClearMulti from './Tab2ClearMulti';
import Tab3ClearUser from './Tab3ClearUser';

/**
 * Thuê bao Đa Phiên - Main Container Component
 * 
 * Purpose: Manage tab navigation and render appropriate tab component
 * 
 * Tabs:
 * 1. Dashboard - Session & User multi-session statistics with charts
 * 2. Clear Đa Phiên - Clear sessions by device/BNG with table
 * 3. Clear theo User - Clear sessions by specific user
 * 
 * Architecture: This component only manages tab state, actual data fetching
 * and logic is handled by individual tab components for better maintainability.
 */
export default function ThuebaoDaphien() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ color: '#1890ff', fontWeight: 700, fontSize: 22, margin: 0 }}>Thuê bao đa phiên</h2>
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
            onClick={() => setActiveTab('clear-multi')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'clear-multi' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'clear-multi' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'clear-multi' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'clear-multi' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Clear Đa Phiên
          </button>
          <button
            onClick={() => setActiveTab('clear-user')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'clear-user' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'clear-user' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'clear-user' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'clear-user' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Clear theo User
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'dashboard' && <Tab1Dashboard activeTab={activeTab} />}
      {activeTab === 'clear-multi' && <Tab2ClearMulti activeTab={activeTab} />}
      {activeTab === 'clear-user' && <Tab3ClearUser activeTab={activeTab} />}
    </div>
  );
}
