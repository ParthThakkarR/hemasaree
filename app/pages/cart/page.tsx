"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For clean currency formatting
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/cart");
        if (!res.ok) {
          if (res.status === 401) {
            setError("Please login to view your cart.");
          } else {
            setError("Failed to load cart. Please try again.");
          }
          setCart(null);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setCart(data.cart || null);
      } catch {
        setError("Network error. Please try again.");
        setCart(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading cart...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  if (!cart || cart.items.length === 0)
    return (
      <div className="text-center mt-5">
        <p>Your cart is empty.</p>
        <Link href="/">
          <button className="btn btn-primary mt-3">Start Shopping</button>
        </Link>
      </div>
    );

  return (
    <div className="container my-4">
      <h2>Your Cart</h2>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Product</th>
            <th>Image</th>
            <th>Quantity</th>
            <th>Price (each)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    width={50}
                    height={50}
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: "#eee",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "4px",
                      color: "#888",
                      fontSize: "0.8rem",
                    }}
                  >
                    No image
                  </div>
                )}
              </td>
              <td>{item.quantity}</td>
              <td>{formatter.format(item.price)}</td>
              <td>{formatter.format(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-4">Total: {formatter.format(cart.totalPrice)}</h3>

      <Link href="/">
        <button className="btn btn-outline-primary mt-3">Continue Shopping</button>
      </Link>
    </div>
  );
}
