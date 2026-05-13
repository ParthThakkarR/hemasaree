'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '@app/contexts/CartContext';
import { useWishlist } from '@app/contexts/WishlistContext';
import { useAuth } from '@app/contexts/AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  // Hidden on admin pages or specific checkout pages if needed
  if (pathname.startsWith('/admin')) return null;

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/products', icon: Search },
    { name: 'Wishlist', href: '/wishlist', icon: Heart, badge: user ? wishlistCount : 0 },
    { name: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: user ? 'Profile' : 'Sign In', href: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-subtle pb-safe pt-2 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 h-12 transition-colors ${
                isActive ? 'text-brand-600' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'animate-bounce-soft' : ''} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

