'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth } from '@contexts/auth-context';

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  // Hidden on admin and studio pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return null;

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/products', icon: Search },
    { name: 'Wishlist', href: '/wishlist', icon: Heart, badge: user ? wishlistCount : 0 },
    { name: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: user ? 'Profile' : 'Sign In', href: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-surface-subtle pb-safe lg:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 py-1.5 transition-colors ${
                isActive ? 'text-brand-800' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {/* Gold accent line for active item */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-0.5 bg-accent rounded-full" />
              )}

              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-800 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-surface px-0.5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-brand-800' : 'text-ink-faint'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
