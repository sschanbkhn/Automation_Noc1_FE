import React from "react";
import Dashboard from "./Dashboard";


interface UCProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: (filters: { status?: string }) => void;
}
const Anm3_uc1: React.FC<UCProps> = ({ goToTab, setFilters }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab as (tabKey: string) => void} setFilters={setFilters} />
    </div>
  );
};

export default Anm3_uc1;