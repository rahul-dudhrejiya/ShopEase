import express from 'express';
import {
    toggleWishlist,
    getWishlist,
    clearWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ALL wishlist routes are private
router.get('/', protect, getWishlist);
router.post('/:productId', protect, toggleWishlist);
router.delete('/', protect, clearWishlist);

export default router;