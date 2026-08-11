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
import ProvenanceTimeline from '@components/ui/ProvenanceTimeline';
import AudioPlayer from '@components/ui/AudioPlayer';

import { artisanStories } from '@/lib/content/stories';
import { getMotifsForCategory } from '@/lib/content/motifs';

// ── Recently viewed localStorage helpers ──
function getRecentlyViewed(): any[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); }
  catch { return []; }
}
function addToRecentlyViewed(product: any) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentlyViewed().filter((p: any) => p.id !== product.id);
    const updated = [{ id: product.id, name: product.name, price: product.price, images: product.images?.slice(0, 2) || [] }, ...current].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  } catch { /* ignore */ }
}

const SPRING_BTN = { type: 'spring' as const, bounce: 0, duration: 0.3 };

export default function ProductDetailClient({
  initialProduct,
  initialRelated,
  polishPrice   = 450,
  isPolishEnabled = true,
}: any) {
  const [product]         = useState(initialProduct);
  const [related]         = useState(initialRelated);
  const [polish, setPolish] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [showShareMenu, setShowShareMenu]   = useState(false);

  const { addToCart: addToCartContext } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user }  = useAuth();
  const router    = useRouter();

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      setRecentlyViewed(getRecentlyViewed().filter((p: any) => p.id !== product.id));
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
        withPolish: polish && isPolishEnabled,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (id: string) => {
    if (!user) { toast.error('Please return home to sign in first'); router.push('/login'); return; }
    const inWishlist = isInWishlist(id);
    toggleWishlist(id);
    toast.success(inWishlist ? 'Removed from your kept sarees' : 'Kept close ♥');
  };

  const handleShare = (type: 'whatsapp' | 'copy') => {
    const url  = typeof window !== 'undefined' ? window.location.href : '';
    const text = `I found ${product.name} on HemaSaree — ₹${product.price.toLocaleString('en-IN')}`;
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied');
    }
    setShowShareMenu(false);
  };

  const displayPrice = product.price + (polish && isPolishEnabled ? polishPrice : 0);

  // Find a matching artisan story for this product's category
  const matchedStory = artisanStories.find(
    s => s.categoryFilter.toLowerCase() === (product.category?.name || '').toLowerCase()
  ) || artisanStories[0];

  // Category-matched motifs
  const motifs = getMotifsForCategory(product.category?.name || '');

  return (
    <div className="bg-chandan min-h-screen pt-6 lg:pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ── */}
        <nav
          className="flex items-center gap-1.5 text-xs font-medium text-kajal-whisper mb-6 uppercase tracking-wider overflow-x-auto [&::-webkit-scrollbar]:hidden"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-kumkum flex items-center gap-1 flex-shrink-0 transition-colors">
            <Home size={13} aria-hidden="true" /> Home
          </Link>
          <ChevronRight size={12} className="text-kajal-faint flex-shrink-0" />
          <Link href="/products" className="hover:text-kumkum flex-shrink-0 transition-colors">Explore</Link>
          <ChevronRight size={12} className="text-kajal-faint flex-shrink-0" />
          <span className="text-kumkum truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Share button ── */}
        <div className="flex justify-end mb-4 relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-1.5 text-xs font-medium text-kajal-whisper hover:text-kumkum transition-colors bg-chandan-deep px-3 py-1.5 rounded-full press-target"
            aria-label="Share this saree"
            aria-expanded={showShareMenu}
          >
            <Share2 size={14} aria-hidden="true" /> Share
          </button>
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-2 paper-surface rounded-xl py-2 w-48 z-20 animate-fade-in">
              <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-kajal hover:bg-chandan-deep transition-colors">
                <MessageCircle size={15} className="text-[#25D366]" aria-hidden="true" /> Share on WhatsApp
              </button>
              <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-kajal hover:bg-chandan-deep transition-colors">
                <Link2 size={15} className="text-kajal-whisper" aria-hidden="true" /> Copy link
              </button>
            </div>
          )}
        </div>

        {/* ── ABOVE FOLD — Gallery + Product Info ── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          <ProductGallery
            images={product.images}
            name={product.name}
            getImageSrc={getImageSrc}
            fabric={product.fabric}
            color={product.color}
            category={product.category?.name}
          />

          <div className="w-full lg:w-[42%] space-y-6 lg:sticky lg:top-24 lg:pb-12">
            {/* Artisan attribution — above the product name */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-chandan-deep border border-chandan-warm">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={matchedStory.portrait}
                  alt={matchedStory.name}
                  fill
                  sizes="40px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p className="text-xs text-kajal-whisper mb-0.5">Woven by</p>
                <p className="text-sm font-bold text-kajal font-noto-serif">{matchedStory.name}</p>
                <p className="text-xs text-kajal-soft">{matchedStory.village} · {matchedStory.craft}</p>
              </div>
            </div>

            {/* Product info — unchanged logic */}
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

            {/* "Keep close" wishlist label — microcopy update handled in ProductInfo */}
            {/* Accordion */}
            <ProductAccordion
              product={product}
              reviews={product.reviews || []}
              reviewStats={product.reviewStats || { avgRating: 0, totalReviews: 0, distribution: [] }}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════
            THE PROVENANCE SCROLL
            Narrative chapters revealed on scroll
            ════════════════════════════════════════ */}
        <div className="mt-24 pt-12 border-t border-chandan-warm">

          {/* Chapter header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="chapter-eyebrow mb-3">The Story Behind This Saree</p>
            <h2 className="font-noto-serif text-3xl font-bold text-kajal mb-4">
              How it came to exist
            </h2>
            <p className="section-subtitle mx-auto">
              This saree did not appear in a warehouse. It was grown, dyed, woven, washed, and blessed.
              Here is every step.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Provenance timeline */}
            <ProvenanceTimeline />

            {/* Artisan story + audio */}
            <div className="space-y-8">
              {/* Her story */}
              <div className="paper-surface rounded-2xl p-7">
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={matchedStory.portrait}
                      alt={matchedStory.name}
                      fill
                      sizes="64px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="font-noto-serif text-xl font-bold text-kajal">{matchedStory.name}</h3>
                    <p className="devanagari-headline text-sm" lang="hi">{matchedStory.nameDevanagari}</p>
                    <p className="text-xs text-kajal-whisper mt-1">{matchedStory.age} · {matchedStory.village}, {matchedStory.state}</p>
                  </div>
                </div>

                <blockquote className="artisan-voice text-sm mb-4">
                  {matchedStory.voiceLine}
                </blockquote>

                <p className="story-text text-sm text-kajal-soft leading-relaxed">
                  {matchedStory.story.slice(0, 280)}…
                </p>

                <Link
                  href={`/products?category=${encodeURIComponent(matchedStory.categoryFilter)}`}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-kumkum hover:text-kumkum-deep transition-colors"
                >
                  More from {matchedStory.name.split(' ')[0]} →
                </Link>
              </div>

              {/* Audio note */}
              <AudioPlayer
                artisanName={matchedStory.name}
                artisanNameDevanagari={matchedStory.nameDevanagari}
                transcript={matchedStory.voiceLineTransliterated}
              />

              {/* Motifs — if any match */}
              {motifs.length > 0 && (
                <div className="paper-surface rounded-2xl p-7">
                  <h3 className="font-noto-serif text-lg font-bold text-kajal mb-4">The motifs in this cloth</h3>
                  <div className="space-y-4">
                    {motifs.slice(0, 2).map(motif => (
                      <div key={motif.id} className="flex gap-3">
                        <span className="text-2xl flex-shrink-0" aria-hidden="true">{motif.symbol}</span>
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-kajal text-sm">{motif.name}</span>
                            <span className="devanagari-headline text-xs" lang="hi">{motif.nameDevanagari}</span>
                          </div>
                          <p className="text-xs text-kajal-soft italic mb-1">{motif.meaning}</p>
                          <p className="text-xs text-kajal-whisper leading-relaxed">{motif.legend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Care — reframed */}
              <div className="paper-surface rounded-2xl p-7">
                <h3 className="font-noto-serif text-lg font-bold text-kajal mb-3">
                  Teaching your daughter to care for it
                </h3>
                <ul className="space-y-2 text-sm text-kajal-soft">
                  <li className="flex gap-2"><span className="text-haldi">→</span> Dry clean only — the fibres are finer than they look</li>
                  <li className="flex gap-2"><span className="text-haldi">→</span> Wrap in unbleached muslin when storing</li>
                  <li className="flex gap-2"><span className="text-haldi">→</span> Keep away from direct sunlight — the dyes are natural and alive</li>
                  <li className="flex gap-2"><span className="text-haldi">→</span> Refold along a different line every six months</li>
                  <li className="flex gap-2"><span className="text-haldi">→</span> If it needs to breathe — hang it in a shaded doorway, not a wardrobe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Companions for this story (related) ── */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-chandan-warm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-noto-serif text-2xl font-bold text-kajal">
                Companions for this story
              </h2>
              <Link href="/products" className="text-sm text-kumkum font-semibold hover:text-kumkum-deep transition-colors">
                See more →
              </Link>
            </div>
            <ProductRelated related={related} getImageSrc={getImageSrc} />
          </div>
        )}

        {/* ── Recently viewed ── */}
        {recentlyViewed.length > 0 && (
          <div className="mt-20 pt-10 border-t border-chandan-warm">
            <h2 className="font-noto-serif text-xl font-bold text-kajal mb-6 text-center">
              You&apos;ve also visited
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden">
              {recentlyViewed.slice(0, 6).map((item: any) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group flex-shrink-0 w-[160px] sm:w-[180px]"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-chandan-deep border border-chandan-warm mb-2">
                    <Image
                      src={getImageSrc(item.images?.[0])}
                      alt={item.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      sizes="180px"
                    />
                  </div>
                  <h3 className="text-xs font-medium text-kajal line-clamp-2 group-hover:text-kumkum transition-colors">{item.name}</h3>
                  <p className="text-sm font-bold text-kajal mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
