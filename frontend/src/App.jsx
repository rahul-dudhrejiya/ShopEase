import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AIChatWidget from './components/common/AIChatWidget.jsx';
import Footer from './components/common/Footer.jsx';

// Customer Pages
import Home from './pages/customer/Home.jsx';
import Products from './pages/customer/Products.jsx';
import ProductDetail from './pages/customer/ProductDetail.jsx';
import Login from './pages/customer/Login.jsx';
import Register from './pages/customer/Register.jsx';
import Cart from './pages/customer/Cart.jsx';
import Checkout from './pages/customer/Checkout.jsx';
import Orders from './pages/customer/Orders.jsx';
import OrderDetail from './pages/customer/OrderDetail.jsx';
import Wishlist from './pages/customer/Wishlist.jsx';
import Profile from './pages/customer/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin Pages
import Dashboard from './pages/admin/Dashboard.jsx';
import AddProduct from './pages/admin/AddProduct.jsx';
import ManageProducts from './pages/admin/ManageProducts.jsx';
import ManageOrders from './pages/admin/ManageOrders.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navbar />

              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Protected Routes */}
                <Route path="/cart" element={
                  <ProtectedRoute><Cart /></ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute><Checkout /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><Orders /></ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute><OrderDetail /></ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute><Wishlist /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* Admin Protected Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/add-product" element={
                  <ProtectedRoute adminOnly={true}>
                    <AddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageProducts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageOrders />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageUsers />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>

              <Footer />
              <AIChatWidget />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  }
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