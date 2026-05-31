import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getUserFromToken } from '@lib/getUserFromToken';
import type { User } from '@lib/getUserFromToken';
import { z } from 'zod';

export const dynamic = "force-dynamic";

const AddressInputSchema = z.object({
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  phone: z.preprocess(
    (val) => typeof val === 'string' ? val.trim() : val,
    z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  ),
});

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

    const body = await req.json();
    const validation = AddressInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { streetAddress, city, state, zipCode, label, isDefault } = validation.data;

    // If a default is being added, unset old default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        fullName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Unknown',
        mobileNumber: user.phone || '0000000000',
        houseNumber: 'N/A',
        area: streetAddress,
        city,
        state,
        pincode: zipCode,
        addressType: label || 'Home',
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
    const validation = ProfileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone } = validation.data;

    if (!firstName && !lastName && !phone) {
      return NextResponse.json(
        { error: 'Nothing to update. Provide at least one field.' },
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


