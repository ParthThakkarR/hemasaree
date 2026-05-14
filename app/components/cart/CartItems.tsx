'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartItemsProps {
  cart: { items: any[] };
  isLoading: boolean;
  handleQuantity: (id: string, q: number) => void;
  handleRemove: (id: string) => void;
  getImageSrc: (src?: string) => string;
}

export default function CartItems({ cart, isLoading, handleQuantity, handleRemove, getImageSrc }: CartItemsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {cart.items.map((item, index) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          key={item.id}
          className="bg-white rounded-2xl border border-brand-100 p-4 flex gap-6 items-center shadow-sm hover:shadow-md transition-shadow"
        >
          <Link href={`/product/${item.productId}`} className="shrink-0 relative w-24 h-32 overflow-hidden rounded-xl bg-surface-muted block">
            <Image 
              src={getImageSrc(item.productImage)} 
              alt={item.productName} 
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
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
        </motion.div>
      ))}

      <Link href="/products" className="inline-flex items-center gap-2 text-brand-800 font-semibold hover:text-brand-900 transition-colors mt-6 uppercase tracking-wider text-sm underline underline-offset-4 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
      </Link>
    </motion.div>
  );
}
