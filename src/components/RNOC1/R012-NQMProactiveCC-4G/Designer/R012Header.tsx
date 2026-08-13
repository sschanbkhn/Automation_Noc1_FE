import React from "react";
import { Container } from "react-bootstrap";
import { R012_COLORS } from "../theme";

const R012Header: React.FC = () => {
  return (
    <div
      style={{
        // doi tu xanh teal (#0f766e/#14b8a6/#5eead4) sang xanh duong de dong bo mau voi cac module RNOC1 khac -
        // gia tri goc lay tu R005-SleepingCell/Designer/R005Header.tsx, nay da trich sang theme.ts (R012_COLORS)
        // de toan bo file trong R012 dung CHUNG 1 nguon mau, khong con dinh nghia hex rieng le tung noi
        background: R012_COLORS.headerGradient,
        padding: "1rem 0",
        marginBottom: "0.75rem",
        borderRadius: "8px",
        // boxShadow tuong ung primaryDark (#1e40af / RGB 30,64,175) - xem chi tiet nguon goc mau trong theme.ts
        boxShadow: R012_COLORS.headerShadow,
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
