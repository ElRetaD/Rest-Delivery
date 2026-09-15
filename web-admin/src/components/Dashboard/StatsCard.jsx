// src/components/Dashboard/StatsCard.jsx

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

const StatsCard = ({ icon: Icon, title, value, color, trend, trendValue }) => {
  return (
    <div className="stats-card" style={{ '--card-color': color }}>
      <div className="stats-card-header">
        <div className="stats-icon-wrapper">
          <div className="stats-icon" style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
            <Icon size={24} style={{ color }} />
          </div>
        </div>
        {trend && (
          <div className={`stats-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
      <div className="stats-card-accent" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}></div>
    </div>
  );
};

export default StatsCard;