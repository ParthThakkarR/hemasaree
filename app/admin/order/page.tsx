
// // // app/admin/order/page.tsx
// // 'use client';

// // import React, { useState, useEffect } from 'react';

// // // Type Definitions
// // interface OrderItem {
// //     id: string;
// //     productName: string;
// //     quantity: number;
// //     price: number;
// // }
// // interface Order {
// //     id: string;
// //     user: { firstName: string, email: string };
// //     totalAmount: number;
// //     shippingAddress: string;
// //     status: string;
// //     createdAt: string;
// //     orderItems: OrderItem[];
// // }

// // export default function ManageOrdersPage() {
// //     const [orders, setOrders] = useState<Order[]>([]);
// //     const [isLoading, setIsLoading] = useState(true);

// //     useEffect(() => {
// //         const fetchOrders = async () => {
// //             setIsLoading(true);
// //             try {
// //                 const res = await fetch('/api/admin/orders');
// //                 if (!res.ok) throw new Error('Failed to fetch orders');
// //                 const data: Order[] = await res.json();
// //                 setOrders(data);
// //             } catch (err) {
// //                 console.error(err);
// //                 alert('Could not load orders.');
// //             } finally {
// //                 setIsLoading(false);
// //             }
// //         };
// //         fetchOrders();
// //     }, []);

// //     const handleStatusChange = async (orderId: string, newStatus: string) => {
// //         try {
// //             const res = await fetch('/api/admin/orders', {
// //                 method: 'PUT',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({ orderId, status: newStatus })
// //             });
// //             if (!res.ok) throw new Error("Failed to update status");
            
// //             setOrders(prevOrders => 
// //                 prevOrders.map(order => 
// //                     order.id === orderId ? { ...order, status: newStatus } : order
// //                 )
// //             );
// //             alert("Order status updated!");
// //         } catch (err) {
// //             console.error(err);
// //             alert("Could not update order status.");
// //         }
// //     };

// //     if (isLoading) return <p>Loading orders...</p>;

// //     return (
// //         <section>
// //             <h2>Order Management ({orders.length})</h2>
// //             <div className="table-responsive">
// //                 <table className="table table-hover align-middle">
// //                     {/* ... Table Head from your original code ... */}
// //                     <thead>
// //                         <tr>
// //                             <th>Order ID</th>
// //                             <th>Customer</th>
// //                             <th>Date</th>
// //                             <th>Amount</th>
// //                             <th>Shipping Address</th>
// //                             <th>Status</th>
// //                         </tr>
// //                     </thead>
// //                     <tbody>
// //                         {orders.map(order => (
// //                             <tr key={order.id}>
// //                                 <td><small>{order.id}</small></td>
// //                                 <td>{order.user.firstName || order.user.email}</td>
// //                                 <td>{new Date(order.createdAt).toLocaleDateString()}</td>
// //                                 <td>₹{order.totalAmount.toFixed(2)}</td>
// //                                 <td><small>{order.shippingAddress}</small></td>
// //                                 <td>
// //                                     <select 
// //                                         className="form-select form-select-sm" 
// //                                         value={order.status}
// //                                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
// //                                     >
// //                                         <option value="Pending">Pending</option>
// //                                         <option value="Shipped">Shipped</option>
// //                                         <option value="Delivered">Delivered</option>
// //                                         <option value="Cancelled">Cancelled</option>
// //                                     </select>
// //                                 </td>
// //                             </tr>
// //                         ))}
// //                     </tbody>
// //                 </table>
// //             </div>
// //         </section>
// //     );
// // }



// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';

// // --- Fix: Define OrderStatus locally to resolve import error ---
// // This enum must match the one in your `schema.prisma` file.
// enum OrderStatus {
//     PENDING = 'PENDING',
//     SHIPPED = 'SHIPPED',
//     DELIVERED = 'DELIVERED',
//     CANCELLED = 'CANCELLED'
// }

// // --- Type Definitions ---
// interface OrderItem {
//   id: string;
//   productName: string;
//   quantity: number;
//   price: number;
// }
// interface Order {
//   id: string;
//   user: { firstName: string | null; email: string };
//   totalAmount: number;
//   shippingAddress: string | null;
//   status: OrderStatus;
//   createdAt: string;
//   orderItems: OrderItem[];
// }

// // --- Main Page Component ---
// export default function ManageOrdersPage() {
//     const [orders, setOrders] = useState<Order[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [successMessage, setSuccessMessage] = useState('');

//     const fetchOrders = useCallback(async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             const res = await fetch('/api/admin/order');
//             if (!res.ok) {
//                 const errorData = await res.json();
//                 throw new Error(errorData.error || 'Failed to fetch orders');
//             }
//             const data: Order[] = await res.json();
//             setOrders(data);
//         } catch (err: any) {
//             setError(err.message || 'Could not load orders. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchOrders();
//     }, [fetchOrders]);
    
//     // Effect to clear success message after a few seconds
//     useEffect(() => {
//         if (successMessage) {
//             const timer = setTimeout(() => {
//                 setSuccessMessage('');
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [successMessage]);

