import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { rateLimiter } from '@/app/lib/rate-limit';

export const dynamic = "force-dynamic";

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

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await prisma.newsletter.deleteMany({
      where: { email },
    });

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('[NEWSLETTER_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return new NextResponse('Email missing', { status: 400 });
  }

  try {
    await prisma.newsletter.deleteMany({
      where: { email },
    });

    return new NextResponse(`
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fbf5ec; }
            .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 20px rgba(107, 15, 26, 0.05); text-align: center; max-width: 400px; }
            h1 { color: #6b0f1a; margin-bottom: 16px; font-size: 24px; }
            p { color: #57534e; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #6b0f1a; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; transition: opacity 0.2s; }
            .btn:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed</h1>
            <p>You have been successfully removed from our newsletter. We're sorry to see you go!</p>
            <a href="/" class="btn">Return to Store</a>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('[NEWSLETTER_UNSUBSCRIBE_ERROR]', error);
    return new NextResponse('Error unsubscribing', { status: 500 });
  }
}


