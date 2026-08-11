'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Leaf, Flame, Droplets, Wind, Sun, Sparkles } from 'lucide-react';

export interface ProvenanceStep {
  id         : string;
  icon       : 'yarn' | 'dye' | 'loom' | 'wash' | 'bless' | 'you';
  label      : string;
  labelHindi : string;
  body       : string;
  detail?    : string;
}

const DEFAULT_STEPS: ProvenanceStep[] = [
  {
    id: 'yarn',
    icon: 'yarn',
    label: 'The Yarn',
    labelHindi: 'धागा',
    body: 'Silk thread is reeled from cocoons hand-raised in Ramanagara, Karnataka. Each cocoon unspools into 300–900 metres of continuous filament.',
    detail: 'It takes 3,000 cocoons to weave a single silk saree.',
  },
  {
    id: 'dye',
    icon: 'dye',
    label: 'The Dye',
    labelHindi: 'रंग',
    body: 'Thread is wound onto hanks and immersed in natural dye baths — pomegranate skin for gold, indigo cake for blue, lac for deep red. The colour must fix before the sun sets.',
    detail: 'Natural dyes are season-dependent. Rain changes the shade.',
  },
  {
    id: 'loom',
    icon: 'loom',
    label: 'The Loom',
    labelHindi: 'करघा',
    body: 'A master weaver sets up the loom — threading 5,400 individual warp ends through the heddles by hand. This alone takes two full days before weaving can begin.',
    detail: 'Each throw of the shuttle weaves exactly one row. A Banarasi saree has 5,000+ rows.',
  },
  {
    id: 'wash',
    icon: 'wash',
    label: 'The Wash',
    labelHindi: 'धुलाई',
    body: 'The woven cloth is washed in running water to remove sizing and fix the drape. In Maheshwar, weavers still use the Narmada river for this step.',
    detail: 'The wash reveals the true colour. It cannot be predicted — only trusted.',
  },
  {
    id: 'bless',
    icon: 'bless',
    label: 'The Blessing',
    labelHindi: 'आशीर्वाद',
    body: 'Before packing, the saree is inspected thread by thread for defects, then folded by the artisan who wove it. In many households, she whispers a prayer into the folds.',
    detail: 'Some weavers tie a single thread of red cotton into the border-fold. For good fortune.',
  },
  {
    id: 'you',
    icon: 'you',
    label: 'You',
    labelHindi: 'आप',
    body: 'The saree is wrapped in unbleached muslin, placed in a box made by a local paper artisan, and begins its journey. It carries the weight of every hand that touched it.',
    detail: 'From cocoon to your doorstep: approximately 90 days, 12 pairs of hands.',
  },
];

const iconMap: Record<ProvenanceStep['icon'], React.ReactNode> = {
  yarn:  <Leaf    size={20} />,
  dye:   <Droplets size={20} />,
  loom:  <Wind    size={20} />,
  wash:  <Flame   size={20} />,
  bless: <Sun     size={20} />,
  you:   <Sparkles size={20} />,
};

interface ProvenanceTimelineProps {
  steps?    : ProvenanceStep[];
  className?: string;
}

/**
 * ProvenanceTimeline — Scroll-triggered narrative reveal.
 * Each step appears as it enters the viewport.
 * "This saree's journey, told step by step."
 */
export default function ProvenanceTimeline({
  steps     = DEFAULT_STEPS,
  className = '',
}: ProvenanceTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const stepVariants = {
    hidden : prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0,
        duration: 0.5,
        delay: prefersReducedMotion ? 0 : i * 0.1,
      },
    }),
  };

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      {/* Section header */}
      <div className="mb-10">
        <p className="chapter-eyebrow mb-2">The Journey</p>
        <h2 className="font-noto-serif text-2xl md:text-3xl font-bold text-kajal">
          From yarn to you
        </h2>
        <p className="section-subtitle mt-2">
          Every step is an act of care. You are the last one.
        </p>
        <div className="luxury-divider mt-4" style={{ maxWidth: '100px', margin: '1rem 0 0' }}>
          <span className="luxury-divider-icon" />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div
          className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-haldi/60 via-haldi/20 to-transparent"
          aria-hidden="true"
        />

        <ol className="space-y-10" aria-label="Saree journey timeline">
          {steps.map((step, i) => (
            <motion.li
              key={step.id}
              custom={i}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="relative flex gap-5"
            >
              {/* Step icon bubble */}
              <div
                className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  background: i === steps.length - 1
                    ? 'var(--color-kumkum)'
                    : 'var(--color-chandan-deep)',
                  border: `1px solid ${i === steps.length - 1 ? 'var(--color-kumkum-deep)' : 'var(--color-haldi)'}`,
                  color: i === steps.length - 1
                    ? 'var(--color-chandan)'
                    : 'var(--color-haldi-deep)',
                }}
                aria-hidden="true"
              >
                {iconMap[step.icon]}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-2">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="font-noto-serif text-lg font-bold text-kajal leading-snug">
                    {step.label}
                  </h3>
                  <span
                    className="devanagari-headline text-sm"
                    lang="hi"
                    aria-label={`${step.label} in Hindi`}
                  >
                    {step.labelHindi}
                  </span>
                </div>

                <p className="story-text text-sm text-kajal-soft leading-relaxed mb-1">
                  {step.body}
                </p>

                {step.detail && (
                  <p className="text-xs text-kajal-whisper italic mt-1.5 pl-3 border-l-2 border-haldi/30">
                    {step.detail}
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
