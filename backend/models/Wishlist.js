// WHAT: Products a user saved for later (not in cart, not ordered)
// WHY: Customers want to bookmark items and buy them later
// Real analogy: Pinterest board — save things you like

import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // WHY: One wishlist per user
        },

        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                // WHY just ref and not full object? 
                // Products change (price, stock) — we want LIVE data
                // Cart locks price, but Wishlist shows current price
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist;