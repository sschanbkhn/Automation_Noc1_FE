import React from 'react';

interface ASNRowData {
  id: number;
  stt: number;
  asn: string;
  asName: string;
  maxIn: string;
  maxOut: string;
  prefixes?: string[];
}

interface ASNTableProps {
  data: ASNRowData[];
  expandedASNId: number | null;
  onRowClick: (row: ASNRowData) => void;
}

const ASNTable: React.FC<ASNTableProps> = ({ data, expandedASNId, onRowClick }) => {
  return (
    <div className="asn-table-container">
      <table className="asn-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>STT</th>
            <th style={{ width: '120px' }}>ASN</th>
            <th>AS Name</th>
            <th style={{ width: '150px' }}>Max In</th>
            <th style={{ width: '150px' }}>Max Out</th>
            <th style={{ width: '30px' }}></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <React.Fragment key={row.id}>
              <tr
                className="asn-row"
                onClick={() => onRowClick(row)}
              >
                <td className="text-center">{row.stt}</td>
                <td className="font-mono">{row.asn}</td>
                <td className="text-left">{row.asName}</td>
                <td className="text-right">
                  <span className="badge badge-in">{row.maxIn}</span>
                </td>
                <td className="text-right">
                  <span className="badge badge-out">{row.maxOut}</span>
                </td>
                <td className="text-center">
                  {row.prefixes && row.prefixes.length > 0 && (
                    <span className="expand-icon">
                      {expandedASNId === row.id ? '▼' : '▶'}
                    </span>
                  )}
                </td>
              </tr>

              {/* Expanded prefix rows */}
              {expandedASNId === row.id && row.prefixes && (
                <tr className="prefix-row">
                  <td colSpan={6}>
                    <div className="prefix-container">
                      <h4>Các Prefix được add counter:</h4>
                      <div className="prefix-list">
                        {row.prefixes.map((prefix, idx) => (
                          <div key={idx} className="prefix-item">
                            <span className="prefix-icon">📍</span>
                            <code>{prefix}</code>
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

export default ASNTable;
