import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Button, Space, message, Card, Statistic, Tag } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';

interface TemperatureItem {
  id: string;
  ne_name: string;
  cardType: string;
  locations_shelf: string;
  locations_slot: string;
  nativeName: string;
  installedSpec_serialNumber?: string;
  installedSpec_manufacturer?: string;
  installedSpec_type?: string;
  installedSpec_partNumber?: string;
  tempThreshold?: number;
  temperature: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  last_updated: string;
  timestamp?: string;
}

const API_URL = 'http://10.155.43.200:8001/api/cienatemp/temperaturestatistics/';

const getStatusTag = (status: TemperatureItem['status']) => {
  switch (status) {
    case 'critical':
      return <Tag color="red">Nguy hiểm</Tag>;
    case 'warning':
      return <Tag color="orange">Cảnh báo</Tag>;
    default:
      return <Tag color="green">Bình thường</Tag>;
  }
};

const TemperatureList: React.FC = () => {
  const [items, setItems] = useState<TemperatureItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      let data: TemperatureItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        data = result.data.map((item: any) => ({
          id: item.id || item.attributes?.id,
          ne_name: item.attributes?.ne_name || item.ne_name || '',
          locations_shelf: item.attributes?.locations_shelf || item.locations_shelf || '',
          locations_slot: item.attributes?.locations_slot || item.locations_slot || '',
          nativeName: item.attributes?.nativeName || item.nativeName || 'N/A',
          installedSpec_serialNumber: item.attributes?.installedSpec_serialNumber || item.installedSpec_serialNumber || '',
          installedSpec_manufacturer: item.attributes?.installedSpec_manufacturer || item.installedSpec_manufacturer || '',
          installedSpec_type: item.attributes?.installedSpec_type || item.installedSpec_type || '',
          installedSpec_partNumber: item.attributes?.installedSpec_partNumber || item.installedSpec_partNumber || '',
          cardType: item.attributes?.cardType || item.cardType || '',
          tempThreshold: item.attributes?.tempThreshold ?? item.tempThreshold ?? 0,
          temperature: item.attributes?.temperature ?? item.temperature ?? 0,
          timestamp: item.attributes?.timestamp || item.timestamp || '',
          status: item.attributes?.status || item.status || 'normal',
        }));
      } else if (Array.isArray(result)) {
        data = result;
      }

      setItems(data);
      message.success(`Tải ${data.length} bản ghi nhiệt độ thành công`);
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      message.warning('Chưa kết nối được API. Hiển thị dữ liệu mẫu.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    const keyword = searchText.toLowerCase();
    return items.filter(
      (item) =>
        item.ne_name?.toLowerCase().includes(keyword) ||
        item.cardType?.toLowerCase().includes(keyword) ||
        item.locations_slot?.toLowerCase().includes(keyword)
    );
  }, [items, searchText]);

  const stats = useMemo(() => {
    const warning = filteredItems.filter(
      (item) => Number(item.temperature) > Number(item.tempThreshold ?? 0)
    ).length;
    const critical = filteredItems.filter((item) => Number(item.temperature) > 70).length;
    return { warning, critical };
  }, [filteredItems]);

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'ne_name',
      key: 'ne_name',
      sorter: (a: TemperatureItem, b: TemperatureItem) =>
        a.ne_name.localeCompare(b.ne_name),
    },
    {
      title: 'Shelf',
      dataIndex: 'locations_shelf',
      key: 'locations_shelf',
      sorter: (a: TemperatureItem, b: TemperatureItem) =>
        Number(a.locations_shelf) - Number(b.locations_shelf),
    },
    {
      title: 'Slot',
      dataIndex: 'locations_slot',
      key: 'locations_slot',
      sorter: (a: TemperatureItem, b: TemperatureItem) =>
        Number(a.locations_slot) - Number(b.locations_slot),
    },
    {
      title: 'Native Name',
      dataIndex: 'nativeName',
      key: 'nativeName',
      sorter: (a: TemperatureItem, b: TemperatureItem) =>
        String(a.nativeName).localeCompare(String(b.nativeName)),
    },
    {
      title: 'Serial Number',
      dataIndex: 'installedSpec_serialNumber',
      key: 'installedSpec_serialNumber',
    },
    {
      title: 'Manufacturer',
      dataIndex: 'installedSpec_manufacturer',
      key: 'installedSpec_manufacturer',
    },
    {
      title: 'Chi tiết loại card',
      dataIndex: 'installedSpec_type',
      key: 'installedSpec_type',
    },
    {
      title: 'Part Number',
      dataIndex: 'installedSpec_partNumber',
      key: 'installedSpec_partNumber',
    },
    {
      title: 'Loại card',
      dataIndex: 'cardType',
      key: 'cardType',
      sorter: (a: TemperatureItem, b: TemperatureItem) =>
        String(a.cardType).localeCompare(String(b.cardType)),
    },
    {
      title: 'Ngưỡng (°C)',
      dataIndex: 'tempThreshold',
      key: 'tempThreshold',
    },
    {
      title: 'Thời gian cập nhật',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Nhiệt độ (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      sorter: (a: TemperatureItem, b: TemperatureItem) => a.temperature - b.temperature,
      render: (value: number, record: TemperatureItem) => (
        <span style={{ fontWeight: record.status !== 'normal' ? 600 : 400 }}>
          {value}°C
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #fff7e6 0%, #fff1f0 100%)',
          border: '1px solid #ffd8bf',
        }}
      >
        <Space size={16} wrap>
          <Card
            size="small"
            style={{
              minWidth: 260,
              borderColor: '#ffe58f',
              background: '#fffbe6',
            }}
          >
            <Statistic
              title="Warning: card có nhiệt độ > ngưỡng"
              value={stats.warning}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              prefix={<WarningOutlined />}
            />
          </Card>
          <Card
            size="small"
            style={{
              minWidth: 260,
              borderColor: '#ffa39e',
              background: '#fff1f0',
            }}
          >
            <Statistic
              title="Nguy hiểm: card có nhiệt độ > 70"
              value={stats.critical}
              valueStyle={{ color: '#cf1322', fontWeight: 700 }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Space>
      </Card>

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input
          placeholder="Tìm theo thiết bị, loại card, slot..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchData}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={loading}
        rowClassName={(record) => {
          const temperature = Number(record.temperature);
          const threshold = Number(record.tempThreshold ?? 0);

          if (temperature > 70) return 'temperature-row-critical';
          if (temperature > threshold) return 'temperature-row-warning';
          return '';
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số bản ghi: ${total}`,
        }}
        locale={{ emptyText: 'Chưa có dữ liệu nhiệt độ' }}
      />
    </div>
  );
};

export default TemperatureList;
