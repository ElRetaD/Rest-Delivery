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

const SOCKET_URL = getSocketUrl();

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connexion au serveur Socket.io
  connect() {
    if (this.socket?.connected) {
      console.log('Socket déjà connecté');
      return;
    }

    const token = localStorage.getItem('adminToken');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    let hasConnectedBefore = false;

    this.socket.on('connect', () => {
      console.log('✅ Socket connecté:', this.socket.id);
      // Rejoindre la room des admins
      if (token) {
        this.send('joinAdminRoom');
      }

      if (hasConnectedBefore) {
        console.log('🔄 [SocketService] Reconnexion détectée, émission reconnected');
        this.emit('reconnected');
      }
      hasConnectedBefore = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket déconnecté:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket:', error);
    });

    // Événements génériques
    this.setupDefaultListeners();
  }

  // Déconnexion
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket déconnecté');
    }
  }

  // Configuration des listeners par défaut
  setupDefaultListeners() {
    // Nouvelle commande
    this.socket.on('newOrder', (order) => {
      console.log('📦 Nouvelle commande:', order);
      this.emit('newOrder', order);
    });

    // Mise à jour commande
    this.socket.on('orderUpdated', (order) => {
      console.log('🔄 Commande mise à jour:', order);
      this.emit('orderUpdated', order);
    });

    // Position livreur mise à jour
    this.socket.on('delivererPositionUpdated', (data) => {
      console.log('📍 Position livreur mise à jour:', data);
      this.emit('delivererPositionUpdated', data);
    });

    // Statut livreur changé
    this.socket.on('delivererStatusChanged', (data) => {
      console.log('👤 Statut livreur changé:', data);
      this.emit('delivererStatusChanged', data);
    });

    // Notification
    this.socket.on('notification', (notification) => {
      console.log('🔔 Notification:', notification);
      this.emit('notification', notification);
    });
  }

  // S'abonner à un événement
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Se désabonner d'un événement
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Émettre un événement aux listeners locaux
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      callback(data);
    });
  }

  // Envoyer un événement au serveur
  send(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket non connecté');
    }
  }

  // ==================== ORDERS ====================
  
  // Rejoindre la room des admins
  joinAdminRoom() {
    this.send('joinAdminRoom');
  }

  // Accepter une commande
  acceptOrder(orderId, delivererId) {
    this.send('acceptOrder', { orderId, delivererId });
  }

  // Mettre à jour le statut d'une commande
  updateOrderStatus(orderId, status) {
    this.send('updateOrderStatus', { orderId, status });
  }

  // ==================== DELIVERERS ====================
  
  // Suivre la position d'un livreur
  trackDeliverer(delivererId) {
    this.send('trackDeliverer', { delivererId });
  }

  // Arrêter de suivre un livreur
  untrackDeliverer(delivererId) {
    this.send('untrackDeliverer', { delivererId });
  }

  // ==================== NOTIFICATIONS ====================
  
  // Marquer une notification comme lue
  markNotificationRead(notificationId) {
    this.send('markNotificationRead', { notificationId });
  }
}

// Créer une instance unique (Singleton)
const socketService = new SocketService();

export default socketService;