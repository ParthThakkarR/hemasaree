'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, LogOut, Package, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@contexts/auth-context';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useSiteSettings } from '@contexts/site-settings-context';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

// ── Spring presets ─────────────────────────────────────
const SPRING_UI     = { type: 'spring' as const, bounce: 0,    duration: 0.35 };
const SPRING_EXPRESS= { type: 'spring' as const, bounce: 0.25, duration: 0.3  };

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);

  const collectionsRef   = useRef<HTMLDivElement>(null);
  const profileRef       = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router   = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const { user, logout, isLoading } = useAuth();
  const { cartCount }               = useCart();
  const { wishlistCount }           = useWishlist();
  const { settings }                = useSiteSettings();

  const siteTitle = settings?.title || 'Hema Sarees';

  // ── Scroll detection ─────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close dropdowns on route change ─────────────────
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsCollectionsOpen(false);
  }, [pathname]);

  // ── Close on pointer-up outside ─────────────────────
  useEffect(() => {
    if (!isCollectionsOpen && !isProfileDropdownOpen) return;

    const handlePointerUp = (e: PointerEvent) => {
      const collectionsEl = collectionsRef.current;
      const profileEl     = profileRef.current;

      if (isCollectionsOpen && collectionsEl && !collectionsEl.contains(e.target as Node)) {
        setIsCollectionsOpen(false);
      }
      if (isProfileDropdownOpen && profileEl && !profileEl.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Listen on capture phase so we get it before the element does
    document.addEventListener('pointerup', handlePointerUp, { capture: true });
    return () => document.removeEventListener('pointerup', handlePointerUp, { capture: true });
  }, [isCollectionsOpen, isProfileDropdownOpen]);

  // ── Search handler — no artificial debounce ──────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearchSubmitting) return;
    setIsSearchSubmitting(true);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setIsSearchSubmitting(false);
  };

  const collections = [
    { name: 'Bridal',     href: '/products?category=Bridal'     },
    { name: 'Festive',    href: '/products?category=Festive'    },
    { name: 'Silk',       href: '/products?category=Silk'       },
    { name: 'Casual',     href: '/products?category=Casual'     },
    { name: 'Party Wear', href: '/products?category=Party Wear' },
  ];

  if (pathname.startsWith('/admin')) return null;

  // ── Dropdown animation variants ──────────────────────
  const dropdownVariants = prefersReducedMotion
    ? {
        hidden : { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit   : { opacity: 0, transition: { duration: 0.1  } },
      }
    : {
        hidden : { opacity: 0, y: -6, scale: 0.96, transformOrigin: 'top center' },
        visible: { opacity: 1, y: 0,  scale: 1,    transition: SPRING_UI },
        exit   : { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.15 } },
      };

  const profileDropdownVariants = prefersReducedMotion
    ? dropdownVariants
    : {
        hidden : { opacity: 0, y: -6, scale: 0.96, transformOrigin: 'top right' },
        visible: { opacity: 1, y: 0,  scale: 1,    transition: SPRING_UI },
        exit   : { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.15 } },
      };

  // ── Icon press spring ─────────────────────────────────
  const iconTap = prefersReducedMotion ? {} : { scale: 0.88 };

  return (
    <header className="sticky top-0 z-40 will-change-transform">
      {/* ── Background glass panel — springs in/out ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={isScrolled ? 'scrolled' : 'top'}
        variants={prefersReducedMotion
          ? {
              top    : { backgroundColor: 'rgba(255,253,247,1)', borderBottomColor: 'transparent' },
              scrolled: { backgroundColor: 'rgba(255,253,247,1)', borderBottomColor: 'rgba(237,230,214,0.4)' },
            }
          : {
              top    : {
                backgroundColor: 'rgba(255,253,247,1)',
                backdropFilter : 'blur(0px) saturate(100%)',
                borderBottomColor: 'transparent',
                boxShadow: '0 0 0 rgba(0,0,0,0)',
              },
              scrolled: {
                backgroundColor: 'rgba(255,253,247,0.85)',
                backdropFilter : 'blur(20px) saturate(180%)',
                borderBottomColor: 'rgba(255,255,255,0.4)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(42,31,31,0.04)',
              },
            }
        }
        transition={SPRING_UI}
        style={{ borderBottom: '1px solid transparent' }}
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
              className={`text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${
                pathname === '/' ? 'text-brand-800' : 'text-ink/60'
              }`}
            >
              Home
            </Link>

            {/* Collections Dropdown */}
            <div
              ref={collectionsRef}
              className="relative"
              onMouseEnter={() => setIsCollectionsOpen(true)}
              onMouseLeave={() => setIsCollectionsOpen(false)}
              onKeyDown={(e) => { if (e.key === 'Escape') setIsCollectionsOpen(false); }}
            >
              <button
                aria-expanded={isCollectionsOpen}
                aria-haspopup="true"
                onPointerDown={() => setIsCollectionsOpen(prev => !prev)}
                className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${
                  pathname.includes('category') ? 'text-brand-800' : 'text-ink/60'
                }`}
              >
                Collections
                <motion.span
                  animate={{ rotate: isCollectionsOpen ? 180 : 0 }}
                  transition={SPRING_UI}
                  className="inline-flex"
                  aria-hidden="true"
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isCollectionsOpen && (
                  <motion.div
                    role="menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 glass-dropdown rounded-xl overflow-hidden"
                  >
                    <div className="py-2">
                      {collections.map(col => (
                        <Link
                          key={col.name}
                          href={col.href}
                          role="menuitem"
                          onClick={() => setIsCollectionsOpen(false)}
                          className="block px-5 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 transition-colors font-medium"
                        >
                          {col.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/products"
              className={`text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${
                pathname === '/products' && !pathname.includes('category') ? 'text-brand-800' : 'text-ink/60'
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
                type="search"
                placeholder="Search sarees..."
                aria-label="Search sarees"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPointerDown={(e) => {
                  // Instant focus ring on pointer-down, not just keyboard
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                className="input-press w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-subtle rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 placeholder:text-ink-faint text-ink"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Wishlist & Cart */}
            <div className="flex items-center gap-1">
              <motion.div whileTap={iconTap} transition={SPRING_EXPRESS}>
                <Link href="/wishlist" aria-label="Wishlist" className="relative p-2.5 text-ink hover:text-brand-800 transition-colors rounded-full hover:bg-surface-muted inline-flex">
                  <Heart size={21} />
                  {user && wishlistCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                  )}
                </Link>
              </motion.div>

              <motion.div whileTap={iconTap} transition={SPRING_EXPRESS}>
                <Link href="/cart" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} className="relative p-2.5 text-ink hover:text-brand-800 transition-colors rounded-full hover:bg-surface-muted inline-flex">
                  <ShoppingBag size={21} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-brand-800 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface px-0.5" aria-hidden="true">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            </div>

            {/* User Profile */}
            <div className="relative">
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-surface-muted animate-pulse" />
              ) : user ? (
                <div
                  ref={profileRef}
                  className="relative"
                  onMouseEnter={() => setIsProfileDropdownOpen(true)}
                  onMouseLeave={() => setIsProfileDropdownOpen(false)}
                >
                  <motion.button
                    whileTap={iconTap}
                    transition={SPRING_EXPRESS}
                    onPointerDown={() => setIsProfileDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-muted text-ink transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-800 text-accent flex items-center justify-center font-bold text-sm uppercase">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        variants={profileDropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 top-full pt-1.5 z-50"
                      >
                        <div className="w-52 glass-dropdown rounded-xl overflow-hidden">
                          <div className="px-4 py-3 border-b border-surface-muted">
                            <p className="text-sm font-semibold text-ink truncate">{user.firstName || 'User'}</p>
                            <p className="text-xs text-ink-muted truncate">{user.email}</p>
                          </div>
                          {user.isAdmin && (
                            <Link href="/admin" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 font-medium transition-colors">
                              <User size={16} /> Admin Dashboard
                            </Link>
                          )}
                          <Link href="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 font-medium transition-colors">
                            <User size={16} /> My Profile
                          </Link>
                          <Link href="/orders" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted hover:text-brand-800 font-medium transition-colors">
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div whileTap={{ scale: 0.96 }} transition={SPRING_UI}>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-brand-800 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-brand-900 transition-colors shadow-brand-sm"
                  >
                    Sign In
                  </Link>
                </motion.div>
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
              type="search"
              placeholder="Search sarees..."
              aria-label="Search sarees"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPointerDown={(e) => (e.currentTarget as HTMLInputElement).focus()}
              className="input-press w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-subtle rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 placeholder:text-ink-faint text-ink"
            />
          </form>

          {/* Mobile Categories */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4">
            <div className="flex items-center gap-2 w-max pb-1">
              <Link href="/products" className="text-[13px] font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors bg-surface-muted border border-surface-subtle text-ink hover:bg-surface-subtle press-target">
                All Sarees
              </Link>
              {collections.map(col => (
                <Link
                  key={col.name}
                  href={col.href}
                  className="text-[13px] font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors bg-surface-muted border border-surface-subtle text-ink hover:bg-surface-subtle press-target"
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
