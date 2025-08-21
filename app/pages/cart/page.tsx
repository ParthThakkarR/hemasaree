// // "use client";

// // import React, { useEffect, useState } from "react";
// // import Link from "next/link";

// // interface CartItem {
// //   id: string;
// //   productName: string;
// //   productImage?: string;
// //   quantity: number;
// //   price: number;
// // }

// // interface Cart {
// //   id: string;
// //   userId: string;
// //   items: CartItem[];
// //   totalPrice: number;
// // }

// // export default function CartPage() {
// //   const [cart, setCart] = useState<Cart | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   // For clean currency formatting
// //   const formatter = new Intl.NumberFormat("en-IN", {
// //     style: "currency",
// //     currency: "INR",
// //     minimumFractionDigits: 2,
// //   });

// //   useEffect(() => {
// //     async function fetchCart() {
// //       setLoading(true);
// //       setError(null);

// //       try {
// //         const res = await fetch("/api/cart");
// //         if (!res.ok) {
// //           if (res.status === 401) {
// //             setError("Please login to view your cart.");
// //           } else {
// //             setError("Failed to load cart. Please try again.");
// //           }
// //           setCart(null);
// //           setLoading(false);
// //           return;
// //         }

// //         const data = await res.json();
// //         setCart(data.cart || null);
// //       } catch {
// //         setError("Network error. Please try again.");
// //         setCart(null);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchCart();
// //   }, []);
  

// //   const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
// //     if (newQuantity < 1) return; // Prevent quantity from being less than 1
    
// //     // Optimistically update the UI for a faster feel
// //     if(cart) {
// //         const updatedItems = cart.items.map(item => 
// //             item.id === cartItemId ? { ...item, quantity: newQuantity } : item
// //         );
// //         setCart({ ...cart, items: updatedItems });
// //     }

// //     try {
// //       const res = await fetch("/api/cart", {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ cartItemId, quantity: newQuantity }),
// //       });
// //       if (!res.ok) throw new Error("Failed to update quantity");
      
// //       // Re-sync with the server's final state
// //       const data = await res.json();
// //       setCart(data.cart);
// //     } catch {
// //       alert("Could not update quantity. Please refresh and try again.");
// //       fetchCart(); // Re-fetch to correct any optimistic update errors
// //     }
// //   };

// //   const handleRemoveItem = async (cartItemId: string) => {
// //     if (!confirm("Are you sure you want to remove this item?")) return;

// //     try {
// //       const res = await fetch("/api/cart", {
// //         method: 'DELETE',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ cartItemId }),
// //       });
// //       if (!res.ok) throw new Error("Failed to remove item");
      
// //       const data = await res.json();
// //       setCart(data.cart);
// //     } catch {
// //       alert("Could not remove item. Please try again.");
// //     }
// //   };


// //   if (loading) return <p className="text-center mt-5">Loading cart...</p>;
// //   if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

// //   if (!cart || cart.items.length === 0)
// //     return (
// //       <div className="text-center mt-5">
// //         <p>Your cart is empty.</p>
// //         <Link href="/">
// //           <button className="btn btn-primary mt-3">Start Shopping</button>
// //         </Link>
// //       </div>
// //     );

// //   return (
// //     <div className="container my-4">
// //       <h2>Your Cart</h2>
// //       <table className="table table-striped mt-3">
// //         <thead>
// //           <tr>
// //             <th>Product</th>
// //             <th>Image</th>
// //             <th>Quantity</th>
// //             <th>Price (each)</th>
// //             <th>Total</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {cart.items.map((item) => (
// //             <tr key={item.id}>
// //               <td>{item.productName}</td>
// //               <td>
// //                 {item.productImage ? (
// //                   <img
// //                     src={item.productImage}
// //                     alt={item.productName}
// //                     width={50}
// //                     height={50}
// //                     style={{ objectFit: "cover", borderRadius: "4px" }}
// //                   />
// //                 ) : (
// //                   <div
// //                     style={{
// //                       width: 50,
// //                       height: 50,
// //                       backgroundColor: "#eee",
// //                       display: "flex",
// //                       justifyContent: "center",
// //                       alignItems: "center",
// //                       borderRadius: "4px",
// //                       color: "#888",
// //                       fontSize: "0.8rem",
// //                     }}
// //                   >
// //                     No image
// //                   </div>
// //                 )}
// //               </td>
// //               <td>{item.quantity}</td>
// //               <td>{formatter.format(item.price)}</td>
// //               <td>{formatter.format(item.price * item.quantity)}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       <h3 className="mt-4">Total: {formatter.format(cart.totalPrice)}</h3>

