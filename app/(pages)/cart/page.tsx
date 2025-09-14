'use client';

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { State, City } from 'country-state-city';

// --- Type Definitions ---
interface ProductWithStock { stock: number; }
interface CartItem { 
  id: string; 
  productId: string; 
  productName: string; 
  productImage?: string; 
  quantity: number; 
  price: number; 
  product: ProductWithStock;
  withPolish: boolean; 
}
interface Cart { 
  id: string; 
  userId: string; 
  items: CartItem[]; 
}
interface UserAddress { 
  streetAddress: string; 
  city: string; 
  state: string; 
  zipCode: string; 
  country?: string; 
}

// --- Main Cart Page Component ---
export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [step, setStep] = useState(1);

  const [savedAddress, setSavedAddress] = useState<UserAddress | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<'saved' | 'new'>('saved');
  const [newAddress, setNewAddress] = useState({ streetAddress: '', city: '', state: '', zipCode: '' });
  const [addressStates, setAddressStates] = useState<any[]>([]);
  const [addressCities, setAddressCities] = useState<any[]>([]);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const router = useRouter();
  const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

  const subtotal = cart?.items.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const totalAmount = subtotal + deliveryCharge;

  // Calculate delivery charge dynamically based on state
  useEffect(() => {
    if (step === 3) {
        const finalAddress = selectedAddress === 'saved' ? savedAddress : newAddress;
        if (finalAddress && finalAddress.state) {
            if (finalAddress.state.toLowerCase() === 'gujarat') {
                setDeliveryCharge(80);
            } else {
                setDeliveryCharge(150);
            }
        } else {
            setDeliveryCharge(0);
        }
    }
  }, [step, selectedAddress, savedAddress, newAddress]);

  // Fetch cart and user address
  const fetchCartAndAddress = useCallback(async () => {
    setLoading(true);
    try {
      const [cartRes, meRes] = await Promise.all([fetch("/api/cart"), fetch("/api/me")]);

      if (!cartRes.ok) throw new Error("Failed to load cart.");
      const cartData = await cartRes.json();
      setCart(cartData.cart || null);

      if(meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.address) {
            try {
                const addressData = typeof meData.user.address === 'string' ? JSON.parse(meData.user.address) : meData.user.address;
                setSavedAddress(addressData);
                setSelectedAddress('saved');
            } catch (e) {
                console.error("Could not parse saved address:", e);
                setSelectedAddress('new');
            }
        } else {
          setSelectedAddress('new');
        }
      } else {
          setSelectedAddress('new');
      }
      setAddressStates(State.getStatesOfCountry('IN'));
    } catch {
      setError("Failed to load your information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCartAndAddress(); }, [fetchCartAndAddress]);

  // --- Cart Actions ---
  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock) {
        setError(`You can only order up to ${item.product.stock} of ${item.productName}.`);
        return;
    }
    setError('');
    try {
        const res = await fetch("/api/cart", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartItemId: item.id, quantity: newQuantity }),
        });
        if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to update quantity"); }
        const data = await res.json();
        setCart(data.cart);
    } catch (err: any) { setError(err.message); }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setError('');
    try {
        const res = await fetch("/api/cart", { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItemId }) });
        if (!res.ok) throw new Error("Failed to remove item");
        const data = await res.json();
        setCart(data.cart);
    } catch { setError("Could not remove item. Please try again."); }
  };

  const handleProceedToCheckout = () => {
    setError('');
    const outOfStockItem = cart?.items.find(item => item.quantity > item.product.stock);
    if (outOfStockItem) {
        setError(`Please reduce the quantity of ${outOfStockItem.productName}. Only ${outOfStockItem.product.stock} available.`);
        return;
    }
    setIsCheckingOut(true);
    setStep(1);
  }

  // --- Address Change ---
  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
    if (name === 'state') {
        const selectedStateData = addressStates.find(s => s.name === value);
        if (selectedStateData) {
            setAddressCities(City.getCitiesOfState('IN', selectedStateData.isoCode));
            setNewAddress(prev => ({ ...prev, city: '' })); 
        }
    }
  };

  // --- Place Order ---
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setError('');
    const finalAddress = selectedAddress === 'saved' ? savedAddress : newAddress;
    if (!finalAddress || !finalAddress.streetAddress || !finalAddress.city || !finalAddress.state || !finalAddress.zipCode) {
        setError("Please select or fill out a complete delivery address.");
        setIsPlacingOrder(false);
        return;
    }
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart, address: finalAddress, totalAmount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not place order.");
        alert("Order placed successfully!");
        router.push('/orders');
    } catch (err: any) { setError(err.message); }
    finally { setIsPlacingOrder(false); }
  };

  // --- Loading / Empty States ---
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (error && !cart) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!cart || cart.items.length === 0) return (
    <div className="text-center mt-5">
      <h2>Your Cart is Empty</h2>
      <p className="text-muted">No items in your cart.</p>
      <Link href="/"><button className="btn btn-primary mt-3">Start Shopping</button></Link>
    </div>
  );

  // --- Render ---
  return (
    <div className="container my-5">
      {!isCheckingOut ? (
        <div>
          <h1 className="mb-4">Shopping Cart</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row g-4">
            <div className="col-lg-8">
              {cart.items.map(item => (
                <div key={item.id} className="card mb-3 shadow-sm">
                  <div className="card-body d-flex align-items-center">
                    <img src={item.productImage || 'https://placehold.co/80x80/eee/ccc?text=Img'} alt={item.productName} width={80} height={80} className="rounded me-4"/>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{item.productName}</h5>
                      {item.withPolish && <span className="badge bg-info mb-2">With Polish</span>}
                      <p className="mb-2 text-muted">{formatter.format(item.price)}</p>
                      <div className="d-flex align-items-center">
                        <div className="input-group" style={{ maxWidth: '130px' }}>
                          <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                          <input type="text" className="form-control text-center" value={item.quantity} readOnly />
                          <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
                        </div>
                        {item.quantity >= item.product.stock && <small className="text-danger ms-2">Max stock</small>}
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="fw-bold fs-5 mb-2">{formatter.format(item.price * item.quantity)}</p>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">Order Summary</h4>
                  <ul className="list-group list-group-flush mt-3">
                    <li className="list-group-item d-flex justify-content-between"><span>Subtotal</span><span>{formatter.format(subtotal)}</span></li>
                    <li className="list-group-item d-flex justify-content-between"><span>Delivery</span><span className="text-muted fst-italic">Calculated next</span></li>
                    <li className="list-group-item d-flex justify-content-between fw-bold fs-5 bg-light"><span>To Pay</span><span>{formatter.format(subtotal)}</span></li>
                  </ul>
                  <div className="d-grid mt-4">
                    <button className="btn btn-primary btn-lg" onClick={handleProceedToCheckout} disabled={cart.items.length === 0}>Proceed to Checkout</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        // --- Checkout Steps ---
        <div>
          {step === 1 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Step 1: Review Your Order</h2>
                <table className="table mt-3 align-middle">
                  <thead>
                    <tr><th>Product</th><th className="text-center">Quantity</th><th className="text-end">Total</th></tr>
                  </thead>
                  <tbody>
                    {cart.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={item.productImage || 'https://placehold.co/60x60/eee/ccc?text=Img'} width={60} height={60} className="rounded me-3" alt={item.productName}/>
                            <div>
                              <div className="fw-bold">{item.productName}</div>
                              {item.withPolish && <small className="badge bg-info">With Polish</small>}
                              <div className="text-muted small">{formatter.format(item.price)} each</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end fw-bold">{formatter.format(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-outline-secondary" onClick={() => setIsCheckingOut(false)}><ArrowLeft className="me-2"/> Edit Cart</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Next: Shipping Address <ArrowRight className="ms-2"/></button>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Step 2: Shipping Address</h2>
                <div className="card bg-light p-4 mt-3 border">
                  <div className="form-check fs-5">
                    <input type="radio" id="savedAddr" name="addressOption" className="form-check-input" checked={selectedAddress === 'saved'} onChange={() => setSelectedAddress('saved')} disabled={!savedAddress} />
                    <label htmlFor="savedAddr" className="form-check-label"> Ship to my saved address </label>
                  </div>
                  {savedAddress ? <div className="ps-4 ms-3 border-start mt-2 pt-2"><p className="mb-0 fw-bold">{savedAddress.streetAddress}</p><p className="mb-0 text-muted">{savedAddress.city}, {savedAddress.state} - {savedAddress.zipCode}</p></div> : <p className="ps-4 ms-3 text-muted small mt-2">No saved address found.</p>}
                  <hr className="my-4"/>
                  <div className="form-check fs-5">
                    <input type="radio" id="newAddr" name="addressOption" className="form-check-input" checked={selectedAddress === 'new'} onChange={() => setSelectedAddress('new')} />
                    <label htmlFor="newAddr" className="form-check-label"> Ship to a new address </label>
                  </div>
                  {selectedAddress === 'new' && (
                    <div className="row g-3 ps-4 ms-3 border-start mt-2 pt-3">
                      <div className="col-12"><input name="streetAddress" type="text" className="form-control" placeholder="Street Address" value={newAddress.streetAddress} onChange={handleNewAddressChange}/></div>
                      <div className="col-md-6">
                        <label className="form-label">State</label>
                        <select name="state" className="form-select" value={newAddress.state} onChange={handleNewAddressChange}><option value="">Select State</option>{addressStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}</select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">City</label>
                        <select name="city" className="form-select" value={newAddress.city} onChange={handleNewAddressChange} disabled={!newAddress.state || addressCities.length === 0}><option value="">Select City</option>{addressCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                      </div>
                      <div className="col-md-6"><label className="form-label">ZIP Code</label><input name="zipCode" type="text" className="form-control" placeholder="ZIP Code" value={newAddress.zipCode} onChange={handleNewAddressChange}/></div>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-outline-secondary" onClick={() => setStep(1)}><ArrowLeft className="me-2"/> Back to Review</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Next: Confirm & Pay <ArrowRight className="ms-2"/></button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Step 3: Confirm & Pay</h2>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <div className="row mt-4">
                  <div className="col-lg-7 mb-4 mb-lg-0">
                    <h4 className="mb-3">Shipping to:</h4>
                    <div className="card bg-light p-3 border">
                      {selectedAddress === 'saved' && savedAddress ? (
                        <><p className="mb-1 fw-bold fs-5">{savedAddress.streetAddress}</p><p className="mb-0 text-muted">{savedAddress.city}, {savedAddress.state} - {savedAddress.zipCode}</p></>
                      ) : (
                        <><p className="mb-1 fw-bold fs-5">{newAddress.streetAddress}</p><p className="mb-0 text-muted">{newAddress.city}, {newAddress.state} - {newAddress.zipCode}</p></>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <h4 className="mb-3">Order Summary</h4>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between"><span>Subtotal</span> <span>{formatter.format(subtotal)}</span></li>
                      <li className="list-group-item d-flex justify-content-between"><span>Delivery Charges</span> <span>{formatter.format(deliveryCharge)}</span></li>
                      <li className="list-group-item d-flex justify-content-between fw-bold fs-5"><span>Total</span> <span>{formatter.format(totalAmount)}</span></li>
                    </ul>
                    <div className="d-grid mt-4">
                      <button className="btn btn-success btn-lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>{isPlacingOrder ? "Placing Order..." : "Place Order"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
