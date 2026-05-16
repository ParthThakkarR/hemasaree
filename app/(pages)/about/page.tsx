import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';

async function getAboutPage() {
  if (!client) return null;

  const query = `*[_type == "page" && slug.current == "about"][0]`;

  try {
    const page = await client.fetch(query);
    return page;
  } catch (error) {
    console.error('[ABOUT_PAGE_SANITY_FETCH_ERROR]', error);
    return null;
  }
}

export default async function AboutPage() {
  const page = await getAboutPage();

  if (!page) {
    // Fallback to hardcoded content if Sanity doesn't have the page yet
    return (
      <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink mb-6 leading-tight">
                Honoring Heritage,<br />Weaving the Future.
             </h1>
             <p className="text-lg text-ink-muted leading-relaxed">
                At Hema Sarees, we believe a saree is more than just six yards of fabric. It is a canvas of our rich cultural history.
             </p>
          </div>
          {/* ... existing static content ... */}
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

  return (
    <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink mb-6">
            {page.title}
          </h1>
        </div>
        <div className="prose prose-lg max-w-none text-ink-muted">
          <PortableText value={page.content} />
        </div>
        <div className="mt-12 text-center">
           <Link href="/products" className="inline-flex items-center justify-center px-10 py-4 bg-[#6B0F1A] text-white font-bold rounded-xl hover:bg-[#5a0c16] transition-colors shadow-lg text-lg">
              Explore Our Collection
           </Link>
        </div>
      </div>
    </div>
  );
}

