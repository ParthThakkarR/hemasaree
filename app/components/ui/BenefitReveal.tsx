'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { getBenefits, type BenefitSet } from '@/lib/content/benefits';

interface BenefitRevealProps {
  fabric?: string;
  occasion?: string;
  category?: string;
  mode?: 'hover' | 'inline' | 'toggle';
  className?: string;
}

const SPRING_REVEAL = { type: 'spring' as const, bounce: 0, duration: 0.35 };

export default function BenefitReveal({
  fabric,
  occasion,
  category,
  mode = 'inline',
  className = '',
}: BenefitRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  const benefits = getBenefits({ fabric, occasion, category });

  if (mode === 'toggle') {
    return (
      <div className={className}>
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-semibold text-brand-800 hover:text-brand-900 transition-colors w-full text-left"
          aria-expanded={isOpen}
        >
          <Sparkles size={14} aria-hidden="true" />
          What this saree does for you
          <ChevronDown
            size={14}
            className={'ml-auto transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')}
            aria-hidden="true"
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={SPRING_REVEAL}
              className="overflow-hidden"
            >
              <BenefitList benefits={benefits} prefersReducedMotion={!!prefersReducedMotion} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (mode === 'hover') {
    return (
      <div
        className={'absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-ink/80 via-ink/60 to-transparent pt-8 pb-3 px-3 ' + className}
        aria-hidden="true"
      >
        <div className="space-y-1.5">
          {benefits.map((b) => (
            <div key={b.headline} className="flex items-start gap-2">
              <span className="text-sm leading-none mt-0.5 flex-shrink-0">{b.icon}</span>
              <p className="text-white text-[11px] font-semibold leading-tight">{b.headline}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={'space-y-2 ' + className} aria-label="Product benefits">
      <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles size={10} aria-hidden="true" />
        What your saree does for you
      </p>
      <BenefitList benefits={benefits} prefersReducedMotion={!!prefersReducedMotion} />
    </div>
  );
}

function BenefitList({
  benefits,
  prefersReducedMotion,
}: {
  benefits: ReturnType<typeof getBenefits>;
  prefersReducedMotion: boolean;
}) {
  return (
    <ul className="space-y-2 mt-2" role="list">
      {benefits.map((benefit, i) => (
        <motion.li
          key={benefit.headline}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="flex items-start gap-2.5"
        >
          <span className="text-base leading-none mt-0.5 flex-shrink-0" aria-hidden="true">
            {benefit.icon}
          </span>
          <div>
            <p className="text-xs font-semibold text-ink leading-snug">{benefit.headline}</p>
            {benefit.sub && (
              <p className="text-[10px] text-ink-faint leading-snug mt-0.5">{benefit.sub}</p>
            )}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
