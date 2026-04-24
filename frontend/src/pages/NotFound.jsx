import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-blue-600 mb-4">404</p>
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Oops! The page you are looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;