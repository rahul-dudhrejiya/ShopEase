import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

/**
 * @desc    Create Razorpay Order with server-side price validation
 * @route   POST /api/payment/create-order
 * @access  Private
 */
export const createPaymentOrder = async (req, res, next) => {
    try {
        const { couponCode } = req.body;

        // Fetch user's cart from database to prevent client-side price tampering
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty',
            });
        }

        // Calculate verified cart subtotal from database prices
        const subtotal = cart.items.reduce((total, item) => {
            const productPrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
            return total + (productPrice * item.quantity);
        }, 0);

        // Calculate shipping (free shipping over ₹999)
        const shippingPrice = subtotal > 999 ? 0 : 99;

        // Validate and apply coupon if provided
        let discount = 0;
        let verifiedCoupon = null;

        if (couponCode) {
            verifiedCoupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
                isActive: true,
                expiresAt: { $gt: new Date() },
            });

            if (verifiedCoupon && verifiedCoupon.usedCount < verifiedCoupon.maxUses && subtotal >= verifiedCoupon.minOrderAmount) {
                if (verifiedCoupon.discountType === 'flat') {
                    discount = verifiedCoupon.discountValue;
                } else if (verifiedCoupon.discountType === 'percentage') {
                    discount = (subtotal * verifiedCoupon.discountValue) / 100;
                }
                discount = Math.min(discount, subtotal);
            }
        }

        const finalPrice = Math.max(0, subtotal + shippingPrice - discount);

        const razorpay = getRazorpayInstance();
        const options = {
            amount: Math.round(finalPrice * 100), // Razorpay accepts amounts in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`,
            notes: {
                userId: req.user._id.toString(),
                couponCode: verifiedCoupon ? verifiedCoupon.code : '',
                finalPrice: finalPrice.toString(),
            },
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            pricing: {
                subtotal,
                shippingPrice,
                discount,
                finalPrice,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/payment/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification parameters',
            });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed! Invalid signature.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            paymentInfo: {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Handle Razorpay Asynchronous Webhooks
 * @route   POST /api/payment/webhook
 * @access  Public (Signature Verified)
 */
export const handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (expectedSignature !== signature) {
                return res.status(400).json({ status: 'invalid_signature' });
            }
        }

        const event = req.body.event;

        if (event === 'payment.captured') {
            const payment = req.body.payload.payment.entity;
            const razorpayOrderId = payment.order_id;

            // If an order with this payment already exists, update status to paid
            const order = await Order.findOne({ 'paymentInfo.razorpay_order_id': razorpayOrderId });
            if (order && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.paymentInfo.razorpay_payment_id = payment.id;
                await order.save();
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};