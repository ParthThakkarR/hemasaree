'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Users, BadgeCheck, Gem, BookOpen, Heart } from 'lucide-react';

const WHY_US = [
  {
    icon: Heart,
    title: 'Artisan Direct',
    micro: 'No middlemen.',
    body: 'More of what you pay reaches the hands that made your saree.',
  },
  {
    icon: BadgeCheck,
    title: 'Respect the Craft',
    micro: 'All sales are final.',
    body: "To honor the countless hours and devotion poured into each handwoven piece, we do not accept returns.",
  },
  {
    icon: Gem,
    title: 'Heirloom Quality',
    micro: 'Woven to outlast trends.',
    body: 'Some of our customers are gifting HemaSaree sarees to the next generation.',
  },
  {
    icon: BookOpen,
    title: 'Lifetime Care Guide',
    micro: 'From the artisan to you.',
    body: 'Every saree ships with a handwritten care note from the weaver who made it.',
  },
  {
    icon: Users,
    title: 'Community of Women',
    micro: 'You are not alone in this.',
    body: 'Join thousands of women across India who wear their heritage every day.',
  },
] as const;

export default function TrustStrip() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="bg-brand-950 text-white py-14 lg:py-16"
      aria-label="Why women choose HemaSaree"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-accent/70 mb-10">
          Why Women Choose HemaSaree
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-6">
          {WHY_US.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.4 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-brand-900/60 border border-brand-800/50 flex items-center justify-center">
                  <Icon size={22} className="text-accent" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-wide text-sm text-brand-50 mb-0.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-accent/80 font-medium mb-1">{pillar.micro}</p>
                  <p className="text-xs text-brand-100/55 leading-relaxed">{pillar.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
