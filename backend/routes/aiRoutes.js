import express from 'express';
import {
    aiProductSearch,
    generateProductDescription,
    getRecommendations,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/search', aiProductSearch);
router.post('/generate-description', protect, isAdmin, generateProductDescription);
router.get('/recommendations/:productId', getRecommendations);

export default router;