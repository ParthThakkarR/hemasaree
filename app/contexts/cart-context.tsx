'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from '@contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* ── Types ───────────────────────────────────────── */
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  withPolish?: boolean;
  product?: { stock?: number };
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalPrice?: number;
}

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (payload: AddToCartPayload) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

interface AddToCartPayload {
  productId: string;
  quantity: number;
  productName: string;
  productImage?: string;
  price: number;
  withPolish?: boolean;
}

/* ── Context ─────────────────────────────────────── */
const CartContext = createContext<CartContextType | undefined>(undefined);

/* ── Provider ────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const refreshCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load cart');
      const data = await res.json();
      setCart(data.cart ?? null);
    } catch (err: any) {
      setError(err.message ?? 'Cart error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearCart = useCallback(() => {
    setCart(null);
    fetchedRef.current = false;
  }, []);

  /* Fetch on mount / user change */
  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchedRef.current = true;
      refreshCart();
    }
    if (!user) {
      fetchedRef.current = false;
      setCart(null);
      setError(null);
    }
  }, [user, refreshCart]);

  const addToCart = useCallback(async (payload: AddToCartPayload) => {
    if (!user) { 
      toast.error('Please sign in to add items to your cart.');
      router.push('/login');
      return false; 
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, withPolish: payload.withPolish ?? false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add item');
      
      if (data.cart) {
        setCart(data.cart);
      } else {
        await refreshCart();
      }
      toast.success('Added to cart');
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshCart, router]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return false;
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update');
      setCart(data.cart);
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove');
      setCart(data.cart);
      toast.success('Item removed');
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <CartContext.Provider value={{
      cart, cartCount, isLoading, error,
      addToCart, updateQuantity, removeItem, refreshCart, clearError,
    }}>
      {children}
    </CartContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


