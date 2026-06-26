import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { OfferService } from '@/lib/services/offerService';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateOfferSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['flat', 'percentage']).optional(),
  value: z.number().positive().optional(),
  minOrder: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUser: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().optional().transform(s => s ? new Date(s) : undefined),
  expiresAt: z.string().optional().nullable().transform(s => s === null ? null : s ? new Date(s) : undefined),
  categoryId: z.string().optional().nullable(),
  isFirstOrderOnly: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = UpdateOfferSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: validation.data,
    });

    await OfferService.bustCache();
    
    return NextResponse.json(offer);
  } catch (error) {
    console.error('[ADMIN_OFFERS_PUT]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Soft delete by setting isActive to false
    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await OfferService.bustCache();
    
    return NextResponse.json({ message: 'Offer deactivated successfully' });
  } catch (error) {
    console.error('[ADMIN_OFFERS_DELETE]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
