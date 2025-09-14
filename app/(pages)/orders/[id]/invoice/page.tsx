// "use client";

// import { use, useState, useEffect } from "react";
// import { Printer, AlertCircle } from "lucide-react";

// // --- Type Definitions ---
// enum OrderStatus {
//   PENDING = "PENDING",
//   SHIPPED = "SHIPPED",
//   DELIVERED = "DELIVERED",
//   CANCELLED = "CANCELLED",
// }

// interface OrderItem {
//   id: string;
//   productId: string;
//   productName: string;
//   productImage?: string;
//   price: number;
//   quantity: number;
// }

// interface UserInfo {
//   firstName: string;
//   lastName: string | null;
//   email: string;
// }

// interface Order {
//   id: string;
//   status: OrderStatus;
//   totalAmount: number;
//   deliveryCharge: number;
//   createdAt: string;
//   orderItems: OrderItem[];
//   shippingAddress: string | null;
//   user: UserInfo;
// }

// const InvoicePage = ({ params }: { params: Promise<{ id: string }> }) => {
//   // ✅ unwrap params (fix for Next.js 15+)
//   const { id } = use(params);

//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (id) {
//       const fetchOrderDetails = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//           const res = await fetch(`/api/orders/${id}`);
//           if (!res.ok) {
//             const errorData = await res.json();
//             throw new Error(
//               errorData.error || "Failed to fetch order details"
//             );
//           }
//           const data: Order = await res.json();
//           setOrder(data);
//         } catch (err: any) {
//           setError(err.message || "An unexpected error occurred.");
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchOrderDetails();
//     } else {
//       setLoading(false);
//       setError("Order ID is missing.");
//     }
//   }, [id]);

//   const handlePrint = () => {
//     window.print();
//   };

//   if (loading) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ minHeight: "80vh" }}
//       >
//         <div
//           className="spinner-border text-primary"
//           role="status"
//           style={{ width: "3rem", height: "3rem" }}
//         >
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="ms-3 fs-5">Loading Invoice...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container my-5">
//         <div
//           className="alert alert-danger d-flex align-items-center"
//           role="alert"
//         >
//           <AlertCircle className="me-2" />
//           <div>
//             <h5 className="alert-heading">Error Loading Invoice</h5>
//             <p>{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="container my-5 text-center">
//         <p>No order details found.</p>
//       </div>
//     );
//   }

//   const subtotal = order.orderItems.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0
//   );

//   return (
//     <>
//       {/* Add print-specific styles */}
//       <style jsx global>{`
//         @media print {
//           body * {
//             visibility: hidden;
//           }
//           #invoice-section,
//           #invoice-section * {
//             visibility: visible;
//           }
//           #invoice-section {
//             position: absolute;
//             left: 0;
//             top: 0;
//             width: 100%;
//             margin: 0;
//             padding: 0;
//             box-shadow: none !important;
//             border: none !important;
//           }
//           .no-print {
//             display: none;
//           }
//         }
//       `}</style>

//       <div className="bg-light py-5">
//         <main className="container">
//           <div className="d-flex justify-content-between align-items-center mb-4 no-print">
//             <h1 className="h3">Invoice Details</h1>
//             <button
//               onClick={handlePrint}
//               className="btn btn-primary d-flex align-items-center"
//             >
//               <Printer size={18} className="me-2" />
//               Print Invoice
//             </button>
//           </div>

//           <div id="invoice-section" className="card border-0 shadow-sm">
//             <div className="card-body p-4 p-md-5">
//               <div className="row mb-4 border-bottom pb-4">
//                 <div className="col-md-6">
//                   <h2 className="h4 fw-bold">HemaSarees</h2>
//                   <p className="text-muted mb-0">
//                     123 Silk Avenue, Weaver's Lane
//                   </p>
//                   <p className="text-muted mb-0">Surat, Gujarat, 395006</p>
//                   <p className="text-muted mb-0">India</p>
//                 </div>
//                 <div className="col-md-6 text-md-end mt-3 mt-md-0">
//                   <h2 className="h1 text-primary mb-1">INVOICE</h2>
//                   <p className="mb-1">
//                     <strong>Invoice #:</strong>{" "}
//                     <span className="font-monospace">{order.id}</span>
//                   </p>
//                   <p className="mb-0">
//                     <strong>Date:</strong>{" "}
//                     {new Date(order.createdAt).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })}
//                   </p>
//                 </div>
//               </div>

//               <div className="row my-4">
//                 <div className="col-md-6">
//                   <h5 className="mb-3 text-muted small text-uppercase">
//                     Bill To
//                   </h5>
//                   <p className="fw-bold mb-1">
//                     {order.user.firstName} {order.user.lastName || ""}
//                   </p>
//                   <p
//                     className="text-muted mb-0"
//                     style={{ whiteSpace: "pre-wrap" }}
//                   >
//                     {order.shippingAddress || "Address not provided"}
//                   </p>
//                   <p className="text-muted mb-0">{order.user.email}</p>
//                 </div>
//               </div>

