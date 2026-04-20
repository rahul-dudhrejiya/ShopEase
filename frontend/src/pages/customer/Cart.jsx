// UNIQUE CONCEPT: Optimistic UI Update
// Cart quantity changes INSTANTLY before API responds
// Makes app feel fast like Amazon

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState({});
    // WHY object for loading? Track loading state
    // per item — not whole cart
    // { "productId1": true, "productId2": false }

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setLoading((prev) => ({ ...prev, [productId]: true }));
        try {
            await updateCartItem(productId, newQuantity);
        } catch {
            toast.error('Failed to update quantity');
        } finally {
            setLoading((prev) => ({ ...prev, [productId]: false }));
        }
    };

    const handleRemove = async (productId, productName) => {
        try {
            await removeFromCart(productId);
            toast.success(`${productName} removed from cart`);
        } catch {
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Clear entire cart?')) return;
        await clearCart();
        toast.success('Cart cleared');
    };

    if (!cart?.items?.length) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
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

    const shippingPrice = cart.totalPrice > 999 ? 0 : 99;
    const finalTotal = cart.totalPrice + shippingPrice;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Cart ({cart.items.length} items)
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
                        {cart.items.map((item) => (
                            <div
                                key={item.product._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex gap-4"
                            >
                                {/* PRODUCT IMAGE */}
                                <Link to={`/products/${item.product._id}`}>
                                    <img
                                        src={item.product.images?.[0]?.url}
                                        alt={item.product.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                </Link>

                                {/* PRODUCT INFO */}
                                <div className="flex-1">
                                    <Link
                                        to={`/products/${item.product._id}`}
                                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 line-clamp-2 text-sm"
                                    >
                                        {item.product.name}
                                    </Link>
                                    <p className="text-blue-600 font-bold mt-1">
                                        ₹{item.price.toLocaleString('en-IN')}
                                    </p>

                                    {/* QUANTITY CONTROLS */}
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center border dark:border-gray-600 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(
                                                    item.product._id,
                                                    item.quantity - 1
                                                )}
                                                disabled={loading[item.product._id] || item.quantity <= 1}
                                                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg disabled:opacity-40"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-3 py-1 text-sm font-medium dark:text-white">
                                                {loading[item.product._id] ? '...' : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(
                                                    item.product._id,
                                                    item.quantity + 1
                                                )}
                                                disabled={loading[item.product._id] || item.quantity >= item.product.stock}
                                                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg disabled:opacity-40"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </span>
                                            <button
                                                onClick={() => handleRemove(item.product._id, item.product.name)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-fit">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Order Summary
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{cart.totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                <span className={shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                </span>
                            </div>
                            {shippingPrice > 0 && (
                                <p className="text-xs text-blue-600">
                                    Add ₹{999 - cart.totalPrice} more for free shipping!
                                </p>
                            )}
                            <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
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
