import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cartApi } from '../api/cart.api';
import { getErrorMessage } from '../api/http';
import { useAuth } from './AuthContext';
import { ROLES } from '../utils/constants';

const CartContext = createContext(null);

const EMPTY = { items: [], totalItems: 0, subtotal: 0, shippingPrice: 0, totalPrice: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const isCustomer = user?.role === ROLES.USER;

  useEffect(() => {
    if (!isCustomer) return setCart(EMPTY);
    setLoading(true);
    cartApi
      .get()
      .then((d) => setCart(d.cart))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isCustomer, user?.id]);

  // Runs a cart request, stores the new cart, and shows errors as toasts
  const run = useCallback(async (request, successMessage) => {
    try {
      const data = await request();
      setCart(data.cart);
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      addItem: (id, qty = 1) => run(() => cartApi.add(id, qty), 'Added to cart'),
      updateItem: (id, qty) => run(() => cartApi.update(id, qty)),
      removeItem: (id) => run(() => cartApi.remove(id), 'Removed from cart'),
      resetCart: () => setCart(EMPTY),
    }),
    [cart, loading, run]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
