import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },

        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',
            ],
        },

        password: {
            type: String,
            required: [true, 'Please enter your password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },

        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },

        avatar: {
            public_id: {
                type: String,
                default: '',
            },
            url: {
                type: String,
                default: 'https://res.cloudinary.com/your-cloud/image/upload/v1/default-avatar.png',
            },
        },

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

        isActive: {
            type: Boolean,
            default: true,
        },

        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Pre-save hook: Hash password before saving to database
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;