import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faEdit, faTrash, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ConfigModule } from "./ConfigTypes";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface MRBTSModalProps {
  show: boolean;
  selectedConfig: ConfigModule | null;
  modalData: any[];
  modalLoading: boolean;
  modalSearchTerm: string;
  onSearch: (term: string) => void;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

const MRBTSModal: React.FC<MRBTSModalProps> = ({ show, selectedConfig, modalData, modalLoading, modalSearchTerm, onSearch, onClose, onAdd, onEdit, onDelete, onRefresh }) => {
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  if (!show || !selectedConfig) return null;

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // SỬA: Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      const jsonData: any[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = worksheet.getRow(1).getCell(colNumber).value;
          rowData[String(header)] = cell.value;
        });
        jsonData.push(rowData);
      });

      // Send to API
      const response = await fetch(`${selectedConfig.iconColor}/configuration/import-mrbts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: jsonData }),
      });

      if (response.ok) {
        alert("Import thành công!");
        onRefresh();
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Import thất bại!");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", width: "90vw", maxWidth: "1200px", height: "85vh", display: "flex", flexDirection: "column" }}>
        {/* Header với Import Button */}
        <div style={{ background: selectedConfig.iconColor, color: "white", padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>MRBTS Information</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelImport} style={{ display: "none" }} ref={(ref) => setFileInputRef(ref)} />
            <button onClick={() => fileInputRef?.click()} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "8px 12px", color: "white", fontSize: "12px", cursor: "pointer" }}>
              <FontAwesomeIcon icon={faUpload} style={{ marginRight: "6px" }} />
              Import Excel
            </button>
            <button onClick={onAdd} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "8px 12px", color: "white", fontSize: "12px", cursor: "pointer" }}>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
              Add New
            </button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "8px", color: "white", cursor: "pointer" }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}>
          <input type="text" value={modalSearchTerm} onChange={(e) => onSearch(e.target.value)} placeholder="Search MRBTS..." style={{ width: "300px", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", border: "1px solid #e5e7eb" }}>
            <thead>
              <tr style={{ background: `${selectedConfig.iconColor}15`, borderBottom: `2px solid ${selectedConfig.iconColor}` }}>
                {modalData.length > 0 &&
                  Object.keys(modalData[0])
                    .filter((key) => key.toLowerCase() !== "id")
                    .map((key) => (
                      <th key={key} style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: selectedConfig.iconColor, border: "1px solid #e5e7eb" }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                      </th>
                    ))}
                <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: selectedConfig.iconColor, border: "1px solid #e5e7eb", width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modalData.map((item: any, index: number) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9fafb" : "white" }}>
                  {Object.keys(item)
                    .filter((key) => key.toLowerCase() !== "id")
                    .map((key: string) => {
                      let cellValue = String(item[key] || "");
                      if (cellValue === "null" || cellValue === "NULL") cellValue = "";

                      return (
                        <td key={key} style={{ padding: "12px", border: "1px solid #e5e7eb", maxWidth: "200px" }}>
                          <div title={cellValue} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cellValue}
                          </div>
                        </td>
                      );
                    })}
                  <td style={{ padding: "8px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      <button onClick={() => onEdit(item)} style={{ background: selectedConfig.iconColor, color: "white", border: "none", borderRadius: "4px", padding: "6px 8px", fontSize: "11px", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => onDelete(item.id)} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "6px 8px", fontSize: "11px", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MRBTSModal;
