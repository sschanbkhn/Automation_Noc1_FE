import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type DoiSoat = {
    number : string;
    account_name_csdl : string;
    account_name_be : string;
    so_dich_csdl : string;
    so_dich_be : string;
    so_cgdt_csdl : string;
    so_cgdt_be : string;
    status_csdl : string;
    tam_ngung_be : string;
    chan_goi_ra_be : string;
    Khu_vuc : string;
    Ghi_chu : string;
  };

interface Props {
  title: string;
  data: DoiSoat[];
  loading?: boolean; // 👈 thêm dòng này
  onClose?: () => void;
}

const BangThongTinDoiSoatTQBox: React.FC<Props> = ({ title, data, onClose, loading }) => {
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
      const numA = (a.number ?? "").toString().toLowerCase();
      const numB = (b.number ?? "").toString().toLowerCase();
  
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
          number: "Number",
          account_name_csdl : "Account Name (CSDL)",
          account_name_be : "Account Name (BE)",
          so_dich_csdl : "Số đích (CSDL)",
          so_dich_be :  "Số đích (BE)",
          so_cgdt_csdl : "Số CGĐT (CSDL)",
          so_cgdt_be : "Số CGĐT (BE)",
          status_csdl : "Status (CSDL)",
          tam_ngung_be : "Tạm ngưng (BE)",
          chan_goi_ra_be : "Chặn gọi ra(BE)",
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
                Number {sortAsc ? '▲' : '▼'}
              </th>
              <th className="tieu_de">Account Name (CSDL)</th>
              <th className="tieu_de">Account Name (BE)</th>
              <th className="tieu_de">Số đích (CSDL)</th>
              <th className="tieu_de">Số đích (BE)</th>
              <th className="tieu_de">Số CGĐT (CSDL)</th>
              <th className="tieu_de">Số CGĐT (BE)</th>
              <th className="tieu_de">Status (CSDL)</th>
              <th className="tieu_de">Tạm ngưng (BE)</th>
              <th className="tieu_de">Chặn gọi ra(BE)</th>
              <th className="tieu_de">Khu vực</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
             {sortedData.map((item, index) => {
            // So sánh các trường
              const AccNameMismatch = item.account_name_csdl !== item.account_name_be;
              const SoDichMismatch = item.so_dich_csdl !== item.so_dich_be;
              // 👇 ép kiểu sang số khi so sánh Max channel
              const ThanhLyMatch = item.status_csdl === "Đã thanh lý"
              const TamNgungMismatch = (item.tam_ngung_be === "yes") && (item.status_csdl !== "Đang tạm ngưng")||
                                        (item.tam_ngung_be !== "yes") && (item.status_csdl === "Đang tạm ngưng");

              return (
                <tr className="du_lieu" key={index}>
                  <td>{item.number}</td>
                  <td style={{ color: AccNameMismatch ? 'red' : 'inherit' }}>{item.account_name_csdl}</td>
                  <td style={{ color: AccNameMismatch ? 'red' : 'inherit' }}>{item.account_name_be}</td>
                  <td style={{ color: SoDichMismatch ? 'red' : 'inherit' }}>{item.so_dich_csdl}</td>
                  <td style={{ color: SoDichMismatch ? 'red' : 'inherit' }}>{item.so_dich_be}</td>
                  <td>{item.so_cgdt_csdl}</td>
                  <td>{item.so_cgdt_be}</td>
                  <td style={{  color: (ThanhLyMatch || TamNgungMismatch) ? 'red' : 'inherit' }}>{item.status_csdl}</td>
                  <td style={{ color: TamNgungMismatch ? 'red' : 'inherit' }}>{item.tam_ngung_be}</td>
                  <td>{item.chan_goi_ra_be}</td>
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

export default BangThongTinDoiSoatTQBox;

           
        
