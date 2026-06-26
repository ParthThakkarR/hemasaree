import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { OfferService } from '@/lib/services/offerService';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const OfferSchema = z.object({
  code: z.string().min(1).transform(s => s.toUpperCase()),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.enum(['flat', 'percentage']),
  value: z.number().positive(),
  minOrder: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUser: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().transform(s => s ? new Date(s) : new Date()),
  expiresAt: z.string().optional().nullable().transform(s => s ? new Date(s) : null),
  categoryId: z.string().optional().nullable(),
  isFirstOrderOnly: z.boolean().default(false),
});

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json(offers);
  } catch (error) {
    console.error('[ADMIN_OFFERS_GET]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = OfferSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;
    
    const existing = await prisma.offer.findUnique({ where: { code: data.code } });
    if (existing) {
        return NextResponse.json({ error: 'An offer with this code already exists' }, { status: 409 });
    }

    const offer = await prisma.offer.create({
      data: {
          code: data.code,
          title: data.title,
          description: data.description,
          type: data.type,
          value: data.value,
          minOrder: data.minOrder,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit,
          perUser: data.perUser,
          isActive: data.isActive,
          startsAt: data.startsAt,
          expiresAt: data.expiresAt,
          categoryId: data.categoryId,
          isFirstOrderOnly: data.isFirstOrderOnly,
      },
    });

    await OfferService.bustCache();
    
    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_OFFERS_POST]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
