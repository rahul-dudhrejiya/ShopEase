// WHAT: Maps URLs to controller functions
// WHY: Organized URL structure for products

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


// PUBLIC ROUTES
// (anyone can view products)
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);


// ADMIN ONLY ROUTES
// protect → isAdmin → controller
// Both middlewares run before controller
router.get('/admin/all', protect, isAdmin, getAdminProducts);

router.post(
    '/',
    protect,
    isAdmin,
    upload.array('images', 5), // Max 5 images per product
    addProduct
);

router.put(
    '/:id',
    protect,
    isAdmin,
    upload.array('images', 5),
    updateProduct
);

router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
