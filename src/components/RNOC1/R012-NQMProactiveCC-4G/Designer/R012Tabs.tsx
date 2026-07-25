import React from "react";
import { Tabs } from "antd";
import TacDongTram from "../TacDongTram/TacDongTram";
import LichSuCR from "../LichSuCR/LichSuCR";
import CellXau from "../CellXau/CellXau";

const R012Tabs: React.FC = () => {
  const items = [
    {
      key: "tab1",
      label: "Tác động trạm",
      children: <TacDongTram />,
    },
    {
      key: "tab2",
      label: "Lịch sử CR",
      children: <LichSuCR />,
    },
    {
      key: "tab3",
      label: "Cell xấu",
      // Module S006-CELL, goi truc tiep BE ben SOC (10.155.43.210:8000/api/cell) qua apiConfig.tsx
      // rieng cua no, KHONG qua BE cua R012 - xem CellXau/apiConfig.tsx
      children: <CellXau />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        padding: "0.5rem 1rem",
      }}
    >
      <Tabs defaultActiveKey="tab1" items={items} />
    </div>
  );
};

export default R012Tabs;
