'use client';

import React, { useState } from 'react';
import { ChevronDown, Star, CheckCircle2, Pencil, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '@contexts/auth-context';

interface Review {
  id: string;
  rating: number;
  title?: string;
  text: string;
  images: string[];
  createdAt: string;
  user: { id: string; firstName?: string; lastName?: string; name?: string; image?: string };
}

interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  distribution: { stars: number; count: number }[];
}

interface ProductAccordionProps {
  product: any;
  reviews: Review[];
  reviewStats: ReviewStats;
  onReviewSubmitted?: () => void;
}

export default function ProductAccordion({ product, reviews, reviewStats, onReviewSubmitted }: ProductAccordionProps) {
  const [openAccordion, setOpenAccordion] = useState<string>(reviews.length > 0 ? 'reviews' : 'details');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest'>('newest');
  const { user } = useAuth();

  const toggleAccordion = (section: string) => setOpenAccordion(prev => prev === section ? '' : section);

  const submitReview = async () => {
    if (!user) { toast.error('Please login to write a review'); return; }
    if (reviewData.text.length < 10) { toast.error('Review must be at least 10 characters'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, ...reviewData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || 'Review submitted!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', text: '' });
      onReviewSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayName = (u: Review['user']) => {
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName[0]}.`;
    if (u.firstName) return u.firstName;
    if (u.name) return u.name.split(' ')[0] + (u.name.split(' ')[1] ? ` ${u.name.split(' ')[1][0]}.` : '');
    return 'Customer';
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const AccordionItem = ({ id, title, badge, children }: { id: string; title: string; badge?: string; children: React.ReactNode }) => (
    <div className="border-b border-surface-subtle">
      <button onClick={() => toggleAccordion(id)} className="w-full flex items-center justify-between py-4">
        <span className="font-serif text-base font-bold text-ink flex items-center gap-2">
          {title}
          {badge && <span className="text-xs font-normal text-ink-faint">{badge}</span>}
        </span>
        <ChevronDown size={18} className={`text-ink-faint transition-transform duration-200 ${openAccordion === id ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${openAccordion === id ? 'max-h-[3000px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="pt-2">
      {/* Product Details */}
      <AccordionItem id="details" title="Product Details">
        <div className="space-y-3 text-sm text-ink-muted">
          <p>{product.description || 'Elegant handloom saree perfect for special occasions. Crafted by skilled artisans using traditional weaving techniques.'}</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Fabric', value: product.fabric || 'Handloom' },
              { label: 'Color', value: product.color },
              { label: 'Occasion', value: product.occasion },
              { label: 'Blouse Piece', value: 'Included (Unstitched)' },
              { label: 'Saree Length', value: '5.5 meters' },
              { label: 'Blouse Length', value: '0.8 meters' },
              { label: 'Wash Care', value: 'Dry Clean Only' },
            ].map(item => (
              <div key={item.label} className="py-2 border-b border-surface-subtle last:border-0">
                <p className="text-xs text-ink-faint uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </AccordionItem>

       {/* Delivery */}
       <AccordionItem id="delivery" title="Delivery & Shipping">
         <div className="space-y-4 text-sm text-ink-muted">
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs">📦</span></div>
             <div><p className="font-medium text-ink">Dispatch Time</p><p className="text-xs">Ships within 24-48 hours of order confirmation</p></div>
           </div>
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs">🚚</span></div>
             <div><p className="font-medium text-ink">Delivery</p><p className="text-xs">3-7 business days within India. Free on orders above ₹999.</p></div>
           </div>
         </div>
       </AccordionItem>

      {/* Customer Reviews — FULLY DYNAMIC */}
      <AccordionItem id="reviews" title="Customer Reviews" badge={reviewStats.totalReviews > 0 ? `(${reviewStats.totalReviews})` : undefined}>
        <div className="space-y-5">
          {reviewStats.totalReviews > 0 ? (
            <>
              {/* Rating Summary */}
              <div className="flex items-center gap-6 bg-surface-muted rounded-xl p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-ink">{reviewStats.avgRating}</p>
                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < Math.round(reviewStats.avgRating) ? 'currentColor' : 'none'} className={i < Math.round(reviewStats.avgRating) ? 'text-accent' : 'text-surface-subtle'} />
                    ))}
                  </div>
                  <p className="text-xs text-ink-faint mt-1">{reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {reviewStats.distribution.map(bar => {
                    const pct = reviewStats.totalReviews > 0 ? Math.round((bar.count / reviewStats.totalReviews) * 100) : 0;
                    return (
                      <div key={bar.stars} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-ink-faint">{bar.stars}</span>
                        <div className="flex-1 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-ink-faint">{bar.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => setSortBy('newest')} className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${sortBy === 'newest' ? 'bg-brand-800 text-white' : 'bg-surface-muted text-ink-muted'}`}>Newest</button>
                  <button onClick={() => setSortBy('highest')} className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${sortBy === 'highest' ? 'bg-brand-800 text-white' : 'bg-surface-muted text-ink-muted'}`}>Highest Rated</button>
                </div>
                {user && (
                  <button onClick={() => setShowReviewForm(true)} className="text-xs font-semibold text-brand-800 hover:underline flex items-center gap-1">
                    <Pencil size={12} /> Write a Review
                  </button>
                )}
              </div>

              {/* Reviews List */}
              {sortedReviews.map((review) => (
                <div key={review.id} className="border-b border-surface-subtle pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-800 text-accent flex items-center justify-center text-[10px] font-bold">
                        {(review.user.firstName || review.user.name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink flex items-center gap-1">
                          {getDisplayName(review.user)} <CheckCircle2 size={12} className="text-dark-green" />
                        </p>
                        <p className="text-[10px] text-ink-faint">Verified Buyer · {formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-surface-subtle'} />
                      ))}
                    </div>
                  </div>
                  {review.title && <p className="text-sm font-semibold text-ink mb-1">{review.title}</p>}
                  <p className="text-sm text-ink-muted leading-relaxed">{review.text}</p>
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="w-16 h-16 relative rounded-lg overflow-hidden bg-surface-muted border border-surface-subtle">
                          <Image src={img} alt="Review photo" fill className="object-cover" sizes="64px" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            /* No Reviews Yet */
            <div className="text-center py-8">
              <p className="text-ink-muted text-sm mb-4">No reviews yet. Be the first to share your experience!</p>
              {user ? (
                <button onClick={() => setShowReviewForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 text-white rounded-xl text-sm font-semibold hover:bg-brand-900 transition-colors">
                  <Pencil size={14} /> Write a Review
                </button>
              ) : (
                <p className="text-xs text-ink-faint">Login to write a review</p>
              )}
            </div>
          )}

          {/* Write Review Form */}
          {showReviewForm && (
            <div className="bg-surface-muted rounded-xl p-5 border border-surface-subtle space-y-4 animate-fade-in">
              <h4 className="font-serif font-bold text-ink text-sm">Write Your Review</h4>
              
              {/* Rating */}
              <div>
                <p className="text-xs font-semibold text-ink mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setReviewData(p => ({ ...p, rating: star }))} className="transition-transform hover:scale-110">
                      <Star size={24} fill={star <= reviewData.rating ? 'currentColor' : 'none'} className={star <= reviewData.rating ? 'text-accent' : 'text-surface-subtle'} />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Review title (optional)"
                value={reviewData.title}
                onChange={e => setReviewData(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />

              <textarea
                placeholder="Share your experience with this saree..."
                value={reviewData.text}
                onChange={e => setReviewData(p => ({ ...p, text: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
              />

              <div className="flex gap-2">
                <button onClick={submitReview} disabled={submitting} className="flex-1 py-2.5 bg-brand-800 text-white rounded-xl text-sm font-semibold hover:bg-brand-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 bg-white border border-surface-subtle rounded-xl text-sm font-medium text-ink-muted hover:bg-surface-muted transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </AccordionItem>
    </div>
  );
}
