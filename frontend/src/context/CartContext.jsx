import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalPrice: 0 });
    const [cartLoading, setCartLoading] = useState(false);
    const { user } = useAuth();

    // ✅ CORRECT — move fetchCart INSIDE useEffect
    useEffect(() => {
        const fetchCart = async () => {
            try {
                setCartLoading(true);
                const { data } = await API.get('/cart');
                setCart(cleanCart(data.cart));
            } catch {
                console.error('Failed to fetch cart');
            } finally {
                setCartLoading(false);
            }
        };

        if (user) {
            fetchCart();
        } else {
            setCart({ items: [], totalPrice: 0 });
        }
    }, [user]);
    // Clean null products from cart
    // WHY? Deleted products stay in cart as null
    const cleanCart = (cartData) => {
        if (!cartData) return { items: [], totalPrice: 0 };
        return {
            ...cartData,
            items: (cartData.items || []).filter(
                (item) => item.product !== null && item.product !== undefined
            ),
        };
    };

    const fetchCart = async () => {
        try {
            setCartLoading(true);
            const { data } = await API.get('/cart');
            setCart(cleanCart(data.cart));
        } catch {
            console.error('Failed to fetch cart');
        } finally {
            setCartLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        const { data } = await API.post('/cart', { productId, quantity });
        setCart(cleanCart(data.cart));
        return data;
    };

    const updateCartItem = async (productId, quantity) => {
        const { data } = await API.put(`/cart/${productId}`, { quantity });
        setCart(cleanCart(data.cart));
        return data;
    };

    const removeFromCart = async (productId) => {
        const { data } = await API.delete(`/cart/${productId}`);
        // WHY cleanCart here? Server returns updated cart
        // We clean it before storing in state
        setCart(cleanCart(data.cart));
        return data;
    };

    const clearCart = async () => {
        await API.delete('/cart/clear');
        setCart({ items: [], totalPrice: 0 });
    };

    const cartCount =
        cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                cartLoading,
                fetchCart,
                addToCart,
                updateCartItem,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);