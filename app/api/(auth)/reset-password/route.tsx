// app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma'; // 1. Use Prisma singleton

export const dynamic = "force-dynamic";

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod'; // 2. (Optional but cleaner) Use Zod

// 3. Define the password regex and Zod schema
const passwordRegex = /^(?=.*\p{Lu})(?=.*\p{Ll})(?=.*\d)(?=.*[@$!%*?&])[\p{Lu}\p{Ll}\d@$!%*?&]{8,}$/u;

const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  password: z.string().regex(passwordRegex, {
    message: 'Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character.',
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 4. Validate input with Zod
    const validation = ResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { token, password } = validation.data;

    // Hash the token from the URL to match the one in the DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by the hashed token and check if the token is still valid (not expired)
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() }, // 'gt' means greater than now
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Password reset token is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Error in /api/reset-password:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

