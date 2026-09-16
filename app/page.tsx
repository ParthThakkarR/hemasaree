import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

// Sections
import HeroSection from '@components/home/hero-section';
import FAQSection from '@components/home/faq-section';
import NewsletterSection from '@components/home/newsletter-section';
import TrustStrip from '@components/home/trust-strip';

// Narrative components


// Content

import { generateFAQSchema } from '@/lib/content/objections';

// Data
import { ProductService } from '@/lib/services/productService';
import { prisma } from '@lib/prisma';
import MiniTrustBar from '@components/home/mini-trust-bar';
import ProductTabs from '@components/home/product-tabs';
import OffersSection from '@components/home/offers-section';
import ReviewsSection from '@components/home/reviews-section';

// The four trust vows
const VOWS = [
  {
    icon: ShieldCheck,
    vow: 'Every thread traced to its loom',
    body: 'We know where every saree comes from. Not "sourced" — made, by a person, in a place, with care.',
  },
  {
    icon: Heart,
    vow: 'No middlemen, only makers',
    body: 'We work directly with weaver cooperatives. More of what you pay reaches the hands that made it.',
  },
  {
    icon: RotateCcw,
    vow: 'If it doesn\'t sing, return it',
    body: 'Seven-day returns, no questions, free pickup. A saree should feel right the moment you drape it.',
  },
  {
    icon: Truck,
    vow: 'Packed with the same care it was woven',
    body: 'Muslin wrap, handmade paper box, artisan note inside. Not packaging — a beginning.',
  },
] as const;

export default async function Home() {
  // Parallel data fetch
  const [categories, newArrivals, trending, bestSellers] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        _count: { select: { products: { where: { isDeleted: false } } } },
      },
    }).catch(() => []),
    ProductService.getProducts({}, { page: 1, limit: 4, sortBy: 'createdAt', sortOrder: 'desc' })
      .then(r => r.products).catch(() => []),
    ProductService.getProducts({}, { page: 1, limit: 4, sortBy: 'price', sortOrder: 'desc' })
      .then(r => r.products).catch(() => []),
    ProductService.getProducts({}, { page: 1, limit: 4, sortBy: 'price', sortOrder: 'asc' })
      .then(r => r.products).catch(() => []),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  const homepageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        url: baseUrl,
        name: 'Hema Sarees — Discover the Saree That Tells Your Story',
        description: 'Handwoven sarees from master artisans across India. Maheshwari silk, Pochampally ikat, Banarasi — each with a provenance, a person, and a story.',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#organization` },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-chandan">
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema()) }} />

      {/* ════════════════════════════════════════
          HERO — "The Trunk Opens"
          Full-viewport artisan story carousel
          ════════════════════════════════════════ */}
      <HeroSection />
      <MiniTrustBar />

      {/* ════════════════════════════════════════
          SHOP BY CATEGORY — Visual entry points
          Helps browsers start shopping immediately
          ════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="section bg-chandan" aria-labelledby="shop-by-category-title">
          <div className="container-editorial">
            <div className="text-center mb-10">
              <h2 id="shop-by-category-title" className="font-noto-serif text-3xl md:text-4xl font-bold text-kajal">
                Shop by Category
              </h2>
              <p className="section-subtitle mt-3 mx-auto text-center">
                Find the perfect saree for your occasion
              </p>
            </div>

            <div className={`grid gap-4 md:gap-5 ${
              categories.length <= 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto' :
              categories.length <= 4 ? 'grid-cols-2 md:grid-cols-4' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
            }`}>
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative block rounded-2xl overflow-hidden aspect-[3/4] bg-chandan-deep border border-chandan-warm hover:shadow-luxury transition-shadow"
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-kumkum/20 to-haldi/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-kajal/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-noto-serif text-lg font-bold text-white">{cat.name}</h3>
                    <p className="text-white/70 text-xs font-medium mt-0.5">
                      {cat._count.products > 0
                        ? `${cat._count.products} handpicked ${cat._count.products === 1 ? 'piece' : 'pieces'}`
                        : 'Explore the collection'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          SHOP — tabbed product chapter
          New / Worn this week / Always chosen
          ════════════════════════════════════════ */}
      <ProductTabs
        newArrivals={newArrivals}
        trending={trending}
        bestSellers={bestSellers}
      />

      {/* Social proof early — reviews right after the shop */}
      <ReviewsSection />

      {/* Special Offers */}
      <OffersSection />

      {/* ════════════════════════════════════════
          CHAPTER 4 — "The Promise"
          Trust signals as vows, not icons + text
          ════════════════════════════════════════ */}
      <section className="chapter bg-chandan" aria-labelledby="chapter4-title">
        <div className="container-editorial">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <p className="chapter-eyebrow mb-2">Chapter Four</p>
            <h2 id="chapter4-title" className="font-noto-serif text-3xl md:text-4xl font-bold text-kajal">
              The Promise
            </h2>
            <p className="section-subtitle mt-3 mx-auto">
              These aren&apos;t policies. They&apos;re what we believe about what it means to sell something with soul.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VOWS.map(({ icon: Icon, vow, body }, i) => (
              <div
                key={vow}
                className="paper-surface rounded-2xl p-7 flex gap-5"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(212,165,55,0.1)', color: 'var(--color-haldi-deep)' }}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-noto-serif text-lg font-bold text-kajal mb-2 leading-snug">
                    {vow}
                  </h3>
                  <p className="text-sm text-kajal-soft leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ, Newsletter, Trust strip */}
      <FAQSection />
      <NewsletterSection />
      <TrustStrip />
    </div>
  );
}
