import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '@lib/prisma';
import ProductDetailClient from '@/app/(pages)/product/[id]/product-detail-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) return { title: 'Product Not Found' };

  const previousImages = (await parent).openGraph?.images || [];

  return {
    alternates: {
      canonical: `/product/${product.id}`,
    },
    title: product.name,
    description: `Buy ${product.name} in ${product.color} color for ${product.occasion}. Price: ₹${product.price}. High-quality Indian saree.`,
    openGraph: {
      title: product.name,
      description: product.category.description || `Elegant ${product.name} saree.`,
      images: [product.images[0], ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.category.description || `Elegant ${product.name} saree.`,
      images: [product.images[0]],
    },
  };
}

export default async function Page({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) notFound();

  // Fetch related products
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
  });

  // Fetch reviews for AggregateRating
  const approvedReviews = await prisma.review.findMany({
    where: { productId: product.id, isApproved: true },
  });

  const ratingCount = approvedReviews.length;
  const ratingValue = ratingCount > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1) 
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description || `Buy ${product.name} in ${product.color} color for ${product.occasion}.`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Hemasaree',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXTAUTH_URL || 'https://hemasaree.vercel.app'}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue,
        reviewCount: ratingCount,
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://hemasaree.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://hemasaree.vercel.app/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category.name,
        item: `https://hemasaree.vercel.app/products?category=${product.categoryId}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-4">
        <nav className="flex items-center gap-1 text-sm text-ink-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-800 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-brand-800 transition-colors">Products</Link>
          <ChevronRight size={14} />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-brand-800 transition-colors">{product.category.name}</Link>
          <ChevronRight size={14} />
          <span className="text-ink font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>
      <ProductDetailClient initialProduct={product} initialRelated={related} />
    </>
  );
}
