// File: /app/api/send-otp/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // 1. Use Prisma singleton
import { SendOtpSchema } from '@/app/lib/validators'; // 2. Use Zod schema
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// 3. (RECOMMENDED) Use a transactional email service
// const resend = new Resend(process.env.RESEND_API_KEY);

// (Using nodemailer for this example as you had it)
const transporter = nodemailer.createTransport({
  // 4. CRITICAL: Replace 'gmail' with a real service
  host: process.env.EMAIL_HOST, // e.g., 'smtp.resend.com'
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // e.g., 'apikey'
    pass: process.env.EMAIL_PASS, // Your API key
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 5. Validate with Zod
    const validation = SendOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email } = validation.data;

    // Check for existing OTP to prevent spam
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
        { status: 429 } // Too Many Requests
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Expire in 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Store/replace OTP in DB using the singleton
    // Since we can't easily upsert with just identifier if it's not unique, 
    // we delete old ones and create new one, or just create.
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: { identifier: email, token: hashedOtp, expires },
    });

    // 7. Send email
    await transporter.sendMail({
      from: `"Your App" <onboarding@${process.env.EMAIL_DOMAIN}>`,
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
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
    });
  } catch (err) {
    console.error('[SEND_OTP_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}