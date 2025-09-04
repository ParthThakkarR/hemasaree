import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token and new password are required." }, { status: 400 });
    }

    // Validate new password complexity
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: "Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character." }, { status: 400 });
    }

    // Hash the token from the URL to match the one in the DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by the hashed token and check if the token is still valid (not expired)
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() }, // 'gt' means greater than now
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Password reset token is invalid or has expired." }, { status: 400 });
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

    return NextResponse.json({ message: "Password has been reset successfully." });

  } catch (err) {
    console.error("Error in /api/reset-password:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
