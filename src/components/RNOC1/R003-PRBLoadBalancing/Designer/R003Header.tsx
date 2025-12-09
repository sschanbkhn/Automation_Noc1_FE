// R005 Header - Blue Background with Professional Icon
import React from "react";
import { Container } from "react-bootstrap";
import { useSpring, animated } from "@react-spring/web";
import { FiActivity, FiRadio, FiShield } from "react-icons/fi";

// const R005Header: React.FC = () => {
const R003Header: React.FC = () => {
  // Animation cho header
  const headerAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 300, friction: 30 },
  });

  return (
    <animated.div
      style={{
        ...headerAnimation,
        // background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)",
        background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #6ee7b7 100%)",
        padding: "0.5rem 0", // chinh khoang cach noi dung den vien
        marginBottom: "0.7rem", // ← CHỈNH CHỖ NÀY: từ '2rem' xuống '1rem' hoặc '0.5rem'
        borderRadius: "8px",
        // boxShadow: "0 8px 32px rgba(30, 64, 175, 0.3)",
        boxShadow: "0 8px 32px rgba(5, 150, 105, 0.3)",
      }}
    >
      <Container fluid>
        <div className="d-flex align-items-center">
          {/* Professional Icon */}
          <div
            className="me-4"
            style={{
              width: "40px", // chinh kich thuoc icon
              height: "40px",
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background pattern */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 20%, transparent 70%)",
                animation: "pulse 3s infinite",
              }}
            />

            {/* Main Icon - Radio Wave/Activity */}
            {React.createElement(FiRadio as any, {
              style: {
                fontSize: "2.0rem", // bieu tuong
                color: "white",
                position: "relative",
                zIndex: 2,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              },
            })}
          </div>

          {/* Title và Description với white text */}
          <div className="flex-grow-1">
            <h1
              style={{
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "700",
                marginBottom: "0.5rem",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                letterSpacing: "0.02em",
              }}
            >
              R003 - Physical Resource Blocks Load Balancing
            </h1>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.79rem",
                marginBottom: "0",
                fontWeight: "400",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Automated detection and recovery System for PRBs over load
            </p>
          </div>

          {/* Enhanced Status Badge */}
          <div className="ms-4">
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                // background: "#93c5fd",
                padding: "10px 28px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(15px)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <div className="d-flex align-items-center">
                {React.createElement(FiRadio as any, {
                  style: {
                    fontSize: "1.8rem",
                    // color: "#00ff88",
                    color: " #f97316",
                    // #3b82f6 50%, #93c5fd 100%)",
                    marginRight: "10px",
                    // filter: "drop-shadow(0 0 6px #00ff88)",
                    filter: "drop-shadow(0 0 6px #93c5fd)",
                  },
                })}

                <div>
                  <div
                    style={{
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      lineHeight: 1,
                      marginBottom: "2px",
                    }}
                  >
                    System Active
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "0.75rem",
                      fontWeight: "400",
                    }}
                  >
                    All services running
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </animated.div>
  );
};

// export default R005Header;
export default R003Header;
