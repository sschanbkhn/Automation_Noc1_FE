import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Pagination } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

// Sample data
const rawData = Array.from({ length: 66 }, (_, i) => ({
  key: i,
  nameLSP: ['NET', 'MED', 'AGG', 'BDG'][i % 4],
  nameFrom: ['VNPT NET', 'VNPT MEDIA', 'An Giang', 'Binh Duong'][i % 4],
  ipFrom: 5,
  nameTo: ['98.875439', '98.650247', '98.577126', '98.049553'][i % 4],
  ipTo: ['98.06', '98.10', '98.16', '98.18'][i % 4],
  status: parseFloat((98 + Math.random()).toFixed(2)),
  bandwidth: parseFloat((98 + Math.random()).toFixed(2)),
  path: parseFloat((98 + Math.random()).toFixed(6)),
  delay: parseFloat((98 + Math.random()).toFixed(6)),
  lastUpdate: `01/07/2024 - 23/07/2024`
}));

const DataLSP = () => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-07-01');
  const [dateTo, setDateTo] = useState('2024-07-23');

  const filteredData = useMemo(() => {
    return rawData.filter(item =>
      item.nameFrom.toLowerCase().includes(search.toLowerCase()) ||
      item.nameLSP.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const columns = [
    { title: 'STT', dataIndex: 'key', key: 'key', sorter: (a, b) => a.key - b.key },
    { title: 'Name LSP', dataIndex: 'nameLSP', key: 'nameLSP', sorter: (a, b) => a.nameLSP.localeCompare(b.nameLSP) },
    { title: 'Name From', dataIndex: 'nameFrom', key: 'nameFrom', sorter: (a, b) => a.nameFrom.localeCompare(b.nameFrom) },
    { title: 'IP From', dataIndex: 'ipFrom', key: 'ipFrom' },
    { title: 'Name To', dataIndex: 'nameTo', key: 'nameTo' },
    { title: 'IP To', dataIndex: 'ipTo', key: 'ipTo' },
    { title: 'Status', dataIndex: 'status', key: 'status', sorter: (a, b) => a.status - b.status },
    { title: 'Bandwidth RSVP', dataIndex: 'bandwidth', key: 'bandwidth', sorter: (a, b) => a.bandwidth - b.bandwidth },
    { title: 'Path', dataIndex: 'path', key: 'path', sorter: (a, b) => a.path - b.path },
    { title: 'Delay', dataIndex: 'delay', key: 'delay', sorter: (a, b) => a.delay - b.delay },
    { title: 'Last Update', dataIndex: 'lastUpdate', key: 'lastUpdate', render: () => `${dayjs(dateFrom).format('DD/MM/YYYY')} - ${dayjs(dateTo).format('DD/MM/YYYY')}` },
  ];

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1); // reset to page 1 when pageSize changes
  };

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
        scroll={{ x: 'max-content' }}
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={page => setCurrentPage(page)}
          showSizeChanger={false}
        />
        <Select value={pageSize} onChange={handlePageSizeChange} style={{ width: 120 }}>
          {[5, 10, 25, 50, 100, filteredData.length].map(opt => (
            <Option key={opt} value={opt}>{opt === filteredData.length ? 'Tất cả' : `${opt} / page`}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default DataLSP;
