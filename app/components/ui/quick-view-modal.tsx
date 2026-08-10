'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion, animate } from 'framer-motion';
import { useCart }     from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth }     from '@contexts/auth-context';
import { useRouter }   from 'next/navigation';
import toast           from 'react-hot-toast';

interface QuickViewModalProps {
  product     : any;
  onClose     : () => void;
  getImageSrc : (img?: string) => string;
  originRect  ?: DOMRect; // card's bounding rect for origin-aware spring
}

function vibrate(pattern: number | number[]) {
  navigator.vibrate?.(pattern);
}

const DISMISS_VELOCITY_THRESHOLD = 400; // px/s
const DISMISS_OFFSET_THRESHOLD   = 120; // px

export default function QuickViewModal({ product, onClose, getImageSrc, originRect }: QuickViewModalProps) {
  const [currentImage, setCurrentImage]     = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isVisible, setIsVisible]           = useState(true);

  const { addToCart }                = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user }                     = useAuth();
  const router                       = useRouter();
  const prefersReducedMotion         = useReducedMotion();

  const inWishlist    = isInWishlist(product.id);
  const outOfStock    = typeof product.stock === 'number' && product.stock <= 0;
  const mrp           = product.mrp || Math.round(product.price * 1.25);
  const discountPercent = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

  // Drag-down dismiss state
  const y            = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  // Velocity tracking for drag-down
  const velSamples   = useRef<{ t: number; y: number }[]>([]);
  const dragActive   = useRef(false);
  const startYRef    = useRef(0);
  const startMVRef   = useRef(0);

  // Close on Escape
  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    // Small delay to let exit animation play
    setTimeout(onClose, 350);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  const handleAddToCart = async () => {
    if (outOfStock || isAddingToCart) return;
    try {
      setIsAddingToCart(true);
      await addToCart({
        productId   : product.id,
        quantity    : 1,
        productName : product.name,
        productImage: getImageSrc(product.images?.[0]),
        price       : product.price,
      });
      vibrate([10]);
    } catch (err) {
      console.error(err);
      vibrate([5, 50, 50]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (outOfStock) return;
    await handleAddToCart();
    router.push('/cart');
    handleClose();
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      router.push('/login');
      return;
    }
    toggleWishlist(product.id);
    if (!inWishlist) toast.success('Added to wishlist');
  };

  const images   = product.images || [];
  const nextImage = () => setCurrentImage(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage(prev => (prev - 1 + images.length) % images.length);

  // ── Drag-down dismiss handlers ────────────────────
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    dragActive.current  = true;
    startYRef.current   = e.clientY;
    startMVRef.current  = y.get();
    velSamples.current  = [{ t: performance.now(), y: e.clientY }];
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActive.current) return;
    const delta  = e.clientY - startYRef.current;
    // Only allow downward drag
    const rawY   = Math.max(0, startMVRef.current + delta);
    y.set(rawY);

    const now = performance.now();
    velSamples.current.push({ t: now, y: e.clientY });
    velSamples.current = velSamples.current.filter(s => now - s.t < 80);
  };

  const handleDragPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActive.current) return;
    dragActive.current = false;

    const samples   = velSamples.current;
    let velocity    = 0;
    if (samples.length >= 2) {
      const oldest = samples[0];
      const newest = samples[samples.length - 1];
      const dt     = newest.t - oldest.t;
      if (dt > 0) velocity = (newest.y - oldest.y) / dt * 1000;
    }
    velSamples.current = [];

    const currentY = y.get();
    const shouldDismiss = velocity > DISMISS_VELOCITY_THRESHOLD || currentY > DISMISS_OFFSET_THRESHOLD;

    if (shouldDismiss) {
      // Animate off-screen, then close
      animate(y, window.innerHeight, {
        type: 'spring', bounce: 0, duration: 0.3,
        velocity: velocity / 1000,
      });
      setTimeout(handleClose, 200);
    } else {
      // Spring back to center
      animate(y, 0, { type: 'spring', bounce: 0.15, duration: 0.35, velocity: velocity / 1000 });
    }
  };

  // ── Origin-aware modal variants ───────────────────
  const computeOrigin = () => {
    if (!originRect) return '50% 50%';
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const originX = ((originRect.left + originRect.width  / 2) / vpW * 100).toFixed(1) + '%';
    const originY = ((originRect.top  + originRect.height / 2) / vpH * 100).toFixed(1) + '%';
    return `${originX} ${originY}`;
  };

  const origin = computeOrigin();

  const modalVariants = prefersReducedMotion
    ? {
        hidden : { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit   : { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        hidden : { opacity: 0, scale: 0.88 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { type: 'spring' as const, bounce: 0, duration: 0.4 },
        },
        exit: {
          opacity: 0,
          scale: 0.92,
          transition: { duration: 0.2, ease: 'easeIn' as const },
        },
      };

  const backdropVariants = {
    hidden : { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit   : { opacity: 0, transition: { duration: 0.2 } },
  };

  const SPRING_PRESS = { type: 'spring' as const, bounce: 0, duration: 0.3 };
  const buttonTap    = prefersReducedMotion ? {} : { scale: 0.96 };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ opacity: backdropOpacity }}
            onClick={handleClose}
          />

          {/* Modal — drag-down container */}
          <motion.div
            style={{ y, transformOrigin: origin }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden z-10"
          >
            {/* Drag handle — grab this to dismiss */}
            <div
              className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 touch-none"
              onPointerDown={handleDragPointerDown}
              onPointerMove={handleDragPointerMove}
              onPointerUp={handleDragPointerUp}
              onPointerCancel={handleDragPointerUp}
              aria-label="Drag down to close"
            >
              <div className="w-10 h-1 bg-surface-subtle rounded-full mt-2 opacity-60" />
            </div>

            {/* Close Button */}
            <motion.button
              whileTap={buttonTap}
              transition={SPRING_PRESS}
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </motion.button>

            <div className="flex flex-col md:flex-row max-h-[85vh]">
              {/* Image Side */}
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-surface-muted flex-shrink-0">
                <Image
                  src={getImageSrc(images[currentImage])}
                  alt={product.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <motion.button
                      whileTap={buttonTap}
                      transition={SPRING_PRESS}
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-muted hover:text-ink shadow-sm transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </motion.button>
                    <motion.button
                      whileTap={buttonTap}
                      transition={SPRING_PRESS}
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-muted hover:text-ink shadow-sm transition-colors"
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`h-1.5 rounded-full transition-all ${i === currentImage ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Info Side */}
              <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
                {/* Category */}
                {product.category && (
                  <p className="text-xs text-ink-faint uppercase tracking-wider font-medium mb-2">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                  </p>
                )}

                <h2 className="font-serif text-2xl font-bold text-ink mb-3 leading-tight">{product.name}</h2>

                {/* Rating */}
                {product.reviewStats && product.reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.round(product.reviewStats.avgRating) ? 'currentColor' : 'none'} className={i < Math.round(product.reviewStats.avgRating) ? 'text-accent' : 'text-surface-subtle'} />
                      ))}
                    </div>
                    <span className="text-xs text-ink-muted font-medium">
                      {product.reviewStats.avgRating} ({product.reviewStats.totalReviews} review{product.reviewStats.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-2xl font-bold text-ink">₹{product.price.toLocaleString('en-IN')}</span>
                  {mrp > product.price && (
                    <>
                      <span className="text-base text-ink-faint line-through">₹{mrp.toLocaleString('en-IN')}</span>
                      <span className="text-sm font-bold text-dark-green">{discountPercent}% OFF</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-ink-faint mb-5">Inclusive of all taxes</p>

                {/* Stock Status */}
                {outOfStock ? (
                  <p className="text-sm font-semibold text-error mb-5">Currently out of stock</p>
                ) : product.stock && product.stock <= 5 ? (
                  <p className="text-sm font-semibold text-warning mb-5">Only {product.stock} left in stock!</p>
                ) : (
                  <p className="text-sm font-medium text-dark-green mb-5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-dark-green" /> In Stock
                  </p>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-ink-muted leading-relaxed mb-6 line-clamp-3">{product.description}</p>
                )}

                {/* Actions */}
                <div className="mt-auto space-y-3">
                  <div className="flex gap-3">
                    <motion.button
                      whileTap={buttonTap}
                      transition={SPRING_PRESS}
                      onClick={handleAddToCart}
                      disabled={outOfStock || isAddingToCart}
                      className="flex-1 bg-surface-muted text-brand-800 border border-brand-800/30 py-3 rounded-xl font-semibold text-sm hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingToCart ? (
                        <div className="w-4 h-4 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShoppingBag size={17} />
                      )}
                      Add to Cart
                    </motion.button>
                    <motion.button
                      whileTap={buttonTap}
                      transition={SPRING_PRESS}
                      onClick={handleBuyNow}
                      disabled={outOfStock || isAddingToCart}
                      className="flex-1 bg-brand-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-brand-sm"
                    >
                      Buy Now
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={buttonTap}
                    transition={SPRING_PRESS}
                    onClick={handleWishlist}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-ink-muted hover:text-brand-800 transition-colors"
                  >
                    <Heart size={16} className={inWishlist ? 'fill-brand-800 text-brand-800' : ''} />
                    {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
                  </motion.button>

                  <Link
                    href={`/product/${product.id}`}
                    onClick={handleClose}
                    className="block text-center text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-2 transition-colors"
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
