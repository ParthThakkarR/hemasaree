// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import axios from 'axios';
// import { Package, CheckCircle, XCircle, FileText, ShoppingBag, AlertCircle, Truck, Undo2 } from 'lucide-react';

// // --- Type Definitions ---
// enum OrderStatus {
//     PENDING = 'PENDING',
//     SHIPPED = 'SHIPPED',
//     DELIVERED = 'DELIVERED',
//     CANCELLED = 'CANCELLED'
// }

// enum OrderItemStatus {
//     DELIVERED = 'DELIVERED',
//     RETURN_REQUESTED = 'RETURN_REQUESTED',
//     RETURN_APPROVED = 'RETURN_APPROVED',
//     RETURNED = 'RETURNED',
// }

// interface OrderItem {
//   id: string;
//   productId: string;
//   productName: string;
//   productImage?: string;
//   price: number;
//   quantity: number;
//   isReturnable: boolean; 
//   status: OrderItemStatus; 
// }

// interface Order {
//   id: string;
//   status: OrderStatus;
//   totalAmount: number;
//   createdAt: string;
//   orderItems: OrderItem[];
// }

// // --- Main Page Component ---
// export default function OrdersPage() {
//     const [orders, setOrders] = useState<Order[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchOrders = async () => {
//             try {
//                 const res = await axios.get("/api/orders");
//                 setOrders(res.data.orders || []);
//             } catch (err: any) {
//                 console.error("Error fetching orders:", err);
//                 setError("Failed to load your orders. Please try again later.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOrders();
//     }, []);

//     if (loading) return <OrdersPageSkeleton />;
//     if (error) return (
//         <div className="container my-5">
//             <div className="alert alert-danger d-flex align-items-center" role="alert">
//                 <AlertCircle className="me-2" />
//                 <div><h5 className="alert-heading h6">An error occurred</h5>{error}</div>
//             </div>
//         </div>
//     );
//     if (orders.length === 0) return <EmptyState />;

//     return (
//         <div className="bg-body-tertiary">
//             <main className="container py-5">
//                 <div style={{ maxWidth: '800px', margin: '0 auto' }}>
//                     <h1 className="h2 fw-bold text-dark mb-4">My Orders</h1>
//                     <div>
//                         {orders.map((order) => (
//                             <OrderCard key={order.id} order={order} />
//                         ))}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

// // --- Sub-Components ---
// const OrderStatusTracker = ({ status }: { status: OrderStatus }) => {
//     const steps = [ { name: 'Ordered', status: OrderStatus.PENDING }, { name: 'Shipped', status: OrderStatus.SHIPPED }, { name: 'Delivered', status: OrderStatus.DELIVERED }];
//     const getStepStatus = (stepStatus: OrderStatus) => {
//         if (status === OrderStatus.CANCELLED) return 'cancelled';
//         const currentIndex = steps.findIndex(s => s.status === status);
//         const stepIndex = steps.findIndex(s => s.status === stepStatus);
//         return stepIndex <= currentIndex ? 'completed' : 'upcoming';
//     };
//     if (status === OrderStatus.CANCELLED) return <div className="d-flex align-items-center p-3 bg-danger-subtle text-danger-emphasis rounded-3"><XCircle className="h-6 w-6 me-3" /><p className="fw-semibold mb-0">Order Cancelled</p></div>;
//     return (
//         <div className="d-flex justify-content-between align-items-center">
//             {steps.map((step, stepIdx) => {
//                 const state = getStepStatus(step.status);
//                 const isCompleted = state === 'completed';
//                 return (
//                     <React.Fragment key={step.name}>
//                         <div className={`d-flex align-items-center p-2 rounded-2 ${isCompleted ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
//                             {isCompleted ? <CheckCircle size={20} className="me-2" /> : <Package size={20} className="me-2" />}
//                             <span className="small fw-medium">{step.name}</span>
//                         </div>
//                         {stepIdx < steps.length - 1 && <div className="flex-grow-1 mx-2"><div className="progress" style={{ height: '4px' }}><div className={`progress-bar ${isCompleted ? 'bg-primary' : 'bg-light'}`} role="progressbar" style={{ width: '100%' }}></div></div></div>}
//                     </React.Fragment>
//                 );
//             })}
//         </div>
//     );
// };

