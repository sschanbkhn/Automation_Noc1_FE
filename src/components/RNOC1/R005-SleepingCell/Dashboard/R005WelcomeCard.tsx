// src/components/RNOC1/R005-SleepingCell/Dashboard/WelcomeCard.tsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const WelcomeCard: React.FC = () => {
  return (
    <Card style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '16px',
      color: 'white',
      height: '200px'
    }}>
      <Card.Body className="p-4 d-flex align-items-center">
        <Row className="w-100 align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 rounded me-3" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                <span style={{fontSize: '1.5rem'}}>📱</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">Welcome Back</h3>
                <p className="mb-0 opacity-75">RNOC Engineer</p>
              </div>
            </div>
            <Row>
              <Col md={6}>
                <p className="mb-1 opacity-75">Analyzed</p>
                <h4 className="fw-bold mb-0">1,250</h4>
              </Col>
              <Col md={6}>
                <p className="mb-1 opacity-75">Detected</p>
                <h4 className="fw-bold mb-0">150</h4>
              </Col>
            </Row>
          </Col>
          <Col md={4} className="text-center">
            {/* 3D Chart placeholder */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'conic-gradient(#ffffff44 0deg, #ffffff88 120deg, #ffffff44 240deg, #ffffff88 360deg)',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{fontSize: '2rem', color: '#667eea'}}>📊</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default WelcomeCard;