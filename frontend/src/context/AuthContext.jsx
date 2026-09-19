import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            setUser(null);
        } finally {
            setLoading(false);
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
    };

    return (
        <AuthContext.Provider
            value={{ user, setUser, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);