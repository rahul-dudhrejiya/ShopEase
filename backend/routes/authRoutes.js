// WHAT: Maps URLs to controller functions
// WHY: Keeps server.js clean — all auth URLs defined here
// HOW: Express Router groups related routes together

import express from 'express';
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// PUBLIC ROUTES (no login required)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// PRIVATE ROUTES (must be logged in)
// protect runs FIRST, then the controller
// If protect fails → sends 401, controller never runs
// If protect passes → req.user is set, controller runs
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
