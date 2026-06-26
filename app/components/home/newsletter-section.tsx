'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Mail, Sparkles } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Welcome! Use code WELCOME200 at checkout for ₹200 off your first order.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <section className="py-16 lg:py-20 bg-brand-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-brand-900/30" />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-brand-900/20" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/60 border border-brand-800/50 text-accent text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} />
            Exclusive Offers
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
            Get <span className="text-accent">₹200 Off</span> Your First Order
          </h2>
          <p className="text-brand-100/70 text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Join 10,000+ saree lovers. Get early access to new arrivals, exclusive discounts, and styling tips delivered to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-grow">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-100/40"
              />
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address for newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                className="w-full pl-11 pr-4 py-3.5 bg-brand-900/50 border border-brand-800/50 text-brand-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all placeholder:text-brand-100/30 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-accent hover:bg-accent-light text-brand-950 px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-[0.98] whitespace-nowrap"
            >
              {status === 'loading' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Subscribe <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm mt-4 ${
                status === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {message}
            </motion.p>
          )}

          <p className="text-[11px] text-brand-100/30 mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
