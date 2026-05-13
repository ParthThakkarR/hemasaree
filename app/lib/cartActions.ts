// app/lib/cartActions.ts
'use server';

import { getCartFromCookie, setCartCookie } from '@/app/lib/cartCookie';

type CartItem = {
  id: string | number;
  price: number;
  quantity: number;
};

/**
 * Updates the quantity of an item in the cookie-based cart.
 */
export async function updateQuantityServer(id: string | number, quantity: number) {
  const cart = getCartFromCookie<CartItem[]>();
  const updated = cart.map((i) =>
    i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  setCartCookie(updated);
}

/**
 * Removes an item from the cookie-based cart.
 */
export async function removeItemServer(id: string | number) {
  const cart = getCartFromCookie<CartItem[]>();
  const updated = cart.filter((i) => i.id !== id);
  setCartCookie(updated);
}

/**
 * Reads the current cookie-based cart.
 */
export async function getInitialCartServer() {
  await new Promise((r) => setTimeout(r, 400)); // simulate latency
  return getCartFromCookie<CartItem[]>();
}

