import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">

        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="text-blue-500" size={24} />
            <span className="text-white font-bold text-lg">ShopEase</span>
          </div>
          <p className="text-sm">Shopping Made Easy! 🛒</p>
          <p className="text-sm mt-1">Built with MERN Stack</p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">Orders</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Categories</h3>
          <ul className="space-y-2 text-sm">
            {['Electronics', 'Clothing', 'Footwear', 'Books', 'Sports'].map(cat => (
              <li key={cat}>
                <Link to={`/products?category=${cat}`} className="hover:text-white transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>📧 support@shopease.com</li>
            <li>📞 1800-123-4567</li>
            <li>🕐 Mon-Sat 9AM-6PM</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-8 pt-6 text-center text-sm">
        <p>© 2025 ShopEase — Built by Rahul Dudharejiya 🚀</p>
      </div>
    </footer>
  );
};

export default Footer;