//               <div className="table-responsive">
//                 <table className="table">
//                   <thead className="table-light">
//                     <tr>
//                       <th scope="col" className="ps-3">
//                         Item
//                       </th>
//                       <th scope="col" className="text-end">
//                         Qty
//                       </th>
//                       <th scope="col" className="text-end">
//                         Unit Price
//                       </th>
//                       <th scope="col" className="text-end pe-3">
//                         Total
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {order.orderItems.map((item) => (
//                       <tr key={item.id}>
//                         <td className="ps-3">{item.productName}</td>
//                         <td className="text-end">{item.quantity}</td>
//                         <td className="text-end">₹{item.price.toFixed(2)}</td>
//                         <td className="text-end pe-3">
//                           ₹{(item.price * item.quantity).toFixed(2)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td colSpan={3} className="text-end border-0">
//                         Subtotal
//                       </td>
//                       <td className="text-end border-0 pe-3">
//                         ₹{subtotal.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td colSpan={3} className="text-end border-0">
//                         Delivery Charges
//                       </td>
//                       <td className="text-end border-0 pe-3">
//                         ₹{order.deliveryCharge.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr className="fw-bold fs-5">
//                       <td
//                         colSpan={3}
//                         className="text-end border-0 bg-light-subtle"
//                       >
//                         Grand Total
//                       </td>
//                       <td className="text-end border-0 bg-light-subtle pe-3">
//                         ₹{order.totalAmount.toFixed(2)}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>

//               <div className="mt-5 text-center text-muted">
//                 <p className="small">
//                   Thank you for your purchase! If you have any questions, please
//                   contact us at support@hemasarees.com.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// };

// export default InvoicePage;




'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Printer, AlertCircle } from 'lucide-react';
import axios from 'axios';

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
  user: UserInfo;
}

// --- Main Invoice Page Component ---
export default function InvoicePage() {
    const params = useParams();
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
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-3 fs-5">Loading Invoice...</p>
            </div>
        );
    }

    if (error) {
        return (
             <div className="container my-5">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle className="me-2" />
                    <div>
                        <h5 className="alert-heading">Error Loading Invoice</h5>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="container my-5 text-center">
               <p>No order details found.</p>
            </div>
        )
    }

    const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <>
            {/* Print-specific styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-section, #invoice-section * { visibility: visible; }
                    #invoice-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important; border: none !important; }
                    .no-print { display: none; }
                }
            `}</style>
            
            <div className="bg-light py-5">
                <main className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                        <h1 className="h3">Invoice Details</h1>
                        <button onClick={handlePrint} className="btn btn-primary d-flex align-items-center">
                            <Printer size={18} className="me-2" /> Print Invoice
                        </button>
                    </div>

                    <div id="invoice-section" className="card border-0 shadow-sm">
                        <div className="card-body p-4 p-md-5">
                            <div className="row mb-4 border-bottom pb-4">
                                <div className="col-md-6">
                                    <h2 className="h4 fw-bold">HemaSarees</h2>
                                    <p className="text-muted mb-0">123 Silk Avenue, Weaver's Lane</p>
                                    <p className="text-muted mb-0">Surat, Gujarat, 395006</p>
                                    <p className="text-muted mb-0">India</p>
                                </div>
                                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                                    <h2 className="h1 text-primary mb-1">INVOICE</h2>
                                    <p className="mb-1"><strong>Invoice #:</strong> <span className="font-monospace">{order.id}</span></p>
                                    <p className="mb-0"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            
                            <div className="row my-4">
                                <div className="col-md-6">
                                    <h5 className="mb-3 text-muted small text-uppercase">Bill To</h5>
                                    <p className="fw-bold mb-1">{order.user.firstName} {order.user.lastName || ''}</p>
                                    <p className="text-muted mb-0" style={{whiteSpace: 'pre-wrap'}}>{order.shippingAddress || 'Address not provided'}</p>
                                    <p className="text-muted mb-0">{order.user.email}</p>
                                </div>
                            </div>
                            
                            <div className="table-responsive">
                                <table className="table">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" className="ps-3">Item</th>
                                            <th scope="col" className="text-end">Qty</th>
                                            <th scope="col" className="text-end">Unit Price</th>
                                            <th scope="col" className="text-end pe-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.orderItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="ps-3">{item.productName}</td>
                                                <td className="text-end">{item.quantity}</td>
                                                <td className="text-end">₹{item.price.toFixed(2)}</td>
                                                <td className="text-end pe-3">₹{(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="text-end border-0">Subtotal</td>
                                            <td className="text-end border-0 pe-3">₹{subtotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="text-end border-0">Delivery Charges</td>
                                            <td className="text-end border-0 pe-3">₹{order.deliveryCharge.toFixed(2)}</td>
                                        </tr>
                                        <tr className="fw-bold fs-5">
                                            <td colSpan={3} className="text-end border-0 bg-light-subtle">Grand Total</td>
                                            <td className="text-end border-0 bg-light-subtle pe-3">₹{order.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div className="mt-5 text-center text-muted">
                                <p className="small">Thank you for your purchase!</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}