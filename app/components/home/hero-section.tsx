'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { useSiteSettings } from '@contexts/site-settings-context';
import { urlFor } from '@/sanity/lib/image';

// Fallback defaults (used when Sanity siteSettings is empty)
const DEFAULTS = {
  badge: 'Handpicked Collection 2026',
  heading: 'Premium Silk, Bridal &',
  headingHighlight: 'Designer Sarees Online',
  subtitle: 'Discover exquisite sarees crafted by master artisans. From pure Kanchipuram silk to contemporary handlooms — find the perfect drape for every occasion.',
  heroImage1: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
  heroImage2: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
};

export default function HeroSection() {
  const [stats, setStats] = useState<{ totalOrders: number; avgRating: number; totalReviews: number } | null>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Fetch real social proof stats
    fetch('/api/products/stats')
      .then(res => res.json())
      .then(data => data.global && setStats(data.global))
      .catch(() => {});
  }, []);

  // Use Sanity data if available, otherwise use defaults
  const heroTitle = settings?.heroBanner?.title || DEFAULTS.heading;
  const heroSubtitle = settings?.heroBanner?.subtitle || DEFAULTS.subtitle;
  const heroImage1 = settings?.heroBanner?.image 
    ? urlFor(settings.heroBanner.image).url() 
    : DEFAULTS.heroImage1;

  return (
    <section className="relative pt-8 lg:pt-16 pb-16 lg:pb-24 overflow-hidden bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted border border-surface-subtle text-ink-muted text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {DEFAULTS.badge}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-[1.1] mb-5">
              {settings?.heroBanner?.title ? (
                // If Sanity has a custom title, render it directly
                <>{heroTitle}</>
              ) : (
                // Default styled heading
                <>
                  {DEFAULTS.heading}{' '}
                  <span className="text-brand-800 italic">{DEFAULTS.headingHighlight}</span>
                </>
              )}
            </h1>

            <p className="text-base lg:text-lg text-ink-muted mb-8 leading-relaxed max-w-lg">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/products?category=Bridal" className="group inline-flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white px-7 py-3.5 rounded-xl font-semibold transition-all shadow-brand-md active:scale-[0.98]">
                Explore Bridal Collection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-surface-muted text-brand-800 border border-brand-800/30 px-7 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98]">
                Shop All Sarees
              </Link>
            </div>

            {/* Dynamic Social Proof — only shows with real data */}
            {stats && stats.totalOrders > 0 && (
              <div className="flex items-center gap-3 text-sm text-ink-muted">
                {stats.avgRating > 0 && (
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.round(stats.avgRating) ? 'currentColor' : 'none'} className={i < Math.round(stats.avgRating) ? '' : 'text-surface-subtle'} />
                    ))}
                  </div>
                )}
                <span className="font-medium">
                  {stats.totalOrders.toLocaleString('en-IN')}+ orders served
                  {stats.avgRating > 0 && ` · ${stats.avgRating} rating`}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative h-[420px] sm:h-[480px] lg:h-[560px]"
          >
            <div className="absolute right-0 top-0 w-[78%] h-[88%] rounded-2xl overflow-hidden shadow-luxury z-10">
              <Image src={heroImage1} alt="Beautiful South Indian Saree" fill sizes="(max-width: 1024px) 78vw, 38vw" className="object-cover object-top" priority />
            </div>
            <div className="absolute left-0 bottom-0 w-[48%] h-[60%] rounded-2xl overflow-hidden shadow-luxury z-20 border-4 border-surface">
              <Image src={DEFAULTS.heroImage2} alt="Saree Fabric Detail" fill sizes="(max-width: 1024px) 48vw, 24vw" className="object-cover object-top" />
            </div>
            <div className="absolute -bottom-4 right-8 w-24 h-24 rounded-full border-2 border-accent/20 z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
