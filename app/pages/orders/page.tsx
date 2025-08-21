// 'use client';

// import React, { useEffect, useState, useCallback } from "react";
// import Link from "next/link";

// // Define interfaces for better type safety
// interface OrderItem {
//     id: string;
//     productName: string;
//     quantity: number;
//     price: number;
// }

// interface Order {
//     id: string;
//     totalAmount: number;
//     deliveryCharge: number;
//     status: string;
//     createdAt: string;
//     items: OrderItem[];
// }

// export default function OrdersPage() {
//     const [orders, setOrders] = useState<Order[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const formatter = new Intl.NumberFormat("en-IN", {
//         style: "currency",
//         currency: "INR",
//     });

//     useEffect(() => {
//         async function fetchOrders() {
//             try {
//                 const res = await fetch('/api/orders');
//                 if (!res.ok) {
//                     if (res.status === 401) throw new Error("Please log in to view your orders.");
//                     throw new Error("Failed to fetch orders.");
//                 }
//                 const data = await res.json();
//                 setOrders(data.orders || []);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchOrders();
//     }, []);

//     if (loading) return <p className="text-center mt-5">Loading your orders...</p>;
//     if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

//     return (
//         <div className="container my-4">
//             <h2>My Orders</h2>
//             {orders.length === 0 ? (
//                 <div className="text-center mt-5">
//                     <p>You haven't placed any orders yet.</p>
//                     <Link href="/"><button className="btn btn-primary mt-3">Start Shopping</button></Link>
//                 </div>
//             ) : (
//                 <div className="accordion mt-3" id="ordersAccordion">
//                     {orders.map((order) => (
//                         <div className="accordion-item" key={order.id}>
//                             <h2 className="accordion-header" id={`heading-${order.id}`}>
//                                 <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${order.id}`}>
//                                     <div className="d-flex justify-content-between w-100 me-3">
//                                         <span>Order ID: {order.id.slice(-8)}</span>
//                                         <strong>{formatter.format(order.totalAmount)}</strong>
//                                         <span className={`badge bg-${order.status === 'Pending' ? 'warning text-dark' : 'success'}`}>{order.status}</span>
//                                         <span>{new Date(order.createdAt).toLocaleDateString()}</span>
//                                     </div>
//                                 </button>
//                             </h2>
//                             <div id={`collapse-${order.id}`} className="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
//                                 <div className="accordion-body">
//                                     <ul className="list-group">
//                                         {order.items.map(item => (
//                                             <li key={item.id} className="list-group-item d-flex justify-content-between">
//                                                 <span>{item.productName} (x{item.quantity})</span>
//                                                 <span>{formatter.format(item.price * item.quantity)}</span>
//                                             </li>
//                                         ))}
//                                         <li className="list-group-item d-flex justify-content-between">
//                                             <span>Delivery Charge</span>
//                                             <span>{formatter.format(order.deliveryCharge)}</span>
//                                         </li>
//                                     </ul>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders");
        console.log("API response:", res.data);

        if (Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading orders...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No orders found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <p className="font-semibold">Order ID: {order.id}</p>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.totalAmount}</p>
            <p className="text-gray-500 text-sm">
              Ordered on: {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-4 space-y-2">
              <h2 className="font-semibold">Items:</h2>
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <div>
                    <p>{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
