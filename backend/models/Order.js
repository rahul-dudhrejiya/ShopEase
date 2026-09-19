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
                },
                image: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
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

        paymentInfo: {
            razorpay_order_id: { type: String },
            razorpay_payment_id: { type: String },
            razorpay_signature: { type: String },
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },

        orderStatus: {
            type: String,
            enum: [
                'Processing',
                'Shipped',
                'OutForDelivery',
                'Delivered',
                'Cancelled',
            ],
            default: 'Processing',
        },

        totalPrice: {
            type: Number,
            required: true,
        },

        discount: {
            type: Number,
            default: 0,
        },

        shippingPrice: {
            type: Number,
            default: 0,
        },

        finalPrice: {
            type: Number,
            required: true,
        },

        couponUsed: {
            type: String,
            default: null,
        },

        deliveredAt: {
            type: Date,
        },
    },
    {
         timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;