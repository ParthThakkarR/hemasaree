'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import ProductCard from '@components/ui/product-card';
import FilterSidebar from '@components/ui/filter-sidebar';
import ProductSkeleton from '@components/ui/product-skeleton';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category?: { id: string; name: string } | string;
}

function ProductsListingContent() {
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : data.categories || []))
      .catch((err) => console.error('Failed to fetch categories', err));
  }, []);

  // Fetch Products based on URL query params
  const fetchProducts = useCallback(async (page: number, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('page', page.toString());
      params.set('limit', '12'); // 12 items per page for better grid filling

      const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      
      const fetchedProducts = Array.isArray(data.products) ? data.products : [];
      
      setProducts(prev => append ? [...prev, ...fetchedProducts] : fetchedProducts);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProducts(data.pagination?.totalProducts || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams]);

  // Trigger fetch when URL changes
  useEffect(() => {
    fetchProducts(1, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, fetchProducts]);

  const loadMore = () => {
    if (currentPage < totalPages) {
      fetchProducts(currentPage + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 lg:pt-32 pb-16">
      
      {/* Header */}
      <div className="relative h-[300px] md:h-[400px] mb-8 lg:mb-12 rounded-b-3xl overflow-hidden mx-4 sm:mx-6 lg:mx-8">
        <img 
          src={
            searchParams.get('category') === 'Bridal' ? 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600' :
            searchParams.get('category') === 'Festive' ? 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=1600' :
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600'
          }
          alt="Collection Hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {searchParams.get('category') ? `${searchParams.get('category')} Collection` : 'All Sarees'}
            </h1>
            <p className="text-brand-50 text-base md:text-lg opacity-90 max-w-xl">
              {searchParams.get('search') 
                ? `Search results for "${searchParams.get('search')}"`
                : 'Discover our handpicked collection of exquisite sarees, woven with love and tradition.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <FilterSidebar 
            categories={categories} 
            isMobileOpen={isMobileFiltersOpen}
            onMobileClose={() => setIsMobileFiltersOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-ink-muted font-medium">
                Showing <span className="text-ink font-bold">{products.length}</span> of {totalProducts} products
              </p>
              
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-muted border border-surface-subtle rounded-lg text-sm font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                <Filter size={16} /> Filters
              </button>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} priority={i < 4} />
                  ))}
                </div>

                {/* Load More */}
                {currentPage < totalPages && (
                  <div className="mt-12 text-center">
                    <button 
                      onClick={loadMore} 
                      disabled={loadingMore}
                      className="inline-flex items-center justify-center px-8 py-3 bg-brand-800 text-white font-semibold rounded-[10px] hover:bg-brand-900 transition-colors disabled:opacity-50 shadow-md"
                    >
                      {loadingMore ? 'Loading...' : 'Load More Sarees'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-20 bg-surface-muted rounded-2xl border border-surface-subtle">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-ink-faint">
                  <Filter size={24} />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">No products found</h3>
                <p className="text-ink-muted text-sm max-w-md mx-auto">
                  We couldn&apos;t find any sarees matching your current filters. Try adjusting your search or clearing filters.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense because we use useSearchParams
export default function ProductsListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface pt-32 px-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsListingContent />
    </Suspense>
  );
}

