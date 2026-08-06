import { NextResponse } from "next/server";
import { prisma } from "../../../../backend/db";
import { checkRateLimit } from "../../../../backend/rateLimit";
import nodemailer from "nodemailer";
import crypto from "crypto";

function generateOTP() {
  // crypto.randomInt is cryptographically secure unlike Math.random()
  return crypto.randomInt(100000, 1000000).toString();
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Rate limit: 5 requests per 15 minutes per IP
    if (process.env.NODE_ENV !== "development" && !checkRateLimit(`send-otp:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({ message: "Email and purpose are required" }, { status: 400 });
    }

    // Validate purpose against strict allowlist
    const ALLOWED_PURPOSES = ['signup', 'reset_password'];
    if (!ALLOWED_PURPOSES.includes(purpose)) {
      return NextResponse.json({ message: "Invalid purpose" }, { status: 400 });
    }

    if (purpose === "signup") {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
      }
    } else if (purpose === "reset_password") {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        // Prevent email enumeration: always return the same success message
        return NextResponse.json({ message: "If this email is registered, a reset link has been sent." }, { status: 200 });
      }
    }

    // Rate limit by email to prevent spamming a specific inbox (3 per 15 mins)
    if (process.env.NODE_ENV !== "development" && !checkRateLimit(`send-otp-email:${email}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json({ message: "If this email is registered, a reset link has been sent." }, { status: 200 });
    }

    // Generate appropriate code/token
    const isReset = purpose === "reset_password";
    const code = isReset ? generateSecureToken() : generateOTP();
    const expiresAt = new Date(Date.now() + (isReset ? 60 : 3) * 60 * 1000); // 60 min for reset, 3 min for OTP

    // Delete any old unused OTPs for this email+purpose to prevent DB accumulation
    await prisma.otp.deleteMany({
      where: { email, purpose },
    });

    // Store new OTP in DB
    await prisma.otp.create({
      data: {
        email,
        code,
        purpose,
        expires_at: expiresAt,
      },
    });

    // Build email content
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let emailSubject: string;
    let emailHtml: string;
    let emailText: string;

    if (isReset) {
      const resetLink = `${appUrl}/reset-password?token=${code}&email=${encodeURIComponent(email)}`;
      emailSubject = "Reset your FileConvert password";
      emailText = `Click this link to reset your password: ${resetLink}\n\nThis link expires in 60 minutes. If you did not request this, please ignore this email.`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #13141a; border-radius: 12px; border: 1px solid #2a2d3a;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #ffffff; margin: 0;">Reset your password</h2>
            <p style="color: #8b8d98; margin-top: 8px;">A password reset was requested for your FileConvert account.</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #7c6ef5, #5e52c7); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #8b8d98; font-size: 13px; text-align: center;">This link expires in <strong style="color: #ffffff;">60 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #2a2d3a; margin: 24px 0;" />
          <p style="color: #555; font-size: 12px; text-align: center;">FileConvert &mdash; Premium Document Utility</p>
        </div>
      `;
      if (!process.env.SMTP_HOST) {
        console.log(`[DEVELOPMENT] Password Reset Link for ${email}:\n${resetLink}`);
      }
    } else {
      emailSubject = "Verify your email for FileConvert";
      emailText = `Your verification code is: ${code}. It expires in 10 minutes.`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #13141a; border-radius: 12px; border: 1px solid #2a2d3a;">
          <h2 style="color: #ffffff; text-align: center;">Email Verification</h2>
          <p style="color: #8b8d98; text-align: center;">Your verification code for FileConvert is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #7c6ef5; background: #1e1f2a; padding: 16px 24px; border-radius: 8px; display: inline-block;">${code}</span>
          </div>
          <p style="color: #8b8d98; font-size: 13px; text-align: center;">This code expires in <strong style="color: #ffffff;">10 minutes</strong>.</p>
        </div>
      `;
      if (!process.env.SMTP_HOST) {
        console.log(`[DEVELOPMENT] OTP for ${email} is: ${code}`);
      }
    }

    // Send email via SMTP if configured
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"FileConvert" <${process.env.SMTP_USER}>`,
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
    }

    return NextResponse.json({ message: isReset ? "If this email is registered, a reset link has been sent." : "OTP sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
