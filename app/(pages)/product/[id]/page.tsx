import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '@/app/lib/prisma';
import ProductDetailClient from '@/app/(pages)/product/[id]/ProductDetailClient';
import { notFound } from 'next/navigation';

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
    title: product.name,
    description: `Buy ${product.name} in ${product.color} color for ${product.ocassion}. Price: ₹${product.price}. High-quality Indian saree.`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Hemasaree',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXTAUTH_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient initialProduct={product} initialRelated={related} />
    </>
  );
}
