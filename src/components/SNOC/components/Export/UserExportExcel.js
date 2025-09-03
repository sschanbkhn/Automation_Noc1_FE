// import React from 'react';
// import ReactExport from 'react-export-excel';
// import { Button } from 'react-bootstrap';
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

// const ExportExcel = ({ sortedData, excludedFields, toFriendlyName, renderCell, formatDate, fileName }) => {
//     // Get all unique keys from the first object in sortedData, applying the same filtering logic
//     const columns = sortedData.length > 0
//         ? Object.keys(sortedData[0]).filter(key => !excludedFields.includes(key))
//         : [];

//     return (
//         <ExcelFile element={<Button variant="primary" className="btn-ct">Export to Excel</Button>} filename={fileName}>
//             <ExcelSheet data={sortedData} name={fileName} style={{ font: { bold: true } }}>
//                 {columns.map((key) => (
//                     <ExcelColumn
//                         key={key}
//                         label={toFriendlyName(key)}  // Use friendly names for the labels
//                         value={(row) => {
//                             const cellValue = row[key];
//                             return typeof cellValue === 'boolean'
//                                 ? cellValue ? 'Yes' : 'No'  // Convert boolean to Yes/No
//                                 : key.includes('date') || key.includes('time')
//                                     ? formatDate(cellValue)  // Format date/time fields
//                                     : renderCell(cellValue, key);  // Use renderCell for other types
//                         }}
//                     />
//                 ))}
//             </ExcelSheet>
//         </ExcelFile>
//     );
// };

// export default ExportExcel;

// src/components/SNOC/components/Export/UserExportExcel.js
import { saveAs } from "file-saver";
import React, { useMemo } from "react";
import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";

const fallbackToFriendlyName = (k) => k;
const fallbackRenderCell = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
};
const fallbackFormatDate = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return String(v ?? "");
  // Định dạng dễ đọc: YYYY-MM-DD HH:mm:ss
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export default function ExportExcel({
  sortedData = [],
  excludedFields = [],
  toFriendlyName = fallbackToFriendlyName,
  renderCell = fallbackRenderCell,
  formatDate = fallbackFormatDate,
  fileName = "export",
}) {
  // Lấy danh sách cột từ object đầu tiên (giống code cũ)
  const columns = useMemo(() => {
    if (!sortedData?.length) return [];
    return Object.keys(sortedData[0]).filter(
      (k) => !excludedFields.includes(k)
    );
  }, [sortedData, excludedFields]);

  const handleExport = () => {
    // Header theo friendly name
    const header = columns.map((key) => toFriendlyName(key));

    // Dữ liệu theo thứ tự cột, xử lý boolean / date-time / renderCell
    const rows = (sortedData || []).map((row) =>
      columns.map((key) => {
        const cellValue = row?.[key];
        if (typeof cellValue === "boolean") return cellValue ? "Yes" : "No";
        if (
          key.toLowerCase().includes("date") ||
          key.toLowerCase().includes("time")
        ) {
          return formatDate(cellValue);
        }
        return renderCell(cellValue, key);
      })
    );

    const aoa = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const wb = XLSX.utils.book_new();
    // Tên sheet tối đa 31 ký tự theo Excel
    const sheetName = String(fileName || "Sheet1").slice(0, 31) || "Sheet1";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName || "export"}.xlsx`);
  };

  return (
    <Button
      variant="primary"
      className="btn-ct"
      onClick={handleExport}
      disabled={!columns.length}
    >
      Export to Excel
    </Button>
  );
}
