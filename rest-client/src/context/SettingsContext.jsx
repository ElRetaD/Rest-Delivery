// src/context/SettingsContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import socketService from '../services/socket';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    restaurantName: 'La Canyada',
    phone: '+212 6XX XXX XXX',
    email: 'contact@restaurant.com',
    address: '',
    minimumOrder: 50,
    deliveryFee: 15,
    deliveryTime: 30,
    freeDeliveryThreshold: 100,
    enableCardPayment: true,
    enableCashPayment: true,
    enableStripe: false,
    currency: 'DH',
    isAcceptingOrders: true,
    pauseReason: '',
    isOpenNow: true,
    openStatusMessage: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Écoute en temps réel des changements d'horaires et du Panic Mode
    const handleStatusChanged = (newStatus) => {
      console.log('📡 Statut restaurant mis à jour en direct:', newStatus);
      setSettings((prev) => ({ ...prev, ...newStatus }));
    };

    socketService.onRestaurantStatusUpdate(handleStatusChanged);

    return () => {
      socketService.off('restaurantStatusChanged', handleStatusChanged);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublic();
      if (response.success && response.settings) {
        setSettings(prev => ({ ...prev, ...response.settings }));
      }
    } catch (error) {
      console.error('Erreur chargement settings:', error);
      // Utiliser les valeurs par défaut
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, reloadSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

