import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { rateLimiter } from '@/app/lib/rate-limit';

export const dynamic = "force-dynamic";

const trackerRateLimit = rateLimiter({ interval: 60000, maxRequests: 30 });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await trackerRateLimit.check(30, ip);

    const body = await req.json();
    const { eventName, url, metadata } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'eventName is required' }, { status: 400 });
    }

    // You can optionally extract userId from NextAuth session if available
    // But for tracking we often just log the event anonymously
    await prisma.analyticsEvent.create({
      data: {
        eventName,
        url,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    console.error('[ANALYTICS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

