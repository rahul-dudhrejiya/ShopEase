// WHAT: Catches ALL errors thrown anywhere in the app
// WHY: Without this, unhandled errors crash the server or send ugly responses
// HOW: Express recognizes a function with 4 params as error middleware

// WHY centralized error handling?
// Instead of try-catch in every controller, errors "bubble up" to here
// One place to format all error responses consistently

export const errorHandler = (err, req, res, next) => {
    // Sometimes error comes with a status code, sometimes not
    // Default to 500 (Internal Server Error) if no status set
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // SPECIFIC ERROR TYPES

    // Mongoose: Invalid ObjectId (e.g., /api/products/not-valid-id)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found (invalid ID format)';
        // WHY: MongoDB IDs are 24-char hex strings
        //  If someone passes "abc" as an ID, Mongoose throws CastError
    }

    // Mongoose: Duplicate unique field (e.g., same email twice)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.KeyValue)[0];
        message = `${field} already exists. Please use a different ${field}`;
        // WHY: MongoDB error code 11000 = duplicate key violation
        // e.g., trying to register with email that already exists
    }

    // JWT: Token has invalid
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // JWT: Token has expired
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message: Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        // WHY join? Multiple fields can fail validation at once
        // Returns: "Name is required, Email is invalid"
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Show stack trace only in development (helps debugging)
        // NEVER show stack trace in production (reveals code structure to attackers)
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
};