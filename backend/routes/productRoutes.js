import express from 'express';
import {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAdminProducts,
    getFeaturedProducts,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.get('/admin/all', protect, isAdmin, getAdminProducts);
router.post('/', protect, isAdmin, upload.array('images', 5), addProduct);
router.put('/:id', protect, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
