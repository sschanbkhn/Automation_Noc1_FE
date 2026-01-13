import React, { useState, useEffect, useCallback } from 'react';
import I003Service from 'services/I003Service';

export default function Tab1Dashboard({ activeTab }) {
  // ===== PIE CHART STATES =====
  const [pieChartDate, setPieChartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [pieChartProvince, setPieChartProvince] = useState('total');
  const [pieChartSessionData, setPieChartSessionData] = useState(null);
  const [pieChartUserData, setPieChartUserData] = useState(null);
  const [pieChartLoading, setPieChartLoading] = useState(false);
  const [pieChartDeviceDetails, setPieChartDeviceDetails] = useState([]); // Store device-level session data
  const [pieChartUserDeviceDetails, setPieChartUserDeviceDetails] = useState([]); // Store device-level user data
  
  // ===== LINE CHART STATES =====
  const [lineChartProvince, setLineChartProvince] = useState('total');
  const [lineChartTimeRange, setLineChartTimeRange] = useState('week'); // 'week', 'month', 'custom'
  const [lineChartFromDate, setLineChartFromDate] = useState(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [lineChartToDate, setLineChartToDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineChartData, setLineChartData] = useState([]);
  const [lineChartLoading, setLineChartLoading] = useState(false);
  
  // ===== SHARED STATES =====
  const [locationList, setLocationList] = useState([]);
  const [showXacThuc, setShowXacThuc] = useState(true);
  const [showVuotPhien, setShowVuotPhien] = useState(true);
  const [showDaXoa, setShowDaXoa] = useState(true);

  // ===== HELPER: Get date range based on timeRange selection =====
  const getDateRange = useCallback(() => {
    if (lineChartTimeRange === 'custom') {
      return { from: lineChartFromDate, to: lineChartToDate };
    }
    
    const toDate = new Date();
    const fromDate = new Date();
    
    if (lineChartTimeRange === 'week') {
      fromDate.setDate(toDate.getDate() - 7);
    } else if (lineChartTimeRange === 'month') {
      fromDate.setDate(toDate.getDate() - 30);
    }
    
    return {
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0]
    };
  }, [lineChartTimeRange, lineChartFromDate, lineChartToDate]);

  // ===== FETCH LOCATION LIST =====
  const fetchLocationList = useCallback(async () => {
    try {
      const response = await I003Service.GetLocationList();
      if (response && response.Success && response.Data) {
        setLocationList(response.Data);
      }
    } catch (error) {
      console.error('Error fetching location list:', error);
    }
  }, []);

  // ===== FETCH PIE CHART DATA (Session + User từ 2 API) =====
  const fetchPieChartData = useCallback(async () => {
    setPieChartLoading(true);
    try {
      let sessionData = null;
      let userData = null;
      let deviceDetailsList = [];
      let deviceUserDetailsList = [];
      
      if (pieChartProvince === 'total') {
        // Lấy dữ liệu tổng cho tất cả tỉnh từ GetSessionUserDashboardData
        const response = await I003Service.GetSessionUserDashboardData(pieChartDate, pieChartDate);
        
        if (response && response.Success && response.Data) {
          const data = response.Data;
          
          // Session data
          sessionData = {
            XacThuc: data.SessionData?.TongSoSessionXacThuc || 0,
            VuotPhien: data.SessionData?.SoSessionVuotPhien || 0,
            DaXoa: data.SessionData?.SoSessionDaXoa || 0
          };
          
          // User data
          userData = {
            XacThuc: data.UserData?.TongSoUserXacThuc || 0,
            VuotPhien: data.UserData?.SoUserVuotPhien || 0,
            DaXoa: data.UserData?.SoUserDaBiClear || 0
          };
          
          // Khi chọn tổng, không hiển thị chi tiết thiết bị
          deviceDetailsList = [];
          deviceUserDetailsList = [];
        }
      } else {
        // Khi chọn location: Thử API mới GetBNGDailyDataByLocation trước, fallback sang GetBNGDataByLocation
        try {
          // Thử gọi API mới
          const dailyResponse = await I003Service.GetBNGDailyDataByLocation(pieChartProvince, pieChartDate);
          
          if (dailyResponse && dailyResponse.Success && dailyResponse.Data) {
            const devicesList = dailyResponse.Data;
            
            let totalSessionXacThuc = 0, totalSessionVuotPhien = 0, totalSessionDaXoa = 0;
            let totalUserXacThuc = 0, totalUserVuotPhien = 0, totalUserDaXoa = 0;
            
            devicesList.forEach(device => {
              // Session data
              totalSessionXacThuc += device.total_sessions || device.XacThuc || 0;
              totalSessionVuotPhien += device.over_sessions || device.VuotPhien || 0;
              totalSessionDaXoa += device.cleared_sessions || device.DaXoa || 0;
              
              // User data (API mới này có data)
              totalUserXacThuc += device.total_users || device.UserXacThuc || 0;
              totalUserVuotPhien += device.over_users || device.UserVuotPhien || 0;
              totalUserDaXoa += device.cleared_users || device.UserDaXoa || 0;
            });
            
            sessionData = {
              XacThuc: totalSessionXacThuc,
              VuotPhien: totalSessionVuotPhien,
              DaXoa: totalSessionDaXoa
            };
            
            userData = {
              XacThuc: totalUserXacThuc,
              VuotPhien: totalUserVuotPhien,
              DaXoa: totalUserDaXoa
            };
            
            // Split device list vào 2 bảng riêng
            deviceDetailsList = devicesList;
            deviceUserDetailsList = devicesList;
            
            console.log('Using GetBNGDailyDataByLocation - Full data available');
          } else {
            throw new Error('API mới không có dữ liệu');
          }
        } catch (err) {
          // Fallback sang API cũ GetBNGDataByLocation (chỉ có session data)
          console.log('Fallback to GetBNGDataByLocation:', err.message);
          
          const locationResponse = await I003Service.GetBNGDataByLocation(pieChartProvince, pieChartDate);
          
          if (locationResponse && locationResponse.Success && locationResponse.Data) {
            const devicesList = locationResponse.Data;
            
            let totalSessionXacThuc = 0, totalSessionVuotPhien = 0, totalSessionDaXoa = 0;
            
            devicesList.forEach(device => {
              totalSessionXacThuc += device.total_sessions || device.XacThuc || 0;
              totalSessionVuotPhien += device.over_sessions || device.VuotPhien || 0;
              totalSessionDaXoa += device.cleared_sessions || device.DaXoa || 0;
            });
            
            sessionData = {
              XacThuc: totalSessionXacThuc,
              VuotPhien: totalSessionVuotPhien,
              DaXoa: totalSessionDaXoa
            };
            
            // User data lấy từ total API (vì location API không có)
            const totalResponse = await I003Service.GetSessionUserDashboardData(pieChartDate, pieChartDate);
            if (totalResponse && totalResponse.Success && totalResponse.Data) {
              userData = {
                XacThuc: totalResponse.Data.UserData?.TongSoUserXacThuc || 0,
                VuotPhien: totalResponse.Data.UserData?.SoUserVuotPhien || 0,
                DaXoa: totalResponse.Data.UserData?.SoUserDaBiClear || 0
              };
            }
            
            deviceDetailsList = devicesList;
            deviceUserDetailsList = []; // Không có per-device user data từ API cũ
          }
        }
      }
      
      setPieChartSessionData(sessionData);
      setPieChartUserData(userData);
      setPieChartDeviceDetails(deviceDetailsList);
      setPieChartUserDeviceDetails(deviceUserDetailsList);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    } finally {
      setPieChartLoading(false);
    }
  }, [pieChartProvince, pieChartDate]);

  // ===== FETCH LINE CHART DATA =====
  const fetchLineChartData = useCallback(async () => {
    setLineChartLoading(true);
    try {
      const dateRange = getDateRange();
      
      if (lineChartProvince === 'total') {
        // Get total data for all 64 devices across date range - sum all devices
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        const allDaysData = [];
        
        // Loop through each day in the range
        for (let currentDate = new Date(fromDate); currentDate <= toDate; currentDate.setDate(currentDate.getDate() + 1)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          try {
            // Get all devices for this day and sum them
            const response = await I003Service.GetSessionUserDashboardData(dateStr, dateStr);
            
            if (response && response.Success && response.Data) {
              const data = response.Data;
              // Sum data from all 64 devices on this day
              const dayData = {
                Date: dateStr,
                total_sessions: data.SessionData?.TongSoSessionXacThuc || 0,
                over_sessions: data.SessionData?.SoSessionVuotPhien || 0,
                cleared_sessions: data.SessionData?.SoSessionDaXoa || 0,
                XacThuc: data.SessionData?.TongSoSessionXacThuc || 0,
                VuotPhien: data.SessionData?.SoSessionVuotPhien || 0,
                DaXoa: data.SessionData?.SoSessionDaXoa || 0
              };
              allDaysData.push(dayData);
            }
          } catch (dayError) {
            console.error(`Error fetching total data for ${dateStr}:`, dayError);
          }
        }
        
        setLineChartData(allDaysData);
      } else {
        // Get data for specific location with device detail - each device gets 3 lines
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        const allDaysData = [];
        const devicesList = [];
        
        // First, get list of devices in this location (from first day)
        try {
          const firstDayResponse = await I003Service.GetBNGDataByLocation(lineChartProvince, dateRange.from);
          if (firstDayResponse && firstDayResponse.Success && firstDayResponse.Data) {
            devicesList.push(...firstDayResponse.Data.map(d => ({
              bng_name: d.bng_name,
              bng_ip: d.bng_ip,
              device_name: d.device_name || d.bng_name
            })));
          }
        } catch (e) {
          console.error('Error fetching device list:', e);
        }
        
        // Then loop through each day and collect per-device data
        for (let currentDate = new Date(fromDate); currentDate <= toDate; currentDate.setDate(currentDate.getDate() + 1)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          try {
            const response = await I003Service.GetBNGDataByLocation(lineChartProvince, dateStr);
            
            if (response && response.Success && response.Data) {
              const dayDevices = response.Data;
              
              // Create entry for each device with its 3 metrics
              dayDevices.forEach(device => {
                const deviceKey = device.bng_name || device.device_name || device.bng_ip;
                const existingEntry = allDaysData.find(d => d.Date === dateStr);
                
                if (existingEntry) {
                  // Add device data to existing date entry
                  existingEntry[`${deviceKey}_total`] = device.total_sessions || device.XacThuc || 0;
                  existingEntry[`${deviceKey}_over`] = device.over_sessions || device.VuotPhien || 0;
                  existingEntry[`${deviceKey}_cleared`] = device.cleared_sessions || device.DaXoa || 0;
                } else {
                  // Create new date entry
                  const newEntry = { Date: dateStr };
                  newEntry[`${deviceKey}_total`] = device.total_sessions || device.XacThuc || 0;
                  newEntry[`${deviceKey}_over`] = device.over_sessions || device.VuotPhien || 0;
                  newEntry[`${deviceKey}_cleared`] = device.cleared_sessions || device.DaXoa || 0;
                  allDaysData.push(newEntry);
                }
              });
            }
          } catch (dayError) {
            console.error(`Error fetching location data for ${dateStr}:`, dayError);
          }
        }
        
        // Store both data and device info
        setLineChartData(allDaysData);
        window.lineChartDevices = devicesList; // Store device list for reference
      }
    } catch (error) {
      console.error('Error fetching line chart data:', error);
    } finally {
      setLineChartLoading(false);
    }
  }, [lineChartProvince, getDateRange]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchLocationList();
    }
  }, [activeTab, fetchLocationList]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchPieChartData();
    }
  }, [activeTab, pieChartProvince, pieChartDate, fetchPieChartData]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchLineChartData();
    }
  }, [activeTab, lineChartProvince, lineChartTimeRange, lineChartFromDate, lineChartToDate, fetchLineChartData]);

  // ===== PIE CHART RENDER HELPER =====
  const renderPieChart = (data, title) => {
    if (!data) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          Không có dữ liệu
        </div>
      );
    }

    const total = (data.XacThuc || 0) + (data.VuotPhien || 0) + (data.DaXoa || 0);
    if (total === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          Không có dữ liệu
        </div>
      );
    }

    const xacThucPercent = (data.XacThuc / total) * 100;
    const vuotPhienPercent = (data.VuotPhien / total) * 100;
    const daXoaPercent = (data.DaXoa / total) * 100;

    const xacThucAngle = (data.XacThuc / total) * 360;
    const vuotPhienAngle = (data.VuotPhien / total) * 360;
    const daXoaAngle = (data.DaXoa / total) * 360;

    let currentAngle = 0;
    const radius = 90; // Increased size

    const createPath = (startAngle, endAngle, color) => {
      if (endAngle - startAngle <= 0) return null;

      const start = (startAngle - 90) * (Math.PI / 180);
      const end = (endAngle - 90) * (Math.PI / 180);

      const x1 = 150 + radius * Math.cos(start);
      const y1 = 150 + radius * Math.sin(start);
      const x2 = 150 + radius * Math.cos(end);
      const y2 = 150 + radius * Math.sin(end);

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;

      return (
        <path
          key={`path-${startAngle}`}
          d={`M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={color}
          stroke="#fff"
          strokeWidth="2"
          style={{ cursor: 'pointer' }}
        />
      );
    };

    const paths = [];
    if (xacThucAngle > 0) {
      paths.push(createPath(currentAngle, currentAngle + xacThucAngle, '#22c55e'));
      currentAngle += xacThucAngle;
    }
    if (vuotPhienAngle > 0) {
      paths.push(createPath(currentAngle, currentAngle + vuotPhienAngle, '#fb923c'));
      currentAngle += vuotPhienAngle;
    }
    if (daXoaAngle > 0) {
      paths.push(createPath(currentAngle, currentAngle + daXoaAngle, '#ef4444'));
    }

    return (
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151', textAlign: 'center' }}>
          {title}
        </h4>
        <div style={{ position: 'relative', width: 320, height: 320, margin: '0 auto 20px' }}>
          <svg width="320" height="320" viewBox="0 0 300 300">
            {paths}
            <text x="150" y="160" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#374151">
              {total.toLocaleString()}
            </text>
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: '50%' }}></div>
              <span>Xác thực</span>
            </div>
            <span style={{ fontWeight: 600, color: '#22c55e' }}>
              {(data.XacThuc || 0).toLocaleString()} ({xacThucPercent.toFixed(1)}%)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: '#fb923c', borderRadius: '50%' }}></div>
              <span>Vượt phiên</span>
            </div>
            <span style={{ fontWeight: 600, color: '#fb923c' }}>
              {(data.VuotPhien || 0).toLocaleString()} ({vuotPhienPercent.toFixed(1)}%)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: '50%' }}></div>
              <span>Đã xóa</span>
            </div>
            <span style={{ fontWeight: 600, color: '#ef4444' }}>
              {(data.DaXoa || 0).toLocaleString()} ({daXoaPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
      {/* ===== PIE CHART SECTION ===== */}
      <div style={{ marginBottom: 30, paddingBottom: 30, borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, margin: 0, flex: 1 }}>
            Thống kê session & user đa phiên (Ngày T-1)
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Chọn ngày:</label>
            <input
              type="date"
              value={pieChartDate}
              onChange={(e) => setPieChartDate(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Chọn tỉnh:</label>
            <select
              value={pieChartProvince}
              onChange={(e) => setPieChartProvince(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14,
                minWidth: 200
              }}
            >
              <option value="total">-- Tổng --</option>
              {locationList.map((location, idx) => (
                <option key={idx} value={location.location}>
                  {location.province_name || location.bng_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pieChartLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 16, color: '#666' }}>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                {renderPieChart(pieChartSessionData, 'Session Đa Phiên')}
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                {renderPieChart(pieChartUserData, 'User Đa Phiên')}
              </div>
            </div>
            
            
            {/* Device Details Section - Chỉ hiển thị khi chọn tỉnh, không hiển thị khi chọn tổng */}
            {pieChartProvince !== 'total' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Session Device Details Table */}
                {pieChartDeviceDetails && pieChartDeviceDetails.length > 0 && (
                  <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
                      Chi tiết thiết bị - Session ({pieChartDeviceDetails.length})
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: '#e2e8f0', borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Tên thiết bị</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>Xác thực</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#fb923c' }}>Vượt phiên</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>Đã xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pieChartDeviceDetails.map((device, idx) => {
                            const sessionXacThuc = device.total_sessions || device.XacThuc || 0;
                            const sessionVuotPhien = device.over_sessions || device.VuotPhien || 0;
                            const sessionDaXoa = device.cleared_sessions || device.DaXoa || 0;
                            
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td style={{ padding: '8px 12px', color: '#374151' }}>
                                  {device.bng_name || device.device_name || `Device ${idx + 1}`}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>
                                  {sessionXacThuc.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#fb923c', fontWeight: 600 }}>
                                  {sessionVuotPhien.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                                  {sessionDaXoa.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* User Device Details Table */}
                {pieChartUserDeviceDetails && pieChartUserDeviceDetails.length > 0 ? (
                  <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
                      Chi tiết thiết bị - User ({pieChartUserDeviceDetails.length})
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: '#e2e8f0', borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Tên thiết bị</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>Xác thực</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#fb923c' }}>Vượt phiên</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>Đã xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pieChartUserDeviceDetails.map((device, idx) => {
                            const userXacThuc = device.total_users || device.UserXacThuc || 0;
                            const userVuotPhien = device.over_users || device.UserVuotPhien || 0;
                            const userDaXoa = device.cleared_users || device.UserDaXoa || 0;
                            
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td style={{ padding: '8px 12px', color: '#374151' }}>
                                  {device.bng_name || device.device_name || `Device ${idx + 1}`}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>
                                  {userXacThuc.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#fb923c', fontWeight: 600 }}>
                                  {userVuotPhien.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                                  {userDaXoa.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
                      Chi tiết thiết bị - User
                    </h4>
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      Đang chờ Backend cập nhật API GetBNGDailyDataByLocation với user data...
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== LINE CHART SECTION ===== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <h3 style={{ color: '#1890ff', fontWeight: 600, fontSize: 18, margin: 0, flex: 1 }}>
            Biểu đồ theo dõi thuê bao theo ngày
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Chọn tỉnh:</label>
            <select
              value={lineChartProvince}
              onChange={(e) => setLineChartProvince(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14,
                minWidth: 200
              }}
            >
              <option value="total">-- Tổng --</option>
              {locationList.map((location, idx) => (
                <option key={idx} value={location.location}>
                  {location.province_name || location.bng_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Khoảng thời gian:</label>
            <select
              value={lineChartTimeRange}
              onChange={(e) => setLineChartTimeRange(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14
              }}
            >
              <option value="week">1 tuần</option>
              <option value="month">1 tháng</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          {lineChartTimeRange === 'custom' && (
            <>
              <label style={{ fontWeight: 500, fontSize: 14 }}>Từ:</label>
              <input
                type="date"
                value={lineChartFromDate}
                onChange={(e) => setLineChartFromDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
              <label style={{ fontWeight: 500, fontSize: 14 }}>Đến:</label>
              <input
                type="date"
                value={lineChartToDate}
                onChange={(e) => setLineChartToDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
              <input 
                type="checkbox" 
                checked={showXacThuc}
                onChange={(e) => setShowXacThuc(e.target.checked)}
              />
              Xác thực
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
              <input 
                type="checkbox" 
                checked={showVuotPhien}
                onChange={(e) => setShowVuotPhien(e.target.checked)}
              />
              Vượt phiên
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
              <input 
                type="checkbox" 
                checked={showDaXoa}
                onChange={(e) => setShowDaXoa(e.target.checked)}
              />
              Đã xóa
            </label>
          </div>
        </div>

        {lineChartLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 16, color: '#666' }}>Đang tải dữ liệu biểu đồ...</div>
          </div>
        ) : lineChartData && lineChartData.length > 0 ? (
          <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, position: 'relative' }}>
            <svg width="100%" height="450" viewBox="0 0 1200 400" style={{ overflow: 'visible' }}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={`grid-${i}`}
                  x1="80"
                  y1={i * 60}
                  x2="1100"
                  y2={i * 60}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              ))}

              {(() => {
                // Get all unique keys
                const allKeys = lineChartData.length > 0 
                  ? Object.keys(lineChartData[0]).filter(k => k !== 'Date')
                  : [];
                
                // Determine which keys to display based on province selection
                let keysToDisplay = [];
                if (lineChartProvince === 'total') {
                  keysToDisplay = ['XacThuc', 'VuotPhien', 'DaXoa'].filter(k => allKeys.includes(k) || allKeys.some(ak => ak.includes(k)));
                } else {
                  // Get unique device names from all keys
                  const deviceSet = new Set();
                  allKeys.forEach(key => {
                    const match = key.match(/^(.+?)_(total|over|cleared)$/);
                    if (match) {
                      deviceSet.add(match[1]);
                    }
                  });
                  
                  // For each device, add 3 keys: total, over, cleared
                  Array.from(deviceSet).forEach(device => {
                    if (allKeys.includes(`${device}_total`)) keysToDisplay.push(`${device}_total`);
                    if (allKeys.includes(`${device}_over`)) keysToDisplay.push(`${device}_over`);
                    if (allKeys.includes(`${device}_cleared`)) keysToDisplay.push(`${device}_cleared`);
                  });
                }

                // Determine which keys are currently visible based on checkboxes
                const visibleKeys = keysToDisplay.filter(key => {
                  if (key.includes('total') || key === 'XacThuc') return showXacThuc;
                  if (key.includes('over') || key === 'VuotPhien') return showVuotPhien;
                  if (key.includes('cleared') || key === 'DaXoa') return showDaXoa;
                  return true;
                });

                // Calculate max value based on ONLY visible keys
                let maxValue = 1000;
                if (visibleKeys.length > 0 && lineChartData.length > 0) {
                  maxValue = Math.max(
                    ...lineChartData.flatMap(item => 
                      visibleKeys.map(key => item[key] || 0)
                    ), 
                    1000
                  );
                }
                
                const chartWidth = 1020;
                const chartHeight = 260;
                const stepX = lineChartData.length > 1 ? chartWidth / (lineChartData.length - 1) : chartWidth / 2;

                // Define enhanced color gradients for different data types
                const colorMap = {
                  // Xác thực (Verified) - Green leaf shade
                  'XacThuc': '#22c55e',
                  'total': '#22c55e',
                  '_total': '#22c55e',
                  // Vượt phiên (Over Session) - Orange shade
                  'VuotPhien': '#fb923c',
                  'over': '#fb923c',
                  '_over': '#fb923c',
                  // Đã xóa (Cleared) - Red shade
                  'DaXoa': '#ef4444',
                  'cleared': '#ef4444',
                  '_cleared': '#ef4444'
                };

                // Y-axis labels based on visible max value
                const yLabels = [];
                for (let i = 0; i <= 4; i++) {
                  const value = Math.round((maxValue * (4 - i)) / 4);
                  yLabels.push(
                    <text key={`ylabel-${i}`} x="70" y={i * 60 + 10} textAnchor="end" fontSize="12" fill="#6b7280">
                      {value.toLocaleString()}
                    </text>
                  );
                }

                // X-axis labels with smart interval based on date range
                const dataLength = lineChartData.length;
                let labelInterval = 1; // Show every day by default
                
                // For long date ranges, show fewer labels
                if (dataLength > 60) {
                  labelInterval = Math.ceil(dataLength / 10); // Show ~10 labels max
                } else if (dataLength > 30) {
                  labelInterval = 7; // Show every 7 days for month view
                } else if (dataLength > 14) {
                  labelInterval = 3; // Show every 3 days for 2-week view
                }
                
                const xLabels = lineChartData.map((item, idx) => {
                  // Only show label if it matches the interval pattern
                  if (idx % labelInterval !== 0 && idx !== lineChartData.length - 1) {
                    return null;
                  }
                  
                  const x = 80 + idx * stepX;
                  return (
                    <text key={`xlabel-${idx}`} x={x} y="330" textAnchor="middle" fontSize="11" fill="#6b7280">
                      {item.Date?.substring(5) || `Day ${idx + 1}`}
                    </text>
                  );
                }).filter(Boolean);

                // Generate lines for each key with visibility handling
                const lines = keysToDisplay.map((key, keyIdx) => {
                  const isVisible = (showXacThuc && key.includes('total')) || (showVuotPhien && key.includes('over')) || (showDaXoa && key.includes('cleared'));
                  const color = colorMap[key] || `hsl(${keyIdx * 30}, 70%, 50%)`;
                  
                  const points = lineChartData.map((item, idx) => {
                    const x = 80 + idx * stepX;
                    const y = (item[key] || 0) / maxValue * chartHeight;
                    return `${x},${chartHeight - y}`;
                  }).join(' ');

                  return (
                    <polyline 
                      key={`line-${key}`}
                      points={points} 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      opacity={isVisible ? 0.9 : 0.2}
                      style={{ transition: 'opacity 0.3s ease' }}
                    />
                  );
                });

                // Data points and hover areas
                const points = lineChartData.flatMap((item, idx) => {
                  const x = 80 + idx * stepX;
                  return keysToDisplay.map((key, keyIdx) => {
                    const color = colorMap[key] || `hsl(${keyIdx * 30}, 70%, 50%)`;
                    const isVisible = (showXacThuc && key.includes('total')) || (showVuotPhien && key.includes('over')) || (showDaXoa && key.includes('cleared'));
                    const y = chartHeight - ((item[key] || 0) / maxValue * chartHeight);
                    
                    return (
                      <circle 
                        key={`point-${idx}-${key}`}
                        cx={x} 
                        cy={y} 
                        r="4" 
                        fill={color} 
                        stroke="#fff" 
                        strokeWidth="2"
                        opacity={isVisible ? 0.9 : 0.2}
                        style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                      />
                    );
                  });
                });

                // Hover areas for tooltip
                const hoverAreas = lineChartData.map((item, idx) => (
                  <rect
                    key={`hover-${idx}`}
                    x={80 + idx * stepX - (stepX / 2)}
                    y="0"
                    width={stepX}
                    height={chartHeight}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      const tooltip = document.getElementById(`tooltip-${idx}`);
                      if (tooltip) tooltip.style.opacity = '1';
                    }}
                    onMouseLeave={() => {
                      const tooltip = document.getElementById(`tooltip-${idx}`);
                      if (tooltip) tooltip.style.opacity = '0';
                    }}
                  />
                ));

                return (
                  <>
                    {yLabels}
                    {xLabels}
                    {lines}
                    {points}
                    {hoverAreas}
                  </>
                );
              })()}
            </svg>

            {/* Tooltips */}
            {lineChartData.map((item, idx) => {
              const allKeys = lineChartData.length > 0 
                ? Object.keys(lineChartData[0]).filter(k => k !== 'Date')
                : [];
              
              return (
                <div
                  key={`tooltip-${idx}`}
                  id={`tooltip-${idx}`}
                  style={{
                    position: 'absolute',
                    bottom: '280px',
                    left: `${(idx / (lineChartData.length - 1 || 1)) * 85 + 8}%`,
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
                    border: '1px solid #374151',
                    maxWidth: '300px',
                    whiteSpace: 'normal'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#60a5fa' }}>
                    {item.Date}
                  </div>
                  <div style={{ borderTop: '1px solid #4b5563', paddingTop: 6 }}>
                    {lineChartProvince === 'total' ? (
                      <>
                        {item.XacThuc !== undefined && showXacThuc && (
                          <div>Xác thực: <span style={{ color: '#22c55e', fontWeight: 600 }}>{(item.XacThuc || 0).toLocaleString()}</span></div>
                        )}
                        {item.VuotPhien !== undefined && showVuotPhien && (
                          <div>Vượt phiên: <span style={{ color: '#fb923c', fontWeight: 600 }}>{(item.VuotPhien || 0).toLocaleString()}</span></div>
                        )}
                        {item.DaXoa !== undefined && showDaXoa && (
                          <div>Đã xóa: <span style={{ color: '#ef4444', fontWeight: 600 }}>{(item.DaXoa || 0).toLocaleString()}</span></div>
                        )}
                      </>
                    ) : (
                      allKeys
                        .filter(k => k !== 'Date')
                        .map((key, i) => {
                          const match = key.match(/^(.+?)_(total|over|cleared)$/);
                          if (!match) return null;
                          const [, deviceName, metricType] = match;
                          const metricLabel = metricType === 'total' ? 'Xác thực' : metricType === 'over' ? 'Vượt phiên' : 'Đã xóa';
                          const color = metricType === 'total' ? '#22c55e' : metricType === 'over' ? '#fb923c' : '#ef4444';
                          
                          const show = (metricType === 'total' && showXacThuc) || 
                                      (metricType === 'over' && showVuotPhien) || 
                                      (metricType === 'cleared' && showDaXoa);
                          
                          return show ? (
                            <div key={`tooltip-item-${i}`} style={{ fontSize: 11 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, background: color, borderRadius: 1 }}></div>
                                <span>{deviceName}: {metricLabel} <span style={{ color, fontWeight: 600 }}>{(item[key] || 0).toLocaleString()}</span></span>
                              </div>
                            </div>
                          ) : null;
                        })
                    )}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
              {lineChartProvince === 'total' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: showXacThuc ? 1 : 0.4 }}>
                    <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: 2 }}></div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Xác thực (Tất cả 64 thiết bị)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: showVuotPhien ? 1 : 0.4 }}>
                    <div style={{ width: 12, height: 12, background: '#fb923c', borderRadius: 2 }}></div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Vượt phiên (Tất cả 64 thiết bị)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: showDaXoa ? 1 : 0.4 }}>
                    <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }}></div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Đã xóa (Tất cả 64 thiết bị)</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', width: '100%' }}>
                    Mỗi thiết bị có 3 đường: Xác thực (xanh lá), Vượt phiên (cam), Đã xóa (đỏ)
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', background: '#f9fafb', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            Không có dữ liệu hoặc đang chọn tỉnh để xem biểu đồ
          </div>
        )}
      </div>
    </div>
  );
}
