// src/components/Dashboard/SalesChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SalesChart.css';

const SalesChart = ({ data, t }) => {
  // Format des données pour le graphique
  const chartData = data || [
    { day: 'Lun', orders: 12, revenue: 850 },
    { day: 'Mar', orders: 19, revenue: 1240 },
    { day: 'Mer', orders: 15, revenue: 980 },
    { day: 'Jeu', orders: 22, revenue: 1560 },
    { day: 'Ven', orders: 28, revenue: 1890 },
    { day: 'Sam', orders: 35, revenue: 2340 },
    { day: 'Dim', orders: 30, revenue: 2100 },
  ];

  return (
    <div className="sales-chart">
      <h3>📈 Évolution des ventes (7 derniers jours)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px' 
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Commandes"
            dot={{ fill: '#3b82f6', r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Revenus (DH)"
            dot={{ fill: '#10b981', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;