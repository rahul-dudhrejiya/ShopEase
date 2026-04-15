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
        // WHY httpOnly:true? JavaScript CANNOT read this cookie
        // Even if attacker injects JS code, they can't steal the token

        secure: process.env.NODE_ENV === 'production',
        // WHY secure? In production, cookie only sent over HTTPS
        // In development, we use HTTP so we set it false

        sameSite: 'strict',
        // WHY sameSite:'strict'? Prevents CSRF attacks
        // Cookie only sent if request comes from same site
        // CSRF = Cross Site Request Forgery — attacker tricks browser into making requests

        maxAge: 7 * 24 * 60 * 60 * 1000,
        // WHY maxAge? Cookie expires after 7 days (in milliseconds)
        // 7 days × 24 hours × 60 minutes × 60 seconds × 1000 milliseconds
    });

    return token;
};

export default generateToken;