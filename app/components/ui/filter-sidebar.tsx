'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, X, Filter, SlidersHorizontal } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const FABRIC_OPTIONS = ['Silk', 'Cotton', 'Banarasi', 'Linen', 'Chiffon', 'Georgette'];
const COLOR_OPTIONS = [
  { name: 'Red', hex: '#C0392B' },
  { name: 'Maroon', hex: '#6B0F1A' },
  { name: 'Green', hex: '#1B3A2D' },
  { name: 'Blue', hex: '#2E4057' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Pink', hex: '#D4838F' },
  { name: 'Yellow', hex: '#D4A520' },
  { name: 'White', hex: '#F5F0E6' },
  { name: 'Orange', hex: '#D97706' },
  { name: 'Purple', hex: '#6B3A8A' },
];
const OCCASION_OPTIONS = ['Bridal', 'Festival', 'Casual', 'Party Wear', 'Office', 'Puja'];
const PRICE_PRESETS = [
  { label: 'Under ₹1,000', max: 1000 },
  { label: '₹1,000 - ₹3,000', min: 1000, max: 3000 },
  { label: '₹3,000 - ₹5,000', min: 3000, max: 5000 },
  { label: 'Above ₹5,000', min: 5000 },
];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'low' },
  { label: 'Price: High to Low', value: 'high' },
  { label: 'Popular', value: 'popular' },
];

/** Parse comma-separated category param into an array */
function parseCategoryParam(param: string | null): string[] {
  if (!param) return [];
  return param.split(',').map(c => c.trim()).filter(Boolean);
}

