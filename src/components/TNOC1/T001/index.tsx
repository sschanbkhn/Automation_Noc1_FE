import React, { useState } from 'react';
import { Tabs } from 'antd';
import { 
  WarningOutlined, 
  DesktopOutlined, 
  BarChartOutlined, 
  SettingOutlined, 
  FileTextOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import ActiveAlarms from './pages/ActiveAlarms';
import DetailAlarm from './pages/DetailAlarm';
import SetAutoRestart from './pages/SetAutoRestart';
import ListAutoRestart from './pages/ListAutoRestart';
import ManageNode from './pages/ManageNode';
import RestartStatistic from './pages/RestartStatistic';
import MCPAuth from './pages/MCPAuth';
import './T001.css';

const T001 = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showMCPAuth, setShowMCPAuth] = useState(false);

  const items = [
    {
      key: '1',
      label: (
        <span>
          <WarningOutlined style={{ marginRight: 8 }} />
          Cảnh báo hệ thống
        </span>
      ),
      children: <ActiveAlarms onSelectAlarm={(id: string) => {
        setSelectedAlarmId(id);
        setShowDetailDrawer(true);
      }} />,
    },
    {
      key: '2',
      label: (
        <span>
          <DesktopOutlined style={{ marginRight: 8 }} />
          Thiết bị quản lý
        </span>
      ),
      children: <ManageNode />,
    },
    {
      key: '3',
      label: (
        <span>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Thống kê thiết bị restart
        </span>
      ),
      children: <RestartStatistic />,
    },
    {
      key: '4',
      label: (
        <span>
          <SettingOutlined style={{ marginRight: 8 }} />
          Thiết lập restart tự động
        </span>
      ),
      children: <SetAutoRestart />,
    },
    {
      key: '5',
      label: (
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Thống kê cài đặt restart
        </span>
      ),
      children: <ListAutoRestart />,
    },
  ];

  // Nếu cần xác thực MCP, hiển thị form xác thực
  if (showMCPAuth) {
    return (
      <div className="t001-container">
        <MCPAuth 
          onSuccess={() => {
            setShowMCPAuth(false);
            // Reload để refresh dữ liệu
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="t001-container">
      <div className="t001-header">
        <h3>
          <ThunderboltOutlined style={{ fontSize: '24px' }} />
          TNOC1 - Truyền dẫn Đông Bắc Ciena 6500
        </h3>
      </div>
      <div className="t001-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items.map(item => ({
            ...item,
            children: item.key === '1' ? (
              <ActiveAlarms 
                onSelectAlarm={(id: string) => {
                  setSelectedAlarmId(id);
                  setShowDetailDrawer(true);
                }}
                onRequireAuth={() => setShowMCPAuth(true)}
              />
            ) : item.children
          }))}
        />
      </div>

      {/* Detail Alarm Drawer */}
      <DetailAlarm
        visible={showDetailDrawer}
        alarmId={selectedAlarmId || undefined}
        onClose={() => setShowDetailDrawer(false)}
      />
    </div>
  );
};

export default T001;
