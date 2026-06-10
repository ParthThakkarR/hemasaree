import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const dynamic = "force-dynamic";

// POST — Subscribe to newsletter (rate limited by middleware)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed' }, { status: 200 });
    }

    await prisma.newsletter.create({
      data: { email },
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('[NEWSLETTER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Unsubscribe (proper REST: DELETE removes the resource)
export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await prisma.newsletter.deleteMany({
      where: { email },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[NEWSLETTER_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
