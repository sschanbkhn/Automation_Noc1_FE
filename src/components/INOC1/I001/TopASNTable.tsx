import React from 'react';
import { ASNTab2Data } from './mockDataTab2';

interface TopASNTableProps {
  data: ASNTab2Data[];
  expandedASNId: number | null;
  onRowClick: (row: ASNTab2Data) => void;
}

const TopASNTable: React.FC<TopASNTableProps> = ({
  data,
  expandedASNId,
  onRowClick
}) => {
  return (
    <div className="top-asn-table-container">
      <table className="top-asn-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th style={{ width: '120px' }}>ASN</th>
            <th>AS Name</th>
            <th style={{ width: '160px' }}>Max In</th>
            <th style={{ width: '160px' }}>Max Out</th>
            <th style={{ width: '40px' }}>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <React.Fragment key={row.id}>
              <tr className="asn-row" onClick={() => onRowClick(row)}>
                <td className="text-center">{row.stt}</td>
                <td className="font-mono">{row.asn}</td>
                <td>{row.asName}</td>
                <td className="text-right">
                  <span className="badge badge-in">{row.maxIn}</span>
                </td>
                <td className="text-right">
                  <span className="badge badge-out">{row.maxOut}</span>
                </td>
                <td className="text-center">
                  <span className="expand-icon">
                    {expandedASNId === row.id ? '▼' : '▶'}
                  </span>
                </td>
              </tr>

              {/* Expanded prefix rows */}
              {expandedASNId === row.id && row.prefixes && (
                <tr className="prefix-row">
                  <td colSpan={6}>
                    <div className="prefix-container">
                      <h4>Chi tiết Prefix:</h4>
                      <div className="prefix-details-list">
                        {row.prefixes.map((prefix, idx) => (
                          <div key={idx} className="prefix-detail-item">
                            <div className="prefix-info">
                              <div className="prefix-name">
                                <span className="prefix-icon">📍</span>
                                <code>{prefix.prefix}</code>
                                {prefix.isCountered && (
                                  <span className="countered-badge">Đã Counter</span>
                                )}
                              </div>
                            </div>
                            <div className="prefix-traffic">
                              <div className="traffic-item">
                                <span className="traffic-label">Max In:</span>
                                <span className="traffic-value in">{prefix.maxIn}</span>
                              </div>
                              <div className="traffic-item">
                                <span className="traffic-label">Max Out:</span>
                                <span className="traffic-value out">{prefix.maxOut}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopASNTable;
