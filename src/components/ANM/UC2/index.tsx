import React from "react";
import Dashboard from "./Dashboard";

interface UCProps {
  goToTab?: (tabKey: string) => void;
  filters?: {
    province?: string;
    olt?: string;
    vendor?: string;
  };
}

const Anm_uc2: React.FC<UCProps> = ({ goToTab, filters }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab} filters={filters} />
    </div>
  );
};

export default Anm_uc2;
