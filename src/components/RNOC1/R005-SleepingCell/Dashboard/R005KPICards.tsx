import React from 'react';
import { Card } from 'react-bootstrap';

interface KPICardsProps {
  type: string;
  value: string;
  change: string;
  color: string;
  icon: string;
  title: string;
}

const KPICards: React.FC<KPICardsProps> = ({ value, change, color, icon, title }) => {
  const isPositive = change.includes('+');
  
  return (
    <Card style={{
      backgroundColor: color,
      border: 'none',
      borderRadius: '16px',
      height: '140px'
    }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-white mb-1">{title}</h6>
            <h2 className="text-white fw-bold mb-0">{value}</h2>
          </div>
          <span className={`badge ${isPositive ? 'bg-success' : 'bg-danger'} bg-opacity-25`}>
            {change}
          </span>
        </div>
        
        {/* Mini chart area */}
        <div style={{height: '40px', position: 'relative', overflow: 'hidden'}}>
          <svg width="100%" height="40" style={{position: 'absolute', bottom: 0}}>
            <path 
              d="M0,35 Q25,20 50,25 T100,15 L100,40 L0,40 Z" 
              fill="rgba(255,255,255,0.3)"
            />
            <path 
              d="M0,35 Q25,20 50,25 T100,15" 
              stroke="rgba(255,255,255,0.8)" 
              strokeWidth="2" 
              fill="none"
            />
          </svg>
        </div>
      </Card.Body>
    </Card>
  );
};

export default KPICards;