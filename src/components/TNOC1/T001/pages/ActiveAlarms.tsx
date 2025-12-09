import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, message, Card, Row, Col, Statistic } from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined, WarningOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';

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

interface N8NTaskItem {
  id?: string | number;
  warm_restart_count?: number;
  cold_restart_count?: number;
  [key: string]: any;
}

const ActiveAlarms: React.FC<ActiveAlarmsProps> = ({ onSelectAlarm, onRequireAuth }) => {
  const [alarmItems, setAlarmItems] = useState<AlarmItem[]>([]);
  const [autoRestartItems, setAutoRestartItems] = useState<AutoRestartItem[]>([]);
  const [n8nTaskItems, setN8nTaskItems] = useState<N8NTaskItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAlarms = useCallback(async () => {
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
  }, [onRequireAuth]);

  const fetchAutoRestartList = useCallback(async () => {
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
  }, [onRequireAuth]);

  const fetchN8NTasks = useCallback(async () => {
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/n8ntask/');
      if (!response.ok) {
        // Xử lý lỗi 401 Unauthorized
        if (response.status === 401) {
          message.warning('Phiên đăng nhập đã hết hạn. Vui lòng xác thực lại hệ thống MCP.');
          if (onRequireAuth) {
            onRequireAuth();
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Extract data from nested structure
      let data: N8NTaskItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        data = result.data.map((item: any) => ({
          ...item.attributes,
          ...item,
          id: item.id || item.attributes?.id,
          warm_restart_count: item.warm_restart_count || item.attributes?.warm_restart_count || 0,
          cold_restart_count: item.cold_restart_count || item.attributes?.cold_restart_count || 0,
        }));
      } else if (Array.isArray(result)) {
        data = result.map((item: any) => ({
          ...item,
          id: item.id,
          warm_restart_count: item.warm_restart_count || 0,
          cold_restart_count: item.cold_restart_count || 0,
        }));
      }
      
      console.log('N8N Task Items:', data);
      console.log('N8N Task Items sample (first item):', data.length > 0 ? data[0] : 'No data');
      setN8nTaskItems(data);
    } catch (error) {
      console.error('Error fetching n8n tasks:', error);
      // Không hiển thị error message để tránh làm phiền người dùng
    }
  }, [onRequireAuth]);

  useEffect(() => {
    fetchAlarms();
    fetchAutoRestartList();
    fetchN8NTasks();
    
    // Auto refresh every 5 minutes (300000 ms) để giảm tải cho server BE
    const intervalId = setInterval(() => {
      fetchAlarms();
      fetchAutoRestartList();
      fetchN8NTasks();
    }, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchAlarms, fetchAutoRestartList, fetchN8NTasks]);

  // Parse time for sorting (fallback to 0 if invalid)
  const parseLastRaiseTime = (value: any) => {
    if (!value) return 0;
    const ts = new Date(value).getTime();
    return isNaN(ts) ? 0 : ts;
  };

  // Sort by last_raise_time descending
  const sortedAlarms = useMemo(() => {
    return [...alarmItems].sort((a, b) => parseLastRaiseTime(b.last_raise_time) - parseLastRaiseTime(a.last_raise_time));
  }, [alarmItems]);

  const filteredData = sortedAlarms.filter(item =>
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

  // Tính tổng warm_restart_count và cold_restart_count từ n8ntask
  const restartStats1H = useMemo(() => {
    const stats = {
      warm: 0,
      cold: 0,
    };

    n8nTaskItems.forEach(item => {
      const warmCount = Number(item.warm_restart_count) || 0;
      const coldCount = Number(item.cold_restart_count) || 0;
      stats.warm += warmCount;
      stats.cold += coldCount;
    });

    return stats;
  }, [n8nTaskItems]);

  // Tính hiệu số thời gian giữa item đầu tiên và cuối cùng (làm tròn đơn vị phút)
  const timeRangeMinutes = useMemo(() => {
    if (n8nTaskItems.length === 0) {
      console.log('timeRangeMinutes: No items in n8nTaskItems');
      return null;
    }

    // Tìm timestamp từ các field có thể có
    const getTimestamp = (item: N8NTaskItem): number | null => {
      const timeFields = ['created_at', 'reset_time', 'timestamp', 'time', 'date', 'created_time', 'updated_at', 'updated_time'];
      
      // Log để debug
      if (n8nTaskItems.indexOf(item) === 0) {
        console.log('timeRangeMinutes: First item keys:', Object.keys(item));
        console.log('timeRangeMinutes: First item:', item);
      }
      
      for (const field of timeFields) {
        if (item[field]) {
          const ts = new Date(item[field]).getTime();
          if (!isNaN(ts) && ts > 0) {
            if (n8nTaskItems.indexOf(item) === 0) {
              console.log(`timeRangeMinutes: Found timestamp in field "${field}":`, item[field], '->', ts);
            }
            return ts;
          }
        }
      }
      
      // Nếu không tìm thấy trong các field thông thường, thử tìm tất cả các field có chứa 'time' hoặc 'date'
      for (const key in item) {
        if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) {
          const value = item[key];
          if (value) {
            const ts = new Date(value).getTime();
            if (!isNaN(ts) && ts > 0) {
              if (n8nTaskItems.indexOf(item) === 0) {
                console.log(`timeRangeMinutes: Found timestamp in field "${key}":`, value, '->', ts);
              }
              return ts;
            }
          }
        }
      }
      
      return null;
    };

    // Lấy tất cả timestamp hợp lệ
    const timestamps = n8nTaskItems
      .map(item => getTimestamp(item))
      .filter((ts): ts is number => ts !== null)
      .sort((a, b) => a - b);

    console.log('timeRangeMinutes: Valid timestamps found:', timestamps.length, 'out of', n8nTaskItems.length);

    if (timestamps.length < 2) {
      console.log('timeRangeMinutes: Not enough timestamps (need at least 2), found:', timestamps.length);
      return null;
    }

    const firstTimestamp = timestamps[0];
    const lastTimestamp = timestamps[timestamps.length - 1];
    const diffMs = lastTimestamp - firstTimestamp + 2 * 60 * 1000; // Tăng thêm 2 phút
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    console.log('timeRangeMinutes: Calculated time range:', diffMinutes, 'minutes (from', new Date(firstTimestamp).toISOString(), 'to', new Date(lastTimestamp).toISOString(), ')');

    return diffMinutes;
  }, [n8nTaskItems]);

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
     
      {/* Thống kê mức cảnh báo */}
      <div style={{ marginBottom: '12px' }}>
        <Row gutter={8}>
          <Col xs={24} md={12}>
            <Card
              size="small"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e0eef7',
                transition: 'all 0.3s ease',
                height: '100%',
              }}
              bodyStyle={{ padding: '8px' }}
            >
              <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <WarningOutlined style={{ fontSize: '14px', color: '#1890ff' }} />
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1f2d3d',
                      letterSpacing: 0.2,
                    }}
                  >
                    MỨC ĐỘ CẢNH BÁO
                  </div>
                </div>
              </div>

              <Row gutter={[8, 8]} justify="center">
                {[
                  { label: 'Critical', value: severityStats.Critical, color: '#ff4d4f', bg: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', icon: '🔥' },
                  { label: 'Major', value: severityStats.Major, color: '#faad14', bg: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)', icon: '⚠️' },
                  { label: 'Minor', value: severityStats.Minor, color: '#1890ff', bg: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', icon: 'ℹ️' },
                  { label: 'Warning', value: severityStats.Warning, color: '#8c8c8c', bg: 'linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)', icon: '⚪' },
                ].map((item) => (
                  <Col key={item.label} xs={12} sm={12} md={12} lg={12}>
                    <div
                      style={{
                        background: item.bg,
                        borderRadius: 6,
                        padding: '8px 6px',
                        textAlign: 'center',
                        border: `1px solid ${item.color}40`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = `0 3px 8px ${item.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ fontSize: 14, marginBottom: '1px' }}>{item.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: item.color, marginBottom: '3px' }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2d3d', lineHeight: 1 }}>{item.value}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              size="small"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                borderRadius: 6,
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e0eef7',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '8px' }}
            >
              <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '3px' }}>
                  <ThunderboltOutlined style={{ fontSize: '14px', color: '#1890ff' }} />
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1f2d3d',
                      letterSpacing: 0.2,
                    }}
                  >
                    THIẾT BỊ TỰ ĐỘNG RESTART
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#8c8c8c',
                    letterSpacing: 0.1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                  }}
                >
                  {timeRangeMinutes !== null ? (
                    <>
                      <ClockCircleOutlined style={{ fontSize: '10px' }} />
                      Trong <span style={{ color: '#1890ff', fontWeight: 600, fontSize: '11px' }}>{timeRangeMinutes} phút</span> vừa qua
                    </>
                  ) : (
                    <>
                      <ClockCircleOutlined style={{ fontSize: '10px' }} />
                      Đang tải dữ liệu...
                    </>
                  )}
                </div>
              </div>

              <Row gutter={[8, 8]} justify="center">
                <Col xs={12} sm={12} md={12} lg={12}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                      borderRadius: 6,
                      padding: '8px 6px',
                      textAlign: 'center',
                      border: '1px solid #1890ff40',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(24, 144, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{ fontSize: 14, marginBottom: '1px' }}>🔥</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1890ff', marginBottom: '3px' }}>Warm Restart</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2d3d', lineHeight: 1 }}>{restartStats1H.warm}</div>
                  </div>
                </Col>
                <Col xs={12} sm={12} md={12} lg={12}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
                      borderRadius: 6,
                      padding: '8px 6px',
                      textAlign: 'center',
                      border: '1px solid #ff4d4f40',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(255, 77, 79, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{ fontSize: 14, marginBottom: '1px' }}>❄️</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#ff4d4f', marginBottom: '3px' }}>Cold Restart</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2d3d', lineHeight: 1 }}>{restartStats1H.cold}</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
      <h4 style={{ marginBottom: '16px' }}>Danh sách cảnh báo hệ thống, chờ xác nhận reset</h4>
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
            fetchN8NTasks();
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
