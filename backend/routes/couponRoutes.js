import express from 'express';
import {
    createCoupon,
    applyCoupon,
    useCoupon,
    getAllCoupons,
    deleteCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Customer routes
router.post('/apply', protect, applyCoupon);
router.post('/use', protect, useCoupon);

// Admin routes
router.get('/', protect, isAdmin, getAllCoupons);
router.post('/', protect, isAdmin, createCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

export default router;