import { prisma } from '@lib/prisma';
import ProductsClient from './products-client';
import { ChevronRight } from 'lucide-react';
import { getCategoryContent } from '@lib/category-content';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

import type { Metadata } from 'next';

/** Parse comma-separated category param into an array */
function parseCategoryParam(param: string | string[] | undefined): string[] {
  if (!param) return [];
  const raw = typeof param === 'string' ? param : param[0];
  return raw.split(',').map(c => c.trim()).filter(Boolean);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const categories = parseCategoryParam(searchParams.category);
  const search = typeof searchParams.search === 'string' ? searchParams.search : null;
  const fabric = typeof searchParams.fabric === 'string' ? searchParams.fabric : null;
  const occasion = typeof searchParams.occasion === 'string' ? searchParams.occasion : null;

  const title = categories.length === 1
    ? `${categories[0]} Sarees — Buy ${categories[0]} Sarees Online | Hema Sarees`
    : categories.length > 1
    ? `${categories.join(' & ')} Sarees — Shop Online | Hema Sarees`
    : search
    ? `Search: ${search} | Hema Sarees`
    : fabric
    ? `${fabric} Sarees — Shop ${fabric} Fabric Sarees | Hema Sarees`
    : occasion
    ? `Sarees for ${occasion} — ${occasion} Sarees Online | Hema Sarees`
    : 'Shop All Sarees — Silk, Bridal, Festive & More | Hema Sarees';

  const description = categories.length === 1
    ? `Explore our curated collection of premium ${categories[0]} sarees. Authentic craftsmanship and pan-India delivery at Hema Sarees.`
    : categories.length > 1
    ? `Shop ${categories.join(', ')} sarees online. Premium quality, handpicked designs at Hema Sarees.`
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
  const categories = parseCategoryParam(searchParams.category);
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const color = typeof searchParams.color === 'string' ? searchParams.color : undefined;
  const fabric = typeof searchParams.fabric === 'string' ? searchParams.fabric : undefined;
  const occasion = typeof searchParams.occasion === 'string' ? searchParams.occasion : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined;
  const sortPrice = typeof searchParams.sortPrice === 'string' ? searchParams.sortPrice : undefined;

  // Build Prisma where clause — supports multi-category
  const where: any = { isDeleted: false };

  if (categories.length === 1) {
    const cat = categories[0];
    const isValidObjectId = /^[a-f\d]{24}$/i.test(cat);
    if (isValidObjectId) {
      where.categoryId = cat;
    } else {
      where.category = { name: { equals: cat, mode: 'insensitive' } };
    }
  } else if (categories.length > 1) {
    const objectIds: string[] = [];
    const names: string[] = [];
    for (const cat of categories) {
      if (/^[a-f\d]{24}$/i.test(cat)) {
        objectIds.push(cat);
      } else {
        names.push(cat);
      }
    }
    const categoryConditions: any[] = [];
    if (objectIds.length > 0) categoryConditions.push({ categoryId: { in: objectIds } });
    if (names.length > 0) categoryConditions.push({ category: { name: { in: names, mode: 'insensitive' } } });
    if (categoryConditions.length === 1) {
      Object.assign(where, categoryConditions[0]);
    } else if (categoryConditions.length > 1) {
      where.OR = categoryConditions;
    }
  }

  if (search) {
    const searchConditions = [
      { name: { contains: search, mode: 'insensitive' } },
      { color: { contains: search, mode: 'insensitive' } },
      { occasion: { contains: search, mode: 'insensitive' } },
    ];
    if (where.OR) {
      const existingOr = where.OR;
      delete where.OR;
      where.AND = [{ OR: existingOr }, { OR: searchConditions }];
    } else {
      where.OR = searchConditions;
    }
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
  // Fetch settings for multiCategoryBannerImage in parallel
  const SettingsService = require('@/lib/services/settingsService').SettingsService;
  
  const [products, allCategories, total, settings] = await Promise.all([
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
    SettingsService.getSettings(),
  ]);

  // Serialize dates for client component hydration
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(allCategories));
  const multiCategoryBannerImage = settings?.multiCategoryBannerImage || null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';
  const pageTitle = categories.length === 1
    ? `${categories[0]} Sarees`
    : categories.length > 1
    ? `${categories.join(' & ')} Sarees`
    : 'All Sarees';

  // CollectionPage + ItemList structured data
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: categories.length > 0
      ? `Browse premium ${categories.join(', ')} sarees at Hema Sarees.`
      : 'Browse our complete collection of handpicked Indian sarees.',
    url: `${baseUrl}/products${categories.length > 0 ? `?category=${encodeURIComponent(categories.join(','))}` : ''}`,
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
      ...(categories.length === 1
        ? [{ '@type': 'ListItem', position: 3, name: `${categories[0]} Sarees` }]
        : []),
    ],
  };

  // Category-specific SEO content (only for single category)
  const categoryContent = categories.length === 1 ? getCategoryContent(categories[0]) : null;

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

      <div className="bg-surface min-h-screen pt-6 lg:pt-8">

      {/* Category SEO Content (only for single category) */}
      {categoryContent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-surface-muted rounded-2xl p-6 lg:p-8 border border-surface-subtle">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-4">
              {categories[0]} Sarees Collection
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
                  <h3 className="font-semibold text-ink mb-2">How to Choose {categories[0]} Sarees</h3>
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
        multiCategoryBannerImage={multiCategoryBannerImage}
      />

      {/* Category FAQ Section */}
      {categoryContent && categoryContent.faqs.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-ink mb-6 text-center">
            {categories[0]} Sarees — Frequently Asked Questions
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
      </div>
    </>
  );
}
