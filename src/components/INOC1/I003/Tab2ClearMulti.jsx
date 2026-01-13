import React, { useState, useEffect } from 'react';
import CtrlDialog from 'components/common/CtrlDialog';
import I003Service from 'services/I003Service';

export default function Tab2ClearMulti({ activeTab, onModalOpen }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await I003Service.GetBNGData();
      
      if (response && response.Success && response.Data) {
        const transformedData = response.Data.map((item, idx) => ({
          id: idx + 1,
          provinceCode: item.location || 'N/A',
          provinceName: item.province_name || 'N/A',
          device: item.bng_name || 'N/A',
          overSession: item.bng_over_session ? item.bng_over_session.toLocaleString() : '0',
          clearedSession: item.bng_cleared_session ? item.bng_cleared_session.toLocaleString() : '0',
          frequency: item.bng_clear_frequency || 7,
          ipLoopback: item.bng_ip ? item.bng_ip.replace('/32', '') : 'N/A',
          originalData: item,
          key: idx,
        }));
        setData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching BNG data:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.message || 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  // Clear session function
  const handleClearSession = async (row) => {
    if (!row.ipLoopback || row.ipLoopback === 'N/A') {
      alert('IP không hợp lệ!');
      return;
    }

    setClearing(prev => ({ ...prev, [row.id]: true }));
    
    try {
      const response = await I003Service.ClearOverLimitSession(row.ipLoopback);

      if (response && response.Success) {
        const result = response.Data;
        let message = '';
        if (result && typeof result === 'object') {
          if (result.Message) {
            message = result.Message;
          } else if (result.StatusCode && result.Data && result.Data.BngIp) {
            message = `Clear over limit sessions on BNG ${result.Data.BngIp} started in background.`;
          } else {
            message = 'Clear session started successfully.';
          }
        } else {
          message = 'Clear session completed successfully.';
        }
        
        alert(`Thành công!\nIP: ${row.ipLoopback}\nThông điệp: ${message}`);
        setModalOpen(false);
        
        setTimeout(() => {
          fetchData();
        }, 2000);
      } else {
        throw new Error(response?.Message || 'Không thể thực hiện clear session');
      }
    } catch (error) {
      console.error('Error clearing session:', error);
      alert('Lỗi khi clear session: ' + (error.message || 'Không xác định'));
    } finally {
      setClearing(prev => ({ ...prev, [row.id]: false }));
    }
  };

  // Sorting function
  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Sort data
  const getSortedData = (data) => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'overSession' || sortField === 'clearedSession') {
        aValue = parseInt(aValue.replace(/,/g, '')) || 0;
        bValue = parseInt(bValue.replace(/,/g, '')) || 0;
      } else if (sortField === 'frequency') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'clear-multi') {
      fetchData();
    }
  }, [activeTab]);

  // Pagination calculations with sorting
  const sortedData = getSortedData(data);
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const columns = [
    'Mã tỉnh',
    'Tên tỉnh', 
    'Thiết bị',
    'Số thuê bao vượt phiên',
    'Số thuê bao bị xóa',
    'Tần suất / ngày',
    'Action'
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 18 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 16, color: '#666' }}>Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {columns.map((col, idx) => (
                  <th 
                    key={idx}
                    onClick={() => col !== 'Action' && handleSort(col === 'Mã tỉnh' ? 'provinceCode' : col === 'Tên tỉnh' ? 'provinceName' : col === 'Thiết bị' ? 'device' : col === 'Số thuê bao vượt phiên' ? 'overSession' : col === 'Số thuê bao bị xóa' ? 'clearedSession' : col === 'Tần suất / ngày' ? 'frequency' : '')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: idx < columns.length - 1 ? '1px solid #e2e8f0' : 'none',
                      cursor: col !== 'Action' ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {col}
                    {sortField && col === (sortField === 'provinceCode' ? 'Mã tỉnh' : sortField === 'provinceName' ? 'Tên tỉnh' : sortField === 'device' ? 'Thiết bị' : sortField === 'overSession' ? 'Số thuê bao vượt phiên' : sortField === 'clearedSession' ? 'Số thuê bao bị xóa' : sortField === 'frequency' ? 'Tần suất / ngày' : '') && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#6b7280',
                    fontSize: 16
                  }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr 
                    key={row.id} 
                    style={{ borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>{row.provinceCode}</td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>{row.provinceName}</td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>{row.device}</td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                      <span style={{ 
                        color: parseInt(row.overSession.replace(/,/g, '')) > 0 ? '#dc2626' : '#16a34a',
                        fontWeight: 600 
                      }}>
                        {row.overSession}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                      <span style={{ 
                        color: parseInt(row.clearedSession.replace(/,/g, '')) > 0 ? '#2563eb' : '#6b7280',
                        fontWeight: 600 
                      }}>
                        {row.clearedSession}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                      <span style={{
                        border: '1px solid #22c55e',
                        color: '#22c55e',
                        borderRadius: 16,
                        padding: '2px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12
                      }}>
                        {row.frequency}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <button
                        style={{ 
                          background: clearing[row.id] ? '#94a3b8' : '#2563eb', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          padding: '6px 18px', 
                          cursor: clearing[row.id] ? 'not-allowed' : 'pointer',
                          opacity: clearing[row.id] ? 0.6 : 1,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                        onClick={() => { 
                          if (!clearing[row.id]) {
                            setModalRow(row); 
                            setModalOpen(true); 
                          }
                        }}
                        disabled={clearing[row.id]}
                      >
                        {clearing[row.id] ? 'Đang xử lý...' : 'Clear'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination Controls */}
      {sortedData.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '20px',
          padding: '0 8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Hiển thị:</span>
            <select 
              value={pageSize} 
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: 14
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              / trang ({startIndex + 1}-{Math.min(endIndex, sortedData.length)} của {sortedData.length} bản ghi)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}
              style={{ padding: '6px 10px', border: '1px solid #d1d5db', background: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px', fontSize: 14 }}>
              ««
            </button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
              style={{ padding: '6px 10px', border: '1px solid #d1d5db', background: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px', fontSize: 14 }}>
              «
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              
              if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                return (
                  <button key={page} onClick={() => handlePageChange(page)}
                    style={{ padding: '6px 10px', border: '1px solid #d1d5db', background: isCurrentPage ? '#2563eb' : '#fff', color: isCurrentPage ? '#fff' : '#374151', cursor: 'pointer', borderRadius: '4px', fontSize: 14, fontWeight: isCurrentPage ? 600 : 400 }}>
                    {page}
                  </button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} style={{ padding: '6px 4px', color: '#9ca3af' }}>...</span>;
              }
              return null;
            })}

            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
              style={{ padding: '6px 10px', border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f9fafb' : '#fff', color: currentPage === totalPages ? '#9ca3af' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '4px', fontSize: 14 }}>
              »
            </button>
            
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}
              style={{ padding: '6px 10px', border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f9fafb' : '#fff', color: currentPage === totalPages ? '#9ca3af' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '4px', fontSize: 14 }}>
              »»
            </button>
          </div>
        </div>
      )}

      {/* Clear Session Confirmation Modal */}
      <CtrlDialog
        title="Xác nhận Clear Session"
        dialogVisible={modalOpen}
        onCancel={() => setModalOpen(false)}
        size="small"
      >
        {modalRow && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <strong>Thiết bị:</strong> {modalRow.device}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>IP:</strong> {modalRow.ipLoopback}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Số thuê bao vượt phiên:</strong> {modalRow.overSession}
            </div>
            <div style={{ color: '#f59e0b', marginBottom: 16 }}>
              ⚠️ Bạn có chắc chắn muốn thực hiện clear session cho thiết bị này không?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                style={{ 
                  background: '#22c55e', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  padding: '8px 16px',
                  cursor: clearing[modalRow.id] ? 'not-allowed' : 'pointer',
                  opacity: clearing[modalRow.id] ? 0.6 : 1
                }} 
                onClick={() => handleClearSession(modalRow)}
                disabled={clearing[modalRow.id]}
              >
                {clearing[modalRow.id] ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button 
                style={{ 
                  background: '#ef4444', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  padding: '8px 16px',
                  cursor: 'pointer'
                }} 
                onClick={() => setModalOpen(false)}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        )}
      </CtrlDialog>
    </div>
  );
}
