import React from "react";
import Dashboard from "./Dashboard";


interface UCProps {
  goToTab?: (tabKey: string) => void;
}

const Anm_uc3: React.FC<UCProps> = ({ goToTab }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab as (tabKey: string) => void} />
    </div>
  );
};

export default Anm_uc3;