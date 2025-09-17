import React, { useState } from 'react';
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";

type DoiSoat = {
  Ten_APN: string;
  Ten_PGW_csdl: string;
  IP_cho_SIM_csdl: string;
  HLR_APNID_csdl: string;
  HLR_PDPCP_csdl: string;
  HSS_Profile_csdl: string;
  Ten_PGW_be: string;
  IP_cho_SIM_be: string;
  HLR_APNID_be: string;
  HLR_PDPCP_be: string;
  HSS_Profile_be: string;
  Ghi_chu: string;
};

interface Props {
  title: string;
  data: DoiSoat[];
  onClose?: () => void;
}

const BangThongTinDoiSoat: React.FC<Props> = ({ title, data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  // 2. Sắp xếp theo Ten_APN
  const sortedData = [...filteredData].sort((a, b) => {
    const nameA = a.Ten_APN.toLowerCase();
    const nameB = b.Ten_APN.toLowerCase();
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
      const filename = `ThongTinLechDoiSoat_VPN3G4G_${timestamp}.xlsx`;
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          marginBottom: '10px',
        }}
      >
        <h4
          className="text_display"
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'brown',
          }}
        >
          {title}
        </h4>

        <div
          style={{
            position: 'absolute',
            right: 0,
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '160px',
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
              padding: '5px 12px',
              backgroundColor: '#3f8cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Xuất Excel
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="bang_apn">
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
                Tên APN {sortAsc ? '▲' : '▼'}
              </th>
              <th className="tieu_de">PGW (CSDL)</th>
              <th className="tieu_de">PGW (BE)</th>
              <th className="tieu_de">IP SIM (CSDL)</th>
              <th className="tieu_de">IP SIM (BE)</th>
              <th className="tieu_de">HLR APNID (CSDL)</th>
              <th className="tieu_de">HLR APNID (BE)</th>
              <th className="tieu_de">HLR PDPCP (CSDL)</th>
              <th className="tieu_de">HLR PDPCP (BE)</th>
              <th className="tieu_de">HSS Profile (CSDL)</th>
              <th className="tieu_de">HSS Profile (BE)</th>
              <th className="tieu_de">Ghi chú</th>
            </tr>
            
          </thead>
          {/* <thead>
        
        <tr className="tieu_de">
          <th
            className="tieu_de"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            rowSpan={2} // chiếm 2 dòng
            onClick={(e) => {
              e.stopPropagation();
              setSortAsc(!sortAsc);
            }}
          >
            Tên APN {sortAsc ? '▲' : '▼'}
          </th>
          <th className="tieu_de" colSpan={2}>PGW</th>
          <th className="tieu_de" colSpan={2}>IP SIM</th>
          <th className="tieu_de" colSpan={2}>HLR APNID</th>
          <th className="tieu_de" colSpan={2}>HLR PDPCP</th>
          <th className="tieu_de" colSpan={2}>HSS Profile</th>
          <th className="tieu_de" rowSpan={2}>Ghi chú</th>
        </tr>

       
        <tr className="tieu_de">
          <th className="tieu_de">CSDL</th>
          <th className="tieu_de">BE</th>

          <th className="tieu_de">CSDL</th>
          <th className="tieu_de">BE</th>

          <th className="tieu_de">CSDL</th>
          <th className="tieu_de">BE</th>

          <th className="tieu_de">CSDL</th>
          <th className="tieu_de">BE</th>

          <th className="tieu_de">CSDL</th>
          <th className="tieu_de">BE</th>
        </tr>
      </thead> */}
          {/* <tbody> {sortedData.map((item, index) => 
            ( <tr className="du_lieu" key={index}> 
            <td>{item.Ten_APN}</td> 
            <td>{item.Ten_PGW_csdl}</td> 
            <td>{item.Ten_PGW_be}</td> 
            <td>{item.IP_cho_SIM_csdl}</td> 
            <td>{item.IP_cho_SIM_be}</td> 
            <td>{item.HLR_APNID_csdl}</td> 
            <td>{item.HLR_APNID_be}</td> 
            <td>{item.HLR_PDPCP_csdl}</td> 
            <td>{item.HLR_PDPCP_be}</td> 
            <td>{item.HSS_Profile_csdl}</td> 
            <td>{item.HSS_Profile_be}</td> 
            <td>{item.Ghi_chu}</td> </tr> ))} 
            </tbody> */}
          <tbody>
             {sortedData.map((item, index) => {
            // So sánh các trường
              const hlrApnMismatch = item.HLR_APNID_csdl !== item.HLR_APNID_be;
              const hlrPdpMismatch = item.HLR_PDPCP_csdl !== item.HLR_PDPCP_be;
              const pgwMismatch = item.Ten_PGW_csdl !== item.Ten_PGW_be;
              const hssMismatch = item.HSS_Profile_csdl !== item.HSS_Profile_be;
              const ipMismatch = item.IP_cho_SIM_csdl !== item.IP_cho_SIM_be;

              return (
                <tr className="du_lieu" key={index}>
                  <td>{item.Ten_APN}</td>

                  <td style={{ color: pgwMismatch ? 'red' : 'inherit' }}>{item.Ten_PGW_csdl}</td>
                  <td style={{ color: pgwMismatch ? 'red' : 'inherit' }}>{item.Ten_PGW_be}</td>

                  <td style={{ color: ipMismatch ? 'red' : 'inherit' }}>{item.IP_cho_SIM_csdl}</td>
                  <td style={{ color: ipMismatch ? 'red' : 'inherit' }}>{item.IP_cho_SIM_be}</td>

                  <td style={{ color: hlrApnMismatch ? 'red' : 'inherit' }}>{item.HLR_APNID_csdl}</td>
                  <td style={{ color: hlrApnMismatch ? 'red' : 'inherit' }}>{item.HLR_APNID_be}</td>

                  <td style={{ color: hlrPdpMismatch ? 'red' : 'inherit' }}>{item.HLR_PDPCP_csdl}</td>
                  <td style={{ color: hlrPdpMismatch ? 'red' : 'inherit' }}>{item.HLR_PDPCP_be}</td>

                  <td style={{ color: hssMismatch ? 'red' : 'inherit' }}>{item.HSS_Profile_csdl}</td>
                  <td style={{ color: hssMismatch ? 'red' : 'inherit' }}>{item.HSS_Profile_be}</td>

                  <td>{item.Ghi_chu}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangThongTinDoiSoat;
