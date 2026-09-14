'use client';

import React from 'react';
import { ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type GuaranteeVariant = 'compact' | 'full' | 'hero';

interface GuaranteeBadgeProps {
  variant?: GuaranteeVariant;
  className?: string;
}

export default function GuaranteeBadge({
  variant = 'compact',
  className = '',
}: GuaranteeBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (variant === 'hero') {
    return (
      <div
        className={'inline-flex items-center gap-1.5 text-white/70 text-xs font-medium ' + className}
        aria-label="Artisan respect guarantee"
      >
        <ShieldCheck size={13} className="text-haldi flex-shrink-0" aria-hidden="true" />
        <span>Respect the Craft · All Sales Final</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={'flex items-center gap-1.5 text-dark-green text-[10px] font-semibold ' + className}
        aria-label="Artisan respect guarantee"
      >
        <ShieldCheck size={11} className="flex-shrink-0" aria-hidden="true" />
        <span>Respect the Craft · All Sales Final</span>
      </div>
    );
  }

  const points = [
    { Icon: ShieldCheck, headline: '100% Genuine', desc: 'Every saree traced to its artisan.' },
    { Icon: ShieldCheck, headline: 'Heirloom Quality', desc: 'Woven to last for generations.' },
    { Icon: ShieldCheck, headline: 'Respect the Craft', desc: 'To honor the weavers, all sales are final.' },
  ] as const;

  return (
    <div
      className={'rounded-xl border border-neem/20 bg-neem-pale/60 px-4 py-3.5 space-y-2.5 ' + className}
      aria-label="Purchase guarantee"
    >
      <p className="text-xs font-bold text-dark-green uppercase tracking-wider flex items-center gap-1.5">
        <ShieldCheck size={13} aria-hidden="true" />
        Our Promise to You
      </p>
      <div className="space-y-2">
        {points.map(({ Icon, headline, desc }, i) => (
          <motion.div
            key={headline}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="flex items-start gap-2.5"
          >
            <Icon size={13} className="text-dark-green mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="text-xs font-semibold text-ink">{headline}</span>
              <span className="text-[10px] text-ink-faint ml-1">{desc}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
