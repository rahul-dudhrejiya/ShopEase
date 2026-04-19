// WHAT: Guards routes that require login/admin
// WHY: Without this, anyone can visit /profile
//      or /admin just by typing the URL
// HOW: Check auth state → redirect if not allowed

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    // Still checking auth status — show nothing
    // WHY? Prevents flash of login page before
    // auth check completes
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
        // WHY replace? Replaces history entry
        // Back button won't go back to protected page
    }

    // Logged in but not admin, trying admin route
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // All checks passed → render the actual page
    return children;
}

export default ProtectedRoute;