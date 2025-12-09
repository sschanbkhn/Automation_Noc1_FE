import React from "react";
import { Container } from "react-bootstrap";
import "./R003HomePRBsLoadBalancing.module.scss";
import R003Header from "./Designer/R003Header";
import R003Tabs from "./Designer/R003Tabs";

const HomeSleepingCell: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "#f8f9fb",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <Container fluid>
        {/* Modern Header */}
        <R003Header />

        {/* Modern Tabs with Real Components */}
        <R003Tabs />
      </Container>
    </div>
  );
};

export default HomeSleepingCell;
