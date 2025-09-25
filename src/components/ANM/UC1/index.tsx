import React from "react";
import Dashboard from "./Dashboard";

interface UCProps {
  goToTab: (tabKey: string) => void;
  setFilters: React.Dispatch<
    React.SetStateAction<{
      province?: string;
      olt?: string;
      vendor?: string;
    }>
  >;
}

const Anm_uc1: React.FC<UCProps> = ({ goToTab, setFilters }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab} setFilters={setFilters} />
    </div>
  );
};

export default Anm_uc1;
