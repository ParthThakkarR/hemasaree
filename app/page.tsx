'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, CreditCard, Star } from 'lucide-react';
import ProductCard from '@/app/components/ui/ProductCard';
import ProductSkeleton from '@/app/components/ui/ProductSkeleton';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch 8 newest product
    //test
    fetch('/api/products?limit=8&sortPrice=newest')
      .then((res) => res.json())
      .then((data) => {
        setNewArrivals(Array.isArray(data.products) ? data.products : []);
      })
      .catch((err) => console.error('Failed to fetch new arrivals', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-brand-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Text Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                </span>
                Festive Collection 2026
              </div>

              <h1 className="font-serif text-5xl lg:text-7xl font-bold text-ink leading-[1.1] mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                Elegance Woven in <span className="text-brand-800 italic">Every Thread</span>
              </h1>

              <p className="text-lg text-ink-muted mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
                Discover our handpicked collection of exquisite sarees. From pure silk to contemporary designs, find the perfect drape for every special occasion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up mb-6" style={{ animationDelay: '300ms' }}>
                <Link
                  href="/products?category=Bridal"
                  className="inline-flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white px-8 py-4 rounded-[10px] font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-900/20"
                >
                  Explore Bridal Collection <ArrowRight size={20} />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-surface-muted text-brand-800 border border-brand-800 px-8 py-4 rounded-[10px] font-semibold transition-all"
                >
                  Shop All Sarees
                </Link>
              </div>

              {/* Social Proof Micro-Bar */}
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span>2,000+ happy customers · 4.8 rating</span>
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="relative h-[500px] lg:h-[600px] animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="absolute right-0 top-0 w-4/5 h-[90%] rounded-2xl overflow-hidden shadow-2xl z-10">
                <Image
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35"
                  alt="Beautiful Indian Saree"
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="absolute left-0 bottom-0 w-1/2 h-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-surface z-20 border-accent/20">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                  alt="Saree Detail"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Signals Strip */}
      <section className="bg-[#3D1A24] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <Truck size={32} className="text-[#C9A84C]" />
              <h4 className="font-semibold tracking-wide text-brand-50">Free Shipping</h4>
              <p className="text-sm text-brand-100/70">On orders above ₹999</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck size={32} className="text-[#C9A84C]" />
              <h4 className="font-semibold tracking-wide text-brand-50">Premium Quality</h4>
              <p className="text-sm text-brand-100/70">100% Authentic Fabric</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RefreshCw size={32} className="text-[#C9A84C]" />
              <h4 className="font-semibold tracking-wide text-brand-50">Easy Returns</h4>
              <p className="text-sm text-brand-100/70">7-day return policy</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <CreditCard size={32} className="text-[#C9A84C]" />
              <h4 className="font-semibold tracking-wide text-brand-50">Secure Payment</h4>
              <p className="text-sm text-brand-100/70">Multiple payment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Occasion Section */}
      <section className="py-20 lg:py-28 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-4">Dressed for Every Moment</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto"></div>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-8 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {[
              { name: 'Bridal', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
              { name: 'Festive', img: 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=600' },
              { name: 'Office Elegance', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' },
              { name: 'Puja & Prayer', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600' },
              { name: 'Gifting', img: 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=600' },
              { name: 'Casual', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' }
            ].map((occasion) => (
              <Link href={`/products?category=${occasion.name.split(' ')[0]}`} key={occasion.name} className="relative min-w-[280px] md:min-w-[320px] h-[400px] rounded-2xl overflow-hidden snap-start group cursor-pointer shadow-md">
                <Image src={occasion.img} alt={occasion.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-white">{occasion.name}</h3>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-brand-800 transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-4">
                New Arrivals
              </h2>
              <div className="w-16 h-0.5 bg-accent mb-4"></div>
              <p className="text-ink-muted">
                Be the first to wear our latest creations. Thoughtfully designed and meticulously crafted.
              </p>
            </div>
            <Link
              href="/products?sortPrice=newest"
              className="group inline-flex items-center gap-2 text-brand-800 font-semibold hover:text-brand-900 transition-colors"
            >
              View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : newArrivals.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 2} />
              ))}
          </div>
        </div>
      </section>

      {/* Artisan Story Strip */}
      <section className="bg-[#1A0A12] text-[#C9A84C] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-50 mb-4">Each Saree Carries a Story</h2>
            <p className="max-w-2xl mx-auto text-brand-100/80">From the looms of Varanasi to the master weavers of Kanchipuram, our sarees are born from generations of devotion to the loom.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-brand-800/50">
            <div className="pt-8 md:pt-0 md:px-8 flex flex-col items-center">
              <span className="text-sm tracking-[0.2em] uppercase text-brand-100/60 mb-3">Varanasi, UP</span>
              <p className="font-serif text-xl italic text-brand-50 mb-6 max-w-sm">&quot;The threads speak to us. Every motif is a prayer woven in silk.&quot;</p>
              <span className="font-medium text-accent">Banarasi Silk</span>
            </div>
            <div className="pt-8 md:pt-0 md:px-8 flex flex-col items-center">
              <span className="text-sm tracking-[0.2em] uppercase text-brand-100/60 mb-3">Kanchipuram, TN</span>
              <p className="font-serif text-xl italic text-brand-50 mb-6 max-w-sm">&quot;We weave the colors of the temple architecture into the borders.&quot;</p>
              <span className="font-medium text-accent">Kanjeevaram</span>
            </div>
            <div className="pt-8 md:pt-0 md:px-8 flex flex-col items-center">
              <span className="text-sm tracking-[0.2em] uppercase text-brand-100/60 mb-3">Paithan, MH</span>
              <p className="font-serif text-xl italic text-brand-50 mb-6 max-w-sm">&quot;Creating a Paithani is like painting with silk and gold.&quot;</p>
              <span className="font-medium text-accent">Paithani</span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Gallery / Social Proof */}
      <section className="py-20 lg:py-28 overflow-hidden bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-4">Loved by Women Across India</h2>
          <div className="flex items-center justify-center gap-2 text-accent mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
          </div>
          <p className="text-ink-muted">Join 2,000+ women who chose Hema Sarees for their special moments.</p>
        </div>

        <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 lg:px-8 pb-8 hide-scrollbar snap-x">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="relative min-w-[250px] h-[300px] rounded-2xl overflow-hidden snap-center flex-shrink-0">
              <Image src={`https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400&sig=${i}`} alt="Customer in Saree" fill className="object-cover object-top" />
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-brand-950">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600"
                alt="Wedding Collection"
                fill
                className="object-cover object-top opacity-40 mix-blend-overlay"
              />
            </div>

            <div className="relative z-10 px-6 py-16 md:py-24 text-center max-w-3xl mx-auto">
              <span className="text-accent font-bold uppercase tracking-[0.2em] mb-4 block text-sm">
                The Wedding Edit
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Crafting Memories for Your Special Day
              </h2>
              <p className="text-brand-50 text-lg mb-8 max-w-xl mx-auto opacity-90">
                Explore our exclusive range of bridal and trousseau sarees.
              </p>

              <div className="bg-brand-900/60 backdrop-blur-sm border border-brand-800 rounded-xl p-4 mb-8 inline-block">
                <p className="text-accent font-semibold text-sm tracking-widest uppercase">Only 12 bridal pieces remaining this season</p>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/products?category=Bridal"
                  className="inline-flex items-center justify-center bg-accent text-brand-950 hover:bg-[#dfc67a] px-8 py-4 rounded-[10px] font-bold transition-colors"
                >
                  Claim Your Bridal Saree + Free Blouse Stitching
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

