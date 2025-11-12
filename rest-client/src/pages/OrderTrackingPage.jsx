// src/pages/OrderTrackingPage.jsx

import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, MapPin } from 'lucide-react';
import './OrderTrackingPage.css';

const OrderTrackingPage = () => {
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [estimatedTime, setEstimatedTime] = useState(25);

  // Simuler la progression de la commande
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderStatus === 'preparing') {
        setOrderStatus('ready');
        setEstimatedTime(15);
      } else if (orderStatus === 'ready') {
        setOrderStatus('inProgress');
        setEstimatedTime(10);
      } else if (orderStatus === 'inProgress') {
        setOrderStatus('delivered');
        setEstimatedTime(0);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [orderStatus]);

  const steps = [
    {
      id: 'preparing',
      icon: Package,
      title: 'Préparation',
      description: 'Votre commande est en cours de préparation',
    },
    {
      id: 'ready',
      icon: Clock,
      title: 'Prête',
      description: 'Votre commande est prête pour la livraison',
    },
    {
      id: 'inProgress',
      icon: Truck,
      title: 'En cours',
      description: 'Votre commande est en route',
    },
    {
      id: 'delivered',
      icon: CheckCircle,
      title: 'Livrée',
      description: 'Votre commande a été livrée',
    },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === orderStatus);
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <h1>Suivi de commande</h1>
        <p className="order-number">Commande #ORD00123</p>

        {/* Estimated Time */}
        {estimatedTime > 0 && (
          <div className="estimated-time">
            <Clock size={24} />
            <div>
              <p className="time-label">Temps estimé</p>
              <p className="time-value">{estimatedTime} minutes</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const currentIndex = getCurrentStepIndex();
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.id} className="step-wrapper">
                <div className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-icon">
                    <Icon size={24} />
                  </div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-line ${isCompleted ? 'completed' : ''}`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Placeholder */}
        {orderStatus === 'inProgress' && (
          <div className="map-section">
            <h2>Localisation du livreur</h2>
            <div className="map-placeholder">
              <MapPin size={48} />
              <p>La carte s'affichera ici en temps réel</p>
              <div className="deliverer-info">
                <p><strong>Livreur:</strong> Youssef</p>
                <p><strong>Distance:</strong> 2.5 km</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="order-details">
          <h2>Détails de la commande</h2>
          <div className="detail-item">
            <span>Burger Classique × 2</span>
            <span>90 DH</span>
          </div>
          <div className="detail-item">
            <span>Pizza Margherita × 1</span>
            <span>60 DH</span>
          </div>
          <div className="detail-divider"></div>
          <div className="detail-item total">
            <span>Total</span>
            <span>165 DH</span>
          </div>
        </div>

        {/* Success Message */}
        {orderStatus === 'delivered' && (
          <div className="success-message">
            <CheckCircle size={48} />
            <h2>Commande livrée avec succès!</h2>
            <p>Merci d'avoir commandé chez nous</p>
            <p>Bon appétit! 🍽️</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;