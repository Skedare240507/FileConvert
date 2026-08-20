import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/backend/db/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account is temporarily locked. Please try again later.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          const attempts = (user.failedLoginAttempts || 0) + 1;
          
          if (attempts >= 5) {
            const lockTime = new Date();
            lockTime.setMinutes(lockTime.getMinutes() + 30);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: attempts, lockedUntil: lockTime }
            });

            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && user.email) {
              const nodemailer = require('nodemailer');
              const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_PORT === '465',
                auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                },
              });

              await transporter.sendMail({
                from: `"FileConvert Security" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: "Security Alert: Unusual Login Attempts",
                text: "Someone is trying to login to your account and entered an incorrect password multiple times. For your security, your account has been temporarily locked for 30 minutes.",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #13141a; border-radius: 12px; border: 1px solid #2a2d3a;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="background: #ef4444; color: white; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">!</div>
                      <h2 style="color: #ffffff; margin: 0;">Security Alert</h2>
                      <p style="color: #8b8d98; margin-top: 8px;">Unusual login activity detected on your FileConvert account.</p>
                    </div>
                    <div style="background: #1e1f2a; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
                      <p style="color: #ffffff; margin: 0; font-size: 15px; line-height: 1.5;">
                        Someone is trying to login to your account and entered an incorrect password multiple times. 
                      </p>
                      <p style="color: #ffffff; margin: 12px 0 0 0; font-size: 15px; line-height: 1.5;">
                        For your security, your account has been temporarily locked for <strong style="color: #ef4444;">30 minutes</strong>.
                      </p>
                    </div>
                    <p style="color: #8b8d98; font-size: 13px; text-align: center;">If this was you, please wait 30 minutes and try again. If this wasn't you, we recommend resetting your password once the lock expires.</p>
                    <hr style="border: none; border-top: 1px solid #2a2d3a; margin: 24px 0;" />
                    <p style="color: #555; font-size: 12px; text-align: center;">FileConvert &mdash; Premium Document Utility</p>
                  </div>
                `
              }).catch((err: any) => console.error("Failed to send lock email:", err));
            }
            throw new Error("Account locked due to too many failed attempts.");
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: attempts }
            });
            throw new Error("Invalid credentials");
          }
        }

        if ((user.failedLoginAttempts || 0) > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null }
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins; email linking is handled by allowDangerousEmailAccountLinking
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
