'use client';

import React, { memo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { motion, useAnimate, useReducedMotion } from 'framer-motion';
import { useWishlist } from '@contexts/wishlist-context';
import { useCart } from '@contexts/cart-context';
import { useAuth } from '@contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import QuickViewModal from '@components/ui/quick-view-modal';
import UrgencyIndicator from '@components/ui/UrgencyIndicator';
import { getBenefits } from '@/lib/content/benefits';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    images: string[];
    category?: { id: string; name: string } | string;
    stock?: number;
    description?: string;
    fabric?: string;
    occasion?: string;
    createdAt?: string;
    reviewStats?: { avgRating: number; totalReviews: number };
  };
  priority?: boolean;
}

function vibrate(pattern: number | number[]) {
  navigator.vibrate?.(pattern);
}

const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart }                    = useCart();
  const { user }                         = useAuth();
  const router                           = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuickView, setShowQuickView]   = useState(false);
  const cardRef                             = useRef<HTMLDivElement>(null);

  const [heartScope, animateHeart] = useAnimate();
  const prefersReducedMotion       = useReducedMotion();

  const inWishlist   = isInWishlist(product.id);
  const outOfStock   = typeof product.stock === 'number' && product.stock <= 0;

  // Only show MRP strikethrough when explicitly set — no fake inflation
  const hasRealMRP      = typeof product.mrp === 'number' && product.mrp > product.price;
  const discountPercent = hasRealMRP ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100) : 0;
  const savingsAmount = hasRealMRP ? product.mrp! - product.price : 0;

  const isNew = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000
    : false;

  const categoryName =
    typeof product.category === 'object' ? product.category?.name : product.category;

  // Get 3 benefits for benefit reveal panel
  const benefits = getBenefits({
    fabric: product.fabric,
    occasion: product.occasion,
    category: categoryName,
  });

  const getImageSrc = (img?: string) => {
    if (!img) return '/uploads/placeholder.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  const primaryImage   = getImageSrc(product.images?.[0]);
  const secondaryImage = product.images?.[1] ? getImageSrc(product.images[1]) : primaryImage;

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      router.push('/login');
      return;
    }
    const adding = !inWishlist;
    toggleWishlist(product.id);
    if (adding) {
      toast.success('Added to wishlist');
      if (!prefersReducedMotion) {
        await animateHeart(heartScope.current, { scale: 1.45 }, { type: 'spring', bounce: 0.5, duration: 0.35 });
        await animateHeart(heartScope.current, { scale: 1 }, { type: 'spring', bounce: 0.3, duration: 0.3 });
      }
    } else {
      if (!prefersReducedMotion) {
        await animateHeart(heartScope.current, { scale: 0.75 }, { type: 'spring', bounce: 0, duration: 0.2 });
        await animateHeart(heartScope.current, { scale: 1 }, { type: 'spring', bounce: 0.2, duration: 0.25 });
      }
    }
  };

  // ── Add to Cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || isAddingToCart) return;
    try {
      setIsAddingToCart(true);
      await addToCart({ productId: product.id, quantity: 1, productName: product.name, productImage: primaryImage, price: product.price });
      vibrate([10]);
    } catch (err) {
      console.error(err);
      vibrate([5, 50, 50]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    try {
      setIsAddingToCart(true);
      await addToCart({ productId: product.id, quantity: 1, productName: product.name, productImage: primaryImage, price: product.price });
      vibrate([10]);
      router.push('/cart');
    } catch (err) {
      console.error(err);
      vibrate([5, 50, 50]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const SPRING_PRESS = { type: 'spring' as const, bounce: 0, duration: 0.3 };
  const cardTap   = prefersReducedMotion ? {} : { scale: 0.98 };
  const buttonTap = prefersReducedMotion ? {} : { scale: 0.95 };

  return (
    <>
      <motion.div
        ref={cardRef}
        whileTap={cardTap}
        transition={SPRING_PRESS}
        className="group relative flex flex-col bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full overflow-hidden border border-surface-subtle/50"
      >
        {/* Image Container */}
        <Link href={`/product/${product.id}`} className="relative aspect-[3/4] block overflow-hidden bg-surface-muted">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {outOfStock && (
              <span className="bg-ink/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                Sold Out
              </span>
            )}
            {!outOfStock && discountPercent > 0 && (
              <span className="bg-dark-green text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            )}
            {isNew && !outOfStock && (
              <span className="bg-accent text-brand-950 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            whileTap={buttonTap}
            transition={SPRING_PRESS}
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-ink-muted hover:text-brand-800 focus:outline-none"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span ref={heartScope} className="inline-flex">
              <Heart size={17} className={inWishlist ? 'fill-brand-800 text-brand-800' : ''} />
            </span>
          </motion.button>

          {/* Images — CSS opacity swap on hover */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-opacity duration-500 ease-in-out group-hover:opacity-0"
            priority={priority}
          />
          <Image
            src={secondaryImage}
            alt={`Alternate view of ${product.name}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top absolute inset-0 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
          />

          {/* Hover Overlay (Desktop) — Benefit Reveal + Actions */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden lg:flex flex-col bg-gradient-to-t from-ink/80 via-ink/50 to-transparent pt-10 pb-3 px-3 gap-2">
            {/* Benefit reveal bullets */}
            <div className="space-y-1.5 mb-1" aria-hidden="true">
              {benefits.map((b) => (
                <div key={b.headline} className="flex items-center gap-2">
                  <span className="text-sm leading-none flex-shrink-0">{b.icon}</span>
                  <p className="text-white text-[11px] font-semibold leading-tight">{b.headline}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <motion.button
              whileTap={buttonTap}
              transition={SPRING_PRESS}
              onClick={handleQuickView}
              className="w-full bg-white/95 backdrop-blur text-ink font-semibold py-2 rounded-lg shadow-sm hover:bg-surface-muted transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Eye size={16} aria-hidden="true" /> Quick View
            </motion.button>
            <div className="flex gap-2">
              <motion.button
                whileTap={buttonTap}
                transition={SPRING_PRESS}
                onClick={handleAddToCart}
                disabled={outOfStock || isAddingToCart}
                className="flex-1 bg-surface-muted/95 backdrop-blur text-brand-800 font-semibold py-2 rounded-lg hover:bg-brand-50 transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingBag size={15} aria-hidden="true" />
                )}
                {outOfStock ? 'Sold Out' : 'Add to Cart'}
              </motion.button>
              <motion.button
                whileTap={buttonTap}
                transition={SPRING_PRESS}
                onClick={handleBuyNow}
                disabled={outOfStock || isAddingToCart}
                className="flex-1 bg-brand-800/95 backdrop-blur text-white font-semibold py-2 rounded-lg hover:bg-brand-900 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </motion.button>
            </div>
          </div>
        </Link>

        {/* Details */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
          <Link href={`/product/${product.id}`} className="flex-grow">
            {/* Category */}
            {categoryName && (
              <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-1 font-medium">
                {categoryName}
              </p>
            )}

            {/* Title */}
            <h3 className="text-sm font-medium text-ink line-clamp-2 mb-2 group-hover:text-brand-800 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.reviewStats && product.reviewStats.totalReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex" aria-label={`${product.reviewStats.avgRating} stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    fill={i < Math.round(product.reviewStats!.avgRating) ? 'currentColor' : 'none'}
                    className={i < Math.round(product.reviewStats!.avgRating) ? 'text-accent' : 'text-surface-subtle'}
                  />
                ))}
              </div>
              <span className="text-[10px] text-ink-faint font-medium">({product.reviewStats.avgRating})</span>
            </div>
          )}

          {/* Price & Savings */}
          <div className="mt-auto pt-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-base text-ink">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {/* Only show MRP when genuinely set — no fake inflation */}
              {hasRealMRP && (
                <span className="text-xs text-ink-faint line-through">
                  ₹{product.mrp!.toLocaleString('en-IN')}
                </span>
              )}
              {hasRealMRP && savingsAmount > 0 && (
                <span className="text-[10px] font-bold text-neem bg-neem-pale px-1.5 py-0.5 rounded-md">
                  Save ₹{savingsAmount.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Urgency indicator */}
            <UrgencyIndicator stock={product.stock} className="mt-1.5" />
          </div>

          {/* Mobile Add to Cart — Full-width button for better conversion */}
          <motion.button
            whileTap={buttonTap}
            transition={SPRING_PRESS}
            onClick={handleAddToCart}
            disabled={outOfStock || isAddingToCart}
            className="lg:hidden w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-brand-800 text-white hover:bg-brand-900 shadow-brand-sm"
            aria-label={outOfStock ? 'Sold out' : 'Add to cart'}
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingBag size={15} aria-hidden="true" />
            )}
            {outOfStock ? 'Sold Out' : 'Add to Cart'}
          </motion.button>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal
          product={product}
          onClose={() => setShowQuickView(false)}
          getImageSrc={getImageSrc}
          originRect={cardRef.current?.getBoundingClientRect()}
        />
      )}
    </>
  );
});

export default ProductCard;
