'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCart } from '@contexts/cart-context';
import { useWishlist } from '@contexts/wishlist-context';
import { useAuth } from '@contexts/auth-context';

// Spring presets
const SPRING_INDICATOR = { type: 'spring' as const, bounce: 0.2, duration: 0.35 };
const SPRING_TAP       = { type: 'spring' as const, bounce: 0.3, duration: 0.25 };

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount }    = useCart();
  const { wishlistCount }= useWishlist();
  const { user }         = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // Hidden on admin and studio pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return null;

  const navItems = [
    { name: 'Home',     href: '/',         icon: Home,        badge: undefined          },
    { name: 'Shop',     href: '/products', icon: Search,      badge: undefined          },
    { name: 'Wishlist', href: '/wishlist', icon: Heart,       badge: user ? wishlistCount : 0 },
    { name: 'Cart',     href: '/cart',     icon: ShoppingBag, badge: cartCount          },
    { name: user ? 'Profile' : 'Sign In', href: user ? '/profile' : '/login', icon: User, badge: undefined },
  ];

  const tapProps = prefersReducedMotion
    ? {}
    : { whileTap: { scale: 0.88 } };

  const indicatorTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : SPRING_INDICATOR;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-mobile-nav pb-safe lg:hidden">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon     = item.icon;

          return (
            <motion.div
              key={item.name}
              {...tapProps}
              transition={SPRING_TAP}
              className="relative"
            >
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center w-16 py-1.5 transition-colors ${
                  isActive ? 'text-brand-800' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {/* Animated gold top bar — slides via layoutId */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-1.5 w-8 h-0.5 bg-accent rounded-full"
                    transition={indicatorTransition}
                  />
                )}

                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
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
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
