import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type ThietBi = {
  ten_apn: string;
  ten_pgw: string;
  ip_cho_sim: string;
  ospf_area: string;
  dai_ip_sim: string;
  ip_pgw: string;
  vlan: string;
  hlr_apnid: string;
  hlr_pdpcp: string;
  hss_profile: string;
  ghi_chu: string;
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
  // 2. Sắp xếp theo Ten_APN
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.ten_apn.toLowerCase();
    const nameB = b.ten_apn.toLowerCase();
    if (nameA < nameB) return sortAsc ? -1 : 1;
    if (nameA > nameB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Hàm xuất Excel
  const handleExport = async () => {
    if (sortedData.length === 0) {
      alert("⚠️ Không có dữ liệu để xuất Excel");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách Thiết bị");

       // Map tiêu đề
    const headerMap: { [key in keyof ThietBi]: string } = {
      ten_apn: "Tên APN",
      ten_pgw: "Tên PGW",
      ip_cho_sim: "IP cho SIM",
      ospf_area: "OSPF Area",
      dai_ip_sim: "Dải IP SIM",
      ip_pgw: "IP PGW",
      vlan: "VLAN",
      hlr_apnid: "HLR APNID",
      hlr_pdpcp: "HLR PDPCP",
      hss_profile: "HSS Profile",
      ghi_chu:"Ghi chú"
    };
      
    // Lấy danh sách key và header
    const keys = Object.keys(headerMap) as (keyof ThietBi)[];
    const headers = Object.values(headerMap);

    // Tạo header row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "3f8cff" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    // Ghi dữ liệu theo key
    sortedData.forEach((row) => {
      const rowData = keys.map((k) => row[k] ?? "");
      worksheet.addRow(rowData);
    });

    // Set độ rộng cột
    worksheet.columns = headers.map(() => ({ width: 20 }));

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `ThongTinLechDuLieuBE_VPN3G4G_${timestamp}.xlsx`;
      saveAs(new Blob([buffer]), filename);

      alert("✅ Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("❌ Xuất Excel thất bại.");
    }
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
      {/* <button
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
      </button> */}
      <button
            onClick={(e) => {
              e.stopPropagation();
              handleExport();
            }}
            style={{
              padding: "5px 12px",
              backgroundColor: "#3f8cff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
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
                Tên APN {sortAsc ? '▲' : '▼'}
              </th>
              <th className="tieu_de">Tên PGW</th>
              <th className="tieu_de">IP cho SIM</th>
              <th className="tieu_de">OSPF Area</th>
              <th className="tieu_de">Dải IP SIM</th>
              <th className="tieu_de">IP PGW</th>
              <th className="tieu_de">VLAN</th>
              <th className="tieu_de">HLR APNID</th>
              <th className="tieu_de">HLR PDPCP</th>
              <th className="tieu_de">HSS Profile</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr className="du_lieu" key={index}>
                <td>{item.ten_apn}</td>
                <td>{item.ten_pgw}</td>
                <td>{item.ip_cho_sim}</td>
                <td>{item.ospf_area}</td>
                <td>{item.dai_ip_sim}</td>
                <td>{item.ip_pgw}</td>
                <td>{item.vlan}</td>
                <td>{item.hlr_apnid}</td>
                <td>{item.hlr_pdpcp}</td>
                <td>{item.hss_profile}</td>
                <td>{item.ghi_chu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTin;
