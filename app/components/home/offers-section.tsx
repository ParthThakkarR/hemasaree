'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Gift } from 'lucide-react';

const iconMap = [Sparkles, Gift, Sparkles, Gift];
const gradientMap = [
  'from-brand-800 to-brand-900',
  'from-dark-green to-emerald-900',
  'from-brand-900 to-brand-950',
  'from-emerald-800 to-dark-green',
];

export default function OffersSection() {
  const [offers, setOffers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOffers(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (offers.length === 0) return null;
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
          {offers.slice(0, 4).map((offer, i) => {
            const Icon = iconMap[i % iconMap.length];
            const gradient = gradientMap[i % gradientMap.length];
            
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={offer.categoryId ? `/products?category=${offer.categoryId}` : '/products'}
                  className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-7 sm:p-8 text-white transition-all hover:shadow-luxury active:scale-[0.99]`}
                >
                  {/* Decorative circles */}
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
                  <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} className="text-accent" />
                      <span className="text-accent text-xs font-bold uppercase tracking-wider">
                        Use Code: {offer.code}
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">{offer.title}</h3>
                    <p className="text-white/75 text-sm mb-5 max-w-sm">{offer.description || 'Shop our exclusive collection today.'}</p>
                    
                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-accent group-hover:text-brand-950 transition-all">
                      Shop Now <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
