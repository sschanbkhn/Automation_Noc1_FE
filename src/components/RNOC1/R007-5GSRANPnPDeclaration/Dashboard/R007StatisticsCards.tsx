// R007StatisticsCards.tsx
import React, { useState } from "react";
import { Card, Row, Col, Modal, Button } from "react-bootstrap";
import { FiBarChart, FiRadio, FiCheckCircle, FiTool, FiCpu, FiActivity } from "react-icons/fi";

interface StatisticsCardsProps {
  totalJobs: number;
  totalSites: number;
  successRate: number;
  manualSites: number;
  pnpSites: number;
  activeJobs: number;
  // Yesterday data for comparison
  totalJobsYesterday?: number;
  totalSitesYesterday?: number;
  successRateYesterday?: number;
  manualSitesYesterday?: number;
  pnpSitesYesterday?: number;
  activeJobsYesterday?: number;
}

interface CardData {
  title: string;
  value: string | number;
  previousValue: number;
  subtitle: string;
  icon: any;
  gradient: string;
  bgColor: string;
  textColor: string;
  backgroundColor: string; // ← THÊM DÒNG NÀY
}

// const R007StatisticsCards: React.FC<StatisticsCardsProps> = ({ totalJobs, totalSites, successRate, manualSites, pnpSites, activeJobs, totalJobsYesterday, totalSitesYesterday, successRateYesterday, manualSitesYesterday, pnpSitesYesterday, activeJobsYesterday }) => {
const R007StatisticsCards: React.FC<StatisticsCardsProps> = ({ totalJobs, totalSites, successRate, manualSites, pnpSites, activeJobs, totalJobsYesterday = 0, totalSitesYesterday = 0, successRateYesterday = 0, manualSitesYesterday = 0, pnpSitesYesterday = 0, activeJobsYesterday = 0 }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Card click handler
  const handleCardClick = (card: CardData) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const cards: CardData[] = [
    {
      title: "Total Jobs",
      value: totalJobs.toLocaleString(),
      previousValue: totalJobsYesterday,
      subtitle: "All time",
      icon: FiBarChart,
      gradient: "linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%)",
      bgColor: "#f3e8ff",
      textColor: "#6b21a8",
      backgroundColor: "#faf5ff", // ← THÊM DÒNG NÀY
    },
    {
      title: "Total Sites",
      value: totalSites.toLocaleString(),
      previousValue: totalSitesYesterday,
      subtitle: "Commissioned",
      icon: FiRadio,
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      bgColor: "#d1fae5",
      textColor: "#059669",
      backgroundColor: "#f0fdf4",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      previousValue: successRateYesterday,
      subtitle: "Average",
      icon: FiCheckCircle,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      bgColor: "#ede9fe",
      textColor: "#7c3aed",
      backgroundColor: "#faf5ff",
    },
    {
      title: "Manual Sites",
      value: manualSites.toLocaleString(),
      previousValue: manualSitesYesterday,
      subtitle: "Site Config",
      icon: FiTool,
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      bgColor: "#fef3c7",
      textColor: "#d97706",
      backgroundColor: "#fffbeb",
    },
    {
      title: "PnP Sites",
      value: pnpSites.toLocaleString(),
      previousValue: pnpSitesYesterday,
      subtitle: "Auto PnP",
      icon: FiCpu,
      gradient: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
      bgColor: "#e0f2fe",
      textColor: "#0284c7",
      backgroundColor: "#f0f9ff",
    },
    {
      title: "Active Jobs",
      value: activeJobs.toString(),
      previousValue: activeJobsYesterday,
      subtitle: "In progress",
      icon: FiActivity,
      gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      bgColor: "#fee2e2",
      textColor: "#dc2626",
      backgroundColor: "#fef2f2",
    },
  ];

  return (
    <>
      <Row className="g-3 mb-4">
        {cards.map((card, index) => {
          const currentValue = typeof card.value === "string" && card.value.includes("%") ? parseFloat(card.value) : typeof card.value === "string" ? parseInt(card.value.replace(/,/g, "")) : card.value;

          const change = calculateChange(currentValue, card.previousValue);
          const isPositive = change >= 0;

          return (
            <Col key={index} xs={12} sm={6} md={6} lg={4}>
              <Card
                className="border-0 shadow-sm h-100"
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderRadius: "12px",

                  backgroundColor: card.backgroundColor, // ← CÓ DÒNG NÀY CHƯA?
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 12px 24px ${card.textColor}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
                onClick={() => handleCardClick(card)}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    {/* Icon */}
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        background: card.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px ${card.textColor}40`,
                      }}
                    >
                      {React.createElement(card.icon, {
                        style: {
                          fontSize: "1.8rem",
                          color: "white",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                        },
                      })}
                    </div>

                    {/* Change Badge */}
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        backgroundColor: isPositive ? "#d1fae5" : "#fee2e2",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: isPositive ? "#059669" : "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>{isPositive ? "↑" : "↓"}</span>
                      <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: "500",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {card.title}
                    </p>

                    {/* Value */}
                    <h3
                      className="fw-bold mb-2"
                      style={{
                        color: "#1a202c",
                        fontSize: "2rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {card.value}
                    </h3>

                    {/* Subtitle and Comparison */}
                    <div className="d-flex align-items-center justify-content-between">
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          fontWeight: "400",
                        }}
                      >
                        {card.subtitle}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          fontWeight: "400",
                        }}
                      >
                        vs: <span style={{ color: card.textColor, fontWeight: "600" }}>{card.previousValue}</span>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            background: selectedCard?.gradient,
            color: "white",
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            {selectedCard &&
              React.createElement(selectedCard.icon, {
                style: { fontSize: "1.5rem", marginRight: "12px" },
              })}
            {selectedCard?.title} Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedCard && (
            <Row className="g-3">
              <Col md={6}>
                <Card className="border-0 h-100" style={{ backgroundColor: selectedCard.bgColor }}>
                  <Card.Body className="p-3">
                    <h6 className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                      Current Value
                    </h6>
                    <h2 className="fw-bold mb-0" style={{ color: selectedCard.textColor }}>
                      {selectedCard.value}
                    </h2>
                    <small className="text-muted">{selectedCard.subtitle}</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                  <Card.Body className="p-3">
                    <h6 className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                      Yesterday Value
                    </h6>
                    <h2 className="fw-bold mb-0" style={{ color: "#6b7280" }}>
                      {selectedCard.previousValue.toLocaleString()}
                    </h2>
                    <small className="text-muted">Previous day</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                <Card className="border-0" style={{ backgroundColor: "#f8f9fa" }}>
                  <Card.Body className="p-3">
                    <h6 className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                      Change
                    </h6>
                    <h3
                      className="fw-bold mb-0 d-flex align-items-center gap-2"
                      style={{
                        color: calculateChange(typeof selectedCard.value === "string" && selectedCard.value.includes("%") ? parseFloat(selectedCard.value) : typeof selectedCard.value === "string" ? parseInt(selectedCard.value.replace(/,/g, "")) : selectedCard.value, selectedCard.previousValue) >= 0 ? "#059669" : "#dc2626",
                      }}
                    >
                      {calculateChange(typeof selectedCard.value === "string" && selectedCard.value.includes("%") ? parseFloat(selectedCard.value) : typeof selectedCard.value === "string" ? parseInt(selectedCard.value.replace(/,/g, "")) : selectedCard.value, selectedCard.previousValue) >= 0 ? "↑" : "↓"}
                      {Math.abs(calculateChange(typeof selectedCard.value === "string" && selectedCard.value.includes("%") ? parseFloat(selectedCard.value) : typeof selectedCard.value === "string" ? parseInt(selectedCard.value.replace(/,/g, "")) : selectedCard.value, selectedCard.previousValue)).toFixed(2)}%
                    </h3>
                    <small className="text-muted">Compared to yesterday</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            style={{
              borderRadius: "8px",
              padding: "8px 24px",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default R007StatisticsCards;
