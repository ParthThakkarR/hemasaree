import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyAdminToken } from '@/app/utils/auth';
import { sendMail } from '@/app/lib/mail';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const subscribers = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('[ADMIN_NEWSLETTER_GET_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subject, content } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
    }

    const subscribers = await prisma.newsletter.findMany();
    
    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const domain = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');

    // In a real production app, you'd use a queue or a bulk email service.
    // For now, we'll send them sequentially or in small batches.
    const results = await Promise.allSettled(
      subscribers.map((sub) => {
        const unsubscribeLink = `${domain}/api/newsletter?email=${encodeURIComponent(sub.email)}`;
        const html = `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #6B0F1A; text-align: center;">Hema Sarees</h2>
            <div style="line-height: 1.6; color: #333;">
              ${content.replace(/\n/g, '<br/>')}
            </div>
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #999; text-align: center;">
              You received this because you subscribed to Hema Sarees newsletter.
              <br/>
              <a href="${unsubscribeLink}" style="color: #6B0F1A;">Unsubscribe</a>
            </p>
          </div>
        `;
        return sendMail({
          to: sub.email,
          subject,
          html,
        });
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ 
      message: `Newsletter sent to ${successful} subscribers. ${failed} failed.`,
      successful,
      failed
    });
  } catch (error) {
    console.error('[ADMIN_NEWSLETTER_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

