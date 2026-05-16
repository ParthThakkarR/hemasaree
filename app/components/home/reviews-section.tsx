'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, MessageCircle } from 'lucide-react';

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

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/reviews?limit=8')
      .then(res => res.json())
      .then(data => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
    }
  };

  const getDisplayName = (user: Review['user']) => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName[0]}.`;
    if (user.firstName) return user.firstName;
    if (user.name) return user.name.split(' ')[0] + (user.name.split(' ')[1] ? ` ${user.name.split(' ')[1][0]}.` : '');
    return 'Customer';
  };

  const getInitial = (user: Review['user']) => {
    return (user.firstName || user.name || 'C')[0].toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  // Don't render section if no approved reviews exist
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
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-surface-subtle flex items-center justify-center text-ink-muted hover:bg-surface-muted transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-surface-subtle flex items-center justify-center text-ink-muted hover:bg-surface-muted transition-colors"><ChevronRight size={18} /></button>
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
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
            {reviews.map((review) => {
              const hasImages = review.images && review.images.length > 0;
              
              return (
                <div key={review.id} className="w-[320px] flex-shrink-0 snap-start bg-white rounded-2xl p-5 border border-surface-subtle shadow-sm hover:shadow-md transition-shadow">
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

                  {/* Customer uploaded images */}
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
          </div>
        )}
      </div>
    </section>
  );
}
