// WHAT: Root component — defines all page routes
// WHY: Single place to see the entire app structure
// HOW: React Router maps URLs to page components

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages
import Home from './pages/customer/Home.jsx';
import Products from './pages/customer/Products.jsx';
import Login from './pages/customer/Login.jsx';
import Register from './pages/customer/Register.jsx';

// We'll create these pages in Day 8:
// import ProductDetail from './pages/customer/ProductDetail.jsx';
// import Cart from './pages/customer/Cart.jsx';
// import Orders from './pages/customer/Orders.jsx';
// import Profile from './pages/customer/Profile.jsx';
// import Wishlist from './pages/customer/Wishlist.jsx';
// import Dashboard from './pages/admin/Dashboard.jsx';

const App = () => {
  return (
    // WHY nest providers?
    // ThemeProvider wraps everything → theme available everywhere
    // AuthProvider wraps everything → user state available everywhere
    // CartProvider needs AuthProvider (uses useAuth inside)
    //   so CartProvider must be INSIDE AuthProvider
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navbar />

              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* PROTECTED ROUTES — add as we build pages */}
                {/* 
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={
                  <ProtectedRoute><Cart /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><Orders /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute><Wishlist /></ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                */}
              </Routes>

              {/* TOAST NOTIFICATIONS */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;