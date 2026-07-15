import React from "react";
import { Tabs } from "antd";
import TacDongTram from "../TacDongTram/TacDongTram";
import LichSuCR from "../LichSuCR/LichSuCR";

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
