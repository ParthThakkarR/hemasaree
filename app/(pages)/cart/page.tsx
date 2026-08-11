'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { State, City } from 'country-state-city';
import { ArrowRight, ShieldCheck, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '@contexts/cart-context';
import { useAuth } from '@contexts/auth-context';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import CartItems from '@/app/components/cart/CartItems';
import CartShipping from '@/app/components/cart/CartShipping';
import CartPayment from '@/app/components/cart/CartPayment';
import CartOrderSummary from '@/app/components/cart/CartOrderSummary';


function CartPageContent() {
  const router = useRouter();
  const { cart, isLoading, updateQuantity, removeItem, refreshCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [settings, setSettings] = useState({ deliveryChargeGujarat: 80, deliveryChargeDefault: 150 });
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Artisan blessing note — optional message to the weaver
  const [blessingNote, setBlessingNote] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if(data && !data.error) setSettings(data);
    }).catch(console.error);
  }, []);
  
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get('buyNow');
  const buyNowPolish = searchParams.get('polish') === 'true';
  const [buyNowProduct, setBuyNowProduct] = useState<any>(null);
  const [isFetchingBuyNow, setIsFetchingBuyNow] = useState(!!buyNowProductId);

  useEffect(() => {
    if (buyNowProductId) {
      setIsFetchingBuyNow(true);
      fetch(`/api/products?id=${buyNowProductId}`)
        .then(res => res.json())
        .then(data => {
          // If the API returns an array, pick the first one matching id, else use data directly if it's an object.
          // In /api/products, we usually get a list or single product.
          // Wait, GET /api/products returns all products. I'll fetch them all and find it, or use the single product endpoint if it exists.
          // Let's assume /api/admin/products?id= works or we just use GET /api/products and find it.
          // Actually, let's just do a direct fetch to the product details API if they have one.
          // They have `/api/products/[id]` or similar? The easiest way is fetching all products or the specific one.
          // Let me check if there's a specific route. I'll just fetch all products and find the matching ID.
          fetch(`/api/products`)
            .then(r => r.json())
            .then(all => {
               const p = Array.isArray(all) ? all.find((x: any) => x.id === buyNowProductId) : null;
               if (p) setBuyNowProduct(p);
            })
            .finally(() => setIsFetchingBuyNow(false));
        })
        .catch(() => setIsFetchingBuyNow(false));
    }
  }, [buyNowProductId]);

  const effectiveCart = useMemo(() => {
    if (buyNowProductId && buyNowProduct) {
      return {
        id: 'temp-buynow',
        items: [{
          id: 'temp-item',
          productId: buyNowProduct.id,
          product: buyNowProduct,
          productName: buyNowProduct.name,
          productImage: buyNowProduct.images?.[0] || '',
          price: buyNowProduct.price + (buyNowPolish ? 450 : 0),
          quantity: 1,
          withPolish: buyNowPolish
        }],
        totalPrice: buyNowProduct.price + (buyNowPolish ? 450 : 0)
      };
    }
    return cart;
  }, [cart, buyNowProductId, buyNowProduct, buyNowPolish]);

  // Recalculate discount if cart changes
  useEffect(() => {
    if (appliedCoupon && effectiveCart) {
      handleApplyCoupon(appliedCoupon);
    }
  }, [effectiveCart]);
  
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
  const subtotal = useMemo(() => effectiveCart?.totalPrice || 0, [effectiveCart]);
  
  const activeState = useMemo(() => {
    if (step < 2) return null;
    return addressMode === 'saved' ? selectedSavedAddress?.state : newAddr.state;
  }, [step, addressMode, selectedSavedAddress, newAddr.state]);

  const deliveryCharge = useMemo(() => {
    if (!activeState) return 0;
    const normalizedState = activeState.toLowerCase().trim();
    return normalizedState === 'gujarat' ? settings.deliveryChargeGujarat : settings.deliveryChargeDefault;
  }, [activeState, settings]);

  const total = Math.max(0, subtotal + deliveryCharge - discount);

  // Actions
  const handleApplyCoupon = async (codeOverride?: string) => {
    const codeToApply = typeof codeOverride === 'string' ? codeOverride : couponCode;
    if (!codeToApply.trim() || !effectiveCart?.items.length) return;
    
    setIsApplyingCoupon(true);
    try {
      const res = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToApply,
          items: effectiveCart.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          }))
        })
      });
      const data = await res.json();
      
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid coupon');
      }
      
      setAppliedCoupon(data.offerCode || codeToApply.toUpperCase());
      setDiscount(data.discount);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    toast.success('Coupon removed');
  };
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
      const payload: any = { address: finalAddress };
      if (buyNowProductId && buyNowProduct) {
        payload.buyNowItem = {
          productId: buyNowProductId,
          quantity: 1,
          withPolish: buyNowPolish
        };
      }
      
      if (appliedCoupon) {
        payload.offerCode = appliedCoupon;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      
      toast.success('Your chapter begins ♥');
      await refreshCart();
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

  // Render States
  if (!user) {
    return (
      <div className="min-h-screen bg-chandan pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <Lock className="w-16 h-16 text-kajal-faint mb-6" strokeWidth={1} />
        <h2 className="font-noto-serif text-3xl font-bold text-kajal mb-4">Return home first</h2>
        <p className="text-kajal-soft mb-8 max-w-xs">
          Sign in to continue the adoption. Your sarees are waiting.
        </p>
        <Link href="/login" className="bg-kumkum text-chandan px-8 py-3 rounded-xl font-bold hover:bg-kumkum-deep transition-colors">
          Return home
        </Link>
      </div>
    );
  }

  const combinedLoading = isLoading || isFetchingBuyNow;

  if (combinedLoading && !effectiveCart) {
    return (
      <div className="min-h-screen bg-chandan pt-32 pb-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-chandan-warm border-t-kumkum rounded-full animate-spin" />
      </div>
    );
  }

  if (!effectiveCart || effectiveCart.items.length === 0) {
    return (
      <div className="min-h-screen bg-chandan pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0 }}>
          <ShoppingBag className="w-20 h-20 text-chandan-warm mb-6 mx-auto" strokeWidth={1} />
        </motion.div>
        <h2 className="font-noto-serif text-3xl font-bold text-kajal mb-4">No stories chosen yet</h2>
        <p className="text-kajal-soft mb-8 max-w-md">
          Each saree here has a woman behind it, a region, a craft. Go find the one that speaks to you.
        </p>
        <Link href="/products" className="bg-kumkum text-chandan px-8 py-3 rounded-xl font-bold hover:bg-kumkum-deep transition-colors">
          Discover sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chandan pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header — The Adoption Ritual */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="chapter-eyebrow mb-1">The Adoption Ritual</p>
            <h1 className="font-noto-serif text-4xl font-bold text-kajal">Seal the promise</h1>
            <p className="text-kajal-soft mt-2 text-sm">Three steps. Then it&apos;s yours &mdash; and you are hers.</p>
          </div>
          
          {/* Step indicators — ritual names */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className={step === 1 ? 'text-kumkum bg-kumkum/8 px-2.5 py-1 rounded-lg' : 'text-kajal-faint'}>Your stories</span>
            <ArrowRight size={12} className="text-kajal-faint" />
            <span className={step === 2 ? 'text-kumkum bg-kumkum/8 px-2.5 py-1 rounded-lg' : 'text-kajal-faint'}>Where it goes</span>
            <ArrowRight size={12} className="text-kajal-faint" />
            <span className={step === 3 ? 'text-kumkum bg-kumkum/8 px-2.5 py-1 rounded-lg' : 'text-kajal-faint'}>Honour the hands</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <CartItems 
                  key="step1"
                  cart={effectiveCart}
                  isLoading={combinedLoading}
                  handleQuantity={handleQuantity}
                  handleRemove={handleRemove}
                  getImageSrc={getImageSrc}
                />
              )}
              {step === 2 && (
                <CartShipping 
                  key="step2"
                  savedAddresses={savedAddresses}
                  addressMode={addressMode}
                  setAddressMode={setAddressMode}
                  selectedSavedAddress={selectedSavedAddress}
                  setSelectedSavedAddress={setSelectedSavedAddress}
                  newAddr={newAddr}
                  setNewAddr={setNewAddr}
                  states={states}
                  cities={cities}
                />
              )}
              {step === 3 && (
                <motion.div
                  key="step3-ritual"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Optional blessing note */}
                  <div className="paper-surface rounded-2xl p-6">
                    <h2 className="font-noto-serif text-xl font-bold text-kajal mb-1">
                      A note to the weaver
                      <span className="ml-2 text-sm text-kajal-whisper font-normal font-inter">(optional)</span>
                    </h2>
                    <p className="text-sm text-kajal-soft mb-4 leading-relaxed">
                      We&apos;ll print this on a handmade card and place it in the box. Sometimes the artisan
                      writes back. Most times the cloth already said everything.
                    </p>
                    <textarea
                      id="blessing-note"
                      value={blessingNote}
                      onChange={(e) => setBlessingNote(e.target.value)}
                      maxLength={200}
                      rows={3}
                      placeholder="Thank you for the 47 days…"
                      aria-label="Optional message to the artisan"
                      className="w-full px-4 py-3 rounded-xl border border-chandan-warm bg-chandan text-kajal text-sm resize-none input-press placeholder:text-kajal-faint focus:border-haldi focus:ring-2 focus:ring-haldi/20 outline-none transition"
                    />
                    <p className="text-xs text-kajal-faint mt-1.5 text-right">{blessingNote.length}/200</p>
                  </div>

                  <CartPayment
                    addressMode={addressMode}
                    selectedSavedAddress={selectedSavedAddress}
                    newAddr={newAddr}
                    setStep={setStep}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Area */}
          <div className="w-full lg:w-[420px] shrink-0">
             <CartOrderSummary 
                cart={effectiveCart}
                step={step}
                setStep={setStep}
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                total={total}
                isPlacingOrder={isPlacingOrder}
                validateAddressAndProceed={validateAddressAndProceed}
                placeOrder={placeOrder}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                discount={discount}
                isApplyingCoupon={isApplyingCoupon}
                handleApplyCoupon={handleApplyCoupon}
                handleRemoveCoupon={handleRemoveCoupon}
             />
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-chandan pt-32 pb-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-chandan-warm border-t-kumkum rounded-full animate-spin" />
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}
