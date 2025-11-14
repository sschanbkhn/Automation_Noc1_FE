import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type ThietBi = {
  number: string;
  MTAS: string;
  pbx1: string;
  maxchannels_be: number;
  ibcf1: string;
  // number_check: string;
  Khu_vuc: string;
  Ghi_chu: string;
};

interface Props {
  title: string;
  data: ThietBi[];
   loading?: boolean; // 👈 thêm dòng này
  onClose?: () => void;
  
}

const BangThongTinIms: React.FC<Props> = ({ title, data, onClose, loading }) => {
  console.log("BangThongTinIms render:", title, data);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  // 🧩 1. Kiểm tra trạng thái loading
  // if (loading) {
  //   return (
  //     <div className="text-center text-blue-500 py-3">
  //       Đang tải dữ liệu...
  //     </div>
  //   );
  // }

  // 2️⃣ Không có dữ liệu
  // if (!data || data.length === 0) {
  //   return (
  //     <div className="text-center text-gray-600 py-5 relative">
  //       <div style={{
  //         fontSize: "20px",
  //         fontWeight: "600",
  //         color: "#444",
  //       }}>
  //     Không có dữ liệu</div>
  //       {onClose && (
  //         <button
  //           onClick={onClose}
  //           style={{
  //             position: "absolute",
  //             right: "10px",
  //             top: "10px",
  //             padding: "5px 12px",
  //             backgroundColor: "#d33",
  //             color: "white",
  //             border: "none",
  //             borderRadius: "6px",
  //             cursor: "pointer",
  //           }}
  //         >
  //           ✖ Đóng
  //         </button>
  //       )}
  //     </div>
  //   );
  // }
  const filteredData = data.filter(item =>
    Object.values(item).some(
      (value) => (value ? value.toString().toLowerCase() : "").includes(searchTerm.toLowerCase())
    )
  );
  
  // 2. Sắp xếp theo Number
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

      // Map tiêu đề
      const headerMap: { [key in keyof ThietBi]: string } = {
        number: "number",
        MTAS: "Account Name",
        pbx1: "Destination",
        maxchannels_be: "Max Channels",
        ibcf1: "Number",
        Khu_vuc: "Khu vực",
        Ghi_chu: "Ghi chú",

      };
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
      const filename = `ThongTinLechDuLieuBE_IMS${timestamp}.xlsx`;
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
              <th className="tieu_de">IP Khách hàng</th>
              <th className="tieu_de">Số CGĐT</th>
              <th className="tieu_de">IP IMS</th>
              <th className="tieu_de">Khu vực</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
{
    sortedData.map((item, index) => (
      <tr className="du_lieu" key={index}>
        <td>{item.number}</td>
        <td title={item.MTAS}>
          {item.MTAS && item.MTAS.length > 30
            ? item.MTAS.slice(0, 30) + "..."
            : item.MTAS}
        </td>
        <td>{item.pbx1}</td>
        <td>{item.maxchannels_be}</td>
        <td>{item.ibcf1}</td>
        <td>{item.Khu_vuc}</td>
        <td title={item.Ghi_chu}>
          {item.Ghi_chu && item.Ghi_chu.length > 30
            ? item.Ghi_chu.slice(0, 30) + "..."
            : item.Ghi_chu}
        </td>
      </tr>
    ))
}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTinIms;
  {/* {loading ? (
    <tr>
      <td colSpan={7} className="text-center text-blue-500 py-3 border border-gray-300">
        Đang tải dữ liệu...
      </td>
    </tr>
  ) : sortedData.length === 0 ? (
    <tr>
      <td colSpan={7} className="text-center text-gray-500 py-3 border border-gray-300">
        Không có dữ liệu
      </td>
    </tr>
  ) : ( */}