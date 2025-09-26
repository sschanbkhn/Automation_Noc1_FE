import React, { useState, useEffect, useRef, useCallback } from 'react';
import CtrlDialog from 'components/common/CtrlDialog';
import I003Service from 'services/I003Service';

export default function ThuebaoDaphien() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [clearing, setClearing] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('clear-multi'); // Tab state
  
  // Sorting states
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  
  // Clear theo User states
  const [username, setUsername] = useState('');
  const [ipLoopback, setIpLoopback] = useState('');
  const [bngList, setBngList] = useState([]); // BNG data for select
  const [selectedBng, setSelectedBng] = useState(null); // Selected BNG object
  const [bngDropdownOpen, setBngDropdownOpen] = useState(false); // Dropdown state
  const [bngSearchTerm, setBngSearchTerm] = useState(''); // Search term for BNG
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [clearUserLoading, setClearUserLoading] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);
  
  const tableRef = useRef();

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await I003Service.GetBNGData();
      
      if (response && response.Success && response.Data) {
        // Transform the data to match frontend requirements
        const transformedData = response.Data.map((item, idx) => ({
          id: idx + 1,
          provinceCode: item.location || 'N/A',
          provinceName: item.province_name || 'N/A',
          device: item.bng_name || 'N/A',
          overSession: item.bng_over_session ? item.bng_over_session.toLocaleString() : '0', // Số vượt phiên
          clearedSession: item.bng_cleared_session ? item.bng_cleared_session.toLocaleString() : '0', // Số đã clear
          frequency: item.bng_clear_frequency || 7, // Tần xuất clear
          ipLoopback: item.bng_ip ? item.bng_ip.replace('/32', '') : 'N/A', // Remove /32 suffix
          originalData: item, // Keep original data for API calls
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
        
        // Handle different response formats
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
        
        // Optionally refresh data after a short delay to see updated counts
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

  // Fetch BNG data for dropdown
  const fetchBngData = async () => {
    try {
      const response = await I003Service.GetBNGData();
      
      if (response && response.Success && response.Data) {
        setBngList(response.Data);
      }
    } catch (error) {
      console.error('Error fetching BNG data for dropdown:', error);
    }
  };

  // Check One User function
  const handleCheckUser = async () => {
    if (!username.trim() || !selectedBng) {
      alert('Vui lòng nhập Username và chọn BNG!');
      return;
    }

    setCheckLoading(true);
    setCheckResult(null);
    
    try {
      const bngIp = selectedBng.bng_ip ? selectedBng.bng_ip.replace('/32', '') : '';
      const response = await I003Service.CheckOneUser(username.trim(), bngIp);
      
      if (response && response.Success && response.Data) {
        // Handle nested Data structure: response.Data.Data contains the actual user info
        const userData = response.Data.Data || response.Data;
        const messageData = response.Data.Message || '';
        
        // Create combined result for display
        const combinedResult = {
          ...userData,
          Message: messageData
        };
        
        setCheckResult(combinedResult);
      } else {
        throw new Error(response?.Message || 'Không thể check user');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      alert('Lỗi khi check user: ' + (error.message || 'Không xác định'));
    } finally {
      setCheckLoading(false);
    }
  };

  // Clear Over Limit One User function
  const handleClearUser = async () => {
    if (!username.trim() || !selectedBng) {
      alert('Vui lòng nhập Username và chọn BNG!');
      return;
    }

    setClearUserLoading(true);
    
    try {
      const bngIp = selectedBng.bng_ip ? selectedBng.bng_ip.replace('/32', '') : '';
      const response = await I003Service.ClearOverLimitOneUser(username.trim(), bngIp);
      
      if (response && response.Success) {
        const result = response.Data;
        const message = response.Message || 'Clear user completed successfully.';
        
        alert(`Thành công Clear User!\nUsername: ${result?.UserName || username}\nBNG IP: ${result?.BngIp || bngIp}\nThông điệp: ${message}`);
      } else {
        throw new Error(response?.Message || 'Không thể clear user');
      }
    } catch (error) {
      console.error('Error clearing user:', error);
      alert('Lỗi khi clear user: ' + (error.message || 'Không xác định'));
    } finally {
      setClearUserLoading(false);
    }
  };

  // Clear All One User function
  const handleClearAllUser = async () => {
    if (!username.trim() || !selectedBng) {
      alert('Vui lòng nhập Username và chọn BNG!');
      return;
    }

    setClearAllLoading(true);
    
    try {
      const bngIp = selectedBng.bng_ip ? selectedBng.bng_ip.replace('/32', '') : '';
      const response = await I003Service.ClearAllOneUser(username.trim(), bngIp);
      
      if (response && response.Success) {
        const result = response.Data;
        const message = response.Message || 'Clear all user completed successfully.';
        
        alert(`Thành công Clear All User!\nUsername: ${result?.UserName || username}\nBNG IP: ${result?.BngIp || bngIp}\nThông điệp: ${message}`);
      } else {
        throw new Error(response?.Message || 'Không thể clear all user');
      }
    } catch (error) {
      console.error('Error clearing all user:', error);
      alert('Lỗi khi clear all user: ' + (error.message || 'Không xác định'));
    } finally {
      setClearAllLoading(false);
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
      
      // Handle different data types
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

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'clear-multi') {
      fetchData();
    } else if (activeTab === 'clear-user') {
      fetchBngData();
    }
  }, [activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bngDropdownOpen && !event.target.closest('.bng-dropdown-container')) {
        setBngDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [bngDropdownOpen]);

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
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Table columns
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
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ color: '#1890ff', fontWeight: 700, fontSize: 22, margin: 0 }}>Thuê bao đa phiên</h2>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          <button
            onClick={() => setActiveTab('clear-multi')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'clear-multi' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'clear-multi' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'clear-multi' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'clear-multi' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Clear Đa Phiên
          </button>
          <button
            onClick={() => setActiveTab('clear-user')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'clear-user' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'clear-user' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'clear-user' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'clear-user' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Clear theo User
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'clear-multi' && (
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
                  <th 
                    onClick={() => handleSort('provinceCode')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    Mã tỉnh
                    {sortField === 'provinceCode' && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('provinceName')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    Tên tỉnh
                    {sortField === 'provinceName' && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('device')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    Thiết bị
                    {sortField === 'device' && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('overSession')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    Số vượt phiên
                    {sortField === 'overSession' && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('clearedSession')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    Số đã clear
                    {sortField === 'clearedSession' && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('frequency')}
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    Tần suất / ngày
                    {sortField === 'frequency' && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      fontWeight: 600, 
                      color: '#374151'
                    }}
                  >
                    Action
                  </th>
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
                  currentData.map((row, idx) => (
                    <tr 
                      key={row.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        '&:hover': { backgroundColor: '#f8fafc' }
                      }}
                    >
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                        {row.provinceCode}
                      </td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                        {row.provinceName}
                      </td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                        {row.device}
                      </td>
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
                          <svg width='14' height='14' viewBox='0 0 20 20' fill='none' style={{ marginRight: 2 }}>
                            <circle cx='10' cy='10' r='8' stroke='#22c55e' strokeWidth='2'/>
                            <path d='M10 5v5l3 3' stroke='#22c55e' strokeWidth='2' strokeLinecap='round'/>
                          </svg>
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
            {/* Page Size Selector */}
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

            {/* Pagination Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  background: currentPage === 1 ? '#f9fafb' : '#fff',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  fontSize: 14
                }}
              >
                ««
              </button>
              
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  background: currentPage === 1 ? '#f9fafb' : '#fff',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  fontSize: 14
                }}
              >
                «
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                
                // Show only a few pages around current page
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        background: isCurrentPage ? '#2563eb' : '#fff',
                        color: isCurrentPage ? '#fff' : '#374151',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: 14,
                        fontWeight: isCurrentPage ? 600 : 400
                      }}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 3 || 
                  page === currentPage + 3
                ) {
                  return <span key={page} style={{ padding: '6px 4px', color: '#9ca3af' }}>...</span>;
                }
                return null;
              })}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  background: currentPage === totalPages ? '#f9fafb' : '#fff',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  fontSize: 14
                }}
              >
                »
              </button>
              
              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  background: currentPage === totalPages ? '#f9fafb' : '#fff',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  fontSize: 14
                }}
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
      )}
      
      {/* Clear theo User Tab */}
      {activeTab === 'clear-user' && (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
        <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, marginBottom: 24, margin: 0 }}>Nhập thông tin thuê bao username:</h3>
        
        {/* Input Form */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 500, fontSize: 14, minWidth: 80 }}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="example"
              style={{
                padding: '8px 12px',
                border: '2px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                width: 200,
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <label style={{ fontWeight: 500, fontSize: 14, minWidth: 120 }}>IP Loopback BNG:</label>
            <div className="bng-dropdown-container" style={{ position: 'relative', width: 300 }}>
              <div
                onClick={() => setBngDropdownOpen(!bngDropdownOpen)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: '34px'
                }}
              >
                <span style={{ color: selectedBng ? '#374151' : '#9ca3af' }}>
                  {selectedBng 
                    ? `${selectedBng.bng_name || 'N/A'} - ${(selectedBng.bng_ip || '').replace('/32', '')}` 
                    : 'Chọn BNG...'}
                </span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>▼</span>
              </div>
              
              {bngDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  maxHeight: 200,
                  overflowY: 'auto'
                }}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm BNG..."
                    value={bngSearchTerm}
                    onChange={(e) => setBngSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderBottom: '1px solid #e5e7eb',
                      outline: 'none',
                      fontSize: 14
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {bngList
                    .filter(bng => {
                      const searchLower = bngSearchTerm.toLowerCase();
                      const bngName = (bng.bng_name || '').toLowerCase();
                      const bngIp = (bng.bng_ip || '').toLowerCase();
                      return bngName.includes(searchLower) || bngIp.includes(searchLower);
                    })
                    .map((bng, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedBng(bng);
                          setIpLoopback((bng.bng_ip || '').replace('/32', ''));
                          setBngDropdownOpen(false);
                          setBngSearchTerm('');
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          fontSize: 14,
                          ':hover': {
                            background: '#f9fafb'
                          }
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.background = '#fff'}
                      >
                        <div style={{ fontWeight: 500, color: '#374151' }}>
                          {bng.bng_name || 'N/A'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {(bng.bng_ip || '').replace('/32', '')}
                        </div>
                      </div>
                    ))}
                  
                  {bngList.filter(bng => {
                    const searchLower = bngSearchTerm.toLowerCase();
                    const bngName = (bng.bng_name || '').toLowerCase();
                    const bngIp = (bng.bng_ip || '').toLowerCase();
                    return bngName.includes(searchLower) || bngIp.includes(searchLower);
                  }).length === 0 && (
                    <div style={{ padding: '10px 12px', color: '#6b7280', fontSize: 14 }}>
                      Không tìm thấy BNG
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleCheckUser}
            disabled={checkLoading}
            style={{
              background: checkLoading ? '#94a3b8' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              cursor: checkLoading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: 14
            }}
          >
            {checkLoading ? 'Checking...' : 'Check'}
          </button>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />
        
        {/* Results Section */}
        {checkResult && (
          <div>
            <h4 style={{ color: '#1890ff', fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Thông tin chi tiết thuê bao:</h4>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button
                onClick={handleClearUser}
                disabled={clearUserLoading}
                style={{
                  background: clearUserLoading ? '#94a3b8' : '#06b6d4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: clearUserLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {clearUserLoading ? 'Clearing...' : 'Clear'}
              </button>
              
              <button
                onClick={handleClearAllUser}
                disabled={clearAllLoading}
                style={{
                  background: clearAllLoading ? '#94a3b8' : '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: clearAllLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {clearAllLoading ? 'Clearing All...' : 'Clear all'}
              </button>
            </div>
            
            {/* User Info Display */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>Username:</label>
                <input
                  type="text"
                  value={checkResult.UserName || 'N/A'}
                  readOnly
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    fontSize: 14,
                    background: '#f9fafb',
                    color: '#374151',
                    flex: 1
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>BRAS:</label>
                <input
                  type="text"
                  value={checkResult.BngName || 'N/A'}
                  readOnly
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    fontSize: 14,
                    background: '#f9fafb',
                    color: '#374151',
                    flex: 1
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>IP loop BRAS:</label>
                <input
                  type="text"
                  value={selectedBng ? (selectedBng.bng_ip || '').replace('/32', '') : ''}
                  readOnly
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    fontSize: 14,
                    background: '#f9fafb',
                    color: '#374151',
                    flex: 1
                  }}
                />
              </div>
            </div>
            
            {/* Session Info */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>Số phiên được cho phép:</span>
                <span style={{ 
                  color: '#16a34a', 
                  fontWeight: 600, 
                  fontSize: 18 
                }}>  
                  {checkResult.CurrentSession || '0'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>Số phiên đã được xác thực:</span>
                <span style={{ 
                  color: '#2563eb', 
                  fontWeight: 600, 
                  fontSize: 18 
                }}>
                  {checkResult.OverSession || '0'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>Số phiên vượt ngưỡng:</span>
                <span style={{ 
                  color: (checkResult.MaxSession || 0) > 0 ? '#dc2626' : '#16a34a', 
                  fontWeight: 600, 
                  fontSize: 18 
                }}>
                  {checkResult.MaxSession || '0'}
                </span>
              </div>
            </div>
            
            {/* Log Section */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: 500, fontSize: 14, color: '#374151', marginBottom: 8, display: 'block' }}>Log:</label>
              <textarea
                value={checkResult.Message ? checkResult.Message.replace(/\\n/g, '\n').replace(/\n/g, '\n') : 'No message available'}
                readOnly
                style={{
                  width: '100%',
                  minHeight: 300,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  color: '#374151',
                  resize: 'vertical',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
                placeholder="Please enter your work goals"
              />
            </div>
          </div>
        )}
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
              <strong>Số thuê bao vượt phiên:</strong> {modalRow.subNumber}
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