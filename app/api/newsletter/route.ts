import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { rateLimiter } from '@/app/lib/rate-limit';

const newsletterRateLimit = rateLimiter({ interval: 60000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await newsletterRateLimit.check(5, ip);

    const body = await req.json();
    const { email } = body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed' }, { status: 200 });
    }

    await prisma.newsletter.create({
      data: { email },
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    if (error === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    console.error('[NEWSLETTER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
