import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

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
  Khu_vuc: string;
  Ghi_chu: string
};

interface Props {
  title: string;
  data: DoiSoat[];
  onClose?: () => void;
}

const BangThongTinDoiSoatTQMB: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredData = data.filter(item =>
    Object.values(item).some(
      (value) => (value ? value.toString().toLowerCase() : "").includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo Number
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.Number.toLowerCase();
    const nameB = b.Number.toLowerCase();
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
        const headerMap: Partial<Record<keyof DoiSoat, string>> = {
          Number: "Number",
          Phantom_number: "Phantom Number",
          Account_name_csdl: "AccountName(CSDL)",
          Account_name_be: "Account Name(BE)",
          Max_channel_csdl: "Max channels(CSDL)",
          Max_channel_be: "Max channels(BE)",
          Ghi_chu: "Ghi chú",
        };
        const keys = Object.keys(headerMap) as (keyof DoiSoat)[];
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
        const filename = `ThongTinLechDuLieuDoiSoat_Siptrunk${timestamp}.xlsx`;
        saveAs(new Blob([buffer]), filename);
  
        alert("✅ Xuất Excel thành công!");
      } catch (error) {
        console.error("Lỗi xuất Excel:", error);
        alert("❌ Xuất Excel thất bại.");
      }
    };

  if (data.length === 0) return null;

  return (
    <div className="box_list" style={{ marginTop: "20px" }}>
      {/* Header tiêu đề + tìm kiếm + nút */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          marginBottom: "10px",
        }}
      >
        <h4
          className="text_display"
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "bold",
            color: "brown",
          }}
        >
          {title}
        </h4>

        <div
          style={{
            position: "absolute",
            right: 0,
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "160px",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={handleExport}
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

          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: "5px 12px",
                backgroundColor: "#d33",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ✖ Đóng
            </button>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="bang_sip">
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
              <th className="tieu_de">Phantom Number (CSDL)</th>
              <th className="tieu_de">Account Name (CSDL)</th>
              <th className="tieu_de">Account Name (BE)</th>
              <th className="tieu_de">Max channels (CSDL)</th>
              <th className="tieu_de">Max channels (BE)</th>
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
                <td>{item.Max_channel_csdl}</td>
                <td>{item.Max_channel_be}</td>
                {/* <td>{item.Ghi_chu}</td> */}
                <td title={item.Ghi_chu}>
                  {item.Ghi_chu && item.Ghi_chu.length > 30
                    ? item.Ghi_chu.slice(0, 30) + "..."
                    : item.Ghi_chu}
                </td>

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

export default BangThongTinDoiSoatTQMB;
