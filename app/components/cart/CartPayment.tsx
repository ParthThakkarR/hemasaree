'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck } from 'lucide-react';

interface CartPaymentProps {
  addressMode: 'saved' | 'new';
  selectedSavedAddress: any;
  newAddr: any;
  setStep: (step: 1 | 2 | 3) => void;
}

export default function CartPayment({ addressMode, selectedSavedAddress, newAddr, setStep }: CartPaymentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl border border-brand-100 p-6 md:p-10 shadow-sm"
    >
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

      <div className="bg-surface rounded-2xl p-5 border border-brand-200 flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
           <Truck className="text-brand-800" size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-ink">Cash on Delivery (COD) Available</p>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">You will pay when the order arrives at your doorstep. Secure and hassle-free.</p>
        </div>
      </div>
    </motion.div>
  );
}
