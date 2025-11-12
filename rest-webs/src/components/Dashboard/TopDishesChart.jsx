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
      <h3>🍔 Top 5 des plats les plus vendus</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px' 
            }}
          />
          <Legend />
          <Bar dataKey="orders" fill="#667eea" name="Commandes" radius={[8, 8, 0, 0]} />
          <Bar dataKey="revenue" fill="#10b981" name="Revenus (DH)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopDishesChart;