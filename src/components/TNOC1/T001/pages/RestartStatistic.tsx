import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, message, Card } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface RestartStatisticItem {
  [key: string]: any; // Flexible structure to handle different API responses
  id?: string | number;
}

const RestartStatistic: React.FC = () => {
  const [items, setItems] = useState<RestartStatisticItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/restartstatistic/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('RestartStatistic API response:', result);
      
      // Extract data from nested structure
      let data: RestartStatisticItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        data = result.data.map((item: any) => ({
          ...item.attributes,
          ...item,
          id: item.id || item.attributes?.id,
        }));
      } else if (Array.isArray(result)) {
        data = result.map((item: any) => ({
          ...item,
          id: item.id,
        }));
      }
      
      setItems(data);
      message.success(`Tải ${data.length} bản ghi thành công`);
    } catch (error) {
      console.error('Error fetching restart statistic:', error);
      message.error('Lỗi khi tải dữ liệu thống kê restart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Parse reset_time for sorting (fallback to 0 if invalid)
  const parseResetTime = (value: any) => {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return isNaN(timestamp) ? 0 : timestamp;
  };

  // Sort by reset_time descending
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => parseResetTime(b.reset_time) - parseResetTime(a.reset_time));
  }, [items]);

  // Filter data based on search text (after sorting)
  const filteredData = sortedItems.filter(item => {
    const searchLower = searchText.toLowerCase();
    return Object.values(item).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchLower);
    });
  });

  // Column name mapping
  const columnNameMap: { [key: string]: string } = {
    node_type: 'Loại thiết bị',
    device_name: 'Tên thiết bị',
    ip_address: 'Địa chỉ IP',
    resource: 'Vị trí',
    native_condition_type: 'Cảnh báo',
    condition_severity: 'Mức cảnh báo',
    service_affecting: 'Ảnh hưởng',
    additional_text: 'Ý nghĩa cảnh báo',
    last_raise_time: 'Thời gian xảy ra',
    reset_type: 'Warm/Cold',
    comments: 'Ghi chú',
    reset_time: 'Thời gian Restart',
    reset_result: 'Kết quả restart',
  };

  // Dynamically generate columns based on available data
  const generateColumns = () => {
    if (items.length === 0) return [];

    // Get all unique keys from the first item
    const firstItem = items[0];
    const keys = Object.keys(firstItem).filter(key => 
      key !== 'id' && 
      !key.startsWith('_') &&
      typeof firstItem[key] !== 'object' &&
      key !== 'manual_reset' && // Exclude manual_reset and auto_reset as they will be merged
      key !== 'auto_reset'
    );

    // Start with index column
    const columns: any[] = [
      {
        title: '#',
        key: 'index',
        width: 50,
        render: (text: string, record: RestartStatisticItem, index: number) => index + 1,
      },
    ];

    // Define column order
    const columnOrder = [
      'node_type',
      'device_name',
      'ip_address',
      'resource',
      'native_condition_type',
      'condition_severity',
      'service_affecting',
      'additional_text',
      'last_raise_time',
      'reset_type',
      'comments',
      'reset_time',
      'reset_result',
    ];

    // Add columns in specific order first
    columnOrder.forEach(key => {
      if (keys.includes(key) || firstItem.hasOwnProperty(key)) {
        columns.push({
          title: columnNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          dataIndex: key,
          key: key,
          render: (text: any) => {
            if (text === null || text === undefined) return '-';
            if (typeof text === 'object') return JSON.stringify(text);
            return String(text);
          },
        });
      }
    });

    // Add Manual/Auto column if either manual_reset or auto_reset exists
    if (firstItem.hasOwnProperty('manual_reset') || firstItem.hasOwnProperty('auto_reset')) {
      columns.push({
        title: 'Manual/Auto',
        key: 'manual_auto',
        render: (text: any, record: RestartStatisticItem) => {
          const manual = record.manual_reset !== null && record.manual_reset !== undefined 
            ? (record.manual_reset ? 'Manual' : '') 
            : '';
          const auto = record.auto_reset !== null && record.auto_reset !== undefined 
            ? (record.auto_reset ? 'Auto' : '') 
            : '';
          const result = [manual, auto].filter(Boolean).join('/');
          return result || '-';
        },
      });
    }

    // Add remaining columns that are not in the order list
    keys.forEach(key => {
      if (!columnOrder.includes(key)) {
        columns.push({
          title: columnNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          dataIndex: key,
          key: key,
          render: (text: any) => {
            if (text === null || text === undefined) return '-';
            if (typeof text === 'object') return JSON.stringify(text);
            return String(text);
          },
        });
      }
    });

    return columns;
  };

  const columns = generateColumns();

  // Calculate statistics for Manual and Auto restarts
  const restartStats = useMemo(() => {
    const stats = {
      manual: {
        warm: 0,
        cold: 0,
      },
      auto: {
        warm: 0,
        cold: 0,
      },
    };

    items.forEach(item => {
      const resetType = String(item.reset_type || '').toLowerCase().trim();
      const isWarm = resetType === 'warm';
      const isCold = resetType === 'cold';
      
      // Check if manual reset
      const isManual = item.manual_reset === true || item.manual_reset === 'true' || item.manual_reset === 1;
      // Check if auto reset
      const isAuto = item.auto_reset === true || item.auto_reset === 'true' || item.auto_reset === 1;

      if (isManual) {
        if (isWarm) stats.manual.warm++;
        if (isCold) stats.manual.cold++;
      }

      if (isAuto) {
        if (isWarm) stats.auto.warm++;
        if (isCold) stats.auto.cold++;
      }
    });

    return stats;
  }, [items]);

  // Export to Excel function
  const handleExportExcel = () => {
    if (items.length === 0) {
      message.warning('Không có dữ liệu để xuất Excel');
      return;
    }

    try {
      // Define column order for export
      const columnOrder = [
        'node_type',
        'device_name',
        'ip_address',
        'resource',
        'native_condition_type',
        'condition_severity',
        'service_affecting',
        'additional_text',
        'last_raise_time',
        'reset_type',
        'comments',
        'reset_time',
        'reset_result',
      ];

      // Prepare data for export (use all items, not filtered)
      const exportData = items.map((item, index) => {
        const row: any = { '#': index + 1 };
        
        // Add columns in order
        columnOrder.forEach(key => {
          if (item.hasOwnProperty(key)) {
            const columnTitle = columnNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            row[columnTitle] = item[key] !== null && item[key] !== undefined ? String(item[key]) : '-';
          }
        });

        // Add Manual/Auto column
        if (item.hasOwnProperty('manual_reset') || item.hasOwnProperty('auto_reset')) {
          const manual = item.manual_reset !== null && item.manual_reset !== undefined 
            ? (item.manual_reset ? 'Manual' : '') 
            : '';
          const auto = item.auto_reset !== null && item.auto_reset !== undefined 
            ? (item.auto_reset ? 'Auto' : '') 
            : '';
          row['Manual/Auto'] = [manual, auto].filter(Boolean).join('/') || '-';
        }

        // Add remaining columns
        Object.keys(item).forEach(key => {
          if (
            key !== 'id' && 
            !key.startsWith('_') && 
            typeof item[key] !== 'object' &&
            !columnOrder.includes(key) &&
            key !== 'manual_reset' &&
            key !== 'auto_reset'
          ) {
            const columnTitle = columnNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            row[columnTitle] = item[key] !== null && item[key] !== undefined ? String(item[key]) : '-';
          }
        });

        return row;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Thống kê restart');
      
      // Generate filename with current date
      const fileName = `Thong_ke_restart_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Write file
      XLSX.writeFile(workbook, fileName);
      
      message.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Lỗi khi xuất file Excel');
    }
  };

  return (
    <div className="form-container">
      {/* Statistics Summary with Title */}
      <div style={{ marginBottom: '10px' }}>
        <Card size="small" style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
          borderRadius: '8px',
          boxShadow: '0 3px 12px rgba(24, 144, 255, 0.3)',
          border: 'none',
          padding: '10px 12px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-35px',
            right: '-35px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(25px)',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-20px',
            width: '70px',
            height: '70px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}></div>
          
          {/* Title */}
          <div style={{ 
            marginBottom: '8px',
            paddingBottom: '6px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
            position: 'relative',
            zIndex: 1,
          }}>
            <h4 style={{ 
              margin: 0, 
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: 'center',
              letterSpacing: '0.1px',
            }}>
              <BarChartOutlined style={{ fontSize: '14px', color: 'white' }} />
              Thống kê thiết bị đã được restart
            </h4>
          </div>
          
          {/* Statistics */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Manual Section */}
            <div style={{ textAlign: 'center', minWidth: '90px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                marginBottom: '4px', 
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.2px',
              }}>
                Manual:
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '1px',
                lineHeight: '1.4',
              }}>
                Warm: <span style={{ 
                  fontWeight: 700, 
                  color: '#fff', 
                  fontSize: '13px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  marginLeft: '2px',
                }}>{restartStats.manual.warm}</span>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: '1.4',
              }}>
                Cold: <span style={{ 
                  fontWeight: 700, 
                  color: '#fff', 
                  fontSize: '13px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  marginLeft: '2px',
                }}>{restartStats.manual.cold}</span>
              </div>
            </div>
            
            {/* Separator */}
            <div style={{ 
              width: '1px', 
              height: '35px', 
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              alignSelf: 'center',
            }}></div>
            
            {/* Auto Section */}
            <div style={{ textAlign: 'center', minWidth: '90px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                marginBottom: '4px', 
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.2px',
              }}>
                Auto:
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '1px',
                lineHeight: '1.4',
              }}>
                Warm: <span style={{ 
                  fontWeight: 700, 
                  color: '#fff', 
                  fontSize: '13px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  marginLeft: '2px',
                }}>{restartStats.auto.warm}</span>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: '1.4',
              }}>
                Cold: <span style={{ 
                  fontWeight: 700, 
                  color: '#fff', 
                  fontSize: '13px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  marginLeft: '2px',
                }}>{restartStats.auto.cold}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
            
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <Input.Search
          placeholder="Tìm kiếm..."
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" loading={loading} onClick={fetchData} icon={<ReloadOutlined />}>
          Làm mới
        </Button>
        <Button
          type="default"
          onClick={handleExportExcel}
          icon={<DownloadOutlined />}
          disabled={items.length === 0}
        >
          Xuất Excel
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record.id?.toString() || Math.random().toString()}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
          loading={loading}
          bordered
          size="small"
        />
      </div>
    </div>
  );
};

export default RestartStatistic;

