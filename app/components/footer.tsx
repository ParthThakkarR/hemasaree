'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, ArrowRight, Loader2, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSiteSettings } from '@contexts/site-settings-context';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

const SPRING_BTN = { type: 'spring' as const, bounce: 0, duration: 0.3 };

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();

  const siteTitle       = settings?.title || 'Hema Sarees';
  const siteDescription = settings?.description || 'Honoring tradition through every weave. Elevating Indian fashion for the modern woman with handpicked, exquisite sarees.';

  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (pathname?.startsWith('/studio') || pathname?.startsWith('/admin')) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res  = await fetch('/api/newsletter', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed!');
        setEmail('');
        // Success haptic
        navigator.vibrate?.([10]);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
        navigator.vibrate?.([5, 50, 50]);
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe');
      navigator.vibrate?.([5, 50, 50]);
    }

    setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
  };

  const buttonTap = prefersReducedMotion ? {} : { scale: 0.94 };
  const linkHover = prefersReducedMotion ? {} : { x: 2 };

  return (
    <footer className="bg-brand-950 text-brand-100/80 pt-16 pb-24 lg:pb-8 relative">
      {/* Luxury gold border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 pt-4">

          {/* Col 1: Brand & Newsletter */}
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {settings?.logo ? (
                <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                  <Image src={urlFor(settings.logo).url()} alt={siteTitle} fill className="object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-900 text-accent flex items-center justify-center font-serif text-lg font-bold border border-brand-800/50">
                  {siteTitle.charAt(0)}
                </div>
              )}
              <span className="font-serif text-xl font-bold text-brand-50 tracking-wide">{siteTitle}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-brand-100/60">{siteDescription}</p>
            <div>
              <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-3 text-xs">Join Our Newsletter</h4>
              <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <div className="flex">
                  <input
                    ref={inputRef}
                    type="email"
                    placeholder="Your email address"
                    aria-label="Email address for newsletter"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onPointerDown={() => inputRef.current?.focus()} // instant focus on pointer-down
                    required
                    disabled={status === 'loading'}
                    className="input-press bg-brand-900/40 border border-brand-800/40 text-brand-50 px-4 py-2.5 rounded-l-lg focus:outline-none focus:border-accent/50 w-full text-sm disabled:opacity-50 placeholder:text-brand-100/30"
                  />
                  <motion.button
                    type="submit"
                    whileTap={buttonTap}
                    transition={SPRING_BTN}
                    aria-label="Subscribe to newsletter"
                    disabled={status === 'loading'}
                    className="bg-accent text-brand-950 px-4 rounded-r-lg font-semibold hover:bg-accent-light transition-colors flex items-center justify-center disabled:opacity-50 min-w-[44px]"
                  >
                    {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  </motion.button>
                </div>
                {message && (
                  <p className={`text-xs ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Col 2: Saree Guides */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5 text-xs">Saree Guides</h4>
            <ul className="space-y-3">
              {[
                { href: '/blog/best-sarees-for-weddings', label: 'Wedding Saree Guide' },
                { href: '/blog/silk-saree-care',          label: 'Silk Saree Care' },
                { href: '/blog/how-to-choose-silk-saree', label: 'How to Choose Silk' },
                { href: '/blog/saree-trends-2026',        label: 'Latest Saree Trends' },
              ].map(item => (
                <li key={item.href}>
                  <motion.div whileHover={linkHover} transition={SPRING_BTN}>
                    <Link href={item.href} className="hover:text-white transition-colors text-sm">{item.label}</Link>
                  </motion.div>
                </li>
              ))}
              <li>
                <motion.div whileHover={linkHover} transition={SPRING_BTN}>
                  <Link href="/blog" className="hover:text-white transition-colors text-sm font-medium mt-2 block">View All Guides →</Link>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Col 3: Shop Collections */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5 text-xs">Shop Collections</h4>
            <ul className="space-y-3">
              {[
                { href: '/products',                  label: 'All Sarees'     },
                { href: '/products?category=Bridal',  label: 'Bridal Sarees'  },
                { href: '/products?category=Silk',    label: 'Silk Sarees'    },
                { href: '/products?category=Cotton',  label: 'Cotton Sarees'  },
                { href: '/products?category=Party+Wear', label: 'Party Wear'  },
              ].map(item => (
                <li key={item.href}>
                  <motion.div whileHover={linkHover} transition={SPRING_BTN}>
                    <Link href={item.href} className="text-sm hover:text-accent transition-colors">{item.label}</Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Help & Contact */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5 text-xs">Help &amp; Contact</h4>
            <ul className="space-y-3">
              {[
                { href: '/about',   label: 'About Us'        },
                { href: '/contact', label: 'Contact Us'      },
                { href: '/orders',  label: 'Track Order'     },
                { href: '/terms',   label: 'Shipping Policy' },
              ].map(item => (
                <li key={item.href}>
                  <motion.div whileHover={linkHover} transition={SPRING_BTN}>
                    <Link href={item.href} className="hover:text-white transition-colors text-sm">{item.label}</Link>
                  </motion.div>
                </li>
              ))}
              <li className="pt-2">
                <motion.div whileHover={linkHover} transition={SPRING_BTN}>
                  <Link href="/contact" aria-label="Contact Us" className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors">
                    <Mail size={16} /> support@hemasaree.com
                  </Link>
                </motion.div>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-6 py-6 border-t border-brand-900/50 mb-6">
          <span className="text-[10px] text-brand-100/40 uppercase tracking-wider font-medium">We Accept</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-brand-100/50">
              <Smartphone size={16} /> <span className="text-xs font-medium">UPI</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-100/50">
              <CreditCard size={16} /> <span className="text-xs font-medium">Cards</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-100/50">
              <Banknote size={16} /> <span className="text-xs font-medium">COD</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-brand-900/50">
          <p className="text-xs text-brand-100/40">
            &copy; {new Date().getFullYear()} {siteTitle}. {settings?.footerText || 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-[10px] text-brand-100/40 hover:text-brand-50 transition-colors uppercase tracking-wider font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="text-[10px] text-brand-100/40 hover:text-brand-50 transition-colors uppercase tracking-wider font-semibold">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
