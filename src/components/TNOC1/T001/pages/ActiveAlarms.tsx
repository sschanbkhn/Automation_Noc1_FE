import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Button, Space, message, Card, Row, Col, Statistic } from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';

interface AlarmItem {
  alarm_id: string;
  device_name: string;
  ip_address: string;
  resource: string;
  native_condition_type: string;
  additional_text: string;
  condition_severity: string;
  service_affecting: string;
  last_raise_time: string;
  node_type?: string;
  state?: string;
  device_id?: string;
}

interface ActiveAlarmsProps {
  onSelectAlarm?: (alarmId: string) => void;
  onRequireAuth?: () => void;
}

interface AutoRestartItem {
  id: string | number;
  native_condition_type: string;
  ip_address: string;
}

const ActiveAlarms: React.FC<ActiveAlarmsProps> = ({ onSelectAlarm, onRequireAuth }) => {
  const [alarmItems, setAlarmItems] = useState<AlarmItem[]>([]);
  const [autoRestartItems, setAutoRestartItems] = useState<AutoRestartItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/activealarms/');
      if (!response.ok) {
        // Xử lý lỗi 401 Unauthorized
        if (response.status === 401) {
          message.warning('Phiên đăng nhập đã hết hạn. Vui lòng xác thực lại hệ thống MCP.');
          // Gọi callback để hiển thị form xác thực MCP
          if (onRequireAuth) {
            onRequireAuth();
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Extract attributes from nested structure
      let alarms: AlarmItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        alarms = result.data.map((item: any) => ({
          ...item.attributes,
          // Ensure alarm_id exists as key
          alarm_id: item.attributes.alarm_id || item.id,
        }));
      } else if (Array.isArray(result)) {
        alarms = result;
      }
      
      setAlarmItems(alarms);
      message.success(`Tải ${alarms.length} cảnh báo thành công`);
    } catch (error) {
      console.error('Error fetching alarms:', error);
      message.error('Lỗi khi tải dữ liệu cảnh báo');
      setAlarmItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAutoRestartList = async () => {
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/alarmautorestart/');
      if (!response.ok) {
        // Xử lý lỗi 401 Unauthorized
        if (response.status === 401) {
          message.warning('Phiên đăng nhập đã hết hạn. Vui lòng xác thực lại hệ thống MCP.');
          // Gọi callback để hiển thị form xác thực MCP
          if (onRequireAuth) {
            onRequireAuth();
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Extract data from nested structure
      let data: AutoRestartItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        data = result.data.map((item: any) => ({
          id: item.id || item.attributes?.id,
          native_condition_type: item.native_condition_type || item.attributes?.native_condition_type || '',
          ip_address: item.ip_address || item.attributes?.ip_address || '',
        }));
      } else if (Array.isArray(result)) {
        data = result.map((item: any) => ({
          id: item.id,
          native_condition_type: item.native_condition_type || '',
          ip_address: item.ip_address || '',
        }));
      }
      
      setAutoRestartItems(data);
    } catch (error) {
      console.error('Error fetching auto restart list:', error);
      // Không hiển thị error message để tránh làm phiền người dùng
    }
  };

  useEffect(() => {
    fetchAlarms();
    fetchAutoRestartList();
    
    // Auto refresh every 5 minutes (300000 ms) để giảm tải cho server BE
    const intervalId = setInterval(() => {
      fetchAlarms();
      fetchAutoRestartList();
    }, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const filteredData = alarmItems.filter(item =>
    (item.device_name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (item.ip_address || '').includes(searchText) ||
    (item.resource?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  // Tính toán số lượng cảnh báo theo mức độ
  const severityStats = useMemo(() => {
    const stats = {
      Critical: 0,
      Major: 0,
      Minor: 0,
      Warning: 0,
    };

    alarmItems.forEach(item => {
      const severity = item.condition_severity?.trim();
      if (severity === 'Critical') {
        stats.Critical++;
      } else if (severity === 'MAJOR' || severity === 'Major') {
        stats.Major++;
      } else if (severity === 'MINOR' || severity === 'Minor') {
        stats.Minor++;
      } else if (severity === 'Warning' || severity === 'WARNING') {
        stats.Warning++;
      }
    });

    return stats;
  }, [alarmItems]);

  const columns = [
    {
      title: '#',
      dataIndex: 'alarm_id',
      key: 'alarm_id',
      width: 50,
      render: (text: string, record: AlarmItem, index: number) => index + 1,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device_name',
      key: 'device_name',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: 'Vị trí',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Mã cảnh báo',
      dataIndex: 'native_condition_type',
      key: 'native_condition_type',
    },
    {
      title: 'Tên cảnh báo chi tiết',
      dataIndex: 'additional_text',
      key: 'additional_text',
    },
    {
      title: 'Mức cảnh báo',
      dataIndex: 'condition_severity',
      key: 'condition_severity',
      render: (text: string) => {
        const severity = text?.trim();
        let color = '#999';
        
        if (severity === 'Critical') {
          color = '#ff4d4f'; // Đỏ
        } else if (severity === 'MAJOR' || severity === 'Major') {
          color = '#faad14'; // Vàng
        } else if (severity === 'MINOR' || severity === 'Minor') {
          color = '#1890ff'; // Xanh dương
        } else if (severity === 'Warning' || severity === 'WARNING') {
          color = '#8c8c8c'; // Xám
        }
        
        return <span style={{ color, fontWeight: 'bold' }}>{text}</span>;
      },
    },
    {
      title: 'Ảnh hưởng',
      dataIndex: 'service_affecting',
      key: 'service_affecting',
    },
    {
      title: 'Thời gian xảy ra',
      dataIndex: 'last_raise_time',
      key: 'last_raise_time',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (text: string, record: AlarmItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: AlarmItem) => {
    if (onSelectAlarm) {
      onSelectAlarm(record.alarm_id);
    }
  };

  // Tạo Set để lưu các cặp (ip_address, native_condition_type) từ ListAutoRestart
  const autoRestartPairs = useMemo(() => {
    const pairs = new Set<string>();
    autoRestartItems.forEach(item => {
      const key = `${item.ip_address}|${item.native_condition_type}`;
      pairs.add(key);
    });
    return pairs;
  }, [autoRestartItems]);

  // Hàm kiểm tra và highlight dòng trùng lặp
  const getRowClassName = (record: AlarmItem) => {
    const key = `${record.ip_address}|${record.native_condition_type}`;
    if (autoRestartPairs.has(key)) {
      return 'alarm-row-duplicate';
    }
    return '';
  };

  return (
    <div className="form-container">
      <h4 style={{ marginBottom: '16px' }}>Danh sách cảnh báo hệ thống, chờ xác nhận reset</h4>
      
      {/* Thống kê mức cảnh báo */}
      <div style={{ marginBottom: '16px' }}>
        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
            MỨC ĐỘ CẢNH BÁO HỆ THỐNG CIENA ĐÔNG BẮC 6500:
          </div>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                Critical: <span style={{ fontSize: '20px' }}>{severityStats.Critical}</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#d9d9d9' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>
                Major: <span style={{ fontSize: '20px' }}>{severityStats.Major}</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#d9d9d9' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                Minor: <span style={{ fontSize: '20px' }}>{severityStats.Minor}</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#d9d9d9' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8c8c8c' }}>
                Warning: <span style={{ fontSize: '20px' }}>{severityStats.Warning}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <Input.Search
          placeholder="Tìm kiếm thiết bị, IP, vị trí..."
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Button 
          type="primary" 
          loading={loading} 
          onClick={() => {
            fetchAlarms();
            fetchAutoRestartList();
          }} 
          icon={<ReloadOutlined />}
        >
          Làm mới
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="alarm_id"
          rowClassName={getRowClassName}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} cảnh báo`,
          }}
          loading={loading}
          bordered
          size="small"
        />
      </div>
    </div>
  );
};

export default ActiveAlarms;
