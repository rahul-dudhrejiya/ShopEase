// WHAT: Handles all cart operations
// WHY: Cart is the core of e-commerce —
//      every purchase starts here
// HOW: One cart per user, updated on every action

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';


// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;
        // req.user comes from protect middleware
        // WHY not from req.body? Security — 
        // never trust userId from frontend

        // STEP 1: Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // STEP 2: Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`,
            });
        }

        // STEP 3: Find existing cart or create new one
        let cart = await Cart.findOne({ user: userId })
        // WHY findOne? Each user has only ONE cart
        // unique:true in Cart model ensures this

        if (!cart) {
            // First time adding to cart — create new cart
            cart = await Cart.create({
                user: userId,
                items: [],
                totalPrice: 0,
            });
        }

        // STEP 4: Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
            // WHY .toString()? MongoDB ObjectId needs 
            // conversion to string for comparison
        );

        if (existingItemIndex > -1) {
            // Product already in cart → UPDATE quantity
            cart.items[existingItemIndex].quantity += quantity;
            // WHY +=? Add to existing quantity
            // If cart has 2, and user adds 3 → total 5

        } else {
            // Product not in cart → ADD new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.discountPrice > 0
                    ? product.discountPrice
                    : product.price,
                // WHY store price here? Lock price at time
                // of adding to cart — price might change later
            });
        }

        // STEP 5: Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + item.price * item.quantity;
            // reduce() loops through all items
            // multiplies price × quantity for each
            // adds them all together
        }, 0);  // 0 = starting value

        await cart.save();

        await cart.populate('items.product',
            'name images price discountPrice stock'
        );
        // WHY populate? Frontend needs product name
        // and image to display cart items properly

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            cart,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id
        }).populate(
            'items.product',
            'name images price discountPrice stock'
        );

        if (!cart) {
            // No cart yet — return empty cart
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    totalPrice: 0,
                },
            });
        }

        res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Update item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        // Validate quantity
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1',
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        // WHY = not +=? This is SET not ADD
        // User is explicitly setting new quantity

        // Recalculate total
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();
        await cart.populate(
            'items.product',
            'name images price discountPrice stock'
        );

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        // Remove item using filter
        // WHY filter? Creates new array WITHOUT 
        // the item we want to remove
        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        // Recalculate total
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        // Clear all items
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
        // WHY not delete cart? Keep the cart document
        // Just empty it — user will add items again

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (error) {
        next(error);
    }
};