import Coupon from '../models/Coupon.js';

/**
 * @desc    Create coupon (Admin)
 * @route   POST /api/coupons
 * @access  Admin only
 */
export const createCoupon = async (req, res, next) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minOrderAmount,
            maxUses,
            expiresAt,
        } = req.body;

        const existingCoupon = await Coupon.findOne({
            code: code.toUpperCase(),
        });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists',
            });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxUses: maxUses || 100,
            expiresAt,
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Validate/Apply coupon
 * @route   POST /api/coupons/apply
 * @access  Private
 */
export const applyCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code',
            });
        }

        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This coupon is no longer active',
            });
        }

        if (new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has expired',
            });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has reached its usage limit',
            });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`,
            });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
        }

        discountAmount = Math.min(discountAmount, orderAmount);
        const finalAmount = orderAmount - discountAmount;

        res.status(200).json({
            success: true,
            message: `Coupon applied! You save ₹${discountAmount}`,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount,
            finalAmount,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Use coupon (increment usedCount)
 * @route   POST /api/coupons/use
 * @access  Private
 */
export const useCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;

        await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Admin only
 */
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

        res.status(200).json({
            success: true,
            count: coupons.length,
            coupons,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Admin only
 */
export const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};