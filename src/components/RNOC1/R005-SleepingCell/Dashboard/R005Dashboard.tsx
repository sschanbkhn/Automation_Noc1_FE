// src/components/RNOC1/R005-SleepingCell/Dashboard/Dashboard.tsx
// import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import "./R005Dashboard.css"; // Import CSS file

import React, { useState, useEffect } from "react";

import Zone1SleepingCellSummary from "./Zone1SleepingCellSummary";
import Zone2ProvinceDistribution from "./Zone2ProvinceDistribution";
import Zone3CellsProgressChart from "./Zone3CellsProgressChart";
import Zone4TableCells_DistributionChart from "./zone4TableCellsDistribution";

interface DashboardProps {
  sidebarWidth?: number;
  isSidebarCollapsed?: boolean;
  dashboardData: any;
  loading: boolean;
  selectedDate?: string; // ← THÊM DÒNG NÀY
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarWidth = 250, isSidebarCollapsed = false, dashboardData, loading, selectedDate }) => {
  console.log("🏢 Dashboard received selectedDate:", selectedDate); // ← THÊM LOG

  const sidebarOffset = isSidebarCollapsed ? 60 : sidebarWidth;
  const dashboardClass = isSidebarCollapsed ? "dashboard-sidebar-collapsed" : "dashboard-no-sidebar-overlap";

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div
      className={dashboardClass}
      style={{
        backgroundColor: "#f8f9fb",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <Container fluid style={{ maxWidth: "none", padding: "0", margin: "0" }}>
        {/* bat dau zone 1 */}
        {/* ===============================================================*/}
        {/* ZONE 1: 5 Cards - Same Row  */}
        {/* <Zone1SleepingCellSummary selectedDate={selectedDate} loading={loading} /> */}

        <Zone1SleepingCellSummary
          selectedDate={selectedDate}
          loading={loading}
          dashboardData={dashboardData} // ← THÊM DÒNG NÀY
        />
        {/* ket thuc zone 1 */}
        {/* ===============================================================*/}
        {/*  bat dau zone 2 */}
        {/* ===============================================================*/}
        {/* <Zone2ProvinceDistribution /> */}
        {/*  bat dau zone 2 */}
        {/* ===============================================================*/}
        <Zone2ProvinceDistribution dashboardData={dashboardData} loading={loading} selectedDate={selectedDate} />
        {/*  ket thuc zone 2 */}
        {/* ===============================================================*/}
        {/*  bat dau zone 3 */}
        {/* ===============================================================*/}
        <Zone3CellsProgressChart dashboardData={dashboardData} loading={loading} selectedDate={selectedDate} />
        {/*  ket thuc  zone 3 */}
        {/* ===============================================================*/}
        {/*  bat dau zone 4 */}
        {/* ===============================================================*/}
        <Zone4TableCells_DistributionChart dashboardData={dashboardData} loading={loading} selectedDate={selectedDate} />
        {/*  ket thuc  zone 4 */}
        {/* ===============================================================*/}
        {/* ZONE 5: Technical Summary */}
        {/* ===============================================================*/}
        {/*  ket thuc  zone 5 */}
        {/* ===============================================================*/}
        {/* ZONE 6: Quick Action Buttons */}
        {/* ===============================================================*/}
        {/*  ket thuc  zone 6 */}
        {/* ===============================================================*/}
        {/* ===============================================================*/}
        {/*  ket thuc  Dash */}
        {/* ===============================================================*/}
      </Container>
    </div>
  );
};

export default Dashboard;
