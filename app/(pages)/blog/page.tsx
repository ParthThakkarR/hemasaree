import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, Clock } from 'lucide-react';
import { BLOG_POSTS } from '@lib/blog-seo-clusters';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saree Blog & Style Guides | Hema Sarees',
  description: 'Expert guides on choosing, styling, and caring for authentic Indian sarees. Discover the latest trends, silk buying guides, and bridal saree tips.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Saree Blog & Style Guides | Hema Sarees',
    description: 'Expert guides on choosing, styling, and caring for authentic Indian sarees.',
  },
};

export default function BlogListingPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  // CollectionPage + Blog schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Hema Sarees Blog',
    description: 'Expert guides on Indian sarees, styling tips, and fabric care.',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Hema Sarees',
    },
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: new Date(post.date).toISOString(),
      url: `${baseUrl}/blog/${post.slug}`,
      image: post.coverImage,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
    ],
  };

  return (
    <div className="bg-surface min-h-screen pt-28 lg:pt-36 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-sm text-ink-muted mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-800 transition-colors">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="text-ink font-medium">Saree Guides & Blog</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
            The Saree Guide
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed">
            Expert advice on choosing, styling, and caring for your precious sarees. Explore our comprehensive guides to Indian handlooms and modern trends.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-surface-subtle shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-surface-muted block">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-ink text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {post.category}
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-ink-faint font-medium mb-3 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {post.readTime}</span>
                </div>
                <Link href={`/blog/${post.slug}`} className="block flex-grow">
                  <h2 className="text-xl font-serif font-bold text-ink mb-3 line-clamp-2 group-hover:text-brand-800 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-ink-muted line-clamp-3 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </Link>
                <div className="mt-auto pt-4 border-t border-surface-subtle">
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-brand-800 font-bold text-sm hover:text-brand-900 transition-colors">
                    Read Article <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
