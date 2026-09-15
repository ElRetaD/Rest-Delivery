// src/pages/DashboardPage.jsx

import React from 'react';
import { ShoppingBag, Coins, Clock, Package, TrendingUp, Users, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import OrderCard from '../components/Dashboard/OrderCard';
import SalesChart from '../components/Dashboard/SalesChart';
import TopDishesChart from '../components/Dashboard/TopDishesChart';
import { ordersAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './DashboardPage.css';
import '../components/Dashboard/SalesChart.css';
import '../components/Dashboard/TopDishesChart.css';

const DashboardPage = ({ orders, setOrders, stats, t, setCurrentPage, weekStats, topDishes, deliverers = [] }) => {
  
  // Calculer les métriques supplémentaires
  const newOrdersCount = orders.filter(o => o.status === 'new' || o.status === 'accepted').length;
  const inProgressOrdersCount = orders.filter(o => o.status === 'inProgress').length;
  const activeDeliverersCount = deliverers.filter(d => d.status === 'available' || d.status === 'busy').length;
  
  // Quick Actions
  const quickActions = [
    {
      icon: ShoppingBag,
      label: 'Nouvelles commandes',
      count: newOrdersCount,
      color: '#facc15',
      action: () => setCurrentPage('orders'),
      filter: 'new'
    },
    {
      icon: Package,
      label: 'En cours',
      count: inProgressOrdersCount,
      color: '#3b82f6',
      action: () => setCurrentPage('orders'),
      filter: 'inProgress'
    },
    {
      icon: Users,
      label: 'Livreurs actifs',
      count: activeDeliverersCount,
      color: '#10b981',
      action: () => setCurrentPage('map'),
      filter: null
    },
    {
      icon: AlertCircle,
      label: 'Require attention',
      count: 0,
      color: '#ef4444',
      action: () => setCurrentPage('orders'),
      filter: null
    }
  ];
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders(orders.map(o => 
          (o._id === orderId || o.orderNumber === orderId) ? { ...o, status: response.order?.status || newStatus } : o
        ));
        notify.success('Statut mis à jour!');
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      notify.error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const salesChartData = weekStats?.ordersByDay.map(d => ({
    day: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    orders: d.orders,
    revenue: d.revenue,
  })) || [];

  const topDishesData = topDishes?.map(d => ({
    name: d.name,
    orders: d.orderCount,
    revenue: d.orderCount * d.price, // Approximation
  })) || [];

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <h1>{t.dashboard}</h1>
        <p className="dashboard-subtitle">Vue d'ensemble de votre restaurant</p>
      </div>

      <div className="stats-grid">
        <StatsCard 
          icon={ShoppingBag} 
          title={t.todayOrders} 
          value={stats.totalOrders || 0} 
          color="#3b82f6"
          trend="up"
          trendValue="12"
        />
        <StatsCard 
          icon={Coins} 
          title={t.revenue} 
          value={`${stats.revenue || 0} ${t.dh}`} 
          color="#10b981"
          trend="up"
          trendValue="8"
        />
        <StatsCard 
          icon={Clock} 
          title={t.pending} 
          value={stats.newOrders || 0} 
          color="#facc15"
          trend="down"
          trendValue="5"
        />
        <StatsCard 
          icon={Package} 
          title={t.delivered} 
          value={stats.deliveredOrders || 0} 
          color="#8b5cf6"
          trend="up"
          trendValue="15"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="quick-actions-header">
          <h2>
            <Zap size={24} />
            Actions rapides
          </h2>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="quick-action-card"
                onClick={action.action}
                style={{ '--action-color': action.color }}
              >
                <div className="quick-action-icon" style={{ background: `${action.color}15` }}>
                  <Icon size={24} style={{ color: action.color }} />
                </div>
                <div className="quick-action-content">
                  <span className="quick-action-label">{action.label}</span>
                  <span className="quick-action-count">{action.count}</span>
                </div>
                <ArrowRight size={20} className="quick-action-arrow" style={{ color: action.color }} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="recent-section">
        <div className="recent-section-header">
          <h2>{t.recentOrders}</h2>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Aucune commande pour le moment</p>
          </div>
        ) : (
          <>
            <div className="orders-grid">
              {orders.slice(0, 2).map(order => (
                <OrderCard 
                  key={order._id} 
                  order={{
                    id: order.orderNumber,
                    customer: order.customerName,
                    phone: order.customerPhone,
                    items: order.items.map(item => `${item.name} × ${item.quantity}`).join(', '),
                    rawItems: order.items || [],
                    paymentMethod: order.paymentMethod,
                    notes: order.notes,
                    total: order.total,
                    deliveryFee: order.deliveryFee || 0,
                    status: order.status,
                    time: new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    deliverer: order.deliverer?.name,
                    failedDeliveryReason: order.failedDeliveryReason,
                    failedDeliveryNote: order.failedDeliveryNote,
                  }}
                  t={t}
                  onStatusChange={() => handleStatusChange(order._id, 'inProgress')} 
                />
              ))}
            </div>
            {orders.length > 2 && (
              <div className="view-more-container">
                <button 
                  className="btn-view-more"
                  onClick={() => {
                    if (setCurrentPage) {
                      setCurrentPage('orders');
                    }
                  }}
                >
                  Voir {orders.length - 2} autre{orders.length - 2 > 1 ? 's' : ''} commande{orders.length - 2 > 1 ? 's' : ''} →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="charts-section">
        <div className="charts-section-header">
          <h2>📊 Analyses et Graphiques</h2>
          <p className="charts-subtitle">Visualisez vos performances et tendances</p>
        </div>
        <div className="charts-grid">
          <SalesChart data={salesChartData} t={t} />
          <TopDishesChart data={topDishesData} t={t} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;