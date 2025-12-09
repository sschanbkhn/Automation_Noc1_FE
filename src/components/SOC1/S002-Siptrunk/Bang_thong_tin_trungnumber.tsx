import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type ThietBi = {
  TENANT_ID: string;
  ACCOUNT_NAME: string;
  ACC_INFO: string;
  MAX_CHANNELS: string;
  ADDRESS_NUMBER: string;
  ADDRESS_DISABLE: string;
  ADDRESS_INCOMING: string;
  ROUTING_TABLE_NAME: string;
  SIPTRUNK_NAME: string;
  SIPTRUNK_INFO: string;
  SIP_CONTACT: string;
  DEST_REPLACE: string;
  Khu_vuc: string;
  Ghi_chu: string;
};

interface Props {
  title: string;
  data: ThietBi[];
  onClose?: () => void;
}

const BangThongTinTrungNumber: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter theo searchTerm
  // const filteredData = data.filter((item) =>
  //   Object.values(item).some(
  //     (value) => value?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
  //   )
  // );
  const filteredData = data.filter(item =>
    Object.values(item).some(
      (value) => (value ? value.toString().toLowerCase() : "").includes(searchTerm.toLowerCase())
    )
  );
  // Sort theo ADDRESS_NUMBER
  const sortedData = [...filteredData].sort((a, b) => {
    const numA = a.ADDRESS_NUMBER.toLowerCase();
    const numB = b.ADDRESS_NUMBER.toLowerCase();
    if (numA < numB) return sortAsc ? -1 : 1;
    if (numA > numB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Xuất Excel
  const handleExport = async () => {
    if (sortedData.length === 0) {
      alert("⚠️ Không có dữ liệu để xuất Excel");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách Thiết bị");

      const headerMap: { [key in keyof ThietBi]: string } = {
        TENANT_ID: "TenantID",
        ACCOUNT_NAME: "Account Name",
        ACC_INFO: "Account Info",
        MAX_CHANNELS: "Max Channels",
        ADDRESS_NUMBER: "Number",
        ADDRESS_DISABLE: "Address Disable",
        ADDRESS_INCOMING: "Address Incoming",
        ROUTING_TABLE_NAME: "Routing Table Name",
        SIP_CONTACT: "Sip Contact",
        SIPTRUNK_NAME: "Siptrunk Name",
        SIPTRUNK_INFO: "Sip Info",
        DEST_REPLACE: "CallForward",
        Khu_vuc: "Khu vực",
        Ghi_chu: "Ghi chú",
      };

      const keys = Object.keys(headerMap) as (keyof ThietBi)[];
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
        const rowData = keys.map((k) => row[k] ?? "");
        worksheet.addRow(rowData);
      });

      worksheet.columns = headers.map(() => ({ width: 20 }));

      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      saveAs(
        new Blob([buffer]),
        `ThongTinLechDuLieuBE_Siptrunk_${timestamp}.xlsx`
      );

      alert("✅ Xuất Excel thành công!");
    } catch (error) {
      console.error(error);
      alert("❌ Xuất Excel thất bại.");
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="box_list" style={{ marginTop: "20px" }}>
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
        <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "brown" }}>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "160px",
            }}
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

      {/* Table */}
      <div
        style={{
          maxHeight: '400px', overflowY: 'auto' 
        }}
      >
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
                Number {sortAsc ? "▲" : "▼"}
              </th>
              <th style={{ border: "1px solid #ccc" }}>Account Name</th>
              <th style={{ border: "1px solid #ccc" }}>Account Info</th>
              <th style={{ border: "1px solid #ccc" }}>TenantID</th>
              <th style={{ border: "1px solid #ccc" }}>Số CGĐT</th>
              <th style={{ border: "1px solid #ccc" }}>IP khách hàng</th>
              <th style={{ border: "1px solid #ccc" }}>Siptrunk Name</th>
              <th style={{ border: "1px solid #ccc" }}>Sip Info</th>
              <th style={{ border: "1px solid #ccc" }}>Routing Table Name</th>
              <th style={{ border: "1px solid #ccc" }}>Khu vực</th>
              <th style={{ border: "1px solid #ccc" }}>CallForward</th>
              <th style={{ border: "1px solid #ccc" }}>Address Disable</th>
              <th style={{ border: "1px solid #ccc" }}>Address Incoming</th>
              <th style={{ border: "1px solid #ccc" }}>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.ADDRESS_NUMBER}</td>
                <td>{item.ACCOUNT_NAME}</td>
                <td title={item.ACC_INFO}>
                  {item.ACC_INFO?.length > 30
                    ? item.ACC_INFO.slice(0, 30) + "..."
                    : item.ACC_INFO}
                </td>
                <td>{item.TENANT_ID}</td>
                <td>{item.MAX_CHANNELS}</td>
                <td title={item.SIP_CONTACT}>
                  {item.SIP_CONTACT?.length > 30
                    ? item.SIP_CONTACT.slice(0, 30) + "..."
                    : item.SIP_CONTACT}
                </td>
                <td>{item.SIPTRUNK_NAME}</td>
                <td title={item.SIPTRUNK_INFO}>
                  {item.SIPTRUNK_INFO?.length > 30
                    ? item.SIPTRUNK_INFO.slice(0, 30) + "..."
                    : item.SIPTRUNK_INFO}
                </td>
                <td>{item.ROUTING_TABLE_NAME}</td>
                <td>{item.Khu_vuc}</td>
                <td>{item.DEST_REPLACE}</td>
                <td>{item.ADDRESS_DISABLE}</td>
                <td>{item.ADDRESS_INCOMING}</td>
                <td title="Number trùng lặp">
                  Number bị trùng lặp
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTinTrungNumber;
