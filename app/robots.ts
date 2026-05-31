import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/studio/', '/profile/', '/cart/', '/orders/', '/wishlist/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
