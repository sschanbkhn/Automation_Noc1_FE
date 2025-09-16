import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import "./index.css";

type ThietBi = {
  TENANT_ID: string;
  ACCOUNT_NAME : string;
  ACC_INFO : string;
  MAX_CHANNELS : string;
  ADDRESS_NUMBER : string;
  ADDRESS_DISABLE : string;
  ADDRESS_INCOMING : string;
  ROUTING_TABLE_NAME : string;
  GROUP_ID : string;
  SIPTRUNK_NAME : string;
  SIPTRUNK_INFO : string;
  SIP_CONTACT : string;
  Khu_vuc : string;
  Ghi_chu : string;
};

interface Props {
  title: string;
  data: ThietBi[];
  onClose?: () => void;
}

const BangThongTin: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo ADDRESS_NUMBER
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.ADDRESS_NUMBER.toLowerCase();
    const nameB = b.ADDRESS_NUMBER.toLowerCase();
    if (nameA < nameB) return sortAsc ? -1 : 1;
    if (nameA > nameB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleExport = () => {
    // Giả định bạn sẽ xử lý việc xuất file Excel ở đây
    alert("Đang xử lý xuất Excel...");
  };

  if (data.length === 0) return null;

  return (
    <div
  className="box_list"
  style={{ marginTop: '20px' }}
  onClick={onClose}
>
  <div
    style={{
      display: 'flex',
      justifyContent: 'center', // Để tiêu đề giữa
      alignItems: 'center',
      position: 'relative',     // Để căn input/nút ở góc phải
      marginBottom: '10px'
    }}
  >
    {/* Tiêu đề nằm chính giữa */}
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

    {/* Input và nút xuất Excel ở bên phải */}
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
        onClick={(e) => e.stopPropagation()} // tránh việc click làm đóng bảng
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
              {/* <th className="tieu_de">Tên APN</th> */}
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
              <th className="tieu_de">Account Name</th>
              <th className="tieu_de">Account Info</th>
              <th className="tieu_de">Max channels</th>
              <th className="tieu_de">Destination</th>
              <th className="tieu_de">Siptrunk Name</th>
              <th className="tieu_de">Siptrunk Info</th>
              <th className="tieu_de">Routing Table</th>
              <th className="tieu_de">Group ID</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr className="du_lieu" key={index}>
                <td>{item.ADDRESS_NUMBER}</td>
                <td>{item.ACCOUNT_NAME}</td>
                <td>{item.ACC_INFO}</td>
                <td>{item.MAX_CHANNELS}</td>
                <td>{item.SIP_CONTACT}</td>
                <td>{item.SIPTRUNK_NAME}</td>
                <td>{item.SIPTRUNK_INFO}</td>
                <td>{item.ROUTING_TABLE_NAME}</td>
                <td>{item.GROUP_ID }</td>
                <td>{item.Ghi_chu }</td>
                {/* TENANT_ID: string; */}
 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTin;
