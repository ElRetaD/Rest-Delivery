// backend/src/routes/delivererRoutes.js

import express from 'express';
import {
  getAllDeliverers,
  getAvailableDeliverers,
  getDelivererById,
  createDeliverer,
  updateDelivererPosition,
  updateDelivererStatus,
  deleteDeliverer,
} from '../controllers/delivererController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getAllDeliverers)
  .post(protect, authorize('admin'), createDeliverer);

router.get('/available', protect, authorize('admin'), getAvailableDeliverers);

router.route('/:id')
  .get(protect, getDelivererById)
  .delete(protect, authorize('admin'), deleteDeliverer);

router.patch('/:id/position', protect, updateDelivererPosition);
router.patch('/:id/status', protect, updateDelivererStatus);

export default router;