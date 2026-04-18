// WHAT: Handles user's product wishlist
// WHY: Users want to save products for later
//      Wishlists increase return visits by 30%
// HOW: One wishlist per user, toggle add/remove

import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Check product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Find or create wishlist
        let wishlist = await Wishlist.findOne({ user: userId })
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: [],
            });
        }

        // Check if product already in wishlist
        const isWishlisted = wishlist.products.includes(productId);
        // WHY includes()? Simple check — is this ID in array?

        if (isWishlisted) {
            // REMOVE from wishlist (toggle off)
            wishlist.products = wishlist.products.filter(
                (id) => id.toString() !== productId
            );
            await wishlist.save();
            return res.status(200).json({
                success: true,
                message: 'Removed from wishlist',
                isWishlisted: false,
                wishlist,
            });
        } else {
            // ADD to wishlist (toggle on)
            wishlist.products.push(productId);
            await wishlist.save();

            return res.status(200).json({
                success: true,
                message: 'Added to wishlist ❤️',
                isWishlisted: true,
                wishlist,
            });
        }

    } catch (error) {
        next(error);
    }
};


// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        }).populate(
            'products',
            'name price discountPrice images ratings numReviews stock'
        );
        // WHY populate with specific fields?
        // We only need display info — not ALL product fields
        // Keeps response size small = faster API

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                wishlist: { products: [] },
            });
        }

        res.status(200).json({
            success: true,
            count: wishlist.products.length,
            wishlist,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
        }

        wishlist.products = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared',
        });

    } catch (error) {
        next(error)
    }
};