'use client';

import React from 'react';
import { ArrowRight, ArrowLeft, Lock, Loader2, Truck, ShieldCheck } from 'lucide-react';

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
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string | null;
  discount: number;
  isApplyingCoupon: boolean;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
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
  placeOrder,
  couponCode,
  setCouponCode,
  appliedCoupon,
  discount,
  isApplyingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon
}: CartOrderSummaryProps) {
  return (
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
              ₹{deliveryCharge.toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-ink-muted">
            <span className="font-medium">Delivery</span>
            <span className="text-ink-faint italic text-xs">Calculated at checkout</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-dark-green">
            <span className="font-medium">Discount ({appliedCoupon})</span>
            <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-ink mb-2">Have a coupon?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon || isApplyingCoupon}
              placeholder="Enter code"
              className="flex-1 bg-surface-muted border border-surface-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-800/20 focus:border-brand-800 disabled:opacity-50 uppercase placeholder:normal-case transition-all"
            />
            {appliedCoupon ? (
              <button
                onClick={handleRemoveCoupon}
                className="bg-error/10 text-error px-4 py-3 rounded-xl font-bold text-sm hover:bg-error/20 transition-all"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isApplyingCoupon}
                className="bg-brand-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-900 transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {isApplyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
              </button>
            )}
          </div>
        </div>
      )}
      
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
      
      <div className="mt-8 pt-6 border-t border-brand-100 flex items-center justify-between gap-2 text-ink-faint text-xs font-medium">
         <div className="flex flex-col items-center gap-1"><Lock size={16} className="text-accent" /> Secure</div>
         <div className="flex flex-col items-center gap-1"><Truck size={16} className="text-accent" /> Shipping</div>
         <div className="flex flex-col items-center gap-1"><ShieldCheck size={16} className="text-accent" /> Genuine</div>
      </div>
    </div>
  );
}
