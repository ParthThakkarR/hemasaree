'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronRight, Home } from 'lucide-react';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth } from '@contexts/auth-context';

import ProductGallery from '@/app/components/product/ProductGallery';
import ProductInfo from '@/app/components/product/ProductInfo';
import ProductAccordion from '@/app/components/product/ProductAccordion';
import ProductRelated from '@/app/components/product/ProductRelated';

const POLISH_PRICE = 450;

export default function ProductDetailClient({ initialProduct, initialRelated }: any) {
  const [product] = useState(initialProduct);
  const [related] = useState(initialRelated);
  const [polish, setPolish] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart: addToCartContext } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

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
        price: product.price,
        withPolish: polish
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

  const displayPrice = product.price + (polish ? POLISH_PRICE : 0);

  return (
    <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm font-medium text-ink-muted mb-8 uppercase tracking-wider text-xs">
          <Link href="/" className="hover:text-brand-800 flex items-center gap-1"><Home size={14}/> Home</Link>
          <ChevronRight size={14} className="text-ink-faint" />
          <Link href="/products" className="hover:text-brand-800">Shop</Link>
          <ChevronRight size={14} className="text-ink-faint" />
          <span className="text-brand-800 line-clamp-1">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <ProductGallery 
            images={product.images} 
            name={product.name} 
            getImageSrc={getImageSrc} 
          />

          <div className="w-full lg:w-[40%] space-y-8 lg:sticky lg:top-32 lg:pb-12">
            <ProductInfo 
              product={product}
              displayPrice={displayPrice}
              isInWishlist={isInWishlist}
              handleWishlist={handleWishlist}
              polish={polish}
              setPolish={setPolish}
              POLISH_PRICE={POLISH_PRICE}
              addToCart={addToCart}
              isAddingToCart={isAddingToCart}
              router={router}
            />

            <ProductAccordion product={product} />
          </div>
        </div>

        <ProductRelated related={related} getImageSrc={getImageSrc} />
      </div>
    </div>
  );
}
