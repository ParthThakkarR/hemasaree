
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
