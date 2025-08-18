import { PrismaClient } from "@/app/generated/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }

    const body = await req.json();
    const { emailfirstname, password } = body;

    if (!emailfirstname || !password) {
      return NextResponse.json({ message: "Fill all the fields" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: emailfirstname },
          { email: emailfirstname }
        ]
      }
    });

    if (!user) {
    return NextResponse.json({ message: "User does not exist" }, { status: 404 });
  }

  // --- ADD THIS ENTIRE DEBUGGING BLOCK ---
  console.log('--- LOGIN ROUTE CHECK ---');
  console.log('Raw user object from DB:', user);
  console.log('Value of user.isAdmin:', user.isAdmin);
  console.log('Data type of user.isAdmin:', typeof user.isAdmin);
  console.log('Value after !! operator:', !!user.isAdmin);
  console.log('-------------------------');
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

 
const token = jwt.sign(
  { id: user.id, email: user.email, isAdmin: !!user.isAdmin }, // <-- The fix is here
  JWT_SECRET,
  { expiresIn: "1h" }
);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          isAdmin:user.isAdmin,
        },
      },
      { status: 200 }
    );

    

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, 
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
