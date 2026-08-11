'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Occasion } from '@/lib/content/occasions';

interface OccasionCardProps {
  occasion  : Occasion;
  index?    : number;
  variant?  : 'portrait' | 'landscape'; // portrait = tall card, landscape = wide
  className?: string;
}

const SPRING_CARD = { type: 'spring' as const, bounce: 0, duration: 0.5 };

export default function OccasionCard({
  occasion,
  index     = 0,
  variant   = 'portrait',
  className = '',
}: OccasionCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const params = new URLSearchParams(occasion.filterParams);
  const href   = `/products?${params.toString()}`;

  const entranceVariants = {
    hidden : prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRING_CARD, delay: index * 0.07 },
    },
  };

  const cardHeight = variant === 'portrait' ? 'h-72 sm:h-80' : 'h-52 sm:h-60';

  return (
    <motion.article
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`group relative rounded-2xl overflow-hidden ${cardHeight} ${className}`}
      aria-label={occasion.moment}
    >
      <Link
        href={href}
        className="absolute inset-0 flex flex-col justify-end"
        aria-label={`Explore sarees for: ${occasion.moment}`}
      >
        {/* Background image */}
        <Image
          src={occasion.image}
          alt={`Saree for ${occasion.moment}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 vignette-bottom opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Content — anchored bottom */}
        <div className="relative z-10 p-5">
          {/* Feeling — tiny eyebrow */}
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1.5">
            {occasion.feeling}
          </p>

          {/* Moment — the occasion name */}
          <h3 className="font-noto-serif text-xl font-bold text-white leading-snug mb-1">
            {occasion.moment}
          </h3>

          {/* Devanagari version */}
          <p
            className="text-white/55 text-sm italic font-noto-serif mb-3"
            lang="hi"
            aria-label={`${occasion.moment} in Hindi`}
          >
            {occasion.momentDevanagari}
          </p>

          {/* Description — single line on hover */}
          <p className="text-white/70 text-xs leading-relaxed mb-4 line-clamp-2">
            {occasion.description}
          </p>

          {/* CTA */}
          <span className="inline-flex items-center gap-2 text-haldi text-sm font-semibold group-hover:gap-3 transition-all">
            Find yours
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
