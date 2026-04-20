// UNIQUE CONCEPT: Recharts with LIVE MongoDB data
// Real analytics from your actual database!

import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import API from '../../api/axios.js';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                </p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/stats');
                setStats(data);
            } catch {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Admin Dashboard
                </h1>

                {/* STAT CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${Number(stats?.stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
                        icon={DollarSign}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats?.stats?.totalOrders || 0}
                        icon={ShoppingBag}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Products"
                        value={stats?.stats?.totalProducts || 0}
                        icon={Package}
                        color="bg-purple-500"
                    />
                    <StatCard
                        title="Total Users"
                        value={stats?.stats?.totalUsers || 0}
                        icon={Users}
                        color="bg-orange-500"
                    />
                </div>

                {/* CHARTS */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">

                    {/* REVENUE CHART */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Monthly Revenue
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats?.salesChartData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value) => [
                                        `₹${Number(value || 0).toLocaleString('en-IN')}`,
                                        'Revenue'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    dot={{ fill: '#2563EB' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ORDERS CHART */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Monthly Orders
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats?.salesChartData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ORDER STATUS + LOW STOCK */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* ORDER STATUS */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Orders by Status
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        {status}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${stats?.stats?.totalOrders
                                                        ? (count / stats.stats.totalOrders) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white w-6">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LOW STOCK ALERT */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-500" />
                            Low Stock Alert
                        </h2>
                        {stats?.lowStockProducts?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.lowStockProducts.map((product) => (
                                    <div key={product._id} className="flex items-center gap-3">
                                        <img
                                            src={product.images?.[0]?.url || "/placeholder.png"}
                                            alt={product.name}
                                            className="w-10 h-10 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-red-500 font-bold">
                                                Only {product.stock} left!
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">All products are well stocked! ✅</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;