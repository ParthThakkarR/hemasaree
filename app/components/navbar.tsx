'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout, isLoading } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40); // 40 is the height of announcement bar
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const collections = [
    { name: 'Bridal', href: '/products?category=Bridal' },
    { name: 'Festive', href: '/products?category=Festive' },
    { name: 'Casual', href: '/products?category=Casual' },
    { name: 'Gifts', href: '/products?category=Gifts' },
  ];

  // Hidden on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#6B0F1A] text-white text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide z-50 relative flex items-center justify-center gap-2">
        <span>Festive Season Sale: Free Shipping on Orders Over ₹999 |</span>
        <Link href="/products" className="underline hover:text-accent transition-colors font-bold">Shop Now</Link>
      </div>

      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'top-0 bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-surface-subtle' 
            : 'top-[36px] bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 text-[#3D1A24] hover:text-brand-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-wide text-brand-800 group-hover:text-brand-900 transition-colors">
                Hema Sarees
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${
                  pathname === '/' ? 'text-brand-800' : 'text-[#3D1A24]/70'
                }`}
              >
                Home
              </Link>
              
              {/* Collections Dropdown */}
              <div className="relative group">
                <button className={`flex items-center gap-1 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${pathname.includes('category') ? 'text-brand-800' : 'text-[#3D1A24]/70'}`}>
                   Collections <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-brand-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                   {collections.map(col => (
                      <Link key={col.name} href={col.href} className="block px-4 py-3 text-sm text-[#3D1A24] hover:bg-brand-50 hover:text-brand-800 transition-colors border-b border-brand-50 last:border-0 font-medium">
                         {col.name}
                      </Link>
                   ))}
                </div>
              </div>

              <Link
                href="/products"
                className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-brand-800 ${
                  pathname === '/products' && !pathname.includes('category') ? 'text-brand-800' : 'text-[#3D1A24]/70'
                }`}
              >
                All Sarees
              </Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden lg:block flex-grow max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-800/50" size={18} />
                <input
                  type="text"
                  placeholder="Search elegant sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-brand-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-transparent transition-all placeholder:text-ink-faint text-[#3D1A24]"
                />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              
              {/* Desktop Wishlist & Cart */}
              <div className="hidden lg:flex items-center gap-4">
                <Link href="/wishlist" aria-label="Wishlist" className="relative p-2 text-[#3D1A24] hover:text-brand-800 transition-colors group">
                  <Heart size={22} className="group-hover:scale-110 transition-transform" />
                  {user && wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-600 rounded-full border-2 border-white"></span>
                  )}
                </Link>

                <Link href="/cart" className="relative p-2 text-[#3D1A24] hover:text-brand-800 transition-colors group">
                  <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-600 rounded-full border-2 border-white"></span>
                  )}
                </Link>
              </div>

              {/* User Profile */}
              <div className="relative">
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-brand-100 animate-pulse border border-brand-200" />
                ) : user ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsProfileDropdownOpen(true)}
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                  >
                      <button className="flex items-center gap-2 p-2 rounded-full hover:bg-brand-50 text-[#3D1A24] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand-800 text-accent flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                      </button>

                      {/* Dropdown */}
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-brand-100 overflow-hidden py-2 animate-scale-in origin-top-right">
                          <div className="px-4 py-2 border-b border-brand-50 mb-1">
                            <p className="text-sm font-semibold text-[#3D1A24] truncate">{user.firstName || 'User'}</p>
                            <p className="text-xs text-[#3D1A24]/70 truncate">{user.email}</p>
                          </div>
                          {user.isAdmin && (
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-[#3D1A24]/80 hover:bg-brand-50 hover:text-brand-800 font-medium">
                              <User size={16} /> Admin Dashboard
                            </Link>
                          )}
                          <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-[#3D1A24]/80 hover:bg-brand-50 hover:text-brand-800 font-medium">
                            <User size={16} /> My Profile
                          </Link>
                          <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-[#3D1A24]/80 hover:bg-brand-50 hover:text-brand-800 font-medium">
                            <Package size={16} /> My Orders
                          </Link>
                          <button 
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-medium"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      className="flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-brand-800 text-white rounded-full text-xs sm:text-sm font-medium hover:bg-brand-900 transition-colors shadow-md"
                    >
                      Sign In
                    </Link>
                  )}
              </div>
              
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#3D1A24]/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-surface shadow-2xl animate-slide-right flex flex-col h-full">
            
            <div className="p-4 flex items-center justify-between border-b border-brand-100">
              <span className="font-serif text-xl font-bold text-brand-800">Hema Sarees</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#3D1A24]/60 hover:text-[#3D1A24] bg-surface-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <form onSubmit={handleSearch} className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-800/50" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-brand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </form>

              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
                    pathname === '/' ? 'bg-brand-50 text-brand-800' : 'text-[#3D1A24] hover:bg-surface-muted'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
                    pathname === '/products' && !pathname.includes('category') ? 'bg-brand-50 text-brand-800' : 'text-[#3D1A24] hover:bg-surface-muted'
                  }`}
                >
                  All Sarees
                </Link>
                
                <div className="pt-4 pb-2">
                   <p className="px-4 text-xs font-bold text-[#3D1A24]/50 uppercase tracking-wider mb-2">Collections</p>
                   {collections.map(col => (
                      <Link key={col.name} href={col.href} className="block px-4 py-2 text-sm font-medium text-[#3D1A24] hover:text-brand-800">
                         {col.name}
                      </Link>
                   ))}
                </div>
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-brand-100">
              {!isLoading && !user && (
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-center py-3 bg-brand-800 text-white rounded-xl font-semibold hover:bg-brand-900 transition-colors shadow-md"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}


