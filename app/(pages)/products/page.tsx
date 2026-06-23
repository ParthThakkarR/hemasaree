import { prisma } from '@lib/prisma';
import ProductsClient from './products-client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCategoryContent } from '@lib/category-content';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = typeof searchParams.category === 'string' ? searchParams.category : null;
  const search = typeof searchParams.search === 'string' ? searchParams.search : null;
  const fabric = typeof searchParams.fabric === 'string' ? searchParams.fabric : null;
  const occasion = typeof searchParams.occasion === 'string' ? searchParams.occasion : null;

  const title = category
    ? `${category} Sarees — Buy ${category} Sarees Online | Hema Sarees`
    : search
    ? `Search: ${search} | Hema Sarees`
    : fabric
    ? `${fabric} Sarees — Shop ${fabric} Fabric Sarees | Hema Sarees`
    : occasion
    ? `Sarees for ${occasion} — ${occasion} Sarees Online | Hema Sarees`
    : 'Shop All Sarees — Silk, Bridal, Festive & More | Hema Sarees';

  const description = category
    ? `Explore our curated collection of premium ${category} sarees. Authentic craftsmanship and pan-India delivery at Hema Sarees.`
    : fabric
    ? `Shop beautiful ${fabric} sarees online. Premium quality, handpicked designs at Hema Sarees.`
    : occasion
    ? `Find the perfect saree for ${occasion} occasions. Curated collection at Hema Sarees.`
    : 'Browse our complete collection of handpicked Indian sarees. Filter by category, color, fabric, and occasion. Premium quality with pan-India delivery.';

  return {
    title,
    description,
    alternates: {
      canonical: '/products',
    },
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const color = typeof searchParams.color === 'string' ? searchParams.color : undefined;
  const fabric = typeof searchParams.fabric === 'string' ? searchParams.fabric : undefined;
  const occasion = typeof searchParams.occasion === 'string' ? searchParams.occasion : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined;
  const sortPrice = typeof searchParams.sortPrice === 'string' ? searchParams.sortPrice : undefined;

  // Build Prisma where clause matching the API's filter logic
  const where: any = { isDeleted: false };

  if (category) {
    const isValidObjectId = /^[a-f\d]{24}$/i.test(category);
    if (isValidObjectId) {
      where.categoryId = category;
    } else {
      where.category = { name: { equals: category, mode: 'insensitive' } };
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { color: { contains: search, mode: 'insensitive' } },
      { occasion: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (color) {
    where.color = { contains: color, mode: 'insensitive' };
  }

  if (fabric) {
    where.fabric = { contains: fabric, mode: 'insensitive' };
  }

  if (occasion) {
    where.occasion = { contains: occasion, mode: 'insensitive' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' as const };
  if (sortPrice === 'low') orderBy = { price: 'asc' as const };
  else if (sortPrice === 'high') orderBy = { price: 'desc' as const };
  else if (sortPrice === 'newest') orderBy = { createdAt: 'desc' as const };

  // Server-side data fetch — products appear in HTML for SEO crawlers
  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      take: 12,
      orderBy,
    }),
    prisma.category.findMany({
      select: { id: true, name: true, image: true },
    }),
    prisma.product.count({ where }),
  ]);

  // Serialize dates for client component hydration
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';
  const pageTitle = category ? `${category} Sarees` : 'All Sarees';

  // CollectionPage + ItemList structured data
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: category
      ? `Browse premium ${category} sarees at Hema Sarees.`
      : 'Browse our complete collection of handpicked Indian sarees.',
    url: `${baseUrl}/products${category ? `?category=${encodeURIComponent(category)}` : ''}`,
    numberOfItems: total,
    provider: { '@type': 'Organization', name: 'Hema Sarees' },
    ...(products.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((p: any, i: number) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${baseUrl}/product/${p.id}`,
          name: p.name,
          image: p.images?.[0]?.startsWith('http') ? p.images[0] : `${baseUrl}${p.images?.[0] || ''}`,
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
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${baseUrl}/products` },
      ...(category
        ? [{ '@type': 'ListItem', position: 3, name: `${category} Sarees` }]
        : []),
    ],
  };

  // Category-specific SEO content
  const categoryContent = category ? getCategoryContent(category) : null;

  // Category FAQ schema
  const categoryFaqSchema = categoryContent && categoryContent.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categoryContent.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {categoryFaqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryFaqSchema) }}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-2">
        <nav className="flex items-center gap-1 text-sm text-ink-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-800 transition-colors">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          {category ? (
            <>
              <Link href="/products" className="hover:text-brand-800 transition-colors">Products</Link>
              <ChevronRight size={14} aria-hidden="true" />
              <span className="text-ink font-medium">{category} Sarees</span>
            </>
          ) : (
            <span className="text-ink font-medium">All Sarees</span>
          )}
        </nav>
      </div>

      {/* Category SEO Content */}
      {categoryContent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-surface-muted rounded-2xl p-6 lg:p-8 border border-surface-subtle">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-4">
              {category} Sarees Collection
            </h1>
            <p className="text-sm text-ink-muted leading-relaxed mb-4">
              {categoryContent.intro}
            </p>
            <details className="group">
              <summary className="text-sm font-semibold text-brand-800 cursor-pointer hover:underline">
                Buying Guide & Styling Tips
              </summary>
              <div className="mt-4 space-y-4 text-sm text-ink-muted leading-relaxed">
                <div>
                  <h3 className="font-semibold text-ink mb-2">How to Choose {category} Sarees</h3>
                  <p>{categoryContent.buyingGuide}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-ink mb-2">Styling Tips</h3>
                  <p>{categoryContent.stylingTips}</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}

      <ProductsClient
        initialProducts={serializedProducts}
        initialCategories={serializedCategories}
        initialTotal={total}
      />

      {/* Category FAQ Section */}
      {categoryContent && categoryContent.faqs.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-ink mb-6 text-center">
            {category} Sarees — Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {categoryContent.faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-surface-subtle overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-left">
                  <span className="font-serif text-sm font-semibold text-ink pr-4">{faq.question}</span>
                  <ChevronRight size={16} className="text-ink-faint flex-shrink-0 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-sm text-ink-muted leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
