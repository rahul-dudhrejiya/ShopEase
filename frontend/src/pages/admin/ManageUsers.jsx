import { useState, useEffect } from 'react';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';
import { Users, Ban, CheckCircle, Trash2 } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/admin/users');
            setUsers(data.users);
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus, userName) => {
        try {
            await API.put(`/admin/users/${userId}/toggle`);
            toast.success(`${userName} ${currentStatus ? 'banned' : 'activated'}!`);
            fetchUsers();
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Delete ${userName}? This cannot be undone!`)) return;
        try {
            await API.delete(`/admin/users/${userId}`);
            toast.success(`${userName} deleted`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
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
                    <Users size={28} className="text-blue-600" />
                    Manage Users ({users.length})
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {user.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {user.role !== 'admin' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id, user.isActive, user.name)}
                                                            className={`p-1.5 rounded-lg transition-colors ${user.isActive
                                                                    ? 'text-orange-500 hover:bg-orange-50'
                                                                    : 'text-green-500 hover:bg-green-50'
                                                                }`}
                                                            title={user.isActive ? 'Ban User' : 'Activate User'}
                                                        >
                                                            {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id, user.name)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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

export default ManageUsers;