'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Eye, Check, X, Image as ImageIcon, MessageSquare, ListTodo, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';
import { useRouter } from 'next/navigation';

enum OrderStatus { PENDING = 'PENDING', SHIPPED = 'SHIPPED', DELIVERED = 'DELIVERED', CANCELLED = 'CANCELLED' }
enum OrderItemStatus { 
    PENDING = 'PENDING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED', 
    CANCELLED = 'CANCELLED' 
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  productImage?: string | null;
  status: OrderItemStatus;
}

interface Order {
  id: string;
  user: { firstName: string | null, email: string };
  totalAmount: number;
  shippingAddress: string | null;
  status: OrderStatus;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function ManageOrdersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/order');
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to fetch orders');
            }
            const data: Order[] = await res.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleToggleDetails = (orderId: string) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    };

    const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const originalOrders = JSON.parse(JSON.stringify(orders));
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        try {
            const res = await fetch('/api/admin/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'UPDATE_ORDER_STATUS', orderId, status: newStatus })
            });
            if (!res.ok) throw new Error("Server rejected the update.");
            await fetchOrders();
        } catch (err) {
            console.error(err);
            setError("Update failed. Reverting changes.");
            setOrders(originalOrders);
        }
    };



     const getDisabledOptions = (currentStatus: OrderStatus): OrderStatus[] => {
         switch (currentStatus) {
             case OrderStatus.SHIPPED: return [OrderStatus.PENDING];
             case OrderStatus.DELIVERED: return [OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.CANCELLED];
             case OrderStatus.CANCELLED: return [OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
             default: return [];
         }
     };

    const getStatusBadgeColors = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-amber-100 text-amber-800';
            case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-800';
            case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

     const getOrderItemBadgeColors = (status: OrderItemStatus) => {
         return 'bg-blue-100 text-blue-800';
     };

    return (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-serif font-bold text-[#1A0A12] mb-8">Order & Return Management</h1>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-[#FBF5EC] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1A0A12] text-white">
                                <th className="p-4 w-12"></th>
                                 <th className="p-4 font-semibold">Status</th>
                                 <th className="p-4 font-semibold">Order ID</th>
                                 <th className="p-4 font-semibold">Customer</th>
                                 <th className="p-4 font-semibold">Date</th>
                                 <th className="p-4 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                 orders.map(order => {
                                     const disabledOptions = getDisabledOptions(order.status);
                                     return (
                                         <Fragment key={order.id}>
                                             <tr className={`transition-colors {''} `}>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        className="text-gray-500 hover:text-[#6B0F1A] transition-colors p-1 rounded-md hover:bg-white" 
                                                        onClick={() => handleToggleDetails(order.id)}
                                                    >
                                                        {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <select 
                                                            className={`border-0 font-semibold text-sm rounded-lg px-2 py-1 pr-8 focus:ring-0 ${getStatusBadgeColors(order.status)}`}
                                                            value={order.status} 
                                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                                            disabled={order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED}
                                                        >
                                                            {Object.values(OrderStatus).map(s => 
                                                                <option key={s} value={s} disabled={disabledOptions.includes(s)}>{s}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-gray-500">{order.id}</td>
                                                <td className="p-4 font-medium text-[#1A0A12]">{order.user.firstName || order.user.email}</td>
                                                <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 font-semibold text-[#6B0F1A]">₹{order.totalAmount.toFixed(2)}</td>
                                                 <td className="p-4 text-center">
                                                     <span className="text-gray-400">—</span>
                                                 </td>
                                            </tr>
                                            {expandedOrderId === order.id && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={7} className="p-6">
                                                        <div className="max-w-4xl">
                                                            <div className="mb-4">
                                                                <h6 className="font-semibold text-[#1A0A12] mb-1">Shipping Address</h6>
                                                                <p className="text-gray-600 text-sm">{order.shippingAddress || 'N/A'}</p>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {order.orderItems.map(item => (
                                                                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                                                                        <img src={item.productImage || 'https://placehold.co/80x80/eee/ccc?text=Img'} alt={item.productName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0"/>
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-[#1A0A12]">{item.productName}</p>
                                                                            <p className="text-sm text-gray-500">Qty: {item.quantity} | ₹{item.price.toFixed(2)}</p>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderItemBadgeColors(item.status)}`}>
                                                                                {item.status.replace(/_/g, ' ')}
                                                                            </span>
                                                                        </div>
                                                                        

                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


