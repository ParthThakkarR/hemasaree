'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth } from '@contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: any;
  onClose: () => void;
  getImageSrc: (img?: string) => string;
}

export default function QuickViewModal({ product, onClose, getImageSrc }: QuickViewModalProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  const inWishlist = isInWishlist(product.id);
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const mrp = product.mrp || Math.round(product.price * 1.25);
  const discountPercent = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAddToCart = async () => {
    if (outOfStock || isAddingToCart) return;
    try {
      setIsAddingToCart(true);
      await addToCart({
        productId: product.id,
        quantity: 1,
        productName: product.name,
        productImage: getImageSrc(product.images?.[0]),
        price: product.price,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (outOfStock) return;
    await handleAddToCart();
    router.push('/cart');
    onClose();
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

  const images = product.images || [];
  const nextImage = () => setCurrentImage(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage(prev => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-fade-in-scale">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>

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
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-muted hover:text-ink shadow-sm transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-muted hover:text-ink shadow-sm transition-colors">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white w-4' : 'bg-white/50'}`}
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

            {/* Dynamic Rating */}
            {product.reviewStats && product.reviewStats.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(product.reviewStats.avgRating) ? 'currentColor' : 'none'} className={i < Math.round(product.reviewStats.avgRating) ? 'text-accent' : 'text-surface-subtle'} />
                  ))}
                </div>
                <span className="text-xs text-ink-muted font-medium">{product.reviewStats.avgRating} ({product.reviewStats.totalReviews} review{product.reviewStats.totalReviews !== 1 ? 's' : ''})</span>
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
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock || isAddingToCart}
                  className="flex-1 bg-surface-muted text-brand-800 border border-brand-800/30 py-3 rounded-xl font-semibold text-sm hover:bg-brand-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag size={17} />
                  )}
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={outOfStock || isAddingToCart}
                  className="flex-1 bg-brand-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-brand-sm"
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={handleWishlist}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-ink-muted hover:text-brand-800 transition-colors"
              >
                <Heart size={16} className={inWishlist ? 'fill-brand-800 text-brand-800' : ''} />
                {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>

              <Link
                href={`/product/${product.id}`}
                onClick={onClose}
                className="block text-center text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-2 transition-colors"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
