import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Pagination } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

// Sample data
const rawData = Array.from({ length: 66 }, (_, i) => ({
  key: i,
  code: ['NET', 'MED', 'AGG', 'BDG'][i % 4],
  province: ['VNPT NET', 'VNPT MEDIA', 'An Giang', 'Binh Duong'][i % 4],
  totalScore: 5,
  totalPercent: (98 + Math.random()).toFixed(6),
  mbbQoS: (98 + Math.random()).toFixed(2),
  fbbQoS: (98 + Math.random()).toFixed(2),
  mytvQoS: (98 + Math.random()).toFixed(2),
  totalQoE: (98 + Math.random()).toFixed(6),
}));

const QoSTable = () => {
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-07-01');
  const [dateTo, setDateTo] = useState('2024-07-23');
  

  const filteredData = useMemo(() => {
    return rawData.filter(item =>
      item.province.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const columns = [
    { title: 'STT', dataIndex: 'key', key: 'key', sorter: (a, b) => a.key - b.key },
    { title: 'Mã', dataIndex: 'code', key: 'code', sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: 'Tỉnh thành phố', dataIndex: 'province', key: 'province', sorter: (a, b) => a.province.localeCompare(b.province) },
    { title: 'Điểm', dataIndex: 'totalScore', key: 'totalScore', sorter: (a, b) => a.totalScore - b.totalScore },
    { title: '% QoS', dataIndex: 'totalPercent', key: 'totalPercent', sorter: (a, b) => a.totalPercent - b.totalPercent },
    { title: 'MBB QoS', dataIndex: 'mbbQoS', key: 'mbbQoS', sorter: (a, b) => a.mbbQoS - b.mbbQoS },
    { title: 'FBB QoS', dataIndex: 'fbbQoS', key: 'fbbQoS', sorter: (a, b) => a.fbbQoS - b.fbbQoS },
    { title: 'MyTV QoS', dataIndex: 'mytvQoS', key: 'mytvQoS', sorter: (a, b) => a.mytvQoS - b.mytvQoS },
    { title: 'QoE Tổng', dataIndex: 'totalQoE', key: 'totalQoE', sorter: (a, b) => a.totalQoE - b.totalQoE },
    { title: 'Thời gian', key: 'time', render: () => `${dayjs(dateFrom).format('DD/MM/YYYY')} - ${dayjs(dateTo).format('DD/MM/YYYY')}` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Input.Search placeholder="Tìm kiếm tỉnh, mã" onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={false}
        bordered
        size="middle"
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={page => setCurrentPage(page)}
        />
        <Select defaultValue={pageSize} onChange={value => setPageSize(value)}>
          {[5, 10, 25, 50, 100, filteredData.length].map(opt => (
            <Option key={opt} value={opt}>{opt === filteredData.length ? 'Tất cả' : opt}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default QoSTable;
