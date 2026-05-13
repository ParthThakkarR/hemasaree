// // app/api/verify-otp/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@lib/prisma'; // 1. Use Prisma singleton
// import { VerifyOtpSchema } from '@lib/validators'; // 2. Use Zod schema
// import crypto from 'crypto';

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     // 3. Validate with Zod
//     const validation = VerifyOtpSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { message: validation.error.issues[0].message },
//         { status: 400 }
//       );
//     }
//     const { email, otp } = validation.data;

//     // 4. Find the real (hashed) answer in the database
//     const verificationRecord = await prisma.verificationToken.findUnique({
//       where: { email },
//     });

//     // Check if a record exists or if it has expired.
//     if (!verificationRecord || new Date() > new Date(verificationRecord.expiresAt)) {
//       return NextResponse.json(
//         { message: 'OTP is invalid or has expired.' },
//         { status: 400 }
//       );
//     }

//     // 5. Hash the user's guess in the exact same way.
//     const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

//     // 6. Compare the two hashes.
//     if (hashedOtp !== verificationRecord.token) {
//       // Note: No "rate-limiting" here. You could add a failure count
//       // to the verificationToken schema if you wanted, but for an
//       // *email* OTP, it's generally fine, as the token expires quickly.
//       return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
//     }

//     // 7. If the check passes, delete the token and send success.
//     await prisma.verificationToken.delete({ where: { email } });

//     return NextResponse.json({ message: 'Email verified successfully!' });
//   } catch (err) {
//     console.error('[VERIFY_OTP_ERROR]', err);
//     return NextResponse.json(
//       { message: 'Failed to verify OTP' },
//       { status: 500 }
//     );
//   }
// }




// app/api/verify-otp/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const dynamic = "force-dynamic";

import { VerifyOtpSchema } from '@lib/validators';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // parse raw body
    const rawBody = await req.json();
console.log('🔍 VERIFY-OTP: Raw body received =>', rawBody);

    // Normalize incoming values BEFORE validation to avoid transient-state validation errors
    const body = {
      email: typeof rawBody?.email !== 'undefined' ? String(rawBody.email).trim().toLowerCase() : '',
      otp: typeof rawBody?.otp !== 'undefined' ? String(rawBody.otp).trim() : '',
    };
console.log('✅ VERIFY-OTP: Normalized body =>', body);

    // Validate with Zod (schema will expect email + otp)
    const validation = VerifyOtpSchema.safeParse(body);
    if (!validation.success) {
      // return the first issue message for clarity (same behavior as before)
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email, otp } = validation.data;

    // Find the verification record (unique by email)
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: 'desc' }
    });

    // Check existence and expiry
    if (!verificationRecord || new Date() > new Date(verificationRecord.expires)) {
      return NextResponse.json(
        { message: 'OTP is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Hash the otp exactly the same way it was stored (sha256)
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedOtp !== verificationRecord.token) {
      return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    }

    // Delete the used verification token
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    return NextResponse.json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('[VERIFY_OTP_ERROR]', err);
    return NextResponse.json(
      { message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}


