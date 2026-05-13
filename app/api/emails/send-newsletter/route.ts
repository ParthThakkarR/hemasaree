import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email/emailQueue';
import { prisma } from '@lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { subject, content } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
    }

    const subscribers = await prisma.newsletter.findMany();

    const jobs = subscribers.map((sub) => ({
      name: 'newsletter',
      data: {
        type: 'newsletter',
        data: { to: sub.email, subject, content },
      },
    }));

    await emailQueue.addBulk(jobs);

    return NextResponse.json({ message: `${jobs.length} Newsletter emails queued successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


