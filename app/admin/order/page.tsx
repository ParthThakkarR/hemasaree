'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Check, X, ImageIcon, MessageSquare, ListTodo, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

enum OrderStatus { PENDING = 'PENDING', SHIPPED = 'SHIPPED', DELIVERED = 'DELIVERED', CANCELLED = 'CANCELLED' }
enum OrderItemStatus {
  PENDING = 'PENDING', SHIPPED = 'SHIPPED', DELIVERED = 'DELIVERED',
  RETURN_REQUESTED = 'RETURN_REQUESTED', RETURN_APPROVED = 'RETURN_APPROVED',
  RETURN_DECLINED = 'RETURN_DECLINED', RETURNED = 'RETURNED', CANCELLED = 'CANCELLED'
}

interface OrderItem {
  id: string; productName: string; quantity: number; price: number;
  productImage?: string | null; status: OrderItemStatus;
  returnReason?: string | null; returnNotes?: string | null; returnImage?: string | null;
}
interface Order {
  id: string; user: { firstName: string | null; email: string };
  totalAmount: number; shippingAddress: string | null; status: OrderStatus;
  createdAt: string; orderItems: OrderItem[];
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/order');
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to fetch orders'); }
      setOrders(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const prev = structuredClone(orders);
    setOrders(o => o.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    try {
      const res = await fetch('/api/admin/order', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_ORDER_STATUS', orderId, status: newStatus })
      });
      if (!res.ok) throw new Error('Server rejected the update.');
      setSuccess('Order status updated!');
      await fetchOrders();
    } catch { setError('Update failed. Reverting.'); setOrders(prev); }
  };

  const handleReturnStatusChange = async (itemId: string, newStatus: OrderItemStatus) => {
    const prev = structuredClone(orders);
    setOrders(o => o.map(order => ({
      ...order, orderItems: order.orderItems.map(item => item.id === itemId ? { ...item, status: newStatus } : item)
    })));
    try {
      const res = await fetch('/api/admin/order', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_RETURN_STATUS', orderItemId: itemId, newStatus })
      });
      if (!res.ok) throw new Error('Server rejected the update.');
      setSuccess('Return status updated!');
      await fetchOrders();
    } catch { setError('Update failed. Reverting.'); setOrders(prev); }
  };

  const hasPendingReturn = (order: Order) => order.orderItems.some(i => i.status === 'RETURN_REQUESTED');

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = { PENDING: 'warning', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'danger', RETURN_REQUESTED: 'warning', RETURN_APPROVED: 'primary', RETURN_DECLINED: 'danger', RETURNED: 'secondary' };
    return map[status] || 'secondary';
  };

  const isTerminalStatus = (s: OrderStatus) => s === OrderStatus.DELIVERED || s === OrderStatus.CANCELLED;

  return (
    <>
      <style jsx>{`
        .admin-header { background: linear-gradient(135deg, #1e293b, #334155); color: white; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; }
        .order-card { background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
        .order-row { transition: background 0.15s; }
        .order-row:hover { background: #fafbfc; }
        .return-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 1rem; margin-top: 0.75rem; }
        .item-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
        .item-placeholder { width: 56px; height: 56px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
      `}</style>

      <div className="container-fluid py-4 px-md-4">
        <div className="admin-header d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Order & Return Management</h1>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.88rem' }}>{orders.length} total orders</p>
          </div>
          <button className="btn btn-light btn-sm d-flex align-items-center gap-2" style={{ borderRadius: 10 }} onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {error && <div className="alert alert-danger alert-dismissible">{error}<button type="button" className="btn-close" onClick={() => setError(null)} /></div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="order-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Status</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th className="text-center">Returns</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-5"><div className="spinner-border" style={{ color: '#e76f51' }} /></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5 text-muted">No orders found.</td></tr>
                ) : (
                  orders.map(order => (
                    <Fragment key={order.id}>
                      <tr className={`order-row ${hasPendingReturn(order) ? 'table-warning' : ''}`}>
                        <td>
                          <button className="btn btn-sm btn-light" style={{ borderRadius: 8 }} onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                            {expandedOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <select className="form-select form-select-sm" style={{ borderRadius: 8 }} value={order.status}
                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                            disabled={isTerminalStatus(order.status)}>
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                          </select>
                        </td>
                        <td><small className="font-monospace text-muted">{order.id.slice(0, 10)}{'\u2026'}</small></td>
                        <td className="fw-medium">{order.user.firstName || order.user.email}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="fw-bold">{'\u20B9'}{order.totalAmount.toFixed(2)}</td>
                        <td className="text-center">
                          {hasPendingReturn(order) ? <span className="badge text-bg-warning">Pending</span> : <span className="text-muted">{'\u2014'}</span>}
                        </td>
                      </tr>
                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan={7} style={{ background: '#fafbfc', padding: '1rem 1.5rem' }}>
                            <p className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}><strong>Shipping:</strong> {order.shippingAddress || 'N/A'}</p>
                            {order.orderItems.map(item => (
                              <div key={item.id} className="d-flex align-items-start gap-3 p-3 bg-white rounded-3 border mb-2">
                                {item.productImage ? (
                                  <img src={item.productImage} alt={item.productName} className="item-img" />
                                ) : (
                                  <div className="item-placeholder"><ImageIcon size={20} /></div>
                                )}
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <div className="fw-medium">{item.productName}</div>
                                      <div className="text-muted" style={{ fontSize: '0.82rem' }}>Qty: {item.quantity} &middot; {'\u20B9'}{item.price.toFixed(2)}</div>
                                    </div>
                                    <span className={`badge text-bg-${getStatusBadge(item.status)}`}>{item.status.replace(/_/g, ' ')}</span>
                                  </div>
                                  {item.status === 'RETURN_REQUESTED' && (
                                    <div className="return-box">
                                      <h6 className="small text-uppercase fw-bold text-muted mb-2">Return Request</h6>
                                      <p className="mb-1 small"><ListTodo size={13} className="me-1" /><strong>Reason:</strong> {item.returnReason}</p>
                                      {item.returnNotes && <p className="mb-1 small"><MessageSquare size={13} className="me-1" /><strong>Notes:</strong> {item.returnNotes}</p>}
                                      {item.returnImage && <p className="mb-2 small"><ImageIcon size={13} className="me-1" /><a href={item.returnImage} target="_blank" rel="noopener noreferrer">View Evidence</a></p>}
                                      <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-success d-flex align-items-center gap-1" style={{ borderRadius: 8 }} onClick={() => handleReturnStatusChange(item.id, OrderItemStatus.RETURN_APPROVED)}><Check size={15} /> Approve</button>
                                        <button className="btn btn-sm btn-danger d-flex align-items-center gap-1" style={{ borderRadius: 8 }} onClick={() => handleReturnStatusChange(item.id, OrderItemStatus.RETURN_DECLINED)}><X size={15} /> Decline</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
