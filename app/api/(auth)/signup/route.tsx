import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = "force-dynamic";

import { SignUpSchema } from '@/app/lib/validators';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    console.log("[SIGNUP] POST request received");
    const body = await req.json();
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      console.error("[SIGNUP] Validation failed:", validation.error.format());
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password, address } = validation.data;
    console.log(`[SIGNUP] Attempting signup for: ${email}`);

    // ✅ Check if user already exists
    console.log("[SIGNUP] Checking existing user...");
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.warn(`[SIGNUP] User already exists: ${email}`);
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // ✅ Hash password
    console.log("[SIGNUP] Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user (and optional initial address)
    console.log("[SIGNUP] Creating user in database...");
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
    console.log(`[SIGNUP] User created: ${user.id}`);

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
  } catch (err: any) {
    console.error('[SIGNUP_ERROR]', err);
    return NextResponse.json(
      { message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
