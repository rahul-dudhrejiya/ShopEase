// WHAT: Handles product reviews and ratings
// WHY: Reviews build trust — 95% of customers 
//      read reviews before buying
// HOW: Add review → Update product average rating

import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';


// @desc    Add a review
// @route   POST /api/reviews/:productId
// @access  Private (must be logged in)
export const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const { productId } = req.params;
        const userId = req.user._id;

        // STEP 1: Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // STEP 2: Check if user already reviewed this product
        // WHY? Compound unique index prevents duplicate
        // but better to give friendly message
        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product. Edit your existing review.',
            });
        }

        // STEP 3: Check if user actually bought this product
        // WHY? Prevents fake reviews from people who never bought
        // This is called "Verified Purchase" like Amazon does
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            orderStatus: 'Delivered',
            // WHY Delivered? Must have received product to review
        });

        // We allow reviews even without purchase for now
        // In production you might want to enforce this
        // if (!hasPurchased) {
        //   return res.status(403).json({ 
        //     message: 'You can only review products you have purchased' 
        //   });
        // }

        // STEP 4: Create the review
        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment,
        });

        // STEP 5: Recalculate product average rating
        // WHY? Product.ratings should always reflect
        // current average of all reviews
        await updateProductRating(productId);

        // STEP 6: Populate user info for response
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



// HELPER: Update Product Rating
// WHY separate function? Used in add, edit, delete
// DRY principle — write once, use everywhere
const updateProductRating = async (productId) => {
    // Get all reviews for this product
    const reviews = await Review.find({ product: productId })

    if (reviews.length === 0) {
        // No reviews → reset to 0
        await Product.findByIdAndUpdate(productId, {
            ratings: 0,
            numReviews: 0,
        });
        return;
    }

    // Calculate average rating
    // reduce() adds up all ratings → divide by count
    const avgRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

    await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(avgRating * 10) / 10,
        // WHY Math.round * 10 / 10? Rounds to 1 decimal
        // 4.166... → 4.2
        numReviews: reviews.length,
    });
};



// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
        })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        // WHY sort -1? Newest reviews first

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });

    } catch (error) {
        next(error);
    }
};



// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (own review only)
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

        // Security: Only review owner can update
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review',
            });
        }

        review.rating = Number(rating) || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Recalculate product rating after update
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


// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (own review or admin)
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

        // Recalculate rating after deletion
        await updateProductRating(productId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });

    } catch (error) {
        next (error);
    }
};