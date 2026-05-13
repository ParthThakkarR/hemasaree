'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Package, CheckCircle, XCircle, FileText, ShoppingBag, AlertCircle, Undo2 } from 'lucide-react';

// --- Type Definitions ---
enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

enum OrderItemStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURN_APPROVED = 'RETURN_APPROVED',
  RETURN_DECLINED = 'RETURN_DECLINED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  isReturnable: boolean;
  status: OrderItemStatus;
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

// --- Main Page Component ---
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders");
        const sortedOrders = (res.data.orders || []).sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } catch (err: any) {
        console.error("❌ Error fetching orders:", err);
        if (err.response?.status === 401) {
          router.push("/login?callbackUrl=/orders");
          return;
        }
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this entire order? This action cannot be undone.")) return;

    const originalOrders = [...orders];
    setOrders(prevOrders =>
      prevOrders.map(o => o.id === orderId ? { ...o, status: OrderStatus.CANCELLED } : o)
    );

    try {
      await axios.post(`/api/orders/${orderId}/cancel`);
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("Could not cancel the order. It may have already been processed by the seller.");
      setOrders(originalOrders);
    }
  };

  if (loading) return <OrdersPageSkeleton />;
  if (error) return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h5 className="font-semibold text-base">An error occurred</h5>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
  if (orders.length === 0) return <EmptyState />;

  return (
    <div className="bg-surface-muted min-h-screen py-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-brand-700 mb-8">My Orders</h1>
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onCancelOrder={handleCancelOrder} />
          ))}
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components ---

const OrderStatusTracker = ({ status }: { status: OrderStatus }) => {
  const steps = [
    { name: "Ordered", status: OrderStatus.PENDING },
    { name: "Shipped", status: OrderStatus.SHIPPED },
    { name: "Delivered", status: OrderStatus.DELIVERED },
  ];

  const getStepStatus = (stepStatus: OrderStatus) => {
    if (status === OrderStatus.CANCELLED) return "cancelled";
    const currentIndex = steps.findIndex(s => s.status === status);
    const stepIndex = steps.findIndex(s => s.status === stepStatus);
    return stepIndex <= currentIndex ? "completed" : "upcoming";
  };

  if (status === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-xl">
        <XCircle className="w-5 h-5 mr-3" /> 
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center relative w-full px-4 sm:px-12">
      {/* Background line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-100 rounded-full z-0"></div>
      
      {steps.map((step, idx) => {
        const state = getStepStatus(step.status);
        const isCompleted = state === "completed";
        return (
          <div key={step.name} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'bg-brand-500 text-white shadow-md' : 'bg-surface-muted text-ink-faint border border-brand-100'}`}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-medium ${isCompleted ? 'text-brand-700' : 'text-ink-muted'}`}>{step.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order, onCancelOrder }: { order: Order, onCancelOrder: (id: string) => void }) => (
  <div className="premium-card">
    <div className="bg-brand-50 border-b border-brand-100 p-5 flex flex-wrap justify-between items-center gap-4">
      <div className="flex flex-wrap gap-6 sm:gap-10">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Order ID</p>
          <p className="text-sm text-ink-muted font-mono">{order.id}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Date Placed</p>
          <p className="text-sm text-ink-muted">{new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-sm font-bold text-ink">₹{order.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      <Link href={`/orders/${order.id}/invoice`} className="outline-btn text-sm py-2 px-4 flex items-center gap-2 rounded-lg">
        <FileText className="w-4 h-4" /> View Invoice
      </Link>
    </div>

    <div className="p-6">
      <div className="mb-8 overflow-hidden rounded-xl bg-white">
        <OrderStatusTracker status={order.status} />
      </div>
      
      <div className="space-y-4">
        {order.orderItems.map(item => (
          <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-brand-50 hover:bg-brand-50/50 transition-colors">
            <img src={item.productImage || `https://placehold.co/100x100/e9ecef/6c757d?text=${item.productName.charAt(0)}`}
              alt={item.productName}
              className="w-20 h-20 rounded-lg object-cover shadow-sm flex-shrink-0"
            />
            <div className="flex-grow">
              <h4 className="font-semibold text-ink text-base mb-1">{item.productName}</h4>
              <p className="text-sm text-ink-muted mb-1">Qty: {item.quantity} &nbsp;&bull;&nbsp; ₹{item.price.toFixed(2)} each</p>
              <Link href={`/product/${item.productId}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
                View Product 
              </Link>
            </div>
            <div className="sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end">
              <p className="font-bold text-ink text-lg mb-2">₹{(item.price * item.quantity).toFixed(2)}</p>

              {order.status === 'DELIVERED' && item.isReturnable && item.status === 'DELIVERED' && (
                <Link href={`/orders/${order.id}/return/${item.id}`} className="outline-btn py-1.5 px-3 text-xs flex items-center gap-1 rounded-md">
                  <Undo2 className="w-3 h-3" /> Return Item
                </Link>
              )}

              {item.status === 'RETURN_REQUESTED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Return Requested</span>}
              {item.status === 'RETURN_APPROVED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Return Approved</span>}
              {item.status === 'RETURN_DECLINED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Return Declined</span>}
              {item.status === 'RETURNED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Returned</span>}
            </div>
          </div>
        ))}
      </div>
    </div>

    {order.status === OrderStatus.PENDING && (
      <div className="bg-surface-muted p-4 border-t border-brand-100 flex justify-end">
        <button 
          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2" 
          onClick={() => onCancelOrder(order.id)}
        >
          <XCircle className="w-4 h-4" /> Cancel Order
        </button>
      </div>
    )}
  </div>
);

const OrdersPageSkeleton = () => (
  <div className="bg-surface-muted min-h-screen py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="skeleton w-48 h-10 mb-8"></div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="premium-card">
          <div className="bg-brand-50 p-5 flex justify-between">
            <div className="skeleton w-24 h-4"></div>
            <div className="skeleton w-32 h-4"></div>
            <div className="skeleton w-20 h-4"></div>
          </div>
          <div className="p-6">
            <div className="skeleton w-full h-12 mb-8 rounded-full"></div>
            <div className="flex gap-4 p-4 border border-brand-50 rounded-xl">
              <div className="skeleton w-20 h-20 rounded-lg"></div>
              <div className="flex-grow space-y-2">
                <div className="skeleton w-48 h-5"></div>
                <div className="skeleton w-32 h-4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-surface-muted min-h-screen py-16 px-4">
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-brand-sm border border-brand-100 p-12 text-center">
      <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-10 h-10 text-brand-500" />
      </div>
      <h3 className="text-2xl font-serif font-bold text-ink mb-3">No Orders Yet</h3>
      <p className="text-ink-muted mb-8">You haven&apos;t placed any orders yet. Once you do, you&apos;ll be able to track them here.</p>
      <Link href="/" className="premium-btn inline-block">
        Start Shopping
      </Link>
    </div>
  </div>
);

