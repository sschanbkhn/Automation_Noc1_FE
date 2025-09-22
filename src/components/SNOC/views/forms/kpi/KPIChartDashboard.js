import React from "react";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import KPIExplorerCore from "./KPIExplorerCore";

const KPIChartDashboard = () => {
  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <KPIExplorerCore />
    </>
  );
};

export default KPIChartDashboard;
