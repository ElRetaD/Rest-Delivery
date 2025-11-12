// src/pages/DashboardPage.jsx

import React from 'react';
import { ShoppingBag, DollarSign, Clock, Package } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import OrderCard from '../components/Dashboard/OrderCard';
import SalesChart from '../components/Dashboard/SalesChart';
import TopDishesChart from '../components/Dashboard/TopDishesChart';
import { ordersAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './DashboardPage.css';

const DashboardPage = ({ orders, setOrders, stats, t }) => {
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders(orders.map(o => 
          o._id === orderId ? { ...o, status: newStatus } : o
        ));
        notify.success('Statut mis à jour!');
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      notify.error('Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="page">
      <h1>{t.dashboard}</h1>

      {/* Boutons de test des notifications */}
      <div style={{ 
        marginBottom: '1.5rem', 
        display: 'flex', 
        gap: '0.75rem', 
        flexWrap: 'wrap' 
      }}>
        <button 
          onClick={() => notify.success('Test Success!')} 
          style={{ 
            padding: '0.625rem 1.25rem', 
            background: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 600,
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ✅ Test Success
        </button>
        <button 
          onClick={() => notify.error('Test Error!')} 
          style={{ 
            padding: '0.625rem 1.25rem', 
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 600,
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ❌ Test Error
        </button>
        <button 
          onClick={() => notify.newOrder('ORD00123')} 
          style={{ 
            padding: '0.625rem 1.25rem', 
            background: '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 600,
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🔔 Test Nouvelle Commande
        </button>
        <button 
          onClick={() => notify.info('Info notification')} 
          style={{ 
            padding: '0.625rem 1.25rem', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 600,
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ℹ️ Test Info
        </button>
      </div>

      <div className="stats-grid">
        <StatsCard 
          icon={ShoppingBag} 
          title={t.todayOrders} 
          value={stats.totalOrders || 0} 
          color="#3b82f6" 
        />
        <StatsCard 
          icon={DollarSign} 
          title={t.revenue} 
          value={`${stats.revenue || 0} ${t.dh}`} 
          color="#10b981" 
        />
        <StatsCard 
          icon={Clock} 
          title={t.pending} 
          value={stats.newOrders || 0} 
          color="#f59e0b" 
        />
        <StatsCard 
          icon={Package} 
          title={t.delivered} 
          value={stats.deliveredOrders || 0} 
          color="#8b5cf6" 
        />
      </div>

      <SalesChart t={t} />
      <TopDishesChart />

      <div className="recent-section">
        <h2>{t.recentOrders}</h2>
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.slice(0, 4).map(order => (
              <OrderCard 
                key={order._id} 
                order={{
                  id: order.orderNumber,
                  customer: order.customerName,
                  items: order.items.map(item => `${item.name} × ${item.quantity}`).join(', '),
                  total: order.total,
                  status: order.status,
                  time: new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                  deliverer: order.deliverer?.name,
                }}
                t={t}
                onStatusChange={() => handleStatusChange(order._id, 'inProgress')} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;