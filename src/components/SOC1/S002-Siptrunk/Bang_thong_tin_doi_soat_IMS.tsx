import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";

type DoiSoat = {
    number: string;
    phantom_digit: string;
    Max_channel_csdl:  number;
    Max_channel_be:  number;
    Account_name_csdl: string;
    Account_name_be: string;
    Destination_csdl: string;
    Destination_be: string;
    loaihinh_csdl: string;
    loaihinh_be:string;
    status: string;
    Khu_vuc: string;
    Ghi_chu: string;
  };

interface Props {
  title: string;
  data: DoiSoat[];
  onClose?: () => void;
}

const BangThongTinDoiSoatIms: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);


const filteredData = data.filter(item =>
    Object.values(item).some(
      (value) => (value ? value.toString().toLowerCase() : "").includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo Ten_APN
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.number.toLowerCase();
    const nameB = b.number.toLowerCase();
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

      // Tạo header
      const headers = Object.keys(sortedData[0]);
      const headerRow = worksheet.addRow(headers);

      // Style header
      headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3f8cff" },
      };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };

      // Ghi dữ liệu
      sortedData.forEach((row) => {
        worksheet.addRow(Object.values(row));
      });

      // Set độ rộng cột
      worksheet.columns = headers.map(() => ({ width: 20 }));

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `ThongTinLechDoiSoat_vIMS_${timestamp}.xlsx`;
      saveAs(new Blob([buffer]), filename);

      alert("✅ Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("❌ Xuất Excel thất bại.");
    }
  };
  if (data.length === 0) return null;

  return (
    <div className="box_list" style={{ marginTop: '20px' }} onClick={onClose}>
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
            onClick={(e) => e.stopPropagation()} // <-- ngăn onClose bị gọi
          />

          <button
             onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện click lên div cha
                handleExport();       // Gọi hàm xuất Excel
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
              <th className="tieu_de">Number(Phantom)</th>
              <th className="tieu_de">Số CGĐT (CSDL)</th>
              <th className="tieu_de">Số CGĐT (BE)</th>
              <th className="tieu_de">AccountName (CSDL)</th>
              <th className="tieu_de">AccountName (BE)</th>
              <th className="tieu_de">IP K/H (CSDL)</th>
              <th className="tieu_de">IP K/H (BE)</th>
              <th className="tieu_de">Loại Hình (CSDL)</th>
              <th className="tieu_de">Loại Hình (BE)</th>
              <th className="tieu_de">Status (CSDL)</th>
              <th className="tieu_de">Khu_vuc</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
             
             {sortedData.map((item, index) => {
            // So sánh các trường
              const ChannelMismatch = item.Max_channel_csdl !== item.Max_channel_be;
              const AccNameMismatch = item.Account_name_csdl !== item.Account_name_be;
              const DestMismatch = item.Destination_csdl !== item.Destination_be;
              const MoQteMismatch =
                    (item.loaihinh_be === "Mở Qte" && !item.loaihinh_csdl?.includes("Mở QTE")) ||
                    (item.loaihinh_be !== "Mở Qte" && item.loaihinh_csdl?.includes("Mở QTE"))
              const KhoaQteMismatch =
                    (item.loaihinh_be === "Khoá Qte" && !item.loaihinh_csdl?.includes("Khóa QTE")) ||
                    (item.loaihinh_be !== "Khoá Qte" && item.loaihinh_csdl?.includes("Khóa QTE"))

              return (
                <tr className="du_lieu" key={index}>
                  <td>{item.number}</td>
                  <td>{item.phantom_digit}</td>
                  <td style={{ color: ChannelMismatch ? 'red' : 'inherit' }}>{item.Max_channel_csdl}</td>
                  <td style={{ color: ChannelMismatch ? 'red' : 'inherit' }}>{item.Max_channel_be}</td>

                  <td style={{ color: AccNameMismatch ? 'red' : 'inherit' }}>{item.Account_name_csdl}</td>
                  <td style={{ color: AccNameMismatch ? 'red' : 'inherit' }}>{item.Account_name_be}</td>

                  <td style={{ color: DestMismatch ? 'red' : 'inherit' }}>{item.Destination_csdl}</td>
                  <td style={{ color: DestMismatch ? 'red' : 'inherit' }}>{item.Destination_be}</td>
                  <td style={{ color: (MoQteMismatch||KhoaQteMismatch) ? 'red' : 'inherit' }}>{item.loaihinh_csdl}</td>
                  <td style={{ color: (MoQteMismatch||KhoaQteMismatch) ? 'red' : 'inherit' }}>{item.loaihinh_be}</td>
                  <td>{item.status}</td>
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

export default BangThongTinDoiSoatIms;
