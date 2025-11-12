// backend/src/controllers/orderController.js

import Order from '../models/Order.js';
import User from '../models/User.js';
import Deliverer from '../models/Deliverer.js';

// @desc    Récupérer toutes les commandes
// @route   GET /api/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('deliverer', 'name phone status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('Erreur getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message,
    });
  }
};

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('deliverer', 'name phone vehicleType currentLocation status');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Erreur getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error.message,
    });
  }
};

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      total,
      deliveryAddress,
      paymentMethod,
      notes,
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un article',
      });
    }

    // Créer la commande
    const order = await Order.create({
      customer: req.user.id,
      customerName,
      customerPhone,
      items,
      total,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // +30 minutes
    });

    // Émettre l'événement Socket.io pour nouvelle commande
    req.io.emit('newOrder', order);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order,
    });
  } catch (error) {
    console.error('Erreur createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le statut d'une commande
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['new', 'accepted', 'preparing', 'ready', 'inProgress', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    // Émettre l'événement Socket.io
    req.io.emit('orderUpdated', order);

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      order,
    });
  } catch (error) {
    console.error('Erreur updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message,
    });
  }
};

// @desc    Assigner un livreur à une commande
// @route   PATCH /api/orders/:id/assign
// @access  Private (Admin)
export const assignDeliverer = async (req, res) => {
  try {
    const { delivererId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    const deliverer = await Deliverer.findById(delivererId);
    if (!deliverer) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé',
      });
    }

    if (deliverer.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Le livreur n\'est pas disponible',
      });
    }

    order.deliverer = delivererId;
    order.status = 'inProgress';
    await order.save();

    deliverer.currentOrders.push(order._id);
    deliverer.status = 'busy';
    await deliverer.save();

    // Émettre l'événement Socket.io
    req.io.emit('orderUpdated', order);
    req.io.to(`deliverer_${delivererId}`).emit('newOrderAssigned', order);

    res.status(200).json({
      success: true,
      message: 'Livreur assigné avec succès',
      order,
    });
  } catch (error) {
    console.error('Erreur assignDeliverer:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation du livreur',
      error: error.message,
    });
  }
};

// @desc    Supprimer une commande
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Commande supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur deleteOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la commande',
      error: error.message,
    });
  }
};