import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import PinnedKPISection from "../../dashboard/DashOrigin/PinnedKPISection";
import KPIExplorerCore from "./KPIExplorerCore";

const KPI_GROUP = "kpi";

const KPIChartDashboard = () => {
  const [showExplorer, setShowExplorer] = useState(false);

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <div className="container-fluid px-3 mt-3">
        <div className="mb-3">
          <Button variant="outline-primary" onClick={() => setShowExplorer(true)}>
            📊 Mở KPI Explorer
          </Button>
        </div>

        {showExplorer && (
          <Modal show onHide={() => setShowExplorer(false)} size="xl" scrollable>
            <Modal.Header closeButton>
              <Modal.Title>KPI Explorer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <KPIExplorerCore pinGroup={KPI_GROUP} />
            </Modal.Body>
          </Modal>
        )}

        <PinnedKPISection group={KPI_GROUP} title="KPI đã ghim" scopes="all" />
      </div>
    </>
  );
};

export default KPIChartDashboard;
