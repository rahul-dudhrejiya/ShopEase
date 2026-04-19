// WHAT: Global cart state
// WHY: Cart item count shown in Navbar
//      Cart data needed in Cart page AND Checkout
// HOW: Fetches cart from backend, stores in state

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalPrice: 0 });
    const [cartLoading, setCartLoading] = useState(false);
    const { user } = useAuth();

    // Fetch cart when user logs in
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            // User logged out — clear cart from state
            setCart({ items: [], totalPrice: 0 });
        }
    }, [user]);
    // WHY [user] dependency? Re-run when user changes
    // login → fetch cart | logout → clear cart

    const fetchCart = async () => {
        try {
            setCartLoading(true);
            const { data } = await API.get('/cart');
            setCart(data.cart || { items: [], totalPrice: 0 });
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setCartLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        const { data } = await API.post('/cart', {
            productId,
            quantity,
        });
        setCart(data.cart);
        return data;
    };

    const updateCartItem = async (productId, quantity) => {
        const { data } = await API.post(`/cart/${productId}`, {
            quantity,
        });
        setCart(data.cart);
        return data;
    };

    const removeFromCart = async (productId) => {
        const { data } = await API.delete(`/cart/${productId}`);
        setCart(data.cart);
        return data;
    };

    const clearCart = async () => {
        await API.delete('/cart/clear');
        setCart({ items: [], totalPrice: 0 });
    };

    // Cart item count for Navbar badge
    // WHY computed here? Used in Navbar — one calculation
    const cartCount = cart?.items?.reduce(
        (total, item) => total + item.quantity, 0
    ) || 0;

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