// //       <Link href="/">
// //         <button className="btn btn-outline-primary mt-3">Continue Shopping</button>
// //       </Link>
// //     </div>
// //   );
// // }


// "use client";

// import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
// import Link from "next/link";
// import { Trash2 } from 'lucide-react';

// interface CartItem {
//   id: string;
//   productName: string;
//   productImage?: string;
//   quantity: number;
//   price: number;
// }

// interface Cart {
//   id: string;
//   userId: string;
//   items: CartItem[];
//   totalPrice: number;
// }

// export default function CartPage() {
//   const [cart, setCart] = useState<Cart | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const formatter = new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 2,
//   });

//   // --- FIX: Moved fetchCart outside of useEffect and wrapped in useCallback ---
//   const fetchCart = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/cart");
//       if (!res.ok) {
//         if (res.status === 401) {
//           setError("Please login to view your cart.");
//         } else {
//           setError("Failed to load cart. Please try again.");
//         }
//         setCart(null);
//         return; // Return early
//       }
//       const data = await res.json();
//       setCart(data.cart || null);
//     } catch {
//       setError("Network error. Please try again.");
//       setCart(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []); // Empty dependency array means this function is created only once

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]); // Now useEffect depends on the stable fetchCart function
  
//   const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
//     if (newQuantity < 1) return;
    
//     if(cart) {
//         const updatedItems = cart.items.map(item => 
//             item.id === cartItemId ? { ...item, quantity: newQuantity } : item
//         );
//         // Also optimistically update the total price
//         const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//         setCart({ ...cart, items: updatedItems, totalPrice: newTotalPrice });
//     }

//     try {
//       const res = await fetch("/api/cart", {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cartItemId, quantity: newQuantity }),
//       });
//       if (!res.ok) throw new Error("Failed to update quantity");
      
//       const data = await res.json();
//       setCart(data.cart);
//     } catch {
//       alert("Could not update quantity. Please refresh and try again.");
//       fetchCart(); // ✅ Now this works perfectly!
//     }
//   };

//   const handleRemoveItem = async (cartItemId: string) => {
//     if (!confirm("Are you sure you want to remove this item?")) return;

//     try {
//       const res = await fetch("/api/cart", {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cartItemId }),
//       });
//       if (!res.ok) throw new Error("Failed to remove item");
      
//       const data = await res.json();
//       setCart(data.cart);
//     } catch {
//       alert("Could not remove item. Please try again.");
//     }
//   };

//   const handleCodCheckout = async () => {
//     if (!city.trim()) {
//       alert("Please enter your city for delivery.");
//       return;
//     }
//     setIsPlacingOrder(true);
//     try {
//       const res = await fetch('/api/checkout', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ city }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to place order.");
//       }

//       alert("Order placed successfully!");
//       router.push('/orders'); // Redirect to the new orders page

//     } catch (err: any) {
//       alert(`Error: ${err.message}`);
//     } finally {
//       setIsPlacingOrder(false);
//     }
//   };


//   if (loading) return <p className="text-center mt-5">Loading cart...</p>;
//   if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

//   if (!cart || cart.items.length === 0)
//     return (
//       <div className="text-center mt-5">
//         <p>Your cart is empty.</p>
//         <Link href="/">
//           <button className="btn btn-primary mt-3">Start Shopping</button>
//         </Link>
//       </div>
//     );

