'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface UrgencyIndicatorProps {
  stock?: number;
  offerEndsAt?: string;
  className?: string;
}

export default function UrgencyIndicator({
  stock,
  offerEndsAt,
  className = '',
}: UrgencyIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!offerEndsAt) return;
    const computeTimeLeft = () => {
      const diff = new Date(offerEndsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setTimeLeft(h + 'h ' + m + 'm left');
      else if (m > 0) setTimeLeft(m + 'm ' + s + 's left');
      else setTimeLeft(s + 's left');
    };
    computeTimeLeft();
    const interval = setInterval(computeTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [offerEndsAt]);

  const isLowStock = typeof stock === 'number' && stock > 0 && stock <= 5;
  if (!isLowStock && !timeLeft) return null;

  return (
    <div className={'flex flex-col gap-1.5 ' + className}>
      {isLowStock && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-warning"
          role="status"
          aria-live="polite"
        >
          <span
            className={'w-2 h-2 rounded-full bg-warning flex-shrink-0 ' + (prefersReducedMotion ? '' : 'animate-pulse')}
            aria-hidden="true"
          />
          {'Only ' + stock + ' left — order soon'}
        </motion.div>
      )}
      {timeLeft && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-kumkum"
          role="timer"
          aria-live="polite"
        >
          <Clock size={12} className="flex-shrink-0" aria-hidden="true" />
          {'Offer ends in ' + timeLeft}
        </motion.div>
      )}
    </div>
  );
}
