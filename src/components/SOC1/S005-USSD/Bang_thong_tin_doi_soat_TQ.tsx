import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type DoiSoat = {
    SP_ID : string;
    service_name_csdl : string;
    name_be : string;
    short_code_csdl : string;
    short_code_be : string;
    status_csdl : string;
    status_be : string;
    gateway_name_csdl : string;
    ip_addr_csdl : string;
    url_csdl : string;
    ip_be : string;
    protocol_be : string;
    url_be : string;
    ussd_name : string;
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
      const numA = (a.SP_ID ?? "").toString().toLowerCase();
      const numB = (b.SP_ID ?? "").toString().toLowerCase();
  
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
          SP_ID : "SP_ID",
          service_name_csdl : "Name (CSDL)",
          name_be : "Name (BE)",
          short_code_csdl : "ShortCode (CSDL)",
          short_code_be : "ShortCode (BE)",
          status_csdl : "Status (CSDL)",
          status_be : "Status (BE)",
          gateway_name_csdl : "Gateway (CSDL)",
          ip_addr_csdl : "IP (CSDL)",
          url_csdl : "URL (CSDL)",
          ip_be : "IP (BE)",
          protocol_be : "Protocol (BE)",
          url_be : "URL (BE)",
          ussd_name : "USSD Name",
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
                SP_ID {sortAsc ? '▲' : '▼'}
              </th>

              <th className="tieu_de">Name (CSDL)</th>
              <th className="tieu_de">Name (BE)</th>
              <th className="tieu_de">ShortCode (CSDL)</th>
              <th className="tieu_de">ShortCode (BE)</th>
              <th className="tieu_de">Status (CSDL)</th>
              <th className="tieu_de">Status (BE)</th>
              <th className="tieu_de">IP (CSDL)</th>
              <th className="tieu_de">IP (BE)</th>
              <th className="tieu_de">URL (CSDL)</th>
              <th className="tieu_de">URL (BE)</th>
              <th className="tieu_de">Gateway (CSDL)</th>
              <th className="tieu_de">Protocol (BE)</th>
              <th className="tieu_de">USSD Name</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody> 
             {sortedData.map((item, index) => {
            // So sánh các trường
              const ShortCodeMismatch = item.short_code_csdl !== item.short_code_be;
              const StatusMismatch = item.status_csdl !== item.status_be;
              const IpMismatch = item.ip_addr_csdl !== item.ip_be;
              const UrlMismatch = item.url_csdl !== item.url_be;
              return (
                <tr className="du_lieu" key={index}>
                  <td>{item.SP_ID}</td>
                  <td title={item.service_name_csdl}>
                    {item.service_name_csdl && item.service_name_csdl.length > 30
                      ? item.service_name_csdl.slice(0, 30) + "..."
                      : item.service_name_csdl}
                  </td>
                  <td title={item.name_be}>
                    {item.name_be && item.name_be.length > 30
                      ? item.name_be.slice(0, 30) + "..."
                      : item.name_be}
                  </td>
                  <td style={{ color: ShortCodeMismatch? 'red' : 'inherit' }} title={item.short_code_csdl} >
                    {item.short_code_csdl && item.short_code_csdl.length > 30
                      ? item.short_code_csdl.slice(0, 30) + "..."
                      : item.short_code_csdl}
                  </td>
                  <td style={{ color: ShortCodeMismatch? 'red' : 'inherit' }} title={item.short_code_be} >
                    {item.short_code_be && item.short_code_be.length > 30
                      ? item.short_code_be.slice(0, 30) + "..."
                      : item.short_code_be}
                  </td>
                  <td style={{ color: StatusMismatch ? 'red' : 'inherit' }}>{item.status_csdl}</td>
                  <td style={{ color: StatusMismatch ? 'red' : 'inherit' }}>{item.status_be}</td>

                  <td style={{ color: IpMismatch? 'red' : 'inherit' }} title={item.ip_addr_csdl} >
                    {item.ip_addr_csdl && item.ip_addr_csdl.length > 30
                      ? item.ip_addr_csdl.slice(0, 30) + "..."
                      : item.ip_addr_csdl}
                  </td>
                  <td style={{ color: IpMismatch? 'red' : 'inherit' }} title={item.ip_be} >
                    {item.ip_be && item.ip_be.length > 30
                      ? item.ip_be.slice(0, 30) + "..."
                      : item.ip_be}
                  </td>

                  <td style={{ color: UrlMismatch? 'red' : 'inherit' }} title={item.url_csdl} >
                    {item.url_csdl && item.url_csdl.length > 30
                      ? item.url_csdl.slice(0, 30) + "..."
                      : item.url_csdl}
                  </td>
                  <td style={{ color: UrlMismatch? 'red' : 'inherit' }} title={item.url_be} >
                    {item.url_be && item.url_be.length > 30
                      ? item.url_be.slice(0, 30) + "..."
                      : item.url_be}
                  </td>
                  <td>{item.gateway_name_csdl}</td>
                  <td>{item.protocol_be}</td>
                  <td>{item.ussd_name}</td>
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

           
        
