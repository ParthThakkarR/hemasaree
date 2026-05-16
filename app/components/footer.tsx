'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, MapPin, Mail, ArrowRight, MessageCircle, Loader2, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useSiteSettings } from '@contexts/site-settings-context';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname();
  
  const { settings } = useSiteSettings();
  const siteTitle = settings?.title || 'Hema Sarees';
  const siteDescription = settings?.description || 'Honoring tradition through every weave. Elevating Indian fashion for the modern woman with handpicked, exquisite sarees.';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (pathname?.startsWith('/studio') || pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe');
    }

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <footer className="bg-brand-950 text-brand-100/80 pt-16 pb-24 lg:pb-8 relative">
      {/* Luxury gold border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 pt-4">
          
          {/* Col 1: Brand & Newsletter */}
          <div className="space-y-5">
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
            <p className="text-sm leading-relaxed max-w-xs text-brand-100/60">
              {siteDescription}
            </p>
            <div>
               <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-3 text-xs">Join Our Newsletter</h4>
               <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                 <div className="flex">
                   <input 
                     type="email" 
                     placeholder="Your email address" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     disabled={status === 'loading'}
                     className="bg-brand-900/40 border border-brand-800/40 text-brand-50 px-4 py-2.5 rounded-l-lg focus:outline-none focus:border-accent/50 w-full text-sm disabled:opacity-50 placeholder:text-brand-100/30" 
                   />
                   <button
                     type="submit"
                     aria-label="Subscribe to newsletter"
                     disabled={status === 'loading'}
                     className="bg-accent text-brand-950 px-4 rounded-r-lg font-semibold hover:bg-accent-light transition-colors flex items-center justify-center disabled:opacity-50 min-w-[44px]"
                   >
                     {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                   </button>
                 </div>
                 {message && (
                   <p className={`text-xs ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                     {message}
                   </p>
                 )}
               </form>
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div>
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5 text-xs">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm hover:text-accent transition-colors">All Sarees</Link></li>
              <li><Link href="/products?category=Bridal" className="text-sm hover:text-accent transition-colors">Bridal Collection</Link></li>
              <li><Link href="/products?category=Festive" className="text-sm hover:text-accent transition-colors">Festive Wear</Link></li>
              <li><Link href="/products?category=Silk" className="text-sm hover:text-accent transition-colors">Silk Sarees</Link></li>
              <li><Link href="/products?sortPrice=newest" className="text-sm hover:text-accent transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Col 3: Help & Info */}
          <div>
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5 text-xs">Help & Info</h4>
            <ul className="space-y-3">
              <li><Link href="/orders" className="text-sm hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-accent transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/about" className="text-sm hover:text-accent transition-colors">About Us</Link></li>
              <li><a href="mailto:hello@hemasarees.com" className="text-sm hover:text-accent transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5 text-xs">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-brand-100/60">123 Heritage Lane, Silk District<br/>Surat, Gujarat 395002, India</span>
              </li>
              <li className="flex gap-2.5 pt-2">
                 <a href="#" className="w-9 h-9 rounded-full bg-brand-900/50 border border-brand-800/30 flex items-center justify-center text-brand-100/60 hover:bg-accent hover:text-brand-950 hover:border-accent transition-all">
                   <Instagram size={16} />
                 </a>
                 <a href="#" className="w-9 h-9 rounded-full bg-brand-900/50 border border-brand-800/30 flex items-center justify-center text-brand-100/60 hover:bg-accent hover:text-brand-950 hover:border-accent transition-all">
                   <MessageCircle size={16} />
                 </a>
                 <a href="mailto:hello@hemasarees.com" className="w-9 h-9 rounded-full bg-brand-900/50 border border-brand-800/30 flex items-center justify-center text-brand-100/60 hover:bg-accent hover:text-brand-950 hover:border-accent transition-all">
                   <Mail size={16} />
                 </a>
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
