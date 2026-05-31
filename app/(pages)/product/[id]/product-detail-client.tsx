'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronRight, Home, Share2, MessageCircle, Link2 } from 'lucide-react';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth } from '@contexts/auth-context';

import ProductGallery from '@/app/components/product/ProductGallery';
import ProductInfo from '@/app/components/product/ProductInfo';
import ProductAccordion from '@/app/components/product/ProductAccordion';
import ProductRelated from '@/app/components/product/ProductRelated';



// Recently viewed localStorage helpers
function getRecentlyViewed(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch { return []; }
}

function addToRecentlyViewed(product: any) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentlyViewed().filter((p: any) => p.id !== product.id);
    const entry = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images?.slice(0, 2) || [],
    };
    const updated = [entry, ...current].slice(0, 10); // Keep max 10
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function ProductDetailClient({ initialProduct, initialRelated, polishPrice = 450, isPolishEnabled = true }: any) {
  const [product] = useState(initialProduct);
  const [related] = useState(initialRelated);
  const [polish, setPolish] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const { addToCart: addToCartContext } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      // Load recently viewed (excluding current product)
      const recent = getRecentlyViewed().filter((p: any) => p.id !== product.id);
      setRecentlyViewed(recent);
    }
  }, [product]);

  const getImageSrc = (img?: string) => {
    if (!img) return '/uploads/placeholder.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  const addToCart = async (qty: number) => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await addToCartContext({
        productId: product.id,
        quantity: qty,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: product.price + (polish && isPolishEnabled ? polishPrice : 0),
        withPolish: polish && isPolishEnabled
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (id: string) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      router.push('/login');
      return;
    }
    const inWishlist = isInWishlist(id);
    toggleWishlist(id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = (type: 'whatsapp' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out ${product.name} on Hema Sarees — ₹${product.price.toLocaleString('en-IN')}`;
    
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
    setShowShareMenu(false);
  };

  const displayPrice = product.price + (polish && isPolishEnabled ? polishPrice : 0);

  return (
    <div className="bg-surface min-h-screen pt-6 lg:pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-ink-muted mb-6 uppercase tracking-wider overflow-x-auto hide-scrollbar">
          <Link href="/" className="hover:text-brand-800 flex items-center gap-1 flex-shrink-0"><Home size={13}/> Home</Link>
          <ChevronRight size={12} className="text-ink-faint flex-shrink-0" />
          <Link href="/products" className="hover:text-brand-800 flex-shrink-0">Shop</Link>
          <ChevronRight size={12} className="text-ink-faint flex-shrink-0" />
          <span className="text-brand-800 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Share Button */}
        <div className="flex justify-end mb-4 relative">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-brand-800 transition-colors bg-surface-muted px-3 py-1.5 rounded-full"
          >
            <Share2 size={14} /> Share
          </button>
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-luxury border border-surface-subtle py-2 w-48 z-20 animate-fade-in-scale">
              <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-surface-muted transition-colors">
                <MessageCircle size={15} className="text-[#25D366]" /> Share on WhatsApp
              </button>
              <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-surface-muted transition-colors">
                <Link2 size={15} className="text-ink-muted" /> Copy Link
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          <ProductGallery 
            images={product.images} 
            name={product.name} 
            getImageSrc={getImageSrc} 
          />

          <div className="w-full lg:w-[42%] space-y-6 lg:sticky lg:top-24 lg:pb-12">
            <ProductInfo 
              product={product}
              displayPrice={displayPrice}
              isInWishlist={isInWishlist}
              handleWishlist={handleWishlist}
              polish={polish && isPolishEnabled}
              setPolish={setPolish}
              POLISH_PRICE={polishPrice}
              isPolishEnabled={isPolishEnabled}
              addToCart={addToCart}
              isAddingToCart={isAddingToCart}
              router={router}
              reviewStats={product.reviewStats}
            />

            <ProductAccordion 
              product={product}
              reviews={product.reviews || []}
              reviewStats={product.reviewStats || { avgRating: 0, totalReviews: 0, distribution: [] }}
            />
          </div>
        </div>

        {/* Related Products */}
        <ProductRelated related={related} getImageSrc={getImageSrc} />

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-20 pt-10 border-t border-surface-subtle">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-ink mb-6 text-center">Recently Viewed</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
              {recentlyViewed.slice(0, 6).map((item: any) => (
                <Link 
                  key={item.id} 
                  href={`/product/${item.id}`} 
                  className="group flex-shrink-0 w-[160px] sm:w-[180px]"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-muted border border-surface-subtle mb-2">
                    <Image 
                      src={getImageSrc(item.images?.[0])} 
                      alt={item.name} 
                      fill 
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                      sizes="180px" 
                    />
                  </div>
                  <h3 className="text-xs font-medium text-ink line-clamp-2 group-hover:text-brand-800 transition-colors">{item.name}</h3>
                  <p className="text-sm font-semibold text-ink mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
