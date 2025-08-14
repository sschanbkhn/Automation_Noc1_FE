import React, { useState, useEffect, useRef, useCallback } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlDialog from 'components/common/CtrlDialog';
import data from './data.json';

function randomIp(idx) {
  return `123.29.4.${40 + idx}`;
}

const frequencyOptions = [3, 6, 12, 24];

const demoRows = Array.from({ length: 10 }).map((_, idx) => ({
  id: idx + 1,
  provinceCode: 'BGG',
  provinceName: 'Bắc Giang',
  device: `BGG-BNG${idx + 1}`,
  subNumber: '10.565.134',
  deletedNumber: '1.024',
  frequency: 6,
  ipLoopback: randomIp(idx),
  frequencyDetailHtml:
    `<span style="border:1px solid #22c55e;color:#22c55e;border-radius:16px;padding:2px 12px;display:inline-flex;align-items:center;gap:4px;">` +
    `<svg width='18' height='18' viewBox='0 0 20 20' fill='none' style='margin-right:2px;'><circle cx='10' cy='10' r='10' stroke='#22c55e' stroke-width='2'/><path d='M10 5v5l3 3' stroke='#22c55e' stroke-width='2' stroke-linecap='round'/></svg>` +
    6 +
    `</span> ` +
    `<button class='btn-frequency-detail' data-rowid='${idx + 1}' style='background:#fff;color:#2563eb;border:1px solid #2563eb;border-radius:4px;padding:2px 10px;cursor:pointer;font-weight:500;margin-left:8px;'>Chi tiết</button>`,
  key: idx,
}));

