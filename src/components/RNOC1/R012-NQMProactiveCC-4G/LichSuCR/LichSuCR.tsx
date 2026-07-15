import React from "react";
import StatsStrip from "./StatsStrip";
import SessionHistoryList from "./SessionHistoryList";
import EvaluationDetail from "./EvaluationDetail";

const LichSuCR: React.FC = () => {
  return (
    <div>
      <div id="stats-strip">
        <StatsStrip />
      </div>
      <div id="session-history-list">
        <SessionHistoryList />
      </div>
      <div id="evaluation-detail">
        <EvaluationDetail />
      </div>
    </div>
  );
};

export default LichSuCR;
