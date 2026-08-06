import { NextResponse } from "next/server";
import { prisma } from "../../../../backend/db";
import { checkRateLimit } from "../../../../backend/rateLimit";
import bcrypt from "bcryptjs";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit: 5 requests per 15 minutes per IP
    if (process.env.NODE_ENV !== "development" && !checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { name: rawName, email: rawEmail, password, otpCode } = await request.json();
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!name || !email || !password || !otpCode) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Length limits to prevent oversized payloads
    if (name.length > 100) {
      return NextResponse.json({ message: "Name must be 100 characters or fewer" }, { status: 400 });
    }
    if (email.length > 200) {
      return NextResponse.json({ message: "Email address is too long" }, { status: 400 });
    }

    // Server-side email format validation
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Invalid email address format" }, { status: 400 });
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return NextResponse.json({ message: "Password is not strong enough." }, { status: 400 });
    }

    // Verify OTP
    const validOtp = await prisma.otp.findFirst({
      where: {
        email,
        code: otpCode,
        purpose: "signup",
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!validOtp) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        auth_provider: "email",
        emailVerified: new Date(),
      },
    });

    // Delete used OTP
    await prisma.otp.delete({ where: { id: validOtp.id } });

    return NextResponse.json({ message: "User created successfully", user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });

  } catch (error: any) {
    console.error("Error in register:", error);
    return NextResponse.json({ message: "Internal server error", error: error?.message || String(error) }, { status: 500 });
  }
}
