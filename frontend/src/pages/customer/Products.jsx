import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import API from '../../api/axios.js';
import ProductCard from '../../components/common/ProductCard.jsx';

// Custom debounce hook
// WHY? Don't call API on every keystroke
// Wait 500ms after user stops typing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
        // WHY cleanup? Cancel previous timer on each keystroke
        // Only the LAST timer runs after delay
    }, [value, delay]);
    return debouncedValue;
};

const CATEGORIES = [
    'All', 'Electronics', 'Clothing', 'Footwear',
    'Books', 'Home & Kitchen', 'Sports', 'Beauty', 'Toys', 'Grocery',
];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('-createdAt');
    const [page, setPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const debouncedSearch = useDebounce(search, 500);
    // WHY 500ms? Feel responsive but not too aggressive
    // User types "iphone" → waits 500ms → then searches

    const resultsPerPage = 8;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('keyword', debouncedSearch);
            if (category !== 'All') params.append('category', category);
            params.append('sort', sort);
            params.append('page', page);

            const { data } = await API.get(`/products?${params.toString()}`);
            setProducts(data.products);
            setTotalProducts(data.totalProducts);
        } catch {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, category, sort, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, sort]);

    const totalPages = Math.ceil(totalProducts / resultsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    All Products
                </h1>

                {/* SEARCH + SORT */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X size={16} className="text-gray-400" />
                            </button>
                        )}
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    >
                        <option value="-createdAt">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="-ratings">Top Rated</option>
                    </select>
                </div>

                {/* CATEGORY FILTERS */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-600 hover:bg-blue-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* RESULTS COUNT */}
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Showing {products.length} of {totalProducts} products
                </p>

                {/* PRODUCTS GRID */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-72 animate-pulse" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Search size={64} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg">No products found</p>
                        <button
                            onClick={() => { setSearch(''); setCategory('All'); }}
                            className="text-blue-600 mt-2"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`px-4 py-2 rounded-lg ${page === i + 1
                                    ? 'bg-blue-600 text-white'
                                    : 'border hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;