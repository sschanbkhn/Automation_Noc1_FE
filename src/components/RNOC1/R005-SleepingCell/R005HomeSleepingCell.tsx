// src/components/RNOC1/R005-SleepingCell/HomeSleepingCell.tsx
import React from "react";
import { Container } from "react-bootstrap";
import "./R005HomeSleepingCell.module.scss";
import R005Header from "./Designer/R005Header";
import R005Tabs from "./Designer/R005Tabs";

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
        <R005Header />

        {/* Modern Tabs with Real Components */}
        <R005Tabs />
      </Container>
    </div>
  );
};

export default HomeSleepingCell;
