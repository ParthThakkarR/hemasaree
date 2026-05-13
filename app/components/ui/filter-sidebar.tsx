'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, X, Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function FilterSidebar({ categories, isMobileOpen, onMobileClose }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state synced from URL
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 10000);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Sync state when URL changes externally
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setMaxPrice(Number(searchParams.get('maxPrice')) || 10000);
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Push updates to URL
  const updateFilters = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Reset page to 1 when filters change
    current.set('page', '1');

    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
    onMobileClose();
  };

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== (searchParams.get('search') || '')) {
         updateFilters('search', searchQuery);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, searchParams]);

  const SidebarContent = (
    <div className="flex flex-col gap-8 h-full">
      {/* Header (Mobile Only) */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
          <Filter size={20} /> Filters
        </h2>
        <button onClick={onMobileClose} className="p-2 text-ink-muted hover:text-ink bg-surface-muted rounded-full">
          <X size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Search</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sarees..."
          className="w-full px-4 py-2.5 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-shadow placeholder:text-ink-faint"
        />
      </div>

      <div className="h-px bg-surface-subtle" />

      {/* Category */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Category</h3>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === '' ? 'border-brand-800 bg-brand-800 text-white' : 'border-brand-200 group-hover:border-brand-800 bg-white'}`}>
              {selectedCategory === '' && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className={`text-sm ${selectedCategory === '' ? 'font-medium text-ink' : 'text-ink-muted group-hover:text-ink'}`}>All Categories</span>
            <input type="radio" className="hidden" checked={selectedCategory === ''} onChange={() => updateFilters('category', null)} />
          </label>

          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.name ? 'border-brand-800 bg-brand-800 text-white' : 'border-brand-200 group-hover:border-brand-800 bg-white'}`}>
                {selectedCategory === cat.name && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className={`text-sm ${selectedCategory === cat.name ? 'font-medium text-ink' : 'text-ink-muted group-hover:text-ink'}`}>{cat.name}</span>
              <input type="radio" className="hidden" checked={selectedCategory === cat.name} onChange={() => updateFilters('category', cat.name)} />
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-surface-subtle" />

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Price Range</h3>
          <span className="text-sm font-medium text-brand-800">Up to ₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
        
        <input
          type="range"
          min={500}
          max={10000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={() => updateFilters('maxPrice', maxPrice.toString())}
          onTouchEnd={() => updateFilters('maxPrice', maxPrice.toString())}
          className="w-full h-1.5 bg-brand-100 rounded-full appearance-none cursor-pointer accent-brand-800 hover:accent-brand-900 transition-all"
        />
        
        <div className="flex items-center justify-between text-xs text-ink-faint font-medium">
          <span>₹500</span>
          <span>₹10,000+</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-6 lg:pt-2">
        <button
          onClick={clearFilters}
          className="w-full py-2.5 px-4 bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl text-sm font-medium transition-colors"
        >
          Clear All Filters
        </button>
        {/* Mobile Apply Button */}
        <button
          onClick={onMobileClose}
          className="w-full mt-3 py-3 px-4 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-sm font-semibold lg:hidden shadow-md transition-colors"
        >
          View Results
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-6 custom-scrollbar pb-8">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onMobileClose} />
          
          {/* Drawer */}
          <div className="relative w-[85%] max-w-sm bg-surface h-full shadow-2xl animate-slide-right ml-auto flex flex-col p-6 overflow-y-auto">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
