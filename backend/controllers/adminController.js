// WHAT: Admin dashboard stats and analytics
// WHY: Admin needs overview of business performance
// HOW: Aggregate data from multiple collections

import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';


// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin only
export const getDashboardStats = async (req, res, next) => {
    try {
        // Run ALL queries simultaneously for speed
        // WHY Promise.all? Instead of waiting one by one
        // All 4 queries run at the SAME TIME = 4x faster
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            orders,
        ] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.find().select('finalPrice createdAt orderStatus'),
        ]);

        // Calculate total revenue
        const totalRevenue = orders.reduce(
            (sum, order) => sum + order.finalPrice, 0
        );

        // Orders by status
        const ordersByStatus = {
            Processing: orders.filter(o => o.orderStatus === 'Processing').length,
            Shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
            Delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
            Cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
        };

        // Monthly sales for chart (last 6 months)
        // WHY 6 months? Common chart range for analytics
        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(
                            new Date().setMonth(new Date().getMonth() - 6)
                        ),
                        // WHY? Filter orders from last 6 months only
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        // Group by year+month combination
                    },
                    revenue: { $sum: '$finalPrice' },
                    // Sum all finalPrice in each month group
                    orders: { $sum: 1 },
                    // Count orders in each month group
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            // WHY sort? Chart needs chronological order
        ]);

        // Format monthly data for Recharts on frontend
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const salesChartData = monthlySales.map((item) => ({
            month: monthNames[item._id.month - 1],
            // -1 because months are 1-indexed but array is 0-indexed
            revenue: item.revenue,
            orders: item.orders,
        }));

        // Low stock products (stock < 10)
        // WHY? Admin needs to restock before items run out
        const lowStockProducts = await Product.find({
            stock: { $lt: 10 },
        }).select('name stock images');

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
            },
            ordersByStatus,
            salesChartData,
            lowStockProducts,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Toggle user active status (Ban/Unban)
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin only
export const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent admin from banning themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot ban yourself',
            });
        }

        // Toggle isActive
        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isActive
                ? 'User activated successfully'
                : 'User banned successfully',
            user,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin only
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};