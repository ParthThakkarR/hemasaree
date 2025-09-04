// File: /app/api/send-otp/route.ts
import { NextResponse } from "next/server";
import prisma, { PrismaClient } from "@/app/generated/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

const Prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Expire in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store/replace OTP in DB
    await Prisma.verificationToken.upsert({
      where: { email },
      update: { token: hashedOtp, expiresAt },
      create: { email, token: hashedOtp, expiresAt },
    });

    // 🔹 Setup Nodemailer transport (using Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // your Gmail app password
      },
    });

    // 🔹 Send email
    await transporter.sendMail({
      from: `"OTP Auth From" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Saree Bazaar Verification Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Email Verification</h2>
          <p>Thank you for signing up. Please use the following code to verify your email address:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background: #f0f0f0; padding: 10px; display: inline-block;">
            ${otp}
          </p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>`,
    });

    return NextResponse.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
