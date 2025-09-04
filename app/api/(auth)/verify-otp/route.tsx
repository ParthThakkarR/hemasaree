import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. It receives the user's email AND their OTP guess.
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    // 2. It finds the real (hashed) answer in the database.
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { email },
    });

    // Check if a record exists or if it has expired.
    if (!verificationRecord || new Date() > new Date(verificationRecord.expiresAt)) {
      return NextResponse.json({ message: "OTP is invalid or has expired." }, { status: 400 });
    }

    // 3. It hashes the user's guess in the exact same way.
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 4. It COMPARES the two hashes. This is the actual verification step.
    if (hashedOtp !== verificationRecord.token) {
      return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    }

    // If the check passes, it deletes the token and sends a success message.
    await prisma.verificationToken.delete({ where: { email } });
    
    return NextResponse.json({ message: "Email verified successfully!" });

  } catch (err) {
    console.error("Error verifying OTP:", err);
    return NextResponse.json({ message: "Failed to verify OTP" }, { status: 500 });
  }
}
