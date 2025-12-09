import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import "./index.css";

type ThietBi = {
    ACCOUNT_NAME: string;
    NUMBER: string;
    ACC_INFO : string;
    SO_CGĐT : string;
    ROUTING_TABLE_NAME : string;
    SIPTRUNK_Name : string;
    SIP_CONTACT : string;
    SIPTRUNK_INFO : string;
    TENANT_NAME : string;
    Chan_goi_ra : string;
    Tam_ngung : string;
    SO_DICH : string;
    Loai_CFU : string;
    Khu_vuc : string;
    Ghi_chu : string;
  };

interface Props {
  title: string;
  data: ThietBi[];
  onClose?: () => void;
}

const BangThongTin: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter theo searchTerm
  // const filteredData = data.filter((item) =>
  //   Object.values(item).some(
  //     (value) => value?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
  //   )
  // );
  const filteredData = React.useMemo(() => {
  return data.filter(item =>
    Object.values(item).some(
      (value) => (value ? value.toString().toLowerCase() : "").includes(searchTerm.toLowerCase())
    )
  );
}, [data, searchTerm]);

const sortedData = React.useMemo(() => {
  return [...filteredData].sort((a, b) => {
    const numA = (a.NUMBER ?? "").toString().toLowerCase();
    const numB = (b.NUMBER ?? "").toString().toLowerCase();

    if (numA < numB) return sortAsc ? -1 : 1;
    if (numA > numB) return sortAsc ? 1 : -1;
    return 0;
  });
}, [filteredData, sortAsc]);

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
        
      ACCOUNT_NAME: "Account Name",
      NUMBER: "Number",
      ACC_INFO : "Account Info",
      SO_CGĐT : "So CGĐT",
      ROUTING_TABLE_NAME : "Routing Table Name",
      SIPTRUNK_Name : "Siptrunk Name",
      SIP_CONTACT : "IP khách hàng",
      SIPTRUNK_INFO : "Sip Info",
      TENANT_NAME : "Tenant_Name",
      Chan_goi_ra : "Chặn gọi ra",
      Tam_ngung : "Tạm ngưng",
      SO_DICH : "Số đích",
      Loai_CFU: "Loại CFU",
      Khu_vuc : "Khu vực",
      Ghi_chu : "Ghi chú"
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
        `ThongTinLechDuLieuBE_18001900_${timestamp}.xlsx`
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
              <th style={{ border: "1px solid #ccc" }}>Số đích</th>
              <th style={{ border: "1px solid #ccc" }}>Số CGĐT</th>
              <th style={{ border: "1px solid #ccc" }}>IP khách hàng</th>
              <th style={{ border: "1px solid #ccc" }}>Routing Table</th>
              <th style={{ border: "1px solid #ccc" }}>Siptrunk Name</th>
              <th style={{ border: "1px solid #ccc" }}>Sip Info</th>
              <th style={{ border: "1px solid #ccc" }}>Chặn gọi ra</th>
              <th style={{ border: "1px solid #ccc" }}>Tạm ngưng</th>
              <th style={{ border: "1px solid #ccc" }}>Loại CFU</th>
              <th style={{ border: "1px solid #ccc" }}>Tenant Name</th>
              <th style={{ border: "1px solid #ccc" }}>Khu vực</th>
              <th style={{ border: "1px solid #ccc" }}>Ghi chú</th>
            </tr>
           
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.NUMBER}</td>
                <td>{item.ACCOUNT_NAME}</td>
                <td title={item.ACC_INFO}>
                  {item.ACC_INFO?.length > 30
                    ? item.ACC_INFO.slice(0, 30) + "..."
                    : item.ACC_INFO}
                </td>
                <td>{item.SO_DICH}</td>
                <td>{item.SO_CGĐT}</td>
                <td title={item.SIP_CONTACT}>
                  {item.SIP_CONTACT?.length > 30
                    ? item.SIP_CONTACT.slice(0, 30) + "..."
                    : item.SIP_CONTACT}
                </td>
                <td title={item.ROUTING_TABLE_NAME}>
                  {item.ROUTING_TABLE_NAME?.length > 30
                    ? item.ROUTING_TABLE_NAME.slice(0, 30) + "..."
                    : item.ROUTING_TABLE_NAME}
                </td>
                <td>{item.SIPTRUNK_Name}</td>
                <td title={item.SIPTRUNK_INFO}>
                  {item.SIPTRUNK_INFO?.length > 30
                    ? item.SIPTRUNK_INFO.slice(0, 30) + "..."
                    : item.SIPTRUNK_INFO}
                </td>
                <td>{item.Chan_goi_ra}</td>
                <td>{item.Tam_ngung}</td>
                <td>{item.Loai_CFU}</td>
                <td>{item.TENANT_NAME}</td>
                <td>{item.Khu_vuc}</td>
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

export default BangThongTin;
