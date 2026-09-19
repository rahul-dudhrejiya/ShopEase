import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * @desc    Get dashboard statistics with high-performance MongoDB aggregation
 * @route   GET /api/admin/stats
 * @access  Admin only
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            orderStats,
            monthlySales,
            lowStockProducts,
        ] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([
                {
                    $facet: {
                        revenueStats: [
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: '$finalPrice' },
                                },
                            },
                        ],
                        statusStats: [
                            {
                                $group: {
                                    _id: '$orderStatus',
                                    count: { $sum: 1 },
                                },
                            },
                        ],
                    },
                },
            ]),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        revenue: { $sum: '$finalPrice' },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
            ]),
            Product.find({ stock: { $lt: 10 } })
                .select('name stock images')
                .lean(),
        ]);

        const totalRevenue = orderStats[0]?.revenueStats[0]?.total || 0;
        const statusMap = (orderStats[0]?.statusStats || []).reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        const ordersByStatus = {
            Processing: statusMap['Processing'] || 0,
            Shipped: statusMap['Shipped'] || 0,
            Delivered: statusMap['Delivered'] || 0,
            Cancelled: statusMap['Cancelled'] || 0,
        };

        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const salesChartData = monthlySales.map((item) => ({
            month: monthNames[item._id.month - 1],
            revenue: item.revenue,
            orders: item.orders,
        }));

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

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/admin/users
 * @access  Admin only
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).lean();

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle user active status (Ban/Unban)
 * @route   PUT /api/admin/users/:id/toggle
 * @access  Admin only
 */
export const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot ban yourself',
            });
        }

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

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin only
 */
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