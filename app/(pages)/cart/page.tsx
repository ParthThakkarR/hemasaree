  // 'use client';

  // import React, { useEffect, useState, useCallback } from "react";
  // import Link from "next/link";
  // import { useRouter } from "next/navigation";
  // import { Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
  // import { State, City } from 'country-state-city';

  // // --- Type Definitions ---
  // interface ProductWithStock { stock: number; }
  // interface CartItem { 
  //   id: string; 
  //   productId: string; 
  //   productName: string; 
  //   productImage?: string; 
  //   quantity: number; 
  //   price: number; 
  //   product: ProductWithStock;
  //   withPolish: boolean; 
  // }
  // interface Cart { 
  //   id: string; 
  //   userId: string; 
  //   items: CartItem[]; 
  // }
  // interface UserAddress { 
  //   streetAddress: string; 
  //   city: string; 
  //   state: string; 
  //   zipCode: string; 
  //   country?: string; 
  // }

  // // --- Main Cart Page Component ---
  // export default function CartPage() {
  //   const [cart, setCart] = useState<Cart | null>(null);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState<string | null>(null);
  //   const [isCheckingOut, setIsCheckingOut] = useState(false);
  //   const [step, setStep] = useState(1);

  //   const [savedAddress, setSavedAddress] = useState<UserAddress | null>(null);
  //   const [selectedAddress, setSelectedAddress] = useState<'saved' | 'new'>('saved');
  //   const [newAddress, setNewAddress] = useState({ streetAddress: '', city: '', state: '', zipCode: '' });
  //   const [addressStates, setAddressStates] = useState<any[]>([]);
  //   const [addressCities, setAddressCities] = useState<any[]>([]);

  //   const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  //   const router = useRouter();
  //   const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

  //   const subtotal = cart?.items.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  //   const [deliveryCharge, setDeliveryCharge] = useState(0);
  //   const totalAmount = subtotal + deliveryCharge;

  //   // Calculate delivery charge dynamically based on state
  //   useEffect(() => {
  //     if (step === 3) {
  //         const finalAddress = selectedAddress === 'saved' ? savedAddress : newAddress;
  //         if (finalAddress && finalAddress.state) {
  //             if (finalAddress.state.toLowerCase() === 'gujarat') {
  //                 setDeliveryCharge(80);
  //             } else {
  //                 setDeliveryCharge(150);
  //             }
  //         } else {
  //             setDeliveryCharge(0);
  //         }
  //     }
  //   }, [step, selectedAddress, savedAddress, newAddress]);

  //   // Fetch cart and user address
  //   const fetchCartAndAddress = useCallback(async () => {
  //     setLoading(true);
  //     try {
  //       const [cartRes, meRes] = await Promise.all([fetch("/api/cart"), fetch("/api/me")]);

  //       if (!cartRes.ok) throw new Error("Failed to load cart.");
  //       const cartData = await cartRes.json();
  //       setCart(cartData.cart || null);

  //       if(meRes.ok) {
  //         const meData = await meRes.json();
  //         if (meData.user?.address) {
  //             try {
  //                 const addressData = typeof meData.user.address === 'string' ? JSON.parse(meData.user.address) : meData.user.address;
  //                 setSavedAddress(addressData);
  //                 setSelectedAddress('saved');
  //             } catch (e) {
  //                 console.error("Could not parse saved address:", e);
  //                 setSelectedAddress('new');
  //             }
  //         } else {
  //           setSelectedAddress('new');
  //         }
  //       } else {
  //           setSelectedAddress('new');
  //       }
  //       setAddressStates(State.getStatesOfCountry('IN'));
  //     } catch {
  //       setError("Failed to load your information. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);

  //   useEffect(() => { fetchCartAndAddress(); }, [fetchCartAndAddress]);

  //   // --- Cart Actions ---
  //   const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
  //     if (newQuantity < 1) return;
  //     if (newQuantity > item.product.stock) {
  //         setError(`You can only order up to ${item.product.stock} of ${item.productName}.`);
  //         return;
  //     }
  //     setError('');
  //     try {
  //         const res = await fetch("/api/cart", {
  //             method: 'PUT',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({ cartItemId: item.id, quantity: newQuantity }),
  //         });
  //         if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to update quantity"); }
  //         const data = await res.json();
  //         setCart(data.cart);
  //     } catch (err: any) { setError(err.message); }
  //   };

  //   const handleRemoveItem = async (cartItemId: string) => {
  //     setError('');
  //     try {
  //         const res = await fetch("/api/cart", { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItemId }) });
  //         if (!res.ok) throw new Error("Failed to remove item");
  //         const data = await res.json();
  //         setCart(data.cart);
  //     } catch { setError("Could not remove item. Please try again."); }
  //   };

  //   const handleProceedToCheckout = () => {
  //     setError('');
  //     const outOfStockItem = cart?.items.find(item => item.quantity > item.product.stock);
  //     if (outOfStockItem) {
  //         setError(`Please reduce the quantity of ${outOfStockItem.productName}. Only ${outOfStockItem.product.stock} available.`);
  //         return;
  //     }
  //     setIsCheckingOut(true);
  //     setStep(1);
  //   }

  //   // --- Address Change ---
  //   const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //     const { name, value } = e.target;
  //     setNewAddress(prev => ({ ...prev, [name]: value }));
  //     if (name === 'state') {
  //         const selectedStateData = addressStates.find(s => s.name === value);
  //         if (selectedStateData) {
  //             setAddressCities(City.getCitiesOfState('IN', selectedStateData.isoCode));
  //             setNewAddress(prev => ({ ...prev, city: '' })); 
  //         }
  //     }
  //   };

  //   // --- Place Order ---
  //   const handlePlaceOrder = async () => {
  //     setIsPlacingOrder(true);
  //     setError('');
  //     const finalAddress = selectedAddress === 'saved' ? savedAddress : newAddress;
  //     if (!finalAddress || !finalAddress.streetAddress || !finalAddress.city || !finalAddress.state || !finalAddress.zipCode) {
  //         setError("Please select or fill out a complete delivery address.");
  //         setIsPlacingOrder(false);
  //         return;
  //     }
  //     try {
  //         const res = await fetch('/api/checkout', {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({ cart, address: finalAddress, totalAmount }),
  //         });
  //         const data = await res.json();
  //         if (!res.ok) throw new Error(data.error || "Could not place order.");
  //         alert("Order placed successfully!");
  //         router.push('/orders');
  //     } catch (err: any) { setError(err.message); }
  //     finally { setIsPlacingOrder(false); }
  //   };

  //   // --- Loading / Empty States ---
  //   if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  //   if (error && !cart) return <p className="text-center mt-5 text-danger">{error}</p>;
  //   if (!cart || cart.items.length === 0) return (
  //     <div className="text-center mt-5">
  //       <h2>Your Cart is Empty</h2>
  //       <p className="text-muted">No items in your cart.</p>
  //       <Link href="/"><button className="btn btn-primary mt-3">Start Shopping</button></Link>
  //     </div>
  //   );

  //   // --- Render ---
  //   return (
  //     <div className="container my-5">
  //       {!isCheckingOut ? (
  //         <div>
  //           <h1 className="mb-4">Shopping Cart</h1>
  //           {error && <div className="alert alert-danger">{error}</div>}
  //           <div className="row g-4">
  //             <div className="col-lg-8">
  //               {cart.items.map(item => (
  //                 <div key={item.id} className="card mb-3 shadow-sm">
  //                   <div className="card-body d-flex align-items-center">
  //                     <img src={item.productImage || 'https://placehold.co/80x80/eee/ccc?text=Img'} alt={item.productName} width={80} height={80} className="rounded me-4"/>
  //                     <div className="flex-grow-1">
  //                       <h5 className="mb-1">{item.productName}</h5>
  //                       {item.withPolish && <span className="badge bg-info mb-2">With Polish</span>}
  //                       <p className="mb-2 text-muted">{formatter.format(item.price)}</p>
  //                       <div className="d-flex align-items-center">
  //                         <div className="input-group" style={{ maxWidth: '130px' }}>
  //                           <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
  //                           <input type="text" className="form-control text-center" value={item.quantity} readOnly />
  //                           <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
  //                         </div>
  //                         {item.quantity >= item.product.stock && <small className="text-danger ms-2">Max stock</small>}
  //                       </div>
  //                     </div>
  //                     <div className="text-end">
  //                       <p className="fw-bold fs-5 mb-2">{formatter.format(item.price * item.quantity)}</p>
  //                       <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}><Trash2 size={16}/></button>
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>

  //             <div className="col-lg-4">
  //               <div className="card shadow-sm">
  //                 <div className="card-body">
  //                   <h4 className="card-title">Order Summary</h4>
  //                   <ul className="list-group list-group-flush mt-3">
  //                     <li className="list-group-item d-flex justify-content-between"><span>Subtotal</span><span>{formatter.format(subtotal)}</span></li>
  //                     <li className="list-group-item d-flex justify-content-between"><span>Delivery</span><span className="text-muted fst-italic">Calculated next</span></li>
  //                     <li className="list-group-item d-flex justify-content-between fw-bold fs-5 bg-light"><span>To Pay</span><span>{formatter.format(subtotal)}</span></li>
  //                   </ul>
  //                   <div className="d-grid mt-4">
  //                     <button className="btn btn-primary btn-lg" onClick={handleProceedToCheckout} disabled={cart.items.length === 0}>Proceed to Checkout</button>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //           </div>
  //         </div>
  //       ) : (
  //         // --- Checkout Steps ---
  //         <div>
  //           {step === 1 && (
  //             <div className="card shadow-sm">
  //               <div className="card-body">
  //                 <h2 className="card-title">Step 1: Review Your Order</h2>
  //                 <table className="table mt-3 align-middle">
  //                   <thead>
  //                     <tr><th>Product</th><th className="text-center">Quantity</th><th className="text-end">Total</th></tr>
  //                   </thead>
  //                   <tbody>
  //                     {cart.items.map(item => (
  //                       <tr key={item.id}>
  //                         <td>
  //                           <div className="d-flex align-items-center">
  //                             <img src={item.productImage || 'https://placehold.co/60x60/eee/ccc?text=Img'} width={60} height={60} className="rounded me-3" alt={item.productName}/>
  //                             <div>
  //                               <div className="fw-bold">{item.productName}</div>
  //                               {item.withPolish && <small className="badge bg-info">With Polish</small>}
  //                               <div className="text-muted small">{formatter.format(item.price)} each</div>
  //                             </div>
  //                           </div>
  //                         </td>
  //                         <td className="text-center">{item.quantity}</td>
  //                         <td className="text-end fw-bold">{formatter.format(item.price * item.quantity)}</td>
  //                       </tr>
  //                     ))}
  //                   </tbody>
  //                 </table>
  //                 <div className="d-flex justify-content-between mt-3">
  //                   <button className="btn btn-outline-secondary" onClick={() => setIsCheckingOut(false)}><ArrowLeft className="me-2"/> Edit Cart</button>
  //                   <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Next: Shipping Address <ArrowRight className="ms-2"/></button>
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //           {step === 2 && (
  //             <div className="card shadow-sm">
  //               <div className="card-body">
  //                 <h2 className="card-title">Step 2: Shipping Address</h2>
  //                 <div className="card bg-light p-4 mt-3 border">
  //                   <div className="form-check fs-5">
  //                     <input type="radio" id="savedAddr" name="addressOption" className="form-check-input" checked={selectedAddress === 'saved'} onChange={() => setSelectedAddress('saved')} disabled={!savedAddress} />
  //                     <label htmlFor="savedAddr" className="form-check-label"> Ship to my saved address </label>
  //                   </div>
  //                   {savedAddress ? <div className="ps-4 ms-3 border-start mt-2 pt-2"><p className="mb-0 fw-bold">{savedAddress.streetAddress}</p><p className="mb-0 text-muted">{savedAddress.city}, {savedAddress.state} - {savedAddress.zipCode}</p></div> : <p className="ps-4 ms-3 text-muted small mt-2">No saved address found.</p>}
  //                   <hr className="my-4"/>
  //                   <div className="form-check fs-5">
  //                     <input type="radio" id="newAddr" name="addressOption" className="form-check-input" checked={selectedAddress === 'new'} onChange={() => setSelectedAddress('new')} />
  //                     <label htmlFor="newAddr" className="form-check-label"> Ship to a new address </label>
  //                   </div>
  //                   {selectedAddress === 'new' && (
  //                     <div className="row g-3 ps-4 ms-3 border-start mt-2 pt-3">
  //                       <div className="col-12"><input name="streetAddress" type="text" className="form-control" placeholder="Street Address" value={newAddress.streetAddress} onChange={handleNewAddressChange}/></div>
  //                       <div className="col-md-6">
  //                         <label className="form-label">State</label>
  //                         <select name="state" className="form-select" value={newAddress.state} onChange={handleNewAddressChange}><option value="">Select State</option>{addressStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}</select>
  //                       </div>
  //                       <div className="col-md-6">
  //                         <label className="form-label">City</label>
  //                         <select name="city" className="form-select" value={newAddress.city} onChange={handleNewAddressChange} disabled={!newAddress.state || addressCities.length === 0}><option value="">Select City</option>{addressCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
  //                       </div>
  //                       <div className="col-md-6"><label className="form-label">ZIP Code</label><input name="zipCode" type="text" className="form-control" placeholder="ZIP Code" value={newAddress.zipCode} onChange={handleNewAddressChange}/></div>
  //                     </div>
  //                   )}
  //                 </div>
  //                 <div className="d-flex justify-content-between mt-4">
  //                   <button className="btn btn-outline-secondary" onClick={() => setStep(1)}><ArrowLeft className="me-2"/> Back to Review</button>
  //                   <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Next: Confirm & Pay <ArrowRight className="ms-2"/></button>
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //           {step === 3 && (
  //             <div className="card shadow-sm">
  //               <div className="card-body">
  //                 <h2 className="card-title">Step 3: Confirm & Pay</h2>
  //                 {error && <div className="alert alert-danger mt-3">{error}</div>}
  //                 <div className="row mt-4">
  //                   <div className="col-lg-7 mb-4 mb-lg-0">
  //                     <h4 className="mb-3">Shipping to:</h4>
  //                     <div className="card bg-light p-3 border">
  //                       {selectedAddress === 'saved' && savedAddress ? (
  //                         <><p className="mb-1 fw-bold fs-5">{savedAddress.streetAddress}</p><p className="mb-0 text-muted">{savedAddress.city}, {savedAddress.state} - {savedAddress.zipCode}</p></>
  //                       ) : (
  //                         <><p className="mb-1 fw-bold fs-5">{newAddress.streetAddress}</p><p className="mb-0 text-muted">{newAddress.city}, {newAddress.state} - {newAddress.zipCode}</p></>
  //                       )}
  //                     </div>
  //                   </div>
  //                   <div className="col-lg-5">
  //                     <h4 className="mb-3">Order Summary</h4>
  //                     <ul className="list-group">
  //                       <li className="list-group-item d-flex justify-content-between"><span>Subtotal</span> <span>{formatter.format(subtotal)}</span></li>
  //                       <li className="list-group-item d-flex justify-content-between"><span>Delivery Charges</span> <span>{formatter.format(deliveryCharge)}</span></li>
  //                       <li className="list-group-item d-flex justify-content-between fw-bold fs-5"><span>Total</span> <span>{formatter.format(totalAmount)}</span></li>
  //                     </ul>
  //                     <div className="d-grid mt-4">
  //                       <button className="btn btn-success btn-lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>{isPlacingOrder ? "Placing Order..." : "Place Order"}</button>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       )}
  //     </div>
  //   );
  // }







  // app/cart/page.tsx

