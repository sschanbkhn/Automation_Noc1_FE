import React, { useEffect, useMemo, useRef, useState } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlDialog from 'components/common/CtrlDialog';

const rawRows = [
  {
    Id: '1',
    appearTime: '14:57:01 15/10/2025',
    alarmId: 'AL-1001',
    device: 'PTO-BNG1',
    ipLoopback: '123.29.4.129',
    fpcSlot: 'FPC1',
    severity: 'Major',
    keyword: 'FPC temperature high',
    action: 'Check',
    status: 'Chưa xử lý',
    timeReboot: '-',
    timeClear: 'Not clear'
  },
  {
    Id: '2',
    appearTime: '14:45:01 15/10/2025',
    alarmId: 'AL-1002',
    device: 'PE-HNI-01',
    ipLoopback: '10.0.0.1',
    fpcSlot: 'FPC1',
    severity: 'Critical',
    keyword: 'Link flap detected',
    action: 'Check',
    status: 'Chưa xử lý',
    timeReboot: '-',
    timeClear: 'Not clear'
  },
  {
    Id: '3',
    appearTime: '14:15:01 15/10/2025',
    alarmId: 'AL-1003',
    device: 'PE-HCM-02',
    ipLoopback: '10.0.0.2',
    fpcSlot: 'FPC0',
    severity: 'Minor',
    keyword: 'Packet drop anomaly',
    action: 'Check',
    status: 'Manual',
    timeReboot: '-',
    timeClear: 'Cleared'
  }
];

const severityTag = (sev) => {
  const map = {
    Critical: { bg: '#fee2e2', color: '#b91c1c' },
    Major: { bg: '#fff7ed', color: '#b45309' },
    Minor: { bg: '#ecfeff', color: '#155e75' }
  };
  const s = map[sev] || { bg: '#f3f4f6', color: '#374151' };
  return `<span style="background:${s.bg};color:${s.color};padding:4px 10px;border-radius:999px;font-weight:600;">${sev}</span>`;
};