// const OrderCard = ({ order }: { order: Order }) => (
//     <div className="card shadow-sm border-0 mb-4">
//         <div className="card-header bg-light-subtle p-3">
//             <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
//                 <div>
//                     <p className="small fw-semibold text-primary mb-0">Order ID</p>
//                     <p className="small text-muted font-monospace mb-0">{order.id}</p>
//                 </div>
//                 <div>
//                     <p className="small text-muted mb-0">Date Placed</p>
//                     <p className="small text-body-secondary mb-0">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
//                 </div>
//                 <div>
//                     <p className="small text-muted mb-0">Total Amount</p>
//                     <p className="fw-bold text-dark mb-0">₹{order.totalAmount.toFixed(2)}</p>
//                 </div>
//                 <Link href={`/orders/${order.id}/invoice`} className="btn btn-sm btn-outline-primary d-flex align-items-center">
//                     <FileText size={16} className="me-1" /> View Invoice
//                 </Link>
//             </div>
//         </div>
//         <div className="card-body p-4">
//             <div className="mb-4">
//                 <OrderStatusTracker status={order.status} />
//             </div>
//             <div className="list-group list-group-flush">
//                 {order.orderItems.map(item => (
//                     <div className="list-group-item px-0" key={item.id}>
//                         <div className="d-flex align-items-start py-3">
//                             <img src={item.productImage || `https://placehold.co/100x100/e9ecef/6c757d?text=${item.productName.charAt(0)}`} alt={item.productName} className="rounded-2 me-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
//                             <div className="flex-grow-1">
//                                 <h4 className="fw-semibold text-dark mb-1" style={{ fontSize: '1rem' }}>{item.productName}</h4>
//                                 <p className="small text-muted mb-1">Qty: {item.quantity}</p>
//                                 <p className="small text-muted mb-0">Price: ₹{item.price.toFixed(2)}</p>
//                                 <Link href={`/product/${item.productId}`} className="btn btn-sm btn-link text-decoration-none p-0 mt-1">View Product</Link>
//                             </div>
//                             <div className="text-end" style={{minWidth: '130px'}}>
//                                 <p className="fw-semibold text-dark mb-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                                
//                                 {order.status === 'DELIVERED' && item.isReturnable && (
//                                     <>
//                                         {item.status === 'DELIVERED' && (
//                                             <Link href={`/orders/${order.id}/return/${item.id}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center">
//                                                 <Undo2 size={14} className="me-1"/> Return Item
//                                             </Link>
//                                         )}
//                                         {item.status === 'RETURN_REQUESTED' && (
//                                             <span className="badge bg-info-subtle text-info-emphasis">Return Requested</span>
//                                         )}
//                                         {item.status === 'RETURN_APPROVED' && (
//                                              <span className="badge bg-success-subtle text-success-emphasis">Return Approved</span>
//                                         )}
//                                          {item.status === 'RETURNED' && (
//                                              <span className="badge bg-secondary">Returned</span>
//                                         )}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     </div>
// );

// const OrdersPageSkeleton = () => (
//     <div className="placeholder-glow">
//         {[...Array(2)].map((_, i) => (
//             <div key={i} className="card shadow-sm border-0 mb-4">
//                 <div className="card-header bg-light-subtle p-3"><div className="d-flex justify-content-between"><span className="placeholder col-3"></span><span className="placeholder col-4"></span><span className="placeholder col-2"></span></div></div>
//                 <div className="card-body p-4">
//                     <span className="placeholder col-12" style={{height: '40px'}}></span><hr/>
//                     <div className="d-flex align-items-start py-3">
//                         <div className="placeholder rounded-2 me-3" style={{width: '80px', height: '80px'}}></div>
//                         <div className="flex-grow-1"><span className="placeholder col-7"></span><span className="placeholder col-4"></span></div>
//                     </div>
//                 </div>
//             </div>
//         ))}
//     </div>
// );

// const EmptyState = () => (
//     <div className="text-center py-5 px-3 bg-white rounded-3 shadow-sm">
//         <ShoppingBag className="mx-auto h-12 w-12 text-muted" size={48} />
//         <h3 className="mt-3 h5 text-body-emphasis">No Orders Yet</h3>
//         <p className="mt-2 text-muted">You haven't placed any orders with us. When you do, they'll show up here.</p>
//         <div className="mt-4">
//             <Link href="/" className="btn btn-primary">Start Shopping</Link>
//         </div>
//     </div>
// );