// /app/(pages)/cart/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { State, City } from 'country-state-city';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

/* -------------------- Types -------------------- */
type Product = {
  id: string;
  stock?: number;
};

type CartItem = {
  id: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  description?: string;
  price: number;
  quantity: number;
  withPolish?: boolean;
  product?: Product;
};

type Cart = {
  id: string;
  userId?: string;
  items: CartItem[];
  totalPrice?: number;
};

/* -------------------- CSS -------------------- */
const customStyles = `
:root{
  --bg-primary:#ffffff;
  --bg-secondary:#fdf6f0;
  --accent-primary:#e76f51;
  --accent-secondary:#f7c6c7;
  --text-primary:#1e293b;
  --divider:#e2e8f0;
}

body{
  font-family:var(--font-inter),sans-serif;
  background:linear-gradient(135deg,#fdf6f0 0%,#ffffff 100%);
  min-height:100vh;
  color:var(--text-primary);
}

/* header */
.page-header{
  position:relative;
  overflow:hidden;
  border-radius:12px;
  background:linear-gradient(135deg, #fff 0%, #fdf6f0 100%);
  box-shadow:0 8px 20px rgba(231,111,81,0.08);
  padding:2rem;
  margin-bottom:2rem;
}
.page-header::before{
  content:'';
  position:absolute;
  top:-20%;
  right:-30%;
  width:420px;
  height:420px;
  background:linear-gradient(135deg,#e76f51,#f7c6c7);
  opacity:0.06;
  transform:rotate(30deg);
  filter: blur(30px);
}
.breadcrumb{
  background:rgba(253,246,240,0.7);
  border-radius:50px;
  padding:0.5rem 1rem;
  backdrop-filter:blur(8px);
  border:1px solid rgba(231,111,81,0.12);
  display:inline-flex;
  gap:.6rem;
  align-items:center;
}

/* cart card */
.cart-item-card{
  background:var(--bg-primary);
  border:none;
  border-radius:16px;
  box-shadow:0 6px 16px rgba(0,0,0,0.06);
  overflow:hidden;
  margin-bottom:1.25rem;
  padding:1rem;
}
.cart-item-card:hover{ transform:translateY(-4px); box-shadow:0 14px 30px rgba(0,0,0,0.09); }

/* quantity group */
.quantity-input-group{
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
  display:inline-flex;
  align-items:center;
}
.quantity-input-group .btn{
  background:#fff;
  border:none;
  padding:.45rem .6rem;
  color:var(--accent-primary);
  font-weight:700;
}
.quantity-input-group input{ width:48px; text-align:center; border:none; padding:.45rem 0; font-weight:700; }

/* order summary */
.order-summary{
  background:var(--bg-secondary);
  border-radius:16px;
  box-shadow:0 8px 24px rgba(231,111,81,0.12);
  padding:1rem;
}
.order-summary::before{
  content:''; position:absolute; top:0; left:0; right:0; height:6px;
  background:linear-gradient(135deg,#e76f51,#f7c6c7);
}

/* button */
.btn-primary{
  background:linear-gradient(135deg,#e76f51,#f7c6c7)!important;
  color:#fff!important;
  border:none!important;
  font-weight:600;
  border-radius:12px;
  padding:0.75rem 1.25rem;
}
.btn-outline-secondary{ border-radius:10px; }

/* responsive */
@media (max-width:767px){
  .order-summary{ position:static; margin-top:1.5rem; }
  .page-header{ padding:1rem; }
  .cart-item-card{ padding:.75rem; }
}
`;

