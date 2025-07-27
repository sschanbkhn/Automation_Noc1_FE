// R005 Header - RNOC Style Blue Header
import React from 'react';
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';

const R005Header: React.FC = () => {
  // Animation cho header
  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.div 
      style={{
        ...headerAnimation,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)'
      }}
    >
      <Container fluid>
        <div className="text-center">
          {/* Main Title - RNOC Style */}
          <h1 style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: '800',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            R005 - SLEEPING CELL MANAGEMENT
          </h1>
          
          {/* Subtitle */}
          <h2 style={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontSize: '1.5rem',
            fontWeight: '500',
            letterSpacing: '0.05em',
            marginBottom: '0',
            textTransform: 'uppercase'
          }}>
            AUTOMATED DETECTION & RECOVERY SYSTEM
          </h2>
        </div>
      </Container>
    </animated.div>
  );
};

export default R005Header;