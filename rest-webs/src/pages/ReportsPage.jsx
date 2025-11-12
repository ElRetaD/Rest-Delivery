// src/pages/ReportsPage.jsx

import React from 'react';
import './ReportsPage.css';

const ReportsPage = ({ t }) => {
  return (
    <div className="page">
      <h1>{t.reportsStats}</h1>
      <div className="reports-grid">
        <div className="report-card">
          <h3>📊 {t.weekSales}</h3>
          <p className="report-value">3,450 {t.dh}</p>
          <p className="report-change positive">+15% {t.fromLastWeek}</p>
        </div>
        <div className="report-card">
          <h3>🍔 {t.topDishes}</h3>
          <ul className="top-items">
            <li>Burger - 45 {t.orders_plural}</li>
            <li>Pizza - 38 {t.orders_plural}</li>
            <li>Tacos - 32 {t.orders_plural}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;