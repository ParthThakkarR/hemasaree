import { PrismaClient } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- Validation Regular Expressions ---
// Phone number must be exactly 10 digits
const phoneRegex = /^\d{10}$/;
// Standard email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


export async function POST(req: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
    const body = await req.json();
    
    const { firstName, lastName, email, phone, password, address } = body;

    // --- NEW: SERVER-SIDE VALIDATION BLOCK ---
    if (!firstName || !email || !password || !address) {
      return NextResponse.json({ message: "First name, email, password, and address are required." }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
        return NextResponse.json({ message: "Please enter a valid email format." }, { status: 400 });
    }

    // Phone is optional, but if provided, it must be valid
    if (phone && !phoneRegex.test(phone)) {
        return NextResponse.json({ message: "Phone number must be exactly 10 digits." }, { status: 400 });
    }

    if (!passwordRegex.test(password)) {
        return NextResponse.json({ message: "Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character." }, { status: 400 });
    }
    // --- END OF VALIDATION BLOCK ---

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        address,
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({ message: "User created successfully!" }, { status: 201 });
    
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Error in /api/signup:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
