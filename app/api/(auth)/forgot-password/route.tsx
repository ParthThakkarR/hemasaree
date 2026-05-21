// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const dynamic = "force-dynamic";

import { ForgotPasswordSchema } from '@lib/validators';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const tokenExpiry = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: tokenExpiry,
        },
      });

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
               <p>Please click on the following link, or paste this into your browser to complete the process:</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
        type: 'password_reset',
      });
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('[FORGOT_PASSWORD_ERROR]', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