/* -------------------- Helper API -------------------- */
async function apiGetCart(): Promise<{ cart?: Cart }> {
  const res = await fetch('/api/cart', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

async function apiUpdateQuantity(cartItemId: string, quantity: number) {
  const res = await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItemId, quantity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update quantity');
  }
  return res.json();
}

async function apiRemoveItem(cartItemId: string) {
  const res = await fetch('/api/cart', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItemId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to remove item');
  }
  return res.json();
}

/* -------------------- Memoized Item -------------------- */
const CartItemCard = memo(function CartItemCard({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
}) {
  const img = item.productImage || '/placeholder.png';
  return (
    <div className="cart-item-card">
      <div className="row align-items-center">
        <div className="col-4 col-md-2">
          <Image src={img} alt={item.productName || 'Product'} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 12 }} />
        </div>
        <div className="col-8 col-md-10">
          <div className="row align-items-center">
            <div className="col-12 col-md-5">
              <h5 style={{ margin: 0 }}>{item.productName}</h5>
              {item.withPolish && <div style={{ color: '#b45309', fontWeight: 600, marginTop: 6 }}>With Polish</div>}
              <div style={{ color: '#64748b', fontSize: 13 }}>₹{item.price.toLocaleString()} each</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="quantity-input-group">
                <button className="btn" onClick={() => onQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                <input aria-label="quantity" value={item.quantity} readOnly />
                <button className="btn" onClick={() => onQty(item.id, item.quantity + 1)}>＋</button>
              </div>
            </div>
            <div className="col-6 col-md-4 text-end">
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => onRemove(item.id)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* -------------------- Main Component -------------------- */
export default function CartPageClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [selectedAddrMode, setSelectedAddrMode] = useState<'saved' | 'new'>('saved');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [newAddr, setNewAddr] = useState({ streetAddress: '', city: '', state: '', zipCode: '', label: '' });
  const [states] = useState(State.getStatesOfCountry('IN'));
  const [cities, setCities] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetCart();
      setCart(data.cart || null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    async function fetchUserAddresses() {
      try {
        const res = await fetch('/api/me', { credentials: 'include', cache: 'no-store' });
        const data = await res.json();
        const addrList = data.user?.addresses ?? [];
        setAddresses(addrList);
        if (addrList.length > 0) setSelectedAddress(addrList[0]);
      } catch {
        setAddresses([]);
      }
    }
    fetchUserAddresses();
  }, []);

  const subtotal = useMemo(() => cart?.items.reduce((s, it) => s + it.price * it.quantity, 0) || 0, [cart]);

  // 🔹 Dynamic shipping logic based on state
  const shipping = useMemo(() => {
    const state = selectedAddrMode === 'saved' ? selectedAddress?.state : newAddr.state;
    if (!state) return 0;
    return state.trim().toLowerCase() === 'gujarat' ? 80 : 150;
  }, [selectedAddrMode, selectedAddress, newAddr.state]);

  const total = subtotal + shipping;

  const handleQty = async (id: string, q: number) => {
    if (q < 1) return;
    const data = await apiUpdateQuantity(id, q);
    setCart(data.cart);
  };

  const handleRemove = async (id: string) => {
    const data = await apiRemoveItem(id);
    setCart(data.cart);
  };

  const placeOrder = async () => {
    if (!cart) return;
    const finalAddr = selectedAddrMode === 'saved' ? selectedAddress : newAddr;
    if (!finalAddr || !finalAddr.streetAddress) {
      alert('Please provide a valid shipping address');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.id, address: finalAddr }),
      });
      if (!res.ok) throw new Error('Failed to place order');
      alert('Order placed successfully!');
      setCheckingOut(false);
      loadCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <style jsx global>{customStyles}</style>
      <div className={`${inter.variable} container py-5`}>
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Your Shopping Cart</h1>
              <p className="text-muted">Review your sarees before checkout</p>
            </div>
            <div className="breadcrumb">
              <div>Cart</div><ChevronRight size={14} /><div>Checkout</div><ChevronRight size={14} /><div>Payment</div>
            </div>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && cart && cart.items.length > 0 && (
          !checkingOut ? (
            <div className="row g-4">
              <div className="col-md-8">
                {cart.items.map(it => (
                  <CartItemCard key={it.id} item={it} onQty={handleQty} onRemove={handleRemove} />
                ))}
                <Link href="/" className="btn btn-link mt-3">
                  <ChevronLeft /> Continue Shopping
                </Link>
              </div>

              <div className="col-md-4">
                <div className="order-summary">
                  <h5 className="text-center mb-3">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                  <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{shipping === 0 ? '—' : `₹${shipping}`}</span></div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
                  <button className="btn btn-primary w-100 mt-3" onClick={() => setCheckingOut(true)}>Proceed to Checkout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-3">
              <h4>Checkout</h4>
              <div className="mt-3">
                <h6>Shipping Address</h6>
                {addresses.length > 0 && (
                  <>
                    <label><input type="radio" checked={selectedAddrMode === 'saved'} onChange={() => setSelectedAddrMode('saved')} /> Use Saved Address</label>
                    <div className="ps-3">
                      {addresses.map((addr: any) => (
                        <div key={addr.id} className="border rounded p-2 mt-2" style={{ borderColor: selectedAddress?.id === addr.id ? '#e76f51' : '#ccc' }} onClick={() => setSelectedAddress(addr)}>
                          <div className="fw-bold">{addr.label || 'Address'}</div>
                          <div>{addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <hr />
                <label><input type="radio" checked={selectedAddrMode === 'new'} onChange={() => setSelectedAddrMode('new')} /> New Address</label>
                {selectedAddrMode === 'new' && (
                  <div className="mt-2">
                    <input className="form-control mb-2" placeholder="Street Address" value={newAddr.streetAddress} onChange={e => setNewAddr({ ...newAddr, streetAddress: e.target.value })} />
                    <div className="row g-2">
                      <div className="col-md-6">
                        <select className="form-select" value={newAddr.state} onChange={e => {
                          const sName = e.target.value;
                          const st = states.find(s => s.name === sName);
                          if (st) setCities(City.getCitiesOfState('IN', st.isoCode));
                          setNewAddr({ ...newAddr, state: sName, city: '' });
                        }}>
                          <option value="">Select State</option>
                          {states.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <select className="form-select" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}>
                          <option value="">Select City</option>
                          {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <input className="form-control" placeholder="ZIP Code" value={newAddr.zipCode} onChange={e => setNewAddr({ ...newAddr, zipCode: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <input className="form-control" placeholder="Label (e.g. Home)" value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <hr />
              <div className="order-summary">
                <h6>Order Summary</h6>
                <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                <div className="d-flex justify-content-between mb-1"><span>Shipping</span><span>₹{shipping}</span></div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setCheckingOut(false)}>Back to Cart</button>
                <button className="btn btn-primary" disabled={placing} onClick={placeOrder}>{placing ? 'Placing...' : 'Place Order'}</button>
              </div>
            </div>
          )
        )}

        {!loading && (!cart || cart.items.length === 0) && (
          <div className="text-center mt-5">
            <h4>Your cart is empty</h4>
            <p className="text-muted">Add some elegant sarees to your cart.</p>
            <Link href="/" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}
      </div>
    </>
  );
}
