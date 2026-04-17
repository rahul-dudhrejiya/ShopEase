// WHAT: Creates Razorpay order and verifies payment
// WHY: We need secure payment processing
// HOW: 
//   1. Backend creates order with Razorpay
//   2. Frontend shows payment popup
//   3. User pays
//   4. Backend VERIFIES the payment signature
//      (prevents fake payment confirmations)

import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';
import crypto from 'crypto';
// WHY crypto? Built-in Node.js module
// Used to verify Razorpay payment signature

// Initialize Razorpay
// WHY here? Create instance once, reuse everywhere


// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
    try {
        // Initialize Razorpay
        // WHY here? Create instance once, reuse everywhere
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });


        const { amount } = req.body;
        // amount comes from frontend cart total

        const options = {
            amount: amount * 100,
            // WHY * 100? Razorpay uses PAISE not RUPEES
            // ₹100 = 10000 paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            // WHY receipt? Unique identifier for this order
            // Date.now() gives current timestamp in ms
        };

        // Create order with Razorpay servers
        const order = await razorpay.orders.create(options);
        // This calls Razorpay's API
        // Returns: { id, amount, currency, receipt }
        // The id is used by frontend to open payment popup

        res.status(200).json({
            success: true,
            order,
            // Frontend needs order.id to open payment popup
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // WHAT: Verify that payment actually happened
        // WHY: Without this, anyone could send fake 
        //      payment success to our server!
        // HOW: Razorpay uses HMAC-SHA256 signature
        //
        // Razorpay creates signature like this:
        // signature = HMAC_SHA256(
        //   order_id + "|" + payment_id,
        //   secret_key
        // )
        // We recreate the same signature
        // If they match → payment is genuine ✅
        // If they don't match → payment is fake ❌

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        // createHmac = create hash-based message auth code
        // 'sha256' = algorithm type
        // update() = data to hash
        // digest('hex') = output as hex string

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed! Invalid signature.',
            });
        }

        // Payment is genuine!
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