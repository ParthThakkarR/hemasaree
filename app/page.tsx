import React from 'react';
import HeroSection from '@components/home/hero-section';
import CategoryScroll from '@components/home/category-scroll';
import ProductSection from '@components/home/product-section';
import OffersSection from '@components/home/offers-section';
import ReviewsSection from '@components/home/reviews-section';
import TrustStrip from '@components/home/trust-strip';
import { ProductService } from "@/lib/services/productService";

export default async function Home() {
  const sections = [
    { key: 'newArrivals', limit: 4, sortPrice: 'newest' },
    { key: 'trending', limit: 4, sortPrice: 'high' },
    { key: 'bestSellers', limit: 4, sortPrice: 'low' },
  ];

  const results: Record<string, any> = {};

  await Promise.all(
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
  );

  const newArrivals = results['newArrivals'] || [];
  const trending = results['trending'] || [];
  const bestSellers = results['bestSellers'] || [];
  const isLoading = false;

  return (
    <div className="min-h-screen bg-surface">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Shop by Category */}
      <CategoryScroll />

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

      {/* 8. Trust Signals (above footer) */}
      <TrustStrip />
    </div>
  );
}
