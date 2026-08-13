import React from "react";
import { Container } from "react-bootstrap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import R012Header from "./Designer/R012Header";
import R012Tabs from "./Designer/R012Tabs";

// Scoped to this module only - no other RNOC1 module uses react-query yet,
// so the QueryClient is not hoisted to the app-wide Provider in src/index.tsx.
const r012QueryClient = new QueryClient();

const R012HomeNQMProactiveCC4G: React.FC = () => {
  return (
    <QueryClientProvider client={r012QueryClient}>
      <div style={{ backgroundColor: "#f8f9fb", minHeight: "100vh", padding: "1rem" }}>
        <Container fluid>
          <R012Header />
          <R012Tabs />
        </Container>
      </div>
    </QueryClientProvider>
  );
};

export default R012HomeNQMProactiveCC4G;
