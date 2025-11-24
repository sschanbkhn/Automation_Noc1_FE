import React, { useEffect, useMemo, useRef, useState } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import I002Service from 'services/I002Service';

const chip = (text, fg, bg) => `<span style="background:${bg};color:${fg};padding:3px 10px;border-radius:999px;font-weight:600;font-size:12px;">${text}</span>`;

const statusTag = (s) => {
  const map = { 
    up: chip('UP', '#166534', '#dcfce7'), 
    down: chip('DOWN', '#991b1b', '#fee2e2'),
    flap: chip('FLAP', '#9333ea', '#f3e8ff')
  };
  return map[(s || '').toLowerCase()] || chip(s || 'N/A', '#6b7280', '#f3f4f6');
};

export default function BadLinkComponent() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ q: '', host: 'all', status: 'all', shutLink: 'all' });
  const tableRef = useRef();

  const load = async () => {
    try {
      const res = await I002Service.GetErrorLinksStatus();
      const data = (res?.Data || []).map((r) => ({
        Id: r.Id,
        host: r.Host || 'N/A',
        interface: r.Interface || 'N/A',
        status: r.Status || 'N/A',
        bandwidth: r.Bandwidth || 'N/A',
        ae: r.Ae || 'N/A',
        inputRate: r.InputRate || 0,
        outputRate: r.OutputRate || 0,
        createdAt: r.CreatedAt,
        aeBandwidth: r.AeBandwidth || 'N/A',
        shutLink: r.ShutLink,
        statusHtml: statusTag(r.Status),
        createdAtFormatted: r.CreatedAt ? new Date(r.CreatedAt).toLocaleString('vi-VN') : 'N/A',
        shutLinkHtml: r.ShutLink ? chip('YES', '#991b1b', '#fee2e2') : chip('NO', '#166534', '#dcfce7'),
        inputRateMbps: r.InputRate ? (r.InputRate / 1000000).toFixed(2) + ' Mbps' : '0 Mbps',
        outputRateMbps: r.OutputRate ? (r.OutputRate / 1000000).toFixed(2) + ' Mbps' : '0 Mbps',
      }));
      setRows(data);
    } catch (error) {
      console.error('Error loading error links:', error);
      setRows([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await load();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const text = `${r.host} ${r.interface} ${r.status} ${r.ae}`.toLowerCase();
      if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
      if (filters.host !== 'all' && r.host !== filters.host) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.shutLink !== 'all') {
        const filterVal = filters.shutLink === 'yes';
        if (r.shutLink !== filterVal) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const sum = useMemo(() => {
    const total = filtered.length;
    const up = filtered.filter(r => (r.status || '').toLowerCase() === 'up').length;
    const down = filtered.filter(r => (r.status || '').toLowerCase() === 'down').length;
    const shutYes = filtered.filter(r => r.shutLink === true).length;
    return { total, up, down, shutYes };
  }, [filtered]);

  const columns = useMemo(() => [
    { Title: 'ID', Key: 'Id', Width: 80, Sortable: true },
    { Title: 'Created At', Key: 'createdAtFormatted', Width: 150, Sortable: true },
    { Title: 'Host', Key: 'host', Width: 180, Sortable: true },
    { Title: 'Interface', Key: 'interface', Width: 150, Sortable: true },
    { Title: 'Status', Key: 'statusHtml', Width: 100, Sortable: false },
    { Title: 'Bandwidth', Key: 'bandwidth', Width: 100, Sortable: true },
    { Title: 'AE', Key: 'ae', Width: 100, Sortable: true },
    { Title: 'AE Bandwidth', Key: 'aeBandwidth', Width: 120, Sortable: true },
    { Title: 'Input Rate', Key: 'inputRateMbps', Width: 120, Sortable: true },
    { Title: 'Output Rate', Key: 'outputRateMbps', Width: 120, Sortable: true },
    { Title: 'Shut Link', Key: 'shutLinkHtml', Width: 100, Sortable: false },
  ], []);

  const hosts = useMemo(() => Array.from(new Set(rows.map(r => r.host).filter(Boolean))), [rows]);
  const statuses = useMemo(() => Array.from(new Set(rows.map(r => r.status).filter(Boolean))), [rows]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:12, padding:14 }}>
          <div style={{ color:'#3730a3', fontSize:12, fontWeight:600 }}>TỔNG LINK</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#3730a3' }}>{sum.total}</div>
        </div>
        <div style={{ background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:12, padding:14 }}>
          <div style={{ color:'#166534', fontSize:12, fontWeight:600 }}>UP</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#166534' }}>{sum.up}</div>
        </div>
        <div style={{ background:'#fee2e2', border:'1px solid #fecaca', borderRadius:12, padding:14 }}>
          <div style={{ color:'#991b1b', fontSize:12, fontWeight:600 }}>DOWN</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#991b1b' }}>{sum.down}</div>
        </div>
        <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, padding:14 }}>
          <div style={{ color:'#b45309', fontSize:12, fontWeight:600 }}>SHUT LINK</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#b45309' }}>{sum.shutYes}</div>
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, marginBottom:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8 }}>
          <input 
            placeholder='Tìm kiếm...' 
            value={filters.q} 
            onChange={e=>setFilters(p=>({...p,q:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          />
          <select 
            value={filters.host} 
            onChange={e=>setFilters(p=>({...p,host:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Host</option>
            {hosts.map(h=> <option key={h} value={h}>{h}</option>)}
          </select>
          <select 
            value={filters.status} 
            onChange={e=>setFilters(p=>({...p,status:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Status</option>
            {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filters.shutLink} 
            onChange={e=>setFilters(p=>({...p,shutLink:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14 }}
          >
            <option value='all'>Lọc Shut Link</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden' }}>
        {filtered && filtered.length > 0 ? (
          <CtrlDynamicTable
            id="i002-badlink-table"
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
    </div>
  );
}
