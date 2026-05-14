import React, { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import Image from 'next/image';

interface ProductAccordionProps {
  product: any;
}

export default function ProductAccordion({ product }: ProductAccordionProps) {
  const [openAccordion, setOpenAccordion] = useState<string>('details');
  const toggleAccordion = (section: string) => setOpenAccordion(prev => prev === section ? '' : section);

  return (
    <div className="space-y-4 pt-4 border-t border-brand-100">
       <div className="border-b border-brand-100 pb-4">
          <button onClick={() => toggleAccordion('details')} className="w-full flex items-center justify-between py-2"><span className="font-serif text-lg font-bold">Product Details</span><ChevronDown size={20} className={`transition-transform ${openAccordion === 'details' ? 'rotate-180' : ''}`} /></button>
          {openAccordion === 'details' && (
            <div className="mt-4 space-y-3 text-sm text-ink-muted animate-fade-in">
              <p>{product.description || "Elegant handloom saree perfect for special occasions. Each piece is meticulously crafted by skilled artisans."}</p>
              <ul className="space-y-2 pt-2">
                <li><strong className="text-ink font-medium">Color:</strong> {product.color}</li>
                <li><strong className="text-ink font-medium">Occasion:</strong> {product.ocassion}</li>
                <li><strong className="text-ink font-medium">Fabric:</strong> Pure Silk / Handloom (Placeholder)</li>
                <li><strong className="text-ink font-medium">Work Type:</strong> Zari Woven / Embroidery (Placeholder)</li>
                <li><strong className="text-ink font-medium">Blouse Piece:</strong> Included (Unstitched)</li>
                <li><strong className="text-ink font-medium">Wash Care:</strong> Dry Clean Only</li>
              </ul>
            </div>
          )}
       </div>

       <div className="border-b border-brand-100 pb-4">
          <button onClick={() => toggleAccordion('delivery')} className="w-full flex items-center justify-between py-2"><span className="font-serif text-lg font-bold">Delivery & Returns</span><ChevronDown size={20} className={`transition-transform ${openAccordion === 'delivery' ? 'rotate-180' : ''}`} /></button>
          {openAccordion === 'delivery' && (
            <div className="mt-4 space-y-3 text-sm text-ink-muted animate-fade-in">
              <p><strong className="text-ink font-medium">Dispatch Time:</strong> Ships within 24-48 hours.</p>
              <p><strong className="text-ink font-medium">Delivery:</strong> 3-7 business days within India.</p>
              <p><strong className="text-ink font-medium">Returns:</strong> 7-day easy return policy. Item must be unworn and in original condition.</p>
            </div>
          )}
       </div>

       <div className="border-b border-brand-100 pb-4">
          <button onClick={() => toggleAccordion('reviews')} className="w-full flex items-center justify-between py-2"><span className="font-serif text-lg font-bold flex items-center gap-2">Customer Reviews <span className="text-sm font-normal text-ink-muted">(2)</span></span><ChevronDown size={20} className={`transition-transform ${openAccordion === 'reviews' ? 'rotate-180' : ''}`} /></button>
          {openAccordion === 'reviews' && (
            <div className="mt-6 space-y-6 animate-fade-in">
              <div className="border-b border-surface-subtle pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-ink">Anjali Sharma</p>
                    <p className="text-xs text-ink-faint">Verified Buyer • October 12, 2025</p>
                  </div>
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-sm text-ink-muted mb-3">Absolutely stunning saree! The fabric quality is much better than expected and the color perfectly matches the pictures. I wore it for my cousin&apos;s wedding and received so many compliments.</p>
                <div className="flex gap-2">
                  <div className="w-16 h-16 relative rounded-md overflow-hidden bg-brand-50 border border-brand-100">
                    <Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80" alt="Customer Photo" fill className="object-cover" />
                  </div>
                </div>
              </div>
              <div className="border-b border-surface-subtle pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-ink">Priya R.</p>
                    <p className="text-xs text-ink-faint">Verified Buyer • September 28, 2025</p>
                  </div>
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-brand-200"} />)}
                  </div>
                </div>
                <p className="text-sm text-ink-muted">Very fast delivery and the packaging was premium. The unstitched blouse piece is of good length. Only giving 4 stars because the polish smell was a bit strong initially, but it went away after a day.</p>
              </div>
            </div>
          )}
       </div>
    </div>
  );
}
