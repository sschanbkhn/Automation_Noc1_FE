// ExportUtils.ts - Generic Excel Export Function
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExportOptions {
  data: any[] | any; // Array of objects hoặc single object
  sheetName: string;
  fileName: string;
  title?: string;
  exportType?: "single" | "multiple"; // single record hoặc multiple records
}

// Color mapping cho các field types
const getFieldColor = (fieldName: string): string => {
  const key = fieldName.toLowerCase();

  // Network/Performance fields
  if (key.includes("pdcp_volume_dl") || key.includes("download")) return "e8f5e9";
  if (key.includes("pdcp_volume_ul") || key.includes("upload")) return "e0f2f1";
  if (key.includes("cell_avail") || key.includes("availability")) return "c8e6c9";
  if (key.includes("max_ues") || key.includes("users")) return "a5d6a7";

  // Time/Date fields
  if (key.includes("time") || key.includes("date")) return "fff8e1";
  if (key.includes("period_start") || key.includes("created")) return "fff3e0";
  if (key.includes("updated") || key.includes("modified")) return "e8eaf6";

  // Location fields
  if (key.includes("province") || key.includes("tinh")) return "cce5ff";
  if (key.includes("district") || key.includes("huyen")) return "ffe6cc";
  if (key.includes("host") || key.includes("ip")) return "f3e5f5";

  // Status fields
  if (key.includes("status") || key.includes("trang_thai")) return "d4edda";
  if (key.includes("active") || key.includes("enabled")) return "d4edda";
  if (key.includes("permission") || key.includes("quyen")) return "ffcc02";

  // Action fields
  if (key.includes("action") || key.includes("hanh_dong")) return "ffe0b2";
  if (key.includes("notes") || key.includes("ghi_chu")) return "cce5ff";
  if (key.includes("blacklist") || key.includes("den")) return "ffcdd2";
  if (key.includes("reset")) return "e3f2fd";

  // Technical fields
  if (key.includes("ssh") || key.includes("connection")) return "ede7f6";
  if (key.includes("ping") || key.includes("test")) return "f1f8e9";
  if (key.includes("vendor") || key.includes("nha_cung_cap")) return "e1f5fe";

  // Email/Account fields
  if (key.includes("email") || key.includes("mail")) return "f3e5f5";
  if (key.includes("password") || key.includes("pass")) return "ffebee";
  if (key.includes("username") || key.includes("user")) return "e8f5e9";

  // Default
  return "FFFFFF";
};

export const exportToExcel = async (options: ExportOptions): Promise<void> => {
  const { data, sheetName, fileName, title, exportType = "multiple" } = options;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    alert("No data available for export");
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Single record export (như hàm gốc của bạn)
    if (exportType === "single" && !Array.isArray(data)) {
      const headers = Object.keys(data);
      const values = Object.values(data).map((value) => (value !== null && value !== undefined ? String(value) : "N/A"));

      // Add title if provided
      if (title) {
        const titleRow = worksheet.addRow([title]);
        worksheet.mergeCells(1, 1, 1, headers.length);
        titleRow.getCell(1).font = { bold: true, size: 14 };
        titleRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.addRow([]); // Empty row
      }

      // Add headers và data
      const headerRow = worksheet.addRow(headers);
      const dataRow = worksheet.addRow(values);

      // Style header
      headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "10b981" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Style data với màu theo field
      dataRow.height = 25;
      dataRow.eachCell((cell, colNumber) => {
        const fieldName = headers[colNumber - 1];
        const bgColor = getFieldColor(fieldName);

        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border = {
          top: { style: "thin", color: { argb: "D1D5DB" } },
          left: { style: "thin", color: { argb: "D1D5DB" } },
          bottom: { style: "thin", color: { argb: "D1D5DB" } },
          right: { style: "thin", color: { argb: "D1D5DB" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      // Border cho header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: { argb: "2e5082" } },
          left: { style: "medium", color: { argb: "2e5082" } },
          bottom: { style: "medium", color: { argb: "2e5082" } },
          right: { style: "medium", color: { argb: "2e5082" } },
        };
      });

      // Set column widths
      worksheet.columns = headers.map(() => ({ width: 20 }));
    }

    // Multiple records export (table format)
    else if (exportType === "multiple" && Array.isArray(data)) {
      if (data.length === 0) {
        alert("No records to export");
        return;
      }

      const headers = Object.keys(data[0]);

      // Add title if provided
      /*
      if (title) {
        const titleRow = worksheet.addRow([title]);
        worksheet.mergeCells(1, 1, 1, headers.length);
        titleRow.getCell(1).font = { bold: true, size: 16 };
        titleRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.addRow([]); // Empty row
        }
        
        */

      // Add headers
      const headerRow = worksheet.addRow(headers.map((h) => h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, " $1")));

      // Style header
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "8e44ad" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Add data rows
      data.forEach((item, rowIndex) => {
        const values = headers.map((header) => item[header] || "");
        const dataRow = worksheet.addRow(values);
        dataRow.height = 25; // ← THÊM DÒNG NÀY để fix chiều cao

        // Alternate row colors
        const bgColor = rowIndex % 2 === 0 ? "f9fafb" : "ffffff";
        dataRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          cell.border = {
            top: { style: "thin", color: { argb: "e5e7eb" } },
            left: { style: "thin", color: { argb: "e5e7eb" } },
            bottom: { style: "thin", color: { argb: "e5e7eb" } },
            right: { style: "thin", color: { argb: "e5e7eb" } },
          };
          cell.alignment = { vertical: "middle" };
        });
      });

      // Header border
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: { argb: "8e44ad" } },
          left: { style: "medium", color: { argb: "8e44ad" } },
          bottom: { style: "medium", color: { argb: "8e44ad" } },
          right: { style: "medium", color: { argb: "8e44ad" } },
        };
      });

      // Auto-fit columns
      worksheet.columns = headers.map(() => ({ width: 15 }));
    }

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const finalFileName = `${fileName}_${timestamp}.xlsx`;

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      finalFileName
    );

    alert(`Export successful! File: ${finalFileName}`);
  } catch (error) {
    console.error("Export failed:", error);
    alert("Export failed. Please try again.");
  }
};

// Wrapper functions cho từng modal
export const exportArchiveDetail = (selectedRecord: any) => {
  return exportToExcel({
    data: selectedRecord,
    sheetName: "Archive Detail",
    fileName: `Archive_Detail_${selectedRecord.mrbtsName || "Unknown"}`,
    title: `Archive Detail Report - ${selectedRecord.mrbtsName || "Unknown"}`,
    exportType: "single",
  });
};

export const exportArchiveList = (archiveData: any[]) => {
  return exportToExcel({
    data: archiveData,
    sheetName: "Archive Reports",
    fileName: "Archive_Reports_List",
    title: "Archive Reports List",
    exportType: "multiple",
  });
};

export const exportOutlookConfigs = (outlookData: any[]) => {
  return exportToExcel({
    data: outlookData,
    sheetName: "Outlook Configs",
    fileName: "Outlook_Configurations",
    title: "Email Configuration List",
    exportType: "multiple",
  });
};

export const exportMrbtsConfigs = (mrbtsData: any[]) => {
  return exportToExcel({
    data: mrbtsData,
    sheetName: "MRBTS Configs",
    fileName: "MRBTS_Configurations",
    title: "MRBTS Information List",
    exportType: "multiple",
  });
};

// Add more wrapper functions cho các modal khác...
