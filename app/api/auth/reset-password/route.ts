import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../backend/db";
import { withRateLimit } from "@/backend/middleware/withRateLimit";
import bcrypt from "bcryptjs";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const { email: rawEmail, password, token } = await req.json();
      const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

      if (!email || !password || !token) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
      }

      if (!STRONG_PASSWORD_REGEX.test(password)) {
        return NextResponse.json({ message: "Password is not strong enough." }, { status: 400 });
      }

      // Verify the magic link token
      const validToken = await prisma.otp.findFirst({
        where: {
          email,
          code: token,
          purpose: "reset_password",
          expires_at: {
            gt: new Date(),
          },
        },
      });

      if (!validToken) {
        return NextResponse.json({ message: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Invalidate the used token
      await prisma.otp.delete({ where: { id: validToken.id } });

      return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });

    } catch (error) {
      console.error("Error in reset-password:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { limit: 5, windowSec: 900, prefix: 'rl:reset-password' }
);
