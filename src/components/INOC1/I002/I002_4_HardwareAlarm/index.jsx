import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlDialog from 'components/common/CtrlDialog';
import I002Service from 'services/I002Service';
import { Cookie } from 'helpers/cookie';

const chip = (text, fg, bg) => `<span style="background:${bg};color:${fg};padding:3px 10px;border-radius:999px;font-weight:600;font-size:12px;">${text}</span>`;

const statusChip = (status) => {
  const statusMap = {
    'Auto Reboot': chip('Auto Reboot', '#065f46', '#d1fae5'),
    'Manual': chip('Manual', '#b45309', '#fef3c7'),
    'Pending': chip('Pending', '#9f1239', '#ffe4e6'),
  };
  return statusMap[status] || chip(status || 'N/A', '#6b7280', '#f3f4f6');
};

const CheckHtml = (id, checkTime, checkUser) => (
  `<div style='display:flex;flex-direction:column;gap:6px'>
     <button class='btn-alarm-check' data-id='${id}' style='background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-weight:600;font-size:13px;'>Check</button>
     ${checkTime ? `<span style='font-size:11px;color:#6b7280'>${new Date(checkTime).toLocaleString('vi-VN')} • ${checkUser || 'N/A'}</span>` : ''}
   </div>`
);

const HardwareAlarmComponent = (props) => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ 
    q: '', 
    deviceName: 'all', 
    alarmType: 'all', 
    keyword: 'all'
  });
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [autoReload, setAutoReload] = useState(true);
  const [reloadInterval, setReloadInterval] = useState(5);
  const tableRef = useRef();
  const isLoadingRef = useRef(false);

  // Load UserInfo from Cookie
  useEffect(() => {
    try {
      const userInfoStr = Cookie.getCookie("UserInfo");
      if (userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedUserInfo);
        console.log('👤 I002 UserInfo loaded:', parsedUserInfo);
      }
    } catch (error) {
      console.error('❌ Error parsing UserInfo from cookie:', error);
    }
  }, []);

  const load = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent concurrent loads
    
    try {
      isLoadingRef.current = true;
      const res = await I002Service.GetList();
      const data = (res?.Data || []).map((r) => ({
        Id: r.Id,
        device: r.Device || 'N/A',
        ipLoopback: r.IpLoopback || 'N/A',
        keyword: r.Keyword || 'N/A',
        severity: r.Severity || 'N/A',
        rawLog: r.RawLog || '',
        fpcSlot: r.FpcSlot || 'N/A',
        fpcSn: r.FpcSn || '',
        fpcPn: r.FpcPn || '',
        fpcDesc: r.FpcDesc || 'N/A',
        fpcVer: r.FpcVer || '',
        fpcModel: r.FpcModel || 'N/A',
        intfList: r.IntfList || '',
        canRestart: r.CanRestart,
        isActive: r.IsActive,
        updatedAt: r.UpdatedAt,
        alarmId: r.AlarmId,
        checkTime: r.CheckTime,
        checkUser: r.CheckUser,
        statusProcess: r.StatusProcess,
        restartStatus: r.RestartStatus,
        summaryStatus: r.SummaryStatus,
        fpcStatus: r.FpcStatus,
        // Formatted fields
        updatedAtFormatted: r.UpdatedAt ? new Date(r.UpdatedAt).toLocaleString('vi-VN') : 'N/A',
        statusProcessHtml: statusChip(r.StatusProcess),
        actionHtml: CheckHtml(r.Id, r.CheckTime, r.CheckUser),
      }));
      setRows(data);
    } catch (error) {
      console.error('Error loading hardware alarms:', error);
      setRows([]); // Set empty array on error
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => { 
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await load();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [load]);

  // Auto reload effect
  useEffect(() => {
    if (!autoReload || modal) return; // Don't reload when modal is open
    
    const intervalId = setInterval(() => {
      if (!modal && !isLoadingRef.current) { // Double check before reload
        console.log(`🔄 Auto reloading hardware alarms (every ${reloadInterval}s)`);
        load();
      }
    }, reloadInterval * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoReload, reloadInterval, modal, load]);

  useEffect(() => {
    const onClick = async (e) => {
      const el = e.target.closest('.btn-alarm-check');
      if (!el) return;
      const id = el.getAttribute('data-id');
      const alarm = rows.find(x => x.Id == id); // So sánh với Id (PascalCase)
      if (!alarm) return;
      
      // Call API Check to update time_check and user_check
      try {
        const username = userInfo?.UserName || 'operator';
        console.log('✅ Calling Check API with username:', username);
        const res = await I002Service.Check(alarm.Id, username);
        
        if (res?.Success) {
          // Reload data to show updated check time
          await load();
        }
      } catch (error) {
        console.error('Error checking alarm:', error);
      }
      
      setCurrentAlarm(alarm);
      setDetail(alarm);
      setModal(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [rows, userInfo, load]);

  const handleAutoReboot = async () => {
    if (!currentAlarm) return;
    
    const confirmMsg = `Bạn có chắc chắn muốn AUTO REBOOT thiết bị ${currentAlarm.device}?\nSlot: ${currentAlarm.fpcSlot}\nKeyword: ${currentAlarm.keyword}`;
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const username = userInfo?.UserName || 'operator';
      const res = await I002Service.AutoReboot(
        currentAlarm.Id,
        currentAlarm.device,
        currentAlarm.fpcSlot,
        currentAlarm.keyword,
        username
      );
      
      if (res?.Success) {
        alert('Auto reboot thành công!');
        setModal(false); // Đóng modal TRƯỚC
        setDetail(null);
        setCurrentAlarm(null);
        await load(); // Reload data SAU
      } else {
        alert('Auto reboot thất bại: ' + (res?.Message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error auto rebooting:', error);
      alert('Lỗi khi auto reboot: ' + error.message);
    }
  };

  const handleManualHandle = async () => {
    if (!currentAlarm) return;
    
    const causeName = window.prompt('Nhập lý do xử lý manual (Cause Name):');
    if (!causeName) {
      alert('Vui lòng nhập lý do xử lý!');
      return;
    }
    
    const confirmMsg = `Bạn xác nhận sẽ xử lý MANUAL cho alarm này?\nLý do: ${causeName}`;
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const username = userInfo?.UserName || 'operator';
      const res = await I002Service.ManualHandle(currentAlarm.Id, username, causeName);
      
      if (res?.Success) {
        alert('Đã chuyển alarm sang lịch sử và đánh dấu xử lý manual!');
        setModal(false); // Đóng modal TRƯỚC
        setDetail(null);
        setCurrentAlarm(null);
        await load(); // Reload data SAU
      } else {
        alert('Lỗi: ' + (res?.Message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error manual handling:', error);
      alert('Lỗi khi xử lý manual: ' + error.message);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const text = `${r.device} ${r.ipLoopback} ${r.keyword} ${r.severity} ${r.fpcDesc}`.toLowerCase();
      if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
      if (filters.deviceName !== 'all' && r.device !== filters.deviceName) return false;
      if (filters.alarmType !== 'all' && r.severity !== filters.alarmType) return false;
      if (filters.keyword !== 'all' && r.keyword !== filters.keyword) return false;
      return true;
    });
  }, [rows, filters]);

  const sum = useMemo(() => {
    const total = filtered.length;
    const checked = filtered.filter(r => !!r.checkTime).length;
    const manual = filtered.filter(r => r.statusProcess === 'Manual').length;
    return { total, checked, manual };
  }, [filtered]);

  const columns = useMemo(() => [
    { Title: 'Updated At', Key: 'updatedAtFormatted', Width: 150, Sortable: true },
    { Title: 'Device', Key: 'device', Width: 180, Sortable: true },
    { Title: 'IP Loopback', Key: 'ipLoopback', Width: 130, Sortable: true },
    { Title: 'Keyword', Key: 'keyword', Width: 200, Sortable: true },
    { Title: 'Severity', Key: 'severity', Width: 100, Sortable: true },
    { Title: 'FPC Slot', Key: 'fpcSlot', Width: 100, Sortable: true },
    { Title: 'FPC Description', Key: 'fpcDesc', Width: 250, Sortable: true },
    { Title: 'FPC Model', Key: 'fpcModel', Width: 150, Sortable: true },
    { Title: 'Restart Status', Key: 'restartStatus', Width: 150, Sortable: true },
    { Title: 'Action', Key: 'actionHtml', Width: 180, Sortable: false },
  ], []);

  const deviceNames = useMemo(() => Array.from(new Set(rows.map(r => r.device).filter(Boolean))), [rows]);
  const severities = useMemo(() => Array.from(new Set(rows.map(r => r.severity).filter(Boolean))), [rows]);
  const keywords = useMemo(() => Array.from(new Set(rows.map(r => r.keyword).filter(Boolean))), [rows]);

  return (
    <div style={{ padding: '20px' }}>
      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
        <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:12, padding:14 }}>
          <div style={{ color:'#3730a3', fontSize:12, fontWeight:600 }}>TỔNG SỐ ALARM</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#3730a3' }}>{sum.total}</div>
        </div>
        <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, padding:14 }}>
          <div style={{ color:'#b45309', fontSize:12, fontWeight:600 }}>ĐÃ CHECK</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#b45309' }}>{sum.checked}</div>
        </div>
        <div style={{ background:'#ffe4e6', border:'1px solid #fecdd3', borderRadius:12, padding:14 }}>
          <div style={{ color:'#9f1239', fontSize:12, fontWeight:600 }}>MANUAL</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#9f1239' }}>{sum.manual}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, marginBottom:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8 }}>
          <input 
            placeholder='Tìm kiếm...' 
            value={filters.q} 
            onChange={e=>setFilters(p=>({...p,q:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          />
          <select 
            value={filters.deviceName} 
            onChange={e=>setFilters(p=>({...p,deviceName:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Device</option>
            {deviceNames.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            value={filters.alarmType} 
            onChange={e=>setFilters(p=>({...p,alarmType:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Severity</option>
            {severities.map(a=> <option key={a} value={a}>{a}</option>)}
          </select>
          <select 
            value={filters.keyword} 
            onChange={e=>setFilters(p=>({...p,keyword:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Keyword</option>
            {keywords.map(k=> <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        
        {/* Auto Reload Controls */}
        <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:12, padding:'8px 12px', background:'#f9fafb', borderRadius:6 }}>
          <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
            <input 
              type='checkbox' 
              checked={autoReload} 
              onChange={e=>setAutoReload(e.target.checked)}
              style={{ width:16, height:16, cursor:'pointer' }}
            />
            <span style={{ fontSize:14, fontWeight:600, color:'#374151' }}>🔄 Auto Reload</span>
          </label>
          {autoReload && (
            <>
              <span style={{ fontSize:14, color:'#6b7280' }}>Mỗi</span>
              <input 
                type='number' 
                min='1'
                max='60'
                value={reloadInterval} 
                onChange={e=>setReloadInterval(Math.max(1, parseInt(e.target.value) || 5))}
                style={{ width:60, padding:'4px 8px', border:'1px solid #d1d5db', borderRadius:4, fontSize:14, textAlign:'center' }}
              />
              <span style={{ fontSize:14, color:'#6b7280' }}>giây</span>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden' }}>
        {filtered && filtered.length > 0 ? (
          <CtrlDynamicTable
            id="i002-hardware-alarm-table"
            ref={tableRef}
            columnDefs={columns}
            dataItems={filtered}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            {rows.length === 0 ? 'Đang tải dữ liệu...' : 'Không có dữ liệu phù hợp'}
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      <CtrlDialog
        dialogVisible={modal}
        onCancel={() => setModal(false)}
        title="Chi tiết Hardware Alarm"
        size="large"
      >
        {detail && (
          <div style={{ padding: '20px' }}>
            {/* Warning banner cho can_restart */}
            {detail.canRestart === 0 && (
              <div style={{
                background: '#fee2e2',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '14px' }}>
                    ⚠️ KHÔNG NÊN REBOOT
                  </div>
                  <div style={{ color: '#7f1d1d', fontSize: '13px', marginTop: '4px' }}>
                    Card này không được phép tự động reboot. Vui lòng xử lý thủ công hoặc liên hệ NOC.
                  </div>
                </div>
              </div>
            )}
            
            {detail.canRestart === 1 && (
              <div style={{
                background: '#d1fae5',
                border: '2px solid #10b981',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '14px' }}>
                    ✓ CÓ THỂ REBOOT
                  </div>
                  <div style={{ color: '#047857', fontSize: '13px', marginTop: '4px' }}>
                    Card này có thể thực hiện auto reboot an toàn.
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', marginBottom: '12px' }}>
                <strong>Updated At:</strong>
                <span>{detail.updatedAtFormatted}</span>
                
                <strong>Device:</strong>
                <span style={{ color: '#2563eb', fontWeight: 600 }}>{detail.device}</span>
                
                <strong>IP Loopback:</strong>
                <span>{detail.ipLoopback}</span>
                
                <strong>Keyword:</strong>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{detail.keyword}</span>
                
                <strong>Severity:</strong>
                <span>{detail.severity}</span>
                
                <strong>FPC Slot:</strong>
                <span>{detail.fpcSlot}</span>
                
                <strong>FPC Description:</strong>
                <span>{detail.fpcDesc}</span>
                
                <strong>FPC Model:</strong>
                <span>{detail.fpcModel}</span>

                {detail.restartStatus && (
                  <>
                    <strong>Restart Status:</strong>
                    <span style={{ 
                      color: detail.restartStatus === 'success' ? '#059669' : '#dc2626', 
                      fontWeight: 600 
                    }}>
                      {detail.restartStatus}
                    </span>
                  </>
                )}

                {detail.fpcStatus && (
                  <>
                    <strong>FPC Status:</strong>
                    <span>{detail.fpcStatus}</span>
                  </>
                )}
              </div>

              {/* Interface List Table */}
              {detail.intfList && (() => {
                try {
                  const interfaces = JSON.parse(detail.intfList);
                  const intfEntries = Object.entries(interfaces);
                  if (intfEntries.length > 0) {
                    return (
                      <div style={{ marginTop: '20px' }}>
                        <strong style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#374151' }}>
                          Danh sách Interface ({intfEntries.length} port):
                        </strong>
                        <table style={{ 
                          width: '100%', 
                          borderCollapse: 'collapse', 
                          border: '1px solid #e5e7eb',
                          fontSize: '13px'
                        }}>
                          <thead>
                            <tr style={{ background: '#f9fafb' }}>
                              <th style={{ padding: '8px 12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 600 }}>Interface</th>
                              <th style={{ padding: '8px 12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 600 }}>Admin Status</th>
                              <th style={{ padding: '8px 12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 600 }}>Oper Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {intfEntries.map(([intfName, status]) => (
                              <tr key={intfName} style={{ background: '#fff' }}>
                                <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb', fontFamily: 'monospace' }}>
                                  {intfName}
                                </td>
                                <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                  <span style={{
                                    background: status.admin_status === 'up' ? '#d1fae5' : '#fee2e2',
                                    color: status.admin_status === 'up' ? '#065f46' : '#991b1b',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 600
                                  }}>
                                    {status.admin_status?.toUpperCase() || 'N/A'}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                  <span style={{
                                    background: status.oper_status === 'up' ? '#d1fae5' : '#fee2e2',
                                    color: status.oper_status === 'up' ? '#065f46' : '#991b1b',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 600
                                  }}>
                                    {status.oper_status?.toUpperCase() || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                } catch (e) {
                  return (
                    <div style={{ marginTop: '12px' }}>
                      <strong>List Port:</strong>
                      <pre style={{ 
                        background: '#f3f4f6', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {detail.intfList}
                      </pre>
                    </div>
                  );
                }
              })()}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              
              <button
                onClick={handleAutoReboot}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Auto Reboot
              </button>
              
              <button
                onClick={handleManualHandle}
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Manual Handle
              </button>
              
              <button
                onClick={() => setModal(false)}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </CtrlDialog>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(HardwareAlarmComponent);
