import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type Log = {
  timestamp: string;
  host: string;
  command: string;
  output: string;
};

interface Props {
  title: string;
  data: Log[];
  onClose?: () => void;
}

const BangLog: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Lọc theo từ khóa
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sắp xếp theo timestamp
  const sortedData = [...filteredData].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  // Xuất Excel
  const handleExport = async () => {
    if (sortedData.length === 0) {
      alert("⚠️ Không có dữ liệu để xuất Excel");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Log");

      const headerMap: { [key in keyof Log]: string } = {
        timestamp: "Thời gian",
        host: "Host",
        command: "Lệnh",
        output: "Kết quả",
      };

      const keys = Object.keys(headerMap) as (keyof Log)[];
      const headers = Object.values(headerMap);

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3f8cff" },
      };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };

      sortedData.forEach((row) => {
        worksheet.addRow(keys.map((k) => row[k] ?? ""));
      });

      worksheet.columns = headers.map(() => ({ width: 25 }));

      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `Log_${timestamp}.xlsx`;
      saveAs(new Blob([buffer]), filename);

      alert("✅ Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("❌ Xuất Excel thất bại.");
    }
  };

  if (data.length === 0) return null;

  return (
    <div className="box_list" style={{ marginTop: "20px" }} onClick={onClose}>
      {/* Header */}
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
            onClick={(e) => e.stopPropagation()}
          />
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

      {/* Bảng log */}
      <div style={{ width: "100%",maxHeight: "400px", overflowY: "auto" }}>
        <table className="bang_apn">
          <thead>
            <tr className="tieu_de">
              <th
                className="tieu_de"
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSortAsc(!sortAsc);
                }}
              >
                Thời gian {sortAsc ? "▲" : "▼"}
              </th>
              <th className="tieu_de">Host</th>
              <th className="tieu_de">Lệnh</th>
              <th className="tieu_de">Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr className="du_lieu" key={index}>
                <td>{item.timestamp}</td>
                <td>{item.host}</td>
                <td>{item.command}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>{item.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangLog;
