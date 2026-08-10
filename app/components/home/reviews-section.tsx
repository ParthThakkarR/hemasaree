'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, animate } from 'framer-motion';

interface Review {
  id: string;
  rating: number;
  title?: string;
  text: string;
  images: string[];
  createdAt: string;
  user: { firstName?: string; lastName?: string; name?: string; image?: string };
  product?: { id: string; name: string; images: string[] };
}

const CARD_WIDTH  = 320; // px
const CARD_GAP    = 20;  // px — gap-5
const SNAP_UNIT   = CARD_WIDTH + CARD_GAP;
const DECEL_RATE  = 0.998;

function project(velocity: number, decelerationRate = DECEL_RATE): number {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

function rubberBand(val: number, min: number, max: number, coeff = 0.55): number {
  if (val >= min && val <= max) return val;
  const beyond = val < min ? min - val : val - max;
  const sign   = val < min ? 1 : -1;
  return (val < min ? min : max) + sign * Math.log1p(beyond * coeff) / coeff;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x          = useMotionValue(0);
  const velSamples = useRef<{ t: number; x: number }[]>([]);
  const pointerDown= useRef(false);
  const startX     = useRef(0);
  const startMV    = useRef(0);
  const animCtrl   = useRef<{ stop?: () => void }>({});

  useEffect(() => {
    fetch('/api/reviews?limit=8')
      .then(res => res.json())
      .then(data => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    const maxIdx = Math.max(0, reviews.length - 1);
    const snapped= Math.min(maxIdx, Math.max(0, idx));
    return Math.max(max, -snapped * SNAP_UNIT);
  }, [reviews.length, getMaxDrag]);

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

    // Snap back from rubber-band edge
    if (currentX > 0 || currentX < max) {
      const edgeTarget = currentX > 0 ? 0 : max;
      const ctrl = animate(x, edgeTarget, {
        type: 'spring', bounce: 0, duration: 0.5,
        velocity: velocity / 1000,
      });
      animCtrl.current = { stop: ctrl.stop.bind(ctrl) };
      return;
    }

    // Momentum projection → nearest snap
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

  const scrollByCard = (dir: 'left' | 'right') => {
    animCtrl.current.stop?.();
    const currentX  = x.get();
    const max       = getMaxDrag();
    const targetX   = dir === 'left'
      ? Math.min(0, currentX + SNAP_UNIT)
      : Math.max(max, currentX - SNAP_UNIT);
    const snap      = nearestSnap(targetX);
    const ctrl = animate(x, snap, { type: 'spring', bounce: 0, duration: 0.35 });
    animCtrl.current = { stop: ctrl.stop.bind(ctrl) };
  };

  const getDisplayName = (user: Review['user']) => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName[0]}.`;
    if (user.firstName) return user.firstName;
    if (user.name) return user.name.split(' ')[0] + (user.name.split(' ')[1] ? ` ${user.name.split(' ')[1][0]}.` : '');
    return 'Customer';
  };

  const getInitial = (user: Review['user']) =>
    (user.firstName || user.name || 'C')[0].toUpperCase();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-2">What Our Customers Say</h2>
            <div className="luxury-divider" />
          </div>
          {reviews.length > 2 && (
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scrollByCard('left')}
                aria-label="Previous review"
                className="w-10 h-10 rounded-full border border-surface-subtle flex items-center justify-center text-ink-muted hover:bg-surface-muted transition-colors press-target"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollByCard('right')}
                aria-label="Next review"
                className="w-10 h-10 rounded-full border border-surface-subtle flex items-center justify-center text-ink-muted hover:bg-surface-muted transition-colors press-target"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[320px] flex-shrink-0 bg-surface-muted rounded-2xl p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div
            ref={containerRef}
            className={`relative overflow-hidden ${isDragging ? 'dragging' : 'draggable'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-5 pb-4 w-max"
            >
              {reviews.map((review) => {
                const hasImages = review.images && review.images.length > 0;

                return (
                  <div
                    key={review.id}
                    className="w-[320px] flex-shrink-0 bg-white rounded-2xl p-5 border border-surface-subtle shadow-sm hover:shadow-md transition-shadow"
                    style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                  >
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-surface-subtle'} />
                        ))}
                      </div>
                      {review.product && (
                        <span className="text-[10px] text-ink-faint truncate max-w-[120px]">{review.product.name}</span>
                      )}
                    </div>

                    {/* Title */}
                    {review.title && (
                      <p className="font-semibold text-sm text-ink mb-1.5">{review.title}</p>
                    )}

                    {/* Text */}
                    <p className="text-sm text-ink-muted leading-relaxed mb-3 line-clamp-4">
                      {review.text}
                    </p>

                    {/* Customer images */}
                    {hasImages && (
                      <div className="flex gap-1.5 mb-3">
                        {review.images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="w-14 h-14 relative rounded-lg overflow-hidden bg-surface-muted border border-surface-subtle">
                            <Image src={img} alt="Customer photo" fill className="object-cover" sizes="56px" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Author */}
                    <div className="flex items-center gap-2 pt-3 border-t border-surface-subtle">
                      <div className="w-7 h-7 rounded-full bg-brand-800 text-accent flex items-center justify-center text-[10px] font-bold">
                        {getInitial(review.user)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink flex items-center gap-1">
                          {getDisplayName(review.user)}
                          <CheckCircle2 size={11} className="text-dark-green" />
                        </p>
                        <p className="text-[10px] text-ink-faint">Verified Buyer · {formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