//     const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
//         const originalOrders = [...orders];
        
//         // Optimistic UI update
//         setOrders(prevOrders =>
//             prevOrders.map(order =>
//                 order.id === orderId ? { ...order, status: newStatus } : order
//             )
//         );

//         try {
//             const res = await fetch('/api/admin/order', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ orderId, status: newStatus })
//             });

//             if (!res.ok) {
//                 throw new Error("Failed to update status on the server");
//             }
            
//             setSuccessMessage("Order status updated successfully!");

//         } catch (err) {
//             console.error(err);
//             setOrders(originalOrders); // Revert on error
//             setError("Could not update order status. Please try again.");
//         }
//     };
    
//     const getStatusBadgeClass = (status: OrderStatus) => {
//         switch (status) {
//             case 'PENDING': return 'text-bg-warning';
//             case 'SHIPPED': return 'text-bg-info';
//             case 'DELIVERED': return 'text-bg-success';
//             case 'CANCELLED': return 'text-bg-danger';
//             default: return 'text-bg-secondary';
//         }
//     };

//     return (
//         <section className="container my-4">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h1 className="h2">Order Management</h1>
//                 <button onClick={fetchOrders} disabled={isLoading} className="btn btn-primary">
//                     {isLoading ? (
//                         <>
//                             <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                             <span className="ms-1">Refreshing...</span>
//                         </>
//                     ) : 'Refresh'}
//                 </button>
//             </div>
            
//             {error && <div className="alert alert-danger" role="alert">{error}</div>}
//             {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

//             <div className="card shadow-sm">
//                 <div className="card-body">
//                      <div className="table-responsive">
//                         <table className="table table-hover align-middle">
//                             <thead className="table-light">
//                                 <tr>
//                                     <th>Order ID</th>
//                                     <th>Customer</th>
//                                     <th>Date</th>
//                                     <th>Amount</th>
//                                     <th>Shipping Address</th>
//                                     <th>Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {isLoading ? (
//                                     <tr>
//                                         <td colSpan={6} className="text-center p-5">
//                                             <div className="spinner-border text-primary" role="status">
//                                                 <span className="visually-hidden">Loading...</span>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ) : orders.length > 0 ? (
//                                     orders.map(order => (
//                                         <tr key={order.id}>
//                                             <td title={order.id}><small className="font-monospace">{order.id.substring(0, 8)}...</small></td>
//                                             <td>{order.user.firstName || order.user.email}</td>
//                                             <td>{new Date(order.createdAt).toLocaleDateString()}</td>
//                                             <td>₹{order.totalAmount.toFixed(2)}</td>
//                                             <td title={order.shippingAddress || 'N/A'}><small>{order.shippingAddress || 'Not Provided'}</small></td>
//                                             <td>
//                                                 <select
//                                                     value={order.status}
//                                                     onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
//                                                     className={`form-select form-select-sm ${getStatusBadgeClass(order.status)}`}
//                                                 >
//                                                     {Object.values(OrderStatus).map(status => (
//                                                         <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>
//                                                     ))}
//                                                 </select>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={6} className="text-center p-5 text-muted">
//                                             No orders found.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }






'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Eye, Check, X, Image as ImageIcon, MessageSquare, ListTodo, ChevronDown, ChevronUp } from 'lucide-react';

// --- Type Definitions to match the final schema ---
enum OrderStatus { PENDING = 'PENDING', SHIPPED = 'SHIPPED', DELIVERED = 'DELIVERED', CANCELLED = 'CANCELLED' }
enum OrderItemStatus { 
    PENDING = 'PENDING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED', 
    RETURN_REQUESTED = 'RETURN_REQUESTED', 
    RETURN_APPROVED = 'RETURN_APPROVED',
    RETURN_DECLINED = 'RETURN_DECLINED',
    RETURNED = 'RETURNED', 
    CANCELLED = 'CANCELLED' 
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  productImage?: string | null;
  status: OrderItemStatus;
  returnReason?: string | null;
  returnNotes?: string | null;
  returnImage?: string | null;
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

// --- Main Page Component ---
export default function ManageOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

    // --- UPDATED LOGIC with Optimistic Updates ---
    const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const originalOrders = JSON.parse(JSON.stringify(orders));

        // 1. Optimistically update the UI for an instant response
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        // 2. Send the update to the server
        try {
            const res = await fetch('/api/admin/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'UPDATE_ORDER_STATUS', orderId, status: newStatus })
            });
            if (!res.ok) throw new Error("Server rejected the update.");
            
