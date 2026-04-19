import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import API from '../../api/axios.js';
import ProductCard from '../../components/common/ProductCard.jsx';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await API.get('/products/featured');
                setFeaturedProducts(data.products);
            } catch {
                console.error('Failed to fetch featured products');
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* HERO SECTION */}
            <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Shopping Made Easy! 🛒
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Discover thousands of products at unbeatable prices.
                        Fast delivery, easy returns.
                    </p>
                    <Link
                        to="/products"
                        className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors inline-block"
                    >
                        Shop Now →
                    </Link>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
                        { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
                        { icon: ShoppingBag, title: 'Easy Returns', desc: '7 day return policy' },
                        { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
                    ].map((feature) => (
                        <div key={feature.title} className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
                            <feature.icon className="mx-auto text-blue-600 mb-3" size={32} />
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Featured Products
                        </h2>
                        <Link to="/products" className="text-blue-600 hover:underline">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-72 animate-pulse" />
                                // WHY animate-pulse? Skeleton loader
                                // Shows placeholder while loading
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <ShoppingBag size={64} className="mx-auto mb-4 opacity-30" />
                            <p>No featured products yet.</p>
                            <Link to="/products" className="text-blue-600 mt-2 inline-block">
                                Browse all products →
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;