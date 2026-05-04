// /app/api/orders/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromToken } from '@/app/lib/getUserFromToken';
import { ReturnRequestSchema } from '@/app/lib/validators';
import { OrderItemStatus } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ✅ FIX: getUserFromToken returns full user object, not just id
  const decodedUser = await getUserFromToken(req);
  if (!decodedUser || !decodedUser.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = decodedUser.id; // ✅ extract only ID

  try {
    const formData = await req.formData();
    const orderId = params.id;

    // ✅ Validate form data using Zod schema
    const validation = ReturnRequestSchema.safeParse({
      orderItemId: formData.get('orderItemId'),
      reason: formData.get('reason'),
      notes: formData.get('notes') || undefined,
      image: formData.get('image') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { orderItemId, reason, notes, image: imageFile } = validation.data;

    // ✅ Secure check — verify user owns order and item is returnable
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
        isReturnable: true,
        order: {
          userId, // ✅ now correct field
          status: 'DELIVERED',
        },
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: 'This item is not eligible for return or was not found.' },
        { status: 404 }
      );
    }

    if (orderItem.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'A return has already been requested for this item.' },
        { status: 400 }
      );
    }

    // ✅ File upload (optional image)
    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/returns');
        await mkdir(uploadDir, { recursive: true });
        const imagePath = path.join(uploadDir, filename);
        await writeFile(imagePath, buffer);
        imageUrl = `/uploads/returns/${filename}`;
      } catch (err) {
        console.error('[RETURN_IMAGE_UPLOAD_ERROR]', err);
        return NextResponse.json(
          { error: 'Failed to save uploaded image.' },
          { status: 500 }
        );
      }
    }

    // ✅ Update the order item
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status: OrderItemStatus.RETURN_REQUESTED,
        returnReason: reason,
        returnNotes: notes,
        returnImage: imageUrl,
      },
    });

    return NextResponse.json({
      message: 'Return request submitted successfully',
      orderItem: updatedOrderItem,
    });
  } catch (error) {
    console.error('[RETURN_REQUEST_ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
