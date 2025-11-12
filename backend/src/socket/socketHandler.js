// backend/src/socket/socketHandler.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (io) => {
  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

    // Rejoindre des rooms selon le rôle
    if (socket.user.role === 'admin') {
      socket.join('admins');
      console.log(`Admin ${socket.user.name} joined admins room`);
    } else if (socket.user.role === 'deliverer') {
      socket.join(`deliverer_${socket.user.id}`);
      console.log(`Deliverer ${socket.user.name} joined personal room`);
    } else if (socket.user.role === 'client') {
      socket.join(`client_${socket.user.id}`);
      console.log(`Client ${socket.user.name} joined personal room`);
    }

    // ==================== ADMIN EVENTS ====================
    
    // Admin rejoint la room
    socket.on('joinAdminRoom', () => {
      socket.join('admins');
      console.log(`${socket.user.name} joined admins room`);
    });

    // Accepter une commande
    socket.on('acceptOrder', (data) => {
      console.log('Order accepted:', data);
      io.to('admins').emit('orderAccepted', data);
      io.to(`deliverer_${data.delivererId}`).emit('newOrderAssigned', data);
    });

    // Mettre à jour le statut d'une commande
    socket.on('updateOrderStatus', (data) => {
      console.log('Order status updated:', data);
      io.to('admins').emit('orderUpdated', data);
      io.to(`client_${data.clientId}`).emit('orderStatusChanged', data);
    });

    // ==================== DELIVERER EVENTS ====================
    
    // Mettre à jour la position du livreur
    socket.on('updatePosition', (data) => {
      const { lat, lng } = data;
      console.log(`Deliverer ${socket.user.name} position:`, { lat, lng });
      
      // Envoyer à tous les admins
      io.to('admins').emit('delivererPositionUpdated', {
        delivererId: socket.user.id,
        position: { lat, lng },
        name: socket.user.name,
      });

      // Envoyer au client si commande en cours
      if (data.orderId) {
        io.to(`client_${data.clientId}`).emit('delivererPositionUpdated', {
          position: { lat, lng },
        });
      }
    });

    // Livreur accepte une commande
    socket.on('acceptDelivery', (data) => {
      console.log('Delivery accepted:', data);
      io.to('admins').emit('deliveryAccepted', data);
      io.to(`client_${data.clientId}`).emit('deliveryStarted', data);
    });

    // Commande livrée
    socket.on('orderDelivered', (data) => {
      console.log('Order delivered:', data);
      io.to('admins').emit('orderDelivered', data);
      io.to(`client_${data.clientId}`).emit('orderDelivered', data);
    });

    // ==================== CLIENT EVENTS ====================
    
    // Client crée une nouvelle commande
    socket.on('newOrder', (order) => {
      console.log('New order created:', order);
      io.to('admins').emit('newOrder', order);
    });

    // Suivre une commande
    socket.on('trackOrder', (data) => {
      socket.join(`order_${data.orderId}`);
      console.log(`Client tracking order: ${data.orderId}`);
    });

    // ==================== NOTIFICATIONS ====================
    
    // Envoyer une notification
    socket.on('sendNotification', (data) => {
      const { to, message, type } = data;
      
      if (to === 'all') {
        io.emit('notification', { message, type });
      } else if (to === 'admins') {
        io.to('admins').emit('notification', { message, type });
      } else {
        io.to(`${data.role}_${to}`).emit('notification', { message, type });
      }
    });

    // Marquer une notification comme lue
    socket.on('markNotificationRead', (data) => {
      console.log('Notification marked as read:', data);
    });

    // ==================== DISCONNECT ====================
    
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};