import { cookies } from "next/headers";

/**
 * Safely retrieves and parses the "cart" cookie.
 * Always returns a valid array — never undefined or invalid JSON.
 */
export function getCartFromCookie<T = any[]>(): T {
  const cookieStore = cookies();
  const cookie = cookieStore.get("cart");

  // ✅ If no cookie or invalid format → return empty array
  if (!cookie || typeof cookie.value !== "string" || cookie.value.trim() === "") {
    return [] as T;
  }

  try {
    const parsed = JSON.parse(cookie.value);
    if (Array.isArray(parsed)) return parsed as T;
    return [] as T;
  } catch (error) {
    console.error("[CART_COOKIE_PARSE_ERROR]", error);
    return [] as T;
  }
}

/**
 * Safely stringifies and stores the "cart" cookie.
 */
export function setCartCookie<T = any[]>(data: T) {
  const cookieStore = cookies();
  const json = JSON.stringify(data);
  cookieStore.set("cart", json);
}

/**
 * Clears the cart cookie.
 */
export function clearCartCookie() {
  const cookieStore = cookies();
  cookieStore.set("cart", "[]");
}
