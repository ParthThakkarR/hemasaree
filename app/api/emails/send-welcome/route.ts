import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email/emailQueue';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    await emailQueue.add('welcome', {
      type: 'welcome',
      data: { to: email, name },
    });

    return NextResponse.json({ message: 'Welcome email queued successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

