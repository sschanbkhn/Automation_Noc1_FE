// R007Dashboard.tsx
// Main Dashboard component

import React from "react";
import "./R007Dashboard.css";
import R007StatisticsCards from "./R007StatisticsCards";
import R007ChartsSection from "./R007ChartsSection";
import R007RecentJobsTable from "./R007RecentJobsTable";
import { mockJobs, mockChartData, mockRegionData, mockStatistics } from "./R007mockData";

const R007Dashboard: React.FC = () => {
  return (
    <div className="r007-dashboard">
      {/* Header */}
      {/*}
      <div className="r007-dashboard-header">
        <h1 className="r007-dashboard-title">5G RAN PnP Declaration - Dashboard</h1>
        <p className="r007-dashboard-subtitle">Monitor and track 5G site commissioning progress</p>
          </div>
          
          */}

      {/* Statistics Cards */}
      <R007StatisticsCards totalJobs={mockStatistics.totalJobs} totalSites={mockStatistics.totalSites} successRate={mockStatistics.successRate} manualSites={mockStatistics.manualSites} pnpSites={mockStatistics.pnpSites} activeJobs={mockStatistics.activeJobs} />

      {/* Charts Section */}
      <R007ChartsSection chartData={mockChartData} regionData={mockRegionData} />

      {/* Recent Jobs Table */}
      <R007RecentJobsTable jobs={mockJobs} />
    </div>
  );
};

export default R007Dashboard;
