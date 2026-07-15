import React from "react";
import { Container } from "react-bootstrap";

const R012Header: React.FC = () => {
  return (
    <div
      style={{
        // doi tu xanh teal (#0f766e/#14b8a6/#5eead4) sang xanh duong de dong bo mau voi cac module RNOC1 khac -
        // lay DUNG token mau tu R005-SleepingCell/Designer/R005Header.tsx (module RNOC1 dang hoat dong on dinh,
        // co ghi chu ro "Blue Background" trong chinh file do) de sau nay doi theme chung thi doi dong loat theo cung nguon
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)",
        padding: "1rem 0",
        marginBottom: "0.75rem",
        borderRadius: "8px",
        // boxShadow doi mau tuong ung theo #1e40af (RGB 30,64,175), lay tu cung nguon R005Header.tsx o tren
        boxShadow: "0 8px 32px rgba(30, 64, 175, 0.3)",
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
