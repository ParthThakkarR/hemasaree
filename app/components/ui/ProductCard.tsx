import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { useCart } from '@/app/contexts/CartContext';
import toast from 'react-hot-toast';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    category?: { id: string; name: string } | string;
    stock?: number;
    description?: string;
  };
  priority?: boolean;
}

const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const inWishlist = isInWishlist(product.id);
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;

  // Helper to ensure images load correctly
  const getImageSrc = (img?: string) => {
    if (!img) return '/uploads/placeholder.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  const primaryImage = getImageSrc(product.images?.[0]);
  const secondaryImage = product.images?.[1] ? getImageSrc(product.images[1]) : primaryImage;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
    if (!inWishlist) toast.success('Added to wishlist');
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    
    await addToCart({
      productId: product.id,
      quantity: 1,
      productName: product.name,
      productImage: primaryImage,
      price: product.price,
    });
    toast.success('Added to cart');
  };

  return (
    <div className="group relative flex flex-col bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-smooth h-full overflow-hidden border border-brand-50">
      
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] block overflow-hidden bg-surface-muted">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {outOfStock ? (
            <span className="bg-ink/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Sold Out
            </span>
          ) : null}
          {/* Example: Add new/sale badges if applicable in future */}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-ink-muted hover:text-brand-500 hover:scale-110 transition-all focus:outline-none"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} className={inWishlist ? "fill-brand-500 text-brand-500" : ""} />
        </button>

        {/* Images (Swap on hover) */}
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
          className="object-cover object-top absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
        />

        {/* Quick Add Overlay (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden lg:block bg-gradient-to-t from-ink/50 to-transparent">
           <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="w-full bg-white/95 backdrop-blur text-ink font-semibold py-2.5 rounded-xl shadow-md hover:bg-brand-50 hover:text-brand-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            {outOfStock ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`} className="flex-grow">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-ink-faint uppercase tracking-wider mb-1 font-medium">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </p>
          )}
          
          {/* Title */}
          <h3 className="text-sm font-medium text-ink line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Price & Mobile Add Button */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-semibold text-base text-ink">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="lg:hidden w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