export default function MultiSessionTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  const [freqModalOpen, setFreqModalOpen] = useState(false);
  const [freqModalRow, setFreqModalRow] = useState(null);
  const [freqValue, setFreqValue] = useState(6);
  const tableRef = useRef();

  // Cột bảng
  const columns = [
    { Title: 'Mã tỉnh', Key: 'provinceCode' },
    { Title: 'Tên tỉnh', Key: 'provinceName' },
    { Title: 'Thiết bị', Key: 'device' },
    { Title: 'Số thuê bao vượt phiên', Key: 'subNumber' },
    { Title: 'Số thuê bao bị xóa', Key: 'deletedNumber' },
    { Title: 'Tần suất / ngày', Key: 'frequencyDetailHtml' },
    { Title: 'Action', Key: 'action', Render: (_, row) => (
      <button
        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}
        onClick={() => { setModalRow(row); setModalOpen(true); }}
      >Clear</button>
    ) },
  ];

  // Sự kiện click cho nút Chi tiết tần suất
  const handleTableClick = useCallback((e) => {
    const btn = e.target.closest('.btn-frequency-detail');
    if (btn) {
      const rowid = btn.getAttribute('data-rowid');
      const row = demoRows.find(r => String(r.id) === String(rowid));
      if (row) {
        setFreqModalRow(row);
        setFreqValue(row.frequency || 6);
        setFreqModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    const table = document.getElementById('multi-session-table');
    if (!table) return;
    table.addEventListener('click', handleTableClick);
    return () => table.removeEventListener('click', handleTableClick);
  }, [handleTableClick]);

  // Dữ liệu chi tiết cho modal (demo)
  const detailParams = [
    { name: 'LAC', actual: '100', expected: '101' },
    { name: 'RAC', actual: '200', expected: '201' },
    { name: 'CI', actual: '300', expected: '301' },
    { name: 'DLPrimaryScramblingCode', actual: '400', expected: '401' },
    { name: 'Frequency', actual: '2100', expected: '2101' },
    { name: 'AdminState', actual: 'locked', expected: 'unlocked' },
  ];

  // Form xác nhận thay đổi tần suất
  const renderFrequencyForm = () => (
    <div style={{ background: '#eaf6fd', borderRadius: 12, border: '2px solid #b6e0fe', padding: 24, minWidth: 340, maxWidth: 400 }}>
      <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 18, textAlign: 'center' }}>
        Xác nhận thay đổi số lần thực hiện trong ngày
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Tên thiết bị</div>
        <input value={freqModalRow?.device || ''} readOnly style={{ width: '100%', borderRadius: 16, border: 'none', background: '#fff', fontSize: 20, padding: '12px 16px', fontWeight: 500, boxShadow: '0 1px 4px #b6e0fe' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>IP Loopback</div>
        <input value={freqModalRow?.ipLoopback || ''} readOnly style={{ width: '100%', borderRadius: 16, border: 'none', background: '#fff', fontSize: 20, padding: '12px 16px', fontWeight: 500, boxShadow: '0 1px 4px #b6e0fe' }} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>*</span> <span style={{ fontWeight: 500 }}>Tần suất thực hiện clear :</span>
        {frequencyOptions.map(opt => (
          <label key={opt} style={{ marginLeft: 18, fontWeight: 500, fontSize: 18 }}>
            <input
              type="radio"
              name="frequency"
              value={opt}
              checked={freqValue === opt}
              onChange={() => setFreqValue(opt)}
              style={{ marginRight: 6 }}
            />
            {opt}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 18 }}>
        <button
          style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}
          onClick={() => setFreqModalOpen(false)}
        >Xác nhận</button>
        <button
          style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}
          onClick={() => setFreqModalOpen(false)}
        >Hủy bỏ</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: 24 }}>
      <h2 style={{ color: '#1890ff', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Thuê bao đa phiên</h2>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 18 }}>
        <CtrlDynamicTable
          id="multi-session-table"
          columnDefs={columns}
          dataItems={demoRows}
          ref={tableRef}
        />
      </div>
      {/* Modal chi tiết tham số sai */}
      <CtrlDialog
        title={modalRow ? `Chi tiết tham số sai (${modalRow.device})` : 'Chi tiết'}
        dialogVisible={modalOpen}
        onCancel={() => setModalOpen(false)}
        size="small"
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ border: '1px solid #e5e7eb', padding: 6 }}>Tên tham số</th>
              <th style={{ border: '1px solid #e5e7eb', padding: 6 }}>Giá trị thực tế</th>
              <th style={{ border: '1px solid #e5e7eb', padding: 6 }}>Giá trị mong muốn</th>
            </tr>
          </thead>
          <tbody>
            {detailParams.map((param, idx) => (
              <tr key={idx} style={{ background: param.actual !== param.expected ? '#fee2e2' : '#f0fdf4' }}>
                <td style={{ color: param.actual !== param.expected ? '#dc2626' : '#15803d', fontWeight: 500, border: '1px solid #e5e7eb', padding: 6 }}>{param.name}</td>
                <td style={{ color: param.actual !== param.expected ? '#dc2626' : '#15803d', border: '1px solid #e5e7eb', padding: 6 }}>{param.actual}</td>
                <td style={{ color: param.actual !== param.expected ? '#dc2626' : '#15803d', border: '1px solid #e5e7eb', padding: 6 }}>{param.expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button style={{ background: '#22c55e', color: '#fff', border: 'none' }} className="px-4 py-2 rounded hover:bg-green-700" onClick={() => { setModalOpen(false); }}>Gửi phiếu</button>
          <button style={{ background: '#ef4444', color: '#fff', border: 'none' }} className="px-4 py-2 rounded hover:bg-red-700" onClick={() => setModalOpen(false)}>Đóng</button>
        </div>
      </CtrlDialog>
      {/* Modal chi tiết tần suất có form xác nhận */}
      <CtrlDialog
        title={freqModalRow ? `Xác nhận thay đổi số lần thực hiện trong ngày` : 'Xác nhận thay đổi'}
        dialogVisible={freqModalOpen}
        onCancel={() => setFreqModalOpen(false)}
        size="small"
      >
        {freqModalRow && renderFrequencyForm()}
      </CtrlDialog>
    </div>
  );
} 