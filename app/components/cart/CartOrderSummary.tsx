'use client';

import React from 'react';
import { ArrowRight, ArrowLeft, Lock } from 'lucide-react';

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
            {isPlacingOrder ? 'Processing...' : 'Place Order Now'}
          </button>
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-center gap-2 text-ink-faint text-xs font-medium">
         <Lock size={12} /> Secure Checkout via Hema Sarees
      </div>
    </div>
  );
}
