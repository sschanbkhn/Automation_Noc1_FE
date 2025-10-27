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
  const [activeTab, setActiveTab] = useState('dashboard'); // Tab state - default to dashboard
  
  // Dashboard states
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedToDate, setSelectedToDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New dashboard states for session/user data
  const [sessionUserData, setSessionUserData] = useState(null);
  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bngDataByLocation, setBngDataByLocation] = useState([]);
  
  // Chart line visibility states
  const [showXacThuc, setShowXacThuc] = useState(true);
  const [showVuotPhien, setShowVuotPhien] = useState(true);
  const [showDaXoa, setShowDaXoa] = useState(true);
  
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

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const response = await I003Service.GetSessionUserDashboardData(selectedFromDate, selectedToDate);
      
      if (response && response.Success && response.Data) {
        setSessionUserData(response.Data);
      } else {
        throw new Error(response?.Message || 'Không thể tải dữ liệu dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Lỗi khi tải dữ liệu dashboard: ' + (error.message || 'Không xác định'));
    } finally {
      setDashboardLoading(false);
    }
  }, [selectedFromDate, selectedToDate]);
  
  // Fetch location list
  const fetchLocationList = async () => {
    try {
      const response = await I003Service.GetLocationList();
      if (response && response.Success && response.Data) {
        setLocationList(response.Data);
      }
    } catch (error) {
      console.error('Error fetching location list:', error);
    }
  };
  
  // Fetch BNG data by location
  const fetchBNGDataByLocation = async (location, reportDate) => {
    try {
      const response = await I003Service.GetBNGDataByLocation(location, reportDate);
      if (response && response.Success && response.Data) {
        setBngDataByLocation(response.Data);
        console.log('BNG Data by Location:', response.Data);
      }
    } catch (error) {
      console.error('Error fetching BNG data by location:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
      fetchLocationList();
    } else if (activeTab === 'clear-multi') {
      fetchData();
    } else if (activeTab === 'clear-user') {
      fetchBngData();
    }
  }, [activeTab, fetchDashboardData]);

  // Auto-refresh dashboard data when date changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
      // Nếu đã chọn location, cập nhật dữ liệu location theo ngày mới
      if (selectedLocation) {
        fetchBNGDataByLocation(selectedLocation, selectedFromDate);
    }
    }
  }, [selectedFromDate, selectedToDate, activeTab, fetchDashboardData, selectedLocation]);

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
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'dashboard' ? '3px solid #1890ff' : '3px solid transparent',
              background: activeTab === 'dashboard' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'dashboard' ? '#1890ff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'dashboard' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.3s ease'
            }}
          >
            Dashboard
          </button>
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
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
        {/* Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, margin: 0 }}>Thống kê session đa phiên ngày hôm trước (T-1)</h3>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 500, fontSize: 14 }}>Từ ngày:</label>
            <input
              type="date"
              value={selectedFromDate}
              onChange={(e) => setSelectedFromDate(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14
              }}
            />
            <label style={{ fontWeight: 500, fontSize: 14 }}>Đến ngày:</label>
            <input
              type="date"
              value={selectedToDate}
              onChange={(e) => setSelectedToDate(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14
              }}
            />
            <button
              onClick={fetchDashboardData}
              disabled={dashboardLoading}
              style={{
                padding: '6px 16px',
                background: dashboardLoading ? '#94a3b8' : '#1890ff',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 14,
                cursor: dashboardLoading ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {dashboardLoading ? 'Đang tải...' : 'Cập nhật'}
            </button>
          </div>
        </div>
        
        {dashboardLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 16, color: '#666' }}>Đang tải dữ liệu dashboard...</div>
          </div>
        ) : sessionUserData ? (
          <div>
            {/* Two Pie Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 30 }}>
              {/* Session Pie Chart */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151', textAlign: 'center' }}>
                  Thống kê session đa phiên ngày hôm trước (T-1)
                </h4>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
                  {selectedFromDate === selectedToDate 
                    ? `Ngày: ${selectedFromDate}`
                    : `Từ ${selectedFromDate} đến ${selectedToDate}`
                  }
                </div>
                
                {/* Pie Chart Visualization */}
                <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 20px' }}>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    
                    {/* Session data pie slices */}
                    {(() => {
                      // Sử dụng dữ liệu thực từ API
                      const total = sessionUserData.SessionData?.TongSoSessionXacThuc || 0;
                      const vuotPhien = sessionUserData.SessionData?.SoSessionVuotPhien || 0;
                      const daXoa = sessionUserData.SessionData?.SoSessionDaXoa || 0;
                      
                      // Tính toán đúng theo logic business
                      const xacThuc = total - vuotPhien; // Session bình thường
                      
                      const xacThucAngle = (xacThuc / total) * 360;
                      const vuotPhienAngle = (vuotPhien / total) * 360;
                      const daXoaAngle = (daXoa / total) * 360;
                      
                      let currentAngle = 0;
                      const radius = 70;
                      
                      const createPath = (startAngle, endAngle, color) => {
                        if (endAngle - startAngle <= 0) return null;
                        
                        const start = (startAngle - 90) * (Math.PI / 180);
                        const end = (endAngle - 90) * (Math.PI / 180);
                        
                        const x1 = 100 + radius * Math.cos(start);
                        const y1 = 100 + radius * Math.sin(start);
                        const x2 = 100 + radius * Math.cos(end);
                        const y2 = 100 + radius * Math.sin(end);
                        
                        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={`session-${startAngle}`}
                            d={`M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={color}
                            stroke="#fff"
                            strokeWidth="2"
                          />
                        );
                      };
                      
                      const paths = [];
                      
                      // 1. Xác thực (green - phần lớn nhất ~95.5%)
                      if (xacThucAngle > 0) {
                        paths.push(createPath(currentAngle, currentAngle + xacThucAngle, '#22c55e'));
                        currentAngle += xacThucAngle;
                      }
                      
                      // 2. Vượt phiên (red - ~4.5%)
                      if (vuotPhienAngle > 0) {
                        paths.push(createPath(currentAngle, currentAngle + vuotPhienAngle, '#ef4444'));
                        currentAngle += vuotPhienAngle;
                      }
                      
                      // 3. Đã xóa (orange - ~1.2%) - riêng biệt
                      if (daXoaAngle > 0) {
                        paths.push(createPath(currentAngle, currentAngle + daXoaAngle, '#f97316'));
                      }
                      
                      return paths.filter(path => path !== null);
                    })()}
                    
                    {/* Center text */}
                    <text x="100" y="95" textAnchor="middle" fontSize="12" fill="#6b7280">Tổng số session xác thực</text>
                    <text x="100" y="110" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#374151">
                      {(sessionUserData.SessionData?.TongSoSessionXacThuc || 0).toLocaleString()}
                    </text>
                    <text x="100" y="125" textAnchor="middle" fontSize="10" fill="#6b7280">100%</text>
                  </svg>
              </div>
              
                {/* Session Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Số Session Vượt phiên</span>
                </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        {(sessionUserData.SessionData?.SoSessionVuotPhien || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {sessionUserData.SessionData?.TongSoSessionXacThuc > 0 
                          ? ((sessionUserData.SessionData.SoSessionVuotPhien / sessionUserData.SessionData.TongSoSessionXacThuc) * 100).toFixed(1)
                    : '0'
                  }%
                      </div>
                </div>
              </div>
              
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, background: '#f97316', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Số Session Đã xóa</span>
                </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        {(sessionUserData.SessionData?.SoSessionDaXoa || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {sessionUserData.SessionData?.TongSoSessionXacThuc > 0 
                          ? ((sessionUserData.SessionData.SoSessionDaXoa / sessionUserData.SessionData.TongSoSessionXacThuc) * 100).toFixed(1)
                    : '0'
                  }%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* User Pie Chart */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151', textAlign: 'center' }}>
                  Thống kê user đa phiên ngày hôm trước (T-1)
                </h4>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
                  {selectedFromDate === selectedToDate 
                    ? `Ngày: ${selectedFromDate}`
                    : `Từ ${selectedFromDate} đến ${selectedToDate}`
                  }
                </div>
                
                {/* User Pie Chart Visualization */}
                <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 20px' }}>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    
                    {/* User data pie slices */}
                    {(() => {
                      // Sử dụng dữ liệu thực từ API
                      const total = sessionUserData.UserData?.TongSoUserXacThuc || 0;
                      const vuotPhien = sessionUserData.UserData?.SoUserVuotPhien || 0;
                      const daBiClear = sessionUserData.UserData?.SoUserDaBiClear || 0;
                      
                      // Tính toán đúng theo logic business
                      const xacThuc = total - vuotPhien; // User bình thường
                      
                      const xacThucAngle = (xacThuc / total) * 360;
                      const vuotPhienAngle = (vuotPhien / total) * 360;
                      const daBiClearAngle = (daBiClear / total) * 360;
                      
                      let currentAngle = 0;
                      const radius = 70;
                      
                      const createPath = (startAngle, endAngle, color) => {
                        if (endAngle - startAngle <= 0) return null;
                        
                        const start = (startAngle - 90) * (Math.PI / 180);
                        const end = (endAngle - 90) * (Math.PI / 180);
                        
                        const x1 = 100 + radius * Math.cos(start);
                        const y1 = 100 + radius * Math.sin(start);
                        const x2 = 100 + radius * Math.cos(end);
                        const y2 = 100 + radius * Math.sin(end);
                        
                        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={`user-${startAngle}`}
                            d={`M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={color}
                            stroke="#fff"
                            strokeWidth="2"
                          />
                        );
                      };
                      
                      const paths = [];
                      
                      // 1. Xác thực (green - phần lớn nhất ~94.7%)
                      if (xacThucAngle > 0) {
                        paths.push(createPath(currentAngle, currentAngle + xacThucAngle, '#22c55e'));
                        currentAngle += xacThucAngle;
                      }
                      
                      // 2. Vượt phiên (red - ~5.3%)
                      if (vuotPhienAngle > 0) {
                        paths.push(createPath(currentAngle, currentAngle + vuotPhienAngle, '#ef4444'));
                        currentAngle += vuotPhienAngle;
                      }
                      
                      // 3. Đã bị clear (orange - ~1.6%) - riêng biệt
                      if (daBiClearAngle > 0) {
                        paths.push(createPath(currentAngle, currentAngle + daBiClearAngle, '#f97316'));
                      }
                      
                      return paths.filter(path => path !== null);
                    })()}
                    
                    {/* Center text */}
                    <text x="100" y="95" textAnchor="middle" fontSize="12" fill="#6b7280">Tổng số user xác thực</text>
                    <text x="100" y="110" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#374151">
                      {(sessionUserData.UserData?.TongSoUserXacThuc || 0).toLocaleString()}
                    </text>
                    <text x="100" y="125" textAnchor="middle" fontSize="10" fill="#6b7280">100%</text>
                  </svg>
                </div>
                
                {/* User Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Số user vượt phiên</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        {(sessionUserData.UserData?.SoUserVuotPhien || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {sessionUserData.UserData?.TongSoUserXacThuc > 0 
                          ? ((sessionUserData.UserData.SoUserVuotPhien / sessionUserData.UserData.TongSoUserXacThuc) * 100).toFixed(1)
                    : '0'
                  }%
                </div>
              </div>
            </div>
            
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, background: '#f97316', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Số user đã bị clear</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        {(sessionUserData.UserData?.SoUserDaBiClear || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {sessionUserData.UserData?.TongSoUserXacThuc > 0 
                          ? ((sessionUserData.UserData.SoUserDaBiClear / sessionUserData.UserData.TongSoUserXacThuc) * 100).toFixed(1)
                          : '0'
                        }%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Section */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: 0 }}>Biểu đồ theo dõi thuê bao theo ngày</h4>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    Khoảng thời gian: {selectedFromDate === selectedToDate 
                      ? selectedFromDate
                      : `${selectedFromDate} - ${selectedToDate}`
                    }
                  </div>
                </div>
                
                {/* Location Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Phạm vi:</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      if (e.target.value) {
                        // Call API với ngày được chọn
                        fetchBNGDataByLocation(e.target.value, selectedFromDate);
                      } else {
                        // Reset về dữ liệu tổng
                        setBngDataByLocation([]);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      fontSize: 14,
                      minWidth: 150
                    }}
                  >
                    <option value="">Tổng</option>
                    {locationList.map((location, idx) => (
                      <option key={idx} value={location.location}>
                        {location.bng_name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Checkboxes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                      <input 
                        type="checkbox" 
                        checked={showXacThuc}
                        onChange={(e) => setShowXacThuc(e.target.checked)}
                        style={{ marginRight: 4 }} 
                      />
                      Xác thực
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                      <input 
                        type="checkbox" 
                        checked={showVuotPhien}
                        onChange={(e) => setShowVuotPhien(e.target.checked)}
                        style={{ marginRight: 4 }} 
                      />
                      Vượt phiên
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                      <input 
                        type="checkbox" 
                        checked={showDaXoa}
                        onChange={(e) => setShowDaXoa(e.target.checked)}
                        style={{ marginRight: 4 }} 
                      />
                      Đã xóa
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Chart Area - Line Chart */}
              <div style={{ height: 300, position: 'relative', padding: '20px' }}>
                {/* Chart Container */}
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* Y-axis labels - Dynamic based on data */}
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', paddingRight: 10 }}>
                    {(() => {
                      const chartDataToUse = selectedLocation && bngDataByLocation.length > 0 
                        ? bngDataByLocation.map((item, idx) => ({
                            XacThuc: item.XacThuc || 0,
                            VuotPhien: item.VuotPhien || 0,
                            DaXoa: item.DaXoa || 0
                          }))
                        : sessionUserData.ChartData || [];
                      
                      if (chartDataToUse.length === 0) {
                        return [<div key="0">0</div>];
                      }
                      
                      const allValues = chartDataToUse.flatMap(item => [item.XacThuc, item.VuotPhien, item.DaXoa]);
                      const maxValue = Math.max(...allValues, 10000);
                      
                      return [
                        <div key="max">{Math.round(maxValue).toLocaleString()}</div>,
                        <div key="75">{Math.round(maxValue * 0.75).toLocaleString()}</div>,
                        <div key="50">{Math.round(maxValue * 0.5).toLocaleString()}</div>,
                        <div key="25">{Math.round(maxValue * 0.25).toLocaleString()}</div>,
                        <div key="0">0</div>
                      ];
                    })()}
                  </div>
                  
                  {/* Chart SVG */}
                  <div style={{ marginLeft: 40, height: '100%', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox="0 0 800 260" style={{ overflow: 'visible' }}>
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <line
                          key={`grid-${i}`}
                          x1="0"
                          y1={i * 65}
                          x2="800"
                          y2={i * 65}
                          stroke="#f3f4f6"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Data lines */}
                      {(() => {
                        const chartDataToUse = selectedLocation && bngDataByLocation.length > 0 
                          ? bngDataByLocation.map((item, idx) => ({
                              Date: item.bng_name || `BNG ${idx + 1}`,
                              BngName: item.bng_name || `BNG ${idx + 1}`,
                              ProvinceName: item.province_name || '',
                              Location: item.location || '',
                              XacThuc: item.XacThuc || 0,
                              VuotPhien: item.VuotPhien || 0,
                              DaXoa: item.DaXoa || 0
                            }))
                          : sessionUserData.ChartData || [];
                        
                        if (chartDataToUse.length === 0) return null;
                        
                        // Tìm max value để scale đúng
                        const allValues = chartDataToUse.flatMap(item => [item.XacThuc, item.VuotPhien, item.DaXoa]);
                        const maxValue = Math.max(...allValues, 10000);
                        
                        // Tính toán vị trí X đúng - chia đều trên width
                        const chartWidth = 800;
                        const chartHeight = 260;
                        const stepX = chartDataToUse.length > 1 ? chartWidth / (chartDataToUse.length - 1) : chartWidth / 2;
                        
                        // Xác thực line (blue)
                        const xacThucPoints = chartDataToUse.map((item, idx) => {
                          const x = idx * stepX;
                          const y = chartHeight - ((item.XacThuc / maxValue) * chartHeight);
                          return `${x},${Math.max(0, y)}`;
                        }).join(' ');
                        
                        // Vượt phiên line (red)
                        const vuotPhienPoints = chartDataToUse.map((item, idx) => {
                          const x = idx * stepX;
                          const y = chartHeight - ((item.VuotPhien / maxValue) * chartHeight);
                          return `${x},${Math.max(0, y)}`;
                        }).join(' ');
                        
                        // Đã xóa line (orange)
                        const daXoaPoints = chartDataToUse.map((item, idx) => {
                          const x = idx * stepX;
                          const y = chartHeight - ((item.DaXoa / maxValue) * chartHeight);
                          return `${x},${Math.max(0, y)}`;
                        }).join(' ');
                        
                        return (
                          <>
                            {/* Xác thực line - chỉ hiển thị khi checkbox được check */}
                            {showXacThuc && (
                              <polyline
                                points={xacThucPoints}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            
                            {/* Vượt phiên line - chỉ hiển thị khi checkbox được check */}
                            {showVuotPhien && (
                              <polyline
                                points={vuotPhienPoints}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            
                            {/* Đã xóa line - chỉ hiển thị khi checkbox được check */}
                            {showDaXoa && (
                              <polyline
                                points={daXoaPoints}
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            
                            {/* Data points */}
                            {chartDataToUse.map((item, idx) => {
                              const x = idx * stepX;
                              const xacThucY = chartHeight - ((item.XacThuc / maxValue) * chartHeight);
                              const vuotPhienY = chartHeight - ((item.VuotPhien / maxValue) * chartHeight);
                              const daXoaY = chartHeight - ((item.DaXoa / maxValue) * chartHeight);
                              
                              return (
                                <g key={`points-${idx}`}>
                                  {/* Xác thực point - chỉ hiển thị khi checkbox được check */}
                                  {showXacThuc && (
                                    <circle cx={x} cy={Math.max(0, xacThucY)} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2"/>
                                  )}
                                  
                                  {/* Vượt phiên point - chỉ hiển thị khi checkbox được check */}
                                  {showVuotPhien && (
                                    <circle cx={x} cy={Math.max(0, vuotPhienY)} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2"/>
                                  )}
                                  
                                  {/* Đã xóa point - chỉ hiển thị khi checkbox được check */}
                                  {showDaXoa && (
                                    <circle cx={x} cy={Math.max(0, daXoaY)} r="4" fill="#f97316" stroke="#fff" strokeWidth="2"/>
                                  )}
                                  
                                  {/* X-axis labels */}
                                  <text x={x} y="280" textAnchor="middle" fontSize="10" fill="#6b7280">
                                    {item.Date}
                                  </text>
                                  
                                  {/* Tooltip trigger area */}
                                  <rect
                                    x={x - 15}
                                    y="0"
                                    width="30"
                                    height={chartHeight}
                                    fill="transparent"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={(e) => {
                                      // Show tooltip
                                      const tooltip = document.getElementById(`chart-tooltip-${idx}`);
                                      if (tooltip) {
                                        tooltip.style.opacity = '1';
                                        tooltip.style.left = `${x + 40}px`; // Adjust for margin
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      // Hide tooltip
                                      const tooltip = document.getElementById(`chart-tooltip-${idx}`);
                                      if (tooltip) tooltip.style.opacity = '0';
                                    }}
                                  />
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                    
                    {/* Tooltips */}
                    {(() => {
                      const chartDataToUse = selectedLocation && bngDataByLocation.length > 0 
                        ? bngDataByLocation.map((item, idx) => ({
                            Date: item.bng_name || `BNG ${idx + 1}`,
                            BngName: item.bng_name || `BNG ${idx + 1}`,
                            ProvinceName: item.province_name || '',
                            Location: item.location || '',
                            XacThuc: item.XacThuc || 0,
                            VuotPhien: item.VuotPhien || 0,
                            DaXoa: item.DaXoa || 0
                          }))
                        : sessionUserData.ChartData || [];
                        
                      return chartDataToUse.map((item, idx) => (
                        <div
                          key={`tooltip-${idx}`}
                          id={`chart-tooltip-${idx}`}
                        style={{ 
                          position: 'absolute',
                            top: '-100px',
                          transform: 'translateX(-50%)',
                          background: '#1f2937',
                          color: '#fff',
                            padding: '12px 16px',
                            borderRadius: 8,
                            fontSize: 12,
                          whiteSpace: 'nowrap',
                          opacity: 0,
                          pointerEvents: 'none',
                          transition: 'opacity 0.3s ease',
                          zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            border: '1px solid #374151'
                          }}
                        >
                          {item.BngName && (
                            <div style={{ fontWeight: 600, marginBottom: 4, color: '#60a5fa' }}>
                              {item.BngName}
                      </div>
                          )}
                          {item.ProvinceName && (
                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                              {item.ProvinceName} ({item.Location})
                        </div>
                          )}
                          <div style={{ borderTop: '1px solid #4b5563', paddingTop: 6 }}>
                            {showXacThuc && (
                              <div>Xác thực: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{item.XacThuc?.toLocaleString()}</span></div>
                            )}
                            {showVuotPhien && (
                              <div>Vượt phiên: <span style={{ color: '#ef4444', fontWeight: 600 }}>{item.VuotPhien?.toLocaleString()}</span></div>
                            )}
                            {showDaXoa && (
                              <div>Đã xóa: <span style={{ color: '#f97316', fontWeight: 600 }}>{item.DaXoa?.toLocaleString()}</span></div>
                          )}
                        </div>
                      </div>
                      ));
                    })()}
                    </div>
                </div>
                </div>
              
              {/* Chart Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: showXacThuc ? 1 : 0.4 }}>
                  <div style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: 2 }}></div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Xác thực</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: showVuotPhien ? 1 : 0.4 }}>
                  <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }}></div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Vượt phiên</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: showDaXoa ? 1 : 0.4 }}>
                  <div style={{ width: 12, height: 12, background: '#f97316', borderRadius: 2 }}></div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Đã xóa</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 16, color: '#666' }}>Không có dữ liệu</div>
          </div>
        )}
      </div>
      )}
      
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