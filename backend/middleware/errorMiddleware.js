/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Mongoose: Invalid ObjectId format
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found (invalid ID format)';
    }

    // Mongoose: Duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        message = `${field} already exists. Please use a different ${field}.`;
    }

    // JWT: Invalid token
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token. Please log in again.';
    }

    // JWT: Expired token
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired. Please log in again.';
    }

    // Mongoose: Schema validation error
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
};