const statusTag = (status) => {
  const map = {
    'Chưa xử lý': { bg: '#f3f4f6', color: '#374151' },
    Manual: { bg: '#fff7ed', color: '#b45309' },
    Cleared: { bg: '#e8faf0', color: '#15803d' }
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
  return `<span style="background:${s.bg};color:${s.color};padding:4px 10px;border-radius:8px;font-weight:600;">${status}</span>`;
};

const actionBtn = (rowId) =>
  `<button class='btn-action-check' data-rowid='${rowId}' style='background:#1f2937;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-weight:600;'>Check</button>`;

export default function I002Dashboard() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [process, setProcess] = useState('all');
  const [status, setStatus] = useState('all');
  const [alarm, setAlarm] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const tableRef = useRef();

  const enrichedRows = useMemo(() => {
    return rawRows.map((r, idx) => ({
      ...r,
      severityHtml: severityTag(r.severity),
      statusHtml: statusTag(r.status),
      actionHtml: actionBtn(r.Id),
      key: idx
    }));
  }, []);

  const filtered = useMemo(() => {
    return enrichedRows.filter((r) => {
      const text = `${r.appearTime} ${r.alarmId} ${r.device} ${r.ipLoopback} ${r.keyword}`.toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;
      if (level !== 'all' && r.severity.toLowerCase() !== level) return false;
      if (process !== 'all' && r.action.toLowerCase() !== process) return false; // demo only
      if (status !== 'all' && r.status.toLowerCase() !== status) return false;
      if (alarm !== 'all' && !r.keyword.toLowerCase().includes(alarm)) return false;
      return true;
    });
  }, [search, level, process, status, alarm, enrichedRows]);

  const summary = useMemo(() => {
    const newCount = filtered.length; // demo rule
    const ackCount = filtered.filter((r) => r.status !== 'Chưa xử lý').length;
    const clearCount = filtered.filter((r) => r.timeClear === 'Cleared').length;
    return { newCount, ackCount, clearCount };
  }, [filtered]);

  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest('.btn-action-check');
      if (!btn) return;
      const id = btn.getAttribute('data-rowid');
      const row = enrichedRows.find((x) => x.Id === id);
      if (row) {
        setSelectedRow(row);
        setModalVisible(true);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [enrichedRows]);

  const columns = [
    { Title: 'Thời gian xuất hiện', Key: 'appearTime' },
    { Title: 'ID alarm', Key: 'alarmId' },
    { Title: 'Device', Key: 'device' },
    { Title: 'IP Loopback', Key: 'ipLoopback' },
    { Title: 'FPC slot', Key: 'fpcSlot' },
    { Title: 'Severity', Key: 'severityHtml' },
    { Title: 'Keyword', Key: 'keyword' },
    { Title: 'Action', Key: 'actionHtml' },
    { Title: 'Status process', Key: 'statusHtml' },
    { Title: 'Time Reboot', Key: 'timeReboot' },
    { Title: 'Time clear', Key: 'timeClear' }
  ];

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#ffe4e6', borderRadius: 12, padding: 14, border: '1px solid #fecdd3' }}>
          <div style={{ color: '#9f1239', fontSize: 12 }}>NEW ALARM</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#9f1239' }}>{summary.newCount}</div>
          <div style={{ fontSize: 12, color: '#9f1239' }}>Cập nhật lúc: 15:00:01 15/10/2025</div>
        </div>
        <div style={{ background: '#fef9c3', borderRadius: 12, padding: 14, border: '1px solid #fde68a' }}>
          <div style={{ color: '#b45309', fontSize: 12 }}>ACKNOWLEDGE ALARM</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#b45309' }}>{summary.ackCount}</div>
          <div style={{ fontSize: 12, color: '#b45309' }}>Cập nhật lúc: 15:00:01 15/10/2025</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: 12, padding: 14, border: '1px solid #a7f3d0' }}>
          <div style={{ color: '#065f46', fontSize: 12 }}>CLEAR ALARM</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#065f46' }}>{summary.clearCount}</div>
          <div style={{ fontSize: 12, color: '#065f46' }}>Cập nhật lúc: 15:00:01 15/10/2025</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb', marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 8 }}>
          <input
            placeholder="Tìm kiếm theo ID, device, IP hoặc keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <option value="all">Tất cả mức độ</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
          <select value={process} onChange={(e) => setProcess(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <option value="all">Tất cả xử lý</option>
            <option value="check">Check</option>
            <option value="clear">Clear</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="chưa xử lý">Chưa xử lý</option>
            <option value="manual">Manual</option>
            <option value="cleared">Cleared</option>
          </select>
          <select value={alarm} onChange={(e) => setAlarm(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <option value="all">Tất cả alarm</option>
            <option value="temperature">Nhiệt độ</option>
            <option value="flap">Link flap</option>
            <option value="packet">Packet</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'right', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Tổng cộng {filtered.length} cảnh báo đang được theo dõi</div>
        <CtrlDynamicTable id="i002-alarm-table" columnDefs={columns} dataItems={filtered} ref={tableRef} />
      </div>

      {/* Modal */}
      <CtrlDialog title={selectedRow ? `Chi tiết alarm ${selectedRow.alarmId}` : 'Chi tiết'} dialogVisible={modalVisible} onCancel={() => setModalVisible(false)}>
        {selectedRow && (
          <div>
            <div style={{ marginBottom: 8 }}><strong>Thiết bị:</strong> {selectedRow.device}</div>
            <div style={{ marginBottom: 8 }}><strong>IP Loopback:</strong> {selectedRow.ipLoopback}</div>
            <div style={{ marginBottom: 8 }}><strong>FPC Slot:</strong> {selectedRow.fpcSlot}</div>
            <div style={{ marginBottom: 8 }}><strong>Mức độ:</strong> {selectedRow.severity}</div>
            <div style={{ marginBottom: 12 }}><strong>Keyword:</strong> {selectedRow.keyword}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600 }} onClick={() => setModalVisible(false)}>Xác nhận đã kiểm tra</button>
              <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600 }} onClick={() => setModalVisible(false)}>Đóng</button>
            </div>
          </div>
        )}
      </CtrlDialog>
    </div>
  );
}
