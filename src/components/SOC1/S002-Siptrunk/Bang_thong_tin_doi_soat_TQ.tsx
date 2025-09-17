import React, { useState } from 'react';

type DoiSoat = {
  Number: string;
  Phantom_number: string;
  Account_name_csdl: string;
  Account_name_be: string;
  account_info_csdl: string;
  account_info_be: string;
  Max_channel_csdl: string;
  Max_channel_be: string;
  Destination_csdl: string;
  Destionation_be: string;
  status: string;
  ADDRESS_DISABLE: string;
  values_added: string;
  ADDRESS_INCOMING: string;
  ROUTING_TABLE_NAME: string;
  category: string;
  service_type: string;
  brand_name: string;
  Ghi_chu: string
};

interface Props {
  title: string;
  data: DoiSoat[];
  onClose?: () => void;
}

const BangThongTinDoiSoatTQ: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo Ten_APN
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.Number.toLowerCase();
    const nameB = b.Number.toLowerCase();
    if (nameA < nameB) return sortAsc ? -1 : 1;
    if (nameA > nameB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleExport = () => {
    alert("Đang xử lý xuất Excel...");
    // Bạn có thể thay bằng logic thật để gọi API xuất file
  };

  if (data.length === 0) return null;

  return (
    <div className="box_list" style={{ marginTop: '20px' }} onClick={onClose}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          marginBottom: '10px',
        }}
      >
        <h4
          className="text_display"
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'brown',
          }}
        >
          {title}
        </h4>

        <div
          style={{
            position: 'absolute',
            right: 0,
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '160px',
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExport();
            }}
            style={{
              padding: '5px 12px',
              backgroundColor: '#3f8cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Xuất Excel
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="bang_apn">
          <thead>
            <tr className="tieu_de">
               <th
                className="tieu_de"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSortAsc(!sortAsc);
                }}
              >
                Number {sortAsc ? '▲' : '▼'}
              </th>
              <th className="tieu_de">Phantom Number</th>
              <th className="tieu_de">Account Name (CSDL)</th>
              <th className="tieu_de">Account Name (BE)</th>
              <th className="tieu_de">Account Info (CSDL)</th>
              <th className="tieu_de">Account Info (BE)</th>
              <th className="tieu_de">Max channels (CSDL)</th>
              <th className="tieu_de">Max channels (BE)</th>
              <th className="tieu_de">Destination (CSDL)</th>
              <th className="tieu_de">Destination (BE)</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
             {sortedData.map((item, index) => (
              <tr className="du_lieu" key={index}>
                <td>{item.Number}</td>
                <td>{item.Phantom_number}</td>
                <td>{item.Account_name_csdl}</td>
                <td>{item.Account_name_be}</td>
                <td>{item.account_info_csdl}</td>
                <td>{item.account_info_be}</td>
                <td>{item.Max_channel_csdl}</td>
                <td>{item.Max_channel_be}</td>
                <td>{item.Destination_csdl}</td>
                <td>{item.Destionation_be}</td>
                <td>{item.Ghi_chu}</td>

              </tr>
  //             Number: string;
  // Phantom_number: string;
  // Account_name_csdl: string;
  // Account_name_be: string;
  // account_info_csdl: string;
  // account_info_be: string;
  // Max_channel_csdl: string;
  // Max_channel_be: string;
  // Destination_csdl: string;
  // Destionation_be: string;
  // status: string;
  // ADDRESS_DISABLE: string;
  // values_added: string;
  // ADDRESS_INCOMING: string;
  // ROUTING_TABLE_NAME: string;
  // category: string;
  // service_type: string;
  // brand_name: string;
  // Ghi_chu: string
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTinDoiSoatTQ;
