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
        },

        discountPrice: {
            type: Number,
            default: 0,
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
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            }
        ],

        ratings: {
            type: Number,
            default: 0,
        },

        numReviews: {
            type: Number,
            default: 0,
        },

        isFeatured: {
            type: Boolean,
            default: false,
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

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;