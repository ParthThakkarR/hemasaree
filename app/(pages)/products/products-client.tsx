'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import ProductCard from '@components/ui/product-card';
import FilterSidebar from '@components/ui/filter-sidebar';
import ProductSkeleton from '@components/ui/product-skeleton';
import GuaranteeBadge from '@components/ui/GuaranteeBadge';
import Breadcrumb from '@components/ui/breadcrumb';

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

interface ProductsClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialTotal: number;
  multiCategoryBannerImage?: string | null;
}

/** Parse comma-separated category param into an array */
function parseCategoryParam(param: string | null): string[] {
  if (!param) return [];
  return param.split(',').map(c => c.trim()).filter(Boolean);
}

function ProductsListingContent({ initialProducts, initialCategories, initialTotal, multiCategoryBannerImage }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [categories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 12));
  const [totalProducts, setTotalProducts] = useState(initialTotal);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Track whether URL params have changed from initial load
  const [hasNavigated, setHasNavigated] = useState(false);

  // Fetch Products when URL params change (after initial render)
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

  // Only re-fetch when searchParams change AFTER initial render
  useEffect(() => {
    if (!hasNavigated) {
      setHasNavigated(true);
      return;
    }
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  // Remove a specific filter
  const removeFilter = (key: string, value?: string) => {
    const newParams = new URLSearchParams(Array.from(searchParams.entries()));

    // For category, handle removing individual categories from comma-separated list
    if (key === 'category' && value) {
      const currentCategories = parseCategoryParam(newParams.get('category'));
      const remaining = currentCategories.filter(c => c !== value);
      if (remaining.length > 0) {
        newParams.set('category', remaining.join(','));
      } else {
        newParams.delete('category');
      }
    } else {
      newParams.delete(key);
    }

    newParams.set('page', '1');
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Build active filter chips
  const selectedCategories = parseCategoryParam(searchParams.get('category'));

  const activeFilters: { key: string; label: string; value?: string }[] = [];
  // Add individual category chips
  for (const cat of selectedCategories) {
    activeFilters.push({ key: 'category', label: cat, value: cat });
  }
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

  // Resolve banner image based on category selection
  const bannerSrc = (() => {
    if (selectedCategories.length === 1) {
      // Single category → show that category's image
      const catData = categories.find(c => c.name === selectedCategories[0]);
      if (catData?.image) return catData.image;
    }
    // Multiple categories or no category → show admin-configured banner or default
    if (multiCategoryBannerImage) return multiCategoryBannerImage;
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600';
  })();

  // Dynamic banner title
  const bannerTitle = (() => {
    if (selectedCategories.length === 0) return 'Handwoven for Your Occasion';
    if (selectedCategories.length === 1) return `${selectedCategories[0]} Collection`;
    return `${selectedCategories.join(' & ')} Collections`;
  })();

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb
          items={[
            { label: 'All Sarees', href: '/products' },
            ...(selectedCategories.length === 1
              ? [{ label: `${selectedCategories[0]} Collection` }]
              : selectedCategories.length > 1
                ? [{ label: `${selectedCategories.join(' & ')}` }]
                : []),
          ]}
        />
      </div>

      <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[520px] mb-8 lg:mb-12 rounded-2xl overflow-hidden mx-4 sm:mx-6 lg:mx-auto max-w-5xl">
        <Image
          src={bannerSrc}
          alt={selectedCategories.length > 0 ? `${selectedCategories.join(', ')} sarees collection` : 'Sarees collection'}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {bannerTitle}
            </h1>
            <p className="text-brand-50/80 text-sm sm:text-base max-w-lg">
              {searchParams.get('search')
                ? `Search results for "${searchParams.get('search')}"`
                : 'Every saree traced to its artisan. All sales final.'}
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

            {/* Quick Filter Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 [&::-webkit-scrollbar]:hidden">
              {[{ name: 'All', href: '' }, ...categories.slice(0, 6)].map((cat) => {
                const isActive = cat.name === 'All'
                  ? selectedCategories.length === 0
                  : selectedCategories.includes(cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      const newParams = new URLSearchParams(Array.from(searchParams.entries()));
                      if (cat.name === 'All') {
                        newParams.delete('category');
                      } else {
                        newParams.set('category', cat.name);
                      }
                      newParams.set('page', '1');
                      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-800 text-white border-brand-800 shadow-brand-sm'
                        : 'bg-white text-ink-muted border-surface-subtle hover:border-brand-200 hover:text-ink'
                    }`}
                  >
                    {cat.name === 'All' ? 'All Sarees' : cat.name}
                  </button>
                );
              })}
            </div>

            {/* Toolbar — Product Count + Sort + Filters */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-ink-muted">
                  Showing <span className="text-ink font-semibold">{products.length}</span> of{' '}
                  <span className="font-medium">{totalProducts}</span>{' '}
                  {selectedCategories.length === 1 ? `${selectedCategories[0]} ` : ''}sarees
                </p>
                <GuaranteeBadge variant="compact" className="hidden md:flex" />
              </div>

              <div className="flex items-center gap-2">
                {/* Inline Sort Dropdown */}
                <div className="relative hidden sm:block">
                  <select
                    value={searchParams.get('sortPrice') || ''}
                    onChange={(e) => {
                      const newParams = new URLSearchParams(Array.from(searchParams.entries()));
                      if (e.target.value) {
                        newParams.set('sortPrice', e.target.value);
                      } else {
                        newParams.delete('sortPrice');
                      }
                      newParams.set('page', '1');
                      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
                    }}
                    className="appearance-none bg-surface-muted border border-surface-subtle rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-ink cursor-pointer hover:bg-brand-50 hover:text-brand-800 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="">Sort by</option>
                    <option value="newest">Newest</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="popular">Popular</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                </div>

                {/* Mobile Filters Button */}
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  aria-label="Open filters"
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-muted border border-surface-subtle rounded-xl text-sm font-medium hover:bg-brand-50 hover:text-brand-800 transition-all active:scale-[0.98]"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="bg-brand-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeFilters.map((filter, idx) => (
                  <button
                    key={`${filter.key}-${filter.value || filter.label}-${idx}`}
                    onClick={() => removeFilter(filter.key, filter.value)}
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-4 md:gap-5 lg:gap-6 ${products.length === 1 ? 'grid-cols-1 max-w-sm' :
                  products.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
                    'grid-cols-2 lg:grid-cols-3 w-full'
                  }`}>
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

export default function ProductsClient(props: ProductsClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface pt-32 px-4 flex justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-800 rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsListingContent {...props} />
    </Suspense>
  );
}
