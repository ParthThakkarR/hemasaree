'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useSiteSettings } from '@contexts/site-settings-context';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileDropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const { user, logout, isLoading } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSiteSettings();

  const siteTitle = settings?.title || 'Hema Sarees';


  // Stable scroll detection — no height or padding changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearchSubmitting) return;

    setIsSearchSubmitting(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchSubmitting(false);
    }, 300);
  };

  const collections = [
    { name: 'Bridal', href: '/products?category=Bridal' },
    { name: 'Festive', href: '/products?category=Festive' },
    { name: 'Silk', href: '/products?category=Silk' },
    { name: 'Casual', href: '/products?category=Casual' },
    { name: 'Party Wear', href: '/products?category=Party Wear' },
  ];

  // Hidden on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className="sticky top-0 z-40 will-change-transform"
    >
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isScrolled
            ? 'bg-surface/97 backdrop-blur-xl shadow-sm border-b border-surface-subtle'
            : 'bg-surface border-b border-transparent'
        }`}
      />

      <div className="relative flex flex-col w-full max-w-7xl mx-auto">
        {/* Main Header Row */}
        <div className="h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            {settings?.logo ? (
              <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                <Image 
                  src={urlFor(settings.logo).url()} 
                  alt={siteTitle}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-800 text-accent flex items-center justify-center font-serif text-lg font-bold border border-brand-700">
                {siteTitle.charAt(0)}
              </div>
            )}
            <span className="font-serif text-xl lg:text-2xl font-bold tracking-wide text-brand-800">
              {siteTitle}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              href="/"
              className={`text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${pathname === '/' ? 'text-brand-800' : 'text-ink/60'
                }`}
            >
              Home
            </Link>

            {/* Collections Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                setIsCollectionsOpen(true);
              }}
              onMouseLeave={() => {
                dropdownTimeoutRef.current = setTimeout(() => setIsCollectionsOpen(false), 150);
              }}
            >
              <button className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${pathname.includes('category') ? 'text-brand-800' : 'text-ink/60'}`}>
                Collections <ChevronDown size={14} className={`transition-transform duration-200 ${isCollectionsOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white border border-surface-subtle rounded-xl shadow-luxury overflow-hidden transition-all duration-200 ${isCollectionsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <div className="py-2">
                  {collections.map(col => (
                    <Link
                      key={col.name}
                      href={col.href}
                      className="block px-5 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 transition-colors font-medium"
                    >
                      {col.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/products"
              className={`text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${pathname === '/products' && !pathname.includes('category') ? 'text-brand-800' : 'text-ink/60'
                }`}
            >
              All Sarees
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-grow max-w-sm">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" size={17} />
              <input
                type="text"
                placeholder="Search sarees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-subtle rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all placeholder:text-ink-faint text-ink"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Wishlist & Cart */}
            <div className="flex items-center gap-1">
              <Link href="/wishlist" aria-label="Wishlist" className="relative p-2.5 text-ink hover:text-brand-800 transition-colors rounded-full hover:bg-surface-muted">
                <Heart size={21} />
                {user && wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                )}
              </Link>

              <Link href="/cart" className="relative p-2.5 text-ink hover:text-brand-800 transition-colors rounded-full hover:bg-surface-muted">
                <ShoppingBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-brand-800 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface px-0.5">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User Profile */}
            <div className="relative">
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-surface-muted animate-pulse" />
              ) : user ? (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (profileDropdownTimeoutRef.current) clearTimeout(profileDropdownTimeoutRef.current);
                    setIsProfileDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    profileDropdownTimeoutRef.current = setTimeout(() => setIsProfileDropdownOpen(false), 150);
                  }}
                >
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-muted text-ink transition-colors">
                    <div className="w-9 h-9 rounded-full bg-brand-800 text-accent flex items-center justify-center font-bold text-sm uppercase">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {/* Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full pt-1.5 z-50">
                      <div className="w-52 bg-white rounded-xl shadow-luxury border border-surface-subtle overflow-hidden animate-fade-in-scale origin-top-right">
                        <div className="px-4 py-3 border-b border-surface-muted">
                          <p className="text-sm font-semibold text-ink truncate">{user.firstName || 'User'}</p>
                          <p className="text-xs text-ink-muted truncate">{user.email}</p>
                        </div>
                        {user.isAdmin && (
                          <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 font-medium transition-colors">
                            <User size={16} /> Admin Dashboard
                          </Link>
                        )}
                        <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 font-medium transition-colors">
                          <User size={16} /> My Profile
                        </Link>
                        <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 font-medium transition-colors">
                          <Package size={16} /> My Orders
                        </Link>
                        <div className="border-t border-surface-muted">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-red-50 text-left font-medium transition-colors"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-brand-800 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-brand-900 transition-colors shadow-brand-sm"
                >
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search & Categories Row */}
        <div className="lg:hidden px-4 pb-3 flex flex-col gap-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" size={17} />
            <input
              type="text"
              placeholder="Search sarees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-subtle rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all placeholder:text-ink-faint text-ink"
            />
          </form>
          
          {/* Mobile Categories */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4">
            <div className="flex items-center gap-2 w-max pb-1">
              <Link href="/products" className="text-[13px] font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors bg-surface-muted border border-surface-subtle text-ink hover:bg-surface-subtle">
                All Sarees
              </Link>
              {collections.map(col => (
                <Link
                  key={col.name}
                  href={col.href}
                  className="text-[13px] font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors bg-surface-muted border border-surface-subtle text-ink hover:bg-surface-subtle"
                >
                  {col.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
