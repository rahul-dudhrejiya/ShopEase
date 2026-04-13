// WHAT: Discount codes customers can apply at checkout
// WHY: Coupons increase conversions — "SAVE20" gives 20% off
// Real analogy: Physical coupon you clip from a newspaper

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please enter coupon code'],
            unique: true,       // WHY: Two coupons can't have same code
            uppercase: true,    // WHY: "save20" automatically becomes "SAVE20"
            trim: true,
        },

        discountType: {
            type: String,
            enum: ['flat', 'percentage'],
            required: true,
            // flat → ₹100 off
            // percentage → 20% off
        },

        discountValue: {
            type: Number,
            required: true,
            min: [0, 'Discount cannot be negative'],
            // If type=flat → value=100 means ₹100 off
            // If type=percentage → value=20 means 20% off
        },

        minOrderAmount: {
            type: Number,
            default: 0,
            // WHY: Coupon only works if cart total is above this amount
            // "SAVE100 — valid on orders above ₹500"
        },

        maxUses: {
            type: Number,
            default: 100,
            // WHY: Limit how many times a coupon can be used total
            // Prevents unlimited usage costing the business money
        },

        usedCount: {
            type: Number,
            default: 0,
            // WHY: Track how many times it's been used
            // When usedCount >= maxUses → coupon is exhausted
        },

        expiresAt: {
            type: Date,
            required: true,
            // WHY: Every coupon has an expiry — "Valid until 31st Dec 2025"
        },

        isActive: {
            type: Boolean,
            default: true,
            // WHY: Admin can disable a coupon without deleting it
            // Useful for pausing campaigns
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;