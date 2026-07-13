import React from "react";
import { Container } from "react-bootstrap";

const R012Header: React.FC = () => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 60%, #5eead4 100%)",
        padding: "1rem 0",
        marginBottom: "0.75rem",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(15, 118, 110, 0.3)",
      }}
    >
      <Container fluid>
        <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          R012 - NQM Proactive CC 4G
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.85rem", marginBottom: 0 }}>
          NQM Proactive CC 4G Automation
        </p>
      </Container>
    </div>
  );
};

export default R012Header;
