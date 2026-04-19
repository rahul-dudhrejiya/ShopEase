// WHAT: Reusable product display card
// WHY: Same card used in Home, Products, Wishlist pages
//      Build once, use everywhere (DRY principle)

import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import API from '../../api/axios.js';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        // WHY preventDefault? Card is inside a Link
        // Without this, click navigates to product page
        // We want to add to cart WITHOUT navigating

        if (!user) {
            toast.error('Please login to add items to cart');
            return;
        }

        try {
            await addToCart(product._id, 1);
            toast.success(`${product.name} added to cart! 🛒`)
        } catch {
            toast.error('Failed to add to cart');
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }
        try {
            const { data } = await API.post(`/wishlist/${product._id}`);
            toast.success(data.message);
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    // Calculate discount percentage
    const discountPercent =
        product.discountPrice > 0
            ? Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
            )
            : 0;

    return (
        <Link to={`/products/${product._id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">

                {/* PRODUCT IMAGE */}
                <div className="relative overflow-hidden h-48">
                    <img
                        src={product.images?.[0]?.url || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    // WHY group-hover:scale-105?
                    // When hovering the CARD (group), image scales up
                    // Creates zoom effect without JS
                    />

                    {/* DISCOUNT BADGE */}
                    {discountPercent > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{discountPercent}%
                        </span>
                    )}

                    {/* WISHLIST BUTTON */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow hover:scale-110 transition-transform"
                    >
                        <Heart size={16} className="text-red-400" />
                    </button>
                </div>

                {/* PRODUCT INFO */}
                <div className="p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        {product.brand}
                    </p>
                    <h3 className="text-gray-800 dark:text-white font-semibold text-sm mb-2 line-clamp-2">
                        {product.name}
                        {/* WHY line-clamp-2? Limit to 2 lines
                Keeps all cards same height — clean grid */}
                    </h3>

                    {/* RATING */}
                    <div className="flex items-center gap-1 mb-3">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {product.ratings > 0 ? product.ratings.toFixed(1) : 'No ratings'}
                        </span>
                        <span className="text-xs text-gray-400">
                            ({product.numReviews})
                        </span>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{(product.discountPrice > 0 ? product.discountPrice : product.price).toLocaleString('en-IN')}
                            {/* WHY toLocaleString('en-IN')?
                  Formats number as Indian currency
                  74999 → 74,999 */}
                        </span>
                        {discountPercent > 0 && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {/* ADD TO CART BUTTON */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <ShoppingCart size={16} />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
