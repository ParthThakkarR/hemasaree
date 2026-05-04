'use client';


import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Heart, ShoppingBag, Check, Star, ChevronRight, Home, ChevronDown, Ruler } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category?: { id: string; name: string } | string;
  description?: string;
  color?: string;
  ocassion?: string;
  rating?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const POLISH_PRICE = 100;

const getImageSrc = (img?: string) => {
  if (!img) return '/uploads/placeholder.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.replace(/^\/+/, '/');
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [polish, setPolish] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  
  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string>('details');
  
  const { refreshCart } = useCart();
  const router = useRouter();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/products/${productId}`);
      setProduct(res.data);
    } catch (err) {
      console.error('[PRODUCT_FETCH_ERROR]', err);
      toast.error('Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchRelated = useCallback(async (categoryName?: string) => {
    try {
      if (!categoryName) { setRelated([]); return; }
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '8');
      params.append('category', categoryName);
      const res = await axios.get(`${API_BASE}/api/products?${params.toString()}`);
      const items: Product[] = Array.isArray(res.data.products) ? res.data.products : (res.data.products || []);
      const filtered = items.filter(p => p.id !== productId).slice(0, 4);
      setRelated(filtered);
    } catch (err) {
      console.error('[RELATED_FETCH_ERROR]', err);
      setRelated([]);
    }
  }, [productId]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/cart`);
      const cart = res.data?.cart;
      if (!cart || !Array.isArray(cart.items)) { setCartCount(0); return; }
      const count = cart.items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCart();
  }, [fetchProduct, fetchCart]);

  useEffect(() => {
    if (product) fetchRelated((product.category as any)?.name ?? String(product.category));
  }, [product, fetchRelated]);

  const addToCart = async (qty = 1) => {
    if (!product) return;
    try {
      const finalPrice = product.price + (polish ? POLISH_PRICE : 0);
      const body = {
        productId: product.id,
        quantity: qty,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: finalPrice,
        withPolish: polish
      };
      const res = await axios.post(`${API_BASE}/api/cart`, body);
      const updatedCart = res.data?.cart;
      const newCount = updatedCart?.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) ?? cartCount + qty;
      setCartCount(newCount);
      await refreshCart();
      toast.success(`Added to cart${polish ? ' (with polish)' : ''}!`);
    } catch (err: any) {
      console.error('[CART_ADD_ERROR]', err);
      if (err?.response?.status === 401) toast.error('Please log in to add items to your cart.');
      else toast.error(err?.response?.data?.error || 'Failed to add to cart.');
    }
  };

  const toggleWishlist = (id: string) => {
    try {
      const saved = localStorage.getItem('wishlist');
      const arr = saved ? JSON.parse(saved) as string[] : [];
      const updated = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      toast.success(arr.includes(id) ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Wishlist error');
    }
  };

  const isInWishlist = useMemo(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      const arr = saved ? JSON.parse(saved) as string[] : [];
      return (id: string) => arr.includes(id);
    } catch {
      return (_: string) => false;
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex justify-center items-start">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin mt-20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif font-bold text-ink mb-4">Product Not Found</h2>
        <p className="text-ink-muted mb-8 max-w-md">The saree you're looking for might have been moved or removed.</p>
        <Link href="/products" className="bg-brand-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-900 transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  const displayPrice = product.price + (polish ? POLISH_PRICE : 0);
  const categoryName = (product.category as any)?.name ?? product.category;

  const toggleAccordion = (section: string) => {
     setOpenAccordion(prev => prev === section ? '' : section);
  };

  return (
    <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-ink-muted mb-8 animate-fade-in uppercase tracking-wider text-xs">
          <Link href="/" className="hover:text-brand-800 flex items-center gap-1"><Home size={14}/> Home</Link>
          <ChevronRight size={14} className="text-ink-faint" />
          <Link href="/products" className="hover:text-brand-800">Shop</Link>
          <ChevronRight size={14} className="text-ink-faint" />
          <span className="text-brand-800 line-clamp-1">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative">
          
          {/* Left: Stacked Image Gallery */}
          <div className="w-full lg:w-[60%] flex flex-col gap-4 animate-slide-up">
            {product.images.map((img, idx) => (
               <div key={idx} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-brand-50">
                 <Image
                   src={getImageSrc(img)}
                   alt={`${product.name} - Image ${idx + 1}`}
                   fill
                   priority={idx === 0}
                   className="object-cover object-top"
                   sizes="(max-width: 1024px) 100vw, 60vw"
                 />
               </div>
            ))}
          </div>

          {/* Right: Sticky Product Details */}
          <div className="w-full lg:w-[40%] space-y-8 animate-fade-in stagger-1 lg:sticky lg:top-32 lg:pb-12">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-ink leading-tight">
                  {product.name}
                </h1>
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="w-12 h-12 rounded-full bg-surface border border-brand-200 shadow-sm flex items-center justify-center text-[#6B0F1A] hover:bg-brand-50 hover:border-brand-300 transition-colors shrink-0"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.rating && (
                <div className="flex items-center gap-1 mt-3 text-[#C9A84C]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-ink-muted ml-1">{product.rating}/5 Rating</span>
                </div>
              )}

              <div className="mt-6">
                <p className="text-3xl font-bold text-ink tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</p>
                <p className="text-sm text-ink-faint mt-1">Inclusive of all taxes</p>
              </div>
            </div>

            <div className="w-full h-px bg-brand-100" />

            {/* Polish Options */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink text-sm uppercase tracking-wider">Finish / Polish</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-100 px-2 py-1 rounded">Required</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setPolish(true)}
                  className={`relative p-4 rounded-xl text-left transition-all duration-300 border overflow-hidden group flex justify-between items-center ${
                    polish 
                      ? 'border-brand-800 bg-brand-50 shadow-sm' 
                      : 'border-brand-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <div>
                     <p className={`font-bold mb-1 text-sm ${polish ? 'text-brand-900' : 'text-ink'}`}>With Pre-Drape Polish</p>
                     <p className={`text-xs ${polish ? 'text-brand-800/80' : 'text-ink-faint'}`}>Recommended for immediate wear</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-sm font-medium text-ink-muted">+₹{POLISH_PRICE.toLocaleString('en-IN')}</span>
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${polish ? 'bg-brand-800 border-brand-800' : 'border-brand-300'}`}>
                        {polish && <Check size={12} className="text-white" />}
                     </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setPolish(false)}
                  className={`relative p-4 rounded-xl text-left transition-all duration-300 border overflow-hidden group flex justify-between items-center ${
                    !polish 
                      ? 'border-brand-800 bg-brand-50 shadow-sm' 
                      : 'border-brand-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <div>
                     <p className={`font-bold mb-1 text-sm ${!polish ? 'text-brand-900' : 'text-ink'}`}>Without Polish</p>
                     <p className={`text-xs ${!polish ? 'text-brand-800/80' : 'text-ink-faint'}`}>Standard delivery</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!polish ? 'bg-brand-800 border-brand-800' : 'border-brand-300'}`}>
                        {!polish && <Check size={12} className="text-white" />}
                     </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Sizing Guide Link */}
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-4">
                  <Ruler size={16} /> View Sizing Guide
               </button>
            </div>

            {/* Add to Cart Actions */}
            <div className="pt-2">
              <button 
                onClick={() => addToCart(1)}
                disabled={product.stock === 0}
                className="w-full bg-[#6B0F1A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#5a0c16] hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> 
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              {product.stock > 0 && product.stock <= 5 && (
                 <p className="text-center text-[#6B0F1A] text-xs font-semibold mt-3 animate-pulse">
                    Hurry! Only {product.stock} left in stock.
                 </p>
              )}
            </div>

            <div className="w-full h-px bg-brand-100" />

            {/* Accordions */}
            <div className="space-y-4">
               {/* Description */}
               <div className="border-b border-brand-100 pb-4">
                  <button onClick={() => toggleAccordion('details')} className="w-full flex items-center justify-between py-2 text-left">
                     <span className="font-serif text-lg font-bold text-ink">Product Details</span>
                     <ChevronDown size={20} className={`text-ink transition-transform duration-300 ${openAccordion === 'details' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'details' ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <p className="text-ink-muted leading-relaxed text-sm">
                       {product.description || "A beautiful, handcrafted saree designed to bring elegance and grace to any occasion. Made with premium materials and traditional techniques."}
                     </p>
                     <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mt-6">
                        <div>
                           <span className="block text-ink-faint mb-1">Color</span>
                           <span className="font-medium text-ink capitalize">{product.color || '-'}</span>
                        </div>
                        <div>
                           <span className="block text-ink-faint mb-1">Occasion</span>
                           <span className="font-medium text-ink capitalize">{product.ocassion || '-'}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Fabric & Care */}
               <div className="border-b border-brand-100 pb-4">
                  <button onClick={() => toggleAccordion('fabric')} className="w-full flex items-center justify-between py-2 text-left">
                     <span className="font-serif text-lg font-bold text-ink">Fabric & Care</span>
                     <ChevronDown size={20} className={`text-ink transition-transform duration-300 ${openAccordion === 'fabric' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'fabric' ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <ul className="list-disc list-inside text-sm text-ink-muted space-y-2">
                        <li>100% Authentic Handloom Fabric</li>
                        <li>Dry clean only recommended</li>
                        <li>Do not wring or squeeze</li>
                        <li>Store in a cool, dry place away from direct sunlight</li>
                     </ul>
                  </div>
               </div>

               {/* Shipping & Returns */}
               <div className="border-b border-brand-100 pb-4">
                  <button onClick={() => toggleAccordion('shipping')} className="w-full flex items-center justify-between py-2 text-left">
                     <span className="font-serif text-lg font-bold text-ink">Shipping & Returns</span>
                     <ChevronDown size={20} className={`text-ink transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'shipping' ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <p className="text-sm text-ink-muted mb-3">
                        <strong className="text-ink block mb-1">Free Shipping</strong>
                        Enjoy free shipping on all orders across India above ₹999.
                     </p>
                     <p className="text-sm text-ink-muted">
                        <strong className="text-ink block mb-1">7-Day Returns</strong>
                        Not completely satisfied? Return it within 7 days in its original condition for a full refund or exchange.
                     </p>
                  </div>
               </div>
            </div>
            
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-32 border-t border-brand-100 pt-16">
            <h2 className="text-3xl font-serif font-bold text-ink text-center mb-12">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map(r => (
                <div key={r.id} className="group relative">
                  <Link href={`/product/${r.id}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-50 rounded-2xl mb-4">
                    <Image 
                      src={getImageSrc(r.images?.[0])} 
                      alt={r.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                  <div>
                    <Link href={`/product/${r.id}`} className="block text-base font-bold text-ink line-clamp-1 hover:text-brand-800 transition-colors mb-1">
                      {r.name}
                    </Link>
                    <p className="font-semibold text-brand-800">₹{r.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1c1917', color: '#fff', borderRadius: '12px', padding: '16px' } }} />
    </div>
  );
}