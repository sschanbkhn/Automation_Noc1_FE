import React, { useState, useEffect } from 'react';
import I003Service from 'services/I003Service';

export default function Tab3ClearUser({ activeTab }) {
  const [username, setUsername] = useState('');
  const [ipLoopback, setIpLoopback] = useState('');
  const [bngList, setBngList] = useState([]);
  const [selectedBng, setSelectedBng] = useState(null);
  const [bngDropdownOpen, setBngDropdownOpen] = useState(false);
  const [bngSearchTerm, setBngSearchTerm] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [clearUserLoading, setClearUserLoading] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);

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
        const userData = response.Data.Data || response.Data;
        const messageData = response.Data.Message || '';
        
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

  // Load BNG data on tab change
  useEffect(() => {
    if (activeTab === 'clear-user') {
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

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
      <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, marginBottom: 24, margin: 0 }}>Nhập thông tin thuê bao username:</h3>
      
      {/* Input Form */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
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
              outline: 'none'
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
                        fontSize: 14
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
          <div style={{ display: 'flex', gap: 40, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>Số phiên đang xác thực:</span>
              <span style={{ 
                color: '#2d0bebff', 
                fontWeight: 600, 
                fontSize: 18 
              }}>  
                {checkResult.CurrentSession || '0'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: '#6b7280' }}>Số phiên được cho phép:</span>
              <span style={{ 
                color: '#12f237ff', 
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
