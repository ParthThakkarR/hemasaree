import { prisma } from '@lib/prisma';
import ProductsClient from './products-client';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = typeof searchParams.category === 'string' ? searchParams.category : null;
  const search = typeof searchParams.search === 'string' ? searchParams.search : null;

  const title = category
    ? `${category} Sarees — Buy ${category} Sarees Online | Hema Sarees`
    : search
    ? `Search: ${search} | Hema Sarees`
    : 'Shop All Sarees — Silk, Bridal, Festive & More | Hema Sarees';

  const description = category
    ? `Explore our curated collection of premium ${category} sarees. Authentic craftsmanship at Hema Sarees.`
    : 'Browse our complete collection of handpicked Indian sarees. Filter by category, color, fabric, and occasion.';

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

  // CollectionPage structured data for this listing
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category ? `${category} Sarees` : 'All Sarees',
    description: category
      ? `Browse premium ${category} sarees at Hema Sarees.`
      : 'Browse our complete collection of handpicked Indian sarees.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app'}/products${category ? `?category=${encodeURIComponent(category)}` : ''}`,
    numberOfItems: total,
    provider: { '@type': 'Organization', name: 'Hema Sarees' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <ProductsClient
        initialProducts={serializedProducts}
        initialCategories={serializedCategories}
        initialTotal={total}
      />
    </>
  );
}
