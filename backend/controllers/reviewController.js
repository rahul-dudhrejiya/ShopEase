import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * @desc    Add a review
 * @route   POST /api/reviews/:productId
 * @access  Private
 */
export const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const { productId } = req.params;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product. Please edit your existing review.',
            });
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment,
        });

        await updateProductRating(productId);
        await review.populate('user', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Helper to recalculate and persist average rating on Product
 */
const updateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
            ratings: 0,
            numReviews: 0,
        });
        return;
    }

    const avgRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

    await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(avgRating * 10) / 10,
        numReviews: reviews.length,
    });
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
        })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private
 */
export const updateReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review',
            });
        }

        review.rating = Number(rating) || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        await updateProductRating(review.product);

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(req.params.reviewId);

        await updateProductRating(productId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });

    } catch (error) {
        next(error);
    }
};