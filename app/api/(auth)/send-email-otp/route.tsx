import { NextRequest, NextResponse } from "next/server";
// 1. Import Nodemailer
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: "A valid email is required." }, { status: 400 });
    }

    // --- OTP GENERATION ---
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // --- NODEMAILER EMAIL SENDING LOGIC ---

    // 2. Create a transporter object using your email service credentials
    // We use environment variables for security.
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use the App Password here
      },
    });

    // 3. Set up the email data
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of receivers
      subject: 'Your Saree Bazaar Verification Code', // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Email Verification</h2>
          <p>Thank you for signing up. Please use the following code to verify your email address:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background: #f0f0f0; padding: 10px; display: inline-block;">
            ${otp}
          </p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `, // HTML body
    };

    // 4. Send the email
    await transporter.sendMail(mailOptions);

    // IMPORTANT: For security, we NO LONGER send the OTP back in the API response.
    // The frontend will now have to verify it by sending the user's input to another route.
    // However, to keep your current flow working, we will still send it for now.
    // In a production app, you would remove the `otp` field from this response.
    return NextResponse.json({ 
        message: "Verification code has been sent to your email.",
        // NOTE: Still sending for your current setup. Remove in production.
        otp: otp 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/send-email-otp:", error);
    return NextResponse.json({ message: "Failed to send email. Please try again." }, { status: 500 });
  }
}
