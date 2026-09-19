import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect private routes via JWT verification
 */
export const protect = async (req, res, next) => {
    let token;

    // Check cookie first, fallback to Authorization header
    token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, please login first',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token verification failed',
        });
    }
};