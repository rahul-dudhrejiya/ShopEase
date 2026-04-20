// WHAT: Single product page with full details
// WHY: Users need to see images, description,
//      reviews before deciding to buy
// UNIQUE: Image gallery + review system + ratings

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft } from 'lucide-react';
import API from '../../api/axios.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    // WHY useParams? URL is /products/64abc123
    // useParams extracts { id: "64abc123" }
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);   
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await API.get(`/products/${id}`);
            setProduct(data.product);
        } catch {
            toast.error('Product not found');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await API.get(`/reviews/${id}`);
            setReviews(data.reviews);
        } catch {
            console.error('Failed to fetch reviews');
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }
        try {
            await addToCart(product._id, quantity);
            toast.success('Added to cart! 🛒');
        } catch {
            toast.error('Failed to add to cart');
        }
    };

    const handleWishlist = async () => {
        if (!user) {
            toast.error('Please login first');
            return;
        }
        try {
            const { data } = await API.post(`/wishlist/${product._id}`);
            toast.success(data.message);
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to write a review');
            return;
        }
        setReviewLoading(true);
        try {
            await API.post(`/reviews/${id}`, { rating, comment });
            toast.success('Review added! ⭐');
            setComment('');
            setRating(5);
            fetchReviews();
            fetchProduct(); // Refresh rating
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add review');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!product) return null;

    const finalPrice = product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    const discount = product.discountPrice > 0
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
                >
                    <ChevronLeft size={20} />
                    Back to Products
                </button>

                {/* PRODUCT DETAILS */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* IMAGE GALLERY */}
                        <div>
                            <div className="rounded-xl overflow-hidden h-80 mb-4 bg-gray-100">
                                <img
                                    src={product.images[selectedImage]?.url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* THUMBNAIL IMAGES */}
                            {product.images.length > 1 && (
                                <div className="flex gap-2 flex-wrap">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === index
                                                ? 'border-blue-600'
                                                : 'border-transparent'
                                                }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PRODUCT INFO */}
                        <div>
                            <p className="text-blue-600 text-sm font-medium uppercase mb-1">
                                {product.brand}
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {product.name}
                            </h1>

                            {/* RATING */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            className={star <= Math.round(product.ratings)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                    {product.ratings} ({product.numReviews} reviews)
                                </span>
                            </div>

                            {/* PRICE */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    ₹{finalPrice.toLocaleString('en-IN')}
                                </span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </span>
                                        <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded-full">
                                            {discount}% OFF
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* STOCK */}
                            <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {product.stock > 0
                                    ? `✅ In Stock (${product.stock} available)`
                                    : '❌ Out of Stock'
                                }
                            </p>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {product.description}
                            </p>

                            {/* QUANTITY */}
                            {product.stock > 0 && (
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        Quantity:
                                    </span>
                                    <div className="flex items-center border dark:border-gray-600 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                                        >
                                            −
                                        </button>
                                        <span className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleWishlist}
                                    className="p-3 border dark:border-gray-600 rounded-xl hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Heart size={20} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Customer Reviews ({reviews.length})
                    </h2>

                    {/* ADD REVIEW FORM */}
                    {user && (
                        <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                                Write a Review
                            </h3>

                            {/* STAR RATING INPUT */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            size={28}
                                            className={star <= rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                            }
                                        />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                required
                                rows={3}
                                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            />

                            <button
                                type="submit"
                                disabled={reviewLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                            >
                                {reviewLoading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}

                    {/* REVIEWS LIST */}
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="border-b dark:border-gray-700 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {review.user?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                {review.user?.name}
                                            </p>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={star <= review.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-auto">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            No reviews yet. Be the first to review!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;