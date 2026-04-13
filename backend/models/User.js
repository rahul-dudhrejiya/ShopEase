import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,    // WHAT: Must be text
            required: [true, 'Please enter your name'],   // WHY: Can't create account without name
            trim: true,   // WHY: Removes accidental spaces "  John  " → "John"
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },

        email: {
            type: String,
            required: [true, 'Please entere your email'],
            unique: true,   // WHY: No two users can have same email — it's their identity
            lowercase: true,   // WHY: "John@Gmail.com" and "john@gmail.com" treated as same
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',      // WHY: Regex validates email format
            ],
        },

        password: {
            type: String,
            required: [true, 'Please enter your password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
            // WHY select:false? When we fetch a user, password is EXCLUDED by default
            // This prevents accidentally sending password to frontend
            // To get password, you must explicitly write: User.findOne().select('+password')
        },

        role: {
            type: String,
            enum: ['customer', 'admin'],  // WHY enum? Only these two values allowed — prevents someone setting role: "superuser"
            default: 'customer',  // WHY: Every new signup is a customer, not admin
        },

        avatar: {
            public_id: {
                type: String,
                default: '',  // Cloudinary public ID for deleting old image
            },
            url: {
                type: String,
                default: 'https://res.cloudinary.com/your-cloud/image/upload/v1/default-avatar.png',
            },
        },
        // WHY store public_id? When user updates avatar, we delete old one from Cloudinary
        // Without public_id, we can't delete the old image — wasting storage

        phone: {
            type: String,
            default: '',
        },

        address: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            pincode: { type: String, default: '' },
            country: { type: String, default: 'India' },
        },
        // WHY nested object? Address is a GROUP of related fields
        // Storing as nested object keeps data organized

        isActive: {
            type: Boolean,
            default: true,
            // WHY: Soft delete — instead of deleting a user (losing order history),
            // we just mark them inactive. Admin can ban users this way.
        },

        resetPasswordToken: String,
        resetPasswordExpire: Date,
        // WHY: When user clicks "Forgot Password", we generate a temporary token
        // Store it here with expiry time. If they click the link within time, allow reset.
    },
    {
        timestamps: true,
        // WHY: Auto-adds createdAt and updatedAt fields
        // createdAt → when did this user register?
        // updatedAt → when did they last update profile?
    }
);

// MONGOOSE MIDDLEWARE (Hooks)
// WHAT: Code that runs automatically BEFORE or AFTER certain operations
// This is called a "pre hook" — runs BEFORE saving to database

userSchema.pre('save', async function (next) {
    // WHAT: Before saving user, hash their password
    // WHY: NEVER store plain text passwords
    //      If DB is hacked, attacker gets "hashed" strings, not real passwords
    //      bcrypt hash is ONE-WAY — you can't reverse it back to original

    // this.isModified('password') → only hash if password was actually changed
    // WHY this check? If user updates their name/email, we don't want to re-hash
    // the already-hashed password (that would break login!)
    if (!this.isModified('password')) {
        return next();
    }

    // Salt rounds = 12 means bcrypt runs the hashing algorithm 2^12 = 4096 times
    // WHY 12? Balance between security and performance
    // Higher = more secure but slower. 12 is industry standard.
    this.password = await bcrypt.hash(this.password, 12);
    next(); // WHY next()? Tell Mongoose "I'm done, proceed with saving
});

// INSTANCE METHODS
// WHAT: Custom functions available on every User document
// Like: const user = await User.findById(id); user.comparePassword('abc123')

userSchema.methods.comparePassword = async function (enteredPassword) {
    // WHAT: Compare entered password with hashed password in DB
    // WHY: During login, user types password → we hash it → compare with stored hash
    // HOW: bcrypt.compare() does this securely
    // WHY not do this in controller? Keeping it in model = cleaner, reusable code
    return await bcrypt.compare(enteredPassword, this.password);
}

// Create the Model from Schema
// WHAT: 'User' becomes the MongoDB collection name (stored as 'users' — lowercase plural)
const User = mongoose.model('User', userSchema)

export default User;