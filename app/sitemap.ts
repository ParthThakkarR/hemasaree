import { MetadataRoute } from 'next';
import { prisma } from '@app/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  });

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categories = await prisma.category.findMany({
    select: { name: true, updatedAt: true },
  });

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/collections/${category.name.toLowerCase()}`,
    lastModified: category.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productEntries,
    ...categoryEntries,
  ];
}

