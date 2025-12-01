import React from 'react';
import { IPTMonitoringItem } from './mockDataTab3';

interface IPTMonitoringTableProps {
  data: IPTMonitoringItem[];
}

const IPTMonitoringTable: React.FC<IPTMonitoringTableProps> = ({ data }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="ipt-monitoring-table-container">
      <table className="ipt-monitoring-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th style={{ width: '140px' }}>Device</th>
            <th style={{ width: '140px' }}>Interface</th>
            <th style={{ width: '140px' }}>Partner</th>
            <th style={{ width: '120px' }}>PRTG_ID</th>
            <th style={{ width: '120px' }}>Capacity</th>
            <th style={{ width: '140px' }}>Day Added</th>
            <th style={{ width: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="ipt-row">
                <td className="text-center">{item.stt}</td>
                <td className="device-cell">{item.device}</td>
                <td className="interface-cell">
                  <code>{item.interface}</code>
                </td>
                <td className="partner-cell">{item.partner}</td>
                <td className="prtg-id-cell">
                  <code>{item.prtgId}</code>
                </td>
                <td className="capacity-cell">
                  <span className="capacity-badge">{item.capacity}</span>
                </td>
                <td className="date-cell">{formatDate(item.dayAdded)}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" title="Edit">
                      ✏️
                    </button>
                    <button className="action-btn delete-btn" title="Delete">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="empty-state">
                <div className="empty-message">
                  <span>Không có dữ liệu IPT</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="table-footer">
        <span className="total-items">Tổng cộng: {data.length} điểm theo dõi</span>
      </div>
    </div>
  );
};

export default IPTMonitoringTable;
