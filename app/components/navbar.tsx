'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useSiteSettings } from '@contexts/site-settings-context';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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
    <>
      {/* Sticky Navbar — fixed height, no padding transitions */}
      <header
        className="sticky top-0 z-40 will-change-transform"
        style={{ height: '72px' }}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isScrolled
              ? 'bg-surface/97 backdrop-blur-xl shadow-sm border-b border-surface-subtle'
              : 'bg-surface border-b border-transparent'
          }`}
        />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 lg:gap-8">

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 text-ink hover:text-brand-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo — no animations, stable */}
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

            {/* Desktop Wishlist & Cart */}
            <div className="hidden lg:flex items-center gap-1">
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
                  onMouseEnter={() => setIsProfileDropdownOpen(true)}
                  onMouseLeave={() => setIsProfileDropdownOpen(false)}
                >
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-muted text-ink transition-colors">
                    <div className="w-9 h-9 rounded-full bg-brand-800 text-accent flex items-center justify-center font-bold text-sm uppercase">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {/* Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-luxury border border-surface-subtle overflow-hidden animate-fade-in-scale origin-top-right">
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
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm bg-surface shadow-2xl animate-slide-right flex flex-col pb-safe">

            {/* Drawer Header */}
            <div className="p-5 flex items-center justify-between border-b border-surface-subtle">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                {settings?.logo ? (
                  <div className="relative w-8 h-8">
                    <Image src={urlFor(settings.logo).url()} alt={siteTitle} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-800 text-accent flex items-center justify-center font-serif text-base font-bold border border-brand-700">
                    {siteTitle.charAt(0)}
                  </div>
                )}
                <span className="font-serif text-lg font-bold text-brand-800">{siteTitle}</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-ink-muted hover:text-ink bg-surface-muted rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-5 pb-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" size={17} />
                <input
                  type="text"
                  placeholder="Search sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-ink-faint"
                />
              </form>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overscroll-none px-5 py-3">
              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  className={`px-4 py-3 rounded-xl font-semibold transition-colors text-[15px] ${pathname === '/' ? 'bg-brand-50 text-brand-800' : 'text-ink hover:bg-surface-muted'
                    }`}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className={`px-4 py-3 rounded-xl font-semibold transition-colors text-[15px] ${pathname === '/products' ? 'bg-brand-50 text-brand-800' : 'text-ink hover:bg-surface-muted'
                    }`}
                >
                  All Sarees
                </Link>

                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-ink-faint uppercase tracking-[0.15em] mb-2">Collections</p>
                  {collections.map(col => (
                    <Link
                      key={col.name}
                      href={col.href}
                      className="block px-4 py-2.5 text-sm font-medium text-ink hover:text-brand-800 hover:bg-surface-muted rounded-lg transition-colors"
                    >
                      {col.name}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-surface-subtle my-3" />

                <Link
                  href="/wishlist"
                  className="px-4 py-3 rounded-xl font-semibold transition-colors text-[15px] text-ink hover:bg-surface-muted flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <Heart size={18} /> Wishlist
                  </span>
                  {user && wishlistCount > 0 && (
                    <span className="bg-accent/20 text-accent-dark text-xs font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
                  )}
                </Link>

                <Link
                  href="/cart"
                  className="px-4 py-3 rounded-xl font-semibold transition-colors text-[15px] text-ink hover:bg-surface-muted flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag size={18} /> Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-brand-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                  )}
                </Link>
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-surface-subtle">
              {!isLoading && !user ? (
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center py-3 bg-brand-800 text-white rounded-xl font-semibold hover:bg-brand-900 transition-colors shadow-brand-sm"
                >
                  Sign In / Register
                </Link>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-800 text-accent flex items-center justify-center font-bold text-sm uppercase">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{user.firstName || 'User'}</p>
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </div>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
