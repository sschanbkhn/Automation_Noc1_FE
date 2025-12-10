// src/components/RNOC1/R007-5GSRANPnPDeclaration/R007-5GSRANPnPDeclaration.tsx
import React from "react";
import { Container } from "react-bootstrap";
import "./R007Home5GSRANPnPDeclaration.module.scss";
import R007Header from "./Designer/R007Header";
import R007Tabs from "./Designer/R007Tabs";

const Home5GSRANPnPDeclaration: React.FC = () => {
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
        <R007Header />

        {/* Modern Tabs with Real Components */}
        <R007Tabs />
      </Container>
    </div>
  );
};

export default Home5GSRANPnPDeclaration;
