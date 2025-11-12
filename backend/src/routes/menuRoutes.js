// backend/src/routes/menuRoutes.js

import express from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllMenuItems)
  .post(protect, authorize('admin'), createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .patch(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

router.patch('/:id/availability', protect, authorize('admin'), updateMenuItemAvailability);

export default router;