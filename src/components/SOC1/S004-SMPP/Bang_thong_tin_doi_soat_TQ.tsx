import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type DoiSoat = {
    system_id : string;
    status_csdl : string;
    state_be : string;
    short_code_csdl : string;
    allowed_shortcodes_be : string;
    bind_type_csdl : string;
    bind_type_be : string;
    service_name_csdl: string;
    document_number_csdl : string;
    smpp_name_csdl : string;
    name_be : string;
    max_connection_be : string;
    Khu_vuc : string;
    Ghi_chu : string;
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
    Object.values(item).some(
      (value) => (value ? value.toString().toLowerCase() : "").includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo Number
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const numA = (a.system_id ?? "").toString().toLowerCase();
      const numB = (b.system_id ?? "").toString().toLowerCase();
  
      if (numA < numB) return sortAsc ? -1 : 1;
      if (numA > numB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortAsc]);

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
          system_id: "System_ID",
          status_csdl: "Status (CSDL)",
          state_be : "Status (BE)",
          short_code_csdl : "ShortCode (CSDL)",
          allowed_shortcodes_be :  "ShortCode (BE)",
          bind_type_csdl : "BindType (CSDL)",
          bind_type_be : "BindTyoe (BE)",
          service_name_csdl : "ServiceName (CSDL)",
          smpp_name_csdl : "SMPP Name (CSDL))",
          name_be : "SMPP Name (BE)",
          Khu_vuc : "Khu vực",
          Ghi_chu : "Ghi chú"
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
        const filename = `ThongTinLechDuLieuDoiSoat_18001900${timestamp}.xlsx`;
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
                System ID {sortAsc ? '▲' : '▼'}
              </th>

              <th className="tieu_de">Status (CSDL)</th>
              <th className="tieu_de">Status (BE)</th>
              <th className="tieu_de">ShortCode (CSDL)</th>
              <th className="tieu_de">ShortCode (BE)</th>
              <th className="tieu_de">BindType (CSDL)</th>
              <th className="tieu_de">BindTyoe (BE)</th>
              <th className="tieu_de">ServiceName (CSDL)</th>
              <th className="tieu_de">SMPP Name (CSDL)</th>
              <th className="tieu_de">SMPP Name (BE)</th>
              <th className="tieu_de">Khu vực</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
             {sortedData.map((item, index) => {
            // So sánh các trường
              const StatusMismatch = item.status_csdl !== item.state_be;
              const ShortCodeMismatch = item.short_code_csdl !== item.allowed_shortcodes_be;
              const BindTypeMismatch = item.bind_type_csdl !== item.bind_type_be;

              return (
                <tr className="du_lieu" key={index}>
                  <td>{item.system_id}</td>
                  <td style={{ color: StatusMismatch ? 'red' : 'inherit' }}>{item.status_csdl}</td>
                  <td style={{ color: StatusMismatch ? 'red' : 'inherit' }}>{item.state_be}</td>
                  <td style={{ color: ShortCodeMismatch ? 'red' : 'inherit' }} title={item.short_code_csdl} > 
                    {item.short_code_csdl && item.short_code_csdl.length > 30
                      ? item.short_code_csdl.slice(0, 30) + "..."
                      : item.short_code_csdl}
                  </td>
                  <td style={{ color: ShortCodeMismatch? 'red' : 'inherit' }} title={item.allowed_shortcodes_be} >
                    {item.allowed_shortcodes_be && item.allowed_shortcodes_be.length > 30
                      ? item.allowed_shortcodes_be.slice(0, 30) + "..."
                      : item.allowed_shortcodes_be}
                  </td>
                  <td style={{ color:BindTypeMismatch? 'red' : 'inherit' }}>{item.bind_type_csdl}</td>
                  <td style={{ color: BindTypeMismatch? 'red' : 'inherit' }}>{item.bind_type_be}</td>
                  <td title={item.service_name_csdl}>
                    {item.service_name_csdl && item.service_name_csdl.length > 30
                      ? item.service_name_csdl.slice(0, 30) + "..."
                      : item.service_name_csdl}
                  </td>
                  <td>{item.smpp_name_csdl}</td>
                  <td>{item.name_be}</td>
                  <td>{item.Khu_vuc}</td>
                  <td title={item.Ghi_chu}>
                    {item.Ghi_chu && item.Ghi_chu.length > 30
                      ? item.Ghi_chu.slice(0, 30) + "..."
                      : item.Ghi_chu}
                  </td>
                  </tr>
              );
            })}
          </tbody>
         </table>
      </div>
    </div>
  );
};

export default BangThongTinDoiSoatTQ;

           
        
