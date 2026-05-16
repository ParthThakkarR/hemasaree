'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, Trash2, Star, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  title?: string;
  text: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
  user: { id: string; firstName?: string; lastName?: string; name?: string; email: string; image?: string };
  product: { id: string; name: string; images: string[]; price: number };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0 });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setCounts(data.counts || { total: 0, pending: 0, approved: 0 });
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(reviewId);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Review ${action === 'delete' ? 'deleted' : action + 'd'}`);
      fetchReviews();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getDisplayName = (u: Review['user']) => {
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.name || u.email;
  };

  const getImageSrc = (img?: string) => {
    if (!img) return '/uploads/placeholder.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.replace(/^\/+/, '/');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and moderate customer reviews</p>
        </div>

        {/* Counts */}
        <div className="flex gap-3">
          {[
            { key: 'all', label: 'All', count: counts.total },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'approved', label: 'Approved', count: counts.approved },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-[#5E2A35] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#5E2A35]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Filter className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500 text-lg font-medium">No {filter !== 'all' ? filter : ''} reviews</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'pending' ? 'All caught up! No reviews waiting for approval.' : 'Reviews will appear here once customers submit them.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product thumbnail */}
                <div className="w-16 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={getImageSrc(review.product.images?.[0])} alt={review.product.name} fill className="object-cover" sizes="64px" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{getDisplayName(review.user)}</p>
                      <p className="text-xs text-gray-400">{review.user.email} · {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${review.isApproved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Product name */}
                  <p className="text-xs text-gray-500 mb-2">
                    On: <span className="font-medium text-gray-700">{review.product.name}</span> · ₹{review.product.price.toLocaleString('en-IN')}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>

                  {/* Review content */}
                  {review.title && <p className="font-medium text-sm text-gray-900 mb-1">{review.title}</p>}
                  <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>

                  {/* Review images */}
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image src={img} alt="Review photo" fill className="object-cover" sizes="64px" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleAction(review.id, 'approve')}
                        disabled={actionLoading === review.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                    )}
                    {review.isApproved && (
                      <button
                        onClick={() => handleAction(review.id, 'reject')}
                        disabled={actionLoading === review.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} />}
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(review.id, 'delete')}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
