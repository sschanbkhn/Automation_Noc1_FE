import React, { useCallback, useState } from 'react';
import { Tabs } from 'antd';
import { FireOutlined, DatabaseOutlined, ClusterOutlined, AppstoreOutlined } from '@ant-design/icons';
import TemperatureList from './pages/TemperatureList';
import NetworkManagement from './pages/NetworkManagement';
import SlotsEquip from './pages/SlotsEquip';
import GetTemperature from './pages/GetTemperature';
import './CienaDBTemp.css';
import MCPAuth from '../../TNOC1/T001/pages/MCPAuth';

const CienaDBTemp = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [showMCPAuth, setShowMCPAuth] = useState(false);
  // Hàm callback kích hoạt khi API con báo lỗi 401
  const handleRequireAuth = useCallback(() => {
    setShowMCPAuth(true);
  }, []);

  // Nếu cần xác thực MCP, hiển thị form xác thực
  if (showMCPAuth) {
    return (
      <div className="cienadb-container">
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
  
  const items = [
    {
      key: '1',
      label: (
        <span>
          <FireOutlined style={{ marginRight: 8 }} />
          Giám sát nhiệt độ
        </span>
      ),
      children: <TemperatureList />,
    },
    {
      key: '2',
      label: (
        <span>
          <ClusterOutlined style={{ marginRight: 8 }} />
          Network Element
        </span>
      ),
      children: <NetworkManagement onRequireAuth={handleRequireAuth} />,
    },
    {
      key: '3',
      label: (
        <span>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Slots Equip
        </span>
      ),
      children: <SlotsEquip />,
    },
    {
      key: '4',
      label: (
        <span>
          <FireOutlined style={{ marginRight: 8 }} />
          Lấy nhiệt độ
        </span>
      ),
      children: <GetTemperature />,
    },
  ];

  return (
    <div className="cienadb-container">
      <div className="cienadb-header">
        <h3>
          <DatabaseOutlined style={{ fontSize: '24px' }} />
          TNOC1 - Giám sát nhiệt độ thiết bị hệ thống Truyền dẫn Ciena Đông Bắc
        </h3>
      </div>
      <div className="cienadb-content">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
      </div>
    </div>
  );
};

export default CienaDBTemp;
