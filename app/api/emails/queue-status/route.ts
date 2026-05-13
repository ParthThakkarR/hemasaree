import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email/emailQueue';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);

    return NextResponse.json({
      waiting,
      active,
      completed,
      failed,
      delayed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

