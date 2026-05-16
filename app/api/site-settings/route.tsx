import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

// GET /api/site-settings — Fetch Sanity siteSettings
export async function GET() {
  try {
    if (!client) {
      return NextResponse.json({ error: 'Sanity not configured' }, { status: 503 });
    }

    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{
        title,
        description,
        "logoUrl": logo.asset->url,
        heroBanner {
          title,
          subtitle,
          "imageUrl": image.asset->url
        },
        footerText
      }`
    );

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('[SITE_SETTINGS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
  }
}
