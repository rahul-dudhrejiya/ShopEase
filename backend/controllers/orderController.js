// WHAT: Handles order creation and management
// WHY: Orders are permanent records of purchases
// HOW: Create order → clear cart → update stock

import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';


// @desc    Place new order
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res, next) => {
    try {
        const {
            shippingAddress,
            paymentInfo,
            couponUsed,
        } = req.body;

        // STEP 1: Get user's cart
        const cart = await Cart.findOne({
            user: req.user._id
        }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty. Add items before ordering.',
            });
        }

        // STEP 2: Build order items
        // WHY copy product data? Product might be 
        // deleted later — order must stay accurate
        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            // Storing name at time of purchase
            image: item.product.images[0]?.url || '',
            // Storing image URL at time of purchase
            price: item.price,
            // Storing price at time of purchase
            quantity: item.quantity,
        }));

        // STEP 3: Calculate prices
        const totalPrice = cart.totalPrice;
        const shippingPrice = totalPrice > 999 ? 0 : 99;
        // WHY this logic? Free shipping above ₹999
        // Otherwise ₹99 shipping charge

        const discount = couponUsed ? req.body.discountAmount || 0 : 0;
        const finalPrice = totalPrice + shippingPrice - discount;

        // STEP 4: Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentInfo,
            paymentStatus: paymentInfo ? 'paid' : 'pending',
            totalPrice,
            shippingPrice,
            discount,
            finalPrice,
            couponUsed: couponUsed || null,
        });

        // STEP 5: Update product stock
        // WHY reduce stock? Product was purchased
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } }
                // $inc with negative = decrease stock
                // If stock was 50 and user bought 2 → 48
            );
        }

        // STEP 6: Clear the cart
        // WHY clear? Order placed — cart no longer needed
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully! 🎉',
            order,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });
        // WHY sort -1? Newest orders first
        // User wants to see recent orders at top

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(
            req.params.id
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Security check — user can only see own orders
        // WHY? Without this, user could view anyone's order
        // by guessing order ID
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


// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Only owner can cancel
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        // Can only cancel if Processing
        // WHY? Can't cancel already shipped order
        if (order.orderStatus !== 'Processing') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order in ${order.orderStatus} status`,
            });
        }

        // Update status to Cancelled
        order.orderStatus = 'Cancelled';
        await order.save();

        // Restore product stock
        // WHY restore? Order cancelled → 
        // products back in inventory
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
                // $inc with positive = increase stock
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


// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Admin only
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

        // If delivered → set delivery date
        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid';
            // WHY set paid on delivery? 
            // Cash on delivery orders get paid here
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


// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin
// @access  Admin only
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Calculate total revenue
        const totalRevenue = orders.reduce(
            (total, order) => total + order.finalPrice,
            0
        );

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