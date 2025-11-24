import React, { useEffect, useMemo, useRef, useState } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import I002Service from 'services/I002Service';

const chip = (text, fg, bg) => `<span style="background:${bg};color:${fg};padding:3px 10px;border-radius:999px;font-weight:600;font-size:12px;">${text}</span>`;

const severityChip = (s) => {
  const map = {
    critical: chip('CRITICAL', '#991b1b', '#fee2e2'),
    major: chip('MAJOR', '#c2410c', '#fed7aa'),
    minor: chip('MINOR', '#b45309', '#fef3c7'),
    warning: chip('WARNING', '#065f46', '#d1fae5')
  };
  return map[(s || '').toLowerCase()] || chip(s || 'N/A', '#6b7280', '#f3f4f6');
};

export default function I002Report() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    q: '', 
    device: 'all', 
    severity: 'all',
    keyword: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const ref = useRef();

  const load = async () => {
    try {
      setLoading(true);
      const res = await I002Service.GetHardwareAlarmHistory();
      const data = (res?.Data || []).map((r) => ({
        Id: r.Id,
        device: r.Device || 'N/A',
        ipLoopback: r.IpLoopback || 'N/A',
        keyword: r.Keyword || 'N/A',
        severity: r.Severity || 'N/A',
        rawLog: r.RawLog || '',
        fpcSlot: r.FpcSlot || 'N/A',
        fpcSn: r.FpcSn || 'N/A',
        fpcPn: r.FpcPn || 'N/A',
        fpcDesc: r.FpcDesc || 'N/A',
        fpcVer: r.FpcVer || '',
        fpcModel: r.FpcModel || 'N/A',
        intfList: r.IntfList || '',
        updatedAt: r.UpdatedAt,
        alarmId: r.AlarmId,
        causeName: r.CauseName || 'N/A',
        causeCreate: r.CauseCreate,
        userCheck: r.UserCheck || 'N/A',
        timeCheck: r.TimeCheck,
        severityHtml: severityChip(r.Severity),
        updatedAtFormatted: r.UpdatedAt ? new Date(r.UpdatedAt).toLocaleString('vi-VN') : 'N/A',
        causeCreateFormatted: r.CauseCreate ? new Date(r.CauseCreate).toLocaleString('vi-VN') : 'N/A',
        timeCheckFormatted: r.TimeCheck ? new Date(r.TimeCheck).toLocaleString('vi-VN') : 'N/A',
      }));
      setRows(data);
    } catch (error) {
      console.error('Error loading hardware alarm history:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    load();
  };

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const text = `${r.device} ${r.ipLoopback} ${r.keyword} ${r.fpcSlot} ${r.userCheck}`.toLowerCase();
      if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
      if (filters.device !== 'all' && r.device !== filters.device) return false;
      if (filters.severity !== 'all' && r.severity !== filters.severity) return false;
      if (filters.keyword !== 'all' && r.keyword !== filters.keyword) return false;
      
      if (filters.dateFrom && r.causeCreate) {
        const recordDate = new Date(r.causeCreate);
        const fromDate = new Date(filters.dateFrom);
        if (recordDate < fromDate) return false;
      }
      if (filters.dateTo && r.causeCreate) {
        const recordDate = new Date(r.causeCreate);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (recordDate > toDate) return false;
      }
      
      return true;
    });
  }, [rows, filters]);

  const sum = useMemo(() => {
    const total = filtered.length;
    const critical = filtered.filter(r => (r.severity || '').toLowerCase() === 'critical').length;
    const major = filtered.filter(r => (r.severity || '').toLowerCase() === 'major').length;
    const withCause = filtered.filter(r => r.causeName && r.causeName !== 'N/A').length;
    return { total, critical, major, withCause };
  }, [filtered]);

  const columns = useMemo(() => [
    { Title: 'ID', Key: 'Id', Width: 80, Sortable: true },
    { Title: 'Cause Create', Key: 'causeCreateFormatted', Width: 150, Sortable: true },
    { Title: 'Device', Key: 'device', Width: 180, Sortable: true },
    { Title: 'IP Loopback', Key: 'ipLoopback', Width: 130, Sortable: true },
    { Title: 'Keyword', Key: 'keyword', Width: 200, Sortable: true },
    { Title: 'Severity', Key: 'severityHtml', Width: 100, Sortable: false },
    { Title: 'FPC Slot', Key: 'fpcSlot', Width: 100, Sortable: true },
    { Title: 'FPC Desc', Key: 'fpcDesc', Width: 200, Sortable: true },
    { Title: 'Cause Name', Key: 'causeName', Width: 200, Sortable: true },
    { Title: 'User Check', Key: 'userCheck', Width: 120, Sortable: true },
    { Title: 'Time Check', Key: 'timeCheckFormatted', Width: 150, Sortable: true },
  ], []);

  const devices = useMemo(() => Array.from(new Set(rows.map(r => r.device).filter(Boolean))), [rows]);
  const severities = useMemo(() => Array.from(new Set(rows.map(r => r.severity).filter(Boolean))), [rows]);
  const keywords = useMemo(() => Array.from(new Set(rows.map(r => r.keyword).filter(Boolean))), [rows]);

  const exportCSV = () => {
    const header = ['ID','Cause Create','Device','IP Loopback','Keyword','Severity','FPC Slot','FPC Desc','Cause Name','User Check','Time Check'];
    const csvRows = filtered.map(r => [
      r.Id,
      r.causeCreateFormatted,
      r.device,
      r.ipLoopback,
      r.keyword,
      r.severity,
      r.fpcSlot,
      r.fpcDesc,
      r.causeName,
      r.userCheck,
      r.timeCheckFormatted
    ]);
    const csv = [header.join(','), ...csvRows.map(line => line.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `I002_HardwareAlarm_History_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:12, padding:14 }}>
          <div style={{ color:'#3730a3', fontSize:12, fontWeight:600 }}>TỔNG BẢN GHI</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#3730a3' }}>{sum.total}</div>
        </div>
        <div style={{ background:'#fee2e2', border:'1px solid #fecaca', borderRadius:12, padding:14 }}>
          <div style={{ color:'#991b1b', fontSize:12, fontWeight:600 }}>CRITICAL</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#991b1b' }}>{sum.critical}</div>
        </div>
        <div style={{ background:'#fed7aa', border:'1px solid #fdba74', borderRadius:12, padding:14 }}>
          <div style={{ color:'#c2410c', fontSize:12, fontWeight:600 }}>MAJOR</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#c2410c' }}>{sum.major}</div>
        </div>
        <div style={{ background:'#d1fae5', border:'1px solid #a7f3d0', borderRadius:12, padding:14 }}>
          <div style={{ color:'#065f46', fontSize:12, fontWeight:600 }}>CÓ CAUSE</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#065f46' }}>{sum.withCause}</div>
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, marginBottom:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr', gap:8 }}>
          <input 
            placeholder='Tìm kiếm...' 
            value={filters.q} 
            onChange={e=>setFilters(p=>({...p,q:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          />
          <select 
            value={filters.device} 
            onChange={e=>setFilters(p=>({...p,device:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Device</option>
            {devices.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            value={filters.severity} 
            onChange={e=>setFilters(p=>({...p,severity:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Severity</option>
            {severities.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filters.keyword} 
            onChange={e=>setFilters(p=>({...p,keyword:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Keyword</option>
            {keywords.map(k=> <option key={k} value={k}>{k}</option>)}
          </select>
          <input 
            type='date'
            placeholder='Từ ngày' 
            value={filters.dateFrom} 
            onChange={e=>setFilters(p=>({...p,dateFrom:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          />
          <input 
            type='date'
            placeholder='Đến ngày' 
            value={filters.dateTo} 
            onChange={e=>setFilters(p=>({...p,dateTo:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          />
        </div>
        <div style={{ marginTop:8, display:'flex', gap:8 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background:'#2563eb',
              color:'#fff',
              border:'none',
              borderRadius:6,
              padding:'8px 16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight:600,
              fontSize:14,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Đang tải...' : '🔍 Submit'}
          </button>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            style={{
              background:'#16a34a',
              color:'#fff',
              border:'none',
              borderRadius:6,
              padding:'8px 16px',
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight:600,
              fontSize:14,
              opacity: filtered.length === 0 ? 0.6 : 1
            }}
          >
            📥 Export CSV ({filtered.length} bản ghi)
          </button>
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>⏳ Đang tải dữ liệu...</div>
          </div>
        ) : filtered && filtered.length > 0 ? (
          <CtrlDynamicTable
            id="i002-report-table"
            ref={ref}
            columnDefs={columns}
            dataItems={filtered}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            {rows.length === 0 ? 'Nhấn nút Submit để tải dữ liệu' : 'Không có dữ liệu phù hợp với bộ lọc'}
          </div>
        )}
      </div>
    </div>
  );
}
