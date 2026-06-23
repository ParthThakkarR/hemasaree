import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import { getBlogPostBySlug, BLOG_POSTS } from '@lib/blog-seo-clusters';
import type { Metadata } from 'next';

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  
  if (!post) {
    return { title: 'Post Not Found | Hema Sarees' };
  }

  const title = `${post.title} | Hema Sarees Blog`;
  
  return {
    title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description: post.excerpt,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: ['Hema Sarees'],
      images: [post.coverImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

// Generate static params for all known blog slugs
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: [post.coverImage],
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: [{
      '@type': 'Organization',
      name: 'Hema Sarees',
      url: baseUrl,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Hema Sarees',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    description: post.excerpt,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Image */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-brand-900 overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        
        {/* Article Header Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-surface-subtle mb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-ink-muted mb-6 uppercase tracking-wider font-semibold" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-brand-800 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Blog
            </Link>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-800 text-[10px] font-bold uppercase tracking-wider mb-6">
            {post.category}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-ink mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-ink-muted border-t border-surface-subtle pt-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-800">
                <User size={14} />
              </div>
              <div>
                <p className="font-semibold text-ink text-xs">{post.author.name}</p>
                <p className="text-[10px] uppercase tracking-wider">{post.author.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <Calendar size={14} className="text-brand-800" /> {post.date}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <Clock size={14} className="text-brand-800" /> {post.readTime}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg md:prose-xl prose-stone max-w-none">
          {/* Inject static HTML content. In a real CMS, use PortableText */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-brand-50 rounded-3xl p-8 md:p-10 text-center border border-brand-100">
          <h3 className="text-2xl font-serif font-bold text-ink mb-4">Ready to find your perfect saree?</h3>
          <p className="text-ink-muted mb-8 max-w-lg mx-auto">Explore our curated collections of authentic handloom and designer sarees, crafted for your special moments.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products?category=Bridal" className="bg-brand-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-900 transition-colors shadow-sm">
              Shop Bridal
            </Link>
            <Link href="/products" className="bg-white text-brand-800 border border-brand-200 px-8 py-3.5 rounded-xl font-bold hover:bg-brand-50 transition-colors">
              Explore All Sarees
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
