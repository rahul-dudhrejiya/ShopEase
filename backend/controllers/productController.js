import Product from '../models/Product.js';
import { cloudinary } from '../config/cloudinary.js';
import APIFeatures from '../utils/apiFeatures.js';

/**
 * @desc    Add new product with Cloudinary image upload
 * @route   POST /api/products
 * @access  Admin only
 */
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

        const imagePromises = (req.files || []).map(async (file) => {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'shopease/products',
                resource_type: 'auto',
            });

            return {
                public_id: result.public_id,
                url: result.secure_url,
            };
        });

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

/**
 * @desc    Get all products (with search, filter, pagination, accurate count)
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const resultsPerPage = 8;

        // Accurate count matching search and filter criteria
        const countFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter();
        const totalProducts = await countFeatures.query.countDocuments();

        // Query execution with pagination
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

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

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

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin only
 */
export const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (req.files && req.files.length > 0) {
            for (const image of product.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }

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

        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
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

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Admin only
 */
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        for (const image of product.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get admin all products (unpaginated)
 * @route   GET /api/products/admin
 * @access  Admin only
 */
export const getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find().lean();

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true }).limit(8).lean();

        res.status(200).json({
            success: true,
            products,
        });

    } catch (error) {
        next(error);
    }
};