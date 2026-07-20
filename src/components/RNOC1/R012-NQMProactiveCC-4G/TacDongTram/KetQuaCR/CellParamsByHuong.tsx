import React, { useMemo } from "react";
import { Button } from "antd";
// dung xlsx (SheetJS) co san trong package.json (^0.17.5) - KHONG cai them dependency moi. Du an co ca
// exceljs lan xlsx san, chon xlsx vi API json_to_sheet/writeFile don gian, du dung cho 1 export co ban
// (1 sheet, khong can dinh dang phuc tap nhu merge cell/style rieng ma exceljs manh hon), nhe hon khi bundle
import * as XLSX from "xlsx";
import { CellParamDetailItem } from "../../types";

// tach rieng phan hien thi cell_params theo huong tu CrResultsByDirection.tsx thanh component dung CHUNG,
// de EvaluationDetail.tsx (LichSuCR - xem lai session da DONE, khong co SSE) TAI SU DUNG duoc thay vi viet lai
// - ca 2 noi deu chi can 1 mang CellParamDetailItem[] la du, KHONG phu thuoc sessionId/SSE gi ca
interface CellParamsByHuongProps {
  cellParams: CellParamDetailItem[];
  // can sessionId de dat ten file export dung quy uoc R012_CR_cells_{session_id}_{timestamp}.xlsx -
  // ca 2 noi goi component nay (CrResultsByDirection/EvaluationDetail) deu co san sessionId dang number
  // tai thoi diem render toi day (da qua guard sessionId===null o component cha)
  sessionId: number;
}

// dinh dang timestamp DDMMYYYY_HHMM cho ten file - dung DUNG quy uoc dat ten da thong nhat trong du an
// (giong quy uoc folder theo ngay {DDMMYYYY_HHMM}/ o cac noi khac), khong tu bia dinh dang moi
function formatTimestampForFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}${mm}${yyyy}_${hh}${min}`;
}

// xac dinh cap gia tri "truoc CR -> sau CR" DUNG theo action_type cua tung cell - 1 cell chi thuoc DUNG 1
// loai tham so (rsboost HOAC qrxlevmin), khong phai luc nao cung co ca 2, nen phai chon dung cap de export
// khong bi nham gia tri (vd cell rsboost thi khong dung nham cap qrxlevmin dang null)
function resolveBeforeAfter(cellParam: CellParamDetailItem): { before: number | string; after: number | string } {
  if (cellParam.action_type === "rsboost") {
    return { before: cellParam.rsboost_before_cr ?? "-", after: cellParam.rsboost_new ?? "-" };
  }
  if (cellParam.action_type === "qrxlevmin") {
    return { before: cellParam.qrxlevmin_before_cr ?? "-", after: cellParam.qrxlevmin_new ?? "-" };
  }
  // action_type la "skip" hoac null - khong co gia tri truoc/sau de xuat, tranh hien nham gia tri cua loai khac
  return { before: "-", after: "-" };
}

const CellParamsByHuong: React.FC<CellParamsByHuongProps> = ({ cellParams, sessionId }) => {
  // xuat TAT CA cell chung 1 sheet (khong tach theo huong nhu bang hien thi) theo dung yeu cau - moi dong
  // ung voi 1 cell, cot lay dung ten field yeu cau: huong_id, cell_name, param_type, gia_tri_cu, gia_tri_moi, priority
  const handleExportExcel = () => {
    const rows = cellParams.map((cellParam) => {
      const { before, after } = resolveBeforeAfter(cellParam);
      return {
        huong_id: cellParam.huong_id ?? "-",
        cell_name: cellParam.cell_name,
        param_type: cellParam.action_type ?? "-",
        gia_tri_cu: before,
        gia_tri_moi: after,
        priority: cellParam.priority ?? "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CR Cells");
    // writeFile tu trigger download tren browser (SheetJS lo het phan tao Blob/anchor), khong can tu viet
    // logic download rieng
    XLSX.writeFile(workbook, `R012_CR_cells_${sessionId}_${formatTimestampForFileName(new Date())}.xlsx`);
  };
  // nhom cell_params theo huong_id (vd "11"/"12" - GIA TRI THAT tu BE, KHONG phai "H1"/"H2"/"H3" nhu mockup UI_DESIGN.md)
  // de hien ket qua theo tung huong nhu yeu cau nghiep vu, dung DUNG field that, khong bia them field
  const groupedByHuong = useMemo(() => {
    const groups: Record<string, CellParamDetailItem[]> = {};
    cellParams.forEach((cellParam) => {
      // huong_id co the null theo schema - gom vao nhom "Khong xac dinh huong" thay vi bo sot du lieu
      const key = cellParam.huong_id ?? "Khong xac dinh huong";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(cellParam);
    });
    return groups;
  }, [cellParams]);

  const huongIds = Object.keys(groupedByHuong);

  // nut export dat CHUNG cho ca 2 truong hop (co/khong co cell) - disable khi rong thay vi an han, de NOC
  // luon thay nut o cung 1 vi tri, khong bi giat layout giua 2 trang thai co/khong co du lieu
  const exportButton = (
    <Button onClick={handleExportExcel} disabled={cellParams.length === 0} style={{ marginBottom: "1rem" }}>
      {cellParams.length === 0 ? "Khong co du lieu de export" : "Export Excel"}
    </Button>
  );

  if (huongIds.length === 0) {
    // truong hop hoan tat nhung khong co cell nao thay doi (tat ca skip), hoac session chua co cell_params -
    // van la ket qua hop le, khong phai loi
    return (
      <div>
        {exportButton}
        <div>Khong co cell nao can dieu chinh.</div>
      </div>
    );
  }

  return (
    <div>
      {exportButton}
      {huongIds.map((huongId) => (
        <div key={huongId} style={{ marginBottom: "1rem" }}>
          <h4>Huong {huongId}</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: "6px" }}>Cell</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: "6px" }}>Hanh dong</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: "6px" }}>Priority</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: "6px" }}>
                  Rsboost (truoc → moi)
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: "6px" }}>
                  Qrxlevmin (truoc → moi)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* KHONG loc theo action_type - moi cell_param deu duoc render du la rsboost/qrxlevmin/skip,
                  chi de "-" o cot khong ap dung cho loai do (vd cell rsboost se co "-" o cot Qrxlevmin) -
                  neu 1 session that su khong co cell qrxlevmin nao thi cot do se toan "-", DAY LA DAC DIEM
                  DU LIEU THAT (da xac nhan qua session that), KHONG PHAI loi an du lieu */}
              {groupedByHuong[huongId].map((cellParam) => (
                <tr key={cellParam.cell_name}>
                  <td style={{ borderBottom: "1px solid #f1f5f9", padding: "6px" }}>{cellParam.cell_name}</td>
                  <td style={{ borderBottom: "1px solid #f1f5f9", padding: "6px" }}>{cellParam.action_type ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #f1f5f9", padding: "6px" }}>{cellParam.priority ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #f1f5f9", padding: "6px" }}>
                    {cellParam.rsboost_before_cr ?? "-"} → {cellParam.rsboost_new ?? "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #f1f5f9", padding: "6px" }}>
                    {cellParam.qrxlevmin_before_cr ?? "-"} → {cellParam.qrxlevmin_new ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default CellParamsByHuong;
