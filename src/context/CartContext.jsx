import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addToCart as apiAddToCart,
  clearCart as apiClearCart,
  getCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItem as apiUpdateCartItem,
} from '../utils/cartApi';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCart();
      if (data.success) {
        setCartItems(data.data.items || []);
        setSubtotal(data.data.subtotal || 0);
        setTotalItems(data.data.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (params) => {
    const data = await apiAddToCart(params);
    if (data.success) await fetchCart();
    return data;
  }, [fetchCart]);

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    const data = await apiUpdateCartItem(cartItemId, quantity);
    if (data.success) await fetchCart();
    return data;
  }, [fetchCart]);

  const removeCartItem = useCallback(async (cartItemId) => {
    const data = await apiRemoveCartItem(cartItemId);
    if (data.success) await fetchCart();
    return data;
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    const data = await apiClearCart();
    if (data.success) {
      setCartItems([]);
      setSubtotal(0);
      setTotalItems(0);
    }
    return data;
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subtotal,
        totalItems,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
