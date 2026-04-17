// WHAT: Stores items a user has added to cart but not yet ordered
// WHY: Cart is temporary storage before checkout
// Real analogy: Shopping trolley in a mall — items in it, not yet purchased

import mongoose from 'mongoose';
import Product from './Product.js';

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            // WHY unique:true? Each user has ONLY ONE cart
            // We update the same cart, not create new ones
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    // WHY store price in cart? Product price might change later
                    // We lock the price at the time user added to cart
                    // Like a price tag — once you pick it up, that's your price
                },
            },
        ],

        totalPrice: {
            type: Number,
            default: 0,
            // WHY store total? Avoid recalculating every time cart is loaded
            // We update this whenever cart items change
        },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
