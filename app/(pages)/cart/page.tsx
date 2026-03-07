'use client';

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { State, City } from 'country-state-city';

type Product = { id: string; stock?: number };
type CartItem = {
  id: string; productId?: string; productName?: string; productImage?: string;
  description?: string; price: number; quantity: number; withPolish?: boolean; product?: Product;
};
type Cart = { id: string; userId?: string; items: CartItem[]; totalPrice?: number };
type UserAddress = { id: string; streetAddress: string; city: string; state: string; zipCode: string; label?: string | null; isDefault?: boolean };

async function apiGetCart(): Promise<{ cart?: Cart }> {
  const res = await fetch('/api/cart', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

async function apiUpdateQuantity(cartItemId: string, quantity: number) {
  const res = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItemId, quantity }) });
  if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to update quantity'); }
  return res.json();
}

async function apiRemoveItem(cartItemId: string) {
  const res = await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItemId }) });
  if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to remove item'); }
  return res.json();
}

const CartItemCard = memo(function CartItemCard({ item, onQty, onRemove }: { item: CartItem; onQty: (id: string, q: number) => void; onRemove: (id: string) => void }) {
  const img = item.productImage || '/uploads/placeholder.png';
  return (
    <div className="cart-item-card">
      <div className="row align-items-center">
        <div className="col-4 col-md-2">
          <Image src={img} alt={item.productName || 'Product'} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 12 }} />
        </div>
        <div className="col-8 col-md-10">
          <div className="row align-items-center">
            <div className="col-12 col-md-5">
              <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.productName}</h5>
              {item.withPolish && <div style={{ color: '#b45309', fontWeight: 600, marginTop: 4, fontSize: '0.85rem' }}>With Polish</div>}
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{'\u20B9'}{item.price.toLocaleString()} each</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="qty-group">
                <button className="qty-btn" onClick={() => onQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>{'\u2212'}</button>
                <span className="qty-val">{item.quantity}</span>
                <button className="qty-btn" onClick={() => onQty(item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
            <div className="col-6 col-md-4 text-end">
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{'\u20B9'}{(item.price * item.quantity).toLocaleString()}</div>
              <button className="btn btn-sm btn-outline-danger mt-2" style={{ borderRadius: 8, fontSize: '0.8rem' }} onClick={() => onRemove(item.id)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function CartPageClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [selectedAddrMode, setSelectedAddrMode] = useState<'saved' | 'new'>('saved');
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [newAddr, setNewAddr] = useState({ streetAddress: '', city: '', state: '', zipCode: '', label: '' });
  const [states] = useState(State.getStatesOfCountry('IN'));
  const [cities, setCities] = useState<Array<{ name: string }>>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try { const data = await apiGetCart(); setCart(data.cart || null); setError(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load cart'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    async function fetchUserAddresses() {
      try {
        const res = await fetch('/api/me', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const addrList: UserAddress[] = data.user?.addresses ?? [];
        setAddresses(addrList);
        setSelectedAddress(addrList.find((a) => a.isDefault) || addrList[0] || null);
      } catch { setAddresses([]); setSelectedAddress(null); }
    }
    fetchUserAddresses();
  }, []);

  const subtotal = useMemo(() => cart?.items.reduce((s, it) => s + it.price * it.quantity, 0) || 0, [cart]);
  const shipping = useMemo(() => {
    const state = selectedAddrMode === 'saved' ? selectedAddress?.state : newAddr.state;
    if (!state) return 0;
    return state.trim().toLowerCase() === 'gujarat' ? 80 : 150;
  }, [selectedAddrMode, selectedAddress, newAddr.state]);
  const total = subtotal + shipping;

  const handleQty = async (id: string, q: number) => {
    if (q < 1) return;
    try { const data = await apiUpdateQuantity(id, q); setCart(data.cart); setError(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to update'); }
  };

  const handleRemove = async (id: string) => {
    try { const data = await apiRemoveItem(id); setCart(data.cart); setError(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to remove'); }
  };

  const placeOrder = async () => {
    if (!cart) return;
    const finalAddr = selectedAddrMode === 'saved' ? selectedAddress : newAddr;
    if (!finalAddr?.streetAddress || !finalAddr.city || !finalAddr.state || !finalAddr.zipCode) {
      alert('Please provide a valid shipping address'); return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartId: cart.id, address: finalAddr }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      alert('Order placed successfully!');
      setCheckingOut(false);
      await loadCart();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to place order'); }
    finally { setPlacing(false); }
  };

  return (
    <>
      <style jsx>{`
        .cart-item-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 1rem; margin-bottom: 1rem; transition: transform 0.2s, box-shadow 0.2s; }
        .cart-item-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .qty-group { display: inline-flex; align-items: center; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
        .qty-btn { background: #fff; border: none; padding: 0.4rem 0.65rem; color: #e76f51; font-weight: 700; cursor: pointer; font-size: 1rem; }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .qty-val { width: 40px; text-align: center; font-weight: 700; font-size: 0.95rem; }
        .summary-card { background: #fdf6f0; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(231,111,81,0.08); position: sticky; top: 100px; }
        .summary-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #e76f51, #f7c6c7); border-radius: 16px 16px 0 0; }
        .checkout-btn { background: linear-gradient(135deg, #e76f51, #d85a40); color: white; border: none; font-weight: 600; border-radius: 12px; padding: 0.75rem; width: 100%; font-size: 1rem; transition: all 0.25s; }
        .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(231,111,81,0.3); }
        .addr-card { border: 2px solid #e2e8f0; border-radius: 10px; padding: 0.75rem; cursor: pointer; transition: border-color 0.2s; margin-top: 0.5rem; }
        .addr-card.active { border-color: #e76f51; }
      `}</style>

      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Shopping Cart</h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>Review your items before checkout</p>
          </div>
          <div className="d-none d-md-flex align-items-center gap-2" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            <span style={{ color: '#e76f51', fontWeight: 600 }}>Cart</span>
            <ChevronRight size={14} />
            <span>{checkingOut ? <strong style={{ color: '#e76f51' }}>Checkout</strong> : 'Checkout'}</span>
            <ChevronRight size={14} />
            <span>Confirmation</span>
          </div>
        </div>

        {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e76f51' }} /></div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && cart && cart.items.length > 0 && (
          !checkingOut ? (
            <div className="row g-4">
              <div className="col-md-8">
                {cart.items.map(it => <CartItemCard key={it.id} item={it} onQty={handleQty} onRemove={handleRemove} />)}
                <Link href="/products" className="btn btn-link p-0 mt-2" style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                  <ChevronLeft size={16} /> Continue Shopping
                </Link>
              </div>
              <div className="col-md-4">
                <div className="summary-card">
                  <h5 className="text-center mb-3" style={{ fontWeight: 600 }}>Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><strong>{'\u20B9'}{subtotal.toLocaleString()}</strong></div>
                  <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{shipping === 0 ? '\u2014' : `\u20B9${shipping}`}</span></div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{'\u20B9'}{total.toLocaleString()}</span></div>
                  <button className="checkout-btn mt-3" onClick={() => setCheckingOut(true)}>Proceed to Checkout</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <div className="card p-4" style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}>
                <h4 style={{ fontWeight: 600 }}>Shipping Address</h4>
                {addresses.length > 0 && (
                  <div className="mt-3">
                    <label style={{ cursor: 'pointer' }}><input type="radio" checked={selectedAddrMode === 'saved'} onChange={() => setSelectedAddrMode('saved')} /> Use Saved Address</label>
                    {selectedAddrMode === 'saved' && (
                      <div className="ps-3">
                        {addresses.map((addr) => (
                          <div key={addr.id} className={`addr-card ${selectedAddress?.id === addr.id ? 'active' : ''}`} onClick={() => setSelectedAddress(addr)}>
                            <div style={{ fontWeight: 600 }}>{addr.label || 'Address'}</div>
                            <div style={{ fontSize: '0.88rem', color: '#64748b' }}>{addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <label style={{ cursor: 'pointer' }}><input type="radio" checked={selectedAddrMode === 'new'} onChange={() => setSelectedAddrMode('new')} /> New Address</label>
                  {selectedAddrMode === 'new' && (
                    <div className="mt-2">
                      <input className="form-control mb-2" placeholder="Street Address" value={newAddr.streetAddress} onChange={e => setNewAddr({ ...newAddr, streetAddress: e.target.value })} />
                      <div className="row g-2">
                        <div className="col-md-6">
                          <select className="form-select" title="State" value={newAddr.state} onChange={e => {
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
                          <select className="form-select" title="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}>
                            <option value="">Select City</option>
                            {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6"><input className="form-control" placeholder="ZIP Code" value={newAddr.zipCode} onChange={e => setNewAddr({ ...newAddr, zipCode: e.target.value })} /></div>
                        <div className="col-md-6"><input className="form-control" placeholder="Label (e.g. Home)" value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} /></div>
                      </div>
                    </div>
                  )}
                </div>

                <hr />
                <div className="summary-card" style={{ position: 'static' }}>
                  <h6 style={{ fontWeight: 600 }}>Order Summary</h6>
                  <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><strong>{'\u20B9'}{subtotal.toLocaleString()}</strong></div>
                  <div className="d-flex justify-content-between mb-1"><span>Shipping</span><span>{'\u20B9'}{shipping}</span></div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{'\u20B9'}{total.toLocaleString()}</span></div>
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-outline-secondary" style={{ borderRadius: 10 }} onClick={() => setCheckingOut(false)}>Back to Cart</button>
                  <button className="checkout-btn" style={{ width: 'auto', padding: '0.75rem 2rem' }} disabled={placing} onClick={placeOrder}>{placing ? 'Placing...' : 'Place Order'}</button>
                </div>
              </div>
            </div>
          )
        )}

        {!loading && (!cart || cart.items.length === 0) && (
          <div className="text-center py-5">
            <h4 style={{ color: '#1e293b' }}>Your cart is empty</h4>
            <p style={{ color: '#94a3b8' }}>Add some elegant sarees to get started.</p>
            <Link href="/products" className="btn-brand">Browse Sarees</Link>
          </div>
        )}
      </div>
    </>
  );
}
