'use client';

import React, { useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChapterWallProps {
  children    : React.ReactNode[];
  cardWidth   : number;  // px — consistent card width
  cardGap?    : number;  // px — gap between cards (default 20)
  className?  : string;
  ariaLabel?  : string;
  showArrows? : boolean;
}

const DECEL_RATE = 0.998;

function project(velocity: number): number {
  return (velocity / 1000) * DECEL_RATE / (1 - DECEL_RATE);
}

function rubberBand(val: number, min: number, max: number, coeff = 0.55): number {
  if (val >= min && val <= max) return val;
  const beyond = val < min ? min - val : val - max;
  const sign   = val < min ? 1 : -1;
  return (val < min ? min : max) + sign * Math.log1p(beyond * coeff) / coeff;
}

/**
 * ChapterWall — Draggable horizontal gallery with momentum projection.
 * 
 * Same physics engine as category-scroll and reviews-section from the
 * fluid interactions session — but generalized to accept any children.
 * Used for: artisan stories, occasions, product chapters, reviews.
 */
export default function ChapterWall({
  children,
  cardWidth,
  cardGap     = 20,
  className   = '',
  ariaLabel   = 'Scrollable gallery',
  showArrows  = true,
}: ChapterWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const SNAP_UNIT = cardWidth + cardGap;

  const x          = useMotionValue(0);
  const velSamples = useRef<{ t: number; x: number }[]>([]);
  const pointerDown= useRef(false);
  const startX     = useRef(0);
  const startMV    = useRef(0);
  const animCtrl   = useRef<{ stop?: () => void }>({});

  const getMaxDrag = useCallback(() => {
    const container = containerRef.current;
    const track     = trackRef.current;
    if (!container || !track) return 0;
    return Math.min(0, container.clientWidth - track.scrollWidth);
  }, []);

  const nearestSnap = useCallback((rawX: number): number => {
    const max    = getMaxDrag();
    const clamped= Math.max(max, Math.min(0, rawX));
    const idx    = Math.round(-clamped / SNAP_UNIT);
    const maxIdx = Math.max(0, children.length - 1);
    const snapped= Math.min(maxIdx, Math.max(0, idx));
    return Math.max(max, -snapped * SNAP_UNIT);
  }, [children.length, getMaxDrag, SNAP_UNIT]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    animCtrl.current.stop?.();
    pointerDown.current = true;
    startX.current      = e.clientX;
    startMV.current     = x.get();
    velSamples.current  = [{ t: performance.now(), x: e.clientX }];
    setIsDragging(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [x, prefersReducedMotion]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    const delta = e.clientX - startX.current;
    const rawX  = startMV.current + delta;
    if (!isDragging && Math.abs(delta) > 4) setIsDragging(true);
    const max     = getMaxDrag();
    const dampedX = rubberBand(rawX, max, 0);
    x.set(dampedX);
    const now = performance.now();
    velSamples.current.push({ t: now, x: e.clientX });
    velSamples.current = velSamples.current.filter(s => now - s.t < 80);
  }, [x, isDragging, getMaxDrag]);

  const handlePointerUp = useCallback(() => {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    setIsDragging(false);

    if (prefersReducedMotion) {
      x.set(nearestSnap(x.get()));
      return;
    }

    const samples  = velSamples.current;
    let velocity   = 0;
    if (samples.length >= 2) {
      const oldest = samples[0];
      const newest = samples[samples.length - 1];
      const dt     = newest.t - oldest.t;
      if (dt > 0) velocity = (newest.x - oldest.x) / dt * 1000;
    }
    velSamples.current = [];

    const currentX = x.get();
    const max      = getMaxDrag();

    if (currentX > 0 || currentX < max) {
      const edge = currentX > 0 ? 0 : max;
      const ctrl = animate(x, edge, { type: 'spring', bounce: 0, duration: 0.5, velocity: velocity / 1000 });
      animCtrl.current = { stop: ctrl.stop.bind(ctrl) };
      return;
    }

    const projected  = currentX + project(velocity);
    const snapTarget = nearestSnap(projected);
    const ctrl = animate(x, snapTarget, {
      type: 'spring',
      bounce: Math.abs(velocity) > 500 ? 0.12 : 0,
      duration: 0.35,
      velocity: velocity / 1000,
    });
    animCtrl.current = { stop: ctrl.stop.bind(ctrl) };
  }, [x, nearestSnap, getMaxDrag, prefersReducedMotion]);

  const scrollBy = (dir: 'left' | 'right') => {
    animCtrl.current.stop?.();
    const currentX  = x.get();
    const max       = getMaxDrag();
    const rawTarget = dir === 'left'
      ? Math.min(0, currentX + SNAP_UNIT)
      : Math.max(max, currentX - SNAP_UNIT);
    const snap = nearestSnap(rawTarget);
    const ctrl = animate(x, snap, { type: 'spring', bounce: 0, duration: 0.35 });
    animCtrl.current = { stop: ctrl.stop.bind(ctrl) };
  };

  if (children.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Arrow controls — accessible keyboard/mouse fallback */}
      {showArrows && children.length > 2 && (
        <div className="absolute -top-12 right-0 hidden sm:flex gap-2" aria-label="Gallery navigation">
          <button
            onClick={() => scrollBy('left')}
            aria-label="Previous"
            className="w-9 h-9 rounded-full border border-chandan-warm bg-chandan flex items-center justify-center text-kajal-whisper hover:text-kajal hover:border-kajal-faint transition-colors press-target"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy('right')}
            aria-label="Next"
            className="w-9 h-9 rounded-full border border-chandan-warm bg-chandan flex items-center justify-center text-kajal-whisper hover:text-kajal hover:border-kajal-faint transition-colors press-target"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Draggable container */}
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        className={`overflow-hidden ${isDragging ? 'dragging' : 'draggable'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <motion.div
          ref={trackRef}
          style={{ x, gap: `${cardGap}px` } as any}
          className="flex pb-4 w-max"
        >
          {children.map((child, i) => (
            <div
              key={i}
              style={{ width: cardWidth, flexShrink: 0 }}
              // Prevent child pointer events during drag (avoid accidental link clicks)
              onPointerUp={(e) => { if (isDragging) { e.stopPropagation(); e.preventDefault(); } }}
            >
              {child}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
