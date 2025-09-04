import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // IMPORTANT: For security, we don't reveal if the user exists or not.
    // We send a success message either way to prevent email enumeration attacks.
    if (user) {
      // 1. Generate a secure, random token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      // 2. Set an expiry date (e.g., 1 hour from now)
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // 3. Store the hashed token and expiry in the database for the user
      // Note: You'll need to add `passwordResetToken` and `passwordResetExpires` to your User model in schema.prisma
      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: tokenExpiry,
        },
      });

      // 4. Create the reset URL and send the email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: email,
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        subject: "Password Reset Request",
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
               <p>Please click on the following link, or paste this into your browser to complete the process:</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
      });
    }

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });

  } catch (err) {
    console.error("Error in /api/forgot-password:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
