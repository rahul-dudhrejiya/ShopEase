import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Edit, Package } from 'lucide-react';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products/admin/all');
      setProducts(data.products);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone!`)) {
      return;
    }
    setDeletingId(productId);
    try {
      await API.delete(`/products/${productId}`);
      // Remove from local state immediately
      // WHY? No need to refetch — just remove from array
      setProducts((prev) =>
        prev.filter((p) => p._id !== productId)
      );
      toast.success(`${productName} deleted successfully`);
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
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
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Products
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} total products
            </p>
          </div>
          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {/* PRODUCTS TABLE */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No products yet</p>
            <Link
              to="/admin/add-product"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <div className="col-span-1">Image</div>
              <div className="col-span-4">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* TABLE ROWS */}
            <div className="divide-y dark:divide-gray-700">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    deletingId === product._id ? 'opacity-50' : ''
                  }`}
                >
                  {/* IMAGE */}
                  <div className="col-span-1">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/48?text=No';
                      }}
                    />
                  </div>

                  {/* NAME */}
                  <div className="col-span-4">
                    <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.brand}
                    </p>
                  </div>

                  {/* CATEGORY */}
                  <div className="col-span-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* PRICE */}
                  <div className="col-span-2">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      ₹{(product.discountPrice > 0
                        ? product.discountPrice
                        : product.price
                      ).toLocaleString('en-IN')}
                    </p>
                    {product.discountPrice > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* STOCK */}
                  <div className="col-span-1">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View Product"
                    >
                      <Edit size={16} />
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(product._id, product.name)
                      }
                      disabled={deletingId === product._id}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                      title="Delete Product"
                    >
                      {deletingId === product._id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;