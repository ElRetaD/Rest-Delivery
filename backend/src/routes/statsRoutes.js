// backend/src/routes/statsRoutes.js

import express from 'express';
import {
  getTodayStats,
  getWeekStats,
  getMonthStats,
  getTopDishes,
  getCustomStats,
} from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', protect, authorize('admin'), getTodayStats);
router.get('/week', protect, authorize('admin'), getWeekStats);
router.get('/month', protect, authorize('admin'), getMonthStats);
router.get('/top-dishes', protect, authorize('admin'), getTopDishes);
router.get('/custom', protect, authorize('admin'), getCustomStats);

export default router;