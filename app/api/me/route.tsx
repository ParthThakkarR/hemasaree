import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromToken } from '@/app/lib/getUserFromToken';
import type { User } from '@/app/lib/getUserFromToken';

/**
 * ✅ GET  /api/me → Return logged-in user + all saved addresses
 * ✅ POST /api/me → Add new address to user
 */

export async function GET(req: Request) {
  try {
    const user: User | null = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { addresses: true },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        firstName: fullUser.firstName,
        isAdmin: fullUser.isAdmin,
        addresses: fullUser.addresses ?? [],
      },
    });
  } catch (error) {
    console.error('[ME_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { streetAddress, city, state, zipCode, label, isDefault } =
      await req.json();

    const normalizedStreet = typeof streetAddress === 'string' ? streetAddress.trim() : '';
    const normalizedCity = typeof city === 'string' ? city.trim() : '';
    const normalizedState = typeof state === 'string' ? state.trim() : '';
    const normalizedZipCode = typeof zipCode === 'string' ? zipCode.trim() : '';
    const normalizedLabel = typeof label === 'string' ? label.trim() : '';

    if (!normalizedStreet || !normalizedCity || !normalizedState || !normalizedZipCode) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      );
    }

    const existingAddressCount = await prisma.address.count({
      where: { userId: user.id },
    });
    const shouldBeDefault = Boolean(isDefault) || existingAddressCount === 0;

    // If a default is being added, unset old default
    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        streetAddress: normalizedStreet,
        city: normalizedCity,
        state: normalizedState,
        zipCode: normalizedZipCode,
        label: normalizedLabel || 'Home',
        isDefault: shouldBeDefault,
        userId: user.id,
      },
    });

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error('[ME_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to add address' },
      { status: 500 }
    );
  }
}
