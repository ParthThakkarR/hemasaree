'use client';

import React from 'react';
import { ArrowRight, ArrowLeft, Lock, Loader2, Truck } from 'lucide-react';

interface CartOrderSummaryProps {
  cart: { items: any[] };
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  isPlacingOrder: boolean;
  validateAddressAndProceed: () => void;
  placeOrder: () => void;
}

export default function CartOrderSummary({ 
  cart, 
  step, 
  setStep, 
  subtotal, 
  deliveryCharge, 
  total, 
  isPlacingOrder, 
  validateAddressAndProceed, 
  placeOrder 
}: CartOrderSummaryProps) {
  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  return (
    <div className="sticky top-32 bg-white rounded-3xl border border-brand-100 p-8 shadow-sm">
      <h2 className="text-xl font-serif font-bold text-ink mb-6">Order Summary</h2>
      
      {remainingForFreeShipping > 0 && step === 1 && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-2">
            <Truck size={16} />
            <span>Add ₹{remainingForFreeShipping.toLocaleString('en-IN')} more for FREE delivery</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}
      
      {remainingForFreeShipping === 0 && step === 1 && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm font-medium">
          <Truck size={16} />
          <span>You've unlocked FREE delivery!</span>
        </div>
      )}
      
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

      {step === 1 && (
        <button 
          onClick={() => setStep(2)}
          className="w-full bg-brand-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-900 hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
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
            className="flex-1 bg-brand-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-900 hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
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
            className="flex-1 bg-brand-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-900 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait transform hover:-translate-y-1"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={14} />
                Place Order Now
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-center gap-2 text-ink-faint text-xs font-medium">
         <Lock size={12} /> Secure Checkout via Hema Sarees
      </div>
    </div>
  );
}
