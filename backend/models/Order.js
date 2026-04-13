// WHAT: A permanent record of a completed purchase
// WHY: Unlike Cart (temporary), Orders are permanent — never deleted
// Real analogy: Receipt you get after paying at a store

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                    // WHY store name here? Product might be deleted later
                    // Order must still show what was purchased — historical record
                },
                image: {
                    type: String,
                    required: true, // WHY: Same reason — product image for order history
                },
                price: {
                    type: Number,
                    required: true, // WHY: Lock price at time of purchase
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],

        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: 'India' },
            phone: { type: String, required: true },
        },
        // WHY copy address into order? User might change their address later
        // Order must remember WHERE it was supposed to be delivered

        paymentInfo: {
            razorpay_order_id: { type: String },
            razorpay_payment_id: { type: String },
            razorpay_signature: { type: String },
            // WHY store these? For payment verification and refunds
            // Razorpay needs these IDs to process refunds
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },

        orderStatus: {
            type: String,
            enum: [
                'Processing',   // Order placed, being prepared
                'Shipped',      // Package picked up by courier
                'OutForDelivery', // Delivery agent on the way
                'Delivered',    // Customer received it
                'Cancelled',    // Order was cancelled
            ],
            default: 'Processing',
        },

        totalPrice: {
            type: Number,
            required: true, // Sum of all items × quantities
        },

        discount: {
            type: Number,
            default: 0, // Coupon discount amount
        },

        shippingPrice: {
            type: Number,
            default: 0,
        },

        finalPrice: {
            type: Number,
            required: true,
            // WHY: finalPrice = totalPrice - discount + shippingPrice
            // This is what customer actually paid
        },

        couponUsed: {
            type: String,
            default: null, // Store coupon code used (if any)
        },

        deliveredAt: {
            type: Date,
            // WHY: Track exact delivery date/time for analytics and disputes
        },
    },
    {
         timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;