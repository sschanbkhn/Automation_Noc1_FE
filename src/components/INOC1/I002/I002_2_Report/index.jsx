import React, { useMemo, useRef, useState } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';

const mock = Array.from({ length: 15 }).map((_, i) => ({
  Id: String(i + 1),
  time: `2025-10-15 1${i % 10}:00:00`,
  alarmId: `AL-${1000 + i}`,
  device: `PE-HNI-${(i % 3) + 1}`,
  ipLoopback: `10.0.0.${i + 1}`,
  fpcSlot: `FPC${i % 2}`,
  severity: ['Minor', 'Major', 'Critical'][i % 3],
  keyword: ['Temperature', 'Link flap', 'Packet drop'][i % 3],
  result: ['Cleared', 'Manual', 'Chưa xử lý'][i % 3]
}));

const columns = [
  { Title: 'Thời gian', Key: 'time' },
  { Title: 'ID alarm', Key: 'alarmId' },
  { Title: 'Device', Key: 'device' },
  { Title: 'IP Loopback', Key: 'ipLoopback' },
  { Title: 'FPC slot', Key: 'fpcSlot' },
  { Title: 'Severity', Key: 'severity' },
  { Title: 'Keyword', Key: 'keyword' },
  { Title: 'Kết quả xử lý', Key: 'result' }
];

export default function I002Report() {
  const [from, setFrom] = useState(() => new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));
  const [keyword, setKeyword] = useState('');
  const ref = useRef();

  const filtered = useMemo(() => {
    return mock.filter(r => {
      if (keyword && !(r.alarmId + r.device + r.ipLoopback + r.keyword).toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [keyword]);

  const exportCSV = () => {
    const header = ['Thời gian','ID alarm','Device','IP Loopback','FPC slot','Severity','Keyword','Kết quả xử lý'];
    const rows = filtered.map(r => [r.time,r.alarmId,r.device,r.ipLoopback,r.fpcSlot,r.severity,r.keyword,r.result]);
    const csv = [header.join(','), ...rows.map(line => line.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `I002_Report_${from}_to_${to}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div>
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, marginBottom:10 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <div>
            <label style={{ fontSize:12, color:'#6b7280' }}>Từ ngày</label><br/>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'#6b7280' }}>Đến ngày</label><br/>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
          </div>
          <input placeholder="Từ khóa" value={keyword} onChange={e=>setKeyword(e.target.value)} style={{ flex:1, minWidth:220 }} />
          <button onClick={exportCSV} style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:600 }}>Xuất CSV</button>
        </div>
      </div>
      <CtrlDynamicTable id="i002-report-table" columnDefs={columns} dataItems={filtered} ref={ref} />
    </div>
  );
}
