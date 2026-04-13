// Products need strict structure — price must be number, images must be array, etc.

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter product name'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },

        description: {
            type: String,
            required: [true, 'Please enter product description'],
        },

        price: {
            type: Number,
            required: [true, 'Please enter product price'],
            min: [0, 'Price cannot be negative'],
            // WHY min:0? Prevents admin from accidentally entering -500
        },

        discountPrice: {
            type: Number,
            default: 0,
            // WHY separate discountPrice? 
            // price = original (₹1000), discountPrice = selling price (₹799)
            // We show both so customer sees the "savings"
        },

        category: {
            type: String,
            required: [true, 'Please select product category'],
            enum: [
                'Electronics',
                'Clothing',
                'Footwear',
                'Books',
                'Home & Kitchen',
                'Sports',
                'Beauty',
                'Toys',
                'Grocery',
                'Other',
            ],
            // WHY enum? Prevents typos like "Electronicss" or "clothng"
            // Ensures consistent categories for filtering
        },

        brand: {
            type: String,
            default: 'Generic',
        },

        stock: {
            type: Number,
            required: [true, 'Please enter product stock'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },

        images: [
            {
                public_id: {
                    type: String,
                    required: true, // WHY: Need this to delete from Cloudinary
                },
                url: {
                    type: String,
                    required: true,
                },
            }
        ],
        // WHY array? One product can have multiple images (front, back, side views)

        ratings: {
            type: Number,
            default: 0,
            // WHY store here? Instead of calculating average rating every time from
            // Review collection (slow), we store pre-calculated average here (fast)
        },

        numReviews: {
            type: Number,
            default: 0,
            // WHY: Shows "4.2 ★ (128 reviews)" — need count for this
        },

        isFeatured: {
            type: Boolean,
            default: false,
            // WHY: Admin can mark products as "Featured" to show on homepage
        },

        seller: {
            type: String,
            default: 'ShopEase Store',
        },
    },
    {
        timestamps: true
    },
);

// INDEX for faster search
// WHAT: Database index is like a book's index — helps find things faster
// WHY: Without index, MongoDB reads EVERY document to find matches (slow)
//      With index, it jumps directly to matching documents (fast)
// When users search "iPhone", MongoDB uses this index to find products instantly

productSchema.index({ name: 'text', description: 'text' })
// WHY 'text' index? Enables full-text search across name and description fields

const Product = mongoose.model('Product', productSchema)

export default Product;