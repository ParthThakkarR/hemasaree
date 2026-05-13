import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromToken } from '@/app/lib/getUserFromToken';
import type { User } from '@/app/lib/getUserFromToken';

export const dynamic = "force-dynamic";

/**
 * ✅ GET  /api/me  → Return logged-in user + all saved addresses
 * ✅ POST /api/me → Add new address to user
 * ✅ PUT  /api/me  → Update basic profile fields (name, phone)
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
        lastName: fullUser.lastName,
        phone: fullUser.phone,
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

    if (!streetAddress || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      );
    }

    // If a default is being added, unset old default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        streetAddress,
        city,
        state,
        zipCode,
        label: label || 'Home',
        isDefault: isDefault ?? false,
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

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone } = body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    if (!firstName && !lastName && !phone) {
      return NextResponse.json(
        { error: 'Nothing to update. Provide at least one field.' },
        { status: 400 }
      );
    }

    if (firstName !== undefined && firstName.trim().length === 0) {
      return NextResponse.json(
        { error: 'First name cannot be empty.' },
        { status: 400 }
      );
    }

    if (phone !== undefined && phone.trim().length > 0 && !/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 10 digits.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        phone: phone?.trim() || undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isAdmin: true,
      },
    });

    return NextResponse.json(
      { user: updated, message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ME_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
