'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  _count?: { products: number };
  products?: any[];
}

interface CategoryScrollProps {
  initialCategories?: Category[];
}

// Fallback placeholder for categories without an admin-uploaded image
const PLACEHOLDER_IMAGE = '/uploads/placeholder.png';

export default function CategoryScroll({ initialCategories }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories || initialCategories.length === 0);

  useEffect(() => {
    // Only client-fetch if no server data was provided
    if (initialCategories && initialCategories.length > 0) return;
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : data.categories || [];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialCategories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 320;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const getImageSrc = (img?: string) => {
    if (!img) return PLACEHOLDER_IMAGE;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  // Don't render section if no categories exist
  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="section-title text-2xl md:text-3xl mb-2">Shop by Category</h2>
            <div className="luxury-divider mt-3 mb-0" style={{ maxWidth: '120px', margin: '0' }}>
              <span className="luxury-divider-icon" />
            </div>
          </div>

          {/* Scroll Arrows - Desktop */}
          {categories.length > 3 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-surface-subtle bg-surface flex items-center justify-center text-ink-muted hover:text-brand-800 hover:border-brand-200 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-surface-subtle bg-surface flex items-center justify-center text-ink-muted hover:text-brand-800 hover:border-brand-200 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </motion.div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 snap-x hide-scrollbar"
        >
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[240px] sm:min-w-[280px] h-[340px] sm:h-[380px] rounded-2xl bg-surface-subtle animate-pulse flex-shrink-0" />
            ))
          ) : (
            categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="relative min-w-[240px] sm:min-w-[280px] h-[340px] sm:h-[380px] rounded-2xl overflow-hidden snap-start group cursor-pointer block"
                >
                  <Image
                    src={getImageSrc(cat.image)}
                    alt={`Shop ${cat.name} sarees online at Hema Sarees`}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {cat.description && (
                      <p className="text-xs text-white/70 uppercase tracking-wider font-medium mb-1">{cat.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-white group-hover:text-accent transition-colors">
                        {cat.name}
                      </h3>
                      <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-accent group-hover:text-brand-950 transition-all">
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
