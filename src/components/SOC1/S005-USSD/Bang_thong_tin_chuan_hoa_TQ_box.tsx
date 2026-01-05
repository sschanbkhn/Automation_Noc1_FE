import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type DoiSoat = {
    name :string;
    system_id : string;
    state : string;
    bind_type : string;
    allowed_ips : string;
    allowed_shortcodes : string;
    max_connection : string;
    created_at : string;
    smpp_name : string;
    Ghi_chu : string;
  };

interface Props {
  title: string;
  data: DoiSoat[];
  loading?: boolean; // 👈 thêm dòng này
  onClose?: () => void;
}

const BangThongTinChuanHoaBox: React.FC<Props> = ({ title, data, onClose, loading }) => {
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
            name : "Name",
            system_id : "System_ID",
            state : "State",
            bind_type : "Bind_Type",
            allowed_ips : "Allow_IPS",
            allowed_shortcodes : "ShortCode",
            max_connection : "Max_Connection",
            created_at : "Creat_at",
            smpp_name : "SMPP_Name",
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
         <table className="bang_sip" style={{ width: "100%" }}>
          <thead>
            <tr >
              <th
                
                style={{ cursor: "pointer", userSelect: "none",border: "1px solid #ccc"}}
                onClick={(e) => {
                  e.stopPropagation();
                  setSortAsc(!sortAsc);
                }}
              >
                System_ID{sortAsc ? "▲" : "▼"}
              </th>
              <th style={{ border: "1px solid #ccc" }}>Name</th>
              <th style={{ border: "1px solid #ccc" }}>State</th>
              <th style={{ border: "1px solid #ccc" }}>Bind Type</th>
              <th style={{ border: "1px solid #ccc" }}>Allowed IPS</th>
              <th style={{ border: "1px solid #ccc" }}>Short Code</th>
              <th style={{ border: "1px solid #ccc" }}>Max Connection</th>
              <th style={{ border: "1px solid #ccc" }}>Created time</th>
              <th style={{ border: "1px solid #ccc" }}>SMPP Name</th>
              <th style={{ border: "1px solid #ccc" }}>Ghi chú</th>
            </tr>
           
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.system_id}</td>
                <td>{item.name}</td>
                <td>{item.state}</td>
                <td>{item.bind_type}</td>
                <td>{item.allowed_ips}</td>
                <td title={item.allowed_shortcodes}>
                  {item.allowed_shortcodes?.length > 30
                    ? item.allowed_shortcodes.slice(0, 30) + "..."
                    : item.allowed_shortcodes}
                </td>
                <td>{item.max_connection}</td>
                <td title={item.created_at}>
                  {item.created_at?.length > 30
                    ? item.created_at.slice(0, 30) + "..."
                    : item.created_at}
                </td>
                <td>{item.smpp_name}</td>
                <td title={item.Ghi_chu}>
                  {item.Ghi_chu?.length > 30
                    ? item.Ghi_chu.slice(0, 30) + "..."
                    : item.Ghi_chu}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTinChuanHoaBox;

           
        
