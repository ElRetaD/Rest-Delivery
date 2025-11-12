// src/components/Dashboard/OrderCard.jsx

import React from 'react';
import { Clock } from 'lucide-react';
import './OrderCard.css';

const OrderCard = ({ order, onStatusChange, t }) => {
  const statusColors = {
    'new': '#f59e0b',
    'inProgress': '#3b82f6',
    'delivered': '#10b981'
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <h4>#{order.id} - {order.customer}</h4>
          <p className="order-time">
            <Clock size={14} /> {order.time}
          </p>
        </div>
        <span 
          className="order-status" 
          style={{ backgroundColor: statusColors[order.status] }}
        >
          {t.status[order.status]}
        </span>
      </div>
      <div className="order-body">
        <p className="order-items">{order.items}</p>
        {order.deliverer && (
          <p className="order-deliverer">
            📦 {t.deliverer}: {order.deliverer}
          </p>
        )}
      </div>
      <div className="order-footer">
        <span className="order-total">{order.total} {t.dh}</span>
        {order.status === 'new' && (
          <button 
            className="btn-accept" 
            onClick={() => onStatusChange(order.id, 'inProgress')}
          >
            {t.acceptOrder}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;