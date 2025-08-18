import jwt from 'jsonwebtoken';
import { NextRequest } from "next/server";

export function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      name: string;
      email: string;
    };

    return decoded;
  } catch {
    throw new Error("Invalid token");
  }
}