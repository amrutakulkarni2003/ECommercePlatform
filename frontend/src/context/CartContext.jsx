import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const { data } = await cartAPI.getCart();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    await cartAPI.addToCart({ productId, quantity });
    await fetchCart();
  };

  const updateQuantity = async (id, quantity) => {
    await cartAPI.updateQuantity(id, quantity);
    await fetchCart();
  };

  const removeItem = async (id) => {
    await cartAPI.removeItem(id);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, totalItems, totalPrice, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
