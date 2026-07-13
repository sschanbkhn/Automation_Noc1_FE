import React, { useState } from "react";
import R012Dashboard from "../Dashboard/R012Dashboard";
import R012Monitor from "../Monitor/R012Monitor";
import R012Configuration from "../Configuration/R012Configuration";

type TabId = "dashboard" | "monitor" | "configuration";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "monitor", label: "Monitor" },
  { id: "configuration", label: "Configuration" },
];

const R012Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <R012Dashboard />;
      case "monitor":
        return <R012Monitor />;
      case "configuration":
        return <R012Configuration />;
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 24px",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #14b8a6" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.id ? "#0f766e" : "#64748b",
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ minHeight: "400px" }}>{renderContent()}</div>
    </div>
  );
};

export default R012Tabs;
