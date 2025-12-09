// R007StatisticsCards.tsx
// Statistics cards component

import React from "react";
import "./R007StatisticsCards.css";

interface StatisticsCardsProps {
  totalJobs: number;
  totalSites: number;
  successRate: number;
  manualSites: number;
  pnpSites: number;
  activeJobs: number;
}

const R007StatisticsCards: React.FC<StatisticsCardsProps> = ({ totalJobs, totalSites, successRate, manualSites, pnpSites, activeJobs }) => {
  const cards = [
    {
      title: "Total Jobs",
      value: totalJobs.toLocaleString(),
      subtitle: "All time",
      color: "#1976d2",
      icon: "📊",
    },
    {
      title: "Total Sites",
      value: totalSites.toLocaleString(),
      subtitle: "Commissioned",
      color: "#2e7d32",
      icon: "📡",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      subtitle: "Average",
      color: "#9c27b0",
      icon: "✓",
    },
    {
      title: "Manual Sites",
      value: manualSites.toLocaleString(),
      subtitle: "Site Config",
      color: "#ed6c02",
      icon: "🔧",
    },
    {
      title: "PnP Sites",
      value: pnpSites.toLocaleString(),
      subtitle: "Auto PnP",
      color: "#0288d1",
      icon: "🤖",
    },
    {
      title: "Active Jobs",
      value: activeJobs.toString(),
      subtitle: "In progress",
      color: "#d32f2f",
      icon: "⏳",
    },
  ];

  return (
    <div className="r007-cards-container">
      {cards.map((card, index) => (
        <div key={index} className="r007-stat-card" style={{ borderTopColor: card.color }}>
          <div className="r007-card-header">
            <span className="r007-card-icon">{card.icon}</span>
            <h3 className="r007-card-title">{card.title}</h3>
          </div>
          <div className="r007-card-body">
            <div className="r007-card-value">{card.value}</div>
            <div className="r007-card-subtitle">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default R007StatisticsCards;
