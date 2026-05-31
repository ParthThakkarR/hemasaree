import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '@lib/prisma';
import ProductDetailClient from '@/app/(pages)/product/[id]/product-detail-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cache } from 'react';

type Props = {
  params: { id: string };
};

// ── Deduplicated Prisma query via React.cache() ──
// Next.js calls generateMetadata() and Page() in the same request.
// Without cache(), the same findUnique runs twice per request.
const getProduct = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
});

const getApprovedReviews = cache(async (productId: string) => {
  return prisma.review.findMany({
    where: { productId, isApproved: true },
  });
});

// ── Reusable FAQ Schema Generator ──
function generateProductFaqSchema(product: {
  name: string;
  price: number;
  fabric?: string | null;
  color: string;
  occasion: string;
  category: { name: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the price of ${product.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The price of ${product.name} is ₹${product.price.toLocaleString('en-IN')}.`,
        },
      },
      ...(product.fabric
        ? [
            {
              '@type': 'Question',
              name: `What fabric is ${product.name} made of?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${product.name} is crafted from premium ${product.fabric}.`,
              },
            },
          ]
        : []),
      {
        '@type': 'Question',
        name: `What occasion is ${product.name} suitable for?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${product.name} is perfect for ${product.occasion.toLowerCase()} occasions.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${product.name} available in other colors?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${product.name} is available in ${product.color}. Browse our ${product.category.name} collection for more color options.`,
        },
      },
    ],
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product || product.isDeleted) return { title: 'Product Not Found' };

  const previousImages = (await parent).openGraph?.images || [];

  // Keyword-rich title: "Product Name — ₹Price | Category Saree | Brand"
  const title = `${product.name} — ₹${product.price.toLocaleString('en-IN')} | ${product.category.name} Saree | Hema Sarees`;

  // Keyword-rich description with product attributes
  const descParts = [
    `Shop ${product.name}`,
    product.fabric ? `— premium ${product.fabric} ${product.category.name.toLowerCase()} saree` : `— ${product.category.name.toLowerCase()} saree`,
    `in ${product.color}.`,
    `Perfect for ${product.occasion.toLowerCase()}.`,
    `Price ₹${product.price.toLocaleString('en-IN')}.`,
  ];
  const description = descParts.join(' ');

  const ogDescription = product.description?.slice(0, 120)
    || `Premium ${product.category.name} saree in ${product.color}. ₹${product.price.toLocaleString('en-IN')}.`;

  return {
    alternates: {
      canonical: `/product/${product.id}`,
    },
    title,
    description,
    openGraph: {
      title: `${product.name} — ₹${product.price.toLocaleString('en-IN')}`,
      description: ogDescription,
      images: [product.images[0], ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ₹${product.price.toLocaleString('en-IN')}`,
      description: ogDescription,
      images: [product.images[0]],
    },
  };
}

export default async function Page({ params }: Props) {
  const product = await getProduct(params.id);

  if (!product || product.isDeleted) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  // Fetch related products
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isDeleted: false,
    },
    take: 4,
  });

  // Fetch reviews for AggregateRating (cached — shared with metadata if needed)
  const approvedReviews = await getApprovedReviews(product.id);

  const ratingCount = approvedReviews.length;
  const ratingValue = ratingCount > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1) 
    : undefined;

  // ── Enhanced Product Schema (Issue 7) ──
  const absoluteImages = product.images.map((img: string) => 
    img.startsWith('http') || img.startsWith('data:') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: absoluteImages,
    description: product.description || `${product.name} — premium ${product.fabric || ''} saree in ${product.color}, perfect for ${product.occasion.toLowerCase()}.`,
    sku: product.id,
    mpn: product.id,
    color: product.color,
    ...(product.fabric && { material: product.fabric }),
    category: `Clothing > Sarees > ${product.category.name}`,
    brand: {
      '@type': 'Brand',
      name: 'Hema Sarees',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Hema Sarees',
        url: baseUrl,
      },
    },
    ...(ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue,
        reviewCount: ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
      review: approvedReviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Verified Buyer' },
        datePublished: r.createdAt.toISOString(),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
        },
        reviewBody: r.text,
      })),
    }),
  };

  // ── Breadcrumb Schema — using env URL ──
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${baseUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category.name,
        item: `${baseUrl}/products?category=${encodeURIComponent(product.category.name)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
      },
    ],
  };

  // ── FAQ Schema (Issue 8) ──
  const faqJsonLd = generateProductFaqSchema(product);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-4">
        <nav className="flex items-center gap-1 text-sm text-ink-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-800 transition-colors">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/products" className="hover:text-brand-800 transition-colors">Products</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href={`/products?category=${encodeURIComponent(product.category.name)}`} className="hover:text-brand-800 transition-colors">{product.category.name}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="text-ink font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>
      <ProductDetailClient initialProduct={product} initialRelated={related} />
    </>
  );
}
