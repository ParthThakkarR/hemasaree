'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@components/ui/product-card';
import ProductSkeleton from '@components/ui/product-skeleton';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: any[];
  isLoading: boolean;
  viewAllHref: string;
  badge?: string;
  bgClassName?: string;
}

export default function ProductSection({ 
  title, 
  subtitle, 
  products, 
  isLoading, 
  viewAllHref,
  badge,
  bgClassName = 'bg-surface'
}: ProductSectionProps) {
  return (
    <section className={`py-16 lg:py-24 ${bgClassName}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="section-title text-2xl md:text-3xl">{title}</h2>
              {badge && (
                <span className="bg-accent/15 text-accent-dark text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
            <div className="luxury-divider mt-3" style={{ maxWidth: '120px', margin: '0.75rem 0 0 0' }}>
              <span className="luxury-divider-icon" />
            </div>
          </div>
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-2 text-brand-800 font-semibold text-sm hover:text-brand-900 transition-colors bg-brand-50 px-5 py-2.5 rounded-full hover:bg-brand-100 active:scale-[0.98]"
          >
            View All <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <ProductSkeleton />
                </div>
              ))
            : products.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <ProductCard product={product} priority={i < 2} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
