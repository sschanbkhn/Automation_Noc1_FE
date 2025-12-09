// R007 Header - Purple/Violet Professional Theme
import React from "react";
import { Container } from "react-bootstrap";
import { useSpring, animated } from "@react-spring/web";
import { FiRadio } from "react-icons/fi";

const R007Header: React.FC = () => {
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
        background: "linear-gradient(135deg, #6b21a8 0%, #a78bfa 100%, #a78bfa 50%)",
        padding: "0.6rem 0",
        marginBottom: "0.7rem",
        borderRadius: "10px",
        boxShadow: "0 10px 40px rgba(194, 65, 12, 0.35)",
      }}
    >
      <Container fluid>
        <div className="d-flex align-items-center">
          {/* Professional Icon */}
          <div
            className="me-4"
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(255, 255, 255, 0.18)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(255, 255, 255, 0.35)",
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
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 20%, transparent 70%)",
                animation: "pulse 3s infinite",
              }}
            />

            {/* Main Icon */}
            {React.createElement(FiRadio as any, {
              style: {
                fontSize: "2.2rem",
                color: "white",
                position: "relative",
                zIndex: 2,
                filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
              },
            })}
          </div>

          {/* Title và Description */}
          <div className="flex-grow-1">
            <h1
              style={{
                color: "white",
                fontSize: "1.6rem",
                fontWeight: "700",
                marginBottom: "0.4rem",
                textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                letterSpacing: "0.03em",
              }}
            >
              R007 - 5G SRAN PnP Declaration
            </h1>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.92)",
                fontSize: "0.82rem",
                marginBottom: "0",
                fontWeight: "400",
                textShadow: "0 1px 3px rgba(0,0,0,0.15)",
                letterSpacing: "0.01em",
              }}
            >
              Automated Plug & Play Declaration System for 5G SRAN Network
            </p>
          </div>

          {/* Enhanced Status Badge */}
          <div className="ms-4">
            <div
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                padding: "12px 30px",
                borderRadius: "10px",
                border: "1.5px solid rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(15px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                {React.createElement(FiRadio as any, {
                  style: {
                    fontSize: "1.9rem",
                    color: "#00e5ff",
                    marginRight: "12px",
                    filter: "drop-shadow(0 0 8px #00e5ff)",
                  },
                })}

                <div>
                  <div
                    style={{
                      color: "white",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      lineHeight: 1.2,
                      marginBottom: "3px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    System Active
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.85)",
                      fontSize: "0.76rem",
                      fontWeight: "400",
                      letterSpacing: "0.01em",
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
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.5; 
          }
          50% { 
            transform: scale(1.15); 
            opacity: 0.85; 
          }
        }
      `}</style>
    </animated.div>
  );
};

export default R007Header;
