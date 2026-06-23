'use client';

import React from 'react';
import { Heart, ShoppingBag, Check, Truck, ShieldCheck, RefreshCw, Star, Lock, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductInfoProps {
  product: any;
  displayPrice: number;
  isInWishlist: (id: string) => boolean;
  handleWishlist: (id: string) => void;
  polish: boolean;
  setPolish: (val: boolean) => void;
  POLISH_PRICE: number;
  isPolishEnabled?: boolean;
  addToCart: (qty: number) => Promise<void>;
  isAddingToCart: boolean;
  router: any;
  reviewStats?: { avgRating: number; totalReviews: number; distribution: number[] };
}

export default function ProductInfo({ 
  product, displayPrice, isInWishlist, handleWishlist, 
  polish, setPolish, POLISH_PRICE, isPolishEnabled = true, addToCart, isAddingToCart, router,
  reviewStats
}: ProductInfoProps) {
  // Use real MRP if available, otherwise calculate simulated
  const mrp = product.mrp || Math.round(displayPrice * 1.25);
  const discountPercent = mrp > displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title & Wishlist */}
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-ink leading-tight">{product.name}</h1>
          <button 
            onClick={() => handleWishlist(product.id)} 
            className="w-11 h-11 rounded-full border border-surface-subtle flex items-center justify-center text-ink-muted hover:text-brand-800 hover:bg-brand-50 transition-all shrink-0 active:scale-95"
          >
            <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-brand-800 text-brand-800' : ''}`} />
          </button>
        </div>

        {/* Dynamic Rating — only shows if reviews exist */}
        {reviewStats && reviewStats.totalReviews > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(reviewStats.avgRating) ? 'currentColor' : 'none'} className={i < Math.round(reviewStats.avgRating) ? 'text-accent' : 'text-surface-subtle'} />
              ))}
            </div>
            <span className="text-xs text-ink-muted font-medium">
              {reviewStats.avgRating} ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-ink tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</p>
          {discountPercent > 0 && (
            <>
              <span className="text-lg text-ink-faint line-through">₹{mrp.toLocaleString('en-IN')}</span>
              <span className="text-sm font-bold text-dark-green bg-green-50 px-2 py-0.5 rounded-md">{discountPercent}% OFF</span>
            </>
          )}
        </div>
        <p className="text-xs text-ink-faint mt-1">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div>
        {product.stock === 0 ? (
          <p className="text-sm font-semibold text-error">Currently out of stock</p>
        ) : product.stock <= 5 ? (
          <p className="text-sm font-semibold text-warning flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Only {product.stock} left — order soon!
          </p>
        ) : (
          <p className="text-sm font-medium text-dark-green flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-dark-green" /> In Stock
          </p>
        )}
      </div>

      {/* Fabric Info */}
      {product.fabric && (
        <div className="bg-surface-muted rounded-xl px-4 py-3">
          <p className="text-xs text-ink-faint uppercase tracking-wider mb-0.5">Fabric</p>
          <p className="text-sm font-medium text-ink">{product.fabric}</p>
        </div>
      )}

      {/* Polish Options */}
      {isPolishEnabled !== false && (
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-ink">Polish Option</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => setPolish(true)} className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${polish ? 'border-brand-800 bg-brand-50 shadow-sm' : 'border-surface-subtle bg-white hover:border-brand-200'}`}>
              <div><p className="font-semibold text-sm text-left">With Polish</p><p className="text-xs text-ink-faint text-left">+₹{POLISH_PRICE}</p></div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${polish ? 'bg-brand-800 border-brand-800' : 'border-surface-subtle'}`}>{polish && <Check size={11} className="text-white" />}</div>
            </button>
            <button onClick={() => setPolish(false)} className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${!polish ? 'border-brand-800 bg-brand-50 shadow-sm' : 'border-surface-subtle bg-white hover:border-brand-200'}`}>
              <p className="font-semibold text-sm">Without Polish</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${!polish ? 'bg-brand-800 border-brand-800' : 'border-surface-subtle'}`}>{!polish && <Check size={11} className="text-white" />}</div>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => addToCart(1)} disabled={product.stock === 0 || isAddingToCart} className="flex-1 bg-surface-muted text-brand-800 border border-brand-800/30 py-3.5 rounded-xl font-bold text-base hover:bg-brand-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-ink-faint disabled:text-ink-faint active:scale-[0.98]">
          {isAddingToCart ? <div className="w-5 h-5 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
          {product.stock > 0 ? (isAddingToCart ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </button>
        <button onClick={() => router.push(`/cart?buyNow=${product.id}&polish=${polish}`)} disabled={product.stock === 0 || isAddingToCart} className="flex-1 bg-brand-800 text-white py-3.5 rounded-xl font-bold text-base hover:bg-brand-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-brand-sm active:scale-[0.98]">
          Buy Now
        </button>
      </div>

      {/* Delivery Estimate */}
      <div className="bg-surface-muted rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Truck size={18} className="text-dark-green flex-shrink-0" />
          <div>
            <p className="font-medium text-ink">Estimated delivery by {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* WhatsApp Inquiry */}
      <a
        href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (₹${product.price.toLocaleString('en-IN')}). Can you help me?`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all active:scale-[0.98]"
      >
        <MessageCircle size={18} />
        Inquire on WhatsApp
      </a>

       {/* Trust Badges */}
       <div className="grid grid-cols-2 gap-3">
         {[
           { icon: ShieldCheck, label: '100% Genuine' },
           { icon: Truck, label: 'Secure Shipping' },
           { icon: Lock, label: 'Safe Checkout' },
           { icon: RefreshCw, label: '7-Day Returns' },
         ].map(badge => (
           <div key={badge.label} className="flex flex-col items-center text-center gap-1.5 py-3 bg-surface-muted rounded-xl">
             <badge.icon size={18} className="text-accent" />
             <span className="text-[10px] font-medium text-ink-muted leading-tight">{badge.label}</span>
           </div>
         ))}
       </div>
    </motion.div>
  );
}
