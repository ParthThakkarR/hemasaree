'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, AlertCircle, ChevronLeft, Building2, User, Mail, Calendar, Hash } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

// --- Type Definitions ---
enum OrderStatus {
    PENDING = 'PENDING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

interface UserInfo {
    firstName: string;
    lastName: string | null;
    email: string;
}

interface Order {
  id:string;
  status: OrderStatus;
  totalAmount: number;
  deliveryCharge: number;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: string | null;
  user: UserInfo | null;
}

export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id as string;
    
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchOrderDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await axios.get(`/api/orders/${id}`);
                    setOrder(res.data.order);
                } catch (err: any) {
                    setError(err.response?.data?.error || 'Failed to retrieve order details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrderDetails();
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin mb-4" />
                <p className="text-ink-muted font-medium animate-pulse">Generating your invoice...</p>
            </div>
        );
    }

    if (error) {
        return (
             <div className="min-h-screen bg-surface-muted pt-32 pb-16 px-4">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-ink mb-2">Error Loading Invoice</h2>
                    <p className="text-ink-muted mb-6">{error}</p>
                    <button 
                        onClick={() => router.back()}
                        className="premium-btn w-full py-3 flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-ink-muted mb-4">No order details found.</p>
                    <Link href="/orders" className="text-brand-800 font-bold hover:underline">Back to Orders</Link>
                </div>
            </div>
        )
    }

    const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="min-h-screen bg-surface-muted pt-32 pb-24 px-4 sm:px-6">
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-section, #invoice-section * { visibility: visible; }
                    #invoice-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important; border: none !important; }
                    .no-print { display: none !important; }
                    nav, footer { display: none !important; }
                }
            `}</style>
            
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 no-print">
                    <div>
                        <Link href={`/orders/${order.id}`} className="text-brand-800 font-bold flex items-center gap-1 hover:underline mb-1">
                            <ChevronLeft size={16} /> Back to Order
                        </Link>
                        <h1 className="text-2xl font-serif font-bold text-ink">Invoice Details</h1>
                    </div>
                    <button 
                        onClick={handlePrint} 
                        className="premium-btn px-6 py-2.5 flex items-center gap-2 bg-brand-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        <Printer size={18} /> Print Invoice
                    </button>
                </div>

                {/* Invoice Content */}
                <div id="invoice-section" className="bg-white rounded-3xl shadow-sm border border-surface-subtle overflow-hidden">
                    <div className="p-8 sm:p-12">
                        {/* Company & Invoice Header */}
                        <div className="flex flex-col md:flex-row justify-between gap-12 border-b border-surface-subtle pb-10 mb-10">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-brand-800 rounded-xl flex items-center justify-center text-white">
                                        <Building2 size={24} />
                                    </div>
                                    <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">Hema Sarees</h2>
                                </div>
                                <div className="text-ink-muted text-sm space-y-1">
                                    {/* TODO: Add verified business address */}
                                    <p></p>
                                    {/* TODO: Add verified business email */}
                                    <p className="pt-2 font-medium"></p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <h2 className="text-4xl font-serif font-bold text-brand-800 mb-6 uppercase tracking-widest">Invoice</h2>
                                <div className="space-y-3">
                                    <div className="flex md:justify-end items-center gap-3">
                                        <span className="text-xs font-bold text-ink-faint uppercase tracking-wider">Invoice No</span>
                                        <span className="bg-brand-50 text-brand-800 px-3 py-1 rounded-lg font-mono font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex md:justify-end items-center gap-3">
                                        <span className="text-xs font-bold text-ink-faint uppercase tracking-wider">Date</span>
                                        <span className="font-bold text-ink">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex md:justify-end items-center gap-3">
                                        <span className="text-xs font-bold text-ink-faint uppercase tracking-wider">Status</span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Info */}
                        <div className="grid md:grid-cols-2 gap-12 mb-12">
                            <div className="bg-surface-muted/50 p-6 rounded-2xl border border-surface-subtle">
                                <h3 className="text-xs font-black text-ink-faint uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User size={14} className="text-brand-800" /> Billed To
                                </h3>
                                <div className="space-y-1 text-ink">
                                    <p className="font-bold text-lg">{order.user?.firstName || 'Customer'} {order.user?.lastName || ''}</p>
                                    <div className="flex items-start gap-2 pt-2 text-ink-muted text-sm">
                                        <Mail size={14} className="mt-1 flex-shrink-0" />
                                        <p>{order.user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xs font-black text-ink-faint uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calendar size={14} className="text-brand-800" /> Shipping Address
                                </h3>
                                <p className="text-ink leading-relaxed whitespace-pre-wrap">
                                    {order.shippingAddress || 'Address not provided'}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border border-surface-subtle rounded-2xl overflow-hidden mb-10 shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-surface-muted border-b border-surface-subtle">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-ink-faint uppercase tracking-widest">Item Description</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-ink-faint uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-ink-faint uppercase tracking-widest text-right">Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-ink-faint uppercase tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-subtle">
                                    {order.orderItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-muted/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-ink leading-tight">{item.productName}</p>
                                                <p className="text-[10px] text-ink-faint mt-1 font-mono tracking-tighter">SKU: {item.productId.slice(-6).toUpperCase()}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center font-medium text-ink-muted">{item.quantity}</td>
                                            <td className="px-6 py-5 text-right font-medium text-ink-muted">₹{item.price.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-5 text-right font-bold text-ink">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-surface-muted/20">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-3 text-right text-sm text-ink-muted font-medium">Subtotal</td>
                                        <td className="px-6 py-3 text-right text-sm text-ink font-bold">₹{subtotal.toLocaleString('en-IN')}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-3 text-right text-sm text-ink-muted font-medium">Shipping & Handling</td>
                                        <td className="px-6 py-3 text-right text-sm text-ink font-bold">₹{order.deliveryCharge.toLocaleString('en-IN')}</td>
                                    </tr>
                                    <tr className="bg-brand-50/50">
                                        <td colSpan={3} className="px-6 py-5 text-right text-lg font-serif font-bold text-brand-900 border-t border-brand-100">Grand Total</td>
                                        <td className="px-6 py-5 text-right text-xl font-bold text-brand-800 border-t border-brand-100">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer Notes */}
                        <div className="text-center pt-10 border-t border-dashed border-surface-subtle">
                            <p className="text-ink-faint text-xs font-medium max-w-lg mx-auto leading-relaxed">
                                Thank you for your purchase from Hema Sarees. We hope you love your new saree! 
                                If you have any questions regarding this invoice, please reach out to our 
                                support team.
                            </p>
                            <div className="mt-8 flex justify-center gap-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-2 text-brand-800">
                                        <Printer size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-ink-faint uppercase tracking-tighter">Computer Generated</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-2 text-brand-800">
                                        <Hash size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-ink-faint uppercase tracking-tighter">GST Compliant</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
