import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamically add product/category URLs only when the database is available.
  // During CI or builds without DATABASE_URL this gracefully falls back to
  // the static entries above instead of crashing the entire build.
  if (!process.env.DATABASE_URL) {
    return staticEntries;
  }

  try {
    const { prisma } = await import('@lib/prisma');

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

    return [...staticEntries, ...productEntries, ...categoryEntries];
  } catch (error) {
    console.warn('[sitemap] Database unavailable, returning static entries only:', error);
    return staticEntries;
  }
}


