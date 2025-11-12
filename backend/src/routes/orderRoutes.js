// backend/src/routes/orderRoutes.js

import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignDeliverer,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getAllOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, authorize('admin'), deleteOrder);

router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignDeliverer);

export default router;