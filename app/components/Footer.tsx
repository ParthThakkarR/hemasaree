'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, MapPin, Mail, ArrowRight, MessageCircle, Loader2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
      if (status !== 'loading') {
        setStatus('idle');
        setMessage('');
      }
    }, 5000);
  };

  return (
    <footer className="bg-[#1A0A12] text-brand-100/80 pt-16 pb-24 lg:pb-8 relative mt-12">
      {/* Top Gold SVG Border Pattern */}
      <div className="absolute top-0 left-0 w-full h-4 overflow-hidden leading-none transform -translate-y-full flex opacity-60">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-4 text-accent fill-current">
            <path d="M0 40V0c30 0 30 40 60 40s30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40 30-40 60-40 30 40 60 40z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 pt-8">
          
          {/* Col 1: Brand & Newsletter */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-900 text-accent flex items-center justify-center font-serif text-xl font-bold border border-brand-800">
                H
              </div>
              <span className="font-serif text-2xl font-bold text-brand-50 tracking-wide">Hema Sarees</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Honoring tradition through every weave. Elevating Indian fashion for the modern woman with handpicked, exquisite sarees.
            </p>
            <div>
               <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-3 text-sm">Join Our Newsletter</h4>
               <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                  <div className="flex">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === 'loading'}
                      className="bg-brand-950/50 border border-brand-800 text-brand-50 px-4 py-2 rounded-l-md focus:outline-none focus:border-accent w-full text-sm disabled:opacity-50" 
                    />
                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="bg-accent text-[#1A0A12] px-4 rounded-r-md font-semibold hover:bg-[#dfc67a] transition-colors flex items-center justify-center disabled:opacity-50 min-w-[44px]"
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
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm hover:text-accent transition-colors">All Sarees</Link></li>
              <li><Link href="/products?category=Bridal" className="text-sm hover:text-accent transition-colors">Bridal Collection</Link></li>
              <li><Link href="/products?category=Festive" className="text-sm hover:text-accent transition-colors">Festive Wear</Link></li>
              <li><Link href="/products?sortPrice=newest" className="text-sm hover:text-accent transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Col 3: Help & Info */}
          <div>
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5">Help & Info</h4>
            <ul className="space-y-3">
              <li><Link href="/orders" className="text-sm hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-accent transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h4 className="font-semibold text-brand-50 uppercase tracking-wider mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm">123 Heritage Lane, Silk District<br/>Surat, Gujarat 395002, India</span>
              </li>
              <li className="flex gap-3 pt-2">
                 <a href="#" className="w-10 h-10 rounded-full bg-brand-900 border border-brand-800 flex items-center justify-center text-accent hover:bg-accent hover:text-[#1A0A12] transition-colors shadow-sm">
                   <Instagram size={18} />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-full bg-brand-900 border border-brand-800 flex items-center justify-center text-accent hover:bg-accent hover:text-[#1A0A12] transition-colors shadow-sm">
                   <MessageCircle size={18} />
                 </a>
                 <a href="mailto:hello@hemasarees.com" className="w-10 h-10 rounded-full bg-brand-900 border border-brand-800 flex items-center justify-center text-accent hover:bg-accent hover:text-[#1A0A12] transition-colors shadow-sm">
                   <Mail size={18} />
                 </a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-brand-900 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-brand-100/50">
            &copy; {new Date().getFullYear()} Hema Sarees. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-xs text-brand-100/50 hover:text-brand-50 transition-colors uppercase tracking-wider font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-brand-100/50 hover:text-brand-50 transition-colors uppercase tracking-wider font-semibold">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
