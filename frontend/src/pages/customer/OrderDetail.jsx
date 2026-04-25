import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';

const statusColors = {
    Processing: 'bg-yellow-100 text-yellow-700',
    Shipped: 'bg-blue-100 text-blue-700',
    OutForDelivery: 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const statusSteps = ['Processing', 'Shipped', 'OutForDelivery', 'Delivered'];

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${id}`);
                setOrder(data.order);
            } catch {
                toast.error('Order not found');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm('Cancel this order?')) return;
        setCancelling(true);

        try {
            const { data } = await API.put(`/orders/${id}/cancel`);
            setOrder(data.order);
            toast.success('Order cancelled successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot cancel order');
        } finally {
            setCancelling(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!order) return null;

    const currentStep = statusSteps.indexOf(order.orderStatus);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* BACK */}
                <Link
                    to="/orders"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Orders
                </Link>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Order #{order._id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.orderStatus]
                            }`}
                    >
                        {order.orderStatus}
                    </span>
                </div>

                {/* ORDER TRACKING */}
                {order.orderStatus !== 'Cancelled' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Package size={20} />
                            Order Tracking
                        </h2>
                        <div className="flex items-center justify-between relative">
                            {/* Progress line */}
                            <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200 dark:bg-gray-700 z-0" />
                            <div
                                className="absolute left-0 top-4 h-1 bg-blue-600 z-0 transition-all duration-500"
                                style={{
                                    width:
                                        currentStep >= 0
                                            ? `${(currentStep / (statusSteps.length - 1)) * 100}%`
                                            : '0%',
                                }}
                            />

                            {statusSteps.map((step, index) => (
                                <div
                                    key={step}
                                    className="flex flex-col items-center z-10 relative"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index <= currentStep
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                            }`}
                                    >
                                        {index < currentStep ? '✓' : index + 1}
                                    </div>
                                    <p
                                        className={`text-xs mt-2 text-center max-w-17.5 ${index <= currentStep
                                            ? 'text-blue-600 font-medium'
                                            : 'text-gray-400'
                                            }`}
                                    >
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">

                    {/* ORDER ITEMS */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                            Items Ordered
                        </h2>
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                                        onError={(e) => {
                                            e.target.src =
                                                'https://via.placeholder.com/56x56?text=No+Image';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Qty: {item.quantity}
                                        </p>
                                        <p className="text-sm font-bold text-blue-600">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* PRICE SUMMARY */}
                        <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>
                                    {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}
                                </span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t dark:border-gray-700 pt-2">
                                <span>Total Paid</span>
                                <span>₹{order.finalPrice?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* SHIPPING ADDRESS */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <MapPin size={18} />
                                Shipping Address
                            </h2>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p>{order.shippingAddress?.street}</p>
                                <p>
                                    {order.shippingAddress?.city},{' '}
                                    {order.shippingAddress?.state}
                                </p>
                                <p>{order.shippingAddress?.pincode}</p>
                                <p>📞 {order.shippingAddress?.phone}</p>
                            </div>
                        </div>

                        {/* PAYMENT INFO */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <CreditCard size={18} />
                                Payment Info
                            </h2>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p>
                                    Status:{' '}
                                    <span
                                        className={`font-semibold ${order.paymentStatus === 'paid'
                                            ? 'text-green-600'
                                            : 'text-yellow-600'
                                            }`}
                                    >
                                        {order.paymentStatus?.toUpperCase()}
                                    </span>
                                </p>
                                {order.couponUsed && (
                                    <p>
                                        Coupon:{' '}
                                        <span className="font-semibold text-green-600">
                                            {order.couponUsed}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CANCEL BUTTON */}
                        {order.orderStatus === 'Processing' && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;

