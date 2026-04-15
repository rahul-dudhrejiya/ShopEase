// WHAT: Checks if logged-in user is an admin
// WHY: Some routes (add product, manage orders) must be admin-only
// HOW: Always used AFTER protect middleware (user must be logged in first)

// Usage in routes:
// router.post('/products', protect, isAdmin, addProduct)
//                           ↑         ↑
//                     login check   admin check

export const isAdmin = (req, res, next) => {
    // req.user exists because protect middleware ran first
    if (req.user && req.user.role === 'admin') {
        next(); // ✅ Is admin, proceed
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.',
            // WHY 403 not 401?
            // 401 = Not authenticated (not logged in)
            // 403 = Not authorized (logged in but no permission)
            // Like: 401 = No ID card | 403 = Has ID card but wrong department
        });
    }
};