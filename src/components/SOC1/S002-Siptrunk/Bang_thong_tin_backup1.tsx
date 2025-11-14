import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
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
  // GROUP_ID : string;
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

const BangThongTin: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo Number
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.ADDRESS_NUMBER.toLowerCase();
    const nameB = b.ADDRESS_NUMBER.toLowerCase();
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
  
      // Lấy danh sách key và header
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
      const filename = `ThongTinLechDuLieuBE_Siptrunk${timestamp}.xlsx`;
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

      <div style={{ maxHeight: '50vh', // tối đa bằng 50% chiều cao màn hình
          overflowY: 'auto',
          width: '100%'}}>
        <table className="bang_sip" style={{ width: '100%' }}>
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
                {/* TENANT_ID: "TenantID", x
      ACCOUNT_NAME: "Account Name", x
      ACC_INFO: "Account Info", x
      MAX_CHANNELS: "Max Channels", x
      ADDRESS_NUMBER: "Number", x
      ADDRESS_DISABLE: "Address Disable", x
      ADDRESS_INCOMING: "Address Incoming",x
      ROUTING_TABLE_NAME: "Routing Table Name", 
      SIP_CONTACT : "Sip Contact", x
      SIPTRUNK_NAME: "Siptrunk Name",x
      SIPTRUNK_INFO : "Sip Info",x
      Khu_vuc: "Khu vực",
      Ghi_chu: "Ghi chú", */}
              </th>
              <th className="tieu_de">Account Name</th>
              <th className="tieu_de">Account Info</th>
              <th className="tieu_de">TenantID</th>
              <th className="tieu_de">Max Channels</th>
              <th className="tieu_de">Sip Contact</th>
              <th className="tieu_de">Siptrunk Name</th>
              <th className="tieu_de">Sip Info</th>
              <th className="tieu_de">Routing Table Name</th>
              <th className="tieu_de">Khu vực</th>
              <th className="tieu_de">CallForward</th>
              <th className="tieu_de">Address Disable</th>
              <th className="tieu_de">Address Incoming</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr className="du_lieu" key={index}>
                <td>{item.ADDRESS_NUMBER}</td>
                <td>{item.ACCOUNT_NAME}</td>
                {/* Giới hạn 30 ký tự + tooltip */}
                <td title={item.ACC_INFO}>
                  {item.ACC_INFO && item.ACC_INFO.length > 30
                    ? item.ACC_INFO.slice(0, 30) + "..."
                    : item.ACC_INFO}
                </td>
                <td>{item.TENANT_ID}</td>
                <td>{item.MAX_CHANNELS}</td>
                <td title={item.SIP_CONTACT}>
                  {item.SIP_CONTACT && item.SIP_CONTACT.length > 30
                    ? item.SIP_CONTACT.slice(0, 30) + "..."
                    : item.SIP_CONTACT}
                </td>
                <td>{item.SIPTRUNK_NAME}</td>
                {/* Giới hạn 30 ký tự + tooltip */}
                <td title={item.SIPTRUNK_INFO}>
                  {item.SIPTRUNK_INFO && item.SIPTRUNK_INFO.length > 30
                    ? item.SIPTRUNK_INFO.slice(0, 30) + "..."
                    : item.SIPTRUNK_INFO}
                </td>
                <td>{item.ROUTING_TABLE_NAME}</td>
                <td>{item.Khu_vuc}</td>
                <td>{item.DEST_REPLACE}</td>
                <td>{item.ADDRESS_DISABLE}</td>
                <td>{item.ADDRESS_INCOMING}</td>
                <td title={item.Ghi_chu}>
                  {item.Ghi_chu && item.Ghi_chu.length > 30
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

export default BangThongTin;
