// src/components/Dashboard/TopDishesChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TopDishesChart.css';

const TopDishesChart = ({ data }) => {
  const chartData = data || [
    { name: 'Burger', orders: 45, revenue: 2025 },
    { name: 'Pizza', orders: 38, revenue: 2280 },
    { name: 'Tacos', orders: 32, revenue: 1120 },
    { name: 'Pasta', orders: 28, revenue: 1400 },
    { name: 'Sandwich', orders: 22, revenue: 836 },
  ];

  return (
    <div className="top-dishes-chart">
      <h3>Top 5 des plats les plus vendus</h3>
      <div className="chart-scroll-wrapper">
        <div className="chart-responsive-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#764ba2" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
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
                cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                dataKey="orders" 
                fill="url(#ordersBarGradient)" 
                name="Commandes" 
                radius={[12, 12, 0, 0]}
                stroke="#667eea"
                strokeWidth={2}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#revenueBarGradient)" 
                name="Revenus (DH)" 
                radius={[12, 12, 0, 0]}
                stroke="#10b981"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TopDishesChart;