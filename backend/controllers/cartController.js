import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`,
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
                totalPrice: 0,
            });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product?.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.discountPrice > 0 ? product.discountPrice : product.price,
            });
        }

        cart.items = cart.items.filter(item => item.product !== null);

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name images price discountPrice stock brand',
        });

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            cart,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            select: 'name images price discountPrice stock brand',
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    totalPrice: 0,
                },
            });
        }

        // Clean out deleted products if any
        const validItems = cart.items.filter(item => item.product !== null);

        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            cart.totalPrice = validItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
            await cart.save();
        }

        res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1',
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product?.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        cart.items[itemIndex].quantity = Number(quantity);
        cart.items = cart.items.filter(item => item.product !== null);

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name images price discountPrice stock brand',
        });

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = cart.items.filter(
            (item) => item.product && item.product.toString() !== productId
        );

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name images price discountPrice stock brand',
        });

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (error) {
        next(error);
    }
};