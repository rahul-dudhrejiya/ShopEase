import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import API from '../../api/axios.js';
import ProductCard from '../../components/common/ProductCard.jsx';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const { data } = await API.get('/wishlist');
            setWishlist(data.wishlist?.products || []);
        } catch {
            console.error('Failed to fetch wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleClearWishlist = async () => {
        try {
            await API.delete('/wishlist');
            setWishlist([]);
            toast.success('Wishlist cleared');
        } catch {
            toast.error('Failed to clear wishlist');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Heart className="text-red-500 fill-red-500" size={24} />
                        My Wishlist ({wishlist.length})
                    </h1>
                    {wishlist.length > 0 && (
                        <button
                            onClick={handleClearWishlist}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Heart size={80} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Your wishlist is empty
                        </h2>
                        <Link
                            to="/products"
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700"
                        >
                            Explore Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;