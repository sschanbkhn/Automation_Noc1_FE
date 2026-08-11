import React from "react";
import PhieuHistoryTable from "./PhieuHistoryTable";

// Tab "Lich su phieu" - xem TOAN BO phieu da xuat cua moi session (khong loc theo session nao).
// Component nay CO Y giu mong: toan bo logic goi API/loc/phan trang/modal chi tiet nam trong
// PhieuHistoryTable de dung LAI duoc nguyen ven trong chi tiet session CR (EvaluationDetail.tsx),
// noi chi khac 1 diem duy nhat la co truyen sessionId
const LichSuPhieu: React.FC = () => {
  return (
    <div>
      {/* khong truyen sessionId -> lay phieu cua tat ca session; thanh loc (trang thai + cell) tu hien theo
          mac dinh cua PhieuHistoryTable khi khong co sessionId */}
      <PhieuHistoryTable />
    </div>
  );
};

export default LichSuPhieu;
