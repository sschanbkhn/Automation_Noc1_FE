import React, { useMemo } from "react";
import { CellParamDetailItem } from "../../types";

// tach rieng phan hien thi cell_params theo huong tu CrResultsByDirection.tsx thanh component dung CHUNG,
// de EvaluationDetail.tsx (LichSuCR - xem lai session da DONE, khong co SSE) TAI SU DUNG duoc thay vi viet lai
// - ca 2 noi deu chi can 1 mang CellParamDetailItem[] la du, KHONG phu thuoc sessionId/SSE gi ca
interface CellParamsByHuongProps {
  cellParams: CellParamDetailItem[];
}

const CellParamsByHuong: React.FC<CellParamsByHuongProps> = ({ cellParams }) => {
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

  if (huongIds.length === 0) {
    // truong hop hoan tat nhung khong co cell nao thay doi (tat ca skip), hoac session chua co cell_params -
    // van la ket qua hop le, khong phai loi
    return <div>Khong co cell nao can dieu chinh.</div>;
  }

  return (
    <div>
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
