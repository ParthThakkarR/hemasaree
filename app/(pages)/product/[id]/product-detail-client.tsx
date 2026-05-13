'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Check, Star, ChevronRight, Home, ChevronDown, Ruler } from 'lucide-react';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth } from '@contexts/auth-context';

const POLISH_PRICE = 450;

export default function ProductDetailClient({ initialProduct, initialRelated }: any) {
  const [product] = useState(initialProduct);
  const [related] = useState(initialRelated);
  const [qty, setQty] = useState(1);
  const [polish, setPolish] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string>('details');
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
  const toggleAccordion = (section: string) => setOpenAccordion(prev => prev === section ? '' : section);

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
          <div className="w-full lg:w-[60%] flex flex-col gap-4">
            {product.images.map((img: string, idx: number) => (
               <div key={idx} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-brand-50">
                 <Image src={getImageSrc(img)} alt={`${product.name} - ${idx}`} fill priority={idx === 0} className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 60vw" />
               </div>
            ))}
          </div>

          <div className="w-full lg:w-[40%] space-y-8 lg:sticky lg:top-32 lg:pb-12">
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-ink leading-tight">{product.name}</h1>
                <button onClick={() => handleWishlist(product.id)} className="w-12 h-12 rounded-full border border-brand-200 flex items-center justify-center text-[#6B0F1A] hover:bg-brand-50 transition-colors shrink-0">
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold text-ink tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</p>
                <p className="text-sm text-ink-faint mt-1">Inclusive of all taxes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setPolish(true)} className={`p-4 rounded-xl border flex justify-between items-center ${polish ? 'border-brand-800 bg-brand-50' : 'border-brand-200 bg-white'}`}>
                  <div>
                     <p className="font-bold text-sm">With Polish</p>
                     <p className="text-xs text-ink-faint">+₹{POLISH_PRICE}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${polish ? 'bg-brand-800 border-brand-800' : 'border-brand-300'}`}>
                    {polish && <Check size={12} className="text-white" />}
                  </div>
                </button>
                <button onClick={() => setPolish(false)} className={`p-4 rounded-xl border flex justify-between items-center ${!polish ? 'border-brand-800 bg-brand-50' : 'border-brand-200 bg-white'}`}>
                  <p className="font-bold text-sm">Without Polish</p>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!polish ? 'bg-brand-800 border-brand-800' : 'border-brand-300'}`}>
                    {!polish && <Check size={12} className="text-white" />}
                  </div>
                </button>
            </div>

            <button onClick={() => addToCart(1)} disabled={product.stock === 0 || isAddingToCart} className="w-full bg-[#6B0F1A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#5a0c16] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {isAddingToCart ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
              {product.stock > 0 ? (isAddingToCart ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
            </button>

            <div className="space-y-4">
               <div className="border-b border-brand-100 pb-4">
                  <button onClick={() => toggleAccordion('details')} className="w-full flex items-center justify-between py-2"><span className="font-serif text-lg font-bold">Details</span><ChevronDown size={20} className={openAccordion === 'details' ? 'rotate-180' : ''} /></button>
                  {openAccordion === 'details' && <p className="text-ink-muted text-sm mt-4">{product.description || "Beautiful Handloom Saree."}</p>}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
