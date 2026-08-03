import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../backend/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
