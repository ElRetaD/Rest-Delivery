// src/pages/OrderTrackingPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Package, Clock, Truck, CheckCircle, MapPin } from 'lucide-react';
// Note: Si vous utilisez react-router, décommentez la ligne ci-dessous
// import { useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import './OrderTrackingPage.css';

// Import OrderTrackingMap
import OrderTrackingMapComponent from '../components/OrderTrackingMap';

// Fallback component si Google Maps n'est pas disponible
const FallbackMap = ({ delivererPosition }) => (
  <div className="map-fallback">
    <div className="map-placeholder">
      <MapPin size={48} className="map-icon" />
      <p>Position du livreur en direct</p>
      {delivererPosition && (
        <p className="coordinates">
          Lat: {delivererPosition.lat.toFixed(4)}, Lng: {delivererPosition.lng.toFixed(4)}
        </p>
      )}
      <small>Pour voir la carte interactive, configurez votre clé Google Maps</small>
    </div>
  </div>
);

// Wrapper avec error handling
const OrderTrackingMap = (props) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return <FallbackMap delivererPosition={props.delivererPosition} />;
  }

  try {
    return <OrderTrackingMapComponent {...props} />;
  } catch (error) {
    console.warn('⚠️ Erreur OrderTrackingMap:', error);
    return <FallbackMap delivererPosition={props.delivererPosition} />;
  }
};

const OrderTrackingPage = ({ orderId: propOrderId }) => {
  // Récupérer l'orderId depuis les props ou le localStorage
  const orderId = propOrderId || localStorage.getItem('lastOrderId');
  
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [delivererPosition, setDelivererPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger ou rafraîchir les données de la commande
  const loadOrder = useCallback(async (silent = false) => {
    if (!orderId) {
      if (!silent) console.log('❌ Aucun orderId trouvé');
      if (!silent) toast.error('Aucune commande à suivre');
      setLoading(false);
      return;
    }

    try {
      const response = await ordersAPI.getById(orderId);
      
      if (response && response.success) {
        setOrder(response.order);
        setOrderStatus(response.order.status);
        
        // Calculer le temps estimé
        if (response.order.estimatedDeliveryTime) {
          const diff = new Date(response.order.estimatedDeliveryTime) - new Date();
          setEstimatedTime(Math.max(0, Math.ceil(diff / 60000)));
        }

        // Si un livreur est assigné, récupérer sa position
        if (response.order.deliverer?.currentLocation) {
          setDelivererPosition({
            lat: response.order.deliverer.currentLocation.lat,
            lng: response.order.deliverer.currentLocation.lng,
          });
        }
      } else if (!silent) {
        toast.error(response?.message || 'Commande non trouvée');
      }
    } catch (error) {
      if (!silent) {
        const errorMessage = error.response?.data?.message || 
                            'Erreur lors du chargement de la commande';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Connecter Socket.io et écouter les mises à jour avec rattrapage automatique (State Drift Healing)
  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    if (token && orderId) {
      socketService.connect(token);
      socketService.trackOrder(orderId);

      // Reconnexion Socket: rafraîchir immédiatement le snapshot REST
      const handleReconnect = () => {
        console.log('🔄 [OrderTracking] Socket reconnecté: rattrapage du snapshot REST');
        loadOrder(true);
      };
      socketService.on('reconnected', handleReconnect);

      // Écouter les mises à jour de statut
      const handleStatusUpdate = (data) => {
        if (data.orderId === orderId || data._id === orderId) {
          setOrderStatus(data.status);
          toast.success(`Statut mis à jour: ${getStatusLabel(data.status)}`);
        }
      };
      socketService.onOrderStatusUpdate(handleStatusUpdate);

      // Écouter les mises à jour de position du livreur
      const handlePositionUpdate = (data) => {
        if (data.orderId === orderId || !data.orderId) {
          setDelivererPosition({
            lat: data.position.lat,
            lng: data.position.lng,
          });
        }
      };
      socketService.onDelivererPositionUpdate(handlePositionUpdate);

      // Écouter quand la commande est livrée
      const handleDelivered = (data) => {
        if (data.orderId === orderId || data._id === orderId) {
          setOrderStatus('delivered');
          setEstimatedTime(0);
          toast.success('Commande livrée avec succès! 🎉');
        }
      };
      socketService.onOrderDelivered(handleDelivered);

      return () => {
        socketService.off('reconnected', handleReconnect);
        socketService.off('orderStatusChanged', handleStatusUpdate);
        socketService.off('delivererPositionUpdated', handlePositionUpdate);
        socketService.off('orderDelivered', handleDelivered);
        socketService.untrackOrder(orderId);
      };
    }
  }, [orderId, loadOrder]);

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

  const getStatusLabel = (status) => {
    const statusMap = {
      new: 'Nouvelle',
      accepted: 'Acceptée',
      preparing: 'En préparation',
      ready: 'Prête',
      inProgress: 'En cours de livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement de la commande...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <div className="error-state">
            <h2>Commande non trouvée</h2>
            <p>Impossible de charger les informations de la commande.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <h1>Suivi de commande</h1>
        <p className="order-number">Commande #{order.orderNumber}</p>

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

        {/* Map avec Google Maps */}
        {(orderStatus === 'inProgress' || delivererPosition) && (
          <div className="map-section">
            <h2>Localisation du livreur</h2>
            {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <OrderTrackingMap
                delivererPosition={delivererPosition}
                deliveryAddress={order.deliveryAddress}
              />
            ) : (
              <div className="map-placeholder">
                <MapPin size={48} />
                <p>Google Maps API Key non configurée</p>
                <p className="map-info">Ajoutez VITE_GOOGLE_MAPS_API_KEY dans votre fichier .env</p>
              </div>
            )}
            {order.deliverer && (
              <div className="deliverer-info">
                <p><strong>Livreur:</strong> {order.deliverer.name || 'En attente'}</p>
                {order.deliverer.phone && (
                  <p><strong>Téléphone:</strong> {order.deliverer.phone}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="order-details">
          <h2>Détails de la commande</h2>
          {order.items?.map((item, index) => (
            <div key={index} className="detail-item">
              <span>{item.name} × {item.quantity}</span>
              <span>{item.total} DH</span>
            </div>
          ))}
          {order.deliveryFee > 0 && (
            <div className="detail-item">
              <span>Frais de livraison</span>
              <span>{order.deliveryFee} DH</span>
            </div>
          )}
          <div className="detail-divider"></div>
          <div className="detail-item total">
            <span>Total</span>
            <span>{order.total} DH</span>
          </div>
          {order.deliveryAddress && (
            <div className="delivery-address">
              <h3>Adresse de livraison</h3>
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city} {order.deliveryAddress.postalCode}</p>
            </div>
          )}
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