'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard, { type ProductCardProps } from '@components/ui/product-card';

type MutableProduct = ProductCardProps['product'];

interface ProductTabsProps {
  newArrivals: MutableProduct[];
  trending: MutableProduct[];
  bestSellers: MutableProduct[];
}

type TabKey = 'new' | 'trending' | 'bestsellers';

interface TabDef {
  key: TabKey;
  label: string;
  viewAll: string;
  badge?: string;
}

const TABS: TabDef[] = [
  { key: 'new', label: 'New arrivals', viewAll: '/products?sortBy=createdAt&sortOrder=desc' },
  { key: 'trending', label: 'Worn this week', viewAll: '/products' },
  { key: 'bestsellers', label: 'Always chosen', viewAll: '/products', badge: 'Beloved' },
];

const SPRING_UI = { type: 'spring' as const, bounce: 0, duration: 0.5 };

export default function ProductTabs({ newArrivals, trending, bestSellers }: ProductTabsProps) {
  const [active, setActive] = useState<TabKey>('new');
  const prefersReducedMotion = useReducedMotion();

  const productsByTab: Record<TabKey, MutableProduct[]> = {
    new: newArrivals,
    trending,
    bestsellers: bestSellers,
  };

  const activeTab = TABS.find((t) => t.key === active)!;
  const products = productsByTab[active];

  return (
    <section className="py-16 lg:py-24 bg-chandan-deep" aria-labelledby="product-tabs-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 id="product-tabs-title" className="section-title text-2xl md:text-3xl">
              Woven for you
            </h2>
          </div>
          <p className="section-subtitle mt-2 mx-auto">
            Fresh from the loom, worn this week, or loved for generations.
          </p>
          <div className="luxury-divider mt-4" style={{ maxWidth: '120px', margin: '1rem auto 0' }}>
            <span className="luxury-divider-icon" />
          </div>
        </div>

        {/* Tab pills */}
        <div
          role="tablist"
          aria-label="Product collections"
          className="flex justify-center flex-wrap gap-2 mb-10"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap press-target ${
                  isActive
                    ? 'bg-brand-800 text-white border-brand-800 shadow-brand-sm'
                    : 'bg-white text-ink-muted border-surface-subtle hover:border-brand-200 hover:text-ink'
                }`}
              >
                {tab.label}
                {tab.badge && <span className="ml-1.5 text-accent" aria-hidden="true">✦</span>}
              </button>
            );
          })}
        </div>

        {/* Active grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING_UI}
            className={`grid gap-4 md:gap-5 lg:gap-6 justify-center mx-auto ${
              products.length === 1 ? 'grid-cols-1 max-w-sm' :
              products.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              products.length === 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-5xl' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full'
            }`}
          >
            {products.slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...SPRING_UI, delay: i * 0.07 }}
              >
                <ProductCard product={product} priority={i < 2} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all */}
        <div className="text-center mt-10">
          <Link
            href={activeTab.viewAll}
            className="group inline-flex items-center gap-2 text-brand-800 font-semibold text-sm hover:text-brand-900 transition-colors bg-brand-50 px-6 py-3 rounded-full hover:bg-brand-100"
          >
            View all {activeTab.label}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}