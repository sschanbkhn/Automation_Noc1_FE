import React, { useState, useRef } from 'react';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlDialog from 'components/common/CtrlDialog';
import CtrlNotification from 'components/common/CtrlNotification';
import axios from 'axios';

function randomIp(idx) {
  return `123.29.4.${40 + idx}`;
}

const frequencyOptions = [3, 6, 12, 24];

const initialRows = Array.from({ length: 10 }).map((_, idx) => {
  const frequency = 6;
  return {
    id: idx + 1,
    provinceCode: 'BGG',
    provinceName: 'Bắc Giang',
    device: `BGG-BNG${idx + 1}`,
    subNumber: '10.565.134',
    deletedNumber: '1.024',
    frequency,
    ipLoopback: randomIp(idx),
    key: idx,
  };
});

export default function MultiSessionTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  const [freqModalOpen, setFreqModalOpen] = useState(false);
  const [freqModalRow, setFreqModalRow] = useState(null);
  const [freqValue, setFreqValue] = useState(6);
  const [rows, setRows] = useState(initialRows);
  const [notification, setNotification] = useState(null);
  const tableRef = useRef();

  const handleFrequencyClick = (row) => {
    setFreqModalRow(row);
    setFreqValue(row.frequency || 6);
    setFreqModalOpen(true);
  };

  const columns = [
    { Title: 'Mã tỉnh', Key: 'provinceCode' },
    { Title: 'Tên tỉnh', Key: 'provinceName' },
    { Title: 'Thiết bị', Key: 'device' },
    { Title: 'Số thuê bao vượt phiên', Key: 'subNumber' },
    { Title: 'Số thuê bao bị xóa', Key: 'deletedNumber' },
    {
      Title: 'Tần suất / ngày',
      Key: 'frequency',
      Render: (_, row) => (
        <button
          type="button"
          className="btn-frequency-detail"
          onClick={() => handleFrequencyClick(row)}
          style={{
            background: '#fff',
            color: '#22c55e',
            border: '1px solid #22c55e',
            borderRadius: 16,
            padding: '2px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 1a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 2a1 1 0 0 1 1 1v3.586l2.293 2.293a1 1 0 1 1-1.414 1.414L10 10.414V6a1 1 0 0 1 1-1z" fill="#22c55e" />
          </svg>
          {row.frequency}
        </button>
      ),
    },
    {
      Title: 'Action',
      Key: 'action',
      Render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}
            onClick={() => {
              setModalRow(row);
              setModalOpen(true);
            }}
          >
            Clear
          </button>
        </div>
      ),
    },
  ];

  const handleFrequencyConfirm = async () => {
    try {
      const updatedRows = rows.map((row) => {
        if (row.id === freqModalRow.id) {
          return {
            ...row,
            frequency: freqValue,
          };
        }
        return row;
      });
      setRows(updatedRows);

      await axios.post(`/api/frequency/update`, {
        id: freqModalRow.id,
        frequency: freqValue,
      });

      setNotification({ type: 'success', message: 'Thay đổi thành công' });
    } catch (error) {
      console.error('Failed to update frequency:', error);
      setNotification({ type: 'error', message: 'Cập nhật tần suất thất bại' });
    } finally {
      setFreqModalOpen(false);
    }
  };

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
        <span style={{ color: '#ef4444', fontWeight: 600 }}>*</span> <span style={{ fontWeight: 500 }}>Tần suất thực hiện clear:</span>
        {frequencyOptions.map((opt) => (
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
          type="button"
          style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}
          onClick={handleFrequencyConfirm}
        >
          Xác nhận
        </button>
        <button
          type="button"
          style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}
          onClick={() => setFreqModalOpen(false)}
        >
          Hủy bỏ
        </button>
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
          dataItems={rows}
          ref={tableRef}
        />
      </div>
      <CtrlDialog
        title={modalRow ? `Chi tiết tham số sai (${modalRow.device})` : 'Chi tiết'}
        dialogVisible={modalOpen}
        onCancel={() => setModalOpen(false)}
        size="small"
      >
        <div style={{ padding: 12 }}>
          <p style={{ marginBottom: 6 }}>Chi tiết tham số sai sẽ hiển thị ở đây.</p>
        </div>
      </CtrlDialog>
      <CtrlDialog
        title="Xác nhận thay đổi số lần thực hiện trong ngày"
        dialogVisible={freqModalOpen}
        onCancel={() => setFreqModalOpen(false)}
        size="small"
      >
        {freqModalRow && renderFrequencyForm()}
      </CtrlDialog>
      {notification && (
        <CtrlNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
