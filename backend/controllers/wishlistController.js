import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

/**
 * @desc    Toggle product in wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
export const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: [],
            });
        }

        const isWishlisted = wishlist.products.includes(productId);

        if (isWishlisted) {
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
            wishlist.products.push(productId);
            await wishlist.save();

            return res.status(200).json({
                success: true,
                message: 'Added to wishlist',
                isWishlisted: true,
                wishlist,
            });
        }

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        }).populate(
            'products',
            'name price discountPrice images ratings numReviews stock'
        );

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

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
export const clearWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

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
        next(error);
    }
};