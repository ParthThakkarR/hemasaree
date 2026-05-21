// File: /app/api/send-otp/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const dynamic = "force-dynamic";

import { SendOtpSchema } from '@lib/validators';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = SendOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email } = validation.data;

    const existingOTPRecord = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: 'desc' }
    });

    if (existingOTPRecord && new Date() < new Date(existingOTPRecord.expires)) {
      const timeLeft = Math.ceil(
        (new Date(existingOTPRecord.expires).getTime() - Date.now()) / 1000 / 60
      );
      return NextResponse.json(
        {
          error: `Please wait ${timeLeft} minutes before requesting another OTP`,
        },
        { status: 429 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: { identifier: email, token: hashedOtp, expires },
    });

    await sendEmail({
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
               <h2>Email Verification</h2>
               <p>Please use the following code to verify your email address:</p>
               <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background: #f0f0f0; padding: 10px; display: inline-block;">
                 ${otp}
               </p>
               <p>This code will expire in 10 minutes.</p>
               <p>If you did not request this, please ignore this email.</p>
             </div>`,
      type: 'otp_verification',
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
    });
  } catch (err: any) {
    console.error('[SEND_OTP_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

