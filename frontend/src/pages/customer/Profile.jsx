import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
      });
      setUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          My Profile
        </h1>

        {/* PROFILE HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              user?.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <User size={16} />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleProfileUpdate}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <h3 className="font-semibold text-gray-800 dark:text-white pt-2">
              Default Address
            </h3>

            {[
              { label: 'Street', key: 'street', placeholder: '123 MG Road' },
              { label: 'City', key: 'city', placeholder: 'Rajkot' },
              { label: 'State', key: 'state', placeholder: 'Gujarat' },
              { label: 'Pincode', key: 'pincode', placeholder: '360001' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* PASSWORD TAB */}
        {activeTab === 'password' && (
          <form
            onSubmit={handlePasswordChange}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4"
          >
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirmPassword' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type="password"
                  value={passwords[field.key]}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      [field.key]: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <Lock size={18} />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;


// import { useState } from 'react';
// import { useAuth } from '../../context/AuthContext.jsx';
// import API from '../../api/axios.js';
// import toast from 'react-hot-toast';
// import { User, MapPin, Lock } from 'lucide-react';

// const Profile = () => {
//   const { user, setUser } = useAuth();
//   const [activeTab, setActiveTab] = useState('profile');
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     name: user?.name || '',
//     phone: user?.phone || '',
//     address: {
//       street: user?.address?.street || '',
//       city: user?.address?.city || '',
//       state: user?.address?.state || '',
//       pincode: user?.address?.pincode || '',
//     },
//   });

//   const [passwords, setPasswords] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (['street', 'city', 'state', 'pincode'].includes(name)) {
//       setForm(prev => ({
//         ...prev,
//         address: { ...prev.address, [name]: value }
//       }));
//     } else {
//       setForm(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { data } = await API.put('/auth/profile', form);
//       setUser(data.user);
//       toast.success('Profile updated! ✅');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Update failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     if (passwords.newPassword.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }
//     setLoading(true);
//     try {
//       await API.put('/auth/change-password', passwords);
//       toast.success('Password changed! 🔒');
//       setPasswords({ currentPassword: '', newPassword: '' });
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tabs = [
//     { id: 'profile', label: 'Profile', icon: User },
//     { id: 'address', label: 'Address', icon: MapPin },
//     { id: 'password', label: 'Password', icon: Lock },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
//       <div className="max-w-3xl mx-auto">

//         {/* HEADER */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 flex items-center gap-4">
//           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
//             <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
//             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
//               {user?.role}
//             </span>
//           </div>
//         </div>

//         {/* TABS */}
//         <div className="flex gap-2 mb-6 flex-wrap">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//             >
//               <tab.icon size={16} />
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* PROFILE TAB */}
//         {activeTab === 'profile' && (
//           <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
//             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
//             {[
//               { label: 'Full Name', name: 'name', value: form.name, placeholder: 'John Doe' },
//               { label: 'Phone Number', name: 'phone', value: form.phone, placeholder: '9876543210' },
//             ].map((field) => (
//               <div key={field.name}>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   {field.label}
//                 </label>
//                 <input
//                   type="text"
//                   name={field.name}
//                   value={field.value}
//                   onChange={handleChange}
//                   placeholder={field.placeholder}
//                   className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             ))}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
//             >
//               {loading ? 'Saving...' : 'Save Changes'}
//             </button>
//           </form>
//         )}

//         {/* ADDRESS TAB */}
//         {activeTab === 'address' && (
//           <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
//             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Address</h2>
//             {[
//               { label: 'Street', name: 'street', value: form.address.street, placeholder: '123 MG Road' },
//               { label: 'City', name: 'city', value: form.address.city, placeholder: 'Rajkot' },
//               { label: 'State', name: 'state', value: form.address.state, placeholder: 'Gujarat' },
//               { label: 'Pincode', name: 'pincode', value: form.address.pincode, placeholder: '360001' },
//             ].map((field) => (
//               <div key={field.name}>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   {field.label}
//                 </label>
//                 <input
//                   type="text"
//                   name={field.name}
//                   value={field.value}
//                   onChange={handleChange}
//                   placeholder={field.placeholder}
//                   className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             ))}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
//             >
//               {loading ? 'Saving...' : 'Save Address'}
//             </button>
//           </form>
//         )}

//         {/* PASSWORD TAB */}
//         {activeTab === 'password' && (
//           <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
//             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
//             {[
//               { label: 'Current Password', key: 'currentPassword' },
//               { label: 'New Password', key: 'newPassword' },
//             ].map((field) => (
//               <div key={field.key}>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   {field.label}
//                 </label>
//                 <input
//                   type="password"
//                   value={passwords[field.key]}
//                   onChange={(e) => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
//                   placeholder="••••••••"
//                   required
//                   className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             ))}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
//             >
//               {loading ? 'Changing...' : 'Change Password'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;