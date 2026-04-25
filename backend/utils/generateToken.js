// WHAT: Creates a JWT token and sends it as an HTTP-only cookie
// WHY: Centralized function — used in register AND login
//      Don't repeat the same cookie logic in two places (DRY principle)
// HOW: jwt.sign() creates token, res.cookie() sends it to browser

import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    // WHAT: jwt.sign() creates a signed token
    // WHY signed? Server can verify it wasn't tampered with
    // Arguments:
    //   1. payload  → data to store inside token (just userId — keep it minimal)
    //   2. secret   → private key to sign with (only our server knows this)
    //   3. options  → expiresIn: token auto-expires after 7 days
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );

    // WHAT: Send token as HTTP-only cookie
    // WHY cookie? Auto-sent with every request, safe from XSS
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        // WHY 'none' in production?
        // Vercel (frontend) and Render (backend) are different domains
        // Cross-domain cookies REQUIRE sameSite: 'none' + secure: true
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export default generateToken;