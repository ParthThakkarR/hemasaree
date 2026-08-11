import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

// Sections
import HeroSection from '@components/home/hero-section';
import FAQSection, { HOMEPAGE_FAQ_SCHEMA } from '@components/home/faq-section';
import NewsletterSection from '@components/home/newsletter-section';
import TrustStrip from '@components/home/trust-strip';

// Narrative components
import StoryCard from '@components/ui/StoryCard';
import OccasionCard from '@components/ui/OccasionCard';

// Content
import { artisanStories } from '@/lib/content/stories';
import { occasions } from '@/lib/content/occasions';

// Data
import { ProductService } from '@/lib/services/productService';
import { prisma } from '@lib/prisma';
import ProductSection from '@components/home/product-section';
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
      select: { id: true, name: true, description: true, image: true },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_FAQ_SCHEMA) }} />

      {/* ════════════════════════════════════════
          HERO — "The Trunk Opens"
          Full-viewport artisan story carousel
          ════════════════════════════════════════ */}
      <HeroSection />

      {/* ════════════════════════════════════════
          CHAPTER 1 — "This Season's Stories"
          3 artisan narratives, not product cards
          ════════════════════════════════════════ */}
      <section className="chapter bg-chandan" aria-labelledby="chapter1-title">
        <div className="container-editorial">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="chapter-eyebrow mb-2">Chapter One</p>
              <h2 id="chapter1-title" className="font-noto-serif text-3xl md:text-4xl font-bold text-kajal">
              This season&apos;s stories
              </h2>
              <p className="section-subtitle mt-3">
                Behind every saree is a woman who knows things about cloth that cannot be written down.
              </p>
              <div className="luxury-divider mt-5" style={{ maxWidth: '100px', margin: '1.25rem 0 0' }}>
                <span className="luxury-divider-icon" />
              </div>
            </div>
            <Link
              href="/products"
              className="self-start sm:self-auto text-sm font-semibold text-kumkum hover:text-kumkum-deep transition-colors whitespace-nowrap"
            >
              All sarees →
            </Link>
          </div>

          {/* Story cards — horizontal on mobile (scroll), grid on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            {artisanStories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} className="min-w-[72vw] sm:min-w-0 sm:w-auto" />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          New Arrivals — editorial product chapter
          ════════════════════════════════════════ */}
      <section className="section bg-chandan-deep" aria-labelledby="new-arrivals-title">
        <div className="container-editorial">
          <ProductSection
            title="New arrivals"
            subtitle="The most recently woven — straight from the loom to you."
            products={newArrivals}
            isLoading={false}
            viewAllHref="/products?sortBy=createdAt&sortOrder=desc"
            bgClassName=""
          />
        </div>
      </section>

      {/* ════════════════════════════════════════
          CHAPTER 2 — "Occasions That Matter"
          6 narrative occasions, not categories
          ════════════════════════════════════════ */}
      <section className="chapter bg-chandan" aria-labelledby="chapter2-title">
        <div className="container-editorial">
          <div className="mb-12">
            <p className="chapter-eyebrow mb-2">Chapter Two</p>
            <h2 id="chapter2-title" className="font-noto-serif text-3xl md:text-4xl font-bold text-kajal">
              What is happening in your life?
            </h2>
            <p className="section-subtitle mt-3">
              Not categories. Moments. The saree finds its way to the occasion that needs it.
            </p>
            <div className="luxury-divider mt-5" style={{ maxWidth: '100px', margin: '1.25rem 0 0' }}>
              <span className="luxury-divider-icon" />
            </div>
          </div>

          {/* Asymmetric editorial grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* First occasion — large, spans 2 rows */}
            <OccasionCard
              occasion={occasions[0]}
              index={0}
              className="col-span-2 md:col-span-1 md:row-span-2 md:h-auto h-60"
              variant="portrait"
            />
            {/* Remaining 5 */}
            {occasions.slice(1, 6).map((occ, i) => (
              <OccasionCard
                key={occ.id}
                occasion={occ}
                index={i + 1}
                variant="portrait"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <OffersSection />

      {/* Trending */}
      <section className="section bg-chandan" aria-labelledby="trending-title">
        <div className="container-editorial">
          <ProductSection
            title="Worn this week"
            subtitle="What our community is reaching for right now."
            products={trending}
            isLoading={false}
            viewAllHref="/products"
            bgClassName=""
          />
        </div>
      </section>

      {/* ════════════════════════════════════════
          CHAPTER 3 — "Woven By"
          Artisan portraits — the faces behind the fabric
          ════════════════════════════════════════ */}
      <section className="chapter bg-midnight" aria-labelledby="chapter3-title">
        <div className="container-editorial">
          <div className="mb-12">
            <p className="chapter-eyebrow mb-2" style={{ color: 'rgba(212,165,55,0.7)' }}>Chapter Three</p>
            <h2
              id="chapter3-title"
              className="font-noto-serif text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--color-chandan)' }}
            >
              Woven by
            </h2>
            <p className="section-subtitle mt-3" style={{ color: 'rgba(253,248,243,0.55)' }}>
              Her hands knew this pattern before her mother taught her.
              These are not &ldquo;our artisans.&rdquo; They are the reason this exists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artisanStories.map((story, i) => (
              <Link
                key={story.id}
                href={`/products?category=${encodeURIComponent(story.categoryFilter)}`}
                className="group relative block rounded-2xl overflow-hidden aspect-[4/5]"
                aria-label={`Explore ${story.craft} sarees by ${story.name}`}
              >
                <Image
                  src={story.portrait}
                  alt={`${story.name}, ${story.craft} artisan from ${story.village}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 vignette-bottom opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-haldi text-xs font-semibold uppercase tracking-widest mb-1.5">{story.craft}</p>
                  <h3 className="font-noto-serif text-xl font-bold text-white leading-snug">{story.name}</h3>
                  <p className="text-white/50 text-sm mt-0.5" lang="hi">{story.nameDevanagari}</p>
                  <p className="text-white/45 text-xs mt-1">{story.village}, {story.state}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section bg-chandan-deep" aria-labelledby="bestsellers-title">
        <div className="container-editorial">
          <ProductSection
            title="Always chosen"
            subtitle="The ones women reach for again — and gift to their daughters."
            products={bestSellers}
            isLoading={false}
            viewAllHref="/products"
            badge="Beloved"
            bgClassName=""
          />
        </div>
      </section>

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

      {/* Customer reviews, FAQ, Newsletter, Trust strip */}
      <ReviewsSection />
      <FAQSection />
      <NewsletterSection />
      <TrustStrip />
    </div>
  );
}
