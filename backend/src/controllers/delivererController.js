// backend/src/controllers/delivererController.js

import Deliverer from '../models/Deliverer.js';

// @desc    Récupérer tous les livreurs
// @route   GET /api/deliverers
// @access  Private (Admin)
export const getAllDeliverers = async (req, res) => {
  try {
    const deliverers = await Deliverer.find()
      .populate('user', 'name email phone')
      .populate('currentOrders', 'orderNumber status');

    res.status(200).json({
      success: true,
      count: deliverers.length,
      deliverers,
    });
  } catch (error) {
    console.error('Erreur getAllDeliverers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des livreurs',
      error: error.message,
    });
  }
};

// @desc    Récupérer livreurs disponibles
// @route   GET /api/deliverers/available
// @access  Private (Admin)
export const getAvailableDeliverers = async (req, res) => {
  try {
    const deliverers = await Deliverer.find({
      status: 'available',
      isActive: true,
    }).populate('user', 'name phone');

    res.status(200).json({
      success: true,
      count: deliverers.length,
      deliverers,
    });
  } catch (error) {
    console.error('Erreur getAvailableDeliverers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des livreurs disponibles',
      error: error.message,
    });
  }
};

// @desc    Récupérer un livreur par ID
// @route   GET /api/deliverers/:id
// @access  Private
export const getDelivererById = async (req, res) => {
  try {
    const deliverer = await Deliverer.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('currentOrders');

    if (!deliverer) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      deliverer,
    });
  } catch (error) {
    console.error('Erreur getDelivererById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du livreur',
      error: error.message,
    });
  }
};

// @desc    Créer un nouveau livreur
// @route   POST /api/deliverers
// @access  Private (Admin)
export const createDeliverer = async (req, res) => {
  try {
    const { userId, name, phone, vehicleType, vehicleNumber } = req.body;

    const deliverer = await Deliverer.create({
      user: userId,
      name,
      phone,
      vehicleType,
      vehicleNumber,
    });

    res.status(201).json({
      success: true,
      message: 'Livreur créé avec succès',
      deliverer,
    });
  } catch (error) {
    console.error('Erreur createDeliverer:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du livreur',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour la position d'un livreur
// @route   PATCH /api/deliverers/:id/position
// @access  Private (Deliverer)
export const updateDelivererPosition = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const deliverer = await Deliverer.findById(req.params.id);
    if (!deliverer) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé',
      });
    }

    deliverer.currentLocation = { lat, lng };
    await deliverer.save();

    // Émettre l'événement Socket.io
    req.io.emit('delivererPositionUpdated', {
      delivererId: deliverer._id,
      position: { lat, lng },
    });

    res.status(200).json({
      success: true,
      message: 'Position mise à jour avec succès',
      position: deliverer.currentLocation,
    });
  } catch (error) {
    console.error('Erreur updateDelivererPosition:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la position',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le statut d'un livreur
// @route   PATCH /api/deliverers/:id/status
// @access  Private (Admin/Deliverer)
export const updateDelivererStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['available', 'busy', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
      });
    }

    const deliverer = await Deliverer.findById(req.params.id);
    if (!deliverer) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé',
      });
    }

    deliverer.status = status;
    await deliverer.save();

    // Émettre l'événement Socket.io
    req.io.emit('delivererStatusChanged', {
      delivererId: deliverer._id,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      deliverer,
    });
  } catch (error) {
    console.error('Erreur updateDelivererStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message,
    });
  }
};

// @desc    Supprimer un livreur
// @route   DELETE /api/deliverers/:id
// @access  Private (Admin)
export const deleteDeliverer = async (req, res) => {
  try {
    const deliverer = await Deliverer.findById(req.params.id);

    if (!deliverer) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé',
      });
    }

    await deliverer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Livreur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur deleteDeliverer:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du livreur',
      error: error.message,
    });
  }
};