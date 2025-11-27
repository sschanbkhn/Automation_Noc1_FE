import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface NodeItem {
  id: string | number;
  node_name: string;
  ip_address: string;
  connectivity: string;
}

const ManageNode: React.FC = () => {
  const [nodeItems, setNodeItems] = useState<NodeItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/managenode');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('ManageNode API response:', result);
      
      // API trả về array đơn giản
      let nodes: NodeItem[] = [];
      if (Array.isArray(result)) {
        nodes = result;
      } else if (result.data && Array.isArray(result.data)) {
        nodes = result.data;
      }
      
      setNodeItems(nodes);
      message.success(`Tải ${nodes.length} thiết bị thành công`);
    } catch (error) {
      console.error('Error fetching nodes:', error);
      message.error('Lỗi khi tải dữ liệu thiết bị');
      setNodeItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  // Filter data based on search text
  const filteredData = nodeItems.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      (item.node_name?.toLowerCase() || '').includes(searchLower) ||
      (item.ip_address || '').includes(searchText) ||
      (item.connectivity?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Count Reachable and Unreachable
  const connectivityStats = useMemo(() => {
    let reachable = 0;
    let unreachable = 0;
    
    filteredData.forEach(item => {
      const connectivity = String(item.connectivity || '').toLowerCase().trim();
      if (connectivity.includes('reachable')) {
        reachable++;
      } else if (connectivity.includes('unreachable')) {
        unreachable++;
      }
    });
    
    return { reachable, unreachable };
  }, [filteredData]);

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (text: string, record: NodeItem, index: number) => index + 1,
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'node_name',
      key: 'node_name',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: `Trạng thái kết nối (Reachable: ${connectivityStats.reachable}, Unreachable: ${connectivityStats.unreachable})`,
      dataIndex: 'connectivity',
      key: 'connectivity',
      render: (text: string) => {
        if (!text) return '-';
        const textLower = text.toLowerCase();
        // Highlight màu xanh lá cho "Reachable"
        if (textLower.includes('reachable')) {
          return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{text}</span>;
        }
        // Highlight màu đỏ cho "Unreachable" hoặc các trạng thái khác
        if (textLower.includes('unreachable')) {
          return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{text}</span>;
        }
        // Màu đỏ cho các trạng thái khác không phải Reachable
        return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{text}</span>;
      },
    },
  ];

  return (
    <div className="form-container">
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <Input.Search
          placeholder="Tìm kiếm tên thiết bị, IP, trạng thái kết nối..."
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" loading={loading} onClick={fetchNodes} icon={<ReloadOutlined />}>
          Làm mới
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record.id.toString()}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thiết bị`,
          }}
          loading={loading}
          bordered
          size="small"
        />
      </div>
    </div>
  );
};

export default ManageNode;
