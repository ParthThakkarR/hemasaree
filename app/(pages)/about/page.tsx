'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink mb-6 leading-tight">
              Honoring Heritage,<br />Weaving the Future.
           </h1>
           <p className="text-lg text-ink-muted leading-relaxed">
              At Hema Sarees, we believe a saree is more than just six yards of fabric. It is a canvas of our rich cultural history, a testament to the skill of our master artisans, and a legacy passed down through generations.
           </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[21/9] md:aspect-[21/7] rounded-3xl overflow-hidden mb-24 bg-brand-50">
           <Image
             src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=2000"
             alt="Hema Sarees Artisans"
             fill
             className="object-cover"
             priority
           />
        </div>

        {/* Our Story & Craft */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
           <div className="order-2 lg:order-1 relative aspect-[4/5] rounded-3xl overflow-hidden bg-brand-50">
              <Image
                src="https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=1200"
                alt="Weaving Process"
                fill
                className="object-cover"
              />
           </div>
           <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-sm font-bold text-brand-800 uppercase tracking-widest">Our Story</h2>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-ink leading-tight">
                 A Journey of Passion and Craftsmanship.
              </h3>
              <p className="text-ink-muted leading-relaxed text-lg">
                 Founded with a profound love for Indian textiles, Hema Sarees began as a small boutique dedicated to sourcing the finest handloom sarees. Over the years, we have grown into a premier destination for authentic ethnic fashion, while staying true to our roots.
              </p>
              <p className="text-ink-muted leading-relaxed text-lg">
                 We work directly with weaving clusters across India, ensuring that every piece we offer is a true representation of regional artistry. By eliminating middlemen, we guarantee fair wages for our artisans and exceptional value for our patrons.
              </p>
           </div>
        </div>

        {/* Mission & Values */}
        <div className="bg-brand-50 rounded-3xl p-10 md:p-16 text-center mb-24 border border-brand-100">
           <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 leading-tight">
                 Our Commitment to Quality
              </h2>
              <p className="text-brand-800/80 leading-relaxed text-lg font-medium">
                 We are committed to preserving the intricate techniques of traditional Indian weaving while embracing modern sensibilities. From the selection of the purest silks and cottons to the final polish, our meticulous quality control ensures that every Hema Saree is an heirloom in the making.
              </p>
           </div>
        </div>

        {/* Call to Action */}
        <div className="text-center max-w-2xl mx-auto">
           <h2 className="text-2xl font-serif font-bold text-ink mb-6">
              Experience the Elegance
           </h2>
           <Link href="/products" className="inline-flex items-center justify-center px-10 py-4 bg-[#6B0F1A] text-white font-bold rounded-xl hover:bg-[#5a0c16] transition-colors shadow-lg text-lg">
              Explore Our Collection
           </Link>
        </div>

      </div>
    </div>
  );
}
