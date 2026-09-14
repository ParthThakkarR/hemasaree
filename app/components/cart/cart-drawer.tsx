'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCart } from '@contexts/cart-context';

/** Free-shipping threshold (INR) — matches PDP trust copy. */
export const FREE_SHIPPING_THRESHOLD = 999;

function getImageSrc(img?: string) {
  if (!img) return '/uploads/placeholder.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.replace(/^\/+/, '/');
}

/**
 * Cart drawer — slide-in confirmation on add-to-cart.
 * Carries 80% of mobile purchase momentum: progress to free shipping,
 * estimated total, and a single path to checkout.
 */
export default function CartDrawer() {
  const { cart, cartCount, isCartOpen, closeCart } = useCart();
  const prefersReducedMotion = useReducedMotion();

  // Lock body scroll + Escape to close
  useEffect(() => {
    if (!isCartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isCartOpen, closeCart]);

  const items = cart?.items ?? [];
  const subtotal =
    cart?.totalPrice ?? items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const previewItems = items.slice(0, 3);

  const panelVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { type: 'spring' as const, bounce: 0, duration: 0.35 } },
        exit: { x: '100%', transition: { duration: 0.2 } },
      };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Shopping bag">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-midnight/50 backdrop-blur-[2px]"
            onClick={closeCart}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-chandan shadow-immersive flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-chandan-warm">
              <h2 className="font-noto-serif text-lg font-bold text-kajal flex items-center gap-2">
                <ShoppingBag size={18} aria-hidden="true" />
                Your Bag
                {cartCount > 0 && (
                  <span className="text-xs font-inter font-semibold bg-kumkum text-white rounded-full min-w-[22px] h-[22px] inline-flex items-center justify-center px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full hover:bg-chandan-deep flex items-center justify-center text-kajal-soft hover:text-kajal transition-colors touch-target"
                aria-label="Close bag"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
                <ShoppingBag size={48} strokeWidth={1} className="text-kajal-faint" aria-hidden="true" />
                <p className="font-noto-serif text-xl font-bold text-kajal">Your bag is empty</p>
                <p className="text-sm text-kajal-soft">Each saree here has a woman behind it. Go find the one that speaks to you.</p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-2 inline-flex items-center gap-2 bg-kumkum text-chandan px-6 py-3 rounded-xl font-bold hover:bg-kumkum-deep transition-colors"
                >
                  Discover sarees <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                {/* Free-shipping progress */}
                <div className="px-5 pt-4">
                  {remaining > 0 ? (
                    <p className="text-xs font-medium text-kajal-soft mb-2">
                      Add <span className="font-bold text-kumkum">₹{remaining.toLocaleString('en-IN')}</span> more for free shipping
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-neem mb-2 flex items-center gap-1.5">
                      <Truck size={14} aria-hidden="true" /> You&apos;ve unlocked free shipping
                    </p>
                  )}
                  <div
                    className="h-1.5 rounded-full bg-chandan-warm overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progress to free shipping"
                  >
                    <div className="shipping-progress h-full" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>

                {/* Items preview */}
                <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {previewItems.map((item) => (
                    <li key={item.id} className="flex gap-3 paper-surface rounded-xl p-2.5">
                      <div className="relative w-14 h-[72px] rounded-lg overflow-hidden bg-chandan-deep flex-shrink-0">
                        <Image
                          src={getImageSrc(item.productImage)}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kajal line-clamp-2 leading-snug">{item.productName}</p>
                        <p className="text-xs text-kajal-whisper mt-0.5">Qty {item.quantity}</p>
                        <p className="text-sm font-bold text-kajal mt-1">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </li>
                  ))}
                  {items.length > previewItems.length && (
                    <li className="text-center text-xs text-kajal-whisper font-medium pt-1">
                      + {items.length - previewItems.length} more item{items.length - previewItems.length !== 1 ? 's' : ''} in your bag
                    </li>
                  )}
                </ul>

                {/* Summary + CTAs */}
                <div className="border-t border-chandan-warm px-5 py-4 space-y-3 bg-chandan-deep/50">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-kajal-soft">
                      Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})
                    </span>
                    <span className="text-xl font-bold text-kajal">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-kajal-whisper">Shipping &amp; taxes calculated at checkout · COD available</p>
                  <div className="flex gap-2">
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-kumkum/30 text-kumkum font-bold py-3 rounded-xl hover:bg-kumkum/5 transition-colors text-sm"
                    >
                      View Bag
                    </Link>
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="flex-[1.4] inline-flex items-center justify-center gap-2 bg-kumkum text-chandan font-bold py-3 rounded-xl hover:bg-kumkum-deep transition-colors shadow-brand-sm text-sm"
                    >
                      Checkout <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                  <button
                    onClick={closeCart}
                    className="w-full text-center text-xs font-semibold text-kajal-whisper hover:text-kajal transition-colors py-1"
                  >
                    Continue shopping
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-kajal-whisper font-medium">
                    <ShieldCheck size={12} aria-hidden="true" /> Secure checkout · 7-day returns · 100% genuine
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
