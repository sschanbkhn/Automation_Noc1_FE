import React from "react";
// EvaluationDetail KHONG render rieng o day nua - da nhung san BEN TRONG Modal cua SessionHistoryList.tsx,
// tu mo khi NOC click 1 dong session (nhan sessionId dong do), khong con la 1 khoi tinh doc lap tren trang
import SessionHistoryList, { YeuCauLocTram } from "./SessionHistoryList";

interface LichSuCRProps {
  // yeu cau loc san 1 tram, do R012Tabs chuyen tiep tu tab "Lich su phieu" (muc Tien trinh, bam ma tram) -
  // file nay chi truyen thang xuong, khong xu ly gi them
  yeuCauLocTram?: YeuCauLocTram | null;
}

// DA BO khoi <StatsStrip /> (file StatsStrip.tsx cung da xoa): do chi la 1 Alert bao "BE chua co endpoint
// thong ke tong quan" - 1 loi nhac viec noi bo cua nguoi lam FE, khong phai thong tin NOC can doc. No chiem
// nguyen 1 khoi dau tab va day bang lich su xuong duoi. Khi nao BE co API thong ke that thi dung widget
// hien SO LIEU that vao day, khong dung lai cho giu cho bang thong bao.
const LichSuCR: React.FC<LichSuCRProps> = ({ yeuCauLocTram = null }) => {
  return (
    <div>
      <div id="session-history-list">
        <SessionHistoryList yeuCauLocTram={yeuCauLocTram} />
      </div>
    </div>
  );
};

export default LichSuCR;