//   return (
//     <div className="container my-4">
//       <h2>Your Cart</h2>
//       <table className="table table-striped mt-3 align-middle">
//         <thead>
//           <tr>
//             <th>Product</th>
//             <th>Image</th>
//             <th>Quantity</th>
//             <th>Price (each)</th>
//             <th>Total</th>
//             <th>Remove</th>
//           </tr>
//         </thead>
//         <tbody>
//           {cart.items.map((item) => (
//             <tr key={item.id}>
//               <td>{item.productName}</td>
//               <td>
//                 {item.productImage ? (
//                   <img
//                     src={item.productImage}
//                     alt={item.productName}
//                     width={50}
//                     height={50}
//                     style={{ objectFit: "cover", borderRadius: "4px" }}
//                   />
//                 ) : (
//                   <div style={{ width: 50, height: 50, backgroundColor: "#eee", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "4px", color: "#888", fontSize: "0.8rem" }}>
//                     No image
//                   </div>
//                 )}
//               </td>
//               <td>
//                 <div className="input-group" style={{ maxWidth: '120px' }}>
//                   <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
//                   <input type="text" className="form-control text-center" value={item.quantity} readOnly />
//                   <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
//                 </div>
//               </td>
//               <td>{formatter.format(item.price)}</td>
//               <td>{formatter.format(item.price * item.quantity)}</td>
//               <td>
//                 <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(item.id)}>
//                   <Trash2 size={16} />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <h3 className="mt-4">Total: {formatter.format(cart.totalPrice)}</h3>

//       <Link href="/">
//         <button className="btn btn-outline-primary mt-3">Continue Shopping</button>
//       </Link>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from 'lucide-react';

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
  const [city, setCity] = useState(""); // State for the city input
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const router = useRouter();
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

  const fetchCart = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (cart) {
      const updatedItems = cart.items.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      setCart({ ...cart, items: updatedItems, totalPrice: newTotalPrice });
    }

    try {
      const res = await fetch("/api/cart", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      
      const data = await res.json();
      setCart(data.cart);
    } catch {
      alert("Could not update quantity. Please refresh and try again.");
      fetchCart();
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      const res = await fetch("/api/cart", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      
      const data = await res.json();
      setCart(data.cart);
    } catch {
      alert("Could not remove item. Please try again.");
    }
  };

  const handleCodCheckout = async () => {
    if (!city.trim()) {
      alert("Please enter your city for delivery.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      alert("Order placed successfully!");
      router.push('/pages/orders');

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading cart...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  if (!cart || cart.items.length === 0)
    return (
      <div className="text-center mt-5">
        <p>Your cart is empty.</p>
        <Link href="/"><button className="btn btn-primary mt-3">Start Shopping</button></Link>
      </div>
    );

  return (
    <div className="container my-4">
      <h2>Your Cart</h2>
      <table className="table table-striped mt-3 align-middle">
        <thead>
          <tr>
            <th>Product</th>
            <th>Image</th>
            <th>Quantity</th>
            <th>Price (each)</th>
            <th>Total</th>
            <th>Remove</th>
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
                  <div style={{ width: 50, height: 50, backgroundColor: "#eee", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "4px", color: "#888", fontSize: "0.8rem" }}>
                    No image
                  </div>
                )}
              </td>
              <td>
                <div className="input-group" style={{ maxWidth: '120px' }}>
                  <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                  <input type="text" className="form-control text-center" value={item.quantity} readOnly />
                  <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                </div>
              </td>
              <td>{formatter.format(item.price)}</td>
              <td>{formatter.format(item.price * item.quantity)}</td>
              <td>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="row mt-4 justify-content-end">
        <div className="col-md-6">
            <h3>Total: {formatter.format(cart.totalPrice)}</h3>
            <div className="mt-3">
                <label htmlFor="city" className="form-label">Enter City for Delivery</label>
                <input 
                    type="text" 
                    id="city" 
                    className="form-control" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Rajkot"
                />
            </div>
            <div className="d-grid mt-3">
                <button 
                    className="btn btn-lg btn-success" 
                    onClick={handleCodCheckout}
                    disabled={isPlacingOrder}
                >
                    {isPlacingOrder ? "Placing Order..." : "Place Order (Cash on Delivery)"}
                </button>
            </div>
        </div>
      </div>

      <Link href="/"><button className="btn btn-outline-primary mt-3">Continue Shopping</button></Link>
    </div>
  );
}
