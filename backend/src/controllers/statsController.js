// backend/src/controllers/statsController.js

import Order from '../models/Order.js';
import Menu from '../models/Menu.js';

// @desc    Statistiques du jour
// @route   GET /api/stats/today
// @access  Private (Admin)
export const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: today },
    });

    const stats = {
      totalOrders: orders.length,
      newOrders: orders.filter(o => o.status === 'new').length,
      inProgressOrders: orders.filter(o => o.status === 'inProgress').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      revenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
        : 0,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Erreur getTodayStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

// @desc    Statistiques de la semaine
// @route   GET /api/stats/week
// @access  Private (Admin)
export const getWeekStats = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const orders = await Order.find({
      createdAt: { $gte: weekAgo },
    });

    const stats = {
      totalOrders: orders.length,
      revenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
        : 0,
      ordersByDay: [],
    };

    // Grouper par jour
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter(o => 
        o.createdAt >= date && o.createdAt < nextDay
      );

      stats.ordersByDay.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders
          .filter(o => o.status === 'delivered')
          .reduce((sum, order) => sum + order.total, 0),
      });
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Erreur getWeekStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

// @desc    Statistiques du mois
// @route   GET /api/stats/month
// @access  Private (Admin)
export const getMonthStats = async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const orders = await Order.find({
      createdAt: { $gte: monthAgo },
    });

    const stats = {
      totalOrders: orders.length,
      revenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
        : 0,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Erreur getMonthStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

// @desc    Plats les plus commandés
// @route   GET /api/stats/top-dishes
// @access  Private (Admin)
export const getTopDishes = async (req, res) => {
  try {
    const topDishes = await Menu.find({ isAvailable: true })
      .sort({ orderCount: -1 })
      .limit(10)
      .select('name nameAr price orderCount category');

    res.status(200).json({
      success: true,
      count: topDishes.length,
      dishes: topDishes,
    });
  } catch (error) {
    console.error('Erreur getTopDishes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plats populaires',
      error: error.message,
    });
  }
};

// @desc    Statistiques personnalisées
// @route   GET /api/stats/custom
// @access  Private (Admin)
export const getCustomStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate et endDate sont requis',
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    const stats = {
      totalOrders: orders.length,
      revenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
        : 0,
      statusBreakdown: {
        new: orders.filter(o => o.status === 'new').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        inProgress: orders.filter(o => o.status === 'inProgress').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
    };

    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      stats,
    });
  } catch (error) {
    console.error('Erreur getCustomStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};