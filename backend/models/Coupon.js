import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please enter coupon code'],
            unique: true,
            uppercase: true,
            trim: true,
        },

        discountType: {
            type: String,
            enum: ['flat', 'percentage'],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: [0, 'Discount cannot be negative'],
        },

        minOrderAmount: {
            type: Number,
            default: 0,
        },

        maxUses: {
            type: Number,
            default: 100,
        },

        usedCount: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;