
// app/admin/order/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Type Definitions
interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
}
interface Order {
    id: string;
    user: { firstName: string, email: string };
    totalAmount: number;
    shippingAddress: string;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
}

export default function ManageOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/orders');
                if (!res.ok) throw new Error('Failed to fetch orders');
                const data: Order[] = await res.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
                alert('Could not load orders.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update status");
            
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            alert("Order status updated!");
        } catch (err) {
            console.error(err);
            alert("Could not update order status.");
        }
    };

    if (isLoading) return <p>Loading orders...</p>;

    return (
        <section>
            <h2>Order Management ({orders.length})</h2>
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    {/* ... Table Head from your original code ... */}
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Shipping Address</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td><small>{order.id}</small></td>
                                <td>{order.user.firstName || order.user.email}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>₹{order.totalAmount.toFixed(2)}</td>
                                <td><small>{order.shippingAddress}</small></td>
                                <td>
                                    <select 
                                        className="form-select form-select-sm" 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}