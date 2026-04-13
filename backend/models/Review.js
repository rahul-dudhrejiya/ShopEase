// WHAT: Every product review/rating by a customer
// WHY: Separate collection because one product can have thousands of reviews
//      Storing inside Product document would make it too large (MongoDB 16MB doc limit)

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // WHAT: Stores the User's _id (24-character MongoDB ID)
            // WHY ref:'User'? Tells Mongoose "this ID belongs to User collection"
            // HOW it's used: review.populate('user') fetches full user data
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

// COMPOUND UNIQUE INDEX
// WHAT: Combination of user + product must be unique
// WHY: One user can only review one product ONCE
//      Without this, same user could submit 100 fake 5-star reviews
// HOW: MongoDB rejects second review from same user for same product

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;