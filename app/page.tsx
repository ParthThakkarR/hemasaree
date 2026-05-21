'use client';

import React, { useEffect, useState } from 'react';
import HeroSection from '@components/home/hero-section';
import CategoryScroll from '@components/home/category-scroll';
import ProductSection from '@components/home/product-section';
import OffersSection from '@components/home/offers-section';
import ReviewsSection from '@components/home/reviews-section';
import TrustStrip from '@components/home/trust-strip';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sections: [
              { key: 'newArrivals', limit: 4, sortPrice: 'newest' },
              { key: 'trending', limit: 4, sortPrice: 'high' },
              { key: 'bestSellers', limit: 4, sortPrice: 'low' },
            ],
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        setNewArrivals(data.sections.newArrivals || []);
        setTrending(data.sections.trending || []);
        setBestSellers(data.sections.bestSellers || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
