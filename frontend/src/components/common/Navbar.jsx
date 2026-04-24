// src/components/common/Navbar.jsx
// WHAT: Top navigation bar shown on all pages
// WHY: Users need consistent navigation
// HOW: Shows different options based on auth state

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Moon, Sun, Menu, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      {/* WHY sticky top-0 z-50? 
          Navbar stays at top while scrolling
          z-50 ensures it appears above all other elements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-blue-600">
              ShopEase
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Products
            </Link>

            {/* DARK MODE TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {user ? (
              <>
                {/* WISHLIST */}
                <Link to="/wishlist" className="relative">
                  <Heart
                    size={22}
                    className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                  />
                </Link>

                {/* CART with badge */}
                <Link to="/cart" className="relative">
                  <ShoppingCart
                    size={22}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                    // WHY absolute positioning?
                    // Badge floats on top-right of cart icon
                    // -top-2 -right-2 moves it outside the icon
                  )}
                </Link>

                {/* USER DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
                  >
                    <User size={22} />
                    <span className="text-sm">{user.name}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Orders
                      </Link>

                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            📊 Dashboard
                          </Link>
                          <Link
                            to="/admin/add-product"
                            className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            ➕ Add Product
                          </Link>
                          <Link
                            to="/admin/orders"
                            className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            📦 Manage Orders
                          </Link>
                          <Link
                            to="/admin/users"
                            className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            👥 Manage Users
                          </Link>
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // NOT LOGGED IN
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="text-blue-600 border border-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-4 py-3 space-y-3">
          <Link to="/products" className="block text-gray-600 dark:text-gray-300">
            Products
          </Link>
          {user ? (
            <>
              <Link to="/cart" className="block text-gray-600 dark:text-gray-300">
                Cart ({cartCount})
              </Link>
              <Link to="/orders" className="block text-gray-600 dark:text-gray-300">
                Orders
              </Link>
              <Link to="/wishlist" className="block text-gray-600 dark:text-gray-300">
                Wishlist
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block text-blue-600">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="block text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-blue-600">Login</Link>
              <Link to="/register" className="block text-blue-600">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;