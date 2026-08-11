'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  animate,
} from 'framer-motion';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { artisanStories } from '@/lib/content/stories';
import { useSiteSettings } from '@contexts/site-settings-context';

const AUTO_ADVANCE_MS = 5500;
const DRAG_THRESHOLD  = 60; // px to trigger slide change

// Spring presets
const SPRING_SLIDE = { type: 'spring' as const, bounce: 0, duration: 0.55 };
const SPRING_BTN   = { type: 'spring' as const, bounce: 0, duration: 0.3 };

export default function HeroSection() {
  const [current, setCurrent]   = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { settings }         = useSiteSettings();

  const dragX       = useMotionValue(0);
  const pointerDown = useRef(false);
  const startX      = useRef(0);
  const timerRef    = useRef<ReturnType<typeof setTimeout>>();

  const stories = artisanStories;
  const count   = stories.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % count) + count) % count);
  }, [count]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    timerRef.current = setTimeout(() => goTo(current + 1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, isPaused, goTo, prefersReducedMotion]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDown.current = true;
    startX.current = e.clientX;
    dragX.set(0);
    setIsDragging(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerDown.current) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) setIsDragging(true);
    dragX.set(delta);
  };

  const handlePointerUp = () => {
    if (!pointerDown.current) return;
    pointerDown.current = false;

    const delta = dragX.get();
    animate(dragX, 0, { duration: 0.15 });

    if (Math.abs(delta) > DRAG_THRESHOLD) {
      goTo(delta < 0 ? current + 1 : current - 1);
    }
    setTimeout(() => setIsDragging(false), 50);
  };

  const story = stories[current];

  // Slide variants
  const slideVariants = prefersReducedMotion
    ? {
        enter : { opacity: 0 },
        center: { opacity: 1, transition: { duration: 0.2 } },
        exit  : { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        enter : { opacity: 0, scale: 1.04 },
        center: { opacity: 1, scale: 1, transition: SPRING_SLIDE },
        exit  : { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
      };

  const textVariants = prefersReducedMotion
    ? {
        enter : { opacity: 0 },
        center: { opacity: 1, transition: { duration: 0.2 } },
        exit  : { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        enter : { opacity: 0, y: 20 },
        center: { opacity: 1, y: 0, transition: { ...SPRING_SLIDE, delay: 0.15 } },
        exit  : { opacity: 0, y: -10, transition: { duration: 0.2 } },
      };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'min(92vh, 680px)' }}
      aria-roledescription="carousel"
      aria-label="Featured artisan stories"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── Background slides ── */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`bg-${current}`}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          aria-hidden="true"
        >
          <Image
            src={story.sareeImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            draggable={false}
          />
          {/* Deep vignette — bottom 65% */}
          <div className="absolute inset-0 vignette-bottom" />
          {/* Side vignettes for depth */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(13,11,10,0.35) 0%, transparent 30%, transparent 70%, rgba(13,11,10,0.15) 100%)'
          }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Content overlay ── */}
      <div className="relative h-full flex flex-col justify-end px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 max-w-4xl">

        {/* Artisan badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`badge-${current}`}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2.5 region-badge !bg-white/10 !border-white/20 !text-white/70 backdrop-blur-sm">
              <span
                className="font-noto-serif text-white/90 font-bold"
                lang="hi"
                aria-label={`Artisan: ${story.name}`}
              >
                {story.nameDevanagari}
              </span>
              <span className="text-white/40">·</span>
              <span>{story.region}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Voice line — her words */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`voice-${current}`}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="mb-6"
          >
            <blockquote className="font-noto-serif text-white font-bold leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
            >
              &ldquo;{story.voiceLine}&rdquo;
            </blockquote>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-white/60 text-sm">
                — {story.name}, {story.age}, {story.village}
              </p>
              <span className="text-white/30">·</span>
              <p className="text-white/50 text-xs italic">{story.craft}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTAs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cta-${current}`}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.div whileTap={{ scale: 0.96 }} transition={SPRING_BTN}>
              <Link
                href={`/products?category=${encodeURIComponent(story.categoryFilter)}`}
                className="group inline-flex items-center gap-2.5 bg-kumkum text-chandan px-7 py-3.5 rounded-xl font-bold font-noto-serif text-base hover:bg-kumkum-deep transition-colors shadow-kumkum-md"
                onClick={(e) => { if (isDragging) e.preventDefault(); }}
              >
                Enter her story
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }} transition={SPRING_BTN}>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white border border-white/25 hover:border-white/50 px-7 py-3.5 rounded-xl font-medium text-base backdrop-blur-sm transition-colors"
                onClick={(e) => { if (isDragging) e.preventDefault(); }}
              >
                All sarees
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-5 right-6 sm:right-10 flex items-center gap-3">
        {/* Pause/play */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={SPRING_BTN}
          onClick={() => setIsPaused(p => !p)}
          aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/25 transition-colors"
        >
          {isPaused
            ? <Play  size={13} fill="currentColor" />
            : <Pause size={13} fill="currentColor" />
          }
        </motion.button>

        {/* Story dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Story selector">
          {stories.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === current}
              aria-label={`Story ${i + 1}: ${s.name}`}
              onClick={() => { goTo(i); setIsPaused(true); }}
              className="group relative"
            >
              <motion.span
                animate={{
                  width: i === current ? '2rem' : '0.5rem',
                  opacity: i === current ? 1 : 0.4,
                }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                className="block h-1.5 rounded-full bg-white"
                style={{ display: 'block' }}
              />
            </button>
          ))}
        </div>

        {/* Story counter */}
        <span className="text-white/40 text-xs tabular-nums">
          {current + 1} / {count}
        </span>
      </div>

      {/* ── Auto-advance progress bar ── */}
      {!isPaused && !prefersReducedMotion && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10"
          aria-hidden="true"
        >
          <motion.div
            key={`progress-${current}`}
            className="h-full bg-haldi/70"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </section>
  );
}
