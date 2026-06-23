import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { prisma } from '@lib/prisma';
import type { Metadata } from 'next';

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
};

// Collection metadata — used for hero section display and SEO
const collectionData: Record<string, { title: string; subtitle: string; description: string; heroImage: string; categoryFilter: string; seoTitle: string; seoDescription: string }> = {
  'wedding-edit': {
    title: 'The Wedding Edit',
    subtitle: 'Bridal Elegance Redefined',
    description: 'Curated for the modern bride, this collection features exquisite pure silks, intricate zari work, and rich jewel tones designed to make your special day truly unforgettable.',
    heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=2000',
    categoryFilter: 'Bridal',
    seoTitle: 'Wedding Sarees Collection — Bridal Sarees for Every Ceremony | Hema Sarees',
    seoDescription: 'Discover our curated wedding saree collection. Exquisite pure silks, intricate zari work, and rich jewel tones for your special day. Shop bridal sarees at Hema Sarees.',
  },
  'festive-glamour': {
    title: 'Festive Glamour',
    subtitle: 'Celebrate in Style',
    description: 'Embrace the joy of the season with our Festive Glamour collection. Discover vibrant hues, playful motifs, and comfortable fabrics perfect for all your celebrations.',
    heroImage: 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=2000',
    categoryFilter: 'Festive',
    seoTitle: 'Festive Sarees — Sarees for Diwali, Navratri & More | Hema Sarees',
    seoDescription: 'Celebrate every festival in style. Shop vibrant festive sarees with playful motifs and comfortable fabrics. Diwali, Navratri, Pongal sarees at Hema Sarees.',
  },
  'heritage-silks': {
    title: 'Heritage Silks',
    subtitle: 'Timeless Traditions',
    description: 'A tribute to the master weavers of India. Explore our handpicked selection of authentic Kanjeevaram, Banarasi, and Chanderi silks that never go out of style.',
    heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=2000',
    categoryFilter: 'Silk',
    seoTitle: 'Heritage Silk Sarees — Kanjivaram, Banarasi & Chanderi | Hema Sarees',
    seoDescription: 'Explore authentic handwoven silk sarees — Kanjivaram, Banarasi, and Chanderi. Timeless elegance from India\'s master weavers. Shop Heritage Silks at Hema Sarees.',
  },
};

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug;
  const collection = collectionData[slug];

  const title = collection?.seoTitle || `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Hema Sarees`;
  const description = collection?.seoDescription || collection?.description || 'Explore our specially curated collection of beautiful sarees.';

  return {
    title,
    description,
    alternates: {
      canonical: `/collections/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: collection?.heroImage ? [collection.heroImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function getImageSrc(img?: string) {
  if (!img) return '/uploads/placeholder.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.replace(/^\/+/, '/');
}

export default async function CollectionPage({ params }: PageProps) {
  const slug = params.slug;

  // Resolve collection data
  const collection = collectionData[slug] || {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    subtitle: 'Curated Selection',
    description: 'Explore our specially curated collection of beautiful sarees designed to elevate your wardrobe.',
    heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=2000',
    categoryFilter: '',
    seoTitle: '',
    seoDescription: '',
  };

  // Server-side product fetch — now visible to crawlers
  let products: Product[] = [];
  try {
    const where: any = { isDeleted: false };
    if (collection.categoryFilter) {
      where.category = { name: { equals: collection.categoryFilter, mode: 'insensitive' } };
    }

    const dbProducts = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        stock: true,
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    products = dbProducts;
  } catch (error) {
    console.error('[COLLECTION_FETCH_ERROR]', error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  // CollectionPage + ItemList structured data
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: `${baseUrl}/collections/${slug}`,
    numberOfItems: products.length,
    provider: { '@type': 'Organization', name: 'Hema Sarees' },
    ...(products.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${baseUrl}/product/${p.id}`,
          name: p.name,
        })),
      },
    }),
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: `${baseUrl}/collections` },
      { '@type': 'ListItem', position: 3, name: collection.title },
    ],
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Editorial Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-brand-900 overflow-hidden flex items-center justify-center pt-20">
        <Image
          src={collection.heroImage}
          alt={`${collection.title} — ${collection.subtitle} at Hema Sarees`}
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="relative z-10 text-center max-w-4xl px-4 mt-12">
          <span className="text-brand-50 text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-4 block">
            {collection.subtitle}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-none">
            {collection.title}
          </h1>
          <p className="text-lg md:text-xl text-brand-50/90 max-w-2xl mx-auto leading-relaxed font-medium">
            {collection.description}
          </p>
        </div>
        {/* Decorative fade at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-sm text-ink-muted mb-12" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-800 transition-colors">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/products" className="hover:text-brand-800 transition-colors">Collections</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="text-ink font-medium">{collection.title}</span>
        </nav>

        {/* Curated Grid Header */}
        <div className="flex items-end justify-between mb-12 border-b border-brand-100 pb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-ink">The Curated Edit</h2>
            <p className="text-ink-muted mt-2">Handpicked pieces for this collection</p>
          </div>
          <Link href={`/products${collection.categoryFilter ? `?category=${collection.categoryFilter}` : ''}`} className="hidden md:flex items-center gap-2 text-brand-800 font-bold uppercase tracking-wider text-sm hover:text-brand-900 transition-colors group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Curated Grid (6 Items) — server-rendered */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-50 mb-5">
                  <Image
                    src={getImageSrc(product.images?.[0])}
                    alt={`${product.name} — ${collection.categoryFilter || 'Premium'} saree from Hema Sarees`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {product.stock === 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-ink text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                      Sold Out
                    </div>
                  )}
                </Link>
                <div className="text-center">
                  <Link href={`/product/${product.id}`} className="block text-xl font-serif font-bold text-ink hover:text-brand-800 transition-colors line-clamp-1 mb-2">
                    {product.name}
                  </Link>
                  <p className="text-brand-800 font-semibold text-lg">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-brand-50 rounded-3xl border border-brand-100">
            <h3 className="text-2xl font-serif font-bold text-ink mb-4">No pieces available yet</h3>
            <p className="text-ink-muted">We are currently curating pieces for this collection. Please check back later.</p>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-12 text-center md:hidden">
          <Link href={`/products${collection.categoryFilter ? `?category=${collection.categoryFilter}` : ''}`} className="inline-flex items-center justify-center px-8 py-4 bg-surface-muted text-ink font-bold rounded-xl hover:bg-surface-subtle transition-colors w-full uppercase tracking-wider text-sm">
            View Full Collection
          </Link>
        </div>

      </div>
    </div>
  );
}
