'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from '@contexts/auth-context';

/* ── Types ───────────────────────────────────────── */
interface WishlistContextType {
  wishlist: string[];
  wishlistCount: number;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY_PREFIX = 'hs_wishlist_';

/* ── Context ─────────────────────────────────────── */
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

/* ── Provider ────────────────────────────────────── */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return user?.id ? `${STORAGE_KEY_PREFIX}${user.id}` : `${STORAGE_KEY_PREFIX}guest`;
  }, [user]);

  /* Hydrate and Sync */
  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      
      // 1. Initial hydration from localStorage (for immediate UI)
      try {
        const raw = localStorage.getItem(getStorageKey());
        if (raw) setWishlist(JSON.parse(raw));
      } catch {
        setWishlist([]);
      }
      setIsHydrated(true);

      // 2. If logged in, sync with database
      if (user?.id) {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const dbWishlist = await res.json();
            setWishlist(dbWishlist);
            // Update local storage to match DB
            localStorage.setItem(getStorageKey(), JSON.stringify(dbWishlist));
          }
        } catch (err) {
          console.error('Failed to sync wishlist with DB', err);
        }
      }
      
      setIsLoading(false);
    };

    hydrate();
  }, [user, getStorageKey]);

  /* Persist guest wishlist to localStorage */
  useEffect(() => {
    if (!isHydrated || user?.id) return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(wishlist));
    } catch { /* quota exceeded */ }
  }, [wishlist, isHydrated, user, getStorageKey]);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const toggleWishlist = useCallback(async (id: string) => {
    // Optimistic UI update
    setWishlist(prev => {
        const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
        // If not logged in, persist to localStorage immediately
        if (!user?.id) {
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        }
        return updated;
    });

    // Server-side update if logged in
    if (user?.id) {
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id })
            });
            if (!res.ok) throw new Error('DB update failed');
            
            // Sync with actual DB state just in case
            const dbWishlist = await fetch('/api/wishlist').then(r => r.json());
            setWishlist(dbWishlist);
            localStorage.setItem(getStorageKey(), JSON.stringify(dbWishlist));
        } catch (err) {
            console.error('Failed to update DB wishlist', err);
            // Revert might be needed here in a more complex app
        }
    }
  }, [user, getStorageKey]);

  const clearWishlist = useCallback(async () => {
    setWishlist([]);
    localStorage.removeItem(getStorageKey());

    if (user?.id) {
        try {
            await fetch('/api/wishlist', { method: 'DELETE' });
        } catch (err) {
            console.error('Failed to clear DB wishlist', err);
        }
    }
  }, [user, getStorageKey]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      isLoading,
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

