'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { State, City } from 'country-state-city';
import { Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck, Lock, ShoppingBag } from 'lucide-react';
import { useCart, CartItem } from '@/app/contexts/cart-context';
import { useAuth } from '@/app/contexts/auth-context';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, updateQuantity, removeItem, refreshCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Address State
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<any>(null);
  
  const [states] = useState(() => State.getStatesOfCountry('IN'));
  const [cities, setCities] = useState<any[]>([]);
  const [newAddr, setNewAddr] = useState({
    streetAddress: '', city: '', state: '', zipCode: ''
  });

  // Fetch saved addresses
  useEffect(() => {
    if (user) {
      fetch('/api/me')
        .then(res => res.json())
        .then(data => {
          const addrs = data.user?.addresses || [];
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            setAddressMode('saved');
            setSelectedSavedAddress(addrs[0]);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  // Handle State Change -> Update Cities
  useEffect(() => {
    if (newAddr.state) {
      const stateObj = states.find(s => s.name === newAddr.state);
      if (stateObj) {
        setCities(City.getCitiesOfState('IN', stateObj.isoCode));
      }
    }
  }, [newAddr.state, states]);

  // Calculations
  const subtotal = useMemo(() => cart?.totalPrice || 0, [cart]);
  
  const activeState = useMemo(() => {
    if (step < 2) return null;
    return addressMode === 'saved' ? selectedSavedAddress?.state : newAddr.state;
  }, [step, addressMode, selectedSavedAddress, newAddr.state]);

  const deliveryCharge = useMemo(() => {
    if (!activeState) return 0;
    return activeState.trim().toLowerCase() === 'gujarat' ? 80 : 150;
  }, [activeState]);

  const total = subtotal + deliveryCharge;

  // Actions
  const handleQuantity = async (id: string, q: number) => {
    await updateQuantity(id, q);
  };

  const handleRemove = async (id: string) => {
    await removeItem(id);
  };

  const validateAddressAndProceed = () => {
    if (addressMode === 'new') {
      if (!newAddr.streetAddress || !newAddr.city || !newAddr.state || !newAddr.zipCode) {
        toast.error('Please fill out all address fields');
        return;
      }
    } else {
      if (!selectedSavedAddress) {
        toast.error('Please select a saved address');
        return;
      }
    }
    setStep(3);
  };

  const placeOrder = async () => {
    const finalAddress = addressMode === 'saved' ? selectedSavedAddress : newAddr;
    
    setIsPlacingOrder(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: finalAddress }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      
      toast.success('Order placed successfully!');
      await refreshCart(); // Clear local cart state
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Image helper
  const getImageSrc = (img?: string) => {
    if (!img) return '/uploads/placeholder.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  // Render
  if (!user) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <Lock className="w-16 h-16 text-brand-300 mb-6" />
        <h2 className="text-3xl font-serif font-bold text-ink mb-4">Sign in to view your cart</h2>
        <p className="text-ink-muted mb-8">Access your saved items, addresses, and track your orders.</p>
        <Link href="/login" className="bg-brand-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-900 transition-colors">
          Sign In / Register
        </Link>
      </div>
    );
  }

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-20 h-20 text-surface-subtle mb-6" strokeWidth={1} />
        <h2 className="text-3xl font-serif font-bold text-ink mb-4">Your cart is empty</h2>
        <p className="text-ink-muted mb-8 max-w-md">Discover our elegant collections and find the perfect saree for your next occasion.</p>
        <Link href="/products" className="bg-brand-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-900 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Breadcrumb */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-ink">Checkout</h1>
            <p className="text-sm text-ink-muted mt-2 uppercase tracking-wider font-semibold">Complete your order in 3 simple steps</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[10px]">
            <span className={step === 1 ? 'text-brand-800 bg-brand-50 px-2 py-1 rounded' : 'text-ink-faint'}>Cart</span>
            <ArrowRight size={14} className="text-ink-faint" />
            <span className={step === 2 ? 'text-brand-800 bg-brand-50 px-2 py-1 rounded' : 'text-ink-faint'}>Shipping</span>
            <ArrowRight size={14} className="text-ink-faint" />
            <span className={step === 3 ? 'text-brand-800 bg-brand-50 px-2 py-1 rounded' : 'text-ink-faint'}>Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Step 1: Cart Items */}
            {step === 1 && (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-brand-100 p-4 flex gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
                    <Link href={`/product/${item.productId}`} className="shrink-0 relative w-24 h-32 overflow-hidden rounded-xl bg-surface-muted block">
                      <Image 
                        src={getImageSrc(item.productImage)} 
                        alt={item.productName} 
                        fill
                        className="object-cover"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`} className="text-lg font-serif font-bold text-ink line-clamp-1 hover:text-brand-800 transition-colors">
                        {item.productName}
                      </Link>
                      <p className="text-brand-800 mt-1 font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                      {item.withPolish && (
                        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-800 px-2 py-1 rounded border border-brand-200">
                          Includes Polish
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-4 shrink-0">
                      <div className="flex items-center bg-surface rounded-lg border border-brand-200 p-1">
                        <button 
                          onClick={() => handleQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-brand-800 hover:bg-brand-50 rounded-md disabled:opacity-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-brand-800 hover:bg-brand-50 rounded-md disabled:opacity-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        disabled={isLoading}
                        className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors underline underline-offset-4"
                      >
                        <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}

                <Link href="/products" className="inline-flex items-center gap-2 text-brand-800 font-semibold hover:text-brand-900 transition-colors mt-6 uppercase tracking-wider text-sm underline underline-offset-4">
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-brand-100 p-6 md:p-10 shadow-sm animate-fade-in">
                <h2 className="text-2xl font-serif font-bold text-ink mb-8">Delivery Address</h2>
                
                {savedAddresses.length > 0 && (
                  <div className="mb-10">
                    <label onClick={() => setAddressMode('saved')} className="flex items-center gap-3 cursor-pointer mb-6 group">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${addressMode === 'saved' ? 'border-brand-800 bg-brand-800' : 'border-brand-200 group-hover:border-brand-400'}`}>
                        {addressMode === 'saved' && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-white"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span className="font-semibold text-ink">Use saved address</span>
                      <input type="radio" name="addressMode" className="hidden" checked={addressMode === 'saved'} onChange={() => setAddressMode('saved')} />
                    </label>
                    
                    {addressMode === 'saved' && (
                      <div className="grid sm:grid-cols-2 gap-4 ml-8">
                        {savedAddresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => setSelectedSavedAddress(addr)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                              selectedSavedAddress?.id === addr.id 
                                ? 'border-brand-800 bg-brand-50 shadow-sm' 
                                : 'border-brand-100 hover:border-brand-300'
                            }`}
                          >
                            <span className="bg-white text-brand-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-brand-200 mb-3 inline-block">
                              {addr.label || 'Home'}
                            </span>
                            <p className="text-sm text-ink font-medium leading-relaxed">
                              {addr.streetAddress}<br />
                              {addr.city}, {addr.state}<br />
                              {addr.zipCode}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label onClick={() => setAddressMode('new')} className="flex items-center gap-3 cursor-pointer mb-6 group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${addressMode === 'new' ? 'border-brand-800 bg-brand-800' : 'border-brand-200 group-hover:border-brand-400'}`}>
                      {addressMode === 'new' && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-white"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span className="font-semibold text-ink">Add a new address</span>
                    <input type="radio" name="addressMode" className="hidden" checked={addressMode === 'new'} onChange={() => setAddressMode('new')} />
                  </label>

                  {addressMode === 'new' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ml-8 mt-4 animate-fade-in">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-ink mb-1.5">Street Address</label>
                        <input 
                          type="text" 
                          value={newAddr.streetAddress}
                          onChange={(e) => setNewAddr({...newAddr, streetAddress: e.target.value})}
                          className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">State</label>
                        <select 
                          value={newAddr.state}
                          onChange={(e) => setNewAddr({...newAddr, state: e.target.value, city: ''})}
                          className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                        >
                          <option value="">Select State</option>
                          {states.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">City</label>
                        <select 
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                          disabled={!newAddr.state}
                          className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow disabled:opacity-50 text-ink"
                        >
                          <option value="">Select City</option>
                          {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-ink mb-1.5">PIN Code</label>
                        <input 
                          type="text"
                          value={newAddr.zipCode}
                          onChange={(e) => setNewAddr({...newAddr, zipCode: e.target.value})} 
                          className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirm & Pay */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-brand-100 p-6 md:p-10 shadow-sm animate-fade-in">
                <h2 className="text-2xl font-serif font-bold text-ink mb-8 flex items-center gap-3">
                  <ShieldCheck className="text-brand-800" size={28} /> Secure Checkout
                </h2>
                
                <div className="bg-brand-50 rounded-2xl p-5 mb-8 border border-brand-100">
                  <h3 className="text-[10px] font-bold text-brand-800 uppercase tracking-widest mb-3 border-b border-brand-100 pb-2">Shipping To</h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-medium">
                    {addressMode === 'saved' ? (
                      <>
                        {selectedSavedAddress?.streetAddress}<br />
                        {selectedSavedAddress?.city}, {selectedSavedAddress?.state} - {selectedSavedAddress?.zipCode}
                      </>
                    ) : (
                      <>
                        {newAddr.streetAddress}<br />
                        {newAddr.city}, {newAddr.state} - {newAddr.zipCode}
                      </>
                    )}
                  </p>
                  <button onClick={() => setStep(2)} className="text-xs text-brand-800 font-bold uppercase tracking-wider mt-3 hover:underline">
                    Edit Address
                  </button>
                </div>

                <div className="bg-surface rounded-2xl p-5 border border-brand-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                     <Truck className="text-brand-800" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Cash on Delivery (COD) Available</p>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">You will pay when the order arrives at your doorstep. Secure and hassle-free.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Order Summary Area */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="sticky top-32 bg-white rounded-3xl border border-brand-100 p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-ink mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span className="font-medium">Subtotal ({cart.items.length} items)</span>
                  <span className="font-bold text-ink">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {step >= 2 ? (
                  <div className="flex justify-between text-ink-muted">
                    <span className="font-medium">Delivery Charge</span>
                    <span className="font-bold text-ink">
                      {deliveryCharge === 0 ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Free</span> : `₹${deliveryCharge.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-ink-muted">
                    <span className="font-medium">Delivery</span>
                    <span className="text-ink-faint italic text-xs">Calculated at checkout</span>
                  </div>
                )}
              </div>
              
              <div className="h-px bg-brand-100 mb-6" />
              
              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-ink uppercase tracking-wider">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-brand-800">
                    ₹{step >= 2 ? total.toLocaleString('en-IN') : subtotal.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-ink-faint font-medium uppercase tracking-wider mt-1">Inclusive of all taxes</p>
                </div>
              </div>

              {/* Action Buttons based on Step */}
              {step === 1 && (
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-[#6B0F1A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#5a0c16] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              )}
              
              {step === 2 && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-4 py-4 bg-surface text-ink-muted rounded-xl border border-brand-200 hover:text-ink hover:bg-brand-50 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button 
                    onClick={validateAddressAndProceed}
                    className="flex-1 bg-[#6B0F1A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#5a0c16] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={isPlacingOrder}
                    className="px-4 py-4 bg-surface text-ink-muted rounded-xl border border-brand-200 hover:text-ink hover:bg-brand-50 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button 
                    onClick={placeOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-[#6B0F1A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#5a0c16] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isPlacingOrder ? 'Processing...' : 'Place Order Now'}
                  </button>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-ink-faint text-xs font-medium">
                 <Lock size={12} /> Secure Checkout via Hema Sarees
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
