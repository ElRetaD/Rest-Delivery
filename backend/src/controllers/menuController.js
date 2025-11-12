// backend/src/controllers/menuController.js

import Menu from '../models/Menu.js';

// @desc    Récupérer tous les plats
// @route   GET /api/menu
// @access  Public
export const getAllMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (available) query.isAvailable = available === 'true';

    const menuItems = await Menu.find(query).sort({ orderCount: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error('Erreur getAllMenuItems:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du menu',
      error: error.message,
    });
  }
};

// @desc    Récupérer un plat par ID
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Plat non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error('Erreur getMenuItemById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du plat',
      error: error.message,
    });
  }
};

// @desc    Créer un nouveau plat
// @route   POST /api/menu
// @access  Private (Admin)
export const createMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Plat créé avec succès',
      menuItem,
    });
  } catch (error) {
    console.error('Erreur createMenuItem:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du plat',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour un plat
// @route   PATCH /api/menu/:id
// @access  Private (Admin)
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Plat non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plat mis à jour avec succès',
      menuItem,
    });
  } catch (error) {
    console.error('Erreur updateMenuItem:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du plat',
      error: error.message,
    });
  }
};

// @desc    Modifier la disponibilité d'un plat
// @route   PATCH /api/menu/:id/availability
// @access  Private (Admin)
export const updateMenuItemAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Plat non trouvé',
      });
    }

    menuItem.isAvailable = available;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: 'Disponibilité mise à jour avec succès',
      menuItem,
    });
  } catch (error) {
    console.error('Erreur updateMenuItemAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la disponibilité',
      error: error.message,
    });
  }
};

// @desc    Supprimer un plat
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Plat non trouvé',
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Plat supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur deleteMenuItem:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du plat',
      error: error.message,
    });
  }
};