'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
    <div className="container my-5">
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <AlertCircle className="me-2" />
        <div>
          <h5 className="alert-heading h6">An error occurred</h5>
          {error}
        </div>
      </div>
    </div>
  );
  if (orders.length === 0) return <EmptyState />;

  return (
    <div className="bg-body-tertiary">
      <main className="container py-5">
        <div className="mx-auto" style={{ maxWidth: "850px" }}>
          <h1 className="h2 fw-bold text-dark mb-4">My Orders</h1>
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
      <div className="d-flex align-items-center p-3 bg-danger-subtle text-danger-emphasis rounded-3">
        <XCircle className="me-2" /> <span className="fw-semibold mb-0">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-between align-items-center">
      {steps.map((step, idx) => {
        const state = getStepStatus(step.status);
        const isCompleted = state === "completed";
        return (
          <React.Fragment key={step.name}>
            <div className={`d-flex align-items-center p-2 rounded-2 ${isCompleted ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
              {isCompleted ? <CheckCircle size={20} className="me-2" /> : <Package size={20} className="me-2" />}
              <span className="small fw-medium">{step.name}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-grow-1 mx-2">
                <div className="progress" style={{ height: "4px" }}>
                  <div className={`progress-bar ${isCompleted ? 'bg-primary' : 'bg-light'}`} role="progressbar" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order, onCancelOrder }: { order: Order, onCancelOrder: (id: string) => void }) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light-subtle p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div>
        <p className="small fw-semibold text-primary mb-0">Order ID</p>
        <p className="small text-muted font-monospace mb-0">{order.id}</p>
      </div>
      <div>
        <p className="small text-muted mb-0">Date Placed</p>
        <p className="small text-body-secondary mb-0">{new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div>
        <p className="small text-muted mb-0">Total Amount</p>
        <p className="fw-bold text-dark mb-0">₹{order.totalAmount.toFixed(2)}</p>
      </div>
      <Link href={`/orders/${order.id}/invoice`} className="btn btn-sm btn-outline-primary d-flex align-items-center">
        <FileText size={16} className="me-1" /> View Invoice
      </Link>
    </div>

    <div className="card-body p-4">
      <div className="mb-4"><OrderStatusTracker status={order.status} /></div>
      <div className="list-group list-group-flush">
        {order.orderItems.map(item => (
          <div className="list-group-item px-0" key={item.id}>
            <div className="d-flex align-items-start py-3">
              <img src={item.productImage || `https://placehold.co/100x100/e9ecef/6c757d?text=${item.productName.charAt(0)}`}
                alt={item.productName}
                className="rounded-2 me-3"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              <div className="flex-grow-1">
                <h4 className="fw-semibold text-dark mb-1" style={{ fontSize: '1rem' }}>{item.productName}</h4>
                <p className="small text-muted mb-1">Qty: {item.quantity}</p>
                <p className="small text-muted mb-0">Price: ₹{item.price.toFixed(2)}</p>
                <Link href={`/product/${item.productId}`} className="btn btn-sm btn-link p-0 mt-1 text-decoration-none">View Product</Link>
              </div>
              <div className="text-end" style={{ minWidth: '130px' }}>
                <p className="fw-semibold text-dark mb-2">₹{(item.price * item.quantity).toFixed(2)}</p>

                {order.status === 'DELIVERED' && item.isReturnable && item.status === 'DELIVERED' && (
                  <Link href={`/orders/${order.id}/return/${item.id}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center mb-1">
                    <Undo2 size={14} className="me-1" /> Return Item
                  </Link>
                )}

                {item.status === 'RETURN_REQUESTED' && <span className="badge bg-info-subtle text-info-emphasis">Return Requested</span>}
                {item.status === 'RETURN_APPROVED' && <span className="badge bg-success-subtle text-success-emphasis">Return Approved</span>}
                {item.status === 'RETURN_DECLINED' && <span className="badge bg-danger-subtle text-danger-emphasis">Return Declined</span>}
                {item.status === 'RETURNED' && <span className="badge bg-secondary">Returned</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {order.status === OrderStatus.PENDING && (
      <div className="card-footer text-end">
        <button className="btn btn-danger btn-sm" onClick={() => onCancelOrder(order.id)}>
          <XCircle size={16} className="me-1" /> Cancel Order
        </button>
      </div>
    )}
  </div>
);

const OrdersPageSkeleton = () => (
  <div className="placeholder-glow">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light-subtle p-3 d-flex justify-content-between">
          <span className="placeholder col-3"></span>
          <span className="placeholder col-4"></span>
          <span className="placeholder col-2"></span>
        </div>
        <div className="card-body p-4">
          <span className="placeholder col-12" style={{ height: '40px' }}></span>
          <hr />
          <div className="d-flex align-items-start py-3">
            <div className="placeholder rounded-2 me-3" style={{ width: '80px', height: '80px' }}></div>
            <div className="flex-grow-1">
              <span className="placeholder col-7"></span>
              <span className="placeholder col-4"></span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-5 px-3 bg-white rounded-3 shadow-sm">
    <ShoppingBag className="mx-auto text-muted" size={48} />
    <h3 className="mt-3 h5 text-body-emphasis">No Orders Yet</h3>
    <p className="mt-2 text-muted">You haven't placed any orders yet. When you do, they'll show up here.</p>
    <div className="mt-4">
      <Link href="/" className="btn btn-primary">Start Shopping</Link>
    </div>
  </div>
);
