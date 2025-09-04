import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// 👇 FINAL, BULLETPROOF VERSION of the address parsing function
const parseAddress = (fullAddress: string | null): any | null => {
    if (!fullAddress || !fullAddress.trim()) {
        return null; // If there's no address, return null
    }

    const parts = fullAddress.split(',').map(p => p.trim());
    
    // Default values
    let streetAddress = parts[0] || '';
    let city = parts[1] || '';
    let state = '';
    let zipCode = '';
    let country = 'India';

    // Check if there is a third part to parse
    if (parts.length > 2 && parts[2] && parts[2] !== '-') {
        const lastPart = parts[2];
        
        // Extract ZIP code using regex
        const zipMatch = lastPart.match(/\d{6}/);
        if (zipMatch) {
            zipCode = zipMatch[0];
        }
        
        // What's left after removing ZIP and non-alphabetic chars is the state
        state = lastPart.replace(zipCode, '').replace(/[^a-zA-Z\s]/g, '').trim();
    }
    
    return { streetAddress, city, state, zipCode, country };
}


export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("JWT Secret not configured");

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, firstName: true, isAdmin: true, address: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const structuredAddress = parseAddress(user.address);

    return NextResponse.json({ 
        user: { ...user, address: structuredAddress } 
    });

  } catch (error) {
    return NextResponse.json({ message: 'Invalid token or server error' }, { status: 401 });
  }
}