            // Re-fetch to ensure data is perfectly in sync with the database
            await fetchOrders();
        } catch (err) {
            console.error(err);
            setError("Update failed. Reverting changes.");
            // 3. Rollback the UI change if the API call fails
            setOrders(originalOrders);
        }
    };

    const handleReturnStatusChange = async (itemId: string, newStatus: OrderItemStatus) => {
        const originalOrders = JSON.parse(JSON.stringify(orders));

        // 1. Optimistic UI update for the item
        setOrders(prevOrders =>
            prevOrders.map(order => ({
                ...order,
                orderItems: order.orderItems.map(item =>
                    item.id === itemId ? { ...item, status: newStatus } : item
                )
            }))
        );

        // 2. Send the update to the server
        try {
            const res = await fetch('/api/admin/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'UPDATE_RETURN_STATUS', orderItemId: itemId, newStatus })
            });
            if (!res.ok) throw new Error("Server rejected the update.");
            
            // Re-fetch to get latest state after successful update
            await fetchOrders();
        } catch (err) {
            console.error(err);
            setError("Update failed. Reverting changes.");
            // 3. Rollback on failure
            setOrders(originalOrders);
        }
    };

    const hasPendingReturn = (order: Order) => order.orderItems.some(item => item.status === 'RETURN_REQUESTED');

    const getDisabledOptions = (currentStatus: OrderStatus): OrderStatus[] => {
        switch (currentStatus) {
            case OrderStatus.SHIPPED:
                return [OrderStatus.PENDING];
            case OrderStatus.DELIVERED:
                return [OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.CANCELLED];
            case OrderStatus.CANCELLED:
                return [OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
            default:
                return [];
        }
    };

    return (
        <section className="container-fluid my-4">
            <h1 className="h2 mb-4">Order & Return Management</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{width: '5%'}}></th>
                                    <th>Status</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th className="text-center">Return Requests</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={7} className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
                                ) : (
                                    orders.map(order => {
                                        const disabledOptions = getDisabledOptions(order.status);
                                        return (
                                            <Fragment key={order.id}>
                                                <tr className={hasPendingReturn(order) ? 'table-warning' : ''}>
                                                    <td><button className="btn btn-sm btn-light" onClick={() => handleToggleDetails(order.id)}>{expandedOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></td>
                                                    <td style={{minWidth: '150px'}}>
                                                        <select 
                                                            className="form-select form-select-sm" 
                                                            value={order.status} 
                                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                                            disabled={order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED}
                                                        >
                                                            {Object.values(OrderStatus).map(s => 
                                                                <option 
                                                                    key={s} 
                                                                    value={s}
                                                                    disabled={disabledOptions.includes(s)}
                                                                >
                                                                    {s}
                                                                </option>
                                                            )}
                                                        </select>
                                                    </td>
                                                    <td><small className="font-monospace">{order.id}</small></td>
                                                    <td>{order.user.firstName || order.user.email}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td>₹{order.totalAmount.toFixed(2)}</td>
                                                    <td className="text-center">{hasPendingReturn(order) ? (<span className="badge rounded-pill text-bg-warning">Pending</span>) : (<span className="text-muted small">—</span>)}</td>
                                                </tr>
                                                {expandedOrderId === order.id && (
                                                    <tr>
                                                        <td colSpan={7} className="p-3 bg-light">
                                                            <div className="p-2">
                                                                <h6 className="mb-3">Order Details for <span className="font-monospace small">{order.id}</span></h6>
                                                                <p><strong>Shipping Address:</strong> {order.shippingAddress || 'N/A'}</p>
                                                                {order.orderItems.map(item => (
                                                                    <div key={item.id} className="card mb-2">
                                                                        <div className="card-body">
                                                                            <div className="row align-items-center">
                                                                                <div className="col-1"><img src={item.productImage || 'https://placehold.co/80x80/eee/ccc?text=Img'} alt={item.productName} className="img-fluid rounded"/></div>
                                                                                <div className="col-md-4"><p className="fw-bold mb-1">{item.productName}</p><p className="small text-muted mb-0">Qty: {item.quantity} | Price: ₹{item.price.toFixed(2)}</p></div>
                                                                                <div className="col-md-7 text-md-end"><span className={`badge text-bg-${item.status === 'RETURN_REQUESTED' ? 'warning' : 'info'}`}>{item.status.replace(/_/g, ' ')}</span></div>
                                                                            </div>
                                                                            {item.status === 'RETURN_REQUESTED' && (
                                                                                <div className="mt-3 p-3 bg-white rounded-2 border">
                                                                                    <h6 className="small text-uppercase fw-bold text-muted">Return Request Details</h6>
                                                                                    <p className="mb-1"><ListTodo size={14} className="me-2"/><strong>Reason:</strong> {item.returnReason}</p>
                                                                                    {item.returnNotes && <p className="mb-1"><MessageSquare size={14} className="me-2"/><strong>Notes:</strong> {item.returnNotes}</p>}
                                                                                    {item.returnImage && (<p className="mb-2"><ImageIcon size={14} className="me-2"/><strong>Image:</strong> <a href={item.returnImage} target="_blank" rel="noopener noreferrer">View Evidence</a></p>)}
                                                                                    <div className="d-flex gap-2 mt-2">
                                                                                        <button className="btn btn-sm btn-success" onClick={() => handleReturnStatusChange(item.id, OrderItemStatus.RETURN_APPROVED)}><Check size={16} className="me-1"/> Approve Return</button>
                                                                                        <button className="btn btn-sm btn-danger" onClick={() => handleReturnStatusChange(item.id, OrderItemStatus.RETURN_DECLINED)}><X size={16} className="me-1"/> Decline Return</button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

