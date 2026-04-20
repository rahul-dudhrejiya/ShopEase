// UNIQUE CONCEPT: Razorpay Frontend Integration
// This is rare knowledge — most juniors don't know this!

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);

    const [address, setAddress] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
        country: 'India',
        phone: user?.phone || '',
    });

    const shippingPrice = cart.totalPrice > 999 ? 0 : 99;
    const discount = couponData?.discountAmount || 0;
    const finalPrice = cart.totalPrice + shippingPrice - discount;

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const { data } = await API.post('/coupons/apply', {
                code: couponCode,
                orderAmount: cart.totalPrice,
            });
            setCouponData(data);
            toast.success(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        }
    };

    const handlePayment = async () => {
        // Validate address
        const requiredFields = ['street', 'city', 'state', 'pincode', 'phone'];
        for (const field of requiredFields) {
            if (!address[field].trim()) {
                toast.error(`Please enter your ${field}`);
                return;
            }
        }

        setLoading(true);
        try {
            const { data: orderData } = await API.post('/payment/create-order', {
                amount: finalPrice,
            });

            // STEP 2: Configure Razorpay popup options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: 'INR',
                name: 'ShopEase',
                description: 'Shopping Made Easy!',
                order_id: orderData.order.id,
                // STEP 3: Handler runs AFTER successful payment
                handler: async (response) => {
                    try {
                        // STEP 4: Verify payment on backend
                        await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // STEP 5: Place order in database
                        const { data: placedOrder } = await API.post('/orders', {
                            shippingAddress: address,
                            paymentInfo: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            couponUsed: couponCode || null,
                            discountAmount: discount,
                        });

                        // STEP 6: Use coupon (increment counter)
                        if (couponCode) {
                            await API.post('/coupons/use', { code: couponCode });
                        }

                        // STEP 7: Clear cart and redirect
                        await clearCart();
                        toast.success('Order placed successfully! 🎉');
                        navigate(`/orders/${placedOrder.order._id}`);

                    } catch {
                        toast.error('Payment verified but order failed. Contact support.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: address.phone,
                },
                theme: { color: '#2563EB' },
            };

            // STEP 8: Open Razorpay popup
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch {
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Checkout
                </h1>

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* SHIPPING ADDRESS */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Shipping Address
                        </h2>

                        <div className="space-y-4">
                            {[
                                { label: 'Street Address', name: 'street', placeholder: '123 MG Road' },
                                { label: 'City', name: 'city', placeholder: 'Rajkot' },
                                { label: 'State', name: 'state', placeholder: 'Gujarat' },
                                { label: 'Pincode', name: 'pincode', placeholder: '360001' },
                                { label: 'Phone Number', name: 'phone', placeholder: '9876543210' },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={address[field.name]}
                                        onChange={handleAddressChange}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h2>

                            {/* CART ITEMS */}
                            <div className="space-y-3 mb-4">
                                {cart.items.map((item) => (
                                    <div key={item.product._id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400 line-clamp-1 flex-1">
                                            {item.product.name} × {item.quantity}
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-medium ml-2">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* COUPON */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Apply
                                </button>
                            </div>

                            {/* PRICE BREAKDOWN */}
                            <div className="space-y-2 text-sm border-t dark:border-gray-700 pt-4">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{cart.totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className={shippingPrice === 0 ? 'text-green-600' : ''}>
                                        {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon Discount</span>
                                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t dark:border-gray-700 pt-2">
                                    <span>Total</span>
                                    <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* PAY BUTTON */}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-colors"
                        >
                            {loading ? 'Processing...' : `Pay ₹${finalPrice.toLocaleString('en-IN')}`}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                            🔒 Secured by Razorpay
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;