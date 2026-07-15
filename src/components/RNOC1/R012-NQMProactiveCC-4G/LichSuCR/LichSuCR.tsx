import React from "react";
import StatsStrip from "./StatsStrip";
// EvaluationDetail KHONG render rieng o day nua - da nhung san BEN TRONG Modal cua SessionHistoryList.tsx,
// tu mo khi NOC click 1 dong session (nhan sessionId dong do), khong con la 1 khoi tinh doc lap tren trang
import SessionHistoryList from "./SessionHistoryList";

const LichSuCR: React.FC = () => {
  return (
    <div>
      <div id="stats-strip">
        <StatsStrip />
      </div>
      <div id="session-history-list">
        <SessionHistoryList />
      </div>
    </div>
  );
};

export default LichSuCR;