export default function FilterSidebar({ categories, isMobileOpen, onMobileClose }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseCategoryParam(searchParams.get('category')));
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 10000);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || '');
  const [selectedFabric, setSelectedFabric] = useState(searchParams.get('fabric') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortPrice') || '');

  // Accordion states: Collapsed by default, expanded if active filter exists
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: !!searchParams.get('category'),
    price: !!searchParams.get('minPrice') || !!searchParams.get('maxPrice'),
    fabric: !!searchParams.get('fabric'),
    color: !!searchParams.get('color'),
    occasion: !!searchParams.get('occasion'),
    sort: !!searchParams.get('sortPrice'),
  });

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync state when URL changes externally
  useEffect(() => {
    setSelectedCategories(parseCategoryParam(searchParams.get('category')));
    setMinPrice(Number(searchParams.get('minPrice')) || 0);
    setMaxPrice(Number(searchParams.get('maxPrice')) || 10000);
    setSearchQuery(searchParams.get('search') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedOccasion(searchParams.get('occasion') || '');
    setSelectedFabric(searchParams.get('fabric') || '');
    setSortBy(searchParams.get('sortPrice') || '');
  }, [searchParams]);

  const updateFilters = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', '1');
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const updateMultipleFilters = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', '1');
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  /** Toggle a category in the multi-select list */
  const toggleCategory = (categoryName: string) => {
    let newCategories: string[];
    if (selectedCategories.includes(categoryName)) {
      // Remove it
      newCategories = selectedCategories.filter(c => c !== categoryName);
    } else {
      // Add it
      newCategories = [...selectedCategories, categoryName];
    }
    // Update URL
    updateFilters('category', newCategories.length > 0 ? newCategories.join(',') : null);
  };

  /** Clear all selected categories */
  const clearCategories = () => {
    updateFilters('category', null);
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
    onMobileClose();
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== (searchParams.get('search') || '')) {
        updateFilters('search', searchQuery || null);
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const hasActiveFilters = selectedCategories.length > 0 || selectedColor || selectedFabric || selectedOccasion || searchParams.get('search') || (maxPrice < 10000) || (minPrice > 0) || sortBy;

  const AccordionHeader = ({ label, sectionKey, count }: { label: string; sectionKey: string; count?: number }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-2 text-sm font-semibold text-ink uppercase tracking-wider hover:text-brand-800 transition-colors"
    >
      <span className="flex items-center gap-2">
        {label}
        {count && count > 0 ? (
          <span className="bg-brand-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center normal-case tracking-normal">
            {count}
          </span>
        ) : null}
      </span>
      <ChevronDown size={16} className={`text-ink-faint transition-transform duration-200 ${openSections[sectionKey] ? 'rotate-180' : ''}`} />
    </button>
  );

  /** True checkbox option that supports multi-select */
  const CheckboxOption = ({ label, isSelected, onChange }: { label: string; isSelected: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'border-brand-800 bg-brand-800' : 'border-surface-subtle group-hover:border-brand-300 bg-white'}`}>
        {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className={`text-sm ${isSelected ? 'font-medium text-ink' : 'text-ink-muted group-hover:text-ink'}`}>{label}</span>
      <input type="checkbox" className="hidden" checked={isSelected} onChange={onChange} />
    </label>
  );

  /** Radio-style option for single-select fields like sort */
  const RadioOption = ({ label, isSelected, onChange }: { label: string; isSelected: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-800' : 'border-surface-subtle group-hover:border-brand-300'}`}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-brand-800" />}
      </div>
      <span className={`text-sm ${isSelected ? 'font-medium text-ink' : 'text-ink-muted group-hover:text-ink'}`}>{label}</span>
      <input type="radio" className="hidden" checked={isSelected} onChange={onChange} />
    </label>
  );

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header (Mobile Only) */}
      <div className="flex items-center justify-between lg:hidden py-4 border-b border-surface-subtle">
        <h2 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h2>
        <button onClick={onMobileClose} className="p-2 text-ink-muted hover:text-ink bg-surface-muted rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="py-4 border-b border-surface-subtle">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sarees..."
          className="w-full px-4 py-2.5 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all placeholder:text-ink-faint"
        />
      </div>

      {/* Popular Quick Filters */}
      <div className="py-4 border-b border-surface-subtle">
        <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-2.5">Popular</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Under ₹2,000', action: () => { setMaxPrice(2000); updateFilters('maxPrice', '2000'); } },
            { label: 'New Arrivals', action: () => updateFilters('sortPrice', 'newest') },
            { label: 'In Stock', action: () => {} },
            { label: 'Free Shipping', action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); navigator.vibrate?.(5); }}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-accent/30 bg-accent/5 text-accent-dark hover:bg-accent/15 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="py-4 border-b border-surface-subtle">
        <AccordionHeader label="Sort By" sectionKey="sort" />
        {openSections.sort && (
          <div className="flex flex-col gap-0.5 mt-1 animate-fade-in">
            {SORT_OPTIONS.map(opt => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                isSelected={sortBy === opt.value}
                onChange={() => updateFilters('sortPrice', sortBy === opt.value ? null : opt.value)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category — TRUE MULTI-SELECT */}
      <div className="py-4 border-b border-surface-subtle">
        <AccordionHeader label="Category" sectionKey="category" count={selectedCategories.length} />
        {openSections.category && (
          <div className="flex flex-col gap-0.5 mt-1 animate-fade-in">
            <CheckboxOption
              label="All Categories"
              isSelected={selectedCategories.length === 0}
              onChange={clearCategories}
            />
            {categories.map((cat) => (
              <CheckboxOption
                key={cat.id}
                label={cat.name}
                isSelected={selectedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="py-4 border-b border-surface-subtle">
        <AccordionHeader label="Price Range" sectionKey="price" />
        {openSections.price && (
          <div className="mt-1 space-y-2 animate-fade-in">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const newMin = preset.min || 0;
                    const newMax = preset.max || 10000;
                    setMinPrice(newMin);
                    setMaxPrice(newMax);
                    
                    updateMultipleFilters({
                      minPrice: newMin > 0 ? newMin.toString() : null,
                      maxPrice: newMax < 10000 ? newMax.toString() : null,
                    });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    ((preset.min || 0) === minPrice && (preset.max || 10000) === maxPrice) 
                      ? 'bg-brand-800 text-white border-brand-800' 
                      : 'bg-white text-ink-muted border-surface-subtle hover:border-brand-200 hover:text-ink'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-faint">₹0</span>
                <span className="text-sm font-semibold text-brand-800">
                  ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice === 10000 ? '10,000+' : maxPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-ink-faint">₹10,000+</span>
              </div>
              <div className="relative h-2 w-full flex items-center">
                {/* Track */}
                <div className="absolute w-full h-1 bg-surface-subtle rounded-full z-0" />
                {/* Active Track */}
                <div 
                  className="absolute h-1 bg-brand-800 rounded-full z-10" 
                  style={{ 
                     left: `${(minPrice / 10000) * 100}%`, 
                     width: `${((maxPrice - minPrice) / 10000) * 100}%` 
                  }} 
                />
                
                {/* Min Input */}
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={500}
                  value={minPrice}
                  onChange={(e) => {
                    const value = Math.min(Number(e.target.value), maxPrice - 500);
                    setMinPrice(value);
                  }}
                  onMouseUp={() => updateFilters('minPrice', minPrice > 0 ? minPrice.toString() : null)}
                  onTouchEnd={() => updateFilters('minPrice', minPrice > 0 ? minPrice.toString() : null)}
                  className="absolute w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none z-20 dual-range-input"
                />
                
                {/* Max Input */}
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => {
                    const value = Math.max(Number(e.target.value), minPrice + 500);
                    setMaxPrice(value);
                  }}
                  onMouseUp={() => updateFilters('maxPrice', maxPrice < 10000 ? maxPrice.toString() : null)}
                  onTouchEnd={() => updateFilters('maxPrice', maxPrice < 10000 ? maxPrice.toString() : null)}
                  className="absolute w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none z-20 dual-range-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fabric */}
      <div className="py-4 border-b border-surface-subtle">
        <AccordionHeader label="Fabric" sectionKey="fabric" />
        {openSections.fabric && (
          <div className="flex flex-wrap gap-1.5 mt-2 animate-fade-in">
            {FABRIC_OPTIONS.map(fabric => (
               <button
                 key={fabric}
                 onClick={() => updateFilters('fabric', selectedFabric === fabric ? null : fabric)}
                 className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                   selectedFabric === fabric
                     ? 'bg-brand-800 text-white border-brand-800'
                     : 'bg-white text-ink-muted border-surface-subtle hover:border-brand-200 hover:text-ink'
                 }`}
               >
                 {fabric}
               </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="py-4 border-b border-surface-subtle">
        <AccordionHeader label="Color" sectionKey="color" />
        {openSections.color && (
          <div className="flex flex-wrap gap-2 mt-2 animate-fade-in">
            {COLOR_OPTIONS.map(color => (
               <button
                 key={color.name}
                 onClick={() => updateFilters('color', selectedColor === color.name ? null : color.name)}
                 title={color.name}
                 className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                   selectedColor === color.name
                     ? 'border-brand-800 ring-2 ring-brand-800/30 scale-110'
                     : 'border-surface-subtle hover:border-brand-200'
                 }`}
                 style={{ backgroundColor: color.hex }}
               />
            ))}
          </div>
        )}
      </div>

      {/* Occasion */}
      <div className="py-4">
        <AccordionHeader label="Occasion" sectionKey="occasion" />
        {openSections.occasion && (
          <div className="flex flex-wrap gap-1.5 mt-2 animate-fade-in">
            {OCCASION_OPTIONS.map(occ => (
               <button
                 key={occ}
                 onClick={() => updateFilters('occasion', selectedOccasion === occ ? null : occ)}
                 className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                   selectedOccasion === occ
                     ? 'bg-brand-800 text-white border-brand-800'
                     : 'bg-white text-ink-muted border-surface-subtle hover:border-brand-200 hover:text-ink'
                 }`}
               >
                 {occ}
               </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full py-2.5 px-4 bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
          >
            Clear All Filters
          </button>
        )}
        {/* Mobile Apply Button */}
        <button
          onClick={onMobileClose}
          className="w-full mt-3 py-3 px-4 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-sm font-semibold lg:hidden shadow-brand-sm transition-all active:scale-[0.98]"
        >
          View Results
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 hide-scrollbar pb-8">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-sm animate-fade-in" onClick={onMobileClose} />
          <div className="relative w-[85%] max-w-sm bg-surface h-full shadow-2xl animate-slide-right ml-auto flex flex-col p-5 overflow-y-auto">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
