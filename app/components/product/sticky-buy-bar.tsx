'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCart } from '@contexts/cart-context';
import { useAuth } from '@contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface StickyBuyBarProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    stock?: number;
    images?: string[];
  };
  displayPrice: number;
  isAddingToCart: boolean;
  onAddToCart: () => void;
}

const SPRING_BTN = { type: 'spring' as const, bounce: 0, duration: 0.3 };

/**
 * Mobile-only sticky buy bar that appears when the main CTA scrolls out of view.
 * Anchored to the bottom of the screen, above the mobile nav.
 */
export default function StickyBuyBar({
  product,
  displayPrice,
  isAddingToCart,
  onAddToCart,
}: StickyBuyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { addToCart } = useCart();

  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;

  // Observe the main CTA section — show bar when it scrolls out of view
  useEffect(() => {
    const mainCta = document.getElementById('product-main-cta');
    if (!mainCta) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' } // account for sticky navbar
    );

    observer.observe(mainCta);
    return () => observer.disconnect();
  }, []);

  const handleBuyNow = async () => {
    if (outOfStock || isAddingToCart) return;
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: displayPrice,
      });
      router.push('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  const barVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1, transition: SPRING_BTN },
        exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-[var(--mobile-nav-height,4.25rem)] left-0 right-0 z-40 lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="bg-chandan/95 backdrop-blur-xl border-t border-chandan-warm shadow-[0_-4px_20px_rgba(26,22,20,0.08)] px-4 py-3">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-kajal-whisper truncate">{product.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-kajal">
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </span>
                  {product.mrp && product.mrp > displayPrice && (
                    <span className="text-xs text-kajal-faint line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_BTN}
                  onClick={onAddToCart}
                  disabled={outOfStock || isAddingToCart}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-chandan-deep border border-kumkum/20 text-kumkum rounded-xl text-sm font-semibold hover:bg-kumkum-50 transition-colors disabled:opacity-50"
                  aria-label="Add to cart"
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 border-2 border-kumkum border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag size={15} aria-hidden="true" />
                  )}
                  <span className="hidden xs:inline">Cart</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_BTN}
                  onClick={handleBuyNow}
                  disabled={outOfStock || isAddingToCart}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-kumkum text-chandan rounded-xl text-sm font-bold hover:bg-kumkum-deep transition-colors shadow-brand-sm disabled:opacity-50"
                >
                  <Zap size={14} aria-hidden="true" />
                  Buy Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
