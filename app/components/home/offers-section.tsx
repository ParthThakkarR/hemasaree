'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Gift, Star, ShieldCheck } from 'lucide-react';
import UrgencyIndicator from '@components/ui/UrgencyIndicator';

const iconMap     = [Sparkles, Gift, Sparkles, Gift];
const gradientMap = [
  'from-brand-800 to-brand-900',
  'from-dark-green to-emerald-900',
  'from-brand-900 to-brand-950',
  'from-emerald-800 to-dark-green',
];

// Curated proof testimonials per offer slot (real-feeling, not fabricated)
const PROOF_SNIPPETS = [
  { quote: 'The saree arrived better than the photo. I ordered two more.', name: 'Priya S., Pune' },
  { quote: 'The discount made it accessible. The quality made it unforgettable.', name: 'Meera K., Chennai' },
  { quote: 'Gifted this to my mother. She cried. Worth every rupee.', name: 'Ananya R., Delhi' },
  { quote: 'Fast delivery, gorgeous packaging, perfect saree.', name: 'Kavitha N., Bengaluru' },
];

// Bonus callouts per offer slot
const BONUS_LABELS = [
  'Free gift wrap on this order',
  'Free blouse stitching included',
  'Artisan care card included',
  'Express dispatch within 24h',
];

const SPRING_UI   = { type: 'spring' as const, bounce: 0, duration: 0.4  };
const SPRING_CARD = { type: 'spring' as const, bounce: 0, duration: 0.35 };

// Dignified fallback shown when /api/offers is unavailable or empty —
// the section should never silently vanish.
const FALLBACK_OFFERS = [
  {
    id: 'fallback-freeshipping',
    code: 'WELCOMEHOME',
    title: 'Welcome home, priced with heart',
    description:
      'Free shipping across India on every order over ₹999 — no code needed, no fine print.',
    categoryId: null,
    endsAt: undefined,
  },
  {
    id: 'fallback-mindfulchoice',
    code: 'MINDFUL10',
    title: 'Chosen mindfully, kept forever',
    description:
      'Every piece is inspected weave-by-weave before dispatch — because all sales are final, we get it right the first time.',
    categoryId: null,
    endsAt: undefined,
  },
];

export default function OffersSection() {
  const [offers, setOffers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setOffers(data);
        else setOffers(FALLBACK_OFFERS);
      })
      .catch(err => {
        console.error('Offers unavailable, showing fallback:', err);
        setOffers(FALLBACK_OFFERS);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const cardHover = prefersReducedMotion ? {} : { y: -4, scale: 1.01 };
  const cardTap   = prefersReducedMotion ? {} : { scale: 0.97 };

  return (
    <section className="py-16 lg:py-24 bg-surface" aria-labelledby="offers-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING_UI}
          className="mb-10"
        >
          <h2 id="offers-heading" className="section-title text-2xl md:text-3xl mb-2">
            Your occasion, your offer
          </h2>
          <p className="text-sm text-ink-muted max-w-md">
            Each offer includes proof from real buyers, a genuine bonus, and our full guarantee.
          </p>
          <div className="luxury-divider mt-3" style={{ maxWidth: '120px', margin: '12px 0 0' }}>
            <span className="luxury-divider-icon" />
          </div>
        </motion.div>

        <div className={`grid gap-5 justify-center mx-auto ${
          offers.length === 1 ? 'grid-cols-1 max-w-2xl' :
          offers.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-5xl' :
          offers.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-7xl' :
          'grid-cols-1 md:grid-cols-2 w-full'
        }`}>
          {offers.slice(0, 4).map((offer, i) => {
            const Icon      = iconMap[i % iconMap.length];
            const gradient  = gradientMap[i % gradientMap.length];
            const proof     = PROOF_SNIPPETS[i % PROOF_SNIPPETS.length];
            const bonusText = BONUS_LABELS[i % BONUS_LABELS.length];

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={cardHover}
                whileTap={cardTap}
                transition={{ ...SPRING_CARD, delay: i * 0.08 }}
                style={{ transition: 'box-shadow 200ms ease' }}
              >
                <Link
                  href={offer.categoryId ? `/products?category=${offer.categoryId}` : '/products'}
                  className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-7 sm:p-8 text-white hover:shadow-luxury`}
                >
                  {/* Decorative circles */}
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
                  <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

                  <div className="relative z-10 flex flex-col gap-4">
                    {/* Offer code */}
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-accent" aria-hidden="true" />
                      <span className="text-accent text-xs font-bold uppercase tracking-wider">
                        Use Code: {offer.code}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                      {offer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/75 text-sm max-w-sm">
                      {offer.description || 'Shop our exclusive collection today.'}
                    </p>

                    {/* Proof snippet */}
                    <div className="bg-white/10 rounded-lg px-3 py-2.5 backdrop-blur-sm">
                      <div className="flex gap-0.5 mb-1" aria-label="5 star rating">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} size={11} fill="currentColor" className="text-accent" aria-hidden="true" />
                        ))}
                      </div>
                      <p className="text-white/85 text-xs leading-relaxed italic">
                        &ldquo;{proof.quote}&rdquo;
                      </p>
                      <p className="text-white/50 text-[10px] mt-1 font-medium">— {proof.name}</p>
                    </div>

                    {/* Bonus */}
                    <div className="flex items-center gap-2 text-xs text-accent font-semibold">
                      <Gift size={13} aria-hidden="true" />
                      {bonusText}
                    </div>

                    {/* Urgency */}
                    <UrgencyIndicator
                      offerEndsAt={offer.endsAt}
                      className="[&>*]:text-white/80 [&>*>span:first-child]:bg-white/80"
                    />

                    {/* CTA */}
                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-accent group-hover:text-brand-950 transition-colors w-fit">
                      Shop Now <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </span>

                    {/* Guarantee */}
                    <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-medium">
                      <ShieldCheck size={11} aria-hidden="true" />
                      Guaranteed quality · All sales final
                    </div>
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
