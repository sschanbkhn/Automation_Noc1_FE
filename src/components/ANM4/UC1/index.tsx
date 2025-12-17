import React from "react";
import Dashboard from "./Dashboard"; // ✅ renamed import

interface UCProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: (filters: {
    province?: string;
    olt?: string;
    vendor?: string;
    status?: string;
    os?: string;
  }) => void;
}

const Anm4_uc1: React.FC<UCProps> = ({ goToTab, setFilters }) => {
  return (
    <div className="p-3">
      {/* ✅ use the new dashboard */}
      <Dashboard goToTab={goToTab} setFilters={setFilters} />
    </div>
  );
};

export default Anm4_uc1;
