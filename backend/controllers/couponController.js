// WHAT: Handles coupon creation and validation
// WHY: Coupons increase conversions by 25%
//      "SAVE20" makes customers feel they're getting a deal
// HOW: Admin creates → Customer applies → Backend validates

import Coupon from '../models/Coupon.js';

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Admin only
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

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({
            code: code.toUpperCase()
        });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists',
            });
        }

        const coupon = await Coupon.create({
            code,
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


// @desc    Validate/Apply coupon
// @route   POST /api/coupons/apply
// @access  Private (logged in customers)
export const applyCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;

        // STEP 1: Find coupon
        const coupon = await Coupon.findOne({
            code: code.toUpperCase()
        })

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code',
            });
        }

        // STEP 2: Check if active
        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This coupon is no longer active',
            });
        }

        // STEP 3: Check expiry
        if (new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has expired',
            });
        }

        // STEP 4: Check usage limit
        if (coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has reached its usage limit',
            });
        }

        // STEP 5: Check minimum order amount
        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`,
            });
        }

        // STEP 6: Calculate discount
        let discountAmount = 0;

        if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
            // Flat: ₹100 off regardless of order total
        } else if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            // Percentage: 20% of order total
        }

        // Make sure discount doesn't exceed order amount
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


// @desc    Use coupon (increment usedCount)
// @route   POST /api/coupons/use
// @access  Private
// WHY separate from apply? Apply just validates
// Use actually increments the counter after order placed
export const useCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
      // $inc: 1 → increase usedCount by 1
    );

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Admin only
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Admin only
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