'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';

/* ── Types ───────────────────────────────────────── */
interface WishlistContextType {
  wishlist: string[];
  wishlistCount: number;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const STORAGE_KEY = 'hs_wishlist';

/* ── Context ─────────────────────────────────────── */
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

/* ── Provider ────────────────────────────────────── */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  /* Hydrate from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWishlist(JSON.parse(raw));
    } catch {
      setWishlist([]);
    }
  }, []);

  /* Persist on every change */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch { /* quota exceeded — ignore */ }
  }, [wishlist]);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────── */
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
