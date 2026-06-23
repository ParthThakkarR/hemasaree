import React from 'react';
import HeroSection from '@components/home/hero-section';
import CategoryScroll from '@components/home/category-scroll';
import ProductSection from '@components/home/product-section';
import OffersSection from '@components/home/offers-section';
import ReviewsSection from '@components/home/reviews-section';
import TrustStrip from '@components/home/trust-strip';
import FAQSection, { HOMEPAGE_FAQ_SCHEMA } from '@components/home/faq-section';
import NewsletterSection from '@components/home/newsletter-section';
import { ProductService } from "@/lib/services/productService";
import { prisma } from '@lib/prisma';

export default async function Home() {
  const sections = [
    { key: 'newArrivals', limit: 4, sortPrice: 'newest' },
    { key: 'trending', limit: 4, sortPrice: 'high' },
    { key: 'bestSellers', limit: 4, sortPrice: 'low' },
  ];

  const results: Record<string, any> = {};

  // Fetch products and categories in parallel
  const [, categories] = await Promise.all([
    Promise.all(
      sections.map(async (section) => {
        const filters = { maxPrice: 10000 };
        const sortOrder = section.sortPrice === 'low' || section.sortPrice === 'asc' ? 'asc' : 'desc';
        
        const result = await ProductService.getProducts(filters, {
          page: 1,
          limit: section.limit,
          sortBy: 'price',
          sortOrder,
        });

        results[section.key] = result.products;
      })
    ),
    prisma.category.findMany({
      select: { id: true, name: true, description: true, image: true },
    }).catch(() => []),
  ]);

  const newArrivals = results['newArrivals'] || [];
  const trending = results['trending'] || [];
  const bestSellers = results['bestSellers'] || [];
  const isLoading = false;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  // Homepage structured data — WebPage + ItemList + FAQ
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        url: baseUrl,
        name: 'Hema Sarees — Premium Indian Sarees Online',
        description: 'Shop premium silk, bridal, designer, cotton and festive sarees online at Hema Sarees. Handpicked collections with pan-India delivery.',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${baseUrl}/og-image.png` },
      },
      // New Arrivals ItemList
      ...(newArrivals.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: 'New Arrivals',
              description: 'Latest sarees added to Hema Sarees collection',
              numberOfItems: newArrivals.length,
              itemListElement: newArrivals.map((p: any, i: number) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${baseUrl}/product/${p.id}`,
                name: p.name,
                image: p.images?.[0]?.startsWith('http') ? p.images[0] : `${baseUrl}${p.images?.[0] || ''}`,
              })),
            },
          ]
        : []),
      // Best Sellers ItemList
      ...(bestSellers.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: 'Best Sellers',
              description: 'Most popular sarees at Hema Sarees',
              numberOfItems: bestSellers.length,
              itemListElement: bestSellers.map((p: any, i: number) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${baseUrl}/product/${p.id}`,
                name: p.name,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_FAQ_SCHEMA) }}
      />

      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Shop by Category — server-rendered */}
      <CategoryScroll initialCategories={JSON.parse(JSON.stringify(categories))} />

      {/* 3. New Arrivals */}
      <ProductSection
        title="New Arrivals"
        subtitle="Be the first to wear our latest creations, thoughtfully designed and meticulously crafted."
        products={newArrivals}
        isLoading={isLoading}
        viewAllHref="/products?sortPrice=newest"
        badge="New"
        bgClassName="bg-surface"
      />

      {/* 4. Trending Sarees */}
      <ProductSection
        title="Trending Now"
        subtitle="Most loved sarees by our customers this season."
        products={trending}
        isLoading={isLoading}
        viewAllHref="/products"
        bgClassName="bg-surface-muted"
      />

      {/* 5. Special Offers */}
      <OffersSection />

      {/* 6. Best Sellers */}
      <ProductSection
        title="Best Sellers"
        subtitle="Our all-time favourites, trusted by thousands."
        products={bestSellers}
        isLoading={isLoading}
        viewAllHref="/products?sortPrice=low"
        badge="Popular"
        bgClassName="bg-surface"
      />

      {/* 7. Customer Reviews */}
      <ReviewsSection />

      {/* 8. FAQ Section — AEO optimized */}
      <FAQSection />

      {/* 9. Newsletter Signup — CRO */}
      <NewsletterSection />

      {/* 10. Trust Signals (above footer) */}
      <TrustStrip />
    </div>
  );
}
