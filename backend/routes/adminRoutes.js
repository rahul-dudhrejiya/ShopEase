import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    toggleUserStatus,
    deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ALL admin routes need protect + isAdmin
router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.put('/users/:id/toggle', protect, isAdmin, toggleUserStatus);
router.delete('/users/:id', protect, isAdmin, deleteUser);

export default router;