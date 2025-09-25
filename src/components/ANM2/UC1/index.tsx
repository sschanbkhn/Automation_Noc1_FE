import React from "react";
import Dashboard from "./Dashboard";

interface UCProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: (filters: { department?: string; vendor?: string }) => void;
}

const Anm_uc1: React.FC<UCProps> = ({ goToTab, setFilters }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab} setFilters={setFilters} />
    </div>
  );
};

export default Anm_uc1;
