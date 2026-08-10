'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useReducedMotion, animate } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  _count?: { products: number };
  products?: any[];
}

interface CategoryScrollProps {
  initialCategories?: Category[];
}

const PLACEHOLDER_IMAGE = '/uploads/placeholder.png';
const CARD_WIDTH  = 280; // px
const CARD_GAP    = 20;  // px — gap-5
const SNAP_UNIT   = CARD_WIDTH + CARD_GAP;
const DECEL_RATE  = 0.998; // momentum projection deceleration

// Physics helpers
function project(velocity: number, decelerationRate = DECEL_RATE): number {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

function rubberBand(x: number, min: number, max: number, coeff = 0.55): number {
  if (x >= min && x <= max) return x;
  const beyond = x < min ? min - x : x - max;
  const sign   = x < min ? 1 : -1;
  // Exponential decay: distance compresses logarithmically
  return (x < min ? min : max) + sign * Math.log1p(beyond * coeff) / coeff;
}

export default function CategoryScroll({ initialCategories }: CategoryScrollProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const trackRef       = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading]       = useState(!initialCategories || initialCategories.length === 0);
  const [isDragging, setIsDragging] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  // MotionValues for 1:1 drag tracking (no re-render during drag)
  const x = useMotionValue(0);

  // Velocity tracking — rolling window of last N pointer events
  const velSamples = useRef<{ t: number; x: number }[]>([]);
  const pointerDown= useRef(false);
  const startX     = useRef(0);
  const startMV    = useRef(0); // x.get() at pointer down
  const animControl= useRef<{ stop?: () => void }>({});

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : data.categories || [];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialCategories]);

  const getMaxDrag = useCallback(() => {
    const container = containerRef.current;
    const track     = trackRef.current;
    if (!container || !track) return 0;
    const trackW    = track.scrollWidth;
    const containerW= container.clientWidth;
    return Math.min(0, containerW - trackW);
  }, []);

  const nearestSnap = useCallback((rawX: number): number => {
    const max = getMaxDrag();
    const clamped = Math.max(max, Math.min(0, rawX));
    const idx = Math.round(-clamped / SNAP_UNIT);
    const maxIdx = Math.max(0, categories.length - 1);
    const snapped = Math.min(maxIdx, Math.max(0, idx));
    return Math.max(max, -snapped * SNAP_UNIT);
  }, [categories.length, getMaxDrag]);

  // ── Pointer down ─────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    // Only handle left mouse / primary touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Stop any in-flight animation
    animControl.current.stop?.();

    pointerDown.current = true;
    startX.current      = e.clientX;
    startMV.current     = x.get();

    velSamples.current  = [{ t: performance.now(), x: e.clientX }];
    setIsDragging(false); // only set true after threshold

    e.currentTarget.setPointerCapture(e.pointerId);
  }, [x, prefersReducedMotion]);

  // ── Pointer move ─────────────────────────────────────
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;

    const delta   = e.clientX - startX.current;
    const rawX    = startMV.current + delta;

    // Mark as dragging after 4px threshold (to not block link clicks)
    if (!isDragging && Math.abs(delta) > 4) setIsDragging(true);

    const max = getMaxDrag();
    // Apply rubber-banding at edges
    const dampedX = rubberBand(rawX, max, 0);
    x.set(dampedX);

    // Track velocity samples (keep last 80ms)
    const now = performance.now();
    velSamples.current.push({ t: now, x: e.clientX });
    velSamples.current = velSamples.current.filter(s => now - s.t < 80);
  }, [x, isDragging, getMaxDrag]);

  // ── Pointer up ───────────────────────────────────────
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    setIsDragging(false);

    if (prefersReducedMotion) {
      // Snap without animation
      x.set(nearestSnap(x.get()));
      return;
    }

    // Calculate release velocity from velocity samples
    const samples = velSamples.current;
    let velocity  = 0;
    if (samples.length >= 2) {
      const oldest = samples[0];
      const newest = samples[samples.length - 1];
      const dt     = newest.t - oldest.t;
      if (dt > 0) velocity = (newest.x - oldest.x) / dt * 1000; // px/s
    }
    velSamples.current = [];

    const currentX = x.get();
    const max      = getMaxDrag();

    // If rubber-banded past an edge, snap back with spring
    if (currentX > 0 || currentX < max) {
      const edgeTarget = currentX > 0 ? 0 : max;
      const ctrl = animate(x, edgeTarget, {
        type: 'spring', bounce: 0, duration: 0.5,
        velocity: velocity / 1000,
      });
      animControl.current = { stop: ctrl.stop.bind(ctrl) };
      return;
    }

    // Project resting position using momentum
    const projected  = currentX + project(velocity);
    const snapTarget = nearestSnap(projected);

    const ctrl = animate(x, snapTarget, {
      type: 'spring',
      bounce: Math.abs(velocity) > 500 ? 0.12 : 0, // slight bounce on fast flick
      duration: 0.35,
      velocity: velocity / 1000,
    });
    animControl.current = { stop: ctrl.stop.bind(ctrl) };
  }, [x, nearestSnap, getMaxDrag, prefersReducedMotion]);

  // ── Arrow button scroll (fallback) ───────────────────
  const scrollByCard = (dir: 'left' | 'right') => {
    animControl.current.stop?.();
    const currentX  = x.get();
    const max       = getMaxDrag();
    const targetX   = dir === 'left'
      ? Math.min(0, currentX + SNAP_UNIT)
      : Math.max(max, currentX - SNAP_UNIT);
    const snapTarget = nearestSnap(targetX);

    const ctrl = animate(x, snapTarget, {
      type: 'spring', bounce: 0, duration: 0.35,
    });
    animControl.current = { stop: ctrl.stop.bind(ctrl) };
  };

  const getImageSrc = (img?: string) => {
    if (!img) return PLACEHOLDER_IMAGE;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-surface-muted overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="section-title text-2xl md:text-3xl mb-2">Shop by Category</h2>
            <div className="luxury-divider mt-3 mb-0" style={{ maxWidth: '120px', margin: '0' }}>
              <span className="luxury-divider-icon" />
            </div>
          </div>

          {/* Arrow Buttons — desktop fallback */}
          {categories.length > 3 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollByCard('left')}
                aria-label="Scroll left"
                className="w-10 h-10 rounded-full border border-surface-subtle bg-surface flex items-center justify-center text-ink-muted hover:text-brand-800 hover:border-brand-200 transition-colors press-target"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollByCard('right')}
                aria-label="Scroll right"
                className="w-10 h-10 rounded-full border border-surface-subtle bg-surface flex items-center justify-center text-ink-muted hover:text-brand-800 hover:border-brand-200 transition-colors press-target"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Draggable Track Container */}
        <div
          ref={containerRef}
          className={`relative overflow-hidden ${isDragging ? 'dragging' : 'draggable'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'pan-y pinch-zoom' }} // allow vertical scroll, block horizontal
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-5 pb-4 w-max"
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[240px] sm:min-w-[280px] h-[340px] sm:h-[380px] rounded-2xl bg-surface-subtle animate-pulse flex-shrink-0" />
              ))
            ) : (
              categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: i * 0.06 }}
                  className="flex-shrink-0"
                  style={{ width: CARD_WIDTH }}
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    onClick={(e) => { if (isDragging) e.preventDefault(); }}
                    className="relative block h-[340px] sm:h-[380px] rounded-2xl overflow-hidden group cursor-pointer"
                    draggable={false}
                  >
                    <Image
                      src={getImageSrc(cat.image)}
                      alt={`Shop ${cat.name} sarees online at Hema Sarees`}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                      sizes="280px"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {cat.description && (
                        <p className="text-xs text-white/70 uppercase tracking-wider font-medium mb-1">{cat.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl font-bold text-white group-hover:text-accent transition-colors">
                          {cat.name}
                        </h3>
                        <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-accent group-hover:text-brand-950 transition-all">
                          <ArrowRight size={15} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
