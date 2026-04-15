// WHAT: Verifies JWT token before allowing access to protected routes
// WHY: Without this, ANYONE can access /api/orders or /api/cart
// HOW: Read token from cookie → verify with secret → attach user to req

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // WHAT: Read token from cookie
    // WHY cookies? We stored JWT there in generateToken
    token = req.cookies.token;

    if (!token && req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, please login first',
        });
        // WHY 401? HTTP status 401 = Unauthorized
        // Like a bouncer saying "No ID, no entry"
    }

    try {
        // WHAT: jwt.verify() checks two things:
        //   1. Was this token signed with OUR secret? (not forged)
        //   2. Has it expired?
        // WHY try-catch? If token is invalid/expired, jwt.verify() THROWS an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded = { userId: "64abc...", iat: 1234567, exp: 1234999 }
        // iat = issued at (when created), exp = expiry timestamp

        // WHAT: Fetch the actual user from DB using ID from token
        // WHY fetch from DB? Token only has userId — we need full user object
        // WHY .select('-password')? Never attach password to req.user
        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                // WHY this check? User might have been deleted after token was issued
            });
        }

        next();
        // WHY next()? Token is valid, user is attached to req
        // Pass control to the actual controller function

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',
        });
    }
};