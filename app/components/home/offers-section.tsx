'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Gift } from 'lucide-react';

const offers = [
  {
    icon: Sparkles,
    tag: 'Wedding Season',
    title: 'Premium Craftsmanship',
    desc: 'Every saree is woven with traditional techniques and utmost care.',
    cta: 'Shop Bridal',
    href: '/products?category=Bridal',
    gradient: 'from-brand-800 to-brand-900',
  },
  {
    icon: Gift,
    tag: 'Festival Special',
    title: 'Silk Sarees from ₹1,999',
    desc: 'Handpicked festive collection with express delivery',
    cta: 'Shop Festive',
    href: '/products?category=Festive',
    gradient: 'from-dark-green to-emerald-900',
  },
];

export default function OffersSection() {
  return (
    <section className="py-16 lg:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="section-title text-2xl md:text-3xl mb-2">Special Offers</h2>
          <div className="luxury-divider mt-3" style={{ maxWidth: '120px', margin: '0' }}>
            <span className="luxury-divider-icon" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={offer.href}
                className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.gradient} p-7 sm:p-8 text-white transition-all hover:shadow-luxury active:scale-[0.99]`}
              >
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <offer.icon size={16} className="text-accent" />
                    <span className="text-accent text-xs font-bold uppercase tracking-wider">{offer.tag}</span>
                  </div>
                  
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">{offer.title}</h3>
                  <p className="text-white/75 text-sm mb-5 max-w-sm">{offer.desc}</p>
                  
                  <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-accent group-hover:text-brand-950 transition-all">
                    {offer.cta} <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
