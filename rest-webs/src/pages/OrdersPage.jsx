// src/pages/OrdersPage.jsx

import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Clock, Package, XCircle, Truck, AlertCircle } from 'lucide-react';
import OrderCard from '../components/Dashboard/OrderCard';
import { ordersAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './OrdersPage.css';

const OrdersPage = ({ orders, setOrders, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, inProgress, delivered, cancelled

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

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    // Filtre par statut
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerPhone?.toLowerCase().includes(searchLower) ||
        order.items?.some(item => item.name?.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Trier par date (plus récent en premier)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const statusCounts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new' || o.status === 'accepted').length,
    inProgress: orders.filter(o => o.status === 'inProgress' || o.status === 'preparing' || o.status === 'ready').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    notDelivered: orders.filter(o => o.status === 'not_delivered').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="page">
      <div className="orders-page-header">
        <h1>Toutes les commandes</h1>
        <div className="orders-stats">
          <span className="stat-badge total">{statusCounts.all} Total</span>
          <span className="stat-badge new">{statusCounts.new} Nouvelles</span>
          <span className="stat-badge in-progress">{statusCounts.inProgress} En cours</span>
          <span className="stat-badge delivering">{statusCounts.delivering} En livraison</span>
          <span className="stat-badge not-delivered">{statusCounts.notDelivered} Non livrées</span>
          <span className="stat-badge delivered">{statusCounts.delivered} Livrées</span>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="orders-filters">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par numéro, client, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn filter-all ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Toutes ({statusCounts.all})
          </button>
          <button
            className={`filter-btn filter-new ${statusFilter === 'new' ? 'active' : ''}`}
            onClick={() => setStatusFilter('new')}
          >
            <Clock size={16} />
            Nouvelles ({statusCounts.new})
          </button>
          <button
            className={`filter-btn filter-in-progress ${statusFilter === 'inProgress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inProgress')}
          >
            <Package size={16} />
            En cours ({statusCounts.inProgress})
          </button>
          <button
            className={`filter-btn filter-delivering ${statusFilter === 'delivering' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivering')}
          >
            <Truck size={16} />
            En livraison ({statusCounts.delivering})
          </button>
          <button
            className={`filter-btn filter-not-delivered ${statusFilter === 'not_delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('not_delivered')}
          >
            <AlertCircle size={16} />
            Non livrées ({statusCounts.notDelivered})
          </button>
          <button
            className={`filter-btn filter-delivered ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            <CheckCircle size={16} />
            Livrées ({statusCounts.delivered})
          </button>
          <button
            className={`filter-btn filter-cancelled ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            <XCircle size={16} />
            Annulées ({statusCounts.cancelled})
          </button>
        </div>
      </div>

      {/* Liste des commandes */}
      {sortedOrders.length === 0 ? (
        <div className="no-orders">
          <Package size={48} color="#9ca3af" />
          <p>
            {searchTerm || statusFilter !== 'all'
              ? 'Aucune commande ne correspond à vos critères'
              : 'Aucune commande pour le moment'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {sortedOrders.map(order => (
            <OrderCard
              key={order._id}
              order={{
                id: order.orderNumber,
                customer: order.customerName,
                phone: order.customerPhone,
                items: order.items?.map(item => `${item.name} × ${item.quantity}`).join(', ') || '',
                rawItems: order.items || [],
                paymentMethod: order.paymentMethod,
                notes: order.notes,
                total: order.total,
                deliveryFee: order.deliveryFee || 0,
                status: order.status,
                time: new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                date: new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }),
                deliverer: order.deliverer?.name,
                address: order.deliveryAddress?.street,
                failedDeliveryReason: order.failedDeliveryReason,
                failedDeliveryNote: order.failedDeliveryNote,
              }}
              t={t}
              onStatusChange={(_, newStatus) => handleStatusChange(order._id, newStatus)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
