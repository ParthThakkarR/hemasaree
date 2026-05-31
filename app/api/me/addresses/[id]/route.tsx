import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = params.id;

    // Check if address exists and belongs to user
    const addressToDelete = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!addressToDelete) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (addressToDelete.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: addressId }
    });

    // Automatically set another address as default if the deleted one was default
    if (addressToDelete.isDefault) {
      const remainingAddresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' }, // Prefer oldest remaining address
      });

      if (remainingAddresses.length > 0) {
        const oldestAddress = remainingAddresses[0];
        await prisma.address.update({
          where: { id: oldestAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('[ADDRESS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
