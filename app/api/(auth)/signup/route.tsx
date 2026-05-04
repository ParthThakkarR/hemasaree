import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { SignUpSchema } from '@/app/lib/validators';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password, address } = validation.data;

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user (and optional initial address)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        // if address exists in signup, save it as first Address entry
        addresses: address
          ? {
              create: {
                streetAddress: address.streetAddress || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zipCode || '',
                label: address.label || 'Home',
                isDefault: true,
              },
            }
          : undefined,
      },
      include: { addresses: true },
    });

    // ✅ Just return success since NextAuth handles session logging in later
    return NextResponse.json(
      {
        message: 'Signup successful!',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          isAdmin: !!user.isAdmin,
          addresses: user.addresses ?? [],
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[SIGNUP_ERROR]', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
