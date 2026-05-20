import { client } from './client';
import { cache } from 'react';

export interface SiteSettings {
  title?: string;
  description?: string;
  logo?: any;
  heroBanner?: {
    title?: string;
    subtitle?: string;
    image?: any;
  };
  footerText?: string;
}

// GROQ Query to get the most recently updated siteSettings document
export const siteSettingsQuery = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]{
  title,
  description,
  logo,
  heroBanner {
    title,
    subtitle,
    image
  },
  footerText
}`;

async function fetchSiteSettings(): Promise<SiteSettings | null> {
  if (!client) {
    console.warn('Sanity client not configured. Using fallback settings.');
    return null;
  }

  try {
    const settings = await client.fetch(
      siteSettingsQuery,
      {}, // params
      {
        next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
      }
    );
    return settings || null;
  } catch (error) {
    console.error('[SANITY_FETCH_ERROR] Failed to fetch site settings:', error);
    return null;
  }
}

// Deduplicate calls within the same request (generateMetadata + RootLayout)
export const getSiteSettings = cache(fetchSiteSettings);
