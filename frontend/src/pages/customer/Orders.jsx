import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import API from '../../api/axios.js';

const statusColors = {
    Processing: 'bg-yellow-100 text-yellow-700',
    Shipped: 'bg-blue-100 text-blue-700',
    OutForDelivery: 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/my');
                setOrders(data.orders);
            } catch {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Package size={80} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        No orders yet
                    </h2>
                    <Link
                        to="/products"
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    My Orders
                </h1>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link key={order._id} to={`/orders/${order._id}`}>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Order ID: #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.orderStatus]}`}>
                                            {order.orderStatus}
                                        </span>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </div>
                                </div>

                                {/* ORDER ITEMS PREVIEW */}
                                <div className="flex gap-2 mb-3">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <img
                                            key={index}
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        ₹{order.finalPrice.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;