import React from "react";
import { Container } from "react-bootstrap";
import R012Header from "./Designer/R012Header";
import R012Tabs from "./Designer/R012Tabs";

const R012HomeNQMProactiveCC4G: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#f8f9fb", minHeight: "100vh", padding: "1rem" }}>
      <Container fluid>
        <R012Header />
        <R012Tabs />
      </Container>
    </div>
  );
};

export default R012HomeNQMProactiveCC4G;
