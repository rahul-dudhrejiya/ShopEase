import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },

        rating: {
            type: Number,
            required: [true, 'Please give a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },

        comment: {
            type: String,
            required: [true, 'Please write a review comment'],
            maxlength: [500, 'Review cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews from the same user on a product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;