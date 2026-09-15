// src/components/Dashboard/SalesChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SalesChart.css';

const SalesChart = ({ data = [], t }) => {
  // Si pas de données, afficher un message
  if (!data || data.length === 0) {
    return (
      <div className="sales-chart">
        <h3>{t?.weekSales || 'Ventes de la semaine'}</h3>
        <div className="chart-placeholder">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-chart">
      <h3>{t?.weekSales || 'Ventes de la semaine'}</h3>
      <div className="chart-scroll-wrapper">
        <div className="chart-responsive-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '13px', fontWeight: 500 }}
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '13px', fontWeight: 500 }}
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '2px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  padding: '12px 16px'
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6" 
                strokeWidth={4}
                name="Commandes"
                dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 10, stroke: '#3b82f6', strokeWidth: 3 }}
                fill="url(#ordersGradient)"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={4}
                name="Revenus (DH)"
                dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 10, stroke: '#10b981', strokeWidth: 3 }}
                fill="url(#revenueGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;

