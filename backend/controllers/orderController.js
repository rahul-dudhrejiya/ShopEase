import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Place new order with transactional concurrency and stock reservation
 * @route   POST /api/orders
 * @access  Private
 */
export const placeOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            shippingAddress,
            paymentInfo,
            couponUsed,
        } = req.body;

        // Fetch user's cart with latest product details
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product')
            .session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Cart is empty. Add items before ordering.',
            });
        }

        // Build order items and calculate verified subtotal
        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (!item.product) continue;
            const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
            subtotal += price * item.quantity;

            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0]?.url || '',
                price,
                quantity: item.quantity,
            });

            // Concurrency-safe atomic stock reservation
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { session, new: true }
            );

            if (!updatedProduct) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${item.product.name}". Please adjust quantity.`,
                });
            }
        }

        // Server-side shipping calculation
        const shippingPrice = subtotal > 999 ? 0 : 99;

        // Server-side coupon verification and discount calculation
        let discount = 0;
        let verifiedCoupon = null;

        if (couponUsed) {
            verifiedCoupon = await Coupon.findOne({
                code: couponUsed.trim().toUpperCase(),
                isActive: true,
                expiresAt: { $gt: new Date() },
            }).session(session);

            if (verifiedCoupon && verifiedCoupon.usedCount < verifiedCoupon.maxUses && subtotal >= verifiedCoupon.minOrderAmount) {
                if (verifiedCoupon.discountType === 'flat') {
                    discount = verifiedCoupon.discountValue;
                } else if (verifiedCoupon.discountType === 'percentage') {
                    discount = (subtotal * verifiedCoupon.discountValue) / 100;
                }
                discount = Math.min(discount, subtotal);

                // Increment coupon usage
                verifiedCoupon.usedCount += 1;
                await verifiedCoupon.save({ session });
            }
        }

        const finalPrice = Math.max(0, subtotal + shippingPrice - discount);

        // Create the order document within the transaction
        const [order] = await Order.create([{
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentInfo,
            paymentStatus: paymentInfo?.razorpay_payment_id ? 'paid' : 'pending',
            totalPrice: subtotal,
            shippingPrice,
            discount,
            finalPrice,
            couponUsed: verifiedCoupon ? verifiedCoupon.code : null,
        }], { session });

        // Clear user's cart
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Asynchronous email dispatch (non-blocking)
        try {
            await sendEmail({
                to: req.user.email,
                subject: `Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2563EB; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">ShopEase</h1>
              <p style="color: #bfdbfe; margin: 5px 0;">Order Confirmed!</p>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Hi ${req.user.name}!</h2>
              <p style="color: #6b7280;">Your order has been placed successfully.</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Order Details</h3>
                <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                <p><strong>Total Amount:</strong> ₹${order.finalPrice.toLocaleString('en-IN')}</p>
                <p><strong>Status:</strong> Processing</p>
              </div>
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #1d4ed8;">
                  Your order will be delivered within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        `,
            });
        } catch {
            console.log('Order email notification failed to send.');
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

/**
 * @desc    Get logged-in user orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order',
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        if (order.orderStatus !== 'Processing') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order in ${order.orderStatus} status`,
            });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        // Restore inventory atomically
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Admin only
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.orderStatus = status;

        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid';
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders/admin
 * @access  Admin only
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const [orders, stats] = await Promise.all([
            Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .lean(),
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$finalPrice' },
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const totalRevenue = stats[0]?.totalRevenue || 0;

        res.status(200).json({
            success: true,
            count: orders.length,
            totalRevenue,
            orders,
        });
    } catch (error) {
        next(error);
    }
};