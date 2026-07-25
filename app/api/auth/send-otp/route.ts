import { NextResponse } from "next/server";
import { prisma } from "../../../../backend/db";
import { checkRateLimit } from "../../../../backend/rateLimit";
import nodemailer from "nodemailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    // Basic IP tracking for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit: 5 requests per 15 minutes per IP
    if (!checkRateLimit(`send-otp:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({ message: "Email and purpose are required" }, { status: 400 });
    }

    if (purpose === "signup") {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
      }
    } else if (purpose === "reset_password") {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        // Prevent email enumeration: return success even if user doesn't exist
        return NextResponse.json({ message: "If this email is registered, a reset code has been sent." }, { status: 200 });
      }
    }

    // Rate limit by email to prevent spamming a specific inbox (3 per 15 mins)
    if (!checkRateLimit(`send-otp-email:${email}`, 3, 15 * 60 * 1000)) {
       return NextResponse.json({ message: "If this email is registered, a reset code has been sent." }, { status: 200 });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await prisma.otp.create({
      data: {
        email,
        code: otpCode,
        purpose,
        expires_at: expiresAt,
      },
    });

    // Setup nodemailer
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"FileConvert" <${process.env.SMTP_USER}>`,
        to: email,
        subject: purpose === "signup" ? "Verify your email for FileConvert" : "Reset your FileConvert password",
        text: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEVELOPMENT] OTP for ${email} is ${otpCode}`);
    }

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
