// src/components/Dashboard/StatsCard.jsx

import React from 'react';
import './StatsCard.css';

const StatsCard = ({ icon: Icon, title, value, color }) => {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-icon" style={{ backgroundColor: color + '20' }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;