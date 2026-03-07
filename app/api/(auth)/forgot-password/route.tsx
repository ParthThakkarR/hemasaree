// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // 1. Import the singleton
import { ForgotPasswordSchema } from '@/app/lib/validators'; // 2. Import the schema
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // (Or better: import { Resend } from 'resend';)

// 3. (RECOMMENDED) Use a transactional email service
// const resend = new Resend(process.env.RESEND_API_KEY);

// (Using nodemailer for this example as you had it)
const transporter = nodemailer.createTransport({
  // 4. CRITICAL: Replace 'gmail' with a real service
  host: process.env.EMAIL_HOST, // e.g., 'smtp.resend.com' or 'smtp.sendgrid.net'
  port: 465, // or 587
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // e.g., 'apikey'
    pass: process.env.EMAIL_PASS, // Your API key
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 5. Validate input with Zod
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // We send a success message either way to prevent email enumeration
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: tokenExpiry,
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

      // 6. Send email with the new service
      await transporter.sendMail({
        to: email,
        from: `"Your App" <onboarding@${process.env.EMAIL_DOMAIN}>`, // e.g., onboarding@resend.dev
        subject: 'Password Reset Request',
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
               <p>Please click on the following link, or paste this into your browser to complete the process:</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
      });
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    // 7. Log the error for debugging
    console.error('[FORGOT_PASSWORD_ERROR]', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}