'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@components/ui/product-card';
import FilterSidebar from '@components/ui/filter-sidebar';
import ProductSkeleton from '@components/ui/product-skeleton';

interface Category {
  id: string;
  name: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category?: { id: string; name: string } | string;
  createdAt?: string;
}

function ProductsListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
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
      params.set('limit', '12');

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

  useEffect(() => {
    fetchProducts(1, false);
  }, [searchParams, fetchProducts]);

  const loadMore = () => {
    if (currentPage < totalPages) {
      fetchProducts(currentPage + 1, true);
    }
  };

  // Fetch suggested products when no results
  useEffect(() => {
    if (!loading && products.length === 0) {
      fetch('/api/products?limit=12')
        .then(res => res.json())
        .then(data => setSuggestedProducts(Array.isArray(data.products) ? data.products : []))
        .catch(err => console.error('Failed to fetch suggested products', err));
    }
  }, [loading, products.length]);

  // Active filter chips helper
  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(Array.from(searchParams.entries()));
    newParams.delete(key);
    newParams.set('page', '1');
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const activeFilters: { key: string; label: string }[] = [];
  if (searchParams.get('category')) activeFilters.push({ key: 'category', label: searchParams.get('category')! });
  if (searchParams.get('search')) activeFilters.push({ key: 'search', label: `"${searchParams.get('search')}"` });
  if (searchParams.get('color')) activeFilters.push({ key: 'color', label: searchParams.get('color')! });
  if (searchParams.get('fabric')) activeFilters.push({ key: 'fabric', label: searchParams.get('fabric')! });
  if (searchParams.get('occasion')) activeFilters.push({ key: 'occasion', label: searchParams.get('occasion')! });
  if (searchParams.get('maxPrice') && Number(searchParams.get('maxPrice')) < 10000) {
    activeFilters.push({ key: 'maxPrice', label: `Under ₹${Number(searchParams.get('maxPrice')).toLocaleString('en-IN')}` });
  }
  if (searchParams.get('sortPrice')) {
    const sortLabel = { newest: 'Newest', low: 'Price: Low-High', high: 'Price: High-Low', popular: 'Popular' }[searchParams.get('sortPrice')!] || searchParams.get('sortPrice')!;
    activeFilters.push({ key: 'sortPrice', label: sortLabel });
  }

  return (
    <div className="min-h-screen bg-surface pt-8 lg:pt-12 pb-16">
      
      {/* Header Banner */}
      <div className="relative h-[220px] sm:h-[280px] md:h-[320px] mb-8 lg:mb-12 rounded-2xl overflow-hidden mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto">
        <img 
          src={(() => {
            const selectedCategory = searchParams.get('category');
            if (selectedCategory) {
              const catData = categories.find(c => c.name === selectedCategory);
              if (catData?.image) return catData.image;
            }
            // Default fallback
            return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600';
          })()}
          alt="Collection Hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {searchParams.get('category') ? `${searchParams.get('category')} Collection` : 'All Sarees'}
            </h1>
            <p className="text-brand-50/80 text-sm sm:text-base max-w-lg">
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-muted">
                Showing <span className="text-ink font-semibold">{products.length}</span> of {totalProducts} sarees
              </p>
              
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-muted border border-surface-subtle rounded-xl text-sm font-medium hover:bg-brand-50 hover:text-brand-800 transition-all active:scale-[0.98]"
              >
                <SlidersHorizontal size={15} /> Filters
                {activeFilters.length > 0 && (
                  <span className="bg-brand-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeFilters.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => removeFilter(filter.key)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-800 text-xs font-semibold rounded-full border border-brand-100 hover:bg-brand-100 transition-all"
                  >
                    <span>{filter.label}</span>
                    <X size={13} className="text-brand-400 group-hover:text-brand-800 transition-colors" />
                  </button>
                ))}
                <button 
                  onClick={() => router.push(pathname, { scroll: false })}
                  className="text-xs font-semibold text-ink-muted hover:text-brand-800 underline underline-offset-2 ml-1 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
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
                      className="inline-flex items-center justify-center px-8 py-3 bg-brand-800 text-white font-semibold rounded-xl hover:bg-brand-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-brand-sm"
                    >
                      {loadingMore ? 'Loading...' : 'Load More Sarees'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State with Recommendations */
              <div className="space-y-12">
                <div className="text-center py-16 bg-surface-muted rounded-2xl border border-surface-subtle">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-ink-faint">
                    <Filter size={22} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">No sarees found</h3>
                  <p className="text-ink-muted text-sm max-w-md mx-auto mb-6">
                    We couldn&apos;t find any sarees matching your filters. Try adjusting your search or explore our recommendations below.
                  </p>
                  <button 
                    onClick={() => router.push(pathname, { scroll: false })}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-800 text-white font-semibold rounded-xl hover:bg-brand-900 transition-colors shadow-brand-sm"
                  >
                    Clear All Filters
                  </button>
                </div>

                {suggestedProducts.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-ink mb-6 text-center">Recommended For You</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                      {suggestedProducts.map((p, i) => (
                        <ProductCard key={p.id} product={p} priority={i < 4} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface pt-32 px-4 flex justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-800 rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsListingContent />
    </Suspense>
  );
}
