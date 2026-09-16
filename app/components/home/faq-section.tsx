'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  OBJECTIONS,
  ALL_CATEGORIES,
  searchObjections,
  generateFAQSchema,
  type ObjectionCategory,
} from '@/lib/content/objections';

const CATEGORY_LABELS: Record<ObjectionCategory | 'All', string> = {
  'All': 'All',
  'Fit & Sizing': 'Fit',
  'Fabric Feel': 'Fabric',
  'Final Sale': 'Final Sale',
  'Shipping': 'Shipping',
  'Authenticity': 'Authenticity',
  'Care': 'Care',
  'General': 'General',
};

const WHATSAPP_URL =
  'https://wa.me/919429475736?text=' +
  encodeURIComponent(
    "Hi, I have a question about a saree I'm interested in. Can you help me?"
  );

export default function FAQSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<ObjectionCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(OBJECTIONS[0]?.id ?? null);

  const filtered = useMemo(() => {
    const bySearch = searchQuery.trim()
      ? searchObjections(searchQuery)
      : OBJECTIONS;
    if (activeCategory === 'All') return bySearch;
    return bySearch.filter((o) => o.category === activeCategory);
  }, [activeCategory, searchQuery]);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const categories: Array<ObjectionCategory | 'All'> = ['All', ...ALL_CATEGORIES];

  return (
    <>
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema()) }}
      />

      <section className="py-16 lg:py-24 bg-surface-muted" id="faq" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-10">
            <h2 id="faq-heading" className="section-title text-2xl md:text-3xl mb-3">
              Your questions, answered — before you even ask.
            </h2>
            <p className="section-subtitle mx-auto max-w-xl">
              Real questions from real customers. If yours is not here,{' '}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-800 font-semibold hover:underline"
              >
                ask us on WhatsApp
              </a>
              .
            </p>
            <div className="luxury-divider mt-4">
              <span className="luxury-divider-icon" />
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search questions — e.g. final sale, silk, sizing..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveCategory('All');
              }}
              className="w-full pl-10 pr-4 py-3 bg-white border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-ink placeholder:text-ink-faint"
              aria-label="Search frequently asked questions"
            />
          </div>

          {/* Category tabs */}
          <div
            className="flex flex-wrap gap-2 mb-8"
            role="tablist"
            aria-label="Filter questions by category"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery('');
                }}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand-800 text-white border-brand-800'
                    : 'bg-white text-ink-muted border-surface-subtle hover:border-brand-300 hover:text-brand-800'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-3" role="tabpanel">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-ink-muted text-sm">
                No questions matching &ldquo;{searchQuery}&rdquo;.{' '}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-800 font-semibold hover:underline"
                >
                  Ask us directly →
                </a>
              </div>
            )}

            {filtered.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-surface-subtle overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                itemScope
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  aria-expanded={openId === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span
                    className="font-serif text-base font-semibold text-ink"
                    itemProp="name"
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-ink-faint flex-shrink-0 transition-transform duration-300 ${
                      openId === faq.id ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                      itemScope
                      itemType="https://schema.org/Answer"
                    >
                      <div className="px-6 pb-6">
                        <div className="pt-1 border-t border-surface-subtle" />
                        <p
                          className="text-sm text-ink-muted leading-relaxed mt-4"
                          itemProp="text"
                        >
                          {faq.answer}
                        </p>
                        <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-3 font-medium">
                          {faq.category}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Ask a question CTA */}
          <div className="mt-10 text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all font-semibold text-sm"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Ask Your Question on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * FAQ schema data — now delegated to lib/content/objections.ts generateFAQSchema()
 * Kept for backward compat with homepage JSON-LD import.
 */
export const HOMEPAGE_FAQ_SCHEMA = generateFAQSchema();
