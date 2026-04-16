// WHAT: All product-related business logic
// WHY: Separate from routes for clean code
// HOW: Each function handles one specific operation

import Product from '../models/Product.js'
import { cloudinary } from '../config/cloudinary.js'
import APIFeatures from '../utils/apiFeatures.js'

// @desc    Add new product
// @route   POST /api/products
// @access  Admin only
export const addProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            category,
            brand,
            stock,
        } = req.body;

        // Handle image uploads
        // req.files comes from multer middleware
        // WHY array? Product can have multiple images
        const imagePromises = req.files.map(async (file) => {
            // WHAT: Convert buffer to base64 string
            // WHY: Cloudinary accepts base64 encoded images
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            // WHAT: Upload to Cloudinary
            // WHY folder:'shopease/products'? Organizes images in Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'shopease/products',
                resource_type: 'auto',
            });

            // Return object with public_id and url
            // WHY public_id? Need it to DELETE image later
            return {
                public_id: result.public_id,
                url: result.secure_url,
            };
        });

        // Wait for ALL images to upload
        // WHY Promise.all? Upload all images simultaneously (faster)
        const images = await Promise.all(imagePromises);

        const product = await Product.create({
            name,
            description,
            price,
            discountPrice,
            category,
            brand,
            stock,
            images,
        });

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res, next) => {
    try {
        const resultsPerPage = 8;
        // WHY 8? Good number for grid layout (2x4 or 4x2)

        // Count total matching products (for pagination UI)
        // WHY count separately? We need total to calculate
        // how many pages to show
        const totalProducts = await Product.countDocuments();

        // Build and execute query with all features
        const apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter()
            .sort()
            .paginate(resultsPerPage);

        const products = await apiFeatures.query;

        res.status(200).json({
            success: true,
            totalProducts,
            resultsPerPage,
            products,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        // req.params.id = the :id part in the URL
        // /api/products/64abc123 → req.params.id = "64abc123"

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin only
export const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Handle new image uploads if any
        if (req.files && req.files.length > 0) {
            // STEP 1: Delete OLD images from Cloudinary
            // WHY? Don't waste Cloudinary storage
            for (const image of product.images) {
                await cloudinary.uploader.destroy(image.public_id);
                // WHY destroy()? Permanently delete from Cloudinary
            }

            // STEP 2: Upload NEW images
            const imagePromises = req.files.map(async (file) => {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'shopease/products',
                });
                return {
                    public_id: result.public_id,
                    url: result.secure_url,
                };
            });

            req.body.images = await Promise.all(imagePromises);
        }

        // Update product with new data
        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,  // Return updated document
                runValidators: true, // Run schema validation
            }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin only
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete ALL images from Cloudinary first
        // WHY first? If we delete product first and Cloudinary fails,
        // images remain orphaned forever (wasting storage)
        for (const image of product.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        // Then delete from MongoDB
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get admin all products (no pagination)
// @route   GET /api/products/admin
// @access  Admin only
export const getAdminProducts = async (req, res, next) => {
    try {
        // WHY no pagination for admin?
        // Admin needs to see ALL products to manage them
        const products = await Product.find();

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
    try {
        // WHY isFeatured? Admin marks special products
        // These show on homepage
        const products = await Product.find({ isFeatured: true }).limit(8);

        res.status(200).json({
            success: true,
            products,
        });

    } catch (error) {
        next(error);
    }
};