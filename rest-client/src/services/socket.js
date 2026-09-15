// src/services/socket.js

import { io } from 'socket.io-client';

// Détecter automatiquement l'URL du serveur Socket.io
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app') || window.location.protocol === 'https:') {
    return 'https://lacanyada-backend.onrender.com';
  }
  return `http://${hostname}:5000`;
};

const API_URL = getSocketUrl();

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.hasConnectedBefore = false;
    this.trackedOrders = new Set();
    this.localListeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(API_URL, {
      auth: {
        token: token || localStorage.getItem('clientToken'),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      const isReconnection = this.hasConnectedBefore;
      this.isConnected = true;
      this.hasConnectedBefore = true;

      // Resynchronisation automatique de toutes les rooms de tracking actives
      for (const orderId of this.trackedOrders) {
        console.log('🔄 [Socket Resync] Re-abonnement commande:', orderId);
        this.socket.emit('trackOrder', { orderId });
      }

      if (isReconnection) {
        this.emitLocal('reconnected');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.hasConnectedBefore = false;
      this.trackedOrders.clear();
      this.localListeners.clear();
    }
  }

  // Écouter un événement local (ex: 'reconnected')
  on(event, callback) {
    if (!this.localListeners.has(event)) {
      this.localListeners.set(event, []);
    }
    this.localListeners.get(event).push(callback);
  }

  emitLocal(event, data) {
    if (!this.localListeners.has(event)) return;
    this.localListeners.get(event).forEach(cb => {
      try { cb(data); } catch (e) { console.error('Error in local listener:', e); }
    });
  }

  // Écouter les mises à jour de statut de commande
  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('orderStatusChanged', callback);
    }
  }

  // Écouter les mises à jour de position du livreur
  onDelivererPositionUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivererPositionUpdated', callback);
    }
  }

  // Suivre une commande avec auto-resync lors des reconnexions
  trackOrder(orderId) {
    if (!orderId) return;
    this.trackedOrders.add(orderId);
    if (this.socket?.connected) {
      this.socket.emit('trackOrder', { orderId });
    }
  }

  // Arrêter de suivre une commande
  untrackOrder(orderId) {
    if (!orderId) return;
    this.trackedOrders.delete(orderId);
  }

  // Écouter les notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Écouter les changements de statut du restaurant (Horaires & Panic Mode)
  onRestaurantStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('restaurantStatusChanged', callback);
    }
  }

  // Écouter quand la commande est livrée
  onOrderDelivered(callback) {
    if (this.socket) {
      this.socket.on('orderDelivered', callback);
    }
  }

  // Retirer les listeners
  off(event, callback) {
    if (this.localListeners.has(event)) {
      if (callback) {
        const cbs = this.localListeners.get(event);
        const idx = cbs.indexOf(callback);
        if (idx > -1) cbs.splice(idx, 1);
      } else {
        this.localListeners.delete(event);
      }
    }
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;

