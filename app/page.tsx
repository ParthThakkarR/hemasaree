'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, CreditCard, Star } from 'lucide-react';
import ProductCard from '@components/ui/product-card';
import ProductSkeleton from '@components/ui/product-skeleton';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=8&sortPrice=newest')
      .then((res) => res.json())
      .then((data) => {
        setNewArrivals(Array.isArray(data.products) ? data.products : []);
      })
      .catch((err) => console.error('Failed to fetch new arrivals', err))
      .finally(() => setIsLoading(false));
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Background Decorative Elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-50 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-brand-100 rounded-full blur-3xl pointer-events-none" 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Text Content */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                </span>
                Festive Collection 2026
              </motion.div>

              <motion.h1 variants={fadeUpVariant} className="font-serif text-5xl lg:text-7xl font-bold text-ink leading-[1.1] mb-6">
                Elegance Woven in <span className="text-brand-800 italic">Every Thread</span>
              </motion.h1>

              <motion.p variants={fadeUpVariant} className="text-lg text-ink-muted mb-8 leading-relaxed">
                Discover our handpicked collection of exquisite sarees. From pure silk to contemporary designs, find the perfect drape for every special occasion.
              </motion.p>

              <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  href="/products?category=Bridal"
                  className="group inline-flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white px-8 py-4 rounded-[10px] font-semibold transition-all shadow-lg shadow-brand-900/20 active:scale-95"
                >
                  Explore Bridal Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-surface-muted text-brand-800 border border-brand-800 px-8 py-4 rounded-[10px] font-semibold transition-all active:scale-95"
                >
                  Shop All Sarees
                </Link>
              </motion.div>

              {/* Social Proof Micro-Bar */}
              <motion.div variants={fadeUpVariant} className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span>2,000+ happy customers · 4.8 rating</span>
              </motion.div>
            </motion.div>

            {/* Hero Image Grid */}
            <div className="relative h-[500px] lg:h-[600px]">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute right-0 top-0 w-4/5 h-[90%] rounded-2xl overflow-hidden shadow-2xl z-10 hover:shadow-brand-900/20 transition-shadow duration-500"
              >
                <Image
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35"
                  alt="Beautiful Indian Saree"
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  priority
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute left-0 bottom-0 w-1/2 h-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-surface z-20 border-accent/20 hover:shadow-brand-900/20 transition-shadow duration-500"
              >
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                  alt="Saree Detail"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Signals Strip */}
      <section className="bg-brand-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
              { icon: ShieldCheck, title: "Premium Quality", desc: "100% Authentic Fabric" },
              { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: CreditCard, title: "Secure Payment", desc: "Multiple payment options" }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="flex flex-col items-center text-center gap-3 hover:-translate-y-2 transition-transform duration-300">
                <feature.icon size={32} className="text-accent" />
                <h4 className="font-semibold tracking-wide text-brand-50">{feature.title}</h4>
                <p className="text-sm text-brand-100/70">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Shop by Occasion Section */}
      <section className="py-20 lg:py-28 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-4">Dressed for Every Moment</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto"></div>
          </motion.div>

          <div className="flex overflow-x-auto gap-4 pb-8 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {[
              { name: 'Bridal', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
              { name: 'Festive', img: 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=600' },
              { name: 'Office Elegance', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' },
              { name: 'Puja & Prayer', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600' },
              { name: 'Gifting', img: 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=600' },
              { name: 'Casual', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' }
            ].map((occasion, i) => (
              <motion.div 
                key={occasion.name}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/products?category=${occasion.name.split(' ')[0]}`} className="relative min-w-[280px] md:min-w-[320px] h-[400px] rounded-2xl overflow-hidden snap-start group cursor-pointer shadow-md block">
                  <Image src={occasion.img} alt={occasion.name} fill className="object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <h3 className="font-serif text-2xl font-bold text-white group-hover:text-accent transition-colors">{occasion.name}</h3>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-brand-800 group-hover:scale-110 transition-all">
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12"
          >
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
              className="group inline-flex items-center gap-2 text-brand-800 font-semibold hover:text-brand-900 transition-colors bg-brand-50 px-6 py-3 rounded-full hover:bg-brand-100 active:scale-95"
            >
              View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.1 }}
                    key={i}
                  >
                    <ProductSkeleton />
                  </motion.div>
                ))
              : newArrivals.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.1 }}
                  >
                    <ProductCard product={product} priority={i < 2} />
                  </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Artisan Story Strip */}
      <section className="bg-brand-950 text-accent py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-50 mb-4">Each Saree Carries a Story</h2>
            <p className="max-w-2xl mx-auto text-brand-100/80">From the looms of Varanasi to the master weavers of Kanchipuram, our sarees are born from generations of devotion to the loom.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-brand-800/50"
          >
            {[
              { location: "Varanasi, UP", quote: `"The threads speak to us. Every motif is a prayer woven in silk."`, type: "Banarasi Silk" },
              { location: "Kanchipuram, TN", quote: `"We weave the colors of the temple architecture into the borders."`, type: "Kanjeevaram" },
              { location: "Paithan, MH", quote: `"Creating a Paithani is like painting with silk and gold."`, type: "Paithani" }
            ].map((story, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="pt-8 md:pt-0 md:px-8 flex flex-col items-center hover:scale-105 transition-transform duration-500 cursor-default">
                <span className="text-sm tracking-[0.2em] uppercase text-brand-100/60 mb-3">{story.location}</span>
                <p className="font-serif text-xl italic text-brand-50 mb-6 max-w-sm">{story.quote}</p>
                <span className="font-medium text-accent">{story.type}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden bg-brand-950 shadow-2xl hover:shadow-brand-900/30 transition-shadow duration-500"
          >
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600"
                alt="Wedding Collection"
                fill
                className="object-cover object-top opacity-40 mix-blend-overlay hover:scale-105 transition-transform duration-[2s]"
              />
            </div>

            <div className="relative z-10 px-6 py-16 md:py-24 text-center max-w-3xl mx-auto">
              <motion.span 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }}
                className="text-accent font-bold uppercase tracking-[0.2em] mb-4 block text-sm"
              >
                The Wedding Edit
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }}
                className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
              >
                Crafting Memories for Your Special Day
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} viewport={{ once: true }}
                className="text-brand-50 text-lg mb-8 max-w-xl mx-auto opacity-90"
              >
                Explore our exclusive range of bridal and trousseau sarees.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} viewport={{ once: true }}
                className="bg-brand-900/60 backdrop-blur-sm border border-brand-800 rounded-xl p-4 mb-8 inline-block animate-pulse"
              >
                <p className="text-accent font-semibold text-sm tracking-widest uppercase">Only 12 bridal pieces remaining this season</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} viewport={{ once: true }}
                className="flex justify-center"
              >
                <Link
                  href="/products?category=Bridal"
                  className="inline-flex items-center justify-center bg-accent text-brand-950 hover:bg-accent-light px-8 py-4 rounded-[10px] font-bold transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-brand-900/50"
                >
                  Claim Your Bridal Saree + Free Blouse Stitching
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
