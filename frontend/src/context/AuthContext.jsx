// WHAT: Global authentication state
// WHY: User login status needed in Navbar, 
//      ProtectedRoute, Profile, Cart — everywhere!
// HOW: React Context shares state without 
//      passing props through every component

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios.js';

// STEP 1: Create the context
// Think of it as creating a "radio station"
const AuthContext = createContext();

// STEP 2: Create the Provider
// Provider = the radio tower that broadcasts state
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // WHY loading? On page refresh, we check if user
    // is logged in. During that check, show loading
    // Without it, protected routes flash before redirecting

    // Check if user is already logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const { data } = await API.get('/auth/profile');
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            // Not logged in — that's fine, user stays null
            setUser(null);
        } finally {
            setLoading(false);
            // WHY finally? Always runs — even if error
            // Must set loading false or app stays frozen
        }
    };

    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', {
            email,
            password,
        });
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await API.post('/auth/register', {
            name,
            email,
            password,
        });
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await API.post('/auth/logout');
        setUser(null);
        // WHY set null? Clear user from state
        // Cookie is cleared by backend
    };

    return (
        // STEP 3: Broadcast the state
        // Everything inside AuthProvider can access these values
        <AuthContext.Provider
            value={{ user, setUser, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// STEP 4: Custom hook for easy access
// WHY custom hook? Instead of:
//   import { useContext } from 'react'
//   import { AuthContext } from '../context/AuthContext'
//   const { user } = useContext(AuthContext)
// We just write:
//   const { user } = useAuth()
export const useAuth = () => useContext(AuthContext);