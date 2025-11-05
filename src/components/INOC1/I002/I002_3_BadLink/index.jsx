import React, { useEffect, useMemo, useRef, useState } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlDialog from 'components/common/CtrlDialog';
import I002BadLinkService from 'services/I002BadLinkService';

const chip = (text, fg, bg) => `<span style="background:${bg};color:${fg};padding:3px 10px;border-radius:999px;font-weight:600;">${text}</span>`;
const statusTag = (s) => ({ up: chip('up', '#166534', '#dcfce7'), down: chip('down', '#991b1b', '#fee2e2'), flap: chip('flap', '#9333ea', '#f3e8ff') }[s] || s);

const CheckHtml = (id, first) => (
  `<div style='display:flex;flex-direction:column;gap:6px'>
     <button class='btn-badlink-check' data-id='${id}' style='background:#111827;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-weight:600;'>Check</button>
     ${first ? `<span style='font-size:12px;color:#6b7280'>Lần đầu: ${first.time} • ${first.user}</span>` : ''}
   </div>`
);

export default function BadLinkTool() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ q: '', router: 'all', ip: 'all', port: 'all', pstatus: 'all', proc: 'all' });
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const tableRef = useRef();

  const load = async () => {
    const res = await I002BadLinkService.GetList();
    const data = (res?.Data || []).map((r, i) => ({
      ...r,
      Id: r.id,
      portStatusHtml: statusTag((r.portStatus || '').toLowerCase()),
      actionHtml: CheckHtml(r.id, r.firstCheck),
      bandwidthGbpsStr: (r.bandwidthGbps ?? '').toString(),
      currentGbpsStr: (r.currentGbps ?? '').toString(),
    }));
    setRows(data);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onClick = async (e) => {
      const el = e.target.closest('.btn-badlink-check');
      if (!el) return;
      const id = el.getAttribute('data-id');
      setCurrentId(id);
      const r = rows.find(x => x.id === id);
      if (r && !r.firstCheck) {
        r.firstCheck = { time: new Date().toLocaleString('vi-VN'), user: 'operator' };
        r.actionHtml = CheckHtml(r.id, r.firstCheck);
        setRows(prev => prev.map(x => x.id === r.id ? { ...r } : x));
      }
      const res = await I002BadLinkService.CheckLink(id);
      setDetail(res?.Data);
      setModal(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const text = `${r.id} ${r.time} ${r.router} ${r.ipLoopback} ${r.port} ${r.description}`.toLowerCase();
      if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
      if (filters.router !== 'all' && r.router !== filters.router) return false;
      if (filters.ip !== 'all' && r.ipLoopback !== filters.ip) return false;
      if (filters.port !== 'all' && r.port !== filters.port) return false;
      if (filters.pstatus !== 'all' && (r.portStatus || '').toLowerCase() !== filters.pstatus) return false;
      if (filters.proc !== 'all' && (r.statusProcess || '') !== filters.proc) return false;
      return true;
    }).map(r => ({ ...r, actionHtml: CheckHtml(r.id, r.firstCheck) }));
  }, [rows, filters]);

  const sum = useMemo(() => {
    const total = filtered.length;
    const ack = filtered.filter(r => !!r.firstCheck).length;
    const autoDisable = filtered.filter(r => (r.statusProcess || '').toLowerCase() === 'auto').length;
    const cannot = filtered.filter(r => (r.statusProcess || '').toLowerCase() === 'n/a').length;
    return { total, ack, autoDisable, cannot };
  }, [filtered]);

  const disablePort = async () => {
    if (!currentId) return;
    const res = await I002BadLinkService.DisablePort(currentId);
    if (res?.Success) {
      setRows(prev => prev.map(x => x.id === currentId ? { ...x, statusProcess: 'Auto' } : x));
      setModal(false);
    }
  };
  const markNA = async () => {
    if (!currentId) return;
    const res = await I002BadLinkService.MarkNA(currentId);
    if (res?.Success) {
      setRows(prev => prev.map(x => x.id === currentId ? { ...x, statusProcess: 'N/A' } : x));
      setModal(false);
    }
  };

  const columns = [
    { Title: 'ID', Key: 'id' },
    { Title: 'Time', Key: 'time' },
    { Title: 'Router', Key: 'router' },
    { Title: 'IP Loopback', Key: 'ipLoopback' },
    { Title: 'Port', Key: 'port' },
    { Title: 'Port status', Key: 'portStatusHtml' },
    { Title: 'Description', Key: 'description' },
    { Title: 'Bandwidth (Gbps)', Key: 'bandwidthGbpsStr' },
    { Title: 'Current Traffic (Gbps)', Key: 'currentGbpsStr' },
    { Title: 'Aggregated port', Key: 'aggPort' },
    { Title: 'Action', Key: 'actionHtml' },
    { Title: 'Status', Key: 'statusProcess' },
    { Title: 'Time Reboot', Key: 'timeReboot' },
    { Title: 'Time clear', Key: 'timeClear' },
  ];

  const routers = Array.from(new Set(rows.map(r => r.router)));
  const ips = Array.from(new Set(rows.map(r => r.ipLoopback)));
  const ports = Array.from(new Set(rows.map(r => r.port)));

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:12, padding:14 }}>
          <div style={{ color:'#3730a3', fontSize:12 }}>TỔNG LINK XẤU</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#3730a3' }}>{sum.total}</div>
        </div>
        <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:12, padding:14 }}>
          <div style={{ color:'#b45309', fontSize:12 }}>ACKNOWLEDGED LINK</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#b45309' }}>{sum.ack}</div>
        </div>
        <div style={{ background:'#d1fae5', border:'1px solid #a7f3d0', borderRadius:12, padding:14 }}>
          <div style={{ color:'#065f46', fontSize:12 }}>LINK AUTO-DISABLE</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#065f46' }}>{sum.autoDisable}</div>
        </div>
        <div style={{ background:'#ffe4e6', border:'1px solid #fecdd3', borderRadius:12, padding:14 }}>
          <div style={{ color:'#9f1239', fontSize:12 }}>LINK CANNOT ACTION</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#9f1239' }}>{sum.cannot}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, marginBottom:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr repeat(5,1fr)', gap:8 }}>
          <input placeholder='Tìm kiếm toàn bộ cột' value={filters.q} onChange={e=>setFilters(p=>({...p,q:e.target.value}))} />
          <select value={filters.router} onChange={e=>setFilters(p=>({...p,router:e.target.value}))}>
            <option value='all'>Loc Router</option>
            {routers.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filters.ip} onChange={e=>setFilters(p=>({...p,ip:e.target.value}))}>
            <option value='all'>Loc IP Loopback</option>
            {ips.map(ip=> <option key={ip} value={ip}>{ip}</option>)}
          </select>
          <select value={filters.port} onChange={e=>setFilters(p=>({...p,port:e.target.value}))}>
            <option value='all'>Loc Port</option>
            {ports.map(pt=> <option key={pt} value={pt}>{pt}</option>)}
          </select>
          <select value={filters.pstatus} onChange={e=>setFilters(p=>({...p,pstatus:e.target.value}))}>
            <option value='all'>Tất cả port</option>
            <option value='up'>up</option>
            <option value='down'>down</option>
            <option value='flap'>flap</option>
          </select>
          <select value={filters.proc} onChange={e=>setFilters(p=>({...p,proc:e.target.value}))}>
            <option value='all'>Tất cả xử lý</option>
            <option value='Auto'>Auto</option>
            <option value='N/A'>N/A</option>
            <option value=''>Chưa xử lý</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
        <div style={{ textAlign:'right', fontSize:13, color:'#6b7280', marginBottom:6 }}>Tổng cộng {filtered.length} link</div>
        <CtrlDynamicTable id='i002-badlink-table' columnDefs={columns} dataItems={filtered} ref={tableRef} />
      </div>

      {/* Modal */}
      <CtrlDialog title={detail ? `Xử lý link xấu • ${detail.id}` : 'Xử lý link xấu'} dialogVisible={modal} onCancel={()=>setModal(false)} size='small'>
        {detail && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:10 }}>
              <div><div style={{color:'#6b7280',fontSize:12}}>Port status</div><div dangerouslySetInnerHTML={{__html: statusTag((detail.portStatus||'').toLowerCase())}} /></div>
              <div><div style={{color:'#6b7280',fontSize:12}}>Băng thông</div><div style={{fontWeight:700}}>{detail.bandwidthGbps} Gbps</div></div>
              <div><div style={{color:'#6b7280',fontSize:12}}>Lưu lượng hiện tại</div><div style={{fontWeight:700}}>{detail.currentGbps} Gbps</div></div>
              <div><div style={{color:'#6b7280',fontSize:12}}>Sử dụng</div><div style={{fontWeight:700}}>{detail.usage}%</div></div>
            </div>

            <div style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:10, marginBottom:10 }}>
              <div style={{ fontWeight:700, marginBottom:6 }}>Hiệu suất Aggregated port - {detail.agg?.name || '-'}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                <div>
                  <div style={{color:'#6b7280',fontSize:12}}>Băng thông nhóm</div>
                  <div style={{fontWeight:700}}>{detail.agg?.groupBandwidth ?? 0} Gbps</div>
                </div>
                <div>
                  <div style={{color:'#6b7280',fontSize:12}}>Lưu lượng nhóm</div>
                  <div style={{fontWeight:700}}>{detail.agg?.groupTraffic ?? 0} Gbps</div>
                </div>
                <div>
                  <div style={{color:'#6b7280',fontSize:12}}>Sử dụng</div>
                  <div style={{fontWeight:700}}>{detail.agg?.usage ?? 0}%</div>
                </div>
              </div>
            </div>

            <div style={{ color:'#374151', background:'#f9fafb', border:'1px solid #e5e7eb', padding:10, borderRadius:8, marginBottom:10 }}>
              <div style={{ fontWeight:700, marginBottom:6 }}>Kết quả kiểm tra</div>
              <div>{detail.note}</div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={markNA} style={{ background:'#e5e7eb', color:'#111827', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:600 }}>N/A</button>
              <button onClick={disablePort} disabled={!detail.can_disable} style={{ background: detail.can_disable? '#ef4444' : '#e5e7eb', color: detail.can_disable? '#fff':'#9ca3af', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:600 }}>Port disable</button>
            </div>
          </div>
        )}
      </CtrlDialog>
    </div>
  );
}
