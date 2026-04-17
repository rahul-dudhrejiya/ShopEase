import express from 'express';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ALL cart routes are private
// WHY? Cart belongs to logged in user only
// Guest users cannot have a cart

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/clear', protect, clearCart);
router.delete('/:productId', protect, removeFromCart);

// ⚠️ IMPORTANT: /clear must come BEFORE /:productId
// WHY? Express matches routes top to bottom
// If /:productId comes first, "clear" gets 
// treated as a productId — wrong!

export default router;