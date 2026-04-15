// WHAT: Handles all authentication logic
// WHY: Register, Login, Logout, Get Profile, Update Profile

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (anyone can register)
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // WHY destructure? Clean way to extract only what we need from request
        // STEP 1: Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
            // WHY check manually? We could rely on MongoDB unique constraint
            // But that gives a cryptic error — this gives a friendly message
        }

        // STEP 2: Create new user
        // WHY not hash password here? Our pre-save hook does it automatically!
        const user = await User.create({
            name,
            email,
            password,  // pre-save hook hashes this before saving
        });

        // STEP 3: Generate JWT and set cookie
        const token = generateToken(res, user._id);
        // WHY send token immediately after register?
        // User should be logged in automatically after registering
        // No need to register then login separately

        // STEP 4: Send response
        res.status(201).json({
            // WHY 201? HTTP 201 = Created (new resource was created)
            // 200 = OK (existing resource returned)
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
            // WHY not send entire user object?
            // Password is excluded (select:false) but still — send only what frontend needs
        });

    } catch (error) {
        next(error);
        // WHY next(error)? Passes error to errorMiddleware
        // Consistent error handling instead of res.status(500) everywhere
    }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // STEP 1: Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // STEP 2: Find user AND include password
        // WHY .select('+password')? Remember password has select:false
        // We NEED the password here to compare it
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                // WHY not say "email not found"?
                // Security best practice — don't reveal which field is wrong
                // Attacker could use it to enumerate valid emails
            });
        }

        // STEP 3: Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Contact support.',
            });
        }

        // STEP 4: Compare passwords
        const isPasswordMatch = await user.comparePassword(password);
        // WHY use the instance method we built?
        // Cleaner, reusable — comparePassword lives on the model

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                // Same vague message — don't reveal which field is wrong
            });
        }

        // STEP 5: Generate token and send response
        const token = generateToken(res, user._id);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });

    } catch (error) {
        next(error);
    }
};



// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private (must be logged in)
export const logout = (req, res) => {
    // WHAT: Clear the JWT cookie
    // WHY: Logout = remove the token so requests are no longer authenticated
    // HOW: Set same cookie name with empty value and immediate expiry

    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        // WHY new Date(0)? Sets expiry to Jan 1, 1970 = already expired
        // Browser immediately deletes expired cookies
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};


// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
    try {
        // WHY req.user? protect middleware already fetched user and attached it
        // No need to query DB again!
        const user = await User.findById(req.user._id)

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;

        // WHY findByIdAndUpdate instead of user.save()?
        // We're only updating specific fields — not the whole document
        // new:true returns the UPDATED document, not the old one
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, address },
            { new: true, runValidators: true }
            // WHY runValidators:true? Run schema validation on update too
            // Without this, validation rules are skipped on updates
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Must select password since select:false
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password first
        const isMatch = await user.comparePassword(cuurrentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Set new password — pre-save hook will hash it automatically
        user.password = newPassword;
        await user.save();
        // WHY user.save() not findByIdAndUpdate?
        // We WANT the pre-save hook to run and hash the new password
        // findByIdAndUpdate BYPASSES pre-save hooks!

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};