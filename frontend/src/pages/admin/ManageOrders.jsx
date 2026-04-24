import { useState, useEffect } from 'react';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';

const statusColors = {
    Processing: 'bg-yellow-100 text-yellow-700',
    Shipped: 'bg-blue-100 text-blue-700',
    OutForDelivery: 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders/admin/all');
            setOrders(data.orders);
        } catch {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await API.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}! ✅`);
            fetchOrders();
        } catch {
            toast.error('Failed to update status');
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package size={28} className="text-blue-600" />
                    Manage Orders ({orders.length})
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            <p className="font-medium">{order.user?.name}</p>
                                            <p className="text-xs">{order.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                                            ₹{order.finalPrice.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentStatus === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.orderStatus]}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className="text-xs border dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {['Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageOrders;