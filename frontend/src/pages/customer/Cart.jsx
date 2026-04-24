import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // loading tracks which item is updating
  // WHY object? Each item has own loading state
  // { "productId1": true } means that item is loading
  const [loading, setLoading] = useState({});
  const [removing, setRemoving] = useState({});

  // Filter null products for safety
  const validItems = cart?.items?.filter(
    (item) => item.product !== null && item.product !== undefined
  ) || [];

  // ========================
  // QUANTITY CHANGE HANDLER
  // ========================
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!productId) return;

    setLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, newQuantity);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ========================
  // REMOVE ITEM HANDLER
  // ========================
  const handleRemove = async (productId, productName) => {
    if (!productId) return;

    setRemoving((prev) => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
      toast.success(`${productName} removed from cart`);
    } catch {
      toast.error('Failed to remove item');
      setRemoving((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ========================
  // CLEAR CART HANDLER
  // ========================
  const handleClearCart = async () => {
    if (!window.confirm('Clear entire cart?')) return;
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  // ========================
  // EMPTY CART VIEW
  // ========================
  if (!validItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag
            size={80}
            className="mx-auto text-gray-300 mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some products to get started!
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = validItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingPrice = subtotal > 999 ? 0 : 99;
  const finalTotal = subtotal + shippingPrice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Cart ({validItems.length} items)
          </h1>
          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {validItems.map((item) => {
              const productId = item.product._id;
              const isLoading = loading[productId];
              const isRemoving = removing[productId];

              return (
                <div
                  key={`cart-item-${productId}`}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex gap-4 transition-opacity duration-300 ${
                    isRemoving ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  {/* PRODUCT IMAGE */}
                  <Link
                    to={`/products/${productId}`}
                    className="shrink-0"
                  >
                    <img
                      src={
                        item.product.images?.[0]?.url ||
                        item.product.images?.[0] ||
                        'https://via.placeholder.com/80'
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                  </Link>

                  {/* PRODUCT INFO */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${productId}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 text-sm line-clamp-2 block"
                    >
                      {item.product.name}
                    </Link>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Brand: {item.product.brand}
                    </p>

                    <p className="text-sm font-bold text-blue-600 mt-1">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </p>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border dark:border-gray-600 rounded-lg overflow-hidden">

                        {/* MINUS BUTTON */}
                        <button
                          onClick={() =>
                            handleQuantityChange(productId, item.quantity - 1)
                          }
                          disabled={isLoading || item.quantity <= 1}
                          className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                        >
                          <Minus
                            size={14}
                            className="text-gray-600 dark:text-gray-400"
                          />
                        </button>

                        {/* QUANTITY NUMBER */}
                        <span className="px-4 py-1.5 text-sm font-medium text-gray-900 dark:text-white min-w-10 text-center">
                          {isLoading ? '...' : item.quantity}
                        </span>

                        {/* PLUS BUTTON */}
                        <button
                          onClick={() =>
                            handleQuantityChange(productId, item.quantity + 1)
                          }
                          disabled={
                            isLoading ||
                            item.quantity >= (item.product.stock || 99)
                          }
                          className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                        >
                          <Plus
                            size={14}
                            className="text-gray-600 dark:text-gray-400"
                          />
                        </button>
                      </div>

                      {/* TOTAL + DELETE */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() =>
                            handleRemove(productId, item.product.name)
                          }
                          disabled={isRemoving}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                          title="Remove from cart"
                        >
                          {isRemoving ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-fit sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            {/* ITEMS LIST */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {validItems.map((item) => (
                <div
                  key={`summary-${item.product._id}`}
                  className="flex justify-between text-xs"
                >
                  <span className="text-gray-600 dark:text-gray-400 line-clamp-1 flex-1">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900 dark:text-white ml-2 font-medium">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="border-t dark:border-gray-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span
                  className={
                    shippingPrice === 0
                      ? 'text-green-600 font-medium'
                      : ''
                  }
                >
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>

              {shippingPrice > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  Add ₹{(999 - subtotal).toLocaleString('en-IN')} more
                  for FREE shipping!
                </p>
              )}

              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700 text-base">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            <Link
              to="/products"
              className="block text-center text-blue-600 hover:underline mt-3 text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;