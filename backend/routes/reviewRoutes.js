import express from 'express';
import {
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:productId', getProductReviews);        // Public
router.post('/:productId', protect, addReview);      // Private
router.put('/:reviewId', protect, updateReview);     // Private
router.delete('/:reviewId', protect, deleteReview);  // Private

export default